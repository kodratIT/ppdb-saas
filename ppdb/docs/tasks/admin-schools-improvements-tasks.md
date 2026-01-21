# Admin Schools Page UI/UX Improvements

**Goal:** Refactor admin schools page into reusable components, improve UX, and add missing features.

**Status:** Ready for Implementation
**Created:** 2026-01-21
**Last Updated:** 2026-01-21

---

## Current State Analysis

### Files in `/src/routes/admin/schools/`:

| File                                  | Lines | Purpose              | Status             |
| ------------------------------------- | ----- | -------------------- | ------------------ |
| `+page.svelte`                        | 324   | Main page controller | ⚠️ Needs refactor  |
| `+page.server.ts`                     | 176   | Server actions       | ✅ Good            |
| `components/SchoolsTable.svelte`      | 277   | Data table           | ⚠️ Can be improved |
| `components/StatsCards.svelte`        | 93    | KPI cards            | ✅ Reusable        |
| `components/BulkActionToolbar.svelte` | 66    | Bulk actions         | ⚠️ Can be generic  |
| `components/ConfirmDialog.svelte`     | 52    | Confirmation dialog  | ✅ Reusable        |
| `components/ExportButton.svelte`      | 66    | Export functionality | ✅ Reusable        |
| `components/TableSkeleton.svelte`     | 50    | Loading skeleton     | ⚠️ Can be generic  |

### Issues Identified:

| Category          | Issue                                               | Severity |
| ----------------- | --------------------------------------------------- | -------- |
| **Components**    | StatsCards should be in `/lib/components/admin/`    | Medium   |
| **Components**    | BulkActionToolbar should be generic `BulkActionBar` | Medium   |
| **Components**    | TableSkeleton should be in `/lib/components/ui/`    | Low      |
| **Features**      | No column sorting UI                                | High     |
| **Features**      | No column visibility toggle                         | Medium   |
| **Features**      | No quick filters (date range, type)                 | Medium   |
| **Features**      | No inline edit capability                           | Low      |
| **Features**      | No bulk export options                              | Medium   |
| **UX**            | No toast for bulk operation partial failures        | Medium   |
| **UX**            | Loading state could be more granular                | Low      |
| **Accessibility** | No keyboard navigation improvements                 | Medium   |
| **Performance**   | No virtualization for large lists                   | Low      |

---

## Task List

### Phase 1: Create Reusable Generic Components

#### Task 1.1: Create Generic BulkActionBar Component

**Source:** `admin/schools/components/BulkActionToolbar.svelte`
**Target:** `lib/components/admin/BulkActionBar.svelte`

**Description:** Convert `BulkActionToolbar` into a generic bulk action bar component that can be used across all admin pages.

**Changes:**

```typescript
// New props interface
interface Props {
	selectedCount: number;
	title?: string; // NEW: Customizable title
	actionLabels?: {
		// NEW: Customizable labels
		activate?: string;
		deactivate?: string;
		clear?: string;
	};
	onActivate?: () => void;
	onDeactivate?: () => void;
	onClear?: () => void;
	loading?: boolean;
	position?: 'bottom' | 'sticky'; // NEW: Position options
	showActivate?: boolean; // NEW: Toggle actions
	showDeactivate?: boolean;
}
```

**Features to Add:**

- Customizable action buttons
- Position options (fixed bottom or sticky)
- Loading state for each action
- Custom icons support
- Accessible keyboard navigation

**Priority:** Medium
**Effort:** 1.5 hours
**Dependencies:** None

---

#### Task 1.2: Create Generic TableSkeleton Component

**Source:** `admin/schools/components/TableSkeleton.svelte`
**Target:** `lib/components/ui/table-skeleton.svelte`

**Description:** Create a generic table skeleton that accepts column configuration.

**Changes:**

