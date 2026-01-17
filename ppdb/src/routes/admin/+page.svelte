<script lang="ts">
	/* eslint-disable svelte/no-navigation-without-resolve */
	import type { PageData } from './$types';
	import DashboardLayout from '$lib/components/admin/DashboardLayout.svelte';
	import KPICard from '$lib/components/admin/KPICard.svelte';
	import RecentTenantsTable from '$lib/components/admin/RecentTenantsTable.svelte';
	import { formatCurrency } from '$lib/utils';
	import Button from '$lib/components/ui/button.svelte';
	import {
		Users,
		CreditCard,
		DollarSign,
		School,
		CheckCircle2,
		Percent,
		BarChart3,
		Clock
	} from 'lucide-svelte';

	let { data } = $props<{ data: PageData }>();
	let stats = $derived(data.stats);

	const maxDailyRevenue = $derived(
		Math.max(...(stats.financial.dailyRevenue?.map((d: any) => Number(d.amount)) || [0]), 1)
	);

	const pendingVerifications = $derived(
		stats.tenants.list.filter((t: any) => t.status === 'PENDING').length
	);
</script>

<DashboardLayout>
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
				value={pendingVerifications}
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

		<!-- Charts & Market Leaders -->
		<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
			<!-- Revenue Trend Chart -->
			<div class="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
				<div class="flex justify-between items-center mb-6">
					<h3 class="text-sm font-bold text-slate-900 uppercase tracking-wider">
						Revenue Velocity
					</h3>
					<div class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
						Last 30 Days
					</div>
				</div>
				<div class="h-64 flex items-end gap-1">
					{#each stats.financial.dailyRevenue as day}
						<div
							class="flex-1 bg-slate-100 hover:bg-blue-500 transition-colors rounded-t-sm group relative"
							style="height: {(Number(day.amount) / maxDailyRevenue) * 100}%"
						>
							<div
								class="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10"
							>
								{formatCurrency(Number(day.amount))}
							</div>
						</div>
					{/each}
				</div>
			</div>

			<!-- Market Leaders -->
			<div class="bg-slate-900 text-white p-6 rounded-xl shadow-sm">
				<h3 class="text-sm font-bold uppercase tracking-wider mb-6">Market Leaders</h3>
				<div class="space-y-4">
					{#each stats.financial.topSchools as school, i}
						<div
							class="flex items-center justify-between pb-3 border-b border-slate-800 last:border-0"
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
