<script lang="ts">
	import { cn } from '$lib/utils';

	interface Props {
		value?: number;
		max?: number;
		class?: string;
		showLabel?: boolean;
	}

	let { value = 0, max = 100, class: className, showLabel = true }: Props = $props();

	const percentage = $derived(Math.min(100, Math.max(0, (value / max) * 100)));
</script>

<div class={cn('space-y-2', className)}>
	{#if showLabel}
		<div class="flex items-center justify-between text-sm">
			<span class="font-medium">Progress</span>
			<span class="text-muted-foreground">{Math.round(value)} / {max}</span>
		</div>
	{/if}

	<div class="h-2 w-full bg-secondary rounded-full overflow-hidden">
		<div
			class="h-full bg-primary transition-all duration-300 ease-in-out"
			style="width: {percentage}%"
		></div>
	</div>

	{#if showLabel}
		<div class="text-xs text-muted-foreground">{Math.round(percentage)}% complete</div>
	{/if}
</div>
