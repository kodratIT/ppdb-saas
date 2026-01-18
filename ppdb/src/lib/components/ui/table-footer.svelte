<script lang="ts">
	import { cn } from '$lib/utils';
	import type { HTMLAttributes } from 'svelte/elements';

	// eslint-disable-next-line @typescript-eslint/no-empty-object-type
	interface Props extends HTMLAttributes<HTMLTableSectionElement> {}

	let { class: className, children, ...restProps }: Props = $props();
</script>

<tfoot class={cn('border-t bg-muted/50 font-medium [&>tr]:last:border-b-0', className)} {...restProps}>
	{@render children?.()}
</tfoot>
