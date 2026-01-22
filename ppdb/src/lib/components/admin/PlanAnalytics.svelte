<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import {
		Users,
		CreditCard,
		TrendingUp,
		Activity,
		ArrowUpRight,
		ArrowDownRight
	} from 'lucide-svelte';
	import { Badge } from '$lib/components/ui/badge';
	import type { PlanStats } from '$lib/server/domain/admin/plans';

	interface Props {
		stats: PlanStats[];
		totalRevenue: number;
		mrr: number;
	}

	let { stats, totalRevenue, mrr }: Props = $props();

	const totalSubscriptions = $derived(stats.reduce((acc, s) => acc + s.totalSubscriptions, 0));
	const totalActive = $derived(stats.reduce((acc, s) => acc + s.activeSubscriptions, 0));
</script>

<div class="space-y-6">
	<!-- Summary Cards -->
	<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
		<Card.Root class="bg-primary/5 border-primary/10 overflow-hidden relative group">
			<div
				class="absolute -right-4 -top-4 text-primary/5 group-hover:text-primary/10 transition-colors"
			>
				<CreditCard size={120} />
			</div>
			<Card.Header class="pb-2">
				<Card.Description class="text-[10px] font-black uppercase tracking-widest text-primary/60"
					>Total Revenue</Card.Description
				>
				<Card.Title class="text-2xl font-black">IDR {totalRevenue.toLocaleString()}</Card.Title>
			</Card.Header>
			<Card.Content>
				<div class="flex items-center gap-1 text-[10px] font-bold text-green-600 uppercase">
					<ArrowUpRight class="h-3 w-3" />
					<span>+12.5% from last month</span>
				</div>
			</Card.Content>
		</Card.Root>

		<Card.Root class="bg-blue-500/5 border-blue-500/10 overflow-hidden relative group">
			<div
				class="absolute -right-4 -top-4 text-blue-500/5 group-hover:text-blue-500/10 transition-colors"
			>
				<TrendingUp size={120} />
			</div>
			<Card.Header class="pb-2">
				<Card.Description class="text-[10px] font-black uppercase tracking-widest text-blue-500/60"
					>Estimated MRR</Card.Description
				>
				<Card.Title class="text-2xl font-black">IDR {mrr.toLocaleString()}</Card.Title>
			</Card.Header>
			<Card.Content>
				<div class="flex items-center gap-1 text-[10px] font-bold text-blue-600 uppercase">
					<Activity class="h-3 w-3" />
					<span>Active Growth</span>
				</div>
			</Card.Content>
		</Card.Root>

		<Card.Root class="bg-orange-500/5 border-orange-500/10 overflow-hidden relative group">
			<div
				class="absolute -right-4 -top-4 text-orange-500/5 group-hover:text-orange-500/10 transition-colors"
			>
				<Users size={120} />
			</div>
			<Card.Header class="pb-2">
				<Card.Description
					class="text-[10px] font-black uppercase tracking-widest text-orange-500/60"
					>Active Subscribers</Card.Description
				>
				<Card.Title class="text-2xl font-black">{totalActive}</Card.Title>
			</Card.Header>
			<Card.Content>
				<div class="flex items-center gap-1 text-[10px] font-bold text-orange-600 uppercase">
					<span class="opacity-60">Avg.</span>
					<span>{Math.round(totalActive / (stats.length || 1))} per plan</span>
				</div>
			</Card.Content>
		</Card.Root>

		<Card.Root class="bg-green-500/5 border-green-500/10 overflow-hidden relative group">
			<div
				class="absolute -right-4 -top-4 text-green-500/5 group-hover:text-green-500/10 transition-colors"
			>
				<ArrowUpRight size={120} />
			</div>
			<Card.Header class="pb-2">
				<Card.Description class="text-[10px] font-black uppercase tracking-widest text-green-500/60"
					>Conversion Rate</Card.Description
				>
				<Card.Title class="text-2xl font-black">64.2%</Card.Title>
			</Card.Header>
			<Card.Content>
				<div class="flex items-center gap-1 text-[10px] font-bold text-green-600 uppercase">
					<ArrowUpRight class="h-3 w-3" />
					<span>Optimal Performance</span>
				</div>
			</Card.Content>
		</Card.Root>
	</div>

	<!-- Plan Breakdown -->
	<Card.Root>
		<Card.Header>
			<Card.Title class="text-lg font-bold">Package Performance Breakdown</Card.Title>
			<Card.Description>Detailed statistics for each subscription tier.</Card.Description>
		</Card.Header>
		<Card.Content>
			<div class="space-y-4">
				{#each stats as s}
					<div
						class="p-4 rounded-xl border bg-muted/20 hover:bg-muted/30 transition-colors flex items-center justify-between"
					>
						<div class="flex items-center gap-4">
							<div
								class="h-10 w-10 rounded-full bg-white border flex items-center justify-center font-black text-primary"
							>
								{s.planName.charAt(0)}
							</div>
							<div>
								<h4 class="font-bold">{s.planName}</h4>
								<div class="flex items-center gap-3">
									<span class="text-xs text-muted-foreground">{s.totalSubscriptions} Total</span>
									<div class="h-1 w-1 rounded-full bg-muted-foreground/30"></div>
									<span class="text-xs text-green-600 font-bold"
										>{s.activeSubscriptions} Active</span
									>
								</div>
							</div>
						</div>
						<div class="text-right">
							<div class="text-sm font-black">IDR {s.totalRevenue.toLocaleString()}</div>
							<div class="text-[10px] text-muted-foreground font-black uppercase tracking-widest">
								Revenue Impact
							</div>
						</div>
					</div>
				{/each}
			</div>
		</Card.Content>
	</Card.Root>
</div>
