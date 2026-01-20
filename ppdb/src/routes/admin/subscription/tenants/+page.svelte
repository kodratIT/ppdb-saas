<script lang="ts">
	import { enhance } from '$app/forms';
	import { Badge } from '$lib/components/ui/badge';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import * as Table from '$lib/components/ui/table';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { MoreHorizontal, CreditCard, Loader2 } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let isDialogOpen = $state(false);
	let isSaving = $state(false);
	let editingSubscription = $state<{
		tenantId: string;
		tenantName: string;
		packageId: string;
		billingCycle: string;
		status: string;
		currentPeriodEnd: string;
	} | null>(null);

	function getStatusVariant(status: string | undefined) {
		switch (status) {
			case 'active':
				return 'default';
			case 'trial':
				return 'outline';
			case 'past_due':
				return 'destructive';
			case 'cancelled':
				return 'secondary';
			default:
				return 'secondary';
		}
	}

	function getUsagePercentage(count: number, limit: number) {
		if (limit === -1) return 0;
		return Math.min((count / limit) * 100, 100);
	}

	function getUsageColor(percentage: number) {
		if (percentage >= 90) return 'bg-red-500';
		if (percentage >= 75) return 'bg-yellow-500';
		return 'bg-green-500';
	}

	function openEditDialog(row: any) {
		editingSubscription = {
			tenantId: row.tenant.id,
			tenantName: row.tenant.name,
			packageId: row.subscription?.packageId || data.packages[0]?.id || '',
			billingCycle: row.subscription?.billingCycle || 'monthly',
			status: row.subscription?.status || 'active',
			currentPeriodEnd: row.subscription?.currentPeriodEnd
				? new Date(row.subscription.currentPeriodEnd).toISOString().split('T')[0]
				: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0]
		};
		isDialogOpen = true;
	}
</script>

