<script lang="ts">
	import { i18n } from '$lib/i18n/index.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Badge } from '$lib/components/ui/badge';
	import * as Select from '$lib/components/ui/select';
	import * as RadioGroup from '$lib/components/ui/radio-group';
	import {
		X,
		Save,
		Send,
		Eye,
		LayoutTemplate,
		AlertTriangle,
		Calendar,
		Clock
	} from 'lucide-svelte';
	import { cn } from '$lib/utils';

	type ContentType = 'html' | 'markdown';
	type TargetType = 'all' | 'active' | 'inactive' | 'custom';
	type Priority = 'low' | 'normal' | 'high' | 'urgent';

	interface Tenant {
		id: string;
		name: string;
		status: string;
	}

	interface Template {
		id: string;
		name: string;
		title: string;
		content: string;
		contentType: ContentType;
		priority: Priority;
		category: string | null;
	}

	interface FormData {
		id?: string;
		title: string;
		content: string;
		contentType: ContentType;
		targetType: TargetType;
		targetTenantIds: string[];
		scheduledAt: string;
		expiresAt: string;
		priority: Priority;
		category: string;
		tags: string[];
	}

	interface Props {
		announcement?: FormData | null;
		categories?: string[];
		templates?: Template[];
		tenants?: Tenant[];
		mode?: 'create' | 'edit' | 'quick';
		isLoading?: boolean;
		onSave?: (data: FormData, action: 'draft' | 'publish' | 'schedule') => void;
		onCancel?: () => void;
		onPreview?: (data: FormData) => void;
		onSaveAsTemplate?: (data: FormData) => void;
	}

	let {
		announcement = null,
		categories = [],
		templates = [],
		tenants = [],
		mode = 'create',
		isLoading = false,
		onSave,
		onCancel,
		onPreview,
		onSaveAsTemplate
	} = $props<Props>();

	// Form state
	let formData = $state<FormData>({
		id: announcement?.id || undefined,
		title: announcement?.title || '',
		content: announcement?.content || '',
		contentType: announcement?.contentType || 'html',
		targetType: announcement?.targetType || 'all',
		targetTenantIds: announcement?.targetTenantIds || [],
		scheduledAt: announcement?.scheduledAt || '',
		expiresAt: announcement?.expiresAt || '',
		priority: announcement?.priority || 'normal',
		category: announcement?.category || '',
		tags: announcement?.tags || []
	});

	let tagInput = $state('');
	let selectedTemplateId = $state('');
	let showScheduling = $state(!!announcement?.scheduledAt);

	// Filter tenants based on target type
	let filteredTenants = $derived(
		tenants.filter((t) => {
			if (formData.targetType === 'active') return t.status === 'active';
			if (formData.targetType === 'inactive') return t.status === 'inactive';
			return true;
		})
	);

	function handleTagKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' || e.key === ',') {
			e.preventDefault();
			addTag();
		}
	}

	function addTag() {
		const tag = tagInput.trim();
		if (tag && !formData.tags.includes(tag)) {
			formData.tags = [...formData.tags, tag];
		}
		tagInput = '';
	}

	function removeTag(tag: string) {
		formData.tags = formData.tags.filter((t) => t !== tag);
	}

	function applyTemplate(templateId: string) {
		const template = templates.find((t) => t.id === templateId);
		if (template) {
			formData.title = template.title;
			formData.content = template.content;
			formData.contentType = template.contentType;
			formData.priority = template.priority;
			if (template.category) formData.category = template.category;
		}
	}

	function toggleTenant(tenantId: string) {
		if (formData.targetTenantIds.includes(tenantId)) {
			formData.targetTenantIds = formData.targetTenantIds.filter((id) => id !== tenantId);
		} else {
			formData.targetTenantIds = [...formData.targetTenantIds, tenantId];
		}
	}

	function handleSaveDraft() {
		onSave?.(formData, 'draft');
	}

	function handlePublish() {
		if (formData.scheduledAt) {
			onSave?.(formData, 'schedule');
		} else {
			onSave?.(formData, 'publish');
		}
	}

	function handlePreview() {
		onPreview?.(formData);
	}

	function handleSaveAsTemplate() {
		onSaveAsTemplate?.(formData);
	}

	function getPriorityColor(priority: Priority) {
		switch (priority) {
			case 'urgent':
				return 'bg-destructive text-destructive-foreground';
			case 'high':
				return 'bg-orange-500 text-white';
			case 'normal':
				return 'bg-primary text-primary-foreground';
			case 'low':
				return 'bg-muted text-muted-foreground';
		}
	}

	$effect(() => {
		if (selectedTemplateId) {
			applyTemplate(selectedTemplateId);
			selectedTemplateId = '';
		}
	});
</script>

