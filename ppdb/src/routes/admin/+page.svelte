<script lang="ts">
	/* eslint-disable svelte/no-navigation-without-resolve */
	import type { PageData } from './$types';
	import KPICard from '$lib/components/admin/KPICard.svelte';
	import RecentTenantsTable from '$lib/components/admin/RecentTenantsTable.svelte';
	import MarketLeadersCard from '$lib/components/admin/MarketLeadersCard.svelte';
	import LiveStatusCard from '$lib/components/admin/LiveStatusCard.svelte';
	import RevenueChart from '$lib/components/admin/RevenueChart.svelte';
	import * as Card from '$lib/components/ui/card';
	import * as Table from '$lib/components/ui/table';
	import Badge from '$lib/components/ui/badge.svelte';
	import { formatCurrency } from '$lib/utils';
	import { i18n } from '$lib/i18n/index.svelte';
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
	import AdminPageHeader from '$lib/components/admin/AdminPageHeader.svelte';

	let { data } = $props<{ data: PageData }>();
	let stats = $derived(data.stats);

	const maxDailyRevenue = $derived(
		Math.max(...(stats.financial.dailyRevenue?.map((d: any) => Number(d.amount)) || [0]), 1)
	);

	const pendingVerifications = $derived(
		stats.tenants.list.filter((t: any) => t.status === 'PENDING').length
	);
</script>

<AdminPageHeader
	title={i18n.t('admin.dashboard.title')}
	description={i18n.t('admin.dashboard.subtitle')}
>
	{#snippet actions()}
		<Button variant="outline" size="sm" class="hidden md:flex">
			<CalendarDays class="mr-2 h-4 w-4" />
			{new Date().toLocaleDateString(i18n.language === 'id' ? 'id-ID' : 'en-US', {
				weekday: 'long',
				year: 'numeric',
				month: 'long',
				day: 'numeric'
			})}
		</Button>
		<Button size="sm">{i18n.t('admin.dashboard.downloadReport')}</Button>
	{/snippet}
</AdminPageHeader>

<div class="space-y-8">
	<!-- KPI Grid -->
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
		<KPICard
			title={i18n.t('admin.dashboard.totalRevenue')}
			value={formatCurrency(stats.financial.totalRevenue)}
			subtitle={i18n.t('admin.dashboard.grossProcessed')}
			trend={12.5}
			trendDirection="up"
		>
			{#snippet icon()}<DollarSign class="w-4 h-4" />{/snippet}
		</KPICard>

		<KPICard
			title={i18n.t('admin.dashboard.organizations')}
			value={stats.tenants.active}
			subtitle={i18n.t('admin.dashboard.activeTotal', { total: stats.tenants.total })}
			trend={4.2}
			trendDirection="up"
		>
			{#snippet icon()}<School class="w-4 h-4" />{/snippet}
		</KPICard>

		<KPICard
			title={i18n.t('admin.dashboard.totalParents')}
			value={stats.users.totalParents.toLocaleString()}
			subtitle={i18n.t('admin.dashboard.registeredUsers')}
			trend={8.1}
			trendDirection="up"
		>
			{#snippet icon()}<Users class="w-4 h-4" />{/snippet}
		</KPICard>

		<KPICard
			title={i18n.t('admin.dashboard.transactions')}
			value={stats.financial.totalTransactions}
			subtitle={i18n.t('admin.dashboard.successfulCount')}
			trend={-2.4}
			trendDirection="down"
		>
			{#snippet icon()}<CreditCard class="w-4 h-4" />{/snippet}
		</KPICard>

		<KPICard
			title={i18n.t('admin.dashboard.verificationQueue')}
			value={pendingVerifications}
			subtitle={i18n.t('admin.dashboard.pendingOrgs')}
			trendDirection="neutral"
		>
			{#snippet icon()}<Clock class="w-4 h-4" />{/snippet}
		</KPICard>

		<KPICard
			title={i18n.t('admin.dashboard.successRate')}
			value="98.2%"
			subtitle={i18n.t('admin.dashboard.paymentGateway')}
			trend={0.5}
			trendDirection="up"
		>
			{#snippet icon()}<CheckCircle2 class="w-4 h-4" />{/snippet}
		</KPICard>

		<KPICard
			title={i18n.t('admin.dashboard.conversion')}
			value="14.2%"
			subtitle={i18n.t('admin.dashboard.visitToLead')}
			trend={1.2}
			trendDirection="up"
		>
			{#snippet icon()}<Percent class="w-4 h-4" />{/snippet}
		</KPICard>

		<KPICard
			title={i18n.t('admin.dashboard.avgRevOrg')}
			value={formatCurrency(stats.financial.totalRevenue / (stats.tenants.active || 1))}
			subtitle={i18n.t('admin.dashboard.monthlyAverage')}
			trend={3.8}
			trendDirection="up"
		>
			{#snippet icon()}<BarChart3 class="w-4 h-4" />{/snippet}
		</KPICard>
	</div>

	<!-- Main Content Grid -->
	<div class="grid grid-cols-1 lg:grid-cols-7 gap-6">
		<!-- Charts & Units (Left side - 4 cols) -->
		<div class="lg:col-span-4 space-y-6">
			<!-- Revenue Trend Chart -->
			<RevenueChart data={stats.financial.dailyRevenue} maxRevenue={maxDailyRevenue} />

			<!-- Units Breakdown -->
			<Card.Root>
				<Card.Header>
					<Card.Title>{i18n.t('admin.dashboard.performaPerUnit')}</Card.Title>
					<Card.Description>{i18n.t('admin.dashboard.breakdownPendaftaran')}</Card.Description>
				</Card.Header>
				<Card.Content>
					<Table.Root>
						<Table.Header>
							<Table.Row>
								<Table.Head>{i18n.t('admin.dashboard.unit')}</Table.Head>
								<Table.Head>{i18n.t('admin.dashboard.jenjang')}</Table.Head>
								<Table.Head class="text-right">{i18n.t('admin.dashboard.applicants')}</Table.Head>
								<Table.Head class="text-right">{i18n.t('admin.dashboard.pendapatan')}</Table.Head>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{#if stats.unitStats.length === 0}
								<Table.Row>
									<Table.Cell colspan={4} class="h-24 text-center text-muted-foreground">
										{i18n.t('common.none')}
									</Table.Cell>
								</Table.Row>
							{:else}
								{#each stats.unitStats as unit}
									<Table.Row>
										<Table.Cell>
											<div class="font-medium">{unit.unitName}</div>
											<div class="text-xs text-muted-foreground">{unit.tenantName}</div>
										</Table.Cell>
										<Table.Cell>
											<Badge variant="secondary">{unit.level}</Badge>
										</Table.Cell>
										<Table.Cell class="text-right font-semibold">
											{unit.appCount}
										</Table.Cell>
										<Table.Cell class="text-right">
											{formatCurrency(unit.revenue)}
										</Table.Cell>
									</Table.Row>
								{/each}
							{/if}
						</Table.Body>
					</Table.Root>
				</Card.Content>
			</Card.Root>
		</div>

		<!-- Market Leaders & Status (Right side - 3 cols) -->
		<div class="lg:col-span-3 space-y-6">
			<MarketLeadersCard schools={stats.financial.topSchools} />
			<LiveStatusCard />
		</div>
	</div>

	<!-- Pipeline Activity -->
	<RecentTenantsTable tenants={stats.tenants.list} />
</div>
