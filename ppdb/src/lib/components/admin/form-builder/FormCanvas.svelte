<script lang="ts">
	import { dndzone, type DndEvent } from 'svelte-dnd-action';
	import {
		GripVertical,
		Trash2,
		Settings,
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
		AlertCircle
	} from 'lucide-svelte';
	import Button from '$lib/components/ui/button.svelte';
	import Badge from '$lib/components/ui/badge.svelte';

	let { fields = $bindable([]), onedit }: { fields: any[]; onedit: (f: any) => void } = $props();

	const iconMap: Record<string, any> = {
		text: Type,
		textarea: AlignLeft,
		number: Hash,
		email: Mail,
		tel: Phone,
		date: Calendar,
		select: ChevronDown,
		checkbox: CheckSquare,
		radio: CircleDot,
		file: FileUp
	};

	function handleDndConsider(e: CustomEvent<DndEvent<any>>) {
		fields = e.detail.items;
	}

	function handleDndFinalize(e: CustomEvent<DndEvent<any>>) {
		const { items } = e.detail;

		// If the item came from the palette, we need to transform it into a field object
		const newItems = items.map((item: any, index: number) => {
			if (item.id.toString().startsWith('palette-')) {
				const id = Math.random().toString(36).substring(2, 11);
				return {
					id,
					label: 'New ' + item.label,
					fieldType: item.type,
					key: 'field_' + id.substring(0, 5),
					required: false,
					order: index,
					placeholder: '',
					helpText: '',
					options: []
				};
			}
			return { ...item, order: index };
		});

		fields = newItems;
	}

	function removeField(id: string) {
		fields = fields.filter((f) => f.id !== id);
	}
</script>

<div
	class="mx-auto max-w-3xl min-h-[600px] rounded-2xl border-2 border-dashed border-slate-200 bg-white p-8 transition-all hover:border-slate-300"
	use:dndzone={{
		items: fields,
		flipDurationMs: 200,
		dropTargetStyle: {
			outline: 'none',
			backgroundColor: 'rgba(59, 130, 246, 0.02)',
			borderColor: '#3b82f6'
		}
	}}
	onconsider={handleDndConsider}
	onfinalize={handleDndFinalize}
>
	{#if fields.length === 0}
		<div class="flex h-[400px] flex-col items-center justify-center text-center">
			<div
				class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 text-slate-400"
			>
				<AlertCircle size={32} />
			</div>
			<h4 class="text-base font-semibold text-slate-900">Your form is empty</h4>
			<p class="mt-1 max-w-[240px] text-sm text-slate-500">
				Drag components from the sidebar and drop them here to build your form.
			</p>
		</div>
	{/if}

	<div class="flex flex-col gap-4">
		{#each fields as field (field.id)}
			<div
				class="group relative flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-primary/50 hover:shadow-md"
			>
				<!-- Drag Handle -->
				<div
					class="cursor-grab text-slate-300 transition-colors group-hover:text-slate-400 active:cursor-grabbing"
				>
					<GripVertical size={20} />
				</div>

				<!-- Field Info -->
				<div class="flex-1 overflow-hidden">
					<div class="flex items-center gap-2">
						<div
							class="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500"
						>
							{#if iconMap[field.fieldType]}
								{@const Icon = iconMap[field.fieldType]}
								<Icon size={16} />
							{/if}
						</div>
						<div class="font-semibold text-slate-900">{field.label}</div>
						{#if field.required}
							<Badge
								variant="outline"
								class="h-5 rounded-md border-rose-100 bg-rose-50 px-1.5 text-[10px] font-bold uppercase tracking-wider text-rose-600"
							>
								Required
							</Badge>
						{/if}
					</div>
					<div class="mt-1 flex items-center gap-3 text-xs text-slate-400">
						<span class="font-mono bg-slate-50 px-1 rounded border border-slate-100"
							>{field.key}</span
						>
						<span class="h-1 w-1 rounded-full bg-slate-200"></span>
						<span class="uppercase font-medium tracking-tight">{field.fieldType}</span>
					</div>
				</div>

				<!-- Actions -->
				<div class="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
					<Button
						variant="ghost"
						size="icon"
						class="h-9 w-9 text-slate-500 hover:bg-primary/10 hover:text-primary"
						onclick={() => onedit(field)}
					>
						<Settings size={18} />
					</Button>
					<Button
						variant="ghost"
						size="icon"
						class="h-9 w-9 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
						onclick={() => removeField(field.id)}
					>
						<Trash2 size={18} />
					</Button>
				</div>
			</div>
		{/each}
	</div>
</div>
