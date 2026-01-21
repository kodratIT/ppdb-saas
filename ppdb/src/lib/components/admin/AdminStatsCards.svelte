<script lang="ts">
	import KPICard from '$lib/components/admin/KPICard.svelte';
	import Skeleton from '$lib/components/ui/skeleton.svelte';
	import type { Component } from 'svelte';

	interface Stat {
		title: string;
		value: string | number;
		subtitle?: string;
		trendDirection?: 'up' | 'down' | 'neutral';
		trendValue?: string;
		icon?: any;
		variant?: 'default' | 'primary' | 'success' | 'warning' | 'destructive';
	}

	interface Props {
		items: Stat[];
		isLoading?: boolean;
		columns?: number;
	}

	let { items, isLoading = false, columns = 5 }: Props = $props();

	const gridCols = $derived(
		columns === 1
			? 'md:grid-cols-1'
			: columns === 2
				? 'md:grid-cols-2'
				: columns === 3
					? 'md:grid-cols-3'
					: columns === 4
						? 'md:grid-cols-4'
						: 'md:grid-cols-5'
	);
</script>

{#if isLoading}
	<div class="grid gap-4 {gridCols}">
		{#each Array(columns) as _}
			<div class="rounded-xl border bg-card p-6 shadow-sm">
				<Skeleton class="h-4 w-24 mb-4" />
				<Skeleton class="h-8 w-16 mb-2" />
				<Skeleton class="h-3 w-32" />
			</div>
		{/each}
	</div>
{:else}
	<div class="grid gap-4 {gridCols}">
		{#each items as item}
			<KPICard
				title={item.title}
				value={item.value}
				subtitle={item.subtitle}
				trendDirection={item.trendDirection}
			>
				{#snippet icon()}
					{#if item.icon}
						<item.icon class="h-4 w-4" />
					{/if}
				{/snippet}
			</KPICard>
		{/each}
	</div>
{/if}