```typescript
interface Props {
	columns: {
		// NEW: Column config
		key: string;
		width?: string;
		align?: 'left' | 'center' | 'right';
	}[];
	rows?: number;
	showCheckbox?: boolean; // NEW: Checkbox column
	showActions?: boolean; // NEW: Actions column
}

interface Column {
	key: string;
	width?: string;
	align?: 'left' | 'center' | 'right';
	skeletonWidth?: string;
	skeletonHeight?: string;
}
```

**Features to Add:**

- Configurable columns
- Custom skeleton sizes per column
- Optional checkbox column
- Optional actions column
- Custom skeleton component support

**Priority:** Low
**Effort:** 1 hour
**Dependencies:** None

---

#### Task 1.3: Move StatsCards to Admin Components

**Source:** `admin/schools/components/StatsCards.svelte`
**Target:** `lib/components/admin/AdminStatsCards.svelte`

**Description:** Move `StatsCards` to global admin components library.

**Changes:**

- Update import paths
- Add more KPI card variations
- Add trend chart support (optional)
- Add sparkline support (optional)

**Features to Add:**

- Optional trend sparklines
- Optional progress bars
- Color variants
- Clickable cards (drill-down)

**Priority:** Low
**Effort:** 45 minutes
**Dependencies:** None

---

### Phase 2: Enhance SchoolsTable Component

#### Task 2.1: Add Column Sorting to SchoolsTable

**File:** `admin/schools/components/SchoolsTable.svelte`

**Description:** Add clickable column headers for sorting.

**Changes:**

```svelte
<!-- Before -->
<th class="w-80">School Identity</th>

<!-- After -->
<th class="w-80 cursor-pointer hover:bg-muted/50" onclick={() => handleSort('name')}>
	<div class="flex items-center gap-2">
		School Identity
		{#if sortBy === 'name'}
			<SortAsc class="h-4 w-4" />
		{/if}
	</div>
</th>
```

**New Props:**

```typescript
interface Props {
	// ... existing props
	sortBy?: string;
	sortOrder?: 'asc' | 'desc';
	onSort?: (column: string, order: 'asc' | 'desc') => void;
}
```

**Columns to Support:**

- School Name (name)
- Created Date (createdAt)
- Status (status)
- Applications count (applications)
- Paid Invoices (paidInvoices)

**Priority:** High
**Effort:** 2 hours
**Dependencies:** Task 1.1 (for UI updates)

---

#### Task 2.2: Add Column Visibility Toggle

**File:** `admin/schools/components/SchoolsTable.svelte`

**Description:** Add dropdown to toggle column visibility.

**Changes:**

```svelte
<div class="flex items-center gap-2">
	<DropdownMenu.Root>
		<DropdownMenu.Trigger>
			<Button variant="outline" size="sm">
				<Columns class="h-4 w-4 mr-2" />
				Columns
			</Button>
		</DropdownMenu.Trigger>
		<DropdownMenu.Content>
			{#each columns as column}
				<DropdownMenu.CheckboxItem
					checked={visibleColumns.includes(column.key)}
					onCheckedChange={(v) => toggleColumn(column.key, v)}
				>
					{column.label}
				</DropdownMenu.CheckboxItem>
			{/each}
		</DropdownMenu.Content>
	</DropdownMenu.Root>
</div>
```

**Priority:** Medium
**Effort:** 1.5 hours
**Dependencies:** Task 2.1

---

#### Task 2.3: Add Inline Status Toggle

**File:** `admin/schools/components/SchoolsTable.svelte`

**Description:** Add quick toggle button in table rows for status changes.

**Changes:**

```svelte
<!-- Add toggle button next to status badge -->
<td>
	<div class="flex items-center gap-2">
		<Switch
			checked={tenant.status === 'active'}
			onCheckedChange={(v) => handleQuickToggle(tenant.id, v)}
			disabled={loadingTenants.has(tenant.id)}
		/>
		<Badge variant={tenant.status === 'active' ? 'default' : 'destructive'}>
			{tenant.status}
		</Badge>
	</div>
</td>
```

