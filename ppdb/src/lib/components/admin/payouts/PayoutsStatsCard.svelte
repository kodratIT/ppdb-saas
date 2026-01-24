<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { formatCurrency } from '$lib/utils';
	import {
		Database,
		Clock,
		CheckCircle2,
		Activity,
		TrendingUp,
		TrendingDown,
		Loader2
	} from 'lucide-svelte';
	import { cn } from '$lib/utils';

	export interface Stats {
		totalPayouts: number;
		pendingAmount: number;
		completedAmount: number;
		operationalStatus: 'connected' | 'disconnected';
		pendingCount: number;
		completedCount: number;
		trend?: {
			totalPayouts: number; // percentage change
			pendingAmount: number;
			completedAmount: number;
		};
	}

	interface Props {
		stats: Stats;
		isLoading?: boolean;
	}

	let { stats, isLoading = false }: Props = $props();

	function getTrendIcon(value: number) {
		return value >= 0 ? TrendingUp : TrendingDown;
	}

	function getTrendColor(value: number) {
		return value >= 0 ? 'text-green-600' : 'text-red-600';
	}

	function getTrendLabel(value: number) {
		return value >= 0 ? 'up' : 'down';
	}
</script>

<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
	<!-- Total Payouts -->
	<Card.Root class="group hover:shadow-md transition-shadow">
		<Card.Header class="pb-2">
			<div class="flex items-center justify-between">
				<Card.Title
					class="text-[10px] font-black uppercase tracking-widest text-muted-foreground"
				>
					Total Payouts
				</Card.Title>
				<Database class="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
			</div>
		</Card.Header>
		<Card.Content>
			{#if isLoading}
				<div class="flex items-center justify-center h-12">
					<Loader2 class="h-6 w-6 animate-spin text-muted-foreground" />
				</div>
			{:else}
				<div class="space-y-1">
					<div class="text-2xl font-bold tabular-nums">{stats.totalPayouts}</div>
					{#if stats.trend}
						{@const TrendIcon = getTrendIcon(stats.trend.totalPayouts)}
						<div class="flex items-center gap-1 text-xs">
							<TrendIcon class={cn('h-3 w-3', getTrendColor(stats.trend.totalPayouts))} />
							<span class={cn('font-medium', getTrendColor(stats.trend.totalPayouts))}>
								{Math.abs(stats.trend.totalPayouts)}% {getTrendLabel(stats.trend.totalPayouts)}
							</span>
							<span class="text-muted-foreground">from last month</span>
						</div>
					{/if}
				</div>
			{/if}
		</Card.Content>
	</Card.Root>

	<!-- Pending Amount -->
	<Card.Root class="group hover:shadow-md transition-shadow">
		<Card.Header class="pb-2">
			<div class="flex items-center justify-between">
				<Card.Title
					class="text-[10px] font-black uppercase tracking-widest text-muted-foreground"
				>
					Pending Amount
				</Card.Title>
				<Clock class="h-4 w-4 text-muted-foreground group-hover:text-yellow-600 transition-colors" />
			</div>
		</Card.Header>
		<Card.Content>
			{#if isLoading}
				<div class="flex items-center justify-center h-12">
					<Loader2 class="h-6 w-6 animate-spin text-muted-foreground" />
				</div>
			{:else}
				<div class="space-y-1">
					<div class="text-2xl font-bold tabular-nums text-yellow-600">
						{formatCurrency(stats.pendingAmount)}
					</div>
					<p class="text-xs text-muted-foreground">{stats.pendingCount} awaiting approval</p>
					{#if stats.trend}
						{@const TrendIcon = getTrendIcon(stats.trend.pendingAmount)}
						<div class="flex items-center gap-1 text-xs">
							<TrendIcon class={cn('h-3 w-3', getTrendColor(stats.trend.pendingAmount))} />
							<span class={cn('font-medium', getTrendColor(stats.trend.pendingAmount))}>
								{Math.abs(stats.trend.pendingAmount)}% {getTrendLabel(stats.trend.pendingAmount)}
							</span>
						</div>
					{/if}
				</div>
			{/if}
		</Card.Content>
	</Card.Root>

	<!-- Completed This Month -->
	<Card.Root class="group hover:shadow-md transition-shadow">
		<Card.Header class="pb-2">
			<div class="flex items-center justify-between">
				<Card.Title
					class="text-[10px] font-black uppercase tracking-widest text-muted-foreground"
				>
					Completed This Month
				</Card.Title>
				<CheckCircle2 class="h-4 w-4 text-muted-foreground group-hover:text-green-600 transition-colors" />
			</div>
		</Card.Header>
		<Card.Content>
			{#if isLoading}
				<div class="flex items-center justify-center h-12">
					<Loader2 class="h-6 w-6 animate-spin text-muted-foreground" />
				</div>
			{:else}
				<div class="space-y-1">
					<div class="text-2xl font-bold tabular-nums text-green-600">
						{formatCurrency(stats.completedAmount)}
					</div>
					<p class="text-xs text-muted-foreground">{stats.completedCount} payouts</p>
					{#if stats.trend}
						{@const TrendIcon = getTrendIcon(stats.trend.completedAmount)}
						<div class="flex items-center gap-1 text-xs">
							<TrendIcon class={cn('h-3 w-3', getTrendColor(stats.trend.completedAmount))} />
							<span class={cn('font-medium', getTrendColor(stats.trend.completedAmount))}>
								{Math.abs(stats.trend.completedAmount)}% {getTrendLabel(stats.trend.completedAmount)}
							</span>
						</div>
					{/if}
				</div>
			{/if}
		</Card.Content>
	</Card.Root>

	<!-- Operational Status -->
	<Card.Root class="group hover:shadow-md transition-shadow">
		<Card.Header class="pb-2">
			<div class="flex items-center justify-between">
				<Card.Title
					class="text-[10px] font-black uppercase tracking-widest text-muted-foreground"
				>
					Bridge Status
				</Card.Title>
				<Activity
					class={cn(
						'h-4 w-4 transition-colors',
						stats.operationalStatus === 'connected'
							? 'text-green-600 group-hover:text-green-700'
							: 'text-red-600 group-hover:text-red-700'
					)}
				/>
			</div>
		</Card.Header>
		<Card.Content>
			{#if isLoading}
				<div class="flex items-center justify-center h-12">
					<Loader2 class="h-6 w-6 animate-spin text-muted-foreground" />
				</div>
			{:else}
				<div class="space-y-2">
					<Badge
						variant={stats.operationalStatus === 'connected' ? 'default' : 'destructive'}
						class="text-[9px] uppercase font-black tracking-tight"
					>
						{stats.operationalStatus === 'connected' ? 'Connected' : 'Disconnected'}
					</Badge>
					<p class="text-xs text-muted-foreground">
						{stats.operationalStatus === 'connected'
							? 'Payment bridge operational'
							: 'Payment bridge unavailable'}
					</p>
				</div>
			{/if}
		</Card.Content>
	</Card.Root>
</div>
