# Refactor listTenantsWithStats Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Refactor `listTenantsWithStats` to use a single aggregated query with JOINs and GROUP BY, eliminating N+1 queries, and add support for pagination, search, status filtering, and sorting.

**Architecture:**

- Use Drizzle ORM's relational query builder with `leftJoin` to aggregate `applications` and `invoices`.
- Implement a two-query approach: one for fetching the paginated data and one for the total count (to support pagination metadata).
- Use `ilike` for search and `and`/`or` for complex filtering.

**Tech Stack:** SvelteKit, Drizzle ORM, PostgreSQL.

### Task 1: Create Unit Test for listTenantsWithStats

**Files:**

- Create: `tests/unit/admin-tenants.test.ts`

**Step 1: Write the failing test**

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { listTenantsWithStats } from '../../src/lib/server/domain/admin';
import { db } from '../../src/lib/server/db';

vi.mock('../../src/lib/server/db', () => ({
	db: {
		select: vi.fn()
	}
}));

describe('listTenantsWithStats', () => {
	it('should return paginated tenants with stats using a single query', async () => {
		const mockData = [
			{
				id: '1',
				name: 'School A',
				slug: 'school-a',
				status: 'active',
				createdAt: new Date(),
				appCount: 10,
				paidInvoices: 5
			}
		];

		(db.select as any).mockReturnValue({
			from: vi.fn().mockReturnThis(),
			leftJoin: vi.fn().mockReturnThis(),
			where: vi.fn().mockReturnThis(),
			groupBy: vi.fn().mockReturnThis(),
			orderBy: vi.fn().mockReturnThis(),
			limit: vi.fn().mockReturnThis(),
			offset: vi.fn().mockResolvedValue(mockData)
		});

		// Mock count query
		(db.select as any)
			.mockReturnValueOnce({
				from: vi.fn().mockReturnThis(),
				where: vi.fn().mockResolvedValue([{ count: 1 }])
			})
			.mockReturnValueOnce({
				// For the actual data query
				from: vi.fn().mockReturnThis(),
				leftJoin: vi.fn().mockReturnThis(),
				where: vi.fn().mockReturnThis(),
				groupBy: vi.fn().mockReturnThis(),
				orderBy: vi.fn().mockReturnThis(),
				limit: vi.fn().mockReturnThis(),
				offset: vi.fn().mockResolvedValue(mockData)
			});

		const result = await listTenantsWithStats({ page: 1, limit: 10 });

		expect(result.data).toHaveLength(1);
		expect(result.total).toBe(1);
		expect(result.data[0].stats.applications).toBe(10);
	});
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test:unit tests/unit/admin-tenants.test.ts`
Expected: FAIL (argument mismatch or incorrect return format)

**Step 3: Commit initial test**

```bash
git add tests/unit/admin-tenants.test.ts
git commit -m "test(admin): add baseline test for listTenantsWithStats refactor"
```

### Task 2: Refactor listTenantsWithStats Implementation

**Files:**

- Modify: `src/lib/server/domain/admin/index.ts`

**Step 1: Implement the minimal code to make the test pass**

Update `listTenantsWithStats` to accept params and use JOINs.

```typescript
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

	// 1. Build Where Clause
	const conditions = [];
	if (status && status !== 'all') {
		conditions.push(eq(tenants.status, status as 'active' | 'inactive'));
	}
	if (search) {
		conditions.push(or(ilike(tenants.name, `%${search}%`), ilike(tenants.slug, `%${search}%`)));
	}
	const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

	// 2. Count Query
	const [totalResult] = await db.select({ count: count() }).from(tenants).where(whereClause);

	const total = Number(totalResult?.count || 0);

	// 3. Data Query with Aggregations
	const data = await db
		.select({
			...getTableColumns(tenants),
			appCount: sql<number>`cast(count(distinct ${applications.id}) as integer)`,
			paidInvoices: sql<number>`cast(count(distinct case when ${invoices.status} = 'PAID' then ${invoices.id} end) as integer)`
		})
		.from(tenants)
		.leftJoin(applications, eq(tenants.id, applications.tenantId))
		.leftJoin(invoices, eq(tenants.id, invoices.tenantId))
		.where(whereClause)
		.groupBy(tenants.id)
		.orderBy(
			sortOrder === 'desc'
				? desc(tenants[sortBy as keyof typeof tenants] || tenants.createdAt)
				: tenants[sortBy as keyof typeof tenants] || tenants.createdAt
		)
		.limit(limit)
		.offset(offset);

	return {
		data: data.map((t) => ({
			...t,
			stats: {
				applications: t.appCount,
				paidInvoices: t.paidInvoices
			}
		})),
		total,
		page,
		totalPages: Math.ceil(total / limit)
	};
}
```

**Step 2: Run tests to verify it passes**

Run: `npm run test:unit tests/unit/admin-tenants.test.ts`
Expected: PASS

**Step 3: Commit refactor**

```bash
git add src/lib/server/domain/admin/index.ts
git commit -m "perf(admin): refactor listTenantsWithStats to use aggregated query and pagination"
```

### Task 3: Final Verification and Cleanup

**Step 1: Run all admin tests**

Run: `npm run test:unit tests/unit/admin.test.ts tests/unit/admin-tenants.test.ts`
Expected: ALL PASS

**Step 2: Verify compilation**

Run: `npx tsc --noEmit` (if applicable) or check for lint errors.
