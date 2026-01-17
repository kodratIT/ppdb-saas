<script lang="ts">
	import { cn } from '$lib/utils';
	import type { HTMLTdAttributes } from 'svelte/elements';

	// eslint-disable-next-line @typescript-eslint/no-empty-object-type
	interface Props extends HTMLTdAttributes {}

	let { class: className, children, ...restProps }: Props = $props();
</script>

<td
	class={cn(
		'[&:has([role=checkbox])]:pr-0 relative px-4 align-middle [&>[role=checkbox]]:translate-y-[2px]',
		className
	)}
	{...restProps}
>
	{@render children?.()}
</td>
