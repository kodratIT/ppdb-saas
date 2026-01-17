<script lang="ts">
	import Modal from '$lib/components/ui/modal.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import Input from '$lib/components/ui/input.svelte';
	import Label from '$lib/components/ui/label.svelte';
	import { Plus, Trash2, GripVertical, Info } from 'lucide-svelte';

	let {
		field = $bindable(),
		open = $bindable(),
		onsave
	}: { field: Record<string, unknown>; open: boolean; onsave: () => void } = $props();

	// Local state for editing
	let editedField = $state<Record<string, unknown> | null>(null);

	// Sync local state when modal opens or field changes
	$effect(() => {
		if (open && field) {
			editedField = JSON.parse(JSON.stringify(field));
		}
	});

	function save() {
		field = JSON.parse(JSON.stringify(editedField));
		onsave();
		open = false;
	}

	function addOption() {
		if (!editedField.options) editedField.options = [];
		editedField.options.push({ label: '', value: '', order: editedField.options.length });
	}

	function removeOption(index: number) {
		editedField.options = editedField.options.filter((_: unknown, i: number) => i !== index);
	}
</script>

<Modal {open} title="Field Configuration" onClose={() => (open = false)}>
	{#if editedField}
		<div class="grid gap-5 py-2">
			<div class="grid gap-1.5">
				<Label for="label">Display Label</Label>
				<Input id="label" bind:value={editedField.label} placeholder="e.g., Full Name" />
			</div>

			<div class="grid gap-1.5">
				<div class="flex items-center gap-2">
					<Label for="key">Field Key (API Name)</Label>
					<Info size={12} class="text-slate-400" />
				</div>
				<Input
					id="key"
					bind:value={editedField.key}
					placeholder="e.g., full_name"
					class="font-mono text-xs"
				/>
			</div>

			<div class="grid grid-cols-2 gap-4">
				<div class="grid gap-1.5">
					<Label for="placeholder">Placeholder</Label>
					<Input
						id="placeholder"
						bind:value={editedField.placeholder}
						placeholder="Type something..."
					/>
				</div>
				<div class="flex items-end pb-2">
					<label class="flex items-center gap-2 cursor-pointer">
						<input
							type="checkbox"
							bind:checked={editedField.required}
							class="rounded border-slate-300 text-primary focus:ring-primary"
						/>
						<span class="text-sm font-medium">Required</span>
					</label>
				</div>
			</div>

			<div class="grid gap-1.5">
				<Label for="helpText">Help Text</Label>
				<textarea
					id="helpText"
					bind:value={editedField.helpText}
					placeholder="Provide more context..."
					class="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
				></textarea>
			</div>

			{#if ['select', 'radio', 'checkbox'].includes(editedField.fieldType)}
				<div class="space-y-3 border-t pt-4">
					<div class="flex items-center justify-between">
						<Label class="text-xs font-bold uppercase tracking-wider text-slate-500">Options</Label>
						<Button
							variant="outline"
							size="sm"
							class="h-7 gap-1 px-2 text-[10px]"
							onclick={addOption}
						>
							<Plus size={12} />
							Add Option
						</Button>
					</div>

					<div class="max-h-[160px] space-y-2 overflow-y-auto pr-1 custom-scrollbar">
						{#if editedField.options?.length > 0}
							{#each editedField.options as option, i (i)}
								<div class="flex items-center gap-2">
									<div class="text-slate-300">
										<GripVertical size={12} />
									</div>
									<Input placeholder="Label" bind:value={option.label} class="h-8 text-xs" />
									<Input
										placeholder="Value"
										bind:value={option.value}
										class="h-8 font-mono text-xs"
									/>
									<button
										class="text-slate-400 hover:text-rose-600 transition-colors"
										onclick={() => removeOption(i)}
									>
										<Trash2 size={14} />
									</button>
								</div>
							{/each}
						{:else}
							<div
								class="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 py-4 text-slate-400"
							>
								<p class="text-[10px]">No options added yet.</p>
							</div>
						{/if}
					</div>
				</div>
			{/if}

			<div class="flex justify-end gap-2 mt-4">
				<Button variant="ghost" onclick={() => (open = false)}>Cancel</Button>
				<Button onclick={save}>Save Changes</Button>
			</div>
		</div>
	{/if}
</Modal>

<style>
	.custom-scrollbar::-webkit-scrollbar {
		width: 4px;
	}
	.custom-scrollbar::-webkit-scrollbar-track {
		background: transparent;
	}
	.custom-scrollbar::-webkit-scrollbar-thumb {
		background: #e2e8f0;
		border-radius: 10px;
	}
</style>
