<script lang="ts">
	import type { PageData } from './$types';
	import SubscriptionNav from '$lib/components/admin/SubscriptionNav.svelte';
	import * as Card from '$lib/components/ui/card';
	import * as Table from '$lib/components/ui/table';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import Progress from '$lib/components/ui/progress.svelte';
	import {
		Plus,
		Edit,
		Trash2,
		CheckCircle2,
		XCircle,
		Ticket,
		Copy,
		Check,
		AlertTriangle,
		Clock,
		Zap,
		X
	} from 'lucide-svelte';
	import { i18n } from '$lib/i18n/index.svelte';
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';

	let { data }: { data: PageData } = $props();

	// Selection State
	let selectedIds = $state<string[]>([]);
	let isBulkUpdating = $state(false);

	function formatDate(date: Date | null) {
		if (!date) return 'Never';
		return new Date(date).toLocaleDateString('id-ID', {
			dateStyle: 'medium'
		});
	}

	function copyToClipboard(text: string) {
		navigator.clipboard.writeText(text);
		toast.success('Coupon code copied to clipboard!');
	}

	// Bulk Action Handlers
	function toggleSelectAll() {
		if (selectedIds.length === data.coupons.length) {
			selectedIds = [];
		} else {
			selectedIds = data.coupons.map((c) => c.id);
		}
	}

	function toggleSelect(id: string) {
		if (selectedIds.includes(id)) {
			selectedIds = selectedIds.filter((i) => i !== id);
		} else {
			selectedIds = [...selectedIds, id];
		}
	}

	async function handleBulkAction(action: 'activate' | 'deactivate' | 'delete') {
		if (selectedIds.length === 0) return;

		const confirmMsg =
			action === 'delete'
				? `Are you sure you want to delete ${selectedIds.length} coupons?`
				: `Update ${selectedIds.length} coupons to ${action.toUpperCase()}?`;

		if (!confirm(confirmMsg)) return;

		isBulkUpdating = true;
		const toastId = toast.loading(`${action === 'delete' ? 'Deleting' : 'Updating'} coupons...`);

		const formData = new FormData();
		formData.append('ids', JSON.stringify(selectedIds));

		let url = '?/bulkUpdateStatus';
		if (action === 'delete') {
			url = '?/bulkDelete';
		} else {
			formData.append('isActive', action === 'activate' ? 'true' : 'false');
		}

		try {
			const response = await fetch(url, {
				method: 'POST',
				body: formData
			});

			if (response.ok) {
				toast.success('Bulk action completed successfully', { id: toastId });
				selectedIds = [];
				goto(page.url.pathname + page.url.search, { invalidateAll: true });
			} else {
				toast.error('Bulk action failed', { id: toastId });
			}
		} catch (error) {
			toast.error('An error occurred', { id: toastId });
		} finally {
			isBulkUpdating = false;
		}
	}

	function getUsageStats(coupon: any) {
		const used = coupon.redemptionsCount || 0;
		const max = coupon.maxRedemptions;
		if (!max) return { percent: 0, label: `${used} / ∞` };
		const percent = Math.min(Math.round((used / max) * 100), 100);
		return { percent, label: `${used} / ${max}` };
	}

	function getCouponStatus(coupon: any) {
		const isExpired = coupon.expiresAt && new Date(coupon.expiresAt) < new Date();
		const isExhausted = coupon.maxRedemptions && coupon.redemptionsCount >= coupon.maxRedemptions;

		if (isExpired) return { label: 'Expired', variant: 'destructive' as const };
		if (isExhausted) return { label: 'Exhausted', variant: 'outline' as const };
		if (!coupon.isActive) return { label: 'Inactive', variant: 'secondary' as const };
		return { label: 'Active', variant: 'default' as const };
	}
</script>

