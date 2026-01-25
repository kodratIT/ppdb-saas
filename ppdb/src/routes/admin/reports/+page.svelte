<script lang="ts">
	import type { PageData } from './$types';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { TrendingUp, Users, School, CreditCard } from 'lucide-svelte';
	import { formatCurrency } from '$lib/utils';
	import RevenueChart from '$lib/components/admin/RevenueChart.svelte';
	import { i18n } from '$lib/i18n/index.svelte';
	import DateRangePicker from './components/DateRangePicker.svelte';
	import ExportDropdown from './components/ExportDropdown.svelte';
	import FilterPanel from './components/FilterPanel.svelte';
	import TrendLineChart from './components/TrendLineChart.svelte';
	import PieChart from './components/PieChart.svelte';
	import { goto } from '$app/navigation';

	let { data } = $props<{ data: PageData }>();
	let stats = $derived(data.stats);

	let dateRange = $state<{ from: Date; to: Date }>({
		from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
		to: new Date()
	});

	interface FilterState {
		schoolIds: string[];
		planType: string;
		paymentStatus: string;
	}

	let filters = $state<FilterState>({
		schoolIds: [],
		planType: 'all',
		paymentStatus: 'all'
	});

	const maxDailyRevenue = $derived(
		Math.max(...(stats.financial.dailyRevenue?.map((d: any) => Number(d.amount)) || [0]), 1)
	);

	async function handleDateRangeChange(range: { from: Date; to: Date }) {
		dateRange = range;
		await updateURL();
	}

	async function handleFilterChange(newFilters: FilterState) {
		filters = newFilters;
		await updateURL();
	}

	async function updateURL() {
		const params = new URLSearchParams();
		params.set('from', dateRange.from.toISOString());
		params.set('to', dateRange.to.toISOString());

		if (filters.schoolIds.length > 0) {
			params.set('schools', filters.schoolIds.join(','));
		}
		if (filters.planType !== 'all') {
			params.set('plan', filters.planType);
		}
		if (filters.paymentStatus !== 'all') {
			params.set('status', filters.paymentStatus);
		}

		goto(`?${params.toString()}`, { keepFocus: true, noScroll: true });
	}

	const pieChartData = $derived(
		stats.financial.topSchools.map((s: any) => ({
			label: s.name,
			value: s.revenue
		}))
	);
</script>

<div class="container mx-auto px-4 py-8 max-w-6xl">
	<div class="flex items-center justify-between mb-8">
		<div>
			<h1 class="text-3xl font-bold tracking-tight">{i18n.t('admin.reports.title')}</h1>
			<p class="text-muted-foreground mt-1">{i18n.t('admin.reports.subtitle')}</p>
		</div>
		<div class="flex gap-2">
			<DateRangePicker value={dateRange} onChange={handleDateRangeChange} />
			<FilterPanel
				schools={stats.tenants.list.map((t: any) => ({ id: t.id, name: t.name }))}
				onFilterChange={handleFilterChange}
			/>
			<ExportDropdown {data} {dateRange} />
		</div>
	</div>

	<!-- Filters Summary -->
	{#if filters.schoolIds.length > 0 || filters.planType !== 'all' || filters.paymentStatus !== 'all'}
		<div class="mb-6 p-4 bg-muted/50 rounded-lg">
			<div class="flex items-center gap-4 text-sm">
				<span class="font-medium">Active Filters:</span>
				{#if filters.schoolIds.length > 0}
					<span class="px-2 py-1 bg-primary/10 text-primary rounded">
						{filters.schoolIds.length} School{filters.schoolIds.length > 1 ? 's' : ''}
					</span>
				{/if}
				{#if filters.planType !== 'all'}
					<span class="px-2 py-1 bg-primary/10 text-primary rounded">
						Plan: {filters.planType}
					</span>
				{/if}
				{#if filters.paymentStatus !== 'all'}
					<span class="px-2 py-1 bg-primary/10 text-primary rounded">
						Status: {filters.paymentStatus}
					</span>
				{/if}
			</div>
		</div>
	{/if}

	<!-- KPI Cards -->
	<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="text-sm font-medium">{i18n.t('admin.dashboard.totalRevenue')}</Card.Title
				>
				<CreditCard class="h-4 w-4 text-muted-foreground" />
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold">{formatCurrency(stats.financial.totalRevenue)}</div>
				<p class="text-xs text-muted-foreground">{i18n.t('admin.dashboard.grossProcessed')}</p>
			</Card.Content>
		</Card.Root>
		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="text-sm font-medium"
					>{i18n.t('admin.dashboard.organizations')}</Card.Title
				>
				<School class="h-4 w-4 text-muted-foreground" />
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold">{stats.tenants.active}</div>
				<p class="text-xs text-muted-foreground">
					{i18n.t('admin.dashboard.activeTotal', { total: stats.tenants.total })}
				</p>
			</Card.Content>
		</Card.Root>
		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="text-sm font-medium">{i18n.t('admin.dashboard.totalParents')}</Card.Title
				>
				<Users class="h-4 w-4 text-muted-foreground" />
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold">{stats.users.totalParents.toLocaleString()}</div>
				<p class="text-xs text-muted-foreground">{i18n.t('admin.dashboard.registeredUsers')}</p>
			</Card.Content>
		</Card.Root>
		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="text-sm font-medium">{i18n.t('admin.dashboard.transactions')}</Card.Title
				>
				<TrendingUp class="h-4 w-4 text-muted-foreground" />
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold">{stats.financial.totalTransactions}</div>
				<p class="text-xs text-muted-foreground">{i18n.t('admin.dashboard.successfulCount')}</p>
			</Card.Content>
		</Card.Root>
	</div>

	<!-- Chart & Leaders Grid -->
	<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mb-6">
		<div class="col-span-4">
			<RevenueChart data={stats.financial.dailyRevenue} maxRevenue={maxDailyRevenue} />
		</div>
		<div class="col-span-3">
			<PieChart data={pieChartData} />
		</div>
	</div>

	<!-- Trend Line Chart -->
	<div class="mb-6">
		<TrendLineChart data={stats.financial.dailyRevenue} />
	</div>

	<!-- Top Schools -->
	<Card.Root class="mb-8">
		<Card.Header>
			<Card.Title>{i18n.t('admin.reports.topPerformingSchools')}</Card.Title>
			<Card.Description>{i18n.t('admin.reports.basedOnRevenue')}</Card.Description>
		</Card.Header>
		<Card.Content>
			<div class="space-y-4">
				{#if stats.financial.topSchools.length === 0}
					<p class="text-sm text-center text-muted-foreground py-8">
							{i18n.t('admin.reports.noData')}
						</p>
					{:else}
						{#each stats.financial.topSchools as school}
							<button
								class="flex items-center w-full hover:bg-muted/50 rounded p-2 transition-colors text-left"
								onclick={() => goto(`/admin/reports/${school.id}`)}
							>
								<div class="space-y-1 flex-1">
									<p class="text-sm font-medium leading-none">{school.name}</p>
									<p class="text-xs text-muted-foreground">
										{i18n.t('admin.dashboard.appsCount', { count: school.appCount })}
									</p>
								</div>
								<div class="ml-auto font-medium">
									{formatCurrency(school.revenue)}
								</div>
							</button>
						{/each}
					{/if}
				</div>
			</Card.Content>
		</Card.Root>
</div>
