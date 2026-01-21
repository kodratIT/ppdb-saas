# Super Admin Dashboard UI/UX Improvement Tasks

**Goal:** Refactor super admin dashboard components to use shadcn/ui and make them reusable across the application.

**Status:** Planning
**Created:** 2026-01-21

---

## Overview

Current state of super admin dashboard:

- `DashboardHeader.svelte` - ❌ Custom implementation, not using shadcn
- `DashboardSidebar.svelte` - ❌ Custom implementation, not using shadcn
- `/admin/+page.svelte` - ✅ Already using shadcn components
- `/admin/schools/+page.svelte` - ✅ Already using shadcn components

### Available shadcn components in project:

- Button, Card, Input, Badge, Table
- Dialog, DropdownMenu, Alert, Progress
- Checkbox, RadioGroup, Label, Textarea
- Skeleton, NativeSelect

---

## Task List

### Phase 1: Create Reusable Admin UI Components

#### Task 1.1: Create AdminSearch Component

**File:** `src/lib/components/admin/AdminSearch.svelte`

**Description:** Create a reusable search input component for admin pages.

**Requirements:**

- Wrapper around shadcn Input component
- Built-in search icon (lucide-svelte)
- Optional debounce functionality
- Consistent styling with admin theme
- Support for placeholder text customization

**Props:**

```typescript
interface Props {
	placeholder?: string;
	value?: string;
	onchange?: (value: string) => void;
	delay?: number;
	class?: string;
}
```

**Priority:** High
**Estimated Effort:** 1 hour

---

#### Task 1.2: Create AdminNotification Component

**File:** `src/lib/components/admin/AdminNotification.svelte`

**Description:** Create a notification bell component with badge indicator.

**Requirements:**

- Bell icon button (lucide-svelte)
- Unread count badge (red dot or number)
- Click handler for notification panel
- Accessible with proper ARIA labels
- Support for dropdown of notifications

**Props:**

```typescript
interface Props {
	count?: number;
	onClick?: () => void;
	class?: string;
}
```

**Priority:** High
**Estimated Effort:** 1 hour

---

#### Task 1.3: Create AdminUserMenu Component

**File:** `src/lib/components/admin/AdminUserMenu.svelte`

**Description:** Create a user dropdown menu component for the admin header.

**Requirements:**

- User avatar/icon
- User name and role display
- Dropdown menu with actions:
  - Profile
  - Settings
  - Sign out
- Support for impersonation indicator
- Use shadcn DropdownMenu components

**Props:**

```typescript
interface Props {
	userName?: string;
	userRole?: string;
	isImpersonating?: boolean;
	onSignOut?: () => void;
	class?: string;
}
```

**Priority:** High
**Estimated Effort:** 1.5 hours

---

#### Task 1.4: Create AdminBreadcrumb Component

**File:** `src/lib/components/admin/AdminBreadcrumb.svelte`

**Description:** Create a reusable breadcrumb navigation component.

**Requirements:**

- Accept array of breadcrumb items
- Automatic current page detection (optional)
- Separator styling (slash or chevron)
- Link support for non-current items
- Responsive truncation

**Props:**

```typescript
interface BreadcrumbItem {
	label: string;
	href?: string;
}

interface Props {
	items: BreadcrumbItem[];
	class?: string;
}
```

**Priority:** Medium
**Estimated Effort:** 1 hour

---

#### Task 1.5: Create AdminPageHeader Component

**File:** `src/lib/components/admin/AdminPageHeader.svelte`

**Description:** Create a standardized page header component for admin pages.

**Requirements:**

- Title
- Description/subtitle
- Action buttons (right side)
- Breadcrumbs integration
- Date display (optional)

**Props:**

```typescript
interface Props {
	title: string;
	description?: string;
	actions?: Snippet;
	breadcrumbs?: BreadcrumbItem[];
	showDate?: boolean;
	class?: string;
}
```

**Priority:** Medium
**Estimated Effort:** 1.5 hours

---

#### Task 1.6: Create AdminNavItem Component

**File:** `src/lib/components/admin/AdminNavItem.svelte`

**Description:** Create a reusable navigation item component for sidebar.

**Requirements:**

- Icon support (lucide-svelte)
- Active state styling
- Hover effects
- Badge support (for notifications, etc.)
- Accessible navigation link

**Props:**

```typescript
interface Props {
	name: string;
	icon: Component;
	href: string;
	isActive?: boolean;
	badge?: string | number;
	class?: string;
}
```

**Priority:** High
**Estimated Effort:** 1 hour

