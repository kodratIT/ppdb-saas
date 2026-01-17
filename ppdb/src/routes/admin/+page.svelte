<script lang="ts">
	/* eslint-disable svelte/no-navigation-without-resolve */
	import type { PageData } from './$types';
	import StatsCard from '$lib/components/admin/StatsCard.svelte';
	import RecentTenantsTable from '$lib/components/admin/RecentTenantsTable.svelte';
	import { formatCurrency } from '$lib/utils';
	import Button from '$lib/components/ui/button.svelte';
	import { TrendingUp, Users, CreditCard, DollarSign, School } from 'lucide-svelte';

	let { data } = $props<{ data: PageData }>();

	// Derived state for reactivity
	let stats = $derived(data.stats);
	let inactiveTenants = $derived(data.stats.tenants.total - data.stats.tenants.active);

	// Find max revenue for chart scaling
	const maxDailyRevenue = $derived(
		Math.max(...(stats.financial.dailyRevenue?.map((d: any) => Number(d.amount)) || [0]), 1)
	);
</script>

<div class="space-y-8 p-2">
	<div class="flex justify-between items-end">
		<div>
			<h1 class="text-4xl font-black text-[#002C5F] uppercase tracking-tight leading-none">
				Executive Summary
			</h1>
			<p class="text-gray-500 font-bold uppercase text-[10px] tracking-[0.3em] mt-2">
				Global Dashboard Console • PPDB-SAAS Enterprise
			</p>
		</div>
		<div class="text-right">
			<p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">System Time</p>
			<p class="text-sm font-bold text-[#002C5F]">{new Date().toLocaleTimeString()}</p>
		</div>
	</div>

	<!-- Main Stats Grid -->
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
		<StatsCard
			title="Total Schools"
			value={stats.tenants.total}
			subtitle="{stats.tenants.active} Active Schools"
			iconColor="text-blue-600"
		>
			<span slot="icon"><School class="w-6 h-6" /></span>
		</StatsCard>

		<StatsCard
			title="Total Parents"
			value={stats.users.totalParents}
			subtitle="Across all tenants"
			iconColor="text-green-600"
		>
			<span slot="icon"><Users class="w-6 h-6" /></span>
		</StatsCard>

		<StatsCard
			title="Transactions"
			value={stats.financial.totalTransactions}
			subtitle="Successful payments"
			iconColor="text-purple-600"
		>
			<span slot="icon"><CreditCard class="w-6 h-6" /></span>
		</StatsCard>

		<StatsCard
			title="Total Revenue"
			value={formatCurrency(stats.financial.totalRevenue)}
			subtitle="Gross Volume (Paid)"
			iconColor="text-yellow-600"
		>
			<span slot="icon"><DollarSign class="w-6 h-6" /></span>
		</StatsCard>
	</div>

	<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
		<!-- Financial Trend (Revenue) -->
		<div class="lg:col-span-2 bg-white p-8 rounded-2xl border shadow-sm flex flex-col">
			<div class="flex justify-between items-center mb-10">
				<div>
					<h3 class="text-xl font-black text-[#002C5F] uppercase tracking-tight">Revenue Trend</h3>
					<p class="text-xs font-bold text-gray-400 uppercase tracking-widest">
						Daily performance (Last 30 Days)
					</p>
				</div>
				<div
					class="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-2"
				>
					<TrendingUp class="w-3 h-3" /> Growth Insight
				</div>
			</div>

			<div class="flex-1 flex items-end gap-2 min-h-[250px] relative">
				{#each stats.financial.dailyRevenue as day}
					<div class="flex-1 flex flex-col items-center group relative h-full justify-end">
						<!-- Tooltip -->
						<div
							class="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white px-2 py-1 rounded text-[10px] font-bold z-10 whitespace-nowrap"
						>
							{formatCurrency(Number(day.amount))}
						</div>
						<!-- Bar -->
						<div
							class="w-full bg-[#002C5F] rounded-t-sm transition-all duration-700 hover:bg-blue-600"
							style="height: {(Number(day.amount) / maxDailyRevenue) * 100}%"
						></div>
						<span class="text-[8px] font-bold text-gray-400 mt-2 rotate-45 md:rotate-0"
							>{new Date(day.date).getDate()}</span
						>
					</div>
				{:else}
					<div
						class="absolute inset-0 flex items-center justify-center text-gray-400 text-xs font-bold uppercase tracking-widest italic opacity-50"
					>
						Not enough data to display trend
					</div>
				{/each}
			</div>
		</div>

		<!-- Top Performing Schools -->
		<div class="bg-[#001A3A] text-white p-8 rounded-2xl shadow-xl flex flex-col">
			<h3 class="text-xl font-black uppercase tracking-tight mb-8">Top Institutions</h3>
			<div class="space-y-6 flex-1">
				{#each stats.financial.topSchools as school, i}
					<div class="flex items-center justify-between border-b border-white/5 pb-4 last:border-0">
						<div class="flex items-center gap-4">
							<span class="text-xs font-black opacity-30">0{i + 1}</span>
							<div>
								<p class="font-black text-xs uppercase truncate max-w-[120px]">{school.name}</p>
								<p class="text-[9px] font-bold text-blue-400 uppercase tracking-widest">
									{school.appCount} Apps
								</p>
							</div>
						</div>
						<p class="text-xs font-black text-right">{formatCurrency(Number(school.revenue))}</p>
					</div>
				{/each}
			</div>
			<div class="mt-8 pt-6 border-t border-white/10">
				<div class="flex items-center justify-between text-blue-300">
					<span class="text-[10px] font-black uppercase tracking-[0.2em]">System Status</span>
					<span class="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest">
						<span class="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
						Operational
					</span>
				</div>
			</div>
		</div>
	</div>

	<!-- Recent Activity (Table) -->
	<div class="bg-white rounded-2xl border shadow-sm overflow-hidden">
		<div class="p-8 border-b flex justify-between items-center bg-gray-50/50">
			<div>
				<h3 class="text-xl font-black text-[#002C5F] uppercase tracking-tight">
					Recent Onboarding
				</h3>
				<p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
					Latest School Integrations
				</p>
			</div>
			<Button
				variant="outline"
				size="sm"
				href="/admin/schools"
				class="font-black text-[10px] uppercase border-[#002C5F] text-[#002C5F] hover:bg-blue-50"
			>
				View All Schools
			</Button>
		</div>
		<RecentTenantsTable tenants={stats.tenants.list} />
	</div>
</div>
