<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Tabs from '$lib/components/ui/tabs';
	import { Plus, LayoutGrid, List } from 'lucide-svelte';
	import { t } from '$lib/i18n/index.svelte';
	import PlanCard from '$lib/components/admin/PlanCard.svelte';
	import PlanForm from '$lib/components/admin/PlanForm.svelte';
	import PlanComparisonTable from '$lib/components/admin/PlanComparisonTable.svelte';
	import PlanAnalytics from '$lib/components/admin/PlanAnalytics.svelte';
	import AdminPageHeader from '$lib/components/admin/AdminPageHeader.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { toast } from 'svelte-sonner';
	import { invalidateAll } from '$app/navigation';
	import { deserialize } from '$app/forms';
	import type { ActionResult } from '@sveltejs/kit';

	let { data } = $props();

	let activeTab = $state('packages');
	let isCreateDialogOpen = $state(false);
	let isEditDialogOpen = $state(false);
	let selectedPlan = $state<any>(null);
	let isLoading = $state(false);
	let viewMode = $state<'grid' | 'list'>('grid');

	// Map domain features to comparison features
	const comparisonFeatures = [
		{
			key: 'whatsapp_blast',
			name: 'WhatsApp Blast',
			category: 'Marketing',
			description: 'Send mass messages to parents'
		},
		{
			key: 'export',
			name: 'Advanced Export',
			category: 'Data',
			description: 'Export to Excel, PDF, CSV'
		},
		{
			key: 'api_access',
			name: 'API Access',
			category: 'Integration',
			description: 'Developer API endpoints'
		},
		{
			key: 'custom_domain',
			name: 'Custom Domain',
			category: 'Branding',
			description: 'Use your own school domain'
		},
		{
			key: 'white_label',
			name: 'White Label',
			category: 'Branding',
			description: 'Remove PPDB branding'
		}
	];

	async function handleSave(formData: any) {
		isLoading = true;
		const method = formData.id ? 'update' : 'create';

		const body = new FormData();
		Object.entries(formData).forEach(([key, value]) => {
			if (key === 'limits' || key === 'features') {
				body.append(key, JSON.stringify(value));
			} else {
				body.append(key, String(value));
			}
		});

		try {
			const response = await fetch(`?/${method}`, {
				method: 'POST',
				body
			});

			const result: ActionResult = deserialize(await response.text());

			if (result.type === 'success') {
				toast.success(formData.id ? 'Plan updated' : 'Plan created');
				isCreateDialogOpen = false;
				isEditDialogOpen = false;
				selectedPlan = null;
				await invalidateAll();
			} else if (result.type === 'failure') {
				toast.error('Validation failed');
			} else {
				toast.error('Something went wrong');
			}
		} catch (e) {
			toast.error('Network error');
		} finally {
			isLoading = false;
		}
	}

	async function handleDelete(id: string) {
		if (!confirm('Are you sure you want to delete this plan?')) return;

		const body = new FormData();
		body.append('id', id);

		try {
			const response = await fetch('?/delete', {
				method: 'POST',
				body
			});
			const result: ActionResult = deserialize(await response.text());
			if (result.type === 'success') {
				toast.success('Plan deleted');
				await invalidateAll();
			} else {
				toast.error('Failed to delete plan');
			}
		} catch (e) {
			toast.error('Network error');
		}
	}

	async function handleToggleActive(id: string, isActive: boolean) {
		const body = new FormData();
		body.append('id', id);
		body.append('isActive', String(isActive));

		try {
			const response = await fetch('?/toggleActive', {
				method: 'POST',
				body
			});
			const result: ActionResult = deserialize(await response.text());
			if (result.type === 'success') {
				toast.success(isActive ? 'Plan activated' : 'Plan deactivated');
				await invalidateAll();
			}
		} catch (e) {
			toast.error('Network error');
		}
	}

	async function handleDuplicate(id: string, newName: string) {
		const body = new FormData();
		body.append('id', id);
		body.append('newName', newName);

		try {
			const response = await fetch('?/duplicate', {
				method: 'POST',
				body
			});
			const result: ActionResult = deserialize(await response.text());
			if (result.type === 'success') {
				toast.success('Plan duplicated');
				await invalidateAll();
			}
		} catch (e) {
			toast.error('Network error');
		}
	}

	function startEdit(plan: any) {
		selectedPlan = plan;
		isEditDialogOpen = true;
	}
</script>