---

#### Task 1.7: Create AdminSidebarGroup Component

**File:** `src/lib/components/admin/AdminSidebarGroup.svelte`

**Description:** Create a grouped navigation section for sidebar.

**Requirements:**

- Group title with proper styling
- List of navigation items
- Collapsible option (optional)
- Proper spacing and separators

**Props:**

```typescript
interface Props {
	group: {
		name: string;
		items: NavItem[];
	};
	class?: string;
}
```

**Priority:** Medium
**Estimated Effort:** 1 hour

---

### Phase 2: Refactor Dashboard Components

#### Task 2.1: Refactor DashboardHeader.svelte

**File:** `src/lib/components/admin/DashboardHeader.svelte`

**Description:** Refactor the admin dashboard header to use shadcn components and reusable admin components.

**Current Implementation:** 85 lines, custom styling

**Requirements:**

- Replace custom search with AdminSearch
- Replace notification bell with AdminNotification
- Replace user menu with AdminUserMenu
- Keep breadcrumbs functionality (or use AdminBreadcrumb)
- Maintain impersonation indicator
- Responsive design (mobile hamburger menu support)

**Changes:**

```svelte
<!-- Before -->
<input
	type="text"
	placeholder="Search anything..."
	class="h-10 w-full rounded-full border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm transition-all..."
/>

<!-- After -->
<AdminSearch placeholder="Search anything..." bind:value={searchQuery} onchange={handleSearch} />
```

**Priority:** High
**Estimated Effort:** 2 hours

**Dependencies:** Task 1.1, 1.2, 1.3, 1.4

---

#### Task 2.2: Refactor DashboardSidebar.svelte

**File:** `src/lib/components/admin/DashboardSidebar.svelte`

**Description:** Refactor the admin dashboard sidebar to use shadcn components and reusable admin components.

**Current Implementation:** 189 lines, custom styling with dark blue theme

**Requirements:**

- Replace custom nav items with AdminNavItem
- Use consistent color scheme with shadcn theme
- Maintain mobile responsive behavior
- Keep logo area styling
- Maintain group structure (Main, Management, Subscription, Analytics, System)
- Keep sign out functionality
- Improve accessibility

**Changes:**

```svelte
<!-- Before -->
<a
	href={item.href}
	class="group flex items-center justify-between rounded-xl px-3 py-2.5 transition-all duration-200 hover:bg-white/5 hover:text-white..."
>
	<div class="flex items-center gap-3">
		<item.icon class="h-5 w-5..." />
		<span class="text-sm font-medium">{item.name}</span>
	</div>
</a>

<!-- After -->
<AdminNavItem name={item.name} icon={item.icon} href={item.href} {isActive} />
```

**Priority:** High
**Estimated Effort:** 2.5 hours

**Dependencies:** Task 1.6, 1.7

---

#### Task 2.3: Create AdminLayout Component

**File:** `src/lib/components/admin/AdminLayout.svelte`

**Description:** Create a wrapper layout component combining header and sidebar.

**Requirements:**

- Combine DashboardHeader and DashboardSidebar
- Main content area slot
- Consistent spacing and layout
- Responsive handling (sidebar collapse on mobile)
- Proper z-index management for mobile overlay

**Props:**

```typescript
interface Props {
	children: Snippet;
	breadcrumbs?: BreadcrumbItem[];
}
```

**Priority:** Medium
**Estimated Effort:** 2 hours

**Dependencies:** Task 2.1, 2.2

---

### Phase 3: Update Admin Pages

#### Task 3.1: Update /admin/+page.svelte

**File:** `src/routes/admin/+page.svelte`

**Description:** Update admin dashboard page to use new components.

**Current Status:** Already using shadcn, but can be improved.

**Changes:**

- Replace inline page header with AdminPageHeader
- Use AdminSearch for search functionality (if needed)
- Ensure consistent styling throughout

**Priority:** Low
**Estimated Effort:** 30 minutes

---

#### Task 3.2: Update /admin/schools/+page.svelte

**File:** `src/routes/admin/schools/+page.svelte`

**Description:** Update schools management page to use new components.

**Current Status:** Already using shadcn, but can be improved.

**Changes:**

- Replace inline page header with AdminPageHeader
- Use AdminSearch for search input
- Use AdminNotification for any notifications
- Update any inline button styles to use AdminButton variants

**Priority:** Low
**Estimated Effort:** 45 minutes

---

#### Task 3.3: Audit and Update Other Admin Pages

**File:** Multiple files in `/src/routes/admin/`

