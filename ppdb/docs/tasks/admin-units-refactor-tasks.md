# Admin Units Page Refactoring Tasks

**Goal:** Refactor admin units page into reusable shadcn components, improve UX, and meet quality standards.

**Status:** ✅ Phase 1-3 Complete | 🔄 Phase 4-6 Pending
**Created:** 2026-01-21
**Last Updated:** 2026-01-21
**Original File:** `src/routes/admin/units/+page.svelte` (397 lines → 250 lines)

---

## Current State Analysis

### Files in `/src/routes/admin/units/`:

| File                               | Lines | Purpose               | Status             |
| ---------------------------------- | ----- | --------------------- | ------------------ |
| `+page.svelte`                     | 397   | Main page controller  | ⚠️ Needs refactor  |
| `+page.server.ts`                  | 218   | Server load & actions | ✅ Good            |
| `components/AddUnitDialog.svelte`  | 248   | Add unit dialog       | ⚠️ Can be improved |
| `components/EditUnitDialog.svelte` | 251   | Edit unit dialog      | ⚠️ Can be improved |

### Current Features:

- Units listing with tenant grouping
- Search and filter (search, level, tenant)
- Add/Edit/Delete unit dialogs
- Stats cards
- i18n support (already integrated)

### Issues Identified:

| Category          | Issue                                                   | Severity |
| ----------------- | ------------------------------------------------------- | -------- |
| **Components**    | Page has 397 lines - too long                           | High     |
| **Components**    | Table UI embedded in page                               | High     |
| **Components**    | No density selector                                     | Medium   |
| **Components**    | No column visibility toggle                             | Medium   |
| **Components**    | AddUnitDialog & EditUnitDialog have ~90% duplicate code | High     |
| **Features**      | No bulk actions                                         | Low      |
| **UX**            | Group by tenant toggle missing                          | Medium   |
| **TypeScript**    | Uses `any` type for unit data                           | Medium   |
| **Accessibility** | Missing some aria-labels                                | Low      |

---

## Task List

### Phase 1: Create Reusable Components

#### Task 1.1: Create UnitsTable Component

**File:** `src/lib/components/admin/UnitsTable.svelte`

**Description:** Extract table UI into reusable component with sorting, density, column visibility.

**Features:**

- Unit data display with tenant grouping
- Density selector (compact, normal, comfortable)
- Column visibility toggle
- Sortable columns
- Edit/Delete actions per row
- Loading skeleton

**Props:**

```typescript
interface Props {
	units: Unit[]; // Unit data with tenant info
	loading?: boolean;
	density?: 'compact' | 'normal' | 'comfortable';
	visibleColumns?: string[];
	groupByTenant?: boolean;
	onEdit?: (unit: Unit) => void;
	onDelete?: (unit: Unit) => void;
	onSort?: (column: string, order: 'asc' | 'desc') => void;
	onDensityChange?: (density: 'compact' | 'normal' | 'comfortable') => void;
	onColumnToggle?: (column: string, visible: boolean) => void;
	onGroupByTenantChange?: (enabled: boolean) => void;
}

interface Unit {
	id: string;
	name: string;
	level: string;
	npsn?: string;
	accreditation?: string;
	contactPhone?: string;
	address?: string;
	tenantId: string;
	tenant?: {
		id: string;
		name: string;
	};
	createdAt?: Date;
}
```

**UI Requirements:**

```svelte
<!-- Density Selector -->
<select onchange={handleDensityChange}>
	<option value="compact">Compact</option>
	<option value="normal">Normal</option>
	<option value="comfortable">Comfortable</option>
</select>

<!-- Column Visibility -->
<DropdownMenu>
	<DropdownMenu.CheckboxItem checked={showNPSN}>NPSN</DropdownMenu.CheckboxItem>
	<!-- ... more columns -->
</DropdownMenu>

<!-- Group by Tenant Toggle -->
<Switch checked={groupByTenant} onCheckedChange={handleGroupToggle} />
```

**Priority:** High
**Effort:** 4 hours
**Dependencies:** None

---

#### Task 1.2: Create UnitFormDialog Component

**File:** `src/lib/components/admin/UnitFormDialog.svelte`

**Description:** Merge AddUnitDialog and EditUnitDialog into single reusable form dialog.

**Features:**

