<script lang="ts">
	import type { PageData } from './$types';
	import * as Card from '$lib/components/ui/card';
	import * as Table from '$lib/components/ui/table';
	import * as Tabs from '$lib/components/ui/tabs';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import {
		Plus,
		Edit,
		Trash2,
		CheckCircle2,
		XCircle,
		Package,
		Users,
		CreditCard,
		MoreVertical,
		Copy,
		Check
	} from 'lucide-svelte';
	import { enhance } from '$app/forms';
	import { goto, invalidateAll } from '$app/navigation';

	let { data }: { data: PageData } = $props();
	let isLoading = $state(false);

	// Modal States
	let showDeleteDialog = $state(false);
	let showToggleDialog = $state(false);
	let selectedPackage = $state<any>(null);

	let selectedIds = $state<string[]>([]);
	let selectAll = $derived(
		data.packages.length > 0 && selectedIds.length === data.packages.length
	);

	async function handleToggleStatus() {
		if (!selectedPackage) return;
		
		isLoading = true;
		try {
			const formData = new FormData();
			formData.append('id', selectedPackage.id);
			formData.append('isActive', selectedPackage.isActive.toString());

			const response = await fetch('?/toggleStatus', {
				method: 'POST',
				body: formData
			});

			if (response.ok) {
				await invalidateAll();
				showToggleDialog = false;
			}
		} finally {
			isLoading = false;
		}
	}

	async function handleDelete() {
		if (!selectedPackage) return;

		isLoading = true;
		try {
			const formData = new FormData();
			formData.append('id', selectedPackage.id);

			const response = await fetch('?/delete', {
				method: 'POST',
				body: formData
			});

			if (response.ok) {
				await invalidateAll();
				showDeleteDialog = false;
			}
		} finally {
			isLoading = false;
		}
	}

	function confirmToggle(pkg: any) {
		selectedPackage = pkg;
		if (pkg.isActive) {
			showToggleDialog = true;
		} else {
			handleToggleStatus();
		}
	}

	function confirmDelete(pkg: any) {
		selectedPackage = pkg;
		showDeleteDialog = true;
	}

	function toggleSelectAll() {
		if (selectAll) {
			selectedIds = [];
		} else {
			selectedIds = data.packages.map((pkg) => pkg.id);
		}
	}

	function toggleSelect(id: string) {
		if (selectedIds.includes(id)) {
			selectedIds = selectedIds.filter((i) => i !== id);
		} else {
			selectedIds = [...selectedIds, id];
		}
	}

	function formatCurrency(amount: number) {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0
		}).format(amount);
	}

	function getFeatureSummary(pkg: any) {
		const limits = pkg.limits || {};
		const features = pkg.features || [];
		const summary = [];

		if (limits.max_students) summary.push(`${limits.max_students} Students`);
		if (features.length > 0) summary.push(`${features.length} Features`);

		return summary.join(' • ') || 'Standard';
	}
</script>

