<script lang="ts">
	import { cn } from '$lib/utils';
	import type { HTMLAttributes } from 'svelte';

	interface Props extends HTMLAttributes<HTMLTableSectionElement> {}

	let { class: className, ...restProps }: Props = $props();
</script>

<tbody class={cn('[&_tr:last-child]:border-0', className)} {...restProps} />
