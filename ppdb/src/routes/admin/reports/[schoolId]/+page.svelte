<script lang="ts">
	import type { PageData } from './$types';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { ArrowLeft, TrendingUp, TrendingDown, AlertTriangle, Users, DollarSign, Activity } from 'lucide-svelte';
	import { formatCurrency } from '$lib/utils';
	import { i18n } from '$lib/i18n/index.svelte';
	import TrendLineChart from '../components/TrendLineChart.svelte';
	import PieChart from '../components/PieChart.svelte';
	import { goto } from '$app/navigation';

	let { data }: { data: PageData } = $props();

	const pieChartData = $derived(
		data.unitStats.map((u) => ({
			label: u.unitName,
			value: u.revenue || 0
		}))
	);
</script>

<div class="container mx-auto px-4 py-8 max-w-7xl">
	<!-- Header -->
	<div class="flex items-center gap-4 mb-8">
		<Button variant="ghost" size="sm" on:click={() => goto('/admin/reports')}>
			<ArrowLeft class="h-4 w-4 mr-2" />
			Back to Reports
		</Button>
		<div class="flex-1">
			<h1 class="text-3xl font-bold">{data.school.name}</h1>
			<p class="text-muted-foreground">
				{i18n.t('admin.reports.schoolDetail')}: {data.school.slug}
			</p>
		</div>
		<div class="flex gap-2">
			<div class="px-3 py-1 rounded-full text-sm font-medium {data.school.status === 'active'
				? 'bg-green-100 text-green-800'
				: 'bg-gray-100 text-gray-800'}">
				{data.school.status.toUpperCase()}
			</div>
		</div>
	</div>

	<!-- Anomaly Alert -->
	{#if data.metrics.anomaly.hasAnomaly}
		<Card.Root class="mb-6 border-red-200 bg-red-50">
			<Card.Content class="p-4">
				<div class="flex items-center gap-3">
					<AlertTriangle class="h-5 w-5 text-red-600" />
					<div>
						<p class="font-semibold text-red-900">Revenue Anomaly Detected</p>
						<p class="text-sm text-red-700">{data.metrics.anomaly.message}</p>
					</div>
				</div>
			</Card.Content>
		</Card.Root>
	{/if}

	<!-- Advanced Metrics KPIs -->
	<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
		<!-- MRR -->
		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between pb-2">
				<Card.Title class="text-sm font-medium">MRR</Card.Title>
				<DollarSign class="h-4 w-4 text-muted-foreground" />
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold">{formatCurrency(data.metrics.mrr)}</div>
				<p class="text-xs text-muted-foreground">Monthly Recurring Revenue</p>
			</Card.Content>
		</Card.Root>

		<!-- ARPU -->
		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between pb-2">
				<Card.Title class="text-sm font-medium">ARPU</Card.Title>
				<Users class="h-4 w-4 text-muted-foreground" />
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold">{formatCurrency(data.metrics.arpu)}</div>
				<p class="text-xs text-muted-foreground">Avg Revenue Per User</p>
			</Card.Content>
		</Card.Root>

		<!-- LTV -->
		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between pb-2">
				<Card.Title class="text-sm font-medium">LTV</Card.Title>
				<Activity class="h-4 w-4 text-muted-foreground" />
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold">{formatCurrency(data.metrics.ltv)}</div>
				<p class="text-xs text-muted-foreground">Lifetime Value</p>
			</Card.Content>
		</Card.Root>

		<!-- Churn Rate -->
		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between pb-2">
				<Card.Title class="text-sm font-medium">Churn Rate</Card.Title>
				<TrendingDown class="h-4 w-4 text-muted-foreground" />
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold">{data.metrics.churnRate.toFixed(1)}%</div>
				<p class="text-xs text-muted-foreground">School inactivity rate</p>
			</Card.Content>
		</Card.Root>
	</div>

	<!-- Charts Grid -->
	<div class="grid gap-4 md:grid-cols-2 mb-8">
		<TrendLineChart data={data.dailyRevenue} title="Revenue Trend (Last 30 Days)" />
		<PieChart data={pieChartData} title="Revenue by Unit" />
	</div>

	<!-- Unit Breakdown Table -->
	<Card.Root>
		<Card.Header>
			<Card.Title>Unit Performance</Card.Title>
			<Card.Description>Revenue and applications breakdown by unit</Card.Description>
		</Card.Header>
		<Card.Content>
			<div class="overflow-x-auto">
				<table class="w-full text-sm">
					<thead>
						<tr class="border-b">
							<th class="text-left p-3 font-medium">Unit Name</th>
							<th class="text-left p-3 font-medium">Level</th>
							<th class="text-right p-3 font-medium">Applications</th>
							<th class="text-right p-3 font-medium">Transactions</th>
							<th class="text-right p-3 font-medium">Revenue</th>
							<th class="text-right p-3 font-medium">Avg/Transaction</th>
						</tr>
					</thead>
					<tbody>
						{#each data.unitStats as unit}
							<tr class="border-b hover:bg-muted/50">
								<td class="p-3 font-medium">{unit.unitName}</td>
								<td class="p-3 text-muted-foreground">{unit.level}</td>
								<td class="p-3 text-right">{unit.appCount || 0}</td>
								<td class="p-3 text-right">{unit.transactionCount || 0}</td>
								<td class="p-3 text-right font-medium">
									{formatCurrency(unit.revenue || 0)}
								</td>
								<td class="p-3 text-right text-muted-foreground">
									{unit.transactionCount > 0
										? formatCurrency((unit.revenue || 0) / unit.transactionCount)
										: '-'}
								</td>
							</tr>
						{/each}
					</tbody>
					<tfoot>
						<tr class="border-t-2 bg-muted/50">
							<td class="p-3 font-bold" colspan="2">Total</td>
							<td class="p-3 text-right font-bold">
								{data.unitStats.reduce((sum, u) => sum + (u.appCount || 0), 0)}
							</td>
							<td class="p-3 text-right font-bold">
								{data.unitStats.reduce((sum, u) => sum + (u.transactionCount || 0), 0)}
							</td>
							<td class="p-3 text-right font-bold">
								{formatCurrency(
									data.unitStats.reduce((sum, u) => sum + (u.revenue || 0), 0)
								)}
							</td>
							<td class="p-3 text-right font-bold">
								{data.unitStats.reduce((sum, u) => sum + (u.transactionCount || 0), 0) > 0
									? formatCurrency(
											data.unitStats.reduce((sum, u) => sum + (u.revenue || 0), 0) /
												data.unitStats.reduce((sum, u) => sum + (u.transactionCount || 0), 0)
										)
									: '-'}
							</td>
						</tr>
					</tfoot>
				</table>
			</div>
		</Card.Content>
	</Card.Root>
</div>
