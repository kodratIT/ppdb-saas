<script lang="ts">
	import KPICard from '$lib/components/admin/KPICard.svelte';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import { School, Activity, TrendingUp, DollarSign, Users } from 'lucide-svelte';

	interface EnhancedStats {
		total: number;
		active: number;
		newThisMonth: number;
		totalRevenue: number;
		avgApplications: number;
	}

	let { stats, isLoading = false } = $props<{
		stats: EnhancedStats;
		isLoading?: boolean;
	}>();

	// Format currency
	function formatCurrency(amount: number): string {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0
		}).format(amount);
	}

	// Calculate percentage
	const activePercentage = $derived(
		stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0
	);
</script>

{#if isLoading}
	<div class="grid gap-4 md:grid-cols-5">
		{#each Array(5) as _}
			<div class="rounded-lg border bg-card p-6">
				<Skeleton class="h-4 w-24 mb-4" />
				<Skeleton class="h-8 w-16 mb-2" />
				<Skeleton class="h-3 w-32" />
			</div>
		{/each}
	</div>
{:else}
	<div class="grid gap-4 md:grid-cols-5">
		<KPICard
			title="Total Schools"
			value={stats.total}
			subtitle="Registered tenants"
			trendDirection="neutral"
		>
			{#snippet icon()}<School class="h-4 w-4" />{/snippet}
		</KPICard>

		<KPICard
			title="Active Schools"
			value={stats.active}
			subtitle={`${activePercentage}% of total`}
			trendDirection="up"
		>
			{#snippet icon()}<Activity class="h-4 w-4" />{/snippet}
		</KPICard>

		<KPICard
			title="New This Month"
			value={stats.newThisMonth}
			subtitle="Recently registered"
			trendDirection={stats.newThisMonth > 0 ? 'up' : 'neutral'}
		>
			{#snippet icon()}<TrendingUp class="h-4 w-4" />{/snippet}
		</KPICard>

		<KPICard
			title="Total Revenue"
			value={formatCurrency(stats.totalRevenue)}
			subtitle="All paid invoices"
			trendDirection="up"
		>
			{#snippet icon()}<DollarSign class="h-4 w-4" />{/snippet}
		</KPICard>

		<KPICard
			title="Avg Applications"
			value={stats.avgApplications}
			subtitle="Per school"
			trendDirection="neutral"
		>
			{#snippet icon()}<Users class="h-4 w-4" />{/snippet}
		</KPICard>
	</div>
{/if}
