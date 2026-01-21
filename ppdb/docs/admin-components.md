# Admin UI Components

This document describes the reusable UI components created for the Super Admin dashboard during the UI refactoring project.

## Components

### 1. AdminPageHeader
The standard header for all admin pages.
- **Props**:
  - `title`: Page title (string)
  - `description`: Optional page description (string)
  - `breadcrumbs`: Optional array of breadcrumb items
- **Snippets**:
  - `actions`: Slot for action buttons on the right side.

### 2. AdminSearch
A reusable search input with built-in debounce.
- **Props**:
  - `placeholder`: Input placeholder (default: "Search...")
  - `value`: Bindable search value
  - `onchange`: Callback function triggered after debounce delay
  - `delay`: Debounce delay in ms (default: 300)

### 3. AdminNotification
Notification bell with unread count badge and dropdown.
- **Props**:
  - `count`: Number of unread notifications
  - `onClick`: Optional click handler for the bell

### 4. AdminUserMenu
User profile dropdown for the header.
- **Props**:
  - `userName`: Name of the current user
  - `userRole`: Role of the current user
  - `isImpersonating`: Boolean flag for impersonation state
  - `onSignOut`: Callback for sign out action

### 5. AdminBreadcrumb
Navigation breadcrumbs.
- **Props**:
  - `items`: Array of `{ label: string, href?: string }`

### 6. AdminNavItem
A single navigation link for the sidebar.
- **Props**:
  - `name`: Link name
  - `href`: Link destination
  - `icon`: Lucide icon component
  - `active`: Boolean flag for active state
  - `badge`: Optional badge text

### 7. AdminSidebarGroup
A group of navigation items in the sidebar.
- **Props**:
  - `group`: Object containing `name` and `items` (array of NavItem props)

### 8. AdminLayout
The main wrapper for admin pages.
- **Props**:
  - `children`: Page content snippet
  - `breadcrumbs`: Optional breadcrumbs to pass to the header

## Usage Example

```svelte
<script>
    import AdminPageHeader from '$lib/components/admin/AdminPageHeader.svelte';
    import { Button } from '$lib/components/ui/button';
    import { Plus } from 'lucide-svelte';
</script>

<AdminPageHeader 
    title="Example Page" 
    description="This is an example of using the new components."
>
    {#snippet actions()}
        <Button><Plus class="mr-2 h-4 w-4" /> Action</Button>
    {/snippet}
</AdminPageHeader>

<div class="space-y-6">
    <!-- Page Content -->
</div>
```
