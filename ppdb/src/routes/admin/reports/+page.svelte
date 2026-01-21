<script lang="ts">
	import type { PageData } from './$types';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { TrendingUp, Users, School, CreditCard } from 'lucide-svelte';
	import { formatCurrency } from '$lib/utils';
	import RevenueChart from '$lib/components/admin/RevenueChart.svelte';
	import { i18n } from '$lib/i18n/index.svelte';

	let { data } = $props<{ data: PageData }>();
	let stats = $derived(data.stats);

	const maxDailyRevenue = $derived(
		Math.max(...(stats.financial.dailyRevenue?.map((d: any) => Number(d.amount)) || [0]), 1)
	);
</script>

<div class="container mx-auto px-4 py-8 max-w-6xl">
	<div class="flex items-center justify-between mb-8">
		<div>
			<h1 class="text-3xl font-bold tracking-tight">{i18n.t('admin.reports.title')}</h1>
			<p class="text-muted-foreground mt-1">{i18n.t('admin.reports.subtitle')}</p>
		</div>
		<div class="flex gap-2">
			<Button variant="outline">{i18n.t('admin.reports.exportCsv')}</Button>
			<Button variant="outline">{i18n.t('admin.reports.last7Days')}</Button>
		</div>
	</div>

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
	<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
		<div class="col-span-4">
			<RevenueChart data={stats.financial.dailyRevenue} maxRevenue={maxDailyRevenue} />
		</div>
		<Card.Root class="col-span-3">
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
							<div class="flex items-center">
								<div class="space-y-1">
									<p class="text-sm font-medium leading-none">{school.name}</p>
									<p class="text-xs text-muted-foreground">
										{i18n.t('admin.dashboard.appsCount', { count: school.appCount })}
									</p>
								</div>
								<div class="ml-auto font-medium">
									{formatCurrency(school.revenue)}
								</div>
							</div>
						{/each}
					{/if}
				</div>
			</Card.Content>
		</Card.Root>
	</div>
</div>
