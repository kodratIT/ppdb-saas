<script lang="ts">
	/* eslint-disable svelte/no-navigation-without-resolve */
	import type { PageData } from './$types';
	import KPICard from '$lib/components/admin/KPICard.svelte';
	import RecentTenantsTable from '$lib/components/admin/RecentTenantsTable.svelte';
	import MarketLeadersCard from '$lib/components/admin/MarketLeadersCard.svelte';
	import LiveStatusCard from '$lib/components/admin/LiveStatusCard.svelte';
	import RevenueChart from '$lib/components/admin/RevenueChart.svelte';
	import { formatCurrency } from '$lib/utils';
	import {
		Users,
		CreditCard,
		DollarSign,
		School,
		CheckCircle2,
		Percent,
		BarChart3,
		Clock,
		CalendarDays
	} from 'lucide-svelte';
	import Button from '$lib/components/ui/button.svelte';

	let { data } = $props<{ data: PageData }>();
	let stats = $derived(data.stats);

	const maxDailyRevenue = $derived(
		Math.max(...(stats.financial.dailyRevenue?.map((d: any) => Number(d.amount)) || [0]), 1)
	);

	const pendingVerifications = $derived(
		stats.tenants.list.filter((t: any) => t.status === 'PENDING').length
	);
</script>

<div class="space-y-8 p-8 pt-6">
	<!-- Header -->
	<div class="flex items-center justify-between space-y-2">
		<div>
			<h2 class="text-3xl font-bold tracking-tight text-foreground">Dashboard</h2>
			<p class="text-muted-foreground">
				System overview and performance metrics.
			</p>
		</div>
		<div class="flex items-center space-x-2">
			<Button variant="outline" size="sm" class="hidden md:flex">
				<CalendarDays class="mr-2 h-4 w-4" />
				{new Date().toLocaleDateString('id-ID', {
					weekday: 'long',
					year: 'numeric',
					month: 'long',
					day: 'numeric'
				})}
			</Button>
			<Button size="sm">Download Report</Button>
		</div>
	</div>

	<!-- KPI Grid -->
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
		<KPICard
			title="Total Revenue"
			value={formatCurrency(stats.financial.totalRevenue)}
			subtitle="Gross processed"
			trend={12.5}
			trendDirection="up"
		>
			{#snippet icon()}<DollarSign class="w-4 h-4" />{/snippet}
		</KPICard>

		<KPICard
			title="Active Schools"
			value={stats.tenants.active}
			subtitle="of {stats.tenants.total} total"
			trend={4.2}
			trendDirection="up"
		>
			{#snippet icon()}<School class="w-4 h-4" />{/snippet}
		</KPICard>

		<KPICard
			title="Total Parents"
			value={stats.users.totalParents.toLocaleString()}
			subtitle="Registered users"
			trend={8.1}
			trendDirection="up"
		>
			{#snippet icon()}<Users class="w-4 h-4" />{/snippet}
		</KPICard>

		<KPICard
			title="Transactions"
			value={stats.financial.totalTransactions}
			subtitle="Successful count"
			trend={-2.4}
			trendDirection="down"
		>
			{#snippet icon()}<CreditCard class="w-4 h-4" />{/snippet}
		</KPICard>

		<KPICard
			title="Verification Queue"
			value={pendingVerifications}
			subtitle="Pending schools"
			trendDirection="neutral"
		>
			{#snippet icon()}<Clock class="w-4 h-4" />{/snippet}
		</KPICard>

		<KPICard
			title="Success Rate"
			value="98.2%"
			subtitle="Payment gateway"
			trend={0.5}
			trendDirection="up"
		>
			{#snippet icon()}<CheckCircle2 class="w-4 h-4" />{/snippet}
		</KPICard>

		<KPICard
			title="Conversion"
			value="14.2%"
			subtitle="Visit to Lead"
			trend={1.2}
			trendDirection="up"
		>
			{#snippet icon()}<Percent class="w-4 h-4" />{/snippet}
		</KPICard>

		<KPICard
			title="Avg Rev/School"
			value={formatCurrency(stats.financial.totalRevenue / (stats.tenants.active || 1))}
			subtitle="Monthly average"
			trend={3.8}
			trendDirection="up"
		>
			{#snippet icon()}<BarChart3 class="w-4 h-4" />{/snippet}
		</KPICard>
	</div>

	<!-- Charts & Market Leaders -->
	<div class="grid grid-cols-1 lg:grid-cols-7 gap-4">
		<!-- Revenue Trend Chart (4 cols) -->
		<div class="lg:col-span-4">
			<RevenueChart data={stats.financial.dailyRevenue} maxRevenue={maxDailyRevenue} />
		</div>

		<!-- Market Leaders (3 cols) -->
		<div class="lg:col-span-3 space-y-4">
			<MarketLeadersCard schools={stats.financial.topSchools} />
			<LiveStatusCard />
		</div>
	</div>

	<!-- Pipeline Activity -->
	<RecentTenantsTable tenants={stats.tenants.list} />
</div>
