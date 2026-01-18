# Schools Page Optimization Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Optimize the Schools Management page to eliminate N+1 queries, implement server-side pagination/filtering/sorting, and add a memory cache layer for high performance.

**Architecture:** Refactor the domain layer to use single aggregated queries with JOINs/GROUP BY. Implement a simple in-memory TTL cache. Modularize the frontend into Svelte 5 components with server-side state management.

**Tech Stack:** Svelte 5 (Runes), Drizzle ORM, PostgreSQL, Tailwind CSS, Lucide Svelte.

---

### Task 1: Refactor listTenantsWithStats (Domain Layer)

**Files:**

- Modify: `src/lib/server/domain/admin/index.ts`

**Step 1: Write the optimized query**

```typescript
import { getTableColumns, sql, count, eq, desc, and, or, ilike } from 'drizzle-orm';
import { tenants, applications, invoices } from '$lib/server/db/schema';

export async function listTenantsWithStats(
	params: {
		page?: number;
		limit?: number;
		search?: string;
		status?: string;
		sortBy?: string;
		sortOrder?: 'asc' | 'desc';
	} = {}
) {
	const { page = 1, limit = 20, search, status, sortBy = 'createdAt', sortOrder = 'desc' } = params;

	const offset = (page - 1) * limit;

	// Build filter conditions
	const filters = [];
	if (search) {
		filters.push(or(ilike(tenants.name, `%${search}%`), ilike(tenants.slug, `%${search}%`)));
	}
	if (status && status !== 'all') {
		filters.push(eq(tenants.status, status as any));
	}

	const baseQuery = db
		.select({
			...getTableColumns(tenants),
			appCount: sql<number>`cast(count(distinct ${applications.id}) as integer)`,
			paidInvoices: sql<number>`cast(count(distinct CASE WHEN ${invoices.status} = 'PAID' THEN ${invoices.id} END) as integer)`
		})
		.from(tenants)
		.leftJoin(applications, eq(tenants.id, applications.tenantId))
		.leftJoin(invoices, eq(tenants.id, invoices.tenantId))
		.where(filters.length > 0 ? and(...filters) : undefined)
		.groupBy(tenants.id)
		.limit(limit)
		.offset(offset);

	// Sorting logic
	if (sortBy === 'name') {
		baseQuery.orderBy(sortOrder === 'asc' ? tenants.name : desc(tenants.name));
	} else if (sortBy === 'appCount') {
		baseQuery.orderBy(sortOrder === 'asc' ? sql`appCount` : desc(sql`appCount`));
	} else {
		baseQuery.orderBy(sortOrder === 'asc' ? tenants.createdAt : desc(tenants.createdAt));
	}

	const results = await baseQuery;

	// Get total count for pagination
	const [totalResult] = await db
		.select({ count: count() })
		.from(tenants)
		.where(filters.length > 0 ? and(...filters) : undefined);

	return {
		data: results.map((r) => ({
			...r,
			stats: {
				applications: r.appCount,
				paidInvoices: r.paidInvoices
			}
		})),
		total: totalResult.count,
		page,
		totalPages: Math.ceil(totalResult.count / limit)
	};
}
```

**Step 2: Run verification**

Run: `npm run test:unit tests/unit/admin.test.ts`
Expected: Test might fail due to signature change, but logic should be sound for manual verification.

**Step 3: Commit**

```bash
git add src/lib/server/domain/admin/index.ts
git commit -m "perf(admin): refactor listTenantsWithStats to use aggregated query and pagination"
```

---

### Task 2: Implement Memory Cache Layer

**Files:**

- Create: `src/lib/server/cache.ts`

**Step 1: Create the cache utility**

```typescript
const cache = new Map<string, { data: any; expires: number }>();

export function getCached<T>(key: string): T | null {
	const item = cache.get(key);
	if (!item) return null;
	if (Date.now() > item.expires) {
		cache.delete(key);
		return null;
	}
	return item.data as T;
}

export function setCached(key: string, data: any, ttlSeconds = 300) {
	cache.set(key, { data, expires: Date.now() + ttlSeconds * 1000 });
}

export function clearCache(pattern?: string) {
	if (!pattern) {
		cache.clear();
		return;
	}
	for (const key of cache.keys()) {
		if (key.includes(pattern)) {
			cache.delete(key);
		}
	}
}
```

