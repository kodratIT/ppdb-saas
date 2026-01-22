<script lang="ts">
	import { enhance } from '$app/forms';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import * as Dialog from '$lib/components/ui/dialog';
	import { ArrowLeft, Calendar, Users, Package, CreditCard, Loader2 } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import type { PageData } from './$types';
	import { i18n } from '$lib/i18n/index.svelte';

	let { data }: { data: PageData } = $props();

	let isSaving = $state(false);
	let isExtendingTrial = $state(false);
	let extendDays = $state(30);

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

	function getStatusText(status: string | undefined) {
		if (!status) return 'No Subscription';
		const key = `admin.tenants.${status.toLowerCase()}` as any;
		const translated = i18n.t(key);
		return translated !== key ? translated : status;
	}

	function getCycleText(cycle: string | undefined) {
		if (!cycle) return '-';
		const key = `admin.tenants.${cycle.toLowerCase()}` as any;
		const translated = i18n.t(key);
		return translated !== key ? translated : cycle;
	}

	let isDialogOpen = $state(false);
</script>

<div class="container mx-auto px-4 py-8 max-w-6xl">
	<div class="mb-6">
		<Button variant="ghost" href="/admin/subscription/tenants">
			<ArrowLeft class="mr-2 h-4 w-4" />
			Back to Tenants
		</Button>
	</div>

	<div class="grid gap-6">
		<div class="flex justify-between items-center">
			<div>
				<h1 class="text-3xl font-bold tracking-tight">{data.tenant.name}</h1>
				<p class="text-muted-foreground mt-1">Subscription Management</p>
			</div>
			{#if data.subscription?.status}
				<Badge variant={getStatusVariant(data.subscription.status)}>
					{getStatusText(data.subscription.status)}
				</Badge>
			{/if}
		</div>

		<div class="grid gap-6 md:grid-cols-2">
			<Card.Root>
				<Card.Header>
					<Card.Title class="flex items-center gap-2">
						<Package class="h-5 w-5" />
						Subscription Details
					</Card.Title>
				</Card.Header>
				<Card.Content class="space-y-4">
					<div class="flex justify-between">
						<span class="text-muted-foreground">Package</span>
						<span class="font-medium">
							{#if data.package}
								<Badge variant="outline">{data.package.name}</Badge>
							{:else}
								<span class="text-muted-foreground">-</span>
							{/if}
						</span>
					</div>
					<div class="flex justify-between">
						<span class="text-muted-foreground">Status</span>
						<Badge variant={getStatusVariant(data.subscription?.status)}>
							{getStatusText(data.subscription?.status)}
						</Badge>
					</div>
					<div class="flex justify-between">
						<span class="text-muted-foreground">Billing Cycle</span>
						<span class="font-medium">{getCycleText(data.subscription?.billingCycle)}</span>
					</div>
					<div class="flex justify-between">
						<span class="text-muted-foreground">Valid Until</span>
						<span class="font-medium">
							{data.subscription?.currentPeriodEnd
								? new Date(data.subscription.currentPeriodEnd).toLocaleDateString(
										i18n.language === 'id' ? 'id-ID' : 'en-US'
									)
								: '-'}
						</span>
					</div>
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Header>
					<Card.Title class="flex items-center gap-2">
						<Users class="h-5 w-5" />
						Usage Statistics
					</Card.Title>
				</Card.Header>
				<Card.Content class="space-y-4">
					<div class="flex justify-between">
						<span class="text-muted-foreground">Students</span>
						<span class="font-medium">{data.applicationCount}</span>
					</div>
					{#if data.package?.limits}
						<div class="flex justify-between">
							<span class="text-muted-foreground">Limit</span>
							<span class="font-medium">
								{data.package.limits.max_students === -1 ? 'Unlimited' : data.package.limits.max_students}
							</span>
						</div>
					{/if}
					<div class="flex justify-between">
						<span class="text-muted-foreground">Package Type</span>
						<span class="font-medium">
							{data.package?.priceMonthly === 0 ? 'Free Trial' : 'Paid'}
						</span>
					</div>
				</Card.Content>
			</Card.Root>
		</div>

		{#if data.subscription && data.subscription.status !== 'cancelled'}
			<div class="flex gap-3">
				<Button onclick={() => (isDialogOpen = true)} variant="outline">
					<Calendar class="mr-2 h-4 w-4" />
					Extend Trial
				</Button>
				<form
					method="POST"
					action="?/cancelSubscription"
					use:enhance={() => {
						isSaving = true;
						return async ({ result, update }) => {
							isSaving = false;
							if (result.type === 'success') {
								toast.success('Subscription cancelled successfully');
								update();
							} else {
								toast.error('Failed to cancel subscription');
							}
						};
					}}
				>
					<input type="hidden" name="tenantId" value={data.tenant.id} />
					<Button type="submit" variant="destructive" disabled={isSaving}>
						{#if isSaving}
							<Loader2 class="mr-2 h-4 w-4 animate-spin" />
						{/if}
						Cancel Subscription
					</Button>
				</form>
			</div>
		{/if}

		{#if data.subscription?.status === 'cancelled'}
			<Card.Root class="border-destructive">
				<Card.Content class="p-6 text-center">
					<p class="text-muted-foreground">This subscription has been cancelled.</p>
				</Card.Content>
			</Card.Root>
		{/if}
	</div>

	<Dialog.Root bind:open={isDialogOpen}>
		<Dialog.Content>
			<Dialog.Header>
				<Dialog.Title>Extend Trial Period</Dialog.Title>
				<Dialog.Description>
					Extend the trial period for {data.tenant.name}.
				</Dialog.Description>
			</Dialog.Header>
			<form
				method="POST"
				action="?/extendTrial"
				use:enhance={() => {
					isExtendingTrial = true;
					const toastId = toast.loading('Extending trial period...');
					return async ({ result, update }) => {
						isExtendingTrial = false;
						toast.dismiss(toastId);
						if (result.type === 'success') {
							toast.success('Trial period extended successfully');
							isDialogOpen = false;
							update();
						} else {
							toast.error('Failed to extend trial');
						}
					};
				}}
				class="space-y-4"
			>
				<input type="hidden" name="tenantId" value={data.tenant.id} />
				<div>
					<label for="days" class="block text-sm font-medium mb-2">Days to Extend</label>
					<input
						id="days"
						name="days"
						type="number"
						class="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
						bind:value={extendDays}
						min="1"
						max="365"
						required
					/>
				</div>
				<Dialog.Footer>
					<Button
						type="button"
						variant="ghost"
						onclick={() => (isDialogOpen = false)}
						disabled={isExtendingTrial}
					>
						Cancel
					</Button>
					<Button type="submit" disabled={isExtendingTrial}>
						{#if isExtendingTrial}
							<Loader2 class="mr-2 h-4 w-4 animate-spin" />
						{/if}
						Extend
					</Button>
				</Dialog.Footer>
			</form>
		</Dialog.Content>
	</Dialog.Root>
</div>
