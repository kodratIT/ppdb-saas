<script lang="ts">
	import { cn } from '$lib/utils';
	import type { HTMLThAttributes } from 'svelte/elements';

	// eslint-disable-next-line @typescript-eslint/no-empty-object-type
	interface Props extends HTMLThAttributes {}

	let { class: className, children, ...restProps }: Props = $props();
</script>

<th
	class={cn(
		'[&:has([role=checkbox])]:pr-0 relative px-4 text-left align-middle font-medium text-muted-foreground [&>[role=checkbox]]:translate-y-[2px]',
		className
	)}
	{...restProps}
>
	{@render children?.()}
</th>