<div class="container mx-auto py-10 max-w-7xl space-y-8">
	<!-- Page Header -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold tracking-tight">Package Management</h1>
			<p class="text-muted-foreground">Manage subscription plans, pricing, and limits.</p>
		</div>
		<Button href="/admin/subscription/packages/new">
			<Plus class="mr-2 h-4 w-4" /> New Package
		</Button>
	</div>

	<!-- Stats Dashboard -->
	<div class="grid gap-4 md:grid-cols-3">
		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="text-sm font-medium">Total Packages</Card.Title>
				<Package class="h-4 w-4 text-muted-foreground" />
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold">{data.stats?.totalPackages || 0}</div>
				<p class="text-xs text-muted-foreground">Available plans</p>
			</Card.Content>
		</Card.Root>
		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="text-sm font-medium">Active Subscriptions</Card.Title>
				<Users class="h-4 w-4 text-muted-foreground" />
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold">{data.stats?.activeSubscriptions || 0}</div>
				<p class="text-xs text-muted-foreground">Tenants subscribed</p>
			</Card.Content>
		</Card.Root>
		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="text-sm font-medium">Est. Monthly Revenue</Card.Title>
				<CreditCard class="h-4 w-4 text-muted-foreground" />
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold">
					{formatCurrency(data.stats?.totalRevenueMonthly || 0)}
				</div>
				<p class="text-xs text-muted-foreground">Based on active subscriptions</p>
			</Card.Content>
		</Card.Root>
	</div>

	<!-- Bulk Actions -->
	{#if selectedIds.length > 0}
		<div
			class="flex items-center gap-4 px-4 py-3 bg-primary/10 border border-primary/20 rounded-lg"
		>
			<span class="text-sm font-medium">{selectedIds.length} selected</span>
			<div class="flex gap-2">
				<Button variant="outline" size="sm" onclick={() => (selectedIds = [])}>Clear</Button>
				<Button variant="destructive" size="sm" onclick={() => alert('Bulk delete pending implementation')}>Delete Selected</Button>
			</div>
		</div>
	{/if}

	<!-- Main Content Area -->
	<Tabs.Root value="list" class="space-y-6">
		<Tabs.List class="grid grid-cols-2 w-full md:w-[300px] h-12 p-1 bg-muted/50">
			<Tabs.Trigger value="list" class="text-xs font-bold uppercase tracking-widest"
				>List View</Tabs.Trigger
			>
			<Tabs.Trigger value="grid" class="text-xs font-bold uppercase tracking-widest"
				>Grid View</Tabs.Trigger
			>
		</Tabs.List>

		<!-- List View -->
		<Tabs.Content value="list">
			<div class="bg-card rounded-xl border shadow-sm overflow-hidden">
				<div class="overflow-x-auto">
					<table class="w-full text-left border-collapse">
						<thead>
							<tr class="bg-muted/30 border-b">
								<th class="p-4 w-10">
									<Checkbox checked={selectAll} onCheckedChange={toggleSelectAll} />
								</th>
								<th
									class="p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground"
								>
									Name
								</th>
								<th
									class="p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground"
								>
									Price (Monthly)
								</th>
								<th
									class="p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground"
								>
									Limits & Features
								</th>
								<th
									class="p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center"
								>
									Subscribers
								</th>
								<th
									class="p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center"
								>
									Status
								</th>
								<th
									class="p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right"
								>
									Actions
								</th>
							</tr>
						</thead>
						<tbody class="divide-y">
							{#if data.packages.length === 0}
								<tr>
									<td colspan="7" class="p-12 text-center text-muted-foreground italic text-sm">
										No packages found. Create your first one!
									</td>
								</tr>
							{:else}
								{#each data.packages as pkg}
									<tr class="hover:bg-muted/20 transition-colors group">
										<td class="p-4">
											<Checkbox
												checked={selectedIds.includes(pkg.id)}
												onCheckedChange={() => toggleSelect(pkg.id)}
											/>
										</td>
										<td class="p-4">
											<div class="flex flex-col">
												<span class="font-bold text-sm">{pkg.name}</span>
												<span class="text-xs text-muted-foreground">{pkg.slug}</span>
											</div>
										</td>
										<td class="p-4">
											<div class="flex flex-col">
												<span class="text-sm font-medium">{formatCurrency(pkg.priceMonthly)}</span>
												<span class="text-[10px] text-muted-foreground"
													>{formatCurrency(pkg.priceYearly)} / yr</span
												>
											</div>
										</td>
										<td class="p-4">
											<span class="text-xs font-medium text-muted-foreground"
												>{getFeatureSummary(pkg)}</span
											>
										</td>
										<td class="p-4 text-center">
											<div class="flex items-center justify-center gap-1.5">
												<Users class="h-3 w-3 text-muted-foreground" />
												<span class="text-xs font-bold tabular-nums"
													>{pkg.subscriberCount || 0}</span
												>
											</div>
										</td>
										<td class="p-4 text-center">
											<Badge
												variant={pkg.isActive ? 'default' : 'secondary'}
												class="text-[9px] uppercase font-black tracking-tight mx-auto w-fit"
											>
												{pkg.isActive ? 'Active' : 'Inactive'}
											</Badge>
										</td>
										<td class="p-4 text-right">
											<DropdownMenu.Root>
												<DropdownMenu.Trigger>
													<Button variant="ghost" size="icon" class="h-8 w-8">
														<MoreVertical class="h-4 w-4" />
													</Button>
												</DropdownMenu.Trigger>
												<DropdownMenu.Content align="end">
													<DropdownMenu.Item
														onclick={() => goto(`/admin/subscription/packages/${pkg.id}`)}
													>
														<Edit class="mr-2 h-4 w-4" /> Edit
													</DropdownMenu.Item>
													<DropdownMenu.Item
														onclick={() =>
															goto(`/admin/subscription/packages/new?copy_from=${pkg.id}`)}
													>
														<Copy class="mr-2 h-4 w-4" /> Duplicate
													</DropdownMenu.Item>
													<DropdownMenu.Separator />
													<DropdownMenu.Item
														disabled={isLoading}
														onclick={() => confirmToggle(pkg)}
													>
														{#if pkg.isActive}
															<XCircle class="mr-2 h-4 w-4 text-orange-500" /> Deactivate
														{:else}
															<CheckCircle2 class="mr-2 h-4 w-4 text-green-500" /> Activate
														{/if}
													</DropdownMenu.Item>

													<DropdownMenu.Separator />
													<DropdownMenu.Item
														disabled={isLoading}
														class="text-red-600"
														onclick={() => confirmDelete(pkg)}
													>
														<Trash2 class="mr-2 h-4 w-4" /> Delete
													</DropdownMenu.Item>
												</DropdownMenu.Content>
											</DropdownMenu.Root>
										</td>
									</tr>
								{/each}
							{/if}
						</tbody>
					</table>
				</div>
			</div>
		</Tabs.Content>

		<!-- Grid View -->
		<Tabs.Content value="grid">
			<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
				{#each data.packages as pkg}
					<Card.Root class={pkg.isActive ? '' : 'opacity-60 grayscale'}>
						<Card.Header>
							<div class="flex justify-between items-start">
								<div>
									<Card.Title class="text-xl">{pkg.name}</Card.Title>
									<Card.Description class="mt-1 line-clamp-2"
										>{pkg.description || 'No description'}</Card.Description
									>
								</div>
								{#if pkg.subscriberCount > 0}
									<Badge variant="outline" class="ml-2 whitespace-nowrap">
										{pkg.subscriberCount} Active
									</Badge>
								{/if}
							</div>
						</Card.Header>
						<Card.Content class="grid gap-4">
							<div class="flex items-baseline gap-1">
								<span class="text-3xl font-bold">{formatCurrency(pkg.priceMonthly)}</span>
								<span class="text-muted-foreground">/mo</span>
							</div>

							<div class="space-y-2 text-sm">
								{#if pkg.limits?.max_students}
									<div class="flex items-center">
										<Check class="mr-2 h-4 w-4 text-primary" />
										<span>Max <strong>{pkg.limits.max_students}</strong> Students</span>
									</div>
								{/if}
								{#if pkg.features}
									{#each pkg.features.slice(0, 4) as feature}
										<div class="flex items-center">
											<Check class="mr-2 h-4 w-4 text-primary" />
											<span class="capitalize">{feature.replace(/_/g, ' ')}</span>
										</div>
									{/each}
								{/if}
							</div>
						</Card.Content>
						<Card.Footer>
							<Button variant="outline" class="w-full" href="/admin/subscription/packages/{pkg.id}">
								Edit Package
							</Button>
						</Card.Footer>
					</Card.Root>
				{/each}
				
				<!-- Add New Card -->
				<a
					href="/admin/subscription/packages/new"
					class="flex flex-col items-center justify-center gap-4 border-2 border-dashed rounded-xl p-6 hover:bg-muted/50 transition-colors h-full min-h-[300px]"
				>
					<div class="rounded-full bg-muted p-4">
						<Plus class="h-6 w-6 text-muted-foreground" />
					</div>
					<div class="text-center">
						<h3 class="font-semibold text-lg">New Package</h3>
						<p class="text-sm text-muted-foreground">Create a new subscription plan</p>
					</div>
				</a>
			</div>
		</Tabs.Content>
	</Tabs.Root>
</div>

<!-- Confirmation Modals -->
<AlertDialog.Root bind:open={showToggleDialog}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Deactivate Package?</AlertDialog.Title>
			<AlertDialog.Description>
				Are you sure you want to deactivate the <strong>{selectedPackage?.name}</strong> package? 
				New users will no longer be able to subscribe to this plan. 
				Existing subscribers will remain unaffected.
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
			<AlertDialog.Action onclick={handleToggleStatus} class="bg-orange-500 hover:bg-orange-600">
				Deactivate
			</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>

<AlertDialog.Root bind:open={showDeleteDialog}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Delete Package?</AlertDialog.Title>
			<AlertDialog.Description>
				This will permanently delete the <strong>{selectedPackage?.name}</strong> package. 
				This action cannot be undone.
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
			<AlertDialog.Action onclick={handleDelete} class="bg-red-600 hover:bg-red-700 text-white">
				Delete Permanently
			</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
