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
	import { cn } from '$lib/utils';
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

		if (isExpired) return { label: 'Expired', variant: 'destructive' as const, icon: AlertTriangle };
		if (isExhausted) return { label: 'Exhausted', variant: 'outline' as const, icon: Zap };
		if (!coupon.isActive) return { label: 'Inactive', variant: 'secondary' as const, icon: XCircle };
		return { label: 'Active', variant: 'default' as const, icon: CheckCircle2 };
	}
</script>

<div class="space-y-6 p-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold tracking-tight mb-1">Coupon Management</h1>
			<p class="text-muted-foreground">Create and manage discount codes.</p>
		</div>
		<Button href="/admin/subscription/coupons/new" class="rounded-xl">
			<Plus class="mr-2 h-4 w-4" /> New Coupon
		</Button>
	</div>

	<!-- Stats Grid -->
	<div class="grid gap-4 md:grid-cols-3">
		<Card.Root class="rounded-xl shadow-sm border">
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="text-[10px] font-black uppercase tracking-widest text-muted-foreground"
					>Active Coupons</Card.Title
				>
				<Zap class="h-4 w-4 text-green-500" />
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold">{data.stats.activeCount}</div>
				<p class="text-[10px] text-muted-foreground uppercase font-bold tracking-tight mt-1">
					Valid and active
				</p>
			</Card.Content>
		</Card.Root>
		<Card.Root class="rounded-xl shadow-sm border">
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="text-[10px] font-black uppercase tracking-widest text-muted-foreground"
					>Total Redemptions</Card.Title
				>
				<Ticket class="h-4 w-4 text-blue-500" />
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold">{data.stats.totalRedemptions}</div>
				<p class="text-[10px] text-muted-foreground uppercase font-bold tracking-tight mt-1">
					Across all usage
				</p>
			</Card.Content>
		</Card.Root>
		<Card.Root class="rounded-xl shadow-sm border">
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="text-[10px] font-black uppercase tracking-widest text-muted-foreground"
					>Expiring Soon</Card.Title
				>
				<Clock class="h-4 w-4 text-orange-500" />
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold">{data.stats.expiringSoon}</div>
				<p class="text-[10px] text-muted-foreground uppercase font-bold tracking-tight mt-1">
					Within next 7 days
				</p>
			</Card.Content>
		</Card.Root>
	</div>

	<!-- Table Container -->
	<div class="bg-card rounded-xl border shadow-sm overflow-hidden">
		<div class="overflow-x-auto">
			<table class="w-full text-left border-collapse">
				<thead>
					<tr class="bg-muted/30 border-b">
						<th class="p-4 w-10">
							<Checkbox
								checked={selectedIds.length === data.coupons.length && data.coupons.length > 0}
								onCheckedChange={toggleSelectAll}
							/>
						</th>
						<th class="p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground"
							>Code</th
						>
						<th
							class="p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center"
							>Type</th
						>
						<th
							class="p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center"
							>Value</th
						>
						<th class="p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground"
							>Usage</th
						>
						<th class="p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground"
							>Expires</th
						>
						<th
							class="p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center"
							>Status</th
						>
						<th
							class="p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right"
							>Actions</th
						>
					</tr>
				</thead>
				<tbody class="divide-y">
					{#if data.coupons.length === 0}
						<tr>
							<td colspan="8" class="p-12 text-center text-muted-foreground italic text-sm">
								<Ticket class="h-8 w-8 mx-auto mb-2 opacity-20" />
								No coupons found. Create your first one!
							</td>
						</tr>
					{:else}
						{#each data.coupons as coupon (coupon.id)}
							{@const status = getCouponStatus(coupon)}
							{@const usage = getUsageStats(coupon)}
							<tr
								class={cn(
									'hover:bg-muted/20 transition-colors group',
									(!coupon.isActive || status.label === 'Expired') && 'opacity-60 grayscale-[0.5]'
								)}
							>
								<td class="p-4">
									<Checkbox
										checked={selectedIds.includes(coupon.id)}
										onCheckedChange={() => toggleSelect(coupon.id)}
									/>
								</td>
								<td class="p-4">
									<div class="flex items-center gap-2">
										<span class="font-bold font-mono text-sm tracking-tight text-primary"
											>{coupon.code}</span
										>
										<Button
											variant="ghost"
											size="icon"
											class="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
											onclick={() => copyToClipboard(coupon.code)}
										>
											<Copy class="h-3 w-3" />
										</Button>
									</div>
								</td>
								<td class="p-4 text-center">
									<Badge variant="outline" class="text-[9px] uppercase font-black px-1.5 py-0">
										{coupon.type.replace('_', ' ')}
									</Badge>
								</td>
								<td class="p-4 text-center">
									<span class="text-sm font-bold tabular-nums">
										{coupon.type === 'percentage'
											? `${coupon.value}%`
											: `Rp ${coupon.value.toLocaleString('id-ID')}`}
									</span>
								</td>
								<td class="p-4">
									<div class="flex flex-col gap-1 w-24">
										<div class="flex justify-between text-[9px] text-muted-foreground uppercase font-black tracking-tight">
											<span>{usage.label}</span>
											{#if coupon.maxRedemptions}
												<span>{usage.percent}%</span>
											{/if}
										</div>
										<Progress value={usage.percent} class="h-1.5 {usage.percent > 90 ? 'bg-red-100' : ''}" />
									</div>
								</td>
								<td class="p-4 text-xs font-medium whitespace-nowrap">
									{formatDate(coupon.expiresAt)}
								</td>
								<td class="p-4 text-center">
									<Badge
										variant={status.variant}
										class="text-[9px] uppercase font-black tracking-tight flex items-center gap-1.5 mx-auto w-fit"
									>
										{@const Icon = status.icon}
										<Icon class="w-2.5 h-2.5" />
										{status.label}
									</Badge>
								</td>
								<td class="p-4 text-right">
									<div class="flex justify-end gap-1">
										<form method="POST" action="?/toggleStatus" use:enhance>
											<input type="hidden" name="id" value={coupon.id} />
											<input type="hidden" name="isActive" value={coupon.isActive} />
											<Button
												variant="ghost"
												size="icon"
												class="h-8 w-8"
												type="submit"
												title={coupon.isActive ? 'Deactivate' : 'Activate'}
											>
												{#if coupon.isActive}
													<XCircle class="h-4 w-4 text-orange-500" />
												{:else}
													<CheckCircle2 class="h-4 w-4 text-green-500" />
												{/if}
											</Button>
										</form>
										<Button
											variant="ghost"
											size="icon"
											class="h-8 w-8"
											href="/admin/subscription/coupons/{coupon.id}"
										>
											<Edit class="h-4 w-4" />
										</Button>
										<form
											method="POST"
											action="?/delete"
											use:enhance
											onsubmit={() => confirm('Are you sure?')}
										>
											<input type="hidden" name="id" value={coupon.id} />
											<Button variant="ghost" size="icon" class="h-8 w-8 text-red-500" type="submit">
												<Trash2 class="h-4 w-4" />
											</Button>
										</form>
									</div>
								</td>
							</tr>
						{/each}
					{/if}
				</tbody>
			</table>
		</div>
	</div>

	<!-- Bulk Action Bar -->
	{#if selectedIds.length > 0}
		<div
			class="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-4 rounded-full shadow-2xl flex items-center gap-6 animate-in fade-in slide-in-from-bottom-4 z-50 border border-slate-700"
		>
			<div class="flex items-center gap-2">
				<div
					class="bg-primary text-primary-foreground h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-black"
				>
					{selectedIds.length}
				</div>
				<span class="text-xs font-black uppercase tracking-widest">Kupon Dipilih</span>
			</div>

			<div class="h-6 w-px bg-slate-700"></div>

			<div class="flex items-center gap-2">
				<Button
					size="sm"
					variant="ghost"
					class="text-[10px] font-black uppercase tracking-widest text-white hover:bg-slate-800"
					onclick={() => handleBulkAction('activate')}
					disabled={isBulkUpdating}
				>
					<CheckCircle2 class="mr-2 h-4 w-4 text-green-400" />
					Activate
				</Button>
				<Button
					size="sm"
					variant="ghost"
					class="text-[10px] font-black uppercase tracking-widest text-white hover:bg-slate-800"
					onclick={() => handleBulkAction('deactivate')}
					disabled={isBulkUpdating}
				>
					<XCircle class="mr-2 h-4 w-4 text-orange-400" />
					Deactivate
				</Button>
				<Button
					size="sm"
					variant="ghost"
					class="text-[10px] font-black uppercase tracking-widest text-white hover:bg-red-900/50 hover:text-red-400"
					onclick={() => handleBulkAction('delete')}
					disabled={isBulkUpdating}
				>
					<Trash2 class="mr-2 h-4 w-4 text-red-400" />
					Delete
				</Button>
			</div>

			<div class="h-6 w-px bg-slate-700"></div>

			<Button
				size="sm"
				variant="ghost"
				class="text-slate-400 hover:text-white"
				onclick={() => (selectedIds = [])}
			>
				<X class="h-4 w-4" />
			</Button>
		</div>
	{/if}
</div>
