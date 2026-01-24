<script lang="ts">
	import type { PageData } from './$types';
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
		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="text-sm font-medium">MRR</Card.Title>
				<DollarSign class="h-4 w-4 text-muted-foreground" />
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold">{formatCurrency(data.stats.mrr)}</div>
				<p class="text-xs text-muted-foreground">Monthly Recurring Revenue</p>
			</Card.Content>
		</Card.Root>
		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="text-sm font-medium">ARR</Card.Title>
				<TrendingUp class="h-4 w-4 text-muted-foreground" />
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold">{formatCurrency(data.stats.arr)}</div>
				<p class="text-xs text-muted-foreground">Annual Run Rate</p>
			</Card.Content>
		</Card.Root>
		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="text-sm font-medium">Active Tenants</Card.Title>
				<Users class="h-4 w-4 text-muted-foreground" />
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold">{data.stats.activeCount}</div>
				<p class="text-xs text-muted-foreground">
					+ {data.stats.trialCount} on trial
				</p>
			</Card.Content>
		</Card.Root>
		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="text-sm font-medium">Past Due</Card.Title>
				<AlertTriangle class="h-4 w-4 text-red-500" />
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold text-red-600">{data.stats.pastDueCount}</div>
				<p class="text-xs text-muted-foreground">Subscriptions needing attention</p>
			</Card.Content>
		</Card.Root>
	</div>

	<!-- Analytics Charts -->
	<div class="grid gap-4 md:grid-cols-2">
		<Card.Root>
			<Card.Header>
				<Card.Title class="text-sm font-medium flex items-center gap-2">
					<DollarSign class="h-4 w-4" />
					Revenue Growth (Last 6 Months)
				</Card.Title>
			</Card.Header>
			<Card.Content class="pt-4">
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
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header>
				<Card.Title class="text-sm font-medium flex items-center gap-2">
					<Users class="h-4 w-4" />
					New Tenants Growth (Last 6 Months)
				</Card.Title>
			</Card.Header>
			<Card.Content class="pt-4">
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
			</Card.Content>
		</Card.Root>
	</div>

	<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
		<!-- Recent Transactions -->
		<Card.Root class="col-span-4">
			<Card.Header>
				<Card.Title>Recent Transactions</Card.Title>
			</Card.Header>
			<Card.Content>
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head>Tenant</Table.Head>
							<Table.Head>Amount</Table.Head>
							<Table.Head>Status</Table.Head>
							<Table.Head>Date</Table.Head>
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
								<Table.Row>
									<Table.Cell>
										<div class="font-medium">{row.tenant?.name || 'Unknown'}</div>
										<div class="text-xs text-muted-foreground hidden sm:inline">
											{row.invoice.id.slice(0, 8)}
										</div>
									</Table.Cell>
									<Table.Cell>{formatCurrency(row.invoice.amount)}</Table.Cell>
									<Table.Cell>
										<Badge
											variant={row.invoice.status === 'paid'
												? 'default'
												: row.invoice.status === 'void'
													? 'destructive'
													: 'secondary'}
										>
											{row.invoice.status}
										</Badge>
									</Table.Cell>
									<Table.Cell class="text-muted-foreground text-sm">
										{formatDate(row.invoice.createdAt)}
									</Table.Cell>
								</Table.Row>
							{/each}
						{/if}
					</Table.Body>
				</Table.Root>
				<div class="mt-4 flex justify-end">
					<Button variant="ghost" size="sm" href="/admin/subscription/transactions">
						View all transactions <ArrowRight class="ml-2 h-4 w-4" />
					</Button>
				</div>
			</Card.Content>
		</Card.Root>

		<!-- Expiring Subscriptions -->
		<Card.Root class="col-span-3">
			<Card.Header>
				<Card.Title>Expiring Soon</Card.Title>
				<Card.Description>Subscriptions ending in next 7 days</Card.Description>
			</Card.Header>
			<Card.Content>
				<div class="space-y-4">
					{#if data.expiringSubscriptions.length === 0}
						<div class="text-center py-8 text-muted-foreground text-sm">
							<CheckCircle2 class="h-8 w-8 mx-auto mb-2 text-green-500 opacity-50" />
							No subscriptions expiring soon.
						</div>
					{:else}
						{#each data.expiringSubscriptions as item}
							<div class="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
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
				<div class="mt-6 flex justify-end">
					<Button variant="ghost" size="sm" href="/admin/subscription/tenants">
						Manage tenants <ArrowRight class="ml-2 h-4 w-4" />
					</Button>
				</div>
			</Card.Content>
		</Card.Root>
	</div>
</div>
