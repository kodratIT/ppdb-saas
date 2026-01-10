<script lang="ts">
	import { cn } from '$lib/utils';
	import type { HTMLAttributes } from 'svelte';

	interface Props extends HTMLAttributes<HTMLTableCellElement> {}

	let { class: className, ...restProps }: Props = $props();
</script>

<td
	class={cn(
		'[&:has([role=checkbox])]:pr-0 relative px-4 align-middle [&>[role=checkbox]]:translate-y-[2px]',
		className
	)}
	{...restProps}
/>