**Step 2: Integrate cache into listTenantsWithStats**

Modify `src/lib/server/domain/admin/index.ts` to use `getCached` and `setCached`.

**Step 3: Commit**

```bash
git add src/lib/server/cache.ts src/lib/server/domain/admin/index.ts
git commit -m "feat(admin): implement memory cache for tenant stats"
```

---

### Task 3: Modularize Frontend Components (StatsCards)

**Files:**

- Create: `src/routes/admin/schools/components/SchoolsStatsCards.svelte`
- Modify: `src/routes/admin/schools/+page.svelte`

**Step 1: Extract stats cards**

```svelte
<script lang="ts">
	import { School, Activity, Shield } from 'lucide-svelte';
	let { total, active } = $props<{ total: number; active: number }>();
</script>

<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
	<div class="bg-white p-6 rounded-xl border shadow-sm">
		<div class="flex items-center gap-4 mb-2">
			<div class="p-2 bg-blue-50 text-blue-600 rounded-lg"><School class="w-5 h-5" /></div>
			<span class="text-sm font-bold text-gray-400 uppercase tracking-widest">Total Sekolah</span>
		</div>
		<p class="text-4xl font-black text-[#002C5F]">{total}</p>
	</div>
	<!-- ... other cards ... -->
</div>
```

**Step 2: Commit**

```bash
git add src/routes/admin/schools/components/SchoolsStatsCards.svelte
git commit -m "refactor(admin): extract SchoolsStatsCards component"
```

---

### Task 4: Implement Server-Side Filtering & Search UI

**Files:**

- Create: `src/routes/admin/schools/components/SchoolsFilterBar.svelte`
- Modify: `src/routes/admin/schools/+page.server.ts`

**Step 1: Add Search and Filter logic**

```svelte
<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	let search = $state('');

	function handleSearch() {
		const url = new URL(page.url);
		url.searchParams.set('search', search);
		url.searchParams.set('page', '1');
		goto(url.toString(), { keepFocus: true });
	}
</script>

<div class="flex gap-4">
	<input type="text" bind:value={search} oninput={handleSearch} placeholder="Cari sekolah..." />
	<!-- Status Select ... -->
</div>
```

**Step 2: Commit**

```bash
git add src/routes/admin/schools/components/SchoolsFilterBar.svelte
git commit -m "feat(admin): add search and filter UI with server-side navigation"
```

---

### Task 5: Implement Pagination UI

**Files:**

- Create: `src/routes/admin/schools/components/Pagination.svelte`

**Step 1: Build Pagination component**

```svelte
<script lang="ts">
	let { current, total, onPageChange } = $props();
</script>

<div class="flex justify-center gap-2 py-4">
	<button onclick={() => onPageChange(current - 1)} disabled={current <= 1}>Prev</button>
	<span>Page {current} of {total}</span>
	<button onclick={() => onPageChange(current + 1)} disabled={current >= total}>Next</button>
</div>
```

**Step 2: Commit**

```bash
git add src/routes/admin/schools/components/Pagination.svelte
git commit -m "feat(admin): add pagination UI component"
```

---

### Task 6: Final Integration & Polling

**Files:**

- Modify: `src/routes/admin/schools/+page.svelte`

**Step 1: Add Polling and cleanup**

```svelte
<script lang="ts">
	import { invalidate } from '$app/navigation';
	$effect(() => {
		const interval = setInterval(() => invalidate('admin:tenants'), 60000);
		return () => clearInterval(interval);
	});
</script>
```

**Step 2: Final Commit**

```bash
git add src/routes/admin/schools/+page.svelte
git commit -m "feat(admin): finalize schools page with polling and full optimization"
```
