<script lang="ts">
	import { i18n } from '$lib/i18n/index.svelte';
	import type { BroadcastAnalytics } from '$lib/types/admin';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import {
		Send,
		CheckCircle2,
		AlertCircle,
		TrendingUp,
		Clock,
		ArrowUpRight,
		ArrowDownRight,
		BarChart3
	} from 'lucide-svelte';
	import { cn } from '$lib/utils';

	interface Props {
		analytics?: BroadcastAnalytics;
		dateRange?: { from: Date; to: Date };
	}

	let {
		analytics = {
			totalBroadcasts: 0,
			totalMessagesSent: 0,
			totalMessagesFailed: 0,
			successRate: 0,
			averageDeliveryTime: 0,
			topMessages: [],
			dailyStats: [],
			topTargets: []
		},
		dateRange
	} = $props<Props>();

	function formatPercent(val: number) {
		return `${val.toFixed(1)}%`;
	}

	function formatNumber(val: number) {
		return new Intl.NumberFormat('id-ID').format(val);
	}
</script>

<div class="space-y-6">
	<!-- Stats Grid -->
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
		<Card class="relative overflow-hidden group">
			<CardHeader class="flex flex-row items-center justify-between pb-2 space-y-0">
				<CardTitle class="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
					Total Broadcasts
				</CardTitle>
				<div
					class="p-1.5 bg-blue-50 text-blue-600 rounded-lg group-hover:scale-110 transition-transform"
				>
					<Send class="w-4 h-4" />
				</div>
			</CardHeader>
			<CardContent>
				<div class="text-3xl font-black">{formatNumber(analytics.totalBroadcasts)}</div>
				<p class="text-[10px] text-muted-foreground font-bold mt-1 flex items-center gap-1">
					<TrendingUp class="w-3 h-3 text-emerald-500" />
					<span>+12% from last period</span>
				</p>
			</CardContent>
			<div class="absolute bottom-0 left-0 w-full h-1 bg-blue-500/10">
				<div class="h-full bg-blue-500" style="width: 70%"></div>
			</div>
		</Card>

		<Card class="relative overflow-hidden group">
			<CardHeader class="flex flex-row items-center justify-between pb-2 space-y-0">
				<CardTitle class="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
					Messages Sent
				</CardTitle>
				<div
					class="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg group-hover:scale-110 transition-transform"
				>
					<CheckCircle2 class="w-4 h-4" />
				</div>
			</CardHeader>
			<CardContent>
				<div class="text-3xl font-black">{formatNumber(analytics.totalMessagesSent)}</div>
				<p class="text-[10px] text-muted-foreground font-bold mt-1 flex items-center gap-1">
					<span class="text-emerald-500"
						>{(
							(analytics.totalMessagesSent /
								(analytics.totalMessagesSent + analytics.totalMessagesFailed)) *
								100 || 0
						).toFixed(1)}% success</span
					>
				</p>
			</CardContent>
			<div class="absolute bottom-0 left-0 w-full h-1 bg-emerald-500/10">
				<div class="h-full bg-emerald-500" style="width: {analytics.successRate}%"></div>
			</div>
		</Card>

		<Card class="relative overflow-hidden group">
			<CardHeader class="flex flex-row items-center justify-between pb-2 space-y-0">
				<CardTitle class="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
					Success Rate
				</CardTitle>
				<div
					class="p-1.5 bg-purple-50 text-purple-600 rounded-lg group-hover:scale-110 transition-transform"
				>
					<TrendingUp class="w-4 h-4" />
				</div>
			</CardHeader>
			<CardContent>
				<div class="text-3xl font-black">{formatPercent(analytics.successRate)}</div>
				<p class="text-[10px] text-muted-foreground font-bold mt-1">
					Avg delivery: {analytics.averageDeliveryTime}ms
				</p>
			</CardContent>
			<div class="absolute bottom-0 left-0 w-full h-1 bg-purple-500/10">
				<div class="h-full bg-purple-500" style="width: {analytics.successRate}%"></div>
			</div>
		</Card>

		<Card class="relative overflow-hidden group">
			<CardHeader class="flex flex-row items-center justify-between pb-2 space-y-0">
				<CardTitle class="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
					Failed
				</CardTitle>
				<div
					class="p-1.5 bg-rose-50 text-rose-600 rounded-lg group-hover:scale-110 transition-transform"
				>
					<AlertCircle class="w-4 h-4" />
				</div>
			</CardHeader>
			<CardContent>
				<div class="text-3xl font-black text-rose-600">
					{formatNumber(analytics.totalMessagesFailed)}
				</div>
				<p class="text-[10px] text-muted-foreground font-bold mt-1 flex items-center gap-1">
					<ArrowDownRight class="w-3 h-3 text-emerald-500" />
					<span>-5% than yesterday</span>
				</p>
			</CardContent>
			<div class="absolute bottom-0 left-0 w-full h-1 bg-rose-500/10">
				<div
					class="h-full bg-rose-500"
					style="width: {(
						(analytics.totalMessagesFailed / (analytics.totalMessagesSent || 1)) *
						100
					).toFixed(1)}%"
				></div>
			</div>
		</Card>
	</div>

	<!-- Secondary Analytics -->
	<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
		<!-- Daily Trends (Simplified Bar Chart) -->
		<Card>
			<CardHeader>
				<CardTitle class="text-sm font-black uppercase tracking-widest flex items-center gap-2">
					<BarChart3 class="w-4 h-4 text-primary" />
					Daily Trends
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div class="h-64 flex items-end gap-2 pt-8">
					{#each analytics.dailyStats as stat}
						<div class="flex-1 flex flex-col items-center gap-2 group">
							<div class="w-full relative flex flex-col justify-end gap-1 h-full">
								<!-- Tooltip -->
								<div
									class="absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-[10px] font-bold px-2 py-1 rounded border shadow-xl opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap"
								>
									{stat.sent} sent, {stat.failed} failed
								</div>

								<div
									class="w-full bg-rose-500/20 rounded-t-sm"
									style="height: {(stat.failed /
										(Math.max(...analytics.dailyStats.map((s) => s.sent + s.failed)) || 1)) *
										100}%"
								></div>
								<div
									class="w-full bg-primary rounded-t-sm transition-all group-hover:brightness-110"
									style="height: {(stat.sent /
										(Math.max(...analytics.dailyStats.map((s) => s.sent + s.failed)) || 1)) *
										100}%"
								></div>
							</div>
							<span
								class="text-[10px] font-bold text-muted-foreground uppercase rotate-45 mt-4 origin-left"
							>
								{new Date(stat.date).toLocaleDateString('id-ID', {
									day: '2-digit',
									month: 'short'
								})}
							</span>
						</div>
					{/each}
					{#if analytics.dailyStats.length === 0}
						<div
							class="w-full h-full flex items-center justify-center text-muted-foreground text-xs italic"
						>
							No trending data available
						</div>
					{/if}
				</div>
			</CardContent>
		</Card>

		<!-- Top Messages -->
		<Card>
			<CardHeader>
				<CardTitle class="text-sm font-black uppercase tracking-widest flex items-center gap-2">
					<TrendingUp class="w-4 h-4 text-primary" />
					Top Performing Messages
				</CardTitle>
			</CardHeader>
			<CardContent class="space-y-4">
				{#each analytics.topMessages as item, i}
					<div class="space-y-2">
						<div class="flex justify-between items-center text-xs">
							<span class="font-medium line-clamp-1 max-w-[70%] italic text-muted-foreground"
								>"{item.message}"</span
							>
							<span class="font-black tabular-nums">{formatNumber(item.sentCount)} sent</span>
						</div>
						<div class="h-2 bg-muted rounded-full overflow-hidden">
							<div
								class="h-full bg-gradient-to-r from-primary to-primary/40 rounded-full"
								style="width: {(item.sentCount / (analytics.topMessages[0]?.sentCount || 1)) *
									100}%"
							></div>
						</div>
					</div>
				{/each}
				{#if analytics.topMessages.length === 0}
					<div class="h-40 flex items-center justify-center text-muted-foreground text-xs italic">
						No message performance data
					</div>
				{/if}
			</CardContent>
		</Card>
	</div>

	<!-- Top Recipient Targets -->
	<Card>
		<CardHeader>
			<CardTitle class="text-sm font-black uppercase tracking-widest flex items-center gap-2">
				<Clock class="w-4 h-4 text-primary" />
				Active Recipient Organizations
			</CardTitle>
		</CardHeader>
		<CardContent>
			<div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
				{#each analytics.topTargets as target}
					<div
						class="p-3 bg-muted/30 rounded-lg border border-border/40 hover:border-primary/40 transition-colors"
					>
						<p
							class="text-[10px] font-black uppercase tracking-wider text-muted-foreground truncate"
						>
							{target.tenant}
						</p>
						<div class="flex items-center justify-between mt-2">
							<span class="text-lg font-black">{target.receivedCount}</span>
							<div class="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
								<ArrowUpRight class="w-3 h-3 text-primary" />
							</div>
						</div>
						<p class="text-[9px] font-bold text-muted-foreground mt-1 uppercase">
							Messages received
						</p>
					</div>
				{/each}
				{#if analytics.topTargets.length === 0}
					<div class="col-span-full py-8 text-center text-muted-foreground text-xs italic">
						No target analytics available
					</div>
				{/if}
			</div>
		</CardContent>
	</Card>
</div>
