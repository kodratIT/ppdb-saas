<script lang="ts">
	/* eslint-disable @typescript-eslint/no-explicit-any */
	/* eslint-disable @typescript-eslint/no-unused-vars */
	import { dndzone, type DndEvent } from 'svelte-dnd-action';
	import {
		Type,
		AlignLeft,
		Hash,
		Mail,
		Phone,
		Calendar,
		ChevronDown,
		CheckSquare,
		CircleDot,
		FileUp,
		GripVertical
	} from 'lucide-svelte';

	const fieldTypes = [
		{
			id: 'palette-text',
			type: 'text',
			label: 'Short Text',
			icon: Type,
			description: 'Single line text input'
		},
		{
			id: 'palette-textarea',
			type: 'textarea',
			label: 'Long Text',
			icon: AlignLeft,
			description: 'Multi-line text area'
		},
		{
			id: 'palette-number',
			type: 'number',
			label: 'Number',
			icon: Hash,
			description: 'Numeric only input'
		},
		{
			id: 'palette-email',
			type: 'email',
			label: 'Email',
			icon: Mail,
			description: 'Email address validation'
		},
		{
			id: 'palette-tel',
			type: 'tel',
			label: 'Phone',
			icon: Phone,
			description: 'Phone number format'
		},
		{ id: 'palette-date', type: 'date', label: 'Date', icon: Calendar, description: 'Date picker' },
		{
			id: 'palette-select',
			type: 'select',
			label: 'Dropdown',
			icon: ChevronDown,
			description: 'Select from options'
		},
		{
			id: 'palette-checkbox',
			type: 'checkbox',
			label: 'Checkbox',
			icon: CheckSquare,
			description: 'Single toggle or multiple choice'
		},
		{
			id: 'palette-radio',
			type: 'radio',
			label: 'Radio Button',
			icon: CircleDot,
			description: 'Single selection from options'
		},
		{
			id: 'palette-file',
			type: 'file',
			label: 'File Upload',
			icon: FileUp,
			description: 'Document or image upload'
		}
	];

	// svelte-dnd-action requires items to have a unique ID
	let items = $state([...fieldTypes]);

	function handleDndConsider(_: CustomEvent<DndEvent<any>>) {
		// When dragging from palette, we don't want the palette to change
	}

	function handleDndFinalize(_: CustomEvent<DndEvent<any>>) {
		// Reset items to original list to keep palette static
		items = [...fieldTypes];
	}
</script>

<aside
	class="w-72 border-r bg-white flex flex-col overflow-hidden shadow-[1px_0_0_0_rgba(0,0,0,0.05)]"
>
	<div class="p-6 border-b bg-slate-50/30">
		<h2 class="text-xs font-bold uppercase tracking-wider text-slate-500">Form Elements</h2>
		<p class="mt-1 text-[11px] leading-relaxed text-slate-400">
			Drag elements below onto the canvas to start building your form.
		</p>
	</div>

	<div
		class="flex-1 overflow-y-auto p-4"
		use:dndzone={{
			items,
			flipDurationMs: 0,
			dragDisabled: false,
			dropTargetStyle: {},
			transformDraggedElement: (el) => {
				if (el) el.style.opacity = '0.9';
			}
		}}
		onconsider={handleDndConsider}
		onfinalize={handleDndFinalize}
	>
		<div class="grid grid-cols-1 gap-2.5">
			{#each items as field (field.id)}
				<div
					class="group flex cursor-grab items-center gap-3 rounded-xl border border-slate-200 bg-white p-3.5
					shadow-sm transition-all hover:border-primary/30 hover:bg-slate-50 active:cursor-grabbing active:scale-[0.98]"
				>
					<div
						class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition-colors group-hover:bg-primary/10 group-hover:text-primary"
					>
						<field.icon size={20} strokeWidth={2.25} />
					</div>
					<div class="flex-1 overflow-hidden">
						<div class="text-sm font-semibold text-slate-700 group-hover:text-slate-900">
							{field.label}
						</div>
						<div class="truncate text-[10px] text-slate-400 group-hover:text-slate-500">
							{field.description}
						</div>
					</div>
					<div class="text-slate-300 opacity-0 transition-opacity group-hover:opacity-100">
						<GripVertical size={14} />
					</div>
				</div>
			{/each}
		</div>
	</div>

	<div class="p-4 border-t bg-slate-50/50">
		<div
			class="rounded-lg bg-amber-50 p-3 text-[10px] text-amber-700 leading-normal border border-amber-100"
		>
			<strong>Tip:</strong> You can reorder fields once they are on the canvas by dragging them up or
			down.
		</div>
	</div>
</aside>