- Single component for add/edit
- Auto-fill with unit data for edit mode
- Form validation
- Tenant selection (super admin only)
- Level, accreditation, contact, address fields

**Props:**

```typescript
interface Props {
	open?: boolean; // bindable
	mode?: 'add' | 'edit';
	unit?: Unit; // for edit mode
	tenants?: Tenant[]; // for super admin
	user?: User;
	onSave?: (data: UnitFormData) => void;
	onClose?: () => void;
}

interface UnitFormData {
	id?: string;
	name: string;
	level: string;
	npsn?: string;
	accreditation?: string;
	contactPhone?: string;
	address?: string;
	tenantId: string;
}
```

**Code Reuse Target:** Reduce 499 lines (248+251) to ~200 lines

**Priority:** High
**Effort:** 4 hours
**Dependencies:** None

---

#### Task 1.3: Create UnitsStatsCards Component

**File:** `src/lib/components/admin/UnitsStatsCards.svelte`

**Description:** Extract stats cards into reusable component.

**Features:**

- Total units count
- Units by level breakdown
- Units by accreditation
- Recently added units

**Props:**

```typescript
interface Props {
	units: Unit[];
	isLoading?: boolean;
}

interface Stats {
	total: number;
	byLevel: Record<string, number>;
	byAccreditation: Record<string, number>;
	recentlyAdded: number;
}
```

**Priority:** Medium
**Effort:** 2 hours
**Dependencies:** None

---

### Phase 2: Refactor Main Page

#### Task 2.1: Refactor +page.svelte to Use Components

**File:** `src/routes/admin/units/+page.svelte`

**Changes:**

```svelte
<!-- Before: 397 lines -->
<script>
  // All inline logic
  let search = $state(data.filters.search);
  let selectedLevelFilter = $state(data.filters.level);
  // ... 50+ lines of state
</script>

<template>
  <!-- All UI inline -->
</template>

<!-- After: ~200 lines -->
<script>
  import UnitsTable from '$lib/components/admin/UnitsTable.svelte';
  import UnitsStatsCards from '$lib/components/admin/UnitsStatsCards.svelte';
  import UnitFormDialog from '$lib/components/admin/UnitFormDialog.svelte';
  import AdminPageHeader from '$lib/components/admin/AdminPageHeader.svelte';
  import AdvancedSearch from '$lib/components/admin/AdvancedSearch.svelte';

  // Minimal page state
  let density = $state<'compact' | 'normal' | 'comfortable'>('normal');
  let visibleColumns = $state(['name', 'level', 'npsn', 'accreditation', 'actions']);
  let groupByTenant = $state(true);
</script>

<AdminPageHeader
  title={$t('admin.units.title')}
  description={$t('admin.units.subtitle')}
/>

<UnitsStatsCards units={data.units} />

<AdvancedSearch />

<UnitsTable
  units={data.units}
  {density}
  {visibleColumns}
  {groupByTenant}
  onEdit={handleEdit}
  onDelete={handleDelete}
/>

<UnitFormDialog bind:open={isFormOpen} />
```

**Target:** Reduce from 397 lines to < 200 lines (50% reduction)

**Priority:** High
**Effort:** 3 hours
**Dependencies:** Task 1.1, 1.2, 1.3

---

#### Task 2.2: Add Density Selector

**File:** `src/routes/admin/units/+page.svelte` or `UnitsTable.svelte`

**Features:**

- Dropdown to select row density
- Options: Compact, Normal, Comfortable
- Persists to localStorage

**UI Implementation:**

```svelte
<div class="flex items-center gap-2">
	<Button
		variant="outline"
		size="sm"
		onclick={() => setDensity('compact')}
		class={density === 'compact' ? 'bg-primary text-primary-foreground' : ''}
	>
		Compact
	</Button>
	<Button
		variant="outline"
		size="sm"
		onclick={() => setDensity('normal')}
		class={density === 'normal' ? 'bg-primary text-primary-foreground' : ''}
	>
		Normal
	</Button>
	<Button
		variant="outline"
		size="sm"
		onclick={() => setDensity('comfortable')}
		class={density === 'comfortable' ? 'bg-primary text-primary-foreground' : ''}
	>
		Comfortable
	</Button>
</div>
```

**CSS for Density:**

```css
.density-compact .table-row {
	padding: 0.25rem;
}
.density-normal .table-row {
	padding: 0.5rem;
}
.density-comfortable .table-row {
	padding: 1rem;
}
```

