# Schools Page Optimization - Design Document

**Date:** January 17, 2026  
**Scope:** Full Overhaul - Critical + Performance + UX + Architecture  
**Status:** Design Complete, Awaiting Implementation

---

## Overview

Optimize `/admin/schools` page to address critical performance issues, improve UX, and establish maintainable architecture. Current implementation suffers from N+1 queries, no pagination, weak validation, and poor type safety.

---

## Architecture Decisions

### 1. Backend

#### Data Layer

- **Single Query Aggregation:** Replace N+1 pattern with JOINs and GROUP BY
- **Pagination:** Server-side with `limit` and `offset` parameters
- **Server-Side Filtering/Sorting:** Move all filter/sort logic to query level
- **Memory Cache:** In-process Map-based cache with 5-minute TTL

#### Database Query (Optimized)

```typescript
const tenantsWithStats = await db
	.select({
		...getTableColumns(tenants),
		applications: count(applications.id),
		paidInvoices: sql<number>`count(*) FILTER (WHERE ${invoices.status} = 'PAID')`
	})
	.from(tenants)
	.leftJoin(applications, eq(tenants.id, applications.tenantId))
	.leftJoin(invoices, eq(tenants.id, invoices.tenantId))
	.groupBy(tenants.id)
	.orderBy(desc(tenants.createdAt));
```

#### Cache Implementation

```typescript
const cache = new Map<string, { data: any; expires: number }>();

function getCached(key: string) {
	const item = cache.get(key);
	if (!item || Date.now() > item.expires) {
		cache.delete(key);
		return null;
	}
	return item.data;
}

function setCached(key: string, data: any, ttlSeconds = 300) {
	cache.set(key, { data, expires: Date.now() + ttlSeconds * 1000 });
}

// Cache key format: `tenants:page:${page}:limit:${limit}:filter:${JSON.stringify(filters)}`
```

#### Validation Enhancement

- UUID format validation for `tenantId`
- Enum validation for status values (`'active' | 'inactive'`)
- Proper error messages

---

### 2. Frontend

#### Component Structure

```
+page.svelte (Main Container)
├── SchoolsPageHeader
│   ├── Page Title
│   └── Register School Button
├── SchoolsStatsCards
│   ├── Total Schools Card
│   ├── Active Schools Card
│   └── Security Status Card
├── FilterBar
│   ├── SearchBar (with debouncing)
│   └── SortDropdown
├── SchoolsTable
│   ├── Table Header
│   ├── TenantRow (each tenant)
│   │   ├── Tenant Info
│   │   ├── Access URL
│   │   ├── Applications Count
│   │   ├── Invoice Count
│   │   ├── Status Badge
│   │   └── StatusToggleForm
│   └── Pagination Controls
├── SchoolsSkeleton (Loading State)
└── SchoolsError (Error Boundary)
```

#### TypeScript Types

```typescript
interface TenantWithStats {
	id: string;
	name: string;
	slug: string;
	status: 'active' | 'inactive' | 'suspended';
	createdAt: Date;
	updatedAt: Date;
	stats: {
		applications: number;
		paidInvoices: number;
	};
}

interface FilterState {
	search: string;
	status?: 'all' | 'active' | 'inactive';
	sortBy: 'name' | 'createdAt' | 'applications' | 'revenue';
	sortOrder: 'asc' | 'desc';
}

interface PaginationState {
	page: number;
	limit: number;
	total: number;
	totalPages: number;
}
```

#### State Management

- Use Svelte 5 derived states for reactive computations
- `filteredTenants` - derived from `tenants` + `filterState`
- `activeCount` - O(1) computed property
- `sortedTenants` - derived from `filteredTenants` + `sortBy`

---

### 3. UX/UI

#### Loading States

- **Skeleton Loading:** Dedicated `SchoolsSkeleton.svelte` matching structure
- **Pulsing Effect:** Gray placeholders with shimmer animation
- **Progressive:** Load skeleton → fade in content

#### Error Handling

- **Error Boundary:** `SchoolsError.svelte` at page level
- **Retry Action:** Button to `invalidateAll()` and reload
- **Friendly Messages:** Clear error descriptions, not technical jargon

#### Real-time Updates (Polling)

- **Interval:** Auto-refresh every 60 seconds
- **Implementation:** Svelte `$effect` with `setInterval`
- **Indicator:** Subtle "Updating..." message in table header during refresh

```typescript
$effect(() => {
	const interval = setInterval(() => {
		invalidate('admin:tenants');
	}, 60_000);
	return () => clearInterval(interval);
});
```

#### Empty States

1. **No Results:** Search/filter returned no matches
   - Illustration: Empty box or search icon
   - Message: "No schools match your criteria"
   - CTA: "Clear filters"

2. **No Schools:** System has no registered schools
   - Illustration: School icon with question mark
   - Message: "No schools registered yet"
   - CTA: "Register First School" button

#### Pagination UI

- Previous/Next navigation buttons
- Current page display: "Page X of Y"
- Jump to first/last buttons
- Summary: "Showing X-Y of Z schools"

---

## Implementation Phases

### Phase 1: Critical Backend (Priority 1)

**Estimated Time:** 3-4 hours

