<script lang="ts">
	import { cn } from '$lib/utils';
	import type { LabelHTMLAttributes } from 'svelte';

	interface Props extends LabelHTMLAttributes<HTMLLabelElement> {}

	let { class: className, ...restProps }: Props = $props();
</script>

<label
	class={cn(
		'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
		className
	)}
	{...restProps}
/>
