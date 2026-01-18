<script lang="ts">
	import type { Snippet } from 'svelte';
	import * as Card from '$lib/components/ui/card';

	interface Props {
		title: string;
		value: string | number;
		subtitle?: string;
		trend?: number;
		trendDirection?: 'up' | 'down' | 'neutral';
		icon: Snippet;
		sparkline?: Snippet;
	}

	let {
		title,
		value,
		subtitle,
		trend,
		trendDirection = 'neutral',
		icon,
		sparkline
	}: Props = $props();

	const trendColor = $derived(
		trendDirection === 'up'
			? 'text-emerald-600'
			: trendDirection === 'down'
				? 'text-rose-600'
				: 'text-muted-foreground'
	);
</script>

<Card.Root>
	<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
		<Card.Title class="text-sm font-medium">
			{title}
		</Card.Title>
		<div class="h-4 w-4 text-muted-foreground">
			{@render icon()}
		</div>
	</Card.Header>
	<Card.Content>
		<div class="text-2xl font-bold">{value}</div>
		<div class="flex flex-col gap-2 mt-1">
			<div class="flex items-center gap-2">
				{#if trend !== undefined}
					<span class="text-xs font-bold {trendColor}">
						{trend > 0 ? '+' : ''}{trend}%
					</span>
				{/if}
				{#if subtitle}
					<p class="text-xs text-muted-foreground">
						{subtitle}
					</p>
				{/if}
			</div>

			{#if sparkline}
				<div class="mt-2 h-10 w-full">
					{@render sparkline()}
				</div>
			{/if}
		</div>
	</Card.Content>
</Card.Root>
