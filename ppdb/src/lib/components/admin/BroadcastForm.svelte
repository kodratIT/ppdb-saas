<script lang="ts">
	import { i18n } from '$lib/i18n/index.svelte';
	import type {
		Tenant,
		MessageTemplate,
		BroadcastPreset,
		BroadcastFormData
	} from '$lib/types/admin';
	import { Button } from '$lib/components/ui/button';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Label } from '$lib/components/ui/label';
	import { Input } from '$lib/components/ui/input';
	import * as Select from '$lib/components/ui/select';
	import { Card, CardContent } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Send, Save, Eye, Calendar, UserPlus, Info } from 'lucide-svelte';
	import { fade, slide } from 'svelte/transition';

	interface Props {
		tenants?: Tenant[];
		templates?: MessageTemplate[];
		presets?: BroadcastPreset[];
		isLoading?: boolean;
		onSend?: (data: BroadcastFormData) => void;
		onSaveTemplate?: (data: { name: string; message: string }) => void;
		onPreview?: (data: BroadcastFormData) => void;
	}

	let {
		tenants = [],
		templates = [],
		presets = [],
		isLoading = false,
		onSend,
		onSaveTemplate,
		onPreview
	} = $props<Props>();

	let targetType = $state<'all' | 'active' | 'inactive' | 'custom'>('all');
	let selectedTenantIds = $state<string[]>([]);
	let message = $state('');
	let selectedTemplateId = $state<string | undefined>();
	let scheduledAt = $state<string | undefined>();

	let characterCount = $derived(message.length);
	let messageLines = $derived(message.split('\n').length);

	let availableVariables = ['admin_name', 'school_name', 'login_url', 'current_date'];

	function insertVariable(variable: string) {
		message += ` {{${variable}}} `;
	}

	function handleTemplateChange(id: string) {
		const template = templates.find((t) => t.id === id);
		if (template) {
			message = template.message;
		}
	}

	function handleSend() {
		if (onSend) {
			onSend({
				targetType,
				targetTenantIds: targetType === 'custom' ? selectedTenantIds : undefined,
				message,
				scheduledAt
			});
		}
	}

	function handleSaveTemplate() {
		if (onSaveTemplate) {
			onSaveTemplate({
				name: `Template ${new Date().toLocaleDateString()}`,
				message
			});
		}
	}

	function handlePreview() {
		if (onPreview) {
			onPreview({
				targetType,
				targetTenantIds: targetType === 'custom' ? selectedTenantIds : undefined,
				message,
				scheduledAt
			});
		}
	}

	// Simple MultiSelect Logic for Tenants
	let tenantSearch = $state('');
	let filteredTenants = $derived(
		tenants.filter((t) => t.name.toLowerCase().includes(tenantSearch.toLowerCase()))
	);

	function toggleTenant(id: string) {
		if (selectedTenantIds.includes(id)) {
			selectedTenantIds = selectedTenantIds.filter((t) => t !== id);
		} else {
			selectedTenantIds = [...selectedTenantIds, id];
		}
	}
</script>

