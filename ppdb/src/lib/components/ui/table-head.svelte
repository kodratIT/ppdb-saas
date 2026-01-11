<script lang="ts">
	import { cn } from '$lib/utils';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLTableCellElement> {}

	let { class: className, ...restProps }: Props = $props();
</script>

<th
	class={cn(
		'[&:has([role=checkbox])]:pr-0 relative px-4 text-left align-middle font-medium text-muted-foreground [&>[role=checkbox]]:translate-y-[2px]',
		className
	)}
	{...restProps}
/>