<form class="space-y-6" onsubmit={(e) => e.preventDefault()}>
	<!-- Template Selection (only for create mode) -->
	{#if mode === 'create' && templates.length > 0}
		<div class="space-y-2">
			<Label class="text-[10px] font-black uppercase tracking-widest text-muted-foreground"
				>Load from Template</Label
			>
			<Select.Root type="single" bind:value={selectedTemplateId}>
				<Select.Trigger class="h-9">
					<LayoutTemplate class="w-4 h-4 mr-2" />
					Select a template...
				</Select.Trigger>
				<Select.Content>
					{#each templates as template}
						<Select.Item value={template.id}>{template.name}</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
		</div>
	{/if}

	<!-- Title -->
	<div class="space-y-2">
		<Label class="text-[10px] font-black uppercase tracking-widest text-muted-foreground"
			>Title *</Label
		>
		<Input
			bind:value={formData.title}
			placeholder="Enter announcement title..."
			maxlength={200}
			class="h-10"
		/>
		<p class="text-[10px] text-muted-foreground text-right">
			{formData.title.length}/200 characters
		</p>
	</div>

	<!-- Content -->
	<div class="space-y-2">
		<div class="flex items-center justify-between">
			<Label class="text-[10px] font-black uppercase tracking-widest text-muted-foreground"
				>Content *</Label
			>
			<div class="flex gap-1">
				<Button
					type="button"
					variant={formData.contentType === 'html' ? 'default' : 'outline'}
					size="sm"
					class="h-7 text-xs"
					onclick={() => (formData.contentType = 'html')}
				>
					HTML
				</Button>
				<Button
					type="button"
					variant={formData.contentType === 'markdown' ? 'default' : 'outline'}
					size="sm"
					class="h-7 text-xs"
					onclick={() => (formData.contentType = 'markdown')}
				>
					Markdown
				</Button>
			</div>
		</div>
		<Textarea
			bind:value={formData.content}
			placeholder={formData.contentType === 'markdown'
				? 'Write your announcement in Markdown...'
				: 'Write your announcement content...'}
			rows={10}
			class={cn(formData.contentType === 'markdown' && 'font-mono text-sm')}
		/>
		<p class="text-[10px] text-muted-foreground text-right">
			{formData.content.length}/10000 characters
		</p>
	</div>

	<!-- Target Audience -->
	<div class="space-y-3">
		<Label class="text-[10px] font-black uppercase tracking-widest text-muted-foreground"
			>Target Audience</Label
		>
		<RadioGroup.Root bind:value={formData.targetType} class="grid grid-cols-2 md:grid-cols-4 gap-2">
			<div
				class={cn(
					'flex items-center justify-center p-3 rounded-lg border-2 cursor-pointer transition-all',
					formData.targetType === 'all'
						? 'border-primary bg-primary/5'
						: 'border-muted hover:border-muted-foreground/50'
				)}
			>
				<RadioGroup.Item value="all" id="target-all" class="sr-only" />
				<label for="target-all" class="text-xs font-bold cursor-pointer">All Tenants</label>
			</div>
			<div
				class={cn(
					'flex items-center justify-center p-3 rounded-lg border-2 cursor-pointer transition-all',
					formData.targetType === 'active'
						? 'border-primary bg-primary/5'
						: 'border-muted hover:border-muted-foreground/50'
				)}
			>
				<RadioGroup.Item value="active" id="target-active" class="sr-only" />
				<label for="target-active" class="text-xs font-bold cursor-pointer">Active Only</label>
			</div>
			<div
				class={cn(
					'flex items-center justify-center p-3 rounded-lg border-2 cursor-pointer transition-all',
					formData.targetType === 'inactive'
						? 'border-primary bg-primary/5'
						: 'border-muted hover:border-muted-foreground/50'
				)}
			>
				<RadioGroup.Item value="inactive" id="target-inactive" class="sr-only" />
				<label for="target-inactive" class="text-xs font-bold cursor-pointer">Inactive Only</label>
			</div>
			<div
				class={cn(
					'flex items-center justify-center p-3 rounded-lg border-2 cursor-pointer transition-all',
					formData.targetType === 'custom'
						? 'border-primary bg-primary/5'
						: 'border-muted hover:border-muted-foreground/50'
				)}
			>
				<RadioGroup.Item value="custom" id="target-custom" class="sr-only" />
				<label for="target-custom" class="text-xs font-bold cursor-pointer">Custom Select</label>
			</div>
		</RadioGroup.Root>

		{#if formData.targetType === 'custom'}
			<div class="max-h-40 overflow-y-auto p-3 bg-muted/30 rounded-lg space-y-2">
				{#if filteredTenants.length > 0}
					{#each filteredTenants as tenant}
						<label
							class="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted cursor-pointer"
						>
							<input
								type="checkbox"
								checked={formData.targetTenantIds.includes(tenant.id)}
								onchange={() => toggleTenant(tenant.id)}
								class="rounded"
							/>
							<span class="text-sm">{tenant.name}</span>
							<Badge variant="outline" class="ml-auto text-[9px]">{tenant.status}</Badge>
						</label>
					{/each}
				{:else}
					<p class="text-sm text-muted-foreground italic text-center py-2">No tenants available</p>
				{/if}
			</div>
			<p class="text-[10px] text-muted-foreground">
				{formData.targetTenantIds.length} tenant(s) selected
			</p>
		{/if}
	</div>

	<!-- Scheduling -->
	<div class="space-y-3">
		<div class="flex items-center gap-2">
			<input type="checkbox" id="enable-scheduling" bind:checked={showScheduling} class="rounded" />
			<Label
				for="enable-scheduling"
				class="text-[10px] font-black uppercase tracking-widest text-muted-foreground cursor-pointer"
			>
				Schedule Publication
			</Label>
		</div>

		{#if showScheduling}
			<div class="grid md:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
				<div class="space-y-2">
					<Label class="text-xs font-medium flex items-center gap-2">
						<Calendar class="w-3 h-3" />
						Publish Date
					</Label>
					<Input type="datetime-local" bind:value={formData.scheduledAt} class="h-9" />
				</div>
				<div class="space-y-2">
					<Label class="text-xs font-medium flex items-center gap-2">
						<Clock class="w-3 h-3" />
						Expiration Date (Optional)
					</Label>
					<Input type="datetime-local" bind:value={formData.expiresAt} class="h-9" />
				</div>
			</div>
		{/if}
	</div>

	<!-- Priority, Category, Tags -->
	<div class="grid md:grid-cols-3 gap-4">
		<div class="space-y-2">
			<Label class="text-[10px] font-black uppercase tracking-widest text-muted-foreground"
				>Priority</Label
			>
			<Select.Root type="single" bind:value={formData.priority}>
				<Select.Trigger class="h-9">
					<span
						class={cn('px-2 py-0.5 rounded text-xs font-bold', getPriorityColor(formData.priority))}
					>
						{formData.priority.toUpperCase()}
					</span>
				</Select.Trigger>
				<Select.Content>
					<Select.Item value="low">Low</Select.Item>
					<Select.Item value="normal">Normal</Select.Item>
					<Select.Item value="high">High</Select.Item>
					<Select.Item value="urgent">Urgent</Select.Item>
				</Select.Content>
			</Select.Root>
		</div>

		<div class="space-y-2">
			<Label class="text-[10px] font-black uppercase tracking-widest text-muted-foreground"
				>Category</Label
			>
			<Input
				bind:value={formData.category}
				placeholder="e.g. Maintenance, Feature, News..."
				class="h-9"
				list="category-suggestions"
			/>
			<datalist id="category-suggestions">
				{#each categories as cat}
					<option value={cat} />
				{/each}
			</datalist>
		</div>

		<div class="space-y-2">
			<Label class="text-[10px] font-black uppercase tracking-widest text-muted-foreground"
				>Tags</Label
			>
			<Input
				bind:value={tagInput}
				placeholder="Press Enter to add..."
				class="h-9"
				onkeydown={handleTagKeydown}
			/>
			{#if formData.tags.length > 0}
				<div class="flex flex-wrap gap-1">
					{#each formData.tags as tag}
						<Badge variant="secondary" class="text-xs">
							{tag}
							<button
								type="button"
								onclick={() => removeTag(tag)}
								class="ml-1 hover:text-destructive"
							>
								<X class="w-3 h-3" />
							</button>
						</Badge>
					{/each}
				</div>
			{/if}
		</div>
	</div>

	<!-- Actions -->
	<div class="flex flex-col-reverse md:flex-row justify-end gap-3 pt-4 border-t">
		{#if onCancel}
			<Button type="button" variant="ghost" onclick={onCancel}>Cancel</Button>
		{/if}
		<Button
			type="button"
			variant="outline"
			onclick={handlePreview}
			disabled={!formData.title || !formData.content}
		>
			<Eye class="w-4 h-4 mr-2" />
			Preview
		</Button>
		{#if mode === 'create'}
			<Button
				type="button"
				variant="outline"
				onclick={handleSaveAsTemplate}
				disabled={!formData.title || !formData.content}
			>
				<LayoutTemplate class="w-4 h-4 mr-2" />
				Save as Template
			</Button>
		{/if}
		<Button
			type="button"
			variant="secondary"
			onclick={handleSaveDraft}
			disabled={isLoading || !formData.title || !formData.content}
		>
			<Save class="w-4 h-4 mr-2" />
			Save Draft
		</Button>
		<Button
			type="button"
			onclick={handlePublish}
			disabled={isLoading || !formData.title || !formData.content}
		>
			<Send class="w-4 h-4 mr-2" />
			{formData.scheduledAt ? 'Schedule' : 'Publish Now'}
		</Button>
	</div>
</form>
