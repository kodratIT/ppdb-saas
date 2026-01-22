<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import { Badge } from '$lib/components/ui/badge';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import * as Table from '$lib/components/ui/table';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Separator } from '$lib/components/ui/separator';
	import { ArrowLeft, CreditCard, Calendar, Users, AlertTriangle, Loader2 } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import type { PageData } from './$types';
	import { i18n } from '$lib/i18n/index.svelte';

	let { data }: { data: PageData } = $props();

	let isManageDialogOpen = $state(false);
	let isExtendDialogOpen = $state(false);
	let isCancelDialogOpen = $state(false);
	let isSaving = $state(false);

	const { tenant, subscription, package: pkg, applicationCount, invoices } = data.tenantData!;

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
</script>

<div class="flex flex-col gap-6 p-6">
	<div class="flex items-center gap-4">
		<a
			href="/admin/subscription/tenants"
			class={buttonVariants({ variant: 'ghost', size: 'icon' })}
		>
			<ArrowLeft class="h-4 w-4" />
		</a>
		<div>
			<h1 class="text-2xl font-bold tracking-tight">{tenant.name}</h1>
			<p class="text-muted-foreground">{tenant.slug}</p>
		</div>
		<div class="ml-auto flex gap-2">
			{#if subscription?.status === 'trial'}
				<Button variant="outline" onclick={() => (isExtendDialogOpen = true)}>
					<Calendar class="mr-2 h-4 w-4" />
					{i18n.t('admin.tenants.extendTrial')}
				</Button>
			{/if}
			{#if subscription?.status !== 'cancelled'}
				<Button variant="destructive" onclick={() => (isCancelDialogOpen = true)}>
					<AlertTriangle class="mr-2 h-4 w-4" />
					{i18n.t('admin.tenants.cancelSubscription')}
				</Button>
			{/if}
			<Button onclick={() => (isManageDialogOpen = true)}>
				<CreditCard class="mr-2 h-4 w-4" />
				{i18n.t('admin.tenants.manageSubscription')}
			</Button>
		</div>
	</div>

	<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
		<!-- Subscription Details -->
		<Card.Root class="lg:col-span-2">
			<Card.Header>
				<Card.Title>{i18n.t('admin.tenants.subscriptionDetails')}</Card.Title>
			</Card.Header>
			<Card.Content class="grid gap-6 sm:grid-cols-2">
				<div class="space-y-1">
					<p class="text-sm font-medium text-muted-foreground">{i18n.t('admin.tenants.status')}</p>
					<Badge variant={getStatusVariant(subscription?.status)}>
						{subscription?.status?.toUpperCase() ?? 'NONE'}
					</Badge>
				</div>
				<div class="space-y-1">
					<p class="text-sm font-medium text-muted-foreground">{i18n.t('admin.tenants.package')}</p>
					<div class="font-medium">{pkg?.name ?? '-'}</div>
				</div>
				<div class="space-y-1">
					<p class="text-sm font-medium text-muted-foreground">
						{i18n.t('admin.tenants.billingCycle')}
					</p>
					<div class="capitalize">{subscription?.billingCycle ?? '-'}</div>
				</div>
				<div class="space-y-1">
					<p class="text-sm font-medium text-muted-foreground">
						{i18n.t('admin.tenants.validUntil')}
					</p>
					<div>
						{subscription?.currentPeriodEnd
							? new Date(subscription.currentPeriodEnd).toLocaleDateString()
							: '-'}
					</div>
				</div>
			</Card.Content>
		</Card.Root>

		<!-- Usage Stats -->
		<Card.Root>
			<Card.Header>
				<Card.Title>{i18n.t('admin.tenants.usageStats')}</Card.Title>
			</Card.Header>
			<Card.Content class="grid gap-4">
				<div class="flex items-center gap-4">
					<div
						class="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary"
					>
						<Users class="h-5 w-5" />
					</div>
					<div class="flex-1 space-y-1">
						<p class="text-sm font-medium leading-none">{i18n.t('admin.tenants.students')}</p>
						<p class="text-muted-foreground">
							{applicationCount} / {pkg?.limits?.max_students === -1
								? '∞'
								: (pkg?.limits?.max_students ?? 0)}
						</p>
						{#if pkg && pkg.limits?.max_students !== -1}
							{@const percentage = getUsagePercentage(
								applicationCount,
								pkg.limits?.max_students as number
							)}
							<div class="h-2 w-full rounded-full bg-secondary">
								<div
									class="h-full rounded-full transition-all {getUsageColor(percentage)}"
									style="width: {percentage}%"
								></div>
							</div>
						{/if}
					</div>
				</div>
			</Card.Content>
		</Card.Root>
	</div>

	<!-- Invoices -->
	<Card.Root>
		<Card.Header>
			<Card.Title>{i18n.t('admin.tenants.invoiceHistory')}</Card.Title>
		</Card.Header>
		<Card.Content>
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>{i18n.t('common.date')}</Table.Head>
						<Table.Head>{i18n.t('common.amount')}</Table.Head>
						<Table.Head>{i18n.t('common.status')}</Table.Head>
						<Table.Head>{i18n.t('common.notes')}</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#if invoices && invoices.length > 0}
						{#each invoices as invoice}
							<Table.Row>
								<Table.Cell>
									{invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString() : '-'}
								</Table.Cell>
								<Table.Cell>Rp {invoice.amount.toLocaleString('id-ID')}</Table.Cell>
								<Table.Cell>
									<Badge variant={invoice.status === 'paid' ? 'default' : 'secondary'}>
										{invoice.status.toUpperCase()}
									</Badge>
								</Table.Cell>
								<Table.Cell>{invoice.notes ?? '-'}</Table.Cell>
							</Table.Row>
						{/each}
					{:else}
						<Table.Row>
							<Table.Cell colspan={4} class="h-24 text-center text-muted-foreground">
								{i18n.t('common.noData')}
							</Table.Cell>
						</Table.Row>
					{/if}
				</Table.Body>
			</Table.Root>
		</Card.Content>
	</Card.Root>

	<!-- Manage Subscription Dialog -->
	<Dialog.Root bind:open={isManageDialogOpen}>
		<Dialog.Content class="sm:max-w-[425px]">
			<Dialog.Header>
				<Dialog.Title>{i18n.t('admin.tenants.manageSubscription')}</Dialog.Title>
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
							isManageDialogOpen = false;
							update();
						} else {
							toast.dismiss(toastId);
							toast.error(i18n.t('admin.tenants.subUpdateFailed'));
						}
					};
				}}
			>
				<div class="grid gap-4 py-4">
					<div class="grid gap-2">
						<Label for="packageId">{i18n.t('admin.tenants.package')}</Label>
						<select
							id="packageId"
							name="packageId"
							class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
							value={subscription?.packageId}
							required
						>
							{#each data.packages as p}
								<option value={p.id}>{p.name} (Rp {p.priceMonthly.toLocaleString('id-ID')})</option>
							{/each}
						</select>
					</div>
					<div class="grid gap-2">
						<Label for="billingCycle">{i18n.t('admin.tenants.billingCycle')}</Label>
						<select
							id="billingCycle"
							name="billingCycle"
							class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
							value={subscription?.billingCycle ?? 'monthly'}
							required
						>
							<option value="monthly">{i18n.t('admin.tenants.monthly')}</option>
							<option value="yearly">{i18n.t('admin.tenants.yearly')}</option>
						</select>
					</div>
					<div class="grid gap-2">
						<Label for="status">{i18n.t('admin.tenants.status')}</Label>
						<select
							id="status"
							name="status"
							class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
							value={subscription?.status ?? 'active'}
							required
						>
							<option value="active">{i18n.t('admin.tenants.active')}</option>
							<option value="trial">{i18n.t('admin.tenants.trial')}</option>
							<option value="past_due">{i18n.t('admin.tenants.past_due')}</option>
							<option value="cancelled">{i18n.t('admin.tenants.cancelled')}</option>
						</select>
					</div>
					<div class="grid gap-2">
						<Label for="currentPeriodEnd">{i18n.t('admin.tenants.validUntil')}</Label>
						<Input
							id="currentPeriodEnd"
							name="currentPeriodEnd"
							type="date"
							value={subscription?.currentPeriodEnd
								? new Date(subscription.currentPeriodEnd).toISOString().split('T')[0]
								: new Date().toISOString().split('T')[0]}
							required
						/>
					</div>
				</div>
				<Dialog.Footer>
					<Button
						type="button"
						variant="ghost"
						onclick={() => (isManageDialogOpen = false)}
						disabled={isSaving}
					>
						{i18n.t('actions.cancel')}
					</Button>
					<Button type="submit" disabled={isSaving}>
						{#if isSaving}
							<Loader2 class="mr-2 h-4 w-4 animate-spin" />
						{/if}
						{i18n.t('actions.saveChanges')}
					</Button>
				</Dialog.Footer>
			</form>
		</Dialog.Content>
	</Dialog.Root>

	<!-- Extend Trial Dialog -->
	<Dialog.Root bind:open={isExtendDialogOpen}>
		<Dialog.Content class="sm:max-w-[425px]">
			<Dialog.Header>
				<Dialog.Title>{i18n.t('admin.tenants.extendTrial')}</Dialog.Title>
			</Dialog.Header>
			<form
				action="?/extendTrial"
				method="POST"
				use:enhance={() => {
					isSaving = true;
					return async ({ result, update }) => {
						isSaving = false;
						if (result.type === 'success') {
							toast.success(i18n.t('admin.tenants.trialExtended'));
							isExtendDialogOpen = false;
							update();
						} else {
							toast.error(i18n.t('admin.tenants.actionFailed'));
						}
					};
				}}
			>
				<div class="grid gap-4 py-4">
					<div class="grid gap-2">
						<Label>{i18n.t('admin.tenants.duration')}</Label>
						<div class="flex flex-col gap-2">
							{#each [7, 14, 30] as days}
								<div class="flex items-center space-x-2">
									<input
										type="radio"
										id="d{days}"
										name="days"
										value={days}
										class="aspect-square h-4 w-4 rounded-full border border-primary text-primary shadow focus:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
										checked={days === 7}
									/>
									<Label for="d{days}">{days} {i18n.t('common.days')}</Label>
								</div>
							{/each}
						</div>
					</div>
				</div>
				<Dialog.Footer>
					<Button
						type="button"
						variant="ghost"
						onclick={() => (isExtendDialogOpen = false)}
						disabled={isSaving}
					>
						{i18n.t('actions.cancel')}
					</Button>
					<Button type="submit" disabled={isSaving}>
						{i18n.t('actions.confirm')}
					</Button>
				</Dialog.Footer>
			</form>
		</Dialog.Content>
	</Dialog.Root>

	<!-- Cancel Subscription Dialog -->
	<Dialog.Root bind:open={isCancelDialogOpen}>
		<Dialog.Content class="sm:max-w-[425px]">
			<Dialog.Header>
				<Dialog.Title>{i18n.t('admin.tenants.cancelSubscription')}</Dialog.Title>
				<Dialog.Description>
					{i18n.t('admin.tenants.cancelWarning')}
				</Dialog.Description>
			</Dialog.Header>
			<form
				action="?/cancelSubscription"
				method="POST"
				use:enhance={() => {
					isSaving = true;
					return async ({ result, update }) => {
						isSaving = false;
						if (result.type === 'success') {
							toast.success(i18n.t('admin.tenants.subCancelled'));
							isCancelDialogOpen = false;
							update();
						} else {
							toast.error(i18n.t('admin.tenants.actionFailed'));
						}
					};
				}}
			>
				<Dialog.Footer>
					<Button
						type="button"
						variant="ghost"
						onclick={() => (isCancelDialogOpen = false)}
						disabled={isSaving}
					>
						{i18n.t('actions.keepSubscription')}
					</Button>
					<Button type="submit" variant="destructive" disabled={isSaving}>
						{i18n.t('actions.confirmCancel')}
					</Button>
				</Dialog.Footer>
			</form>
		</Dialog.Content>
	</Dialog.Root>
</div>
