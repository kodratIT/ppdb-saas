<script lang="ts">
	import type { PageData } from './$types';
	import { i18n } from '$lib/i18n/index.svelte';
	import * as Table from '$lib/components/ui/table';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import {
		DollarSign,
		TrendingUp,
		Users,
		AlertTriangle,
		CreditCard,
		Clock,
		CheckCircle2,
		ArrowRight
	} from 'lucide-svelte';
	import RevenueTrendChart from '$lib/components/admin/RevenueTrendChart.svelte';

	let { data }: { data: PageData } = $props();

	function formatCurrency(amount: number) {
		return new Intl.NumberFormat(i18n.language === 'id' ? 'id-ID' : 'en-US', {
			style: 'currency',
			currency: 'IDR',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0
		}).format(amount);
	}

	function formatDate(date: Date) {
		return new Date(date).toLocaleDateString(i18n.language === 'id' ? 'id-ID' : 'en-US', {
			dateStyle: 'medium'
		});
	}

	// Prepare Chart Data
	const revenueChartData = $derived(data.charts.revenue.map(r => r.revenue));
	const revenueChartLabels = $derived(data.charts.revenue.map(r => r.month));
	
	const growthChartData = $derived(data.charts.growth.map(g => g.count));
	const growthChartLabels = $derived(data.charts.growth.map(g => g.month));
</script>

