# Modal Component Examples

## Example 1: Simple Info Modal

```svelte
<script>
	import { Modal } from '$lib/components/ui';
	let showInfo = $state(false);
</script>

<button onclick={() => (showInfo = true)}>Show Info</button>

<Modal open={showInfo} title="Welcome!" onClose={() => (showInfo = false)}>
	<p>Welcome to the PPDB SAAS platform. Get started by creating your school profile.</p>
</Modal>
```

## Example 2: Delete Confirmation Modal

```svelte
<script>
	import { Modal } from '$lib/components/ui';

	let showDelete = $state(false);
	let isDeleting = $state(false);

	async function handleDelete() {
		isDeleting = true;
		try {
			await deleteItem();
			showDelete = false;
		} finally {
			isDeleting = false;
		}
	}
</script>

<Modal
	open={showDelete}
	title="Delete Fee Structure"
	variant="destructive"
	actions={{
		confirm: {
			label: isDeleting ? 'Deleting...' : 'Delete',
			onClick: handleDelete,
			variant: 'destructive',
			disabled: isDeleting
		},
		cancel: {
			label: 'Cancel',
			onClick: () => (showDelete = false)
		}
	}}
>
	<p class="text-sm text-muted-foreground">
		Are you sure you want to delete this fee structure? This action cannot be undone and will affect
		all associated records.
	</p>
</Modal>
```

## Example 3: Form Modal with Validation

```svelte
<script>
	import { Modal } from '$lib/components/ui';
	import { Input, Label } from '$lib/components/ui';
	import FormError from '$lib/components/forms/form-error.svelte';

	let showCreate = $state(false);
	let email = $state('');
	let name = $state('');
	let error = $state('');

	async function handleSave() {
		if (!email || !name) {
			error = 'All fields are required';
			return;
		}

		try {
			await createAdmin({ email, name });
			showCreate = false;
			email = '';
			name = '';
			error = '';
		} catch (err) {
			error = err.message;
		}
	}
</script>

<Modal
	open={showCreate}
	title="Add School Admin"
	actions={{
		confirm: {
			label: 'Create Admin',
			onClick: handleSave
		},
		cancel: {
			label: 'Cancel',
			onClick: () => {
				showCreate = false;
				error = '';
			}
		}
	}}
>
	<div class="space-y-4">
		<div>
			<Label for="email">Email</Label>
			<Input id="email" type="email" bind:value={email} />
		</div>

		<div>
			<Label for="name">Name</Label>
			<Input id="name" bind:value={name} />
		</div>

		{#if error}
			<FormError message={error} />
		{/if}
	</div>
</Modal>
```

## Example 4: Success Modal

```svelte
<script>
	import { Modal } from '$lib/components/ui';
	import { goto } from '$app/navigation';

	let showSuccess = $state(false);

	async function handleSubmit() {
		await saveData();
		showSuccess = true;
	}
</script>

<Modal
	open={showSuccess}
	title="Success!"
	variant="success"
	actions={{
		confirm: {
			label: 'Continue',
			onClick: () => {
				showSuccess = false;
				goto('/dashboard');
			}
		}
	}}
>
	<p>Your changes have been saved successfully.</p>
</Modal>
```