<div class="space-y-6">
	<!-- Target Selection -->
	<Card>
		<CardContent class="pt-6">
			<div class="space-y-4">
				<div class="flex items-center justify-between">
					<Label
						class="text-base font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2"
					>
						<UserPlus class="w-4 h-4" />
						{i18n.t('admin.broadcast.targetAudience')}
					</Label>
					<Badge variant="outline" class="font-mono">
						{targetType === 'custom'
							? selectedTenantIds.length
							: targetType === 'all'
								? tenants.length
								: 'Filter active'} recipients
					</Badge>
				</div>

				<div class="flex flex-wrap gap-2">
					{#each ['all', 'active', 'inactive', 'custom'] as type}
						<Button
							variant={targetType === type ? 'default' : 'outline'}
							size="sm"
							onclick={() => (targetType = type as any)}
							class="capitalize"
						>
							{i18n.t(`admin.broadcast.${type === 'all' ? 'all' : type}`)}
						</Button>
					{/each}
				</div>

				{#if targetType === 'custom'}
					<div transition:slide class="space-y-2 pt-2">
						<Label class="text-xs">{i18n.t('common.select')} Tenants</Label>
						<div class="border rounded-md p-4 space-y-4 bg-muted/30">
							<Input
								bind:value={tenantSearch}
								placeholder={i18n.t('common.search')}
								class="bg-background"
							/>
							<div class="max-h-40 overflow-y-auto space-y-1 pr-2 scrollbar-thin">
								{#each filteredTenants as tenant}
									<label
										class="flex items-center gap-2 p-2 hover:bg-muted rounded-md cursor-pointer transition-colors"
									>
										<input
											type="checkbox"
											checked={selectedTenantIds.includes(tenant.id)}
											onchange={() => toggleTenant(tenant.id)}
											class="checkbox"
										/>
										<span class="text-sm font-medium">{tenant.name}</span>
										<span class="text-[10px] text-muted-foreground font-mono">({tenant.slug})</span>
									</label>
								{/each}
								{#if filteredTenants.length === 0}
									<p class="text-center py-4 text-xs text-muted-foreground italic">
										No tenants found
									</p>
								{/if}
							</div>
						</div>
					</div>
				{/if}
			</div>
		</CardContent>
	</Card>

	<!-- Message Composition -->
	<div class="grid md:grid-cols-3 gap-6">
		<div class="md:col-span-2 space-y-4">
			<Card>
				<CardContent class="pt-6 space-y-4">
					<div class="flex items-center justify-between">
						<Label class="text-base font-bold uppercase tracking-wider text-muted-foreground">
							{i18n.t('admin.broadcast.waMessage')}
						</Label>
						<div class="flex gap-2">
							<Select.Root
								type="single"
								bind:value={selectedTemplateId}
								onValueChange={handleTemplateChange}
							>
								<Select.Trigger class="h-8 w-[180px] text-xs">
									{selectedTemplateId
										? templates.find((t) => t.id === selectedTemplateId)?.name
										: 'Load Template'}
								</Select.Trigger>
								<Select.Content>
									{#each templates as template}
										<Select.Item value={template.id}>{template.name}</Select.Item>
									{/each}
									{#if templates.length === 0}
										<div class="p-4 text-center text-xs text-muted-foreground">No templates</div>
									{/if}
								</Select.Content>
							</Select.Root>
						</div>
					</div>

					<div class="space-y-4">
						<div class="flex flex-wrap gap-2">
							<span class="text-[10px] uppercase font-black text-muted-foreground self-center mr-2"
								>Quick Vars:</span
							>
							{#each availableVariables as variable}
								<Button
									variant="secondary"
									size="sm"
									class="h-7 text-[10px] font-mono px-2"
									onclick={() => insertVariable(variable)}
								>
									{`{{${variable}}}`}
								</Button>
							{/each}
						</div>

						<Textarea
							bind:value={message}
							rows={12}
							placeholder={i18n.t('admin.broadcast.placeholder')}
							class="font-sans text-sm leading-relaxed resize-none border-2 focus-visible:ring-primary"
						/>

						<div
							class="flex justify-between items-center text-[10px] font-bold uppercase tracking-tighter text-muted-foreground"
						>
							<div class="flex gap-4">
								<span>{characterCount} / 2000 CHARS</span>
								<span>{messageLines} LINES</span>
							</div>
							{#if characterCount > 1800}
								<span class="text-destructive animate-pulse">Approaching limit!</span>
							{/if}
						</div>
					</div>
				</CardContent>
			</Card>
		</div>

		<div class="space-y-6">
			<!-- Scheduling Card -->
			<Card>
				<CardContent class="pt-6 space-y-4">
					<Label class="text-xs font-black uppercase tracking-widest flex items-center gap-2">
						<Calendar class="w-3 h-3" />
						Scheduling
					</Label>
					<Input type="datetime-local" bind:value={scheduledAt} class="text-xs h-9" />
					<p class="text-[10px] text-muted-foreground italic leading-tight">
						Leave empty to send immediately. Scheduled messages will be processed by the background
						worker.
					</p>
				</CardContent>
			</Card>

			<!-- Guidelines -->
			<Card class="bg-primary/5 border-primary/20">
				<CardContent class="pt-6 space-y-4">
					<Label
						class="text-xs font-black uppercase tracking-widest flex items-center gap-2 text-primary"
					>
						<Info class="w-3 h-3" />
						Guidelines
					</Label>
					<ul class="space-y-3 text-[11px] font-medium text-primary/80">
						<li class="flex gap-2">
							<span class="text-primary font-black">•</span>
							Messages are sent via WAHA provider.
						</li>
						<li class="flex gap-2">
							<span class="text-primary font-black">•</span>
							Variables are replaced per recipient.
						</li>
						<li class="flex gap-2">
							<span class="text-primary font-black">•</span>
							Avoid too many links to prevent spam flags.
						</li>
					</ul>
				</CardContent>
			</Card>

			<!-- Quick Actions -->
			<div class="grid gap-2">
				<Button
					onclick={handleSend}
					disabled={isLoading || !message || message.length < 10}
					class="w-full h-12 text-sm font-bold uppercase tracking-widest group"
				>
					{#if isLoading}
						<div
							class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"
						></div>
						Processing...
					{:else}
						<Send
							class="w-4 h-4 mr-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"
						/>
						{scheduledAt ? 'Schedule Blast' : 'Send Blast Now'}
					{/if}
				</Button>
				<div class="grid grid-cols-2 gap-2">
					<Button
						variant="outline"
						size="sm"
						onclick={handlePreview}
						class="text-[11px] font-bold uppercase tracking-wider"
					>
						<Eye class="w-3 h-3 mr-2" />
						Preview
					</Button>
					<Button
						variant="outline"
						size="sm"
						onclick={handleSaveTemplate}
						disabled={!message}
						class="text-[11px] font-bold uppercase tracking-wider"
					>
						<Save class="w-3 h-3 mr-2" />
						Save Template
					</Button>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	.scrollbar-thin::-webkit-scrollbar {
		width: 4px;
	}
	.scrollbar-thin::-webkit-scrollbar-track {
		background: transparent;
	}
	.scrollbar-thin::-webkit-scrollbar-thumb {
		background: #e2e8f0;
		border-radius: 20px;
	}

	.checkbox {
		@apply w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary;
	}
</style>