**Features:**

- Immediate toggle without dropdown
- Loading state per row
- Optimistic UI update
- Error rollback

**Priority:** Medium
**Effort:** 1.5 hours
**Dependencies:** None

---

#### Task 2.4: Improve Row Actions Menu

**File:** `admin/schools/components/SchoolsTable.svelte`

**Description:** Enhance the actions dropdown with more options and better UX.

**Current Actions:**

- View as Public
- Login as Admin
- Toggle Status

**New Actions to Add:**

- Edit School Details (link to edit page)
- View Analytics (link to tenant analytics)
- Manage Subscription (link to subscription page)
- View Audit Log (link to audit logs filtered)
- Delete School (with confirmation)

**Changes:**

```svelte
<DropdownMenu.Content class="w-56">
	<DropdownMenu.Label>Actions</DropdownMenu.Label>
	<DropdownMenu.Item>
		<ExternalLink class="h-4 w-4" /> View School Admin
	</DropdownMenu.Item>
	<DropdownMenu.Item>
		<Edit class="h-4 w-4" /> Edit Details
	</DropdownMenu.Item>
	<DropdownMenu.Item>
		<BarChart3 class="h-4 w-4" /> View Analytics
	</DropdownMenu.Item>
	<DropdownMenu.Separator />
	<DropdownMenu.Item>
		<CreditCard class="h-4 w-4" /> Subscription
	</DropdownMenu.Item>
	<DropdownMenu.Item>
		<FileText class="h-4 w-4" /> Audit Log
	</DropdownMenu.Item>
	<DropdownMenu.Separator />
	<DropdownMenu.Item class="text-destructive">
		<Trash2 class="h-4 w-4" /> Delete School
	</DropdownMenu.Item>
</DropdownMenu.Content>
```

**Priority:** Medium
**Effort:** 1 hour
**Dependencies:** None

---

### Phase 3: Add Missing Features

#### Task 3.1: Add Quick Filters

**File:** `admin/schools/+page.svelte`

**Description:** Add quick filter buttons for common filters.

**Filters to Add:**

- All (default)
- Active only
- Inactive only
- New this week
- New this month
- By Type: School
- By Type: Foundation

**Changes:**

```svelte
<div class="flex items-center gap-2">
	<FilterButton label="All" active={status === 'all'} onclick={() => setStatus('all')} />
	<FilterButton label="Active" active={status === 'active'} onclick={() => setStatus('active')} />
	<FilterButton
		label="Inactive"
		active={status === 'inactive'}
		onclick={() => setStatus('inactive')}
	/>
	<DropdownMenu.Root>
		<DropdownMenu.Trigger>
			<Button variant="outline" size="sm">More Filters</Button>
		</DropdownMenu.Trigger>
		<DropdownMenu.Content>
			<DropdownMenu.Item onclick={() => filterByDate('week')}>New This Week</DropdownMenu.Item>
			<DropdownMenu.Item onclick={() => filterByDate('month')}>New This Month</DropdownMenu.Item>
			<DropdownMenu.Separator />
			<DropdownMenu.Item onclick={() => filterByType('school')}>Type: School</DropdownMenu.Item>
			<DropdownMenu.Item onclick={() => filterByType('foundation')}
				>Type: Foundation</DropdownMenu.Item
			>
		</DropdownMenu.Content>
	</DropdownMenu.Root>
</div>
```

**Priority:** Medium
**Effort:** 2 hours
**Dependencies:** Server-side filter support

---

#### Task 3.2: Add Bulk Export Options

**File:** `admin/schools/components/ExportButton.svelte`

**Description:** Add export format options and field selection.

**Changes:**

```typescript
interface ExportOptions {
	format: 'csv' | 'xlsx' | 'json';
	fields: string[]; // Selected columns to export
	filename?: string;
}
```

**Features:**

- Format selection (CSV, Excel, JSON)
- Field selection (choose columns to export)
- Filter-aware export (respect current filters)
- Scheduled export (optional - email export)

