<script lang="ts">
	import { cn } from '$lib/utils';
	import type { HTMLAttributes } from 'svelte/elements';

	// eslint-disable-next-line @typescript-eslint/no-empty-object-type
	interface Props extends HTMLAttributes<HTMLTableCaptionElement> {}

	let { class: className, children, ...restProps }: Props = $props();
</script>

<caption class={cn('mt-4 text-sm text-muted-foreground', className)} {...restProps}>
	{@render children?.()}
</caption>
