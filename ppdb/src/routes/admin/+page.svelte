<script lang="ts">
	/* eslint-disable svelte/no-navigation-without-resolve */
	import type { PageData } from './$types';
	import DashboardLayout from '$lib/components/admin/DashboardLayout.svelte';
	import KPICard from '$lib/components/admin/KPICard.svelte';
	import RecentTenantsTable from '$lib/components/admin/RecentTenantsTable.svelte';
	import { formatCurrency } from '$lib/utils';
	import Button from '$lib/components/ui/button.svelte';
	import {
		TrendingUp,
		Users,
		CreditCard,
		DollarSign,
		School,
		Activity,
		CheckCircle2,
		Percent,
		BarChart3,
		Clock
	} from 'lucide-svelte';

	import RevenueTrendChart from '$lib/components/admin/charts/RevenueTrendChart.svelte';
	import ConversionFunnel from '$lib/components/admin/charts/ConversionFunnel.svelte';
	import RealTimePanel from '$lib/components/admin/RealTimePanel.svelte';

	let { data } = $props<{ data: PageData }>();
	let stats = $derived(data.stats);

	const onlineUsers = 1240; // Simulated
	const newRegToday = 145; // Simulated
	const pendingVerifications = stats.tenants.list.filter((t) => t.status === 'PENDING').length;
	const criticalActions = [
		{ id: '1', title: 'Global Islamic School', time: '2h ago', type: 'verification' as const },
		{ id: '2', title: 'St. Mary Academy', time: '4h ago', type: 'verification' as const },
		{ id: '3', title: 'Highland Primary', time: '5h ago', type: 'verification' as const }
	];

	const revenueData = $derived(stats.financial.dailyRevenue.map((d: any) => Number(d.amount)));
	const revenueLabels = $derived(
		stats.financial.dailyRevenue.map((d: any) => {
			const date = new Date(d.date);
			return `${date.getDate()}/${date.getMonth() + 1}`;
		})
	);

	const funnelSteps = [
		{ label: 'Registration', value: 2450, color: 'bg-blue-500' },
		{ label: 'Verification', value: 1820, color: 'bg-indigo-500' },
		{ label: 'Payment', value: 1240, color: 'bg-violet-500' },
		{ label: 'Completion', value: 1100, color: 'bg-emerald-500' }
	];

	const maxDailyRevenue = $derived(
		Math.max(...(stats.financial.dailyRevenue?.map((d: any) => Number(d.amount)) || [0]), 1)
	);
</script>