**Priority:** Medium
**Effort:** 2 hours
**Dependencies:** Server-side export enhancement

---

#### Task 3.3: Add Advanced Search

**File:** `admin/schools/+page.svelte`

**Description:** Enhance search with filters and operators.

**Features:**

- Search by multiple fields (name, slug, email)
- Operators: contains, starts with, exact match
- Saved searches
- Search history

**UI Mockup:**

```svelte
<div class="relative">
	<Search class="absolute left-3 top-1/2 h-4 w-4" />
	<Input placeholder="Search schools..." class="pl-9" />
	<Popover>
		<Popover.Trigger>
			<Button variant="outline" size="sm" class="ml-2">
				<Filter class="h-4 w-4" />
			</Button>
		</Popover.Trigger>
		<Popover.Content>
			<!-- Advanced filters -->
		</Popover.Content>
	</Popover>
</div>
```

**Priority:** Medium
**Effort:** 2.5 hours
**Dependencies:** Server-side search enhancement

---

### Phase 4: UX Improvements

#### Task 4.1: Improve Loading States

**File:** `admin/schools/+page.svelte` and components

**Description:** Add more granular loading states and feedback.

**Changes:**

- Skeleton for stats cards
- Skeleton for filter bar
- Skeleton for pagination
- Loading spinner for export
- Toast notifications for all actions
- Progress indicator for bulk operations

**Priority:** Low
**Effort:** 1.5 hours
**Dependencies:** None

---

#### Task 4.2: Add Toast for Partial Failures

**File:** `admin/schools/+page.svelte`

**Description:** Show detailed feedback when bulk operations partially fail.

**Current:** Just shows success message

**New:**

```typescript
// In bulk operation result handler
if (failureCount > 0) {
	toast.warning(`${successCount} succeeded, ${failureCount} failed`, {
		description: failures.map((f) => f.error).join(', '),
		action: {
			label: 'View Details',
			onclick: () => showFailureModal()
		}
	});
}
```

**Priority:** Medium
**Effort:** 1 hour
**Dependencies:** None

---

#### Task 4.3: Add Keyboard Navigation

**File:** `admin/schools/components/SchoolsTable.svelte`

**Description:** Improve keyboard accessibility for table navigation.

**Features:**

- Arrow key navigation between cells
- Enter to select row
- Ctrl+A to select all
- Space to toggle status
- Escape to close dropdowns

**Priority:** Medium
**Effort:** 2 hours
**Dependencies:** None

---

#### Task 4.4: Add Row Context Menu

**File:** `admin/schools/components/SchoolsTable.svelte`

**Description:** Add right-click context menu for quick actions.

**Features:**

- Right-click on row opens context menu
- Same actions as dropdown menu
- Keyboard shortcut hints

**Priority:** Low
**Effort:** 1 hour
**Dependencies:** Task 2.4

---

### Phase 5: Accessibility Improvements

#### Task 5.1: Add ARIA Labels and Roles

**File:** All components in admin/schools/

**Description:** Ensure all interactive elements have proper ARIA labels.

**Changes:**

- Add `aria-label` to all buttons
- Add `role="grid"` to table
- Add `aria-sort` to sortable columns
- Add `aria-selected` to selected rows
- Add `aria-busy` to loading elements

**Priority:** Medium
**Effort:** 1.5 hours
**Dependencies:** None

---

#### Task 5.2: Add Focus Management

**File:** All components

**Description:** Improve focus management for keyboard users.

**Features:**

- Focus trap in modals
- Focus return after actions
- Visible focus indicators
- Skip to content link

**Priority:** Medium
**Effort:** 1 hour
**Dependencies:** None

---

### Phase 6: Performance Optimizations

#### Task 6.1: Add Table Virtualization

**File:** `admin/schools/components/SchoolsTable.svelte`

**Description:** Implement virtualization for large lists.