<div class="space-y-8">
	<AdminPageHeader title={t('admin.plans.title')} description={t('admin.plans.subtitle')}>
		{#snippet actions()}
			<div class="flex items-center gap-2">
				{#if activeTab === 'packages'}
					<div class="flex items-center border rounded-lg p-1 bg-muted/50">
						<Button
							variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
							size="icon"
							class="h-8 w-8"
							onclick={() => (viewMode = 'grid')}
						>
							<LayoutGrid class="h-4 w-4" />
						</Button>
						<Button
							variant={viewMode === 'list' ? 'secondary' : 'ghost'}
							size="icon"
							class="h-8 w-8"
							onclick={() => (viewMode = 'list')}
						>
							<List class="h-4 w-4" />
						</Button>
					</div>
				{/if}

				<Dialog.Root bind:open={isCreateDialogOpen}>
					<Dialog.Trigger>
						{#snippet child({ props })}
							<Button {...props}>
								<Plus class="mr-2 h-4 w-4" />
								{t('admin.plans.addNewPlan')}
							</Button>
						{/snippet}
					</Dialog.Trigger>
					<Dialog.Content class="max-w-4xl max-h-[90vh] overflow-y-auto">
						<Dialog.Header>
							<Dialog.Title>{t('admin.plans.addNewPlan')}</Dialog.Title>
						</Dialog.Header>
						<PlanForm
							allFeatures={data.allFeatures}
							onSave={handleSave}
							onCancel={() => (isCreateDialogOpen = false)}
							{isLoading}
						/>
					</Dialog.Content>
				</Dialog.Root>
			</div>
		{/snippet}
	</AdminPageHeader>

	<Tabs.Root bind:value={activeTab} class="space-y-8">
		<Tabs.List class="grid grid-cols-3 w-full md:w-[450px] h-12 p-1 bg-muted/50">
			<Tabs.Trigger value="packages" class="text-[10px] font-black uppercase tracking-widest"
				>Packages</Tabs.Trigger
			>
			<Tabs.Trigger value="comparison" class="text-[10px] font-black uppercase tracking-widest"
				>Comparison</Tabs.Trigger
			>
			<Tabs.Trigger value="analytics" class="text-[10px] font-black uppercase tracking-widest"
				>Analytics</Tabs.Trigger
			>
		</Tabs.List>

		<Tabs.Content value="packages">
			{#if data.plans.length === 0}
				<div
					class="flex flex-col items-center justify-center py-24 border-2 border-dashed rounded-3xl bg-muted/20"
				>
					<div class="p-4 rounded-full bg-muted mb-4">
						<Plus class="h-8 w-8 text-muted-foreground" />
					</div>
					<h3 class="text-xl font-bold">No plans found</h3>
					<p class="text-muted-foreground mb-6">
						Start by creating your first subscription package.
					</p>
					<Button onclick={() => (isCreateDialogOpen = true)}>
						<Plus class="mr-2 h-4 w-4" />
						{t('admin.plans.addNewPlan')}
					</Button>
				</div>
			{:else if viewMode === 'grid'}
				<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
					{#each data.plans as plan}
						<PlanCard
							{plan}
							stats={data.planStats.find((s) => s.planId === plan.id)}
							isPopular={plan.slug === 'pro'}
							onEdit={startEdit}
							onDelete={handleDelete}
							onToggleActive={handleToggleActive}
							onDuplicate={handleDuplicate}
						/>
					{/each}
				</div>
			{:else}
				<div class="border rounded-2xl overflow-hidden bg-white shadow-sm">
					<table class="w-full text-left">
						<thead>
							<tr
								class="bg-muted/50 text-[10px] font-black uppercase tracking-widest text-muted-foreground border-b"
							>
								<th class="px-6 py-4">Name</th>
								<th class="px-6 py-4">Price (Mo/Yr)</th>
								<th class="px-6 py-4">Status</th>
								<th class="px-6 py-4">Subscriptions</th>
								<th class="px-6 py-4 text-right">Actions</th>
							</tr>
						</thead>
						<tbody class="divide-y">
							{#each data.plans as plan}
								{@const stats = data.planStats.find((s) => s.planId === plan.id)}
								<tr class="hover:bg-muted/30 transition-colors">
									<td class="px-6 py-4">
										<div class="flex flex-col">
											<span class="font-bold">{plan.name}</span>
											<span class="text-xs text-muted-foreground">{plan.slug}</span>
										</div>
									</td>
									<td class="px-6 py-4">
										<div class="flex flex-col">
											<span class="font-medium">{plan.priceMonthly.toLocaleString()}</span>
											<span class="text-[10px] text-muted-foreground"
												>{plan.priceYearly.toLocaleString()} / year</span
											>
										</div>
									</td>
									<td class="px-6 py-4">
										<Badge variant={plan.isActive ? 'default' : 'outline'}>
											{plan.isActive ? 'Active' : 'Inactive'}
										</Badge>
									</td>
									<td class="px-6 py-4">
										<div class="flex items-center gap-2">
											<span class="text-sm font-bold">{stats?.activeSubscriptions || 0}</span>
											<span class="text-[10px] text-muted-foreground font-medium uppercase"
												>Active</span
											>
										</div>
									</td>
									<td class="px-6 py-4 text-right">
										<Button variant="ghost" size="sm" onclick={() => startEdit(plan)}>Edit</Button>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
		</Tabs.Content>

		<Tabs.Content value="comparison">
			<PlanComparisonTable plans={data.plans} features={comparisonFeatures} />
		</Tabs.Content>

		<Tabs.Content value="analytics">
			<PlanAnalytics
				stats={data.planStats}
				totalRevenue={data.planStats.reduce((acc, s) => acc + s.totalRevenue, 0)}
				mrr={data.planStats.reduce((acc, s) => acc + s.mrr, 0)}
			/>
		</Tabs.Content>
	</Tabs.Root>
</div>

<Dialog.Root bind:open={isEditDialogOpen}>
	<Dialog.Content class="max-w-4xl max-h-[90vh] overflow-y-auto">
		<Dialog.Header>
			<Dialog.Title>{t('admin.plans.editPlan')}</Dialog.Title>
		</Dialog.Header>
		{#if selectedPlan}
			<PlanForm
				plan={selectedPlan}
				allFeatures={data.allFeatures}
				onSave={handleSave}
				onCancel={() => (isEditDialogOpen = false)}
				{isLoading}
			/>
		{/if}
	</Dialog.Content>
</Dialog.Root>
