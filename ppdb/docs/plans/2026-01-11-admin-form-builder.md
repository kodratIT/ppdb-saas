# Admin Form Builder Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a drag-and-drop form builder interface for admins using Svelte 5 and `svelte-dnd-action`.

**Architecture:** A centralized state managed via Svelte 5 runes (`$state`, `$derived`) in the main page, passing down data and callbacks to specialized components.

**Tech Stack:** Svelte 5, Tailwind CSS, Shadcn (Select, Button, Input, Dialog/Modal), `svelte-dnd-action`, `lucide-svelte`.

### Task 1: Setup Main Page and State

**Files:**

- Create: `src/routes/[tenant]/admin/form-builder/[admissionPathId]/+page.svelte`

**Step 1: Scaffolding with basic state**

```svelte
<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import FieldPalette from '$lib/components/admin/form-builder/FieldPalette.svelte';
	import FormCanvas from '$lib/components/admin/form-builder/FormCanvas.svelte';
	import { Button } from '$lib/components/ui/button';

	let { data } = $props();
	let admissionPathId = $derived(page.params.admissionPathId);
	let currentStep = $state(1);
	let fields = $state<any[]>([]);
	let isLoading = $state(true);

	async function loadFields() {
		isLoading = true;
		const res = await fetch(`/api/admin/form-builder/${admissionPathId}?step=${currentStep}`);
		if (res.ok) {
			fields = await res.json();
		}
		isLoading = false;
	}

	onMount(loadFields);
</script>

<div class="flex h-screen flex-col overflow-hidden bg-gray-50">
	<header class="flex h-16 items-center justify-between border-b bg-white px-6">
		<h1 class="text-xl font-bold">Form Builder</h1>
		<div class="flex items-center gap-4">
			<Button variant="outline">Preview</Button>
			<Button onclick={() => console.log('Save all')}>Save Changes</Button>
		</div>
	</header>

	<main class="flex flex-1 overflow-hidden">
		<FieldPalette />
		<div class="flex flex-1 flex-col overflow-hidden">
			<!-- Step Switcher Placeholder -->
			<div class="border-b bg-white p-4">
				<div class="flex gap-2">
					{#each [1, 2, 3, 4] as step}
						<button
							class="rounded px-4 py-2 {currentStep === step
								? 'bg-primary text-white'
								: 'bg-gray-100'}"
							onclick={() => {
								currentStep = step;
								loadFields();
							}}
						>
							Step {step}
						</button>
					{/each}
				</div>
			</div>

			<div class="flex-1 overflow-y-auto p-8">
				{#if isLoading}
					<div class="flex h-full items-center justify-center">Loading...</div>
				{:else}
					<FormCanvas {fields} onchange={(newFields) => (fields = newFields)} />
				{/if}
			</div>
		</div>
	</main>
</div>
```

**Step 2: Commit**

```bash
git add src/routes/[tenant]/admin/form-builder/[admissionPathId]/+page.svelte
git commit -m "feat: add form builder page scaffold"
```

### Task 2: Implement Field Palette

**Files:**

- Create: `src/lib/components/admin/form-builder/FieldPalette.svelte`

**Step 1: Create draggable field types**

```svelte
<script lang="ts">
	import { dndzone, SOURCES, TRIGGERS } from 'svelte-dnd-action';
	import {
		Type,
		Hash,
		Mail,
		Phone,
		Calendar,
		List,
		CheckSquare,
		CircleDot,
		FileText,
		AlignLeft
	} from 'lucide-svelte';

	const fieldTypes = [
		{ id: 'palette-text', type: 'text', label: 'Short Text', icon: Type },
		{ id: 'palette-textarea', type: 'textarea', label: 'Long Text', icon: AlignLeft },
		{ id: 'palette-number', type: 'number', label: 'Number', icon: Hash },
		{ id: 'palette-email', type: 'email', label: 'Email', icon: Mail },
		{ id: 'palette-tel', type: 'tel', label: 'Phone', icon: Phone },
		{ id: 'palette-date', type: 'date', label: 'Date', icon: Calendar },
		{ id: 'palette-select', type: 'select', label: 'Dropdown', icon: List },
		{ id: 'palette-checkbox', type: 'checkbox', label: 'Checkbox', icon: CheckSquare },
		{ id: 'palette-radio', type: 'radio', label: 'Radio Button', icon: CircleDot },
		{ id: 'palette-file', type: 'file', label: 'File Upload', icon: FileText }
	];

	// No-op dnd handlers for palette
	function handleDndConsider() {}
	function handleDndFinalize() {}
</script>

<aside class="w-64 border-r bg-white p-4 overflow-y-auto">
	<h2 class="mb-4 font-semibold text-gray-700 uppercase text-xs">Fields</h2>
	<div
		class="grid grid-cols-2 gap-2"
		use:dndzone={{ items: fieldTypes, flipDurationMs: 0, dragDisabled: false, dropTargetStyle: {} }}
		onconsider={handleDndConsider}
		onfinalize={handleDndFinalize}
	>
		{#each fieldTypes as field (field.id)}
			<div
				class="flex cursor-move flex-col items-center justify-center rounded border bg-gray-50 p-3 hover:bg-gray-100 transition-colors"
			>
				<field.icon size={20} class="mb-2 text-gray-600" />
				<span class="text-xs text-gray-700">{field.label}</span>
			</div>
		{/each}
	</div>
</aside>
```