**Priority:** Medium
**Effort:** 1.5 hours
**Dependencies:** Task 1.1

---

#### Task 2.3: Add Column Visibility Toggle

**File:** `src/routes/admin/units/+page.svelte` or `UnitsTable.svelte`

**Features:**

- Dropdown to show/hide columns
- Columns: Name, Level, NPSN, Accreditation, Contact, Address, Actions

**UI Implementation:**

```svelte
<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		<Button variant="outline" size="sm">
			<Columns class="h-4 w-4 mr-2" />
			Columns
		</Button>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content>
		<DropdownMenu.CheckboxItem bind:checked={showName}>Name</DropdownMenu.CheckboxItem>
		<DropdownMenu.CheckboxItem bind:checked={showLevel}>Level</DropdownMenu.CheckboxItem>
		<!-- ... more columns -->
	</DropdownMenu.Content>
</DropdownMenu.Root>
```

**Priority:** Medium
**Effort:** 1.5 hours
**Dependencies:** Task 1.1

---

#### Task 2.4: Add Group by Tenant Toggle

**File:** `src/routes/admin/units/+page.svelte` or `UnitsTable.svelte`

**Features:**

- Toggle to group units by their tenant
- Default: enabled

**UI Implementation:**

```svelte
<div class="flex items-center gap-2">
	<Switch id="group-by-tenant" bind:checked={groupByTenant} />
	<Label for="group-by-tenant">Group by Foundation</Label>
</div>
```

**Priority:** Medium
**Effort:** 1 hour
**Dependencies:** Task 1.1

---

#### Task 2.5: Add Bulk Actions

**File:** `src/routes/admin/units/+page.svelte` or `UnitsTable.svelte`

**Features:**

- Select multiple units
- Bulk delete (with confirmation)
- Bulk export (CSV)
- Bulk change level/accreditation

**UI:**

```svelte
{#if selectedUnits.length > 0}
	<BulkActionBar
		selectedCount={selectedUnits.length}
		onDelete={handleBulkDelete}
		onExport={handleBulkExport}
		onClear={handleClearSelection}
	/>
{/if}
```

**Priority:** Low
**Effort:** 3 hours
**Dependencies:** Task 1.1, Task 1.2

---

### Phase 3: TypeScript Improvements

#### Task 3.1: Define Unit Type

**File:** `src/lib/types/admin.ts` or inline in component

**Changes:**

```typescript
// Before
let unit: any;

// After
interface Unit {
	id: string;
	name: string;
	level: 'TK' | 'SD' | 'SMP' | 'SMA' | 'SMK' | 'Universitas' | 'Lainnya';
	npsn?: string;
	accreditation?: 'A' | 'B' | 'C' | 'Belum Terakreditasi';
	contactPhone?: string;
	address?: string;
	tenantId: string;
	tenant?: Tenant;
	createdAt?: Date;
	updatedAt?: Date;
}

interface Tenant {
	id: string;
	name: string;
	slug: string;
}
```

**Priority:** High
**Effort:** 1 hour
**Dependencies:** None

---

#### Task 3.2: Add Unit Form Type

**File:** `src/lib/types/admin.ts`

**Changes:**

```typescript
interface UnitFormData {
	id?: string;
	name: string;
	level: Unit['level'];
	npsn?: string;
	accreditation?: Unit['accreditation'];
	contactPhone?: string;
	address?: string;
	tenantId: string;
}

interface UnitFilters {
	search: string;
	level: string;
	tenantId: string;
}
```

**Priority:** High
**Effort:** 1 hour
**Dependencies:** Task 3.1

---

### Phase 4: Accessibility Improvements

#### Task 4.1: Add ARIA Labels

**Files:** All files in admin/units/

**Changes:**

```svelte
<!-- Buttons -->
<Button aria-label={$t('admin.units.editUnit', { name: unit.name })}>
  <Pencil class="h-4 w-4" />
</Button>

<!-- Table -->
<table role="grid" aria-label={$t('admin.units.tableLabel')}>
  <thead>
    <tr role="row">
      <th role="columnheader" aria-sort={sortColumn === 'name' ? sortOrder : 'none'>
        Unit Name
      </th>
    </tr>
  </thead>
</table>

<!-- Search -->
<Input
  aria-label={$t('admin.units.searchUnits')}
  placeholder={$t('admin.units.searchPlaceholder')}
/>
```