<DashboardLayout>
	{#snippet rightPanel()}
		<RealTimePanel {onlineUsers} {newRegToday} {pendingVerifications} {criticalActions} />
	{/snippet}

	<div class="space-y-8">
		<!-- Header -->
		<div class="flex justify-between items-end">
			<div>
				<h1 class="text-3xl font-black text-slate-900 uppercase tracking-tight">System Overview</h1>
				<p class="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">
					Central Intelligence Hub
				</p>
			</div>
			<div class="text-right hidden md:block">
				<p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Runtime</p>
				<p class="text-sm font-bold text-slate-700">{new Date().toLocaleTimeString()}</p>
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
				{#snippet icon()}<DollarSign class="w-5 h-5" />{/snippet}
			</KPICard>

			<KPICard
				title="Active Schools"
				value={stats.tenants.active}
				subtitle="of {stats.tenants.total} total"
				trend={4.2}
				trendDirection="up"
			>
				{#snippet icon()}<School class="w-5 h-5" />{/snippet}
			</KPICard>

			<KPICard
				title="Total Parents"
				value={stats.users.totalParents.toLocaleString()}
				subtitle="Registered users"
				trend={8.1}
				trendDirection="up"
			>
				{#snippet icon()}<Users class="w-5 h-5" />{/snippet}
			</KPICard>

			<KPICard
				title="Transactions"
				value={stats.financial.totalTransactions}
				subtitle="Successful count"
				trend={-2.4}
				trendDirection="down"
			>
				{#snippet icon()}<CreditCard class="w-5 h-5" />{/snippet}
			</KPICard>

			<KPICard
				title="Verification Queue"
				value={24}
				subtitle="Pending schools"
				trendDirection="neutral"
			>
				{#snippet icon()}<Clock class="w-5 h-5" />{/snippet}
			</KPICard>

			<KPICard
				title="Success Rate"
				value="98.2%"
				subtitle="Payment gateway"
				trend={0.5}
				trendDirection="up"
			>
				{#snippet icon()}<CheckCircle2 class="w-5 h-5" />{/snippet}
			</KPICard>

			<KPICard
				title="Conversion"
				value="14.2%"
				subtitle="Visit to Lead"
				trend={1.2}
				trendDirection="up"
			>
				{#snippet icon()}<Percent class="w-5 h-5" />{/snippet}
			</KPICard>

			<KPICard
				title="Avg Rev/School"
				value={formatCurrency(stats.financial.totalRevenue / (stats.tenants.active || 1))}
				subtitle="Monthly average"
				trend={3.8}
				trendDirection="up"
			>
				{#snippet icon()}<BarChart3 class="w-5 h-5" />{/snippet}
			</KPICard>
		</div>

		<!-- Rest of the dashboard content... -->
		<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
			<!-- Revenue Trend Chart -->
			<div class="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
				<div class="flex justify-between items-center mb-6">
					<div>
						<h3 class="text-sm font-bold text-slate-900 uppercase tracking-wider">
							Revenue Velocity
						</h3>
						<p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
							Financial Growth Pulse
						</p>
					</div>
					<div class="flex items-center gap-2">
						<span class="flex items-center gap-1 text-[10px] font-bold text-emerald-500">
							<TrendingUp class="w-3 h-3" />
							+12.5%
						</span>
						<div class="h-4 w-px bg-slate-200 mx-1"></div>
						<div class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
							Last 30 Days
						</div>
					</div>
				</div>

				<div class="h-64">
					{#if revenueData.length > 0}
						<RevenueTrendChart
							data={revenueData}
							labels={revenueLabels}
							height={256}
							color="#3b82f6"
						/>
					{:else}
						<div
							class="h-full flex items-center justify-center text-slate-400 text-xs font-bold uppercase tracking-widest italic opacity-50"
						>
							Not enough data to display trend
						</div>
					{/if}
				</div>
			</div>

			<!-- Conversion Funnel -->
			<div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
				<div class="mb-8">
					<h3 class="text-sm font-bold text-slate-900 uppercase tracking-wider">
						Conversion Funnel
					</h3>
					<p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
						Application Lifecycle
					</p>
				</div>
				<ConversionFunnel steps={funnelSteps} />
			</div>

			<!-- Market Leaders -->
			<div class="lg:col-span-2 bg-slate-900 text-white p-6 rounded-xl shadow-sm">
				<div class="flex justify-between items-center mb-6">
					<h3 class="text-sm font-bold uppercase tracking-wider">Market Leaders</h3>
					<div class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
						Top Performance
					</div>
				</div>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
					{#each stats.financial.topSchools as school, i}
						<div
							class="flex items-center justify-between pb-3 border-b border-slate-800 last:border-0 md:[&:nth-last-child(2)]:border-0"
						>
							<div class="flex items-center gap-3">
								<span class="text-[10px] font-bold text-slate-500">0{i + 1}</span>
								<div>
									<p class="text-xs font-bold uppercase truncate max-w-[140px]">{school.name}</p>
									<p class="text-[10px] text-slate-400">{school.appCount} Apps</p>
								</div>
							</div>
							<p class="text-xs font-bold">{formatCurrency(Number(school.revenue))}</p>
						</div>
					{/each}
				</div>
			</div>

			<!-- Active Nodes (Placeholder for future expansion) -->
			<div class="bg-blue-600 text-white p-6 rounded-xl shadow-sm flex flex-col justify-between">
				<div>
					<h3 class="text-sm font-bold uppercase tracking-wider mb-2">Regional Distribution</h3>
					<p class="text-xs text-blue-100 font-medium">System nodes active across 12 provinces.</p>
				</div>
				<div class="mt-8 flex justify-center">
					<Activity class="w-16 h-16 opacity-20 animate-pulse" />
				</div>
				<div class="mt-8 pt-4 border-t border-white/10">
					<Button
						variant="ghost"
						size="sm"
						class="w-full text-[10px] font-bold uppercase text-white hover:bg-white/10"
					>
						View Network Map
					</Button>
				</div>
			</div>
		</div>

		<!-- Pipeline Activity -->
		<div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
			<div class="p-6 border-b flex justify-between items-center bg-slate-50/50">
				<h3 class="text-sm font-bold text-slate-900 uppercase tracking-wider">Pipeline Activity</h3>
				<Button
					variant="ghost"
					size="sm"
					href="/admin/schools"
					class="text-[10px] font-bold uppercase">Manage All</Button
				>
			</div>
			<RecentTenantsTable tenants={stats.tenants.list} />
		</div>
	</div>
</DashboardLayout>