**Step 2: Commit**

```bash
git add src/lib/components/admin/form-builder/FieldPalette.svelte
git commit -m "feat: add field palette component"
```

### Task 3: Implement Form Canvas

**Files:**

- Create: `src/lib/components/admin/form-builder/FormCanvas.svelte`

**Step 1: Handle dropping and reordering**

```svelte
<script lang="ts">
	import { dndzone } from 'svelte-dnd-action';
	import { GripVertical, Trash2, Settings } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';

	let { fields = $bindable(), onedit } = $props();

	function handleDndConsider(e: CustomEvent<DndEvent<any>>) {
		fields = e.detail.items;
	}

	function handleDndFinalize(e: CustomEvent<DndEvent<any>>) {
		fields = e.detail.items.map((item, index) => {
			if (item.id.startsWith('palette-')) {
				return {
					id: Math.random().toString(36).substr(2, 9),
					label: 'New ' + item.label,
					fieldType: item.type,
					key: 'field_' + Math.random().toString(36).substr(2, 5),
					required: false,
					order: index
				};
			}
			return { ...item, order: index };
		});
	}

	function removeField(id: string) {
		fields = fields.filter((f) => f.id !== id);
	}
</script>

<div
	class="mx-auto max-w-2xl min-h-[500px] rounded-lg border-2 border-dashed border-gray-200 bg-white p-4 transition-colors"
	use:dndzone={{ items: fields, flipDurationMs: 200 }}
	onconsider={handleDndConsider}
	onfinalize={handleDndFinalize}
>
	{#if fields.length === 0}
		<div class="flex h-full flex-col items-center justify-center py-20 text-gray-400">
			<p>Drag fields from the sidebar and drop them here</p>
		</div>
	{/if}

	{#each fields as field (field.id)}
		<div
			class="group relative mb-3 flex items-center gap-3 rounded-md border bg-white p-4 shadow-sm hover:border-primary"
		>
			<div class="cursor-move text-gray-400">
				<GripVertical size={18} />
			</div>
			<div class="flex-1">
				<div class="font-medium">{field.label}</div>
				<div class="text-xs text-gray-500 uppercase">{field.fieldType} | {field.key}</div>
			</div>
			<div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
				<Button variant="ghost" size="icon" onclick={() => onedit(field)}>
					<Settings size={16} />
				</Button>
				<Button
					variant="ghost"
					size="icon"
					class="text-destructive"
					onclick={() => removeField(field.id)}
				>
					<Trash2 size={16} />
				</Button>
			</div>
		</div>
	{/each}
</div>
```

**Step 2: Commit**

```bash
git add src/lib/components/admin/form-builder/FormCanvas.svelte
git commit -m "feat: add form canvas with drag & drop support"
```

### Task 4: Implement Configuration Modal

**Files:**

- Create: `src/lib/components/admin/form-builder/FieldConfigModal.svelte`

**Step 1: Create dialog with form for editing field**

```svelte
<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Checkbox } from '$lib/components/ui/checkbox';

	let { field = $bindable(), open = $bindable(), onsave } = $props();
	let editedField = $state({ ...field });

	$effect(() => {
		if (open) editedField = { ...field };
	});

	function save() {
		field = { ...editedField };
		onsave();
		open = false;
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Configure Field</Dialog.Title>
		</Dialog.Header>
		<div class="grid gap-4 py-4">
			<div class="grid gap-2">
				<Label for="label">Label</Label>
				<Input id="label" bind:value={editedField.label} />
			</div>
			<div class="grid gap-2">
				<Label for="key">API Key (Internal Name)</Label>
				<Input id="key" bind:value={editedField.key} />
			</div>
			<div class="flex items-center space-x-2 pt-2">
				<Checkbox id="required" bind:checked={editedField.required} />
				<Label for="required">Required Field</Label>
			</div>

			{#if ['select', 'radio', 'checkbox'].includes(editedField.fieldType)}
				<!-- Options editor can be added here -->
				<div class="mt-2 border-t pt-4">
					<Label>Options</Label>
					<!-- ... options management ... -->
				</div>
			{/if}
		</div>
		<Dialog.Footer>
			<Button variant="outline" onclick={() => (open = false)}>Cancel</Button>
			<Button onclick={save}>Save Changes</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
```

**Step 2: Commit**

```bash
git add src/lib/components/admin/form-builder/FieldConfigModal.svelte
git commit -m "feat: add field configuration modal"
```

### Task 5: Final Integration and API Hookup

**Files:**

- Modify: `src/routes/[tenant]/admin/form-builder/[admissionPathId]/+page.svelte`

**Step 1: Connect all components and implement saving**

```svelte
// ... existing imports ...
import FieldConfigModal from '$lib/components/admin/form-builder/FieldConfigModal.svelte';

let editingField = $state<any>(null);
let isModalOpen = $state(false);

function openEdit(field: any) {
    editingField = field;
    isModalOpen = true;
}

async function saveChanges() {
    // Implement batch update/create logic via API
    // Task 2.1 API needs to be used here
}
```

**Step 2: Commit**

```bash
git add src/routes/[tenant]/admin/form-builder/[admissionPathId]/+page.svelte
git commit -m "feat: integrate form builder components and API"
```
