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
	import { i18n } from '$lib/i18n/index.svelte';

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
		switch (status?.toLowerCase()) {
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

	const getStatusText = (status: string | undefined) => {
		if (!status) return i18n.t('admin.tenants.noSubscription');
		const key = `admin.tenants.${status.toLowerCase()}` as any;
		const translated = i18n.t(key);
		return translated !== key ? translated : status.toUpperCase();
	};

	const getCycleText = (cycle: string | undefined) => {
		if (!cycle) return '-';
		const key = `admin.tenants.${cycle.toLowerCase()}` as any;
		const translated = i18n.t(key);
		return translated !== key ? translated : cycle;
	};
</script>

<div class="flex flex-col gap-6 p-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold tracking-tight">{i18n.t('admin.tenants.title')}</h1>
			<p class="text-muted-foreground">{i18n.t('admin.tenants.subtitle')}</p>
		</div>
	</div>

	<Card.Root>
		<Card.Header>
			<Card.Title>{i18n.t('admin.tenants.tenants')}</Card.Title>
		</Card.Header>
		<Card.Content>
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>{i18n.t('admin.tenants.tenantName')}</Table.Head>
						<Table.Head>{i18n.t('admin.packages.slug')}</Table.Head>
						<Table.Head>{i18n.t('admin.tenants.package')}</Table.Head>
						<Table.Head>{i18n.t('admin.tenants.usageStudents')}</Table.Head>
						<Table.Head>{i18n.t('admin.packages.status')}</Table.Head>
						<Table.Head>{i18n.t('admin.tenants.cycle')}</Table.Head>
						<Table.Head>{i18n.t('admin.tenants.validUntil')}</Table.Head>
						<Table.Head class="text-right">{i18n.t('common.actions')}</Table.Head>
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
								<Badge variant={getStatusVariant(row.subscription?.status)}>
									{getStatusText(row.subscription?.status)}
								</Badge>
							</Table.Cell>
							<Table.Cell>
								{getCycleText(row.subscription?.billingCycle)}
							</Table.Cell>
							<Table.Cell>
								{row.subscription?.currentPeriodEnd
									? new Date(row.subscription.currentPeriodEnd).toLocaleDateString(
											i18n.language === 'id' ? 'id-ID' : 'en-US'
										)
									: '-'}
							</Table.Cell>
							<Table.Cell class="text-right">
								<DropdownMenu.Root>
									<DropdownMenu.Trigger class={buttonVariants({ variant: 'ghost', size: 'icon' })}>
										<MoreHorizontal class="h-4 w-4" />
									</DropdownMenu.Trigger>
									<DropdownMenu.Content align="end">
										<DropdownMenu.Label>{i18n.t('common.actions')}</DropdownMenu.Label>
										<DropdownMenu.Separator />
										<DropdownMenu.Item onclick={() => openEditDialog(row)}>
											<CreditCard class="mr-2 h-4 w-4" />
											{i18n.t('admin.tenants.manageSubscription')}
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
				<Dialog.Title>{i18n.t('admin.tenants.manageSubscription')}</Dialog.Title>
				<Dialog.Description>
					{i18n.t('admin.tenants.manageSubDesc', { name: editingSubscription?.tenantName })}
				</Dialog.Description>
			</Dialog.Header>
			<form
				action="?/updateSubscription"
				method="POST"
				use:enhance={() => {
					isSaving = true;
					const toastId = toast.loading(i18n.t('admin.tenants.savingSub'));

					return async ({ result, update }) => {
						isSaving = false;
						if (result.type === 'success') {
							toast.dismiss(toastId);
							toast.success(i18n.t('admin.tenants.subUpdated'));
							isDialogOpen = false;
							update();
						} else {
							toast.dismiss(toastId);
							toast.error(i18n.t('admin.tenants.subUpdateFailed'));
							console.error('Update failed:', result);
						}
					};
				}}
			>
				{#if editingSubscription}
					<input type="hidden" name="tenantId" value={editingSubscription.tenantId} />
					<div class="grid gap-4 py-4">
						<div class="grid grid-cols-4 items-center gap-4">
							<Label for="packageId" class="text-right">{i18n.t('admin.tenants.package')}</Label>
							<select
								id="packageId"
								name="packageId"
								class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 col-span-3"
								value={editingSubscription.packageId}
								required
							>
								{#each data.packages as pkg}
									<option value={pkg.id}
										>{pkg.name} (Rp {pkg.priceMonthly.toLocaleString('id-ID')})</option
									>
								{/each}
							</select>
						</div>
						<div class="grid grid-cols-4 items-center gap-4">
							<Label for="billingCycle" class="text-right">{i18n.t('admin.tenants.cycle')}</Label>
							<select
								id="billingCycle"
								name="billingCycle"
								class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 col-span-3"
								value={editingSubscription.billingCycle}
								required
							>
								<option value="monthly">{i18n.t('admin.tenants.monthly')}</option>
								<option value="yearly">{i18n.t('admin.tenants.yearly')}</option>
							</select>
						</div>
						<div class="grid grid-cols-4 items-center gap-4">
							<Label for="status" class="text-right">{i18n.t('admin.packages.status')}</Label>
							<select
								id="status"
								name="status"
								class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 col-span-3"
								value={editingSubscription.status}
								required
							>
								<option value="active">{i18n.t('admin.tenants.active')}</option>
								<option value="trial">{i18n.t('admin.tenants.trial')}</option>
								<option value="past_due">{i18n.t('admin.tenants.past_due')}</option>
								<option value="cancelled">{i18n.t('admin.tenants.cancelled')}</option>
							</select>
						</div>
						<div class="grid grid-cols-4 items-center gap-4">
							<Label for="currentPeriodEnd" class="text-right"
								>{i18n.t('admin.tenants.validUntil')}</Label
							>
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
						<Button
							type="button"
							variant="ghost"
							onclick={() => (isDialogOpen = false)}
							disabled={isSaving}>{i18n.t('actions.cancel')}</Button
						>
						<Button type="submit" disabled={isSaving}>
							{#if isSaving}
								<Loader2 class="mr-2 h-4 w-4 animate-spin" />
								{i18n.t('messages.loading.saving')}
							{:else}
								{i18n.t('actions.saveChanges')}
							{/if}
						</Button>
					</Dialog.Footer>
				{/if}
			</form>
		</Dialog.Content>
	</Dialog.Root>
</div>
