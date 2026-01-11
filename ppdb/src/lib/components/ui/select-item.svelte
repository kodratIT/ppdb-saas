<script lang="ts">
	import { cn } from '$lib/utils';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLOptionElement> {
		value: string;
	}

	let { class: className, value, children, ...restProps }: Props = $props();
</script>

<option
	class={cn(
		'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
		className
	)}
	{value}
	{...restProps}
>
	{#if children}
		{@render children()}
	{/if}
</option>