**Description:** Audit all admin pages and update them to use the new components.

**Pages to Update:**

- `/admin/broadcast/+page.svelte`
- `/admin/units/+page.svelte`
- `/admin/settings/+page.svelte`
- `/admin/verification/+page.svelte`
- `/admin/plans/+page.svelte`
- `/admin/reports/+page.svelte`
- `/admin/users/+page.svelte`
- `/admin/roles/+page.svelte`
- `/admin/health/+page.svelte`
- `/admin/audit-logs/+page.svelte`
- `/admin/payouts/+page.svelte`
- `/admin/announcements/+page.svelte`

**Priority:** Low
**Estimated Effort:** 4 hours (15 minutes per page)

---

### Phase 4: Documentation and Cleanup

#### Task 4.1: Create Admin Components Documentation

**File:** `/docs/admin-components.md`

**Description:** Document all new admin components with usage examples.

**Content:**

- Component list with descriptions
- Props documentation
- Usage examples
- Best practices

**Priority:** Low
**Estimated Effort:** 2 hours

---

#### Task 4.2: Clean Up Deprecated Code

**File:** Multiple locations

**Description:** Remove any duplicate or unused code after refactoring.

**Tasks:**

- Remove inline styles moved to components
- Remove duplicate icon imports
- Clean up any unused props or state

**Priority:** Low
**Estimated Effort:** 1 hour

---

## Component Library Structure

After implementation, the admin component library will be:

```
src/lib/components/admin/
├── AdminLayout.svelte          # Main layout wrapper
├── AdminPageHeader.svelte      # Page title/description/-actions
├── AdminBreadcrumb.svelte      # Navigation breadcrumbs
├── AdminSearch.svelte          # Search input with icon
├── AdminNotification.svelte    # Bell icon with badge
├── AdminUserMenu.svelte        # User dropdown menu
├── DashboardHeader.svelte      # (Refactored) Top header
├── DashboardSidebar.svelte     # (Refactored) Side navigation
├── AdminNavItem.svelte         # Individual nav item
├── AdminSidebarGroup.svelte    # Grouped nav section
└── KPICard.svelte              # Existing - KPI metrics card
```

---

## Estimated Total Effort

| Phase                        | Tasks  | Estimated Hours |
| ---------------------------- | ------ | --------------- |
| Phase 1: Create Components   | 7      | 8 hours         |
| Phase 2: Refactor Components | 3      | 6.5 hours       |
| Phase 3: Update Pages        | 3      | 6 hours         |
| Phase 4: Documentation       | 2      | 3 hours         |
| **Total**                    | **15** | **~24 hours**   |

---

## Implementation Order

1. **Week 1:**
   - Task 1.1 (AdminSearch)
   - Task 1.2 (AdminNotification)
   - Task 1.3 (AdminUserMenu)
   - Task 2.1 (DashboardHeader refactor)

2. **Week 2:**
   - Task 1.6 (AdminNavItem)
   - Task 1.7 (AdminSidebarGroup)
   - Task 2.2 (DashboardSidebar refactor)

3. **Week 3:**
   - Task 1.4 (AdminBreadcrumb)
   - Task 1.5 (AdminPageHeader)
   - Task 2.3 (AdminLayout)

4. **Week 4:**
   - Task 3.1-3.3 (Update admin pages)
   - Task 4.1-4.2 (Documentation and cleanup)

---

## Success Criteria

- [ ] All admin pages use consistent shadcn-styled components
- [ ] No duplicate code between admin pages
- [ ] All components are properly typed with TypeScript
- [ ] Components are accessible (WCAG 2.1 AA)
- [ ] Responsive design works on mobile and tablet
- [ ] Documentation is complete and accurate
- [ ] No regression in existing functionality

---

## Related Files

**Modified:**

- `src/lib/components/admin/DashboardHeader.svelte`
- `src/lib/components/admin/DashboardSidebar.svelte`
- All files in `src/routes/admin/`

**Created:**

- `src/lib/components/admin/AdminSearch.svelte`
- `src/lib/components/admin/AdminNotification.svelte`
- `src/lib/components/admin/AdminUserMenu.svelte`
- `src/lib/components/admin/AdminBreadcrumb.svelte`
- `src/lib/components/admin/AdminPageHeader.svelte`
- `src/lib/components/admin/AdminNavItem.svelte`
- `src/lib/components/admin/AdminSidebarGroup.svelte`
- `src/lib/components/admin/AdminLayout.svelte`

**Documentation:**

- `/docs/admin-components.md`
