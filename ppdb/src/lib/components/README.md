# Component Library

Reusable UI components for PPDB SAAS application. All components are built with SvelteKit + Svelte 5, TypeScript, and Tailwind CSS.

## Table of Contents

- [Modal Component](#modal-component)
- [Dialog Component](#dialog-component)
- [Badge Component](#badge-component)
- [Form Components](#form-components)
- [Migration Guide](#migration-guide)
- [Best Practices](#best-practices)

---

## Modal Component

Location: `src/lib/components/ui/modal.svelte`

A flexible modal component with support for variants, action buttons, and accessibility features.

### Props

```typescript
interface Props {
	open?: boolean; // Controls modal visibility
	title?: string; // Modal title
	onClose?: () => void; // Called when modal should close
	variant?: 'default' | 'destructive' | 'success'; // Visual variant
	actions?: {
		// Optional action buttons
		confirm?: {
			label: string;
			onClick: () => void;
			variant?: 'default' | 'destructive' | 'outline' | 'secondary';
			disabled?: boolean;
		};
		cancel?: {
			label: string;
			onClick: () => void;
			variant?: 'default' | 'destructive' | 'outline' | 'secondary';
			disabled?: boolean;
		};
	};
	class?: string; // Additional CSS classes
	children?: any; // Slot content
}
```

### Basic Usage

```svelte
<script>
	import { Modal } from '$lib/components/ui';

	let showModal = $state(false);
</script>

<button onclick={() => (showModal = true)}>Open Modal</button>

<Modal open={showModal} title="Edit Profile" onClose={() => (showModal = false)}>
	<p>Modal content goes here</p>
</Modal>
```

### With Action Buttons

```svelte
<Modal
	open={showModal}
	title="Confirm Action"
	variant="destructive"
	actions={{
		confirm: {
			label: 'Delete',
			onClick: handleDelete,
			variant: 'destructive'
		},
		cancel: {
			label: 'Cancel',
			onClick: () => (showModal = false)
		}
	}}
>
	<p>Are you sure you want to delete this item?</p>
</Modal>
```

### Variants

- `default` - Standard modal with default border
- `destructive` - Red border and accent for dangerous actions
- `success` - Green border and accent for success messages

### Accessibility Features

- Click outside to close
- ESC key to close
- Proper ARIA attributes (`role="dialog"`, `aria-modal="true"`)
- Focus management
- Close button with `aria-label`

---

## Dialog Component

Location: `src/lib/components/ui/dialog.svelte`

A simplified confirmation dialog component built on top of Modal. Perfect for simple yes/no confirmations.

### Props

```typescript
interface Props {
	open?: boolean;
	title: string;
	message: string;
	variant?: 'default' | 'destructive' | 'success';
	confirmLabel?: string; // Default: 'Confirm'
	cancelLabel?: string; // Default: 'Cancel'
	onConfirm?: () => void;
	onCancel?: () => void;
	confirmDisabled?: boolean;
}
```

### Usage

```svelte
<script>
	import { Dialog } from '$lib/components/ui';

	let showDeleteDialog = $state(false);

	async function handleDelete() {
		await deleteItem();
		showDeleteDialog = false;
	}
</script>

<Dialog
	open={showDeleteDialog}
	title="Delete Item?"
	message="This action cannot be undone. Are you sure you want to delete this item?"
	variant="destructive"
	confirmLabel="Yes, delete"
	cancelLabel="No, keep it"
	onConfirm={handleDelete}
	onCancel={() => (showDeleteDialog = false)}
/>
```

---

## Badge Component

Location: `src/lib/components/ui/badge.svelte`

Versatile badge component with semantic variants for statuses, roles, and priorities.

### Props

```typescript
interface Props extends HTMLAttributes<HTMLSpanElement> {
	variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'status' | 'role' | 'priority';
	status?: 'active' | 'inactive' | 'pending' | 'approved' | 'rejected';
	role?: 'super_admin' | 'school_admin' | 'verifier' | 'treasurer';
	priority?: 'low' | 'medium' | 'high' | 'urgent';
	children?: any;
}
```

### Basic Usage

```svelte
<script>
	import { Badge } from '$lib/components/ui';
</script>

<Badge>Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="destructive">Error</Badge>
```

### Status Badges

```svelte
<Badge variant="status" status="active">Active</Badge>
<Badge variant="status" status="inactive">Inactive</Badge>
<Badge variant="status" status="pending">Pending</Badge>
<Badge variant="status" status="approved">Approved</Badge>
<Badge variant="status" status="rejected">Rejected</Badge>
```

**Color Mapping:**

- `active` → Green (bg-green-100, text-green-800)
- `inactive` → Red (bg-red-100, text-red-800)
- `pending` → Yellow (bg-yellow-100, text-yellow-800)
- `approved` → Blue (bg-blue-100, text-blue-800)
- `rejected` → Gray (bg-gray-100, text-gray-800)

### Role Badges

```svelte
<Badge variant="role" role="super_admin">Super Admin</Badge>
<Badge variant="role" role="school_admin">School Admin</Badge>
<Badge variant="role" role="verifier">Verifier</Badge>
<Badge variant="role" role="treasurer">Treasurer</Badge>
```

**Color Mapping:**

- `super_admin` → Purple (bg-purple-500, text-white)
- `school_admin` → Blue (bg-blue-500, text-white)
- `verifier` → Green (bg-green-500, text-white)
- `treasurer` → Orange (bg-orange-500, text-white)

### Priority Badges

```svelte
<Badge variant="priority" priority="low">Low</Badge>
<Badge variant="priority" priority="medium">Medium</Badge>
<Badge variant="priority" priority="high">High</Badge>
<Badge variant="priority" priority="urgent">Urgent</Badge>
```

**Color Mapping:**

- `low` → Gray (bg-gray-100, text-gray-700)
- `medium` → Yellow (bg-yellow-100, text-yellow-800)
- `high` → Orange (bg-orange-100, text-orange-800)
- `urgent` → Red (bg-red-500, text-white)

---

## Form Components

Location: `src/lib/components/forms/`

### FormError Component

Location: `src/lib/components/forms/form-error.svelte`

Displays form validation errors with consistent styling.

```svelte
<script>
	import FormError from '$lib/components/forms/form-error.svelte';
</script>

<FormError message="This field is required" />
```

---

## Migration Guide

### Migrating from Custom Badge Functions

**Before:**

```svelte
<script>
	function getStatusBadgeColor(status: string): string {
		switch (status) {
			case 'active':
				return 'bg-green-100 text-green-800';
			case 'inactive':
				return 'bg-red-100 text-red-800';
			default:
				return 'bg-gray-100 text-gray-800';
		}
	}
</script>

<span class={getStatusBadgeColor(item.status) + ' px-2 py-1 rounded-full text-xs'}>
	{item.status}
</span>
```

**After:**

```svelte
<script>
	import { Badge } from '$lib/components/ui';
</script>

<Badge variant="status" status={item.status}>
	{item.status}
</Badge>
```

### Migrating from Inline Modals

**Before:**

```svelte
{#if showModal}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
		<div class="bg-white rounded-lg p-6 max-w-md">
			<h2>Modal Title</h2>
			<p>Content</p>
			<button onclick={() => (showModal = false)}>Close</button>
		</div>
	</div>
{/if}
```

**After:**

```svelte
<script>
	import { Modal } from '$lib/components/ui';
</script>

<Modal
	open={showModal}
	title="Modal Title"
	onClose={() => (showModal = false)}
	actions={{
		cancel: { label: 'Close', onClick: () => (showModal = false) }
	}}
>
	<p>Content</p>
</Modal>
```

---

## Best Practices

### 1. Use Semantic Variants

Prefer semantic variants over custom styling:

```svelte
<!-- Good -->
<Badge variant="status" status="active">Active</Badge>

<!-- Avoid -->
<Badge class="bg-green-100 text-green-800">Active</Badge>
```

### 2. Consistent Button Patterns

Use the `actions` prop for consistent button layouts:

```svelte
<Modal
	title="Confirm"
	actions={{
		confirm: { label: 'Save', onClick: handleSave },
		cancel: { label: 'Cancel', onClick: handleCancel }
	}}
>
	<!-- content -->
</Modal>
```

### 3. Accessibility

- Always provide `onClose` handlers for modals
- Use descriptive button labels (not just "OK" or "Yes")
- Prefer Dialog component for simple confirmations

### 4. Testing

All components have comprehensive unit tests. When extending components:

- Write tests first (TDD)
- Test user interactions (clicks, keyboard)
- Test accessibility features
- Test all variants

---

## Component Index

### UI Components (`src/lib/components/ui/`)

- `alert.svelte` - Alert messages
- `badge.svelte` - Status, role, and priority badges
- `button.svelte` - Button component
- `card.svelte` - Card container
- `dialog.svelte` - Confirmation dialogs
- `input.svelte` - Text input
- `label.svelte` - Form label
- `modal.svelte` - Modal dialogs
- `progress.svelte` - Progress bar
- `select.svelte` - Select dropdown
- `textarea.svelte` - Textarea input

### Form Components (`src/lib/components/forms/`)

- `form-error.svelte` - Form error messages

---

## Contributing

When adding new components:

1. **Create component file** in appropriate directory
2. **Write tests first** (`tests/unit/components/<name>.test.ts`)
3. **Implement component** with TypeScript types
4. **Export from index** (`src/lib/components/ui/index.ts`)
5. **Document usage** in this README
6. **Add examples** for common use cases

Follow existing patterns:

- Use Svelte 5 `$props()` syntax
- TypeScript for all props
- Tailwind CSS for styling
- Testing Library for tests
- Accessibility features (ARIA, keyboard support)