Tasks:

- [ ] Refactor `listTenantsWithStats()` to use single query with JOINs
- [ ] Add pagination support with `limit` and `offset` parameters
- [ ] Implement memory cache layer with TTL
- [ ] Add server-side filtering (status, search)
- [ ] Add server-side sorting (name, createdAt, applications)
- [ ] Enhance `updateTenantStatus()` with UUID and enum validation
- [ ] Add cache invalidation after status updates

**Success Criteria:**

- 100 schools load in < 500ms (vs ~2s)
- Only 1 database query per page load
- Cache hit rate > 70%

---

### Phase 2: Frontend Refactor (Priority 2)

**Estimated Time:** 4-6 hours

Tasks:

- [ ] Extract modular components (StatsCards, Table, Row, SearchBar, etc.)
- [ ] Define proper TypeScript interfaces
- [ ] Implement loading skeletons
- [ ] Add error boundaries
- [ ] Migrate filtering to server-side
- [ ] Implement derived states with Svelte 5 runes

**Success Criteria:**

- Zero TypeScript `any` types
- All components are independently testable
- Type errors = 0

---

### Phase 3: UX Enhancements (Priority 3)

**Estimated Time:** 3-4 hours

Tasks:

- [ ] Implement polling (60s interval)
- [ ] Add search bar with 300ms debounce
- [ ] Add status filter dropdown
- [ ] Add sort controls
- [ ] Build pagination UI component
- [ ] Create empty state variants
- [ ] Add "Updating..." indicator

**Success Criteria:**

- Search responds in < 100ms (debounced)
- Users see updated data within 60s
- Empty states are clear and actionable

---

### Phase 4: Quality & Polish (Priority 4)

**Estimated Time:** 4-6 hours

Tasks:

- [ ] Add database indexes (if needed)
- [ ] Write unit tests for domain functions
- [ ] Write integration tests for page load
- [ ] Write E2E tests with Playwright
- [ ] Add performance monitoring (query times, cache hit rate)
- [ ] Optimize cache TTL through A/B testing
- [ ] Accessibility audit (WCAG AA compliance)

**Success Criteria:**

- Test coverage > 80%
- All E2E tests passing
- PageSpeed Score > 90

---

## Performance Targets

| Metric                          | Current           | Target  | Improvement |
| ------------------------------- | ----------------- | ------- | ----------- |
| **Database Queries**            | 201 (100 schools) | 1       | **99.5%**   |
| **Page Load (100 schools)**     | ~2s               | < 500ms | **75%**     |
| **Page Load (1000 schools)**    | ~20s              | < 500ms | **97.5%**   |
| **Memory Usage (1000 schools)** | ~500KB            | < 50KB  | **90%**     |
| **Type Safety**                 | ~60%              | 100%    | **67%**     |
| **Cache Hit Rate**              | N/A               | > 70%   | New         |
| **Test Coverage**               | < 20%             | > 80%   | **300%**    |

---

## Technical Constraints & Decisions

### Decisions Made:

1. **Cache:** Memory (in-process) vs Redis → **Memory** (simpler, no external dependency)
2. **Real-time:** Polling vs WebSocket → **Polling** (balance of responsiveness vs complexity)
3. **Database Indexes:** Include vs Skip → **Skip** (focus code optimization first)
4. **Component Structure:** Consolidated vs Modular → **Modular** (better maintainability)

### Trade-offs:

- **Memory Cache:** Fast and simple, but not distributed (won't work across multiple instances)
- **Polling:** Adds load every 60s, but much simpler than WebSocket infrastructure
- **Modular Components:** More files and boilerplate, but better testability and reusability

---

## Success Criteria

**Must Have:**

- ✅ Page loads in < 500ms for up to 1000 schools
- ✅ Only 1 database query per page load (with cache hit)
- ✅ Proper TypeScript types throughout (no `any`)
- ✅ Loading states visible during data fetch
- ✅ Error handling with retry capability

**Should Have:**

- ✅ Server-side filtering and sorting
- ✅ Pagination working with 20 items per page
- ✅ Auto-refresh every 60 seconds
- ✅ Empty states for no results
- ✅ Unit tests for critical functions

**Nice to Have:**

- ✅ Database indexes optimized
- ✅ E2E tests covering user flows
- ✅ Performance monitoring dashboard
- ✅ Cache TTL optimization based on real data

---

## Risks & Mitigations

| Risk                    | Impact | Mitigation                                  |
| ----------------------- | ------ | ------------------------------------------- |
| Cache invalidation bugs | High   | Clear cache after all write operations      |
| Memory leak with cache  | Medium | Add automatic cleanup on cache expiration   |
| TypeScript type errors  | Medium | Strict mode enabled, all errors blocking    |
| Performance regression  | High   | Benchmark before/after, monitor query times |

---

## Open Questions

None - All decisions finalized.

---

## Next Steps

1. ✅ Design document created
2. ⏳ Commit design to git
3. ⏳ Set up isolated workspace with git worktree
4. ⏳ Create detailed implementation plan
5. ⏳ Execute Phase 1-4

---

**Document Version:** 1.0  
**Last Updated:** January 17, 2026  
**Author:** Claude AI (with human guidance)