<div class="flex flex-col gap-6 p-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold tracking-tight mb-1">Coupon Management</h1>
			<p class="text-muted-foreground">Create and manage discount codes.</p>
		</div>
		<Button href="/admin/subscription/coupons/new">
			<Plus class="mr-2 h-4 w-4" /> New Coupon
		</Button>
	</div>

	<!-- Stats Grid -->
	<div class="grid gap-4 md:grid-cols-3">
		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="text-sm font-medium">Active Coupons</Card.Title>
				<Zap class="h-4 w-4 text-green-500" />
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold">{data.stats.activeCount}</div>
				<p class="text-xs text-muted-foreground">Currently valid and active</p>
			</Card.Content>
		</Card.Root>
		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="text-sm font-medium">Total Redemptions</Card.Title>
				<Ticket class="h-4 w-4 text-blue-500" />
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold">{data.stats.totalRedemptions}</div>
				<p class="text-xs text-muted-foreground">Across all coupons</p>
			</Card.Content>
		</Card.Root>
		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="text-sm font-medium">Expiring Soon</Card.Title>
				<Clock class="h-4 w-4 text-orange-500" />
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold">{data.stats.expiringSoon}</div>
				<p class="text-xs text-muted-foreground">Expiring within 7 days</p>
			</Card.Content>
		</Card.Root>
	</div>

	<Card.Root>
		<Card.Content class="p-0">
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head class="w-10">
							<Checkbox
								checked={selectedIds.length === data.coupons.length && data.coupons.length > 0}
								onCheckedChange={toggleSelectAll}
							/>
						</Table.Head>
						<Table.Head>Code</Table.Head>
						<Table.Head>Type</Table.Head>
						<Table.Head>Value</Table.Head>
						<Table.Head>Usage</Table.Head>
						<Table.Head>Expires</Table.Head>
						<Table.Head>Status</Table.Head>
						<Table.Head class="text-right">Actions</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#if data.coupons.length === 0}
						<Table.Row>
							<Table.Cell colspan={8} class="text-center py-8 text-muted-foreground">
								<Ticket class="h-8 w-8 mx-auto mb-2 opacity-20" />
								No coupons found. Create your first one!
							</Table.Cell>
						</Table.Row>
					{:else}
						{#each data.coupons as coupon}
							{@const status = getCouponStatus(coupon)}
							{@const usage = getUsageStats(coupon)}
							<Table.Row class={!coupon.isActive || status.label === 'Expired' ? 'opacity-60 grayscale-[0.5]' : ''}>
								<Table.Cell>
									<Checkbox
										checked={selectedIds.includes(coupon.id)}
										onCheckedChange={() => toggleSelect(coupon.id)}
									/>
								</Table.Cell>
								<Table.Cell>
									<div class="flex items-center gap-2">
										<span class="font-bold font-mono">{coupon.code}</span>
										<Button variant="ghost" size="icon" class="h-6 w-6" onclick={() => copyToClipboard(coupon.code)}>
											<Copy class="h-3 w-3" />
										</Button>
									</div>
								</Table.Cell>
								<Table.Cell class="capitalize text-xs">{coupon.type.replace('_', ' ')}</Table.Cell>
								<Table.Cell class="font-medium">
									{coupon.type === 'percentage' ? `${coupon.value}%` : `Rp ${coupon.value.toLocaleString('id-ID')}`}
								</Table.Cell>
								<Table.Cell>
									<div class="flex flex-col gap-1 w-24">
										<div class="flex justify-between text-[10px] text-muted-foreground uppercase font-bold">
											<span>{usage.label}</span>
											{#if coupon.maxRedemptions}
												<span>{usage.percent}%</span>
											{/if}
										</div>
										<Progress value={usage.percent} class="h-1.5 {usage.percent > 90 ? 'bg-red-100' : ''}" />
									</div>
								</Table.Cell>
								<Table.Cell class="text-xs whitespace-nowrap">{formatDate(coupon.expiresAt)}</Table.Cell>
								<Table.Cell>
									<Badge variant={status.variant}>
										{status.label}
									</Badge>
								</Table.Cell>
								<Table.Cell class="text-right">
									<div class="flex justify-end gap-1">
										<form method="POST" action="?/toggleStatus" use:enhance>
											<input type="hidden" name="id" value={coupon.id} />
											<input type="hidden" name="isActive" value={coupon.isActive} />
											<Button variant="ghost" size="icon" type="submit" title={coupon.isActive ? 'Deactivate' : 'Activate'}>
												{#if coupon.isActive}
													<XCircle class="h-4 w-4 text-orange-500" />
												{:else}
													<CheckCircle2 class="h-4 w-4 text-green-500" />
												{/if}
											</Button>
										</form>
										<Button variant="ghost" size="icon" href="/admin/subscription/coupons/{coupon.id}">
											<Edit class="h-4 w-4" />
										</Button>
										<form method="POST" action="?/delete" use:enhance onsubmit={() => confirm('Are you sure?')}>
											<input type="hidden" name="id" value={coupon.id} />
											<Button variant="ghost" size="icon" type="submit" class="text-red-500">
												<Trash2 class="h-4 w-4" />
											</Button>
										</form>
									</div>
								</Table.Cell>
							</Table.Row>
						{/each}
					{/if}
				</Table.Body>
			</Table.Root>
		</Card.Content>
	</Card.Root>

	<!-- Bulk Action Bar -->
	{#if selectedIds.length > 0}
		<div
			class="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-4 rounded-full shadow-2xl flex items-center gap-6 animate-in fade-in slide-in-from-bottom-4 z-50 border border-slate-700"
		>
			<div class="flex items-center gap-2">
				<div class="bg-primary text-primary-foreground h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold">
					{selectedIds.length}
				</div>
				<span class="text-sm font-medium">kupon dipilih</span>
			</div>
			
			<div class="h-6 w-px bg-slate-700"></div>
			
			<div class="flex items-center gap-2">
				<Button 
					size="sm" 
					variant="ghost" 
					class="text-white hover:bg-slate-800"
					onclick={() => handleBulkAction('activate')}
					disabled={isBulkUpdating}
				>
					<CheckCircle2 class="mr-2 h-4 w-4 text-green-400" />
					Activate
				</Button>
				<Button 
					size="sm" 
					variant="ghost" 
					class="text-white hover:bg-slate-800"
					onclick={() => handleBulkAction('deactivate')}
					disabled={isBulkUpdating}
				>
					<XCircle class="mr-2 h-4 w-4 text-orange-400" />
					Deactivate
				</Button>
				<Button 
					size="sm" 
					variant="ghost" 
					class="text-white hover:bg-red-900/50 hover:text-red-400"
					onclick={() => handleBulkAction('delete')}
					disabled={isBulkUpdating}
				>
					<Trash2 class="mr-2 h-4 w-4 text-red-400" />
					Delete
				</Button>
			</div>
			
			<div class="h-6 w-px bg-slate-700"></div>
			
			<Button size="sm" variant="ghost" class="text-slate-400 hover:text-white" onclick={() => selectedIds = []}>
				<X class="h-4 w-4" />
			</Button>
		</div>
	{/if}
</div>
