<script lang="ts">
	import { cn } from '$lib/utils';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		children?: Snippet;
	}

	let { children, class: className, ...restProps }: Props = $props();
</script>

<div
	class={cn(
		'relative z-50 max-h-96 overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md',
		className
	)}
	{...restProps}
>
	{#if children}
		{@render children()}
	{/if}
</div>