**Features:**

- Virtual scrolling for 100+ items
- Dynamic row height support
- Smooth scrolling
- Windowing support

**Priority:** Low
**Effort:** 3 hours
**Dependencies:** None

---

#### Task 6.2: Add Data Caching

**File:** `admin/schools/+page.server.ts`

**Description:** Implement client-side caching for frequently accessed data.

**Features:**

- Cache tenant list
- Cache stats
- Cache filters
- Cache busting on mutations

**Priority:** Low
**Effort:** 2 hours
**Dependencies:** None

---

## Implementation Order

### Week 1: Foundation

| Order | Task                            | Effort |
| ----- | ------------------------------- | ------ |
| 1     | Task 1.1: Generic BulkActionBar | 1.5h   |
| 2     | Task 1.2: Generic TableSkeleton | 1h     |
| 3     | Task 2.1: Column Sorting        | 2h     |
| 4     | Task 3.3: Advanced Search       | 2.5h   |

### Week 2: Features

| Order | Task                           | Effort |
| ----- | ------------------------------ | ------ |
| 5     | Task 2.2: Column Visibility    | 1.5h   |
| 6     | Task 2.3: Inline Status Toggle | 1.5h   |
| 7     | Task 2.4: Enhanced Row Actions | 1h     |
| 8     | Task 3.1: Quick Filters        | 2h     |

### Week 3: UX & Polish

| Order | Task                              | Effort |
| ----- | --------------------------------- | ------ |
| 9     | Task 3.2: Bulk Export Options     | 2h     |
| 10    | Task 4.1: Improved Loading States | 1.5h   |
| 11    | Task 4.2: Toast for Failures      | 1h     |
| 12    | Task 4.3: Keyboard Navigation     | 2h     |

### Week 4: Accessibility & Performance

| Order | Task                           | Effort |
| ----- | ------------------------------ | ------ |
| 13    | Task 5.1: ARIA Labels          | 1.5h   |
| 14    | Task 5.2: Focus Management     | 1h     |
| 15    | Task 6.1: Table Virtualization | 3h     |
| 16    | Task 6.2: Data Caching         | 2h     |

---

## Total Effort

| Phase                              | Tasks  | Total Time       |
| ---------------------------------- | ------ | ---------------- |
| Phase 1: Generic Components        | 3      | 3.25 hours       |
| Phase 2: SchoolsTable Enhancements | 4      | 6 hours          |
| Phase 3: Missing Features          | 3      | 6.5 hours        |
| Phase 4: UX Improvements           | 4      | 5.5 hours        |
| Phase 5: Accessibility             | 2      | 2.5 hours        |
| Phase 6: Performance               | 2      | 5 hours          |
| **Total**                          | **18** | **~28.75 hours** |

---

## Success Criteria

- [ ] All reusable components moved to `lib/components/`
- [ ] SchoolsTable supports sorting, filtering, column toggle
- [ ] Bulk actions work with proper feedback
- [ ] Export functionality supports multiple formats
- [ ] Keyboard navigation is complete
- [ ] ARIA labels are proper
- [ ] Loading states are granular
- [ ] Performance is acceptable for 100+ rows

---

## Related Files

**Modified:**

- `src/routes/admin/schools/+page.svelte`
- `src/routes/admin/schools/components/SchoolsTable.svelte`
- `src/routes/admin/schools/components/BulkActionToolbar.svelte`
- `src/routes/admin/schools/components/TableSkeleton.svelte`

**Created:**

- `src/lib/components/admin/BulkActionBar.svelte`
- `src/lib/components/ui/table-skeleton.svelte`
- `src/lib/components/admin/AdminStatsCards.svelte`

**Deleted:**

- `src/routes/admin/schools/components/BulkActionToolbar.svelte` (moved)
- `src/routes/admin/schools/components/TableSkeleton.svelte` (moved)
- `src/routes/admin/schools/components/StatsCards.svelte` (moved)