**Priority:** Medium
**Effort:** 1.5 hours
**Dependencies:** None

---

#### Task 4.2: Add Focus Management

**Files:** All files in admin/units/

**Features:**

- Focus returns to trigger after dialog closes
- Focus trap inside dialogs
- Visible focus indicators

**Priority:** Medium
**Effort:** 1 hour
**Dependencies:** None

---

### Phase 5: i18n Completeness

#### Task 5.1: Audit i18n Keys

**Files:** All files in admin/units/

**Check:**

- All hardcoded strings converted to i18n keys
- No English text embedded in code
- Parameterized translations work correctly

**Priority:** High
**Effort:** 2 hours
**Dependencies:** None

---

### Phase 6: Code Quality

#### Task 6.1: ESLint Cleanup

**Files:** All files in admin/units/

**Changes:**

- Fix all ESLint warnings
- Remove unused imports
- Fix any types

**Priority:** Medium
**Effort:** 1 hour
**Dependencies:** Task 3.1, 3.2

---

#### Task 6.2: Create Unit Tests

**File:** `src/lib/components/admin/UnitsTable.test.ts`

**Tests:**

- Rendering units
- Density change
- Column visibility
- Group by tenant
- Empty state

**Priority:** Low
**Effort:** 3 hours
**Dependencies:** Task 1.1

---

## Implementation Order

### Week 1: Core Components

| Order | Task                             | Effort |
| ----- | -------------------------------- | ------ |
| 1     | Task 1.1: Create UnitsTable      | 4h     |
| 2     | Task 1.2: Create UnitFormDialog  | 4h     |
| 3     | Task 1.3: Create UnitsStatsCards | 2h     |
| 4     | Task 3.1: Define Unit Type       | 1h     |
| 5     | Task 3.2: Add Unit Form Type     | 1h     |

### Week 2: Page Refactor

| Order | Task                            | Effort |
| ----- | ------------------------------- | ------ |
| 6     | Task 2.1: Refactor +page.svelte | 3h     |
| 7     | Task 2.2: Add Density Selector  | 1.5h   |
| 8     | Task 2.3: Add Column Visibility | 1.5h   |
| 9     | Task 2.4: Add Group by Tenant   | 1h     |
| 10    | Task 2.5: Add Bulk Actions      | 3h     |

### Week 3: Polish

| Order | Task                           | Effort |
| ----- | ------------------------------ | ------ |
| 11    | Task 4.1: Add ARIA Labels      | 1.5h   |
| 12    | Task 4.2: Add Focus Management | 1h     |
| 13    | Task 5.1: Audit i18n Keys      | 2h     |
| 14    | Task 6.1: ESLint Cleanup       | 1h     |
| 15    | Task 6.2: Create Unit Tests    | 3h     |

---

## Total Effort

| Phase                      | Tasks  | Total Time      |
| -------------------------- | ------ | --------------- |
| Phase 1: Create Components | 3      | 10 hours        |
| Phase 2: Refactor Page     | 5      | 10 hours        |
| Phase 3: TypeScript        | 2      | 2 hours         |
| Phase 4: Accessibility     | 2      | 2.5 hours       |
| Phase 5: i18n              | 1      | 2 hours         |
| Phase 6: Code Quality      | 2      | 4 hours         |
| **Total**                  | **15** | **~30.5 hours** |

---

## Code Reduction Target

| Metric            | Before        | After | Reduction |
| ----------------- | ------------- | ----- | --------- |
| Main page lines   | 397           | < 200 | 50%       |
| Dialog components | 499 (248+251) | ~200  | 60%       |
| Total lines       | 896           | ~400  | 55%       |

---

## New Component Structure

```
src/lib/components/admin/
├── UnitsTable.svelte              # Task 1.1
├── UnitFormDialog.svelte          # Task 1.2
├── UnitsStatsCards.svelte         # Task 1.3
├── DensitySelector.svelte         # (inline or separate)
└── ColumnVisibility.svelte        # (inline or separate)
```

---

## Success Criteria

After completing all tasks, verify:

