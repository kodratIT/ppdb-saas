<script lang="ts">
	import { i18n } from '$lib/i18n/index.svelte';
	import type { MessageTemplate } from '$lib/types/admin';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Label } from '$lib/components/ui/label';
	import { Badge } from '$lib/components/ui/badge';
	import {
		Plus,
		Search,
		MoreHorizontal,
		Edit,
		Trash2,
		MessageSquare,
		Copy,
		ArrowRight,
		X,
		Save
	} from 'lucide-svelte';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import * as Dialog from '$lib/components/ui/dialog';
	import { slide, fade } from 'svelte/transition';

	interface Props {
		templates?: MessageTemplate[];
		categories?: string[];
		onSave?: (template: Partial<MessageTemplate>) => void;
		onDelete?: (id: string) => void;
		onImport?: (templates: MessageTemplate[]) => void;
		onExport?: () => void;
	}

	let { templates = [], categories = [], onSave, onDelete, onImport, onExport } = $props<Props>();

	let searchQuery = $state('');
	let categoryFilter = $state('all');

	let filteredTemplates = $derived(
		templates.filter((t) => {
			const matchesSearch =
				t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				t.message.toLowerCase().includes(searchQuery.toLowerCase());
			const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;
			return matchesSearch && matchesCategory;
		})
	);

	// Modal State
	let isDialogOpen = $state(false);
	let editingTemplate = $state<Partial<MessageTemplate> | null>(null);

	function openCreate() {
		editingTemplate = {
			name: '',
			category: 'general',
			message: '',
			variables: []
		};
		isDialogOpen = true;
	}

	function openEdit(template: MessageTemplate) {
		editingTemplate = { ...template };
		isDialogOpen = true;
	}

	function handleSave() {
		if (onSave && editingTemplate) {
			onSave(editingTemplate);
			isDialogOpen = false;
		}
	}

	function handleDelete(id: string) {
		if (confirm('Are you sure you want to delete this template?') && onDelete) {
			onDelete(id);
		}
	}

	function addVar(variable: string) {
		if (editingTemplate) {
			editingTemplate.message += ` {{${variable}}} `;
		}
	}

	let availableVars = ['admin_name', 'school_name', 'login_url', 'current_date', 'payout_amount'];
</script>

