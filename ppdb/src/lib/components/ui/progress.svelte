<script lang="ts">
	import { cn } from '$lib/utils';

	interface Props {
		value?: number;
		max?: number;
		class?: string;
		barClass?: string;
		showLabel?: boolean;
		label?: string;
	}

	let {
		value = 0,
		max = 100,
		class: className,
		barClass,
		showLabel = false,
		label = 'Progress'
	}: Props = $props();

	const percentage = $derived(Math.min(100, Math.max(0, (value / max) * 100)));
</script>

<div class={cn('w-full', className)}>
	{#if showLabel}
		<div class="flex items-center justify-between text-sm mb-1">
			<span class="font-medium">{label}</span>
			<span class="text-muted-foreground">{Math.round(value)} / {max}</span>
		</div>
	{/if}

	<div class="h-full w-full bg-secondary rounded-full overflow-hidden">
		<div
			class={cn('h-full bg-primary transition-all duration-300 ease-in-out', barClass)}
			style="width: {percentage}%"
		></div>
	</div>
</div>