<div class="flex flex-col gap-6 p-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold tracking-tight">Active Subscriptions</h1>
			<p class="text-muted-foreground">Monitor tenant subscription status and validity.</p>
		</div>
	</div>

	<Card.Root>
		<Card.Header>
			<Card.Title>Tenants</Card.Title>
		</Card.Header>
		<Card.Content>
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>Tenant Name</Table.Head>
						<Table.Head>Slug</Table.Head>
						<Table.Head>Package</Table.Head>
						<Table.Head>Usage (Students)</Table.Head>
						<Table.Head>Status</Table.Head>
						<Table.Head>Cycle</Table.Head>
						<Table.Head>Valid Until</Table.Head>
						<Table.Head class="text-right">Actions</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each data.tenants as row}
						<Table.Row>
							<Table.Cell class="font-medium">{row.tenant.name}</Table.Cell>
							<Table.Cell>{row.tenant.slug}</Table.Cell>
							<Table.Cell>
								{#if row.package}
									<Badge variant="outline">{row.package.name}</Badge>
								{:else}
									<span class="text-muted-foreground">-</span>
								{/if}
							</Table.Cell>
							<Table.Cell>
								{#if row.package}
									{@const limit = row.package.limits?.max_students ?? 0}
									{@const count = row.applicationCount ?? 0}
									{@const percentage = getUsagePercentage(count, limit)}
									
									<div class="flex flex-col gap-1 w-32">
										<div class="flex justify-between text-xs text-muted-foreground">
											<span>{count}</span>
											<span>{limit === -1 ? '∞' : limit}</span>
										</div>
										{#if limit !== -1}
											<div class="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
												<div 
													class="h-full {getUsageColor(percentage)} transition-all duration-500" 
													style="width: {percentage}%"
												></div>
											</div>
										{:else}
											<div class="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
												<div class="h-full bg-blue-500 w-full opacity-20"></div>
											</div>
										{/if}
									</div>
								{:else}
									<span class="text-muted-foreground">-</span>
								{/if}
							</Table.Cell>
							<Table.Cell>
								{#if row.subscription}
									<Badge variant={getStatusVariant(row.subscription.status)}>
										{row.subscription.status}
									</Badge>
								{:else}
									<Badge variant="secondary">No Subscription</Badge>
								{/if}
							</Table.Cell>
							<Table.Cell>
								{row.subscription?.billingCycle || '-'}
							</Table.Cell>
							<Table.Cell>
								{row.subscription?.currentPeriodEnd
									? new Date(row.subscription.currentPeriodEnd).toLocaleDateString('id-ID')
									: '-'}
							</Table.Cell>
							<Table.Cell class="text-right">
								<DropdownMenu.Root>
									<DropdownMenu.Trigger
										class={buttonVariants({ variant: 'ghost', size: 'icon' })}
									>
										<MoreHorizontal class="h-4 w-4" />
									</DropdownMenu.Trigger>
									<DropdownMenu.Content align="end">
										<DropdownMenu.Label>Actions</DropdownMenu.Label>
										<DropdownMenu.Separator />
										<DropdownMenu.Item onclick={() => openEditDialog(row)}>
											<CreditCard class="mr-2 h-4 w-4" />
											Manage Subscription
										</DropdownMenu.Item>
									</DropdownMenu.Content>
								</DropdownMenu.Root>
							</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</Card.Content>
	</Card.Root>

	<Dialog.Root bind:open={isDialogOpen}>
		<Dialog.Content class="sm:max-w-[425px]">
			<Dialog.Header>
				<Dialog.Title>Manage Subscription</Dialog.Title>
				<Dialog.Description>
					Update subscription details for {editingSubscription?.tenantName}.
				</Dialog.Description>
			</Dialog.Header>
			<form
				action="?/updateSubscription"
				method="POST"
				use:enhance={() => {
					isSaving = true;
					const toastId = toast.loading('Saving subscription...');
					
					return async ({ result, update }) => {
						isSaving = false;
						if (result.type === 'success') {
							toast.dismiss(toastId);
							toast.success('Subscription updated successfully');
							isDialogOpen = false;
							update();
						} else {
							toast.dismiss(toastId);
							toast.error('Failed to update subscription');
							console.error('Update failed:', result);
						}
					};
				}}
			>
				{#if editingSubscription}
					<input type="hidden" name="tenantId" value={editingSubscription.tenantId} />
					<div class="grid gap-4 py-4">
						<div class="grid grid-cols-4 items-center gap-4">
							<Label for="packageId" class="text-right">Package</Label>
							<select
								id="packageId"
								name="packageId"
								class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 col-span-3"
								value={editingSubscription.packageId}
								required
							>
								{#each data.packages as pkg}
									<option value={pkg.id}>{pkg.name} (Rp {pkg.priceMonthly.toLocaleString()})</option>
								{/each}
							</select>
						</div>
						<div class="grid grid-cols-4 items-center gap-4">
							<Label for="billingCycle" class="text-right">Cycle</Label>
							<select
								id="billingCycle"
								name="billingCycle"
								class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 col-span-3"
								value={editingSubscription.billingCycle}
								required
							>
								<option value="monthly">Monthly</option>
								<option value="yearly">Yearly</option>
							</select>
						</div>
						<div class="grid grid-cols-4 items-center gap-4">
							<Label for="status" class="text-right">Status</Label>
							<select
								id="status"
								name="status"
								class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 col-span-3"
								value={editingSubscription.status}
								required
							>
								<option value="active">Active</option>
								<option value="trial">Trial</option>
								<option value="past_due">Past Due</option>
								<option value="cancelled">Cancelled</option>
							</select>
						</div>
						<div class="grid grid-cols-4 items-center gap-4">
							<Label for="currentPeriodEnd" class="text-right">Valid Until</Label>
							<Input
								id="currentPeriodEnd"
								name="currentPeriodEnd"
								type="date"
								class="col-span-3"
								value={editingSubscription.currentPeriodEnd}
								required
							/>
						</div>
					</div>
					<Dialog.Footer>
						<Button type="button" variant="ghost" onclick={() => isDialogOpen = false} disabled={isSaving}>Cancel</Button>
						<Button type="submit" disabled={isSaving}>
							{#if isSaving}
								<Loader2 class="mr-2 h-4 w-4 animate-spin" />
								Saving...
							{:else}
								Save Changes
							{/if}
						</Button>
					</Dialog.Footer>
				{/if}
			</form>
		</Dialog.Content>
	</Dialog.Root>
</div>
