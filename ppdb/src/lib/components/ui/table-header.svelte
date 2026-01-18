<script lang="ts">
	import { cn } from '$lib/utils';
	import type { HTMLAttributes } from 'svelte/elements';

	// eslint-disable-next-line @typescript-eslint/no-empty-object-type
	interface Props extends HTMLAttributes<HTMLTableSectionElement> {}

	let { class: className, children, ...restProps }: Props = $props();
</script>

<thead class={cn('[&_tr]:border-b', className)} {...restProps}>
	{@render children?.()}
</thead>
