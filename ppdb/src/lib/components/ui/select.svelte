<script lang="ts">
	import { cn } from '$lib/utils';
	import type { HTMLSelectAttributes } from 'svelte/elements';

	interface Props extends HTMLSelectAttributes {
		children?: import('svelte').Snippet;
		value?: unknown;
	}

	let { class: className, children, value = $bindable(), ...restProps }: Props = $props();
</script>

<select
	class={cn(
		'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
		className
	)}
	bind:value
	{...restProps}
>
	{#if children}
		{@render children()}
	{/if}
</select>