<div class="space-y-6">
	<!-- Header & Search -->
	<div class="flex flex-col md:flex-row gap-4 justify-between items-center">
		<div class="relative w-full md:w-96">
			<Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
			<Input bind:value={searchQuery} placeholder="Search templates..." class="pl-10" />
		</div>
		<div class="flex gap-2 w-full md:w-auto">
			<Button
				variant="outline"
				onclick={onExport}
				class="flex-1 md:flex-none text-xs font-bold uppercase tracking-wider"
			>
				<Copy class="w-3 h-3 mr-2" />
				Export
			</Button>
			<Button
				onclick={openCreate}
				class="flex-1 md:flex-none text-xs font-bold uppercase tracking-wider"
			>
				<Plus class="w-3 h-3 mr-2" />
				New Template
			</Button>
		</div>
	</div>

	<!-- Templates Grid -->
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
		{#each filteredTemplates as template (template.id)}
			<Card
				class="flex flex-col group hover:shadow-md transition-all border-2 hover:border-primary/20"
			>
				<CardHeader class="pb-2">
					<div class="flex justify-between items-start">
						<div class="space-y-1">
							<Badge variant="secondary" class="text-[9px] uppercase font-black px-1.5 py-0">
								{template.category || 'General'}
							</Badge>
							<CardTitle class="text font-bold line-clamp-1">{template.name}</CardTitle>
						</div>
						<DropdownMenu.Root>
							<DropdownMenu.Trigger>
								<Button variant="ghost" size="icon" class="h-8 w-8">
									<MoreHorizontal class="w-4 h-4" />
								</Button>
							</DropdownMenu.Trigger>
							<DropdownMenu.Content align="end">
								<DropdownMenu.Item onclick={() => openEdit(template)}>
									<Edit class="w-4 h-4 mr-2" /> Edit
								</DropdownMenu.Item>
								<DropdownMenu.Item
									onclick={() => handleDelete(template.id)}
									class="text-destructive"
								>
									<Trash2 class="w-4 h-4 mr-2" /> Delete
								</DropdownMenu.Item>
							</DropdownMenu.Content>
						</DropdownMenu.Root>
					</div>
				</CardHeader>
				<CardContent class="flex-1">
					<div
						class="bg-muted/30 rounded-lg p-3 text-xs text-muted-foreground line-clamp-4 italic leading-relaxed min-h-[5rem]"
					>
						"{template.message}"
					</div>
					<div class="flex flex-wrap gap-1 mt-4">
						{#each template.variables as variable}
							<span class="text-[9px] font-mono bg-primary/10 text-primary px-1 rounded"
								>{`{{${variable}}}`}</span
							>
						{/each}
					</div>
				</CardContent>
				<div
					class="p-4 border-t flex justify-end bg-muted/5 group-hover:bg-primary/5 transition-colors"
				>
					<Button
						variant="ghost"
						size="sm"
						class="text-[10px] font-black uppercase tracking-widest h-7"
						onclick={() => openEdit(template)}
					>
						Manage <ArrowRight class="w-3 h-3 ml-2" />
					</Button>
				</div>
			</Card>
		{/each}
		{#if filteredTemplates.length === 0}
			<div
				class="col-span-full py-20 bg-muted/20 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-4 text-muted-foreground"
			>
				<MessageSquare class="w-12 h-12 opacity-20" />
				<div class="text-center">
					<p class="font-bold uppercase tracking-widest text-xs">No Templates Found</p>
					<p class="text-[10px] mt-1">Try adjusting your search or create a new template.</p>
				</div>
				<Button variant="outline" size="sm" class="mt-2" onclick={openCreate}
					>Create First Template</Button
				>
			</div>
		{/if}
	</div>
</div>

<!-- Edit/Create Dialog -->
<Dialog.Root bind:open={isDialogOpen}>
	<Dialog.Content class="sm:max-w-[600px]">
		<Dialog.Header>
			<Dialog.Title>{editingTemplate?.id ? 'Edit Template' : 'Create New Template'}</Dialog.Title>
			<Dialog.Description>
				Templates can include dynamic variables that will be replaced during broadcast.
			</Dialog.Description>
		</Dialog.Header>

		{#if editingTemplate}
			<div class="grid gap-6 py-4">
				<div class="grid grid-cols-4 items-center gap-4">
					<Label for="name" class="text-right text-xs font-black uppercase tracking-widest"
						>Name</Label
					>
					<Input id="name" bind:value={editingTemplate.name} class="col-span-3" />
				</div>
				<div class="grid grid-cols-4 items-center gap-4">
					<Label for="category" class="text-right text-xs font-black uppercase tracking-widest"
						>Category</Label
					>
					<Select.Root type="single" bind:value={editingTemplate.category as any}>
						<Select.Trigger class="col-span-3">
							{editingTemplate.category?.toUpperCase()}
						</Select.Trigger>
						<Select.Content>
							<Select.Item value="general">GENERAL</Select.Item>
							<Select.Item value="announcement">ANNOUNCEMENT</Select.Item>
							<Select.Item value="finance">FINANCE</Select.Item>
							<Select.Item value="urgent">URGENT</Select.Item>
						</Select.Content>
					</Select.Root>
				</div>
				<div class="space-y-2">
					<div class="flex justify-between items-center px-1">
						<Label class="text-xs font-black uppercase tracking-widest">Message Content</Label>
						<div class="flex gap-1">
							{#each availableVars as v}
								<button
									class="text-[9px] bg-muted hover:bg-primary hover:text-white px-1.5 py-0.5 rounded transition-colors font-mono"
									onclick={() => addVar(v)}
								>
									+{v}
								</button>
							{/each}
						</div>
					</div>
					<Textarea
						bind:value={editingTemplate.message}
						rows={8}
						class="resize-none font-sans text-sm leading-relaxed"
					/>
					<p class="text-[10px] text-muted-foreground italic px-1">
						Tip: Place variables like {'{{admin_name}}'} anywhere in the text.
					</p>
				</div>
			</div>
		{/if}

		<Dialog.Footer>
			<Button variant="outline" onclick={() => (isDialogOpen = false)}>Cancel</Button>
			<Button onclick={handleSave} class="gap-2">
				<Save class="w-4 h-4" />
				{editingTemplate?.id ? 'Update Template' : 'Create Template'}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
