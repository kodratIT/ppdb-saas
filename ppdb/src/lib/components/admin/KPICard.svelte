<script lang="ts">
	import type { Snippet } from 'svelte';
	import * as Card from '$lib/components/ui/card';
	import { cn } from '$lib/utils';

	interface Props {
		title: string;
		value: string | number;
		subtitle?: string;
		trend?: number;
		trendDirection?: 'up' | 'down' | 'neutral';
		icon: Snippet;
		sparkline?: Snippet;
		class?: string;
	}

	let {
		title,
		value,
		subtitle,
		trend,
		trendDirection = 'neutral',
		icon,
		sparkline,
		class: className
	}: Props = $props();

	const trendColor = $derived(
		trendDirection === 'up'
			? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10'
			: trendDirection === 'down'
				? 'text-rose-600 bg-rose-50 dark:bg-rose-500/10'
				: 'text-muted-foreground bg-muted'
	);
</script>

<Card.Root
	class={cn(
		'shadow-premium border-none bg-card/50 backdrop-blur-sm hover:translate-y-[-2px] transition-all duration-300',
		className
	)}
>
	<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
		<Card.Title class="text-xs font-bold uppercase tracking-widest text-slate-500">
			{title}
		</Card.Title>
		<div class="h-9 w-9 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600">
			{@render icon()}
		</div>
	</Card.Header>
	<Card.Content>
		<div class="text-3xl font-extrabold tracking-tight text-slate-900">{value}</div>
		<div class="flex flex-col gap-3 mt-4">
			<div class="flex items-center gap-2">
				{#if trend !== undefined}
					<span class={cn('text-[10px] font-bold px-2 py-1 rounded-lg', trendColor)}>
						{trend > 0 ? '+' : ''}{trend}%
					</span>
				{/if}
				{#if subtitle}
					<p class="text-xs text-slate-500 font-medium">
						{subtitle}
					</p>
				{/if}
			</div>

			{#if sparkline}
				<div class="mt-2 h-10 w-full opacity-50">
					{@render sparkline()}
				</div>
			{/if}
		</div>
	</Card.Content>
</Card.Root>