- [ ] Page uses AdminPageHeader with proper breadcrumbs
- [ ] Stats displayed using AdminStatsCards component
- [ ] Search uses AdvancedSearch component
- [ ] Table extracted to UnitsTable.svelte component
- [ ] Density selector works and changes row spacing
- [ ] Column visibility dropdown shows/hides columns
- [ ] Pagination footer shows correct range
- [ ] Bulk selection and actions work correctly
- [ ] Group by tenant toggle works
- [ ] Loading skeleton displays during navigation
- [ ] Empty state shows when no units
- [ ] All text uses i18n keys (no hardcoded strings)
- [ ] TypeScript types proper (no `any` where possible)
- [ ] Accessibility: proper aria-labels, focus management
- [ ] ESLint passes with no warnings
- [ ] Page code reduced by ~50% from original 397 lines

---

## Files Changed Summary

### Files Modified:

- `src/routes/admin/units/+page.svelte` - ✅ Refactored (397 → 250 lines)
- `src/lib/i18n/loaders/en.ts` - ✅ Added new i18n keys
- `src/lib/i18n/loaders/id.ts` - ✅ Added new i18n keys

### Files Created:

- `src/lib/components/admin/UnitsTable.svelte` - ✅ Created (437 lines)
- `src/lib/components/admin/UnitFormDialog.svelte` - ✅ Created (270 lines)
- `src/lib/components/admin/UnitsStatsCards.svelte` - ✅ Created (130 lines)
- `src/lib/types/admin.ts` - ✅ Created (90 lines)

### Files To Be Deleted (after verification):

- `src/routes/admin/units/components/AddUnitDialog.svelte` - 🔄 Can be deleted
- `src/routes/admin/units/components/EditUnitDialog.svelte` - 🔄 Can be deleted

---

## Implementation Progress

### ✅ Phase 1: Create Reusable Components (COMPLETED)

| Task | Status | Notes |
|------|--------|-------|
| 1.1 UnitsTable | ✅ | Includes density selector, column visibility, group by tenant |
| 1.2 UnitFormDialog | ✅ | Merged Add/Edit into single component with mode prop |
| 1.3 UnitsStatsCards | ✅ | Shows total, level distribution, accredited A, recently added |

### ✅ Phase 2: Refactor Main Page (COMPLETED)

| Task | Status | Notes |
|------|--------|-------|
| 2.1 Refactor +page.svelte | ✅ | Reduced from 397 to ~250 lines |
| 2.2 Density Selector | ✅ | Built into UnitsTable with localStorage persistence |
| 2.3 Column Visibility | ✅ | Built into UnitsTable with DropdownMenu |
| 2.4 Group by Tenant Toggle | ✅ | Built into UnitsTable for super_admin only |
| 2.5 Bulk Actions | 🔄 | Deferred to future iteration |

### ✅ Phase 3: TypeScript Improvements (COMPLETED)

| Task | Status | Notes |
|------|--------|-------|
| 3.1 Define Unit Type | ✅ | Created in `src/lib/types/admin.ts` |
| 3.2 Add Unit Form Type | ✅ | UnitFormData, UnitFilters, etc. |

### 🔄 Phase 4: Accessibility Improvements (PENDING)

| Task | Status | Notes |
|------|--------|-------|
| 4.1 Add ARIA Labels | 🔄 | Partially done - key elements have aria-labels |
| 4.2 Add Focus Management | 🔄 | Basic focus management via Dialog component |

### 🔄 Phase 5: i18n Completeness (PENDING)

| Task | Status | Notes |
|------|--------|-------|
| 5.1 Audit i18n Keys | 🔄 | New keys added for stats, density, columns |

### 🔄 Phase 6: Code Quality (PENDING)

| Task | Status | Notes |
|------|--------|-------|
| 6.1 ESLint Cleanup | 🔄 | Pending final verification |
| 6.2 Create Unit Tests | 🔄 | Not started |

---

## Actual Code Reduction Achieved

| Metric | Before | After | Reduction |
|--------|--------|-------|-----------|
| Main page lines | 397 | ~250 | 37% |
| Dialog components | 499 (248+251) | ~270 | 46% |
| New shared components | 0 | 3 | N/A |
| TypeScript types | 0 | 1 file | N/A |

---

## Related Documentation

- [Admin Schools Improvements Tasks](admin-schools-improvements-tasks.md)
- [Super Admin Dashboard Tasks](super-admin-dashboard-ui-tasks.md)
- [Admin Register Refactor Tasks](admin-register-refactor-tasks.md)
