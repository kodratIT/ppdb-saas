<script lang="ts">
	import type { Snippet } from 'svelte';

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
			? 'text-emerald-600 bg-emerald-50'
			: trendDirection === 'down'
				? 'text-rose-600 bg-rose-50'
				: 'text-slate-600 bg-slate-50'
	);
</script>

<div
	class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-4"
>
	<div class="flex justify-between items-start">
		<div class="space-y-1">
			<p class="text-xs font-bold text-slate-500 uppercase tracking-wider">{title}</p>
			<h3 class="text-2xl font-black text-slate-900 tracking-tight">{value}</h3>
		</div>
		<div class="p-2.5 bg-slate-50 rounded-lg text-slate-600 border border-slate-100">
			{@render icon()}
		</div>
	</div>

	<div class="flex items-center gap-2">
		{#if trend !== undefined}
			<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold {trendColor}">
				{trend > 0 ? '+' : ''}{trend}%
			</span>
		{/if}
		{#if subtitle}
			<span class="text-xs font-medium text-slate-400 truncate">{subtitle}</span>
		{/if}
	</div>

	{#if sparkline}
		<div class="mt-2 h-10 w-full">
			{@render sparkline()}
		</div>
	{/if}
</div>