<div class="flex flex-col gap-6 p-6">
	<div>
		<h1 class="text-3xl font-bold tracking-tight mb-1">{i18n.t('admin.subscription.overview')}</h1>
		<p class="text-muted-foreground">
			{i18n.t('admin.subscription.overviewSubtitle', {
				default: 'Monitor revenue, subscriptions, and billing health.'
			})}
		</p>
	</div>

	<!-- Stats Grid -->
	<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
		<!-- MRR Card -->
		<div class="bg-card p-4 rounded-xl border shadow-sm hover:shadow-md transition-shadow group">
			<div class="flex items-center justify-between mb-3">
				<div class="flex items-center gap-2">
					<DollarSign class="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
					<span
						class="text-[10px] font-black uppercase tracking-widest text-muted-foreground"
														>
						MRR
					</span>
				</div>
			</div>
			<div class="space-y-1">
				<div class="text-2xl font-bold tabular-nums">{formatCurrency(data.stats.mrr)}</div>
				<p class="text-xs text-muted-foreground">Monthly Recurring Revenue</p>
			</div>
		</div>
		<!-- ARR Card -->
		<div class="bg-card p-4 rounded-xl border shadow-sm hover:shadow-md transition-shadow group">
			<div class="flex items-center justify-between mb-3">
				<div class="flex items-center gap-2">
					<TrendingUp class="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
					<span
						class="text-[10px] font-black uppercase tracking-widest text-muted-foreground"
													>
						ARR
					</span>
				</div>
			</div>
			<div class="space-y-1">
				<div class="text-2xl font-bold tabular-nums">{formatCurrency(data.stats.arr)}</div>
				<p class="text-xs text-muted-foreground">Annual Run Rate</p>
			</div>
		</div>

		<!-- Active Tenants Card -->
		<div class="bg-card p-4 rounded-xl border shadow-sm hover:shadow-md transition-shadow group">
			<div class="flex items-center justify-between mb-3">
				<div class="flex items-center gap-2">
					<Users class="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
					<span
						class="text-[10px] font-black uppercase tracking-widest text-muted-foreground"
													>
						Active Tenants
					</span>
				</div>
			</div>
			<div class="space-y-1">
				<div class="text-2xl font-bold tabular-nums">{data.stats.activeCount}</div>
				<p class="text-xs text-muted-foreground">
					+ {data.stats.trialCount} on trial
				</p>
			</div>
		</div>

		<!-- Past Due Card -->
		<div class="bg-card p-4 rounded-xl border shadow-sm hover:shadow-md transition-shadow group">
			<div class="flex items-center justify-between mb-3">
				<div class="flex items-center gap-2">
					<AlertTriangle class="h-4 w-4 text-red-500" />
					<span
						class="text-[10px] font-black uppercase tracking-widest text-muted-foreground"
													>
						Past Due
					</span>
				</div>
			</div>
			<div class="space-y-1">
				<div class="text-2xl font-bold text-red-600 tabular-nums">{data.stats.pastDueCount}</div>
				<p class="text-xs text-muted-foreground">Subscriptions needing attention</p>
			</div>
		</div>
	</div>

	<!-- Analytics Charts -->
	<div class="grid gap-4 md:grid-cols-2">
		<div class="bg-card p-5 rounded-xl border shadow-sm">
			<div class="flex items-center gap-2 mb-4">
				<DollarSign class="h-4 w-4 text-muted-foreground" />
				<h3 class="text-sm font-semibold">Revenue Growth</h3>
				<span class="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-auto">
					Last 6 Months
				</span>
			</div>
			{#if revenueChartData.length > 0}
				<RevenueTrendChart
					data={revenueChartData}
					labels={revenueChartLabels}
					height={250}
					color="#10b981"
				/>
			{:else}
				<div class="h-[250px] flex items-center justify-center text-muted-foreground text-sm border border-dashed rounded-lg">
					No revenue data available yet
				</div>
			{/if}
		</div>

		<div class="bg-card p-5 rounded-xl border shadow-sm">
			<div class="flex items-center gap-2 mb-4">
				<Users class="h-4 w-4 text-muted-foreground" />
				<h3 class="text-sm font-semibold">New Tenants</h3>
				<span class="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-auto">
					Last 6 Months
				</span>
			</div>
			{#if growthChartData.length > 0}
				<RevenueTrendChart
					data={growthChartData}
					labels={growthChartLabels}
					height={250}
					color="#3b82f6"
				/>
			{:else}
				<div class="h-[250px] flex items-center justify-center text-muted-foreground text-sm border border-dashed rounded-lg">
					No growth data available yet
				</div>
			{/if}
		</div>
	</div>

	<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
		<!-- Recent Transactions -->
		<div class="bg-card rounded-xl border shadow-sm col-span-4">
			<div class="p-5 border-b flex items-center justify-between">
				<div class="flex items-center gap-2">
					<CreditCard class="h-4 w-4 text-muted-foreground" />
					<h3 class="text-sm font-semibold">Recent Transactions</h3>
				</div>
				<Button variant="ghost" size="sm" href="/admin/subscription/transactions" class="h-8">
					View all <ArrowRight class="ml-1 h-3 w-3" />
				</Button>
			</div>
			<div class="p-0">
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head class="text-[10px] font-black uppercase tracking-widest">Tenant</Table.Head>
							<Table.Head class="text-[10px] font-black uppercase tracking-widest text-right">Amount</Table.Head>
							<Table.Head class="text-[10px] font-black uppercase tracking-widest text-center">Status</Table.Head>
							<Table.Head class="text-[10px] font-black uppercase tracking-widest text-right">Date</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#if data.recentInvoices.length === 0}
							<Table.Row>
								<Table.Cell colspan={4} class="text-center py-8 text-muted-foreground">
									No recent transactions
								</Table.Cell>
							</Table.Row>
						{:else}
							{#each data.recentInvoices as row}
								<Table.Row class="hover:bg-muted/50">
									<Table.Cell>
										<div class="font-medium text-sm">{row.tenant?.name || 'Unknown'}</div>
										<div class="text-xs text-muted-foreground hidden sm:inline font-mono">
											{row.invoice.id.slice(0, 8)}
										</div>
									</Table.Cell>
									<Table.Cell class="text-right font-medium tabular-nums">
										{formatCurrency(row.invoice.amount)}
									</Table.Cell>
									<Table.Cell class="text-center">
										<Badge
											variant={row.invoice.status === 'paid'
												? 'default'
												: row.invoice.status === 'void'
													? 'destructive'
													: 'secondary'}
											class="text-xs"
										>
											{row.invoice.status}
										</Badge>
									</Table.Cell>
									<Table.Cell class="text-right text-muted-foreground text-sm">
										{formatDate(row.invoice.createdAt)}
									</Table.Cell>
								</Table.Row>
							{/each}
						{/if}
					</Table.Body>
				</Table.Root>
			</div>
		</div>

		<!-- Expiring Subscriptions -->
		<div class="bg-card rounded-xl border shadow-sm col-span-3">
			<div class="p-5 border-b flex items-center justify-between">
				<div class="flex items-center gap-2">
					<Clock class="h-4 w-4 text-orange-500" />
					<div>
						<h3 class="text-sm font-semibold">Expiring Soon</h3>
						<p class="text-xs text-muted-foreground">Next 7 days</p>
					</div>
				</div>
				<Button variant="ghost" size="sm" href="/admin/subscription/tenants" class="h-8">
					Manage <ArrowRight class="ml-1 h-3 w-3" />
				</Button>
			</div>
			<div class="p-5">
				<div class="space-y-4">
					{#if data.expiringSubscriptions.length === 0}
						<div class="text-center py-8 text-muted-foreground text-sm">
							<CheckCircle2 class="h-8 w-8 mx-auto mb-2 text-green-500 opacity-50" />
							No subscriptions expiring soon.
						</div>
					{:else}
						{#each data.expiringSubscriptions as item}
							<div class="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0 group hover:bg-muted/50 rounded-lg p-2 -mx-2 transition-colors">
								<div class="space-y-1">
									<p class="text-sm font-medium leading-none">{item.tenant?.name}</p>
									<p class="text-xs text-muted-foreground">
										{item.package?.name} • {item.subscription.billingCycle}
									</p>
								</div>
								<div class="text-right">
									<Badge variant="outline" class="text-xs mb-1">
										{new Date(item.subscription.currentPeriodEnd).toLocaleDateString(undefined, {
											month: 'short',
											day: 'numeric'
										})}
									</Badge>
									<p class="text-[10px] text-muted-foreground">
										{item.subscription.autoRenew ? 'Auto-renews' : 'Expires'}
									</p>
								</div>
							</div>
						{/each}
					{/if}
				</div>
			</div>
		</div>
	</div>
</div>
