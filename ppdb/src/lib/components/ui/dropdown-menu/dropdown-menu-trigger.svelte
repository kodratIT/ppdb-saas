<script lang="ts">
	import { DropdownMenu as DropdownMenuPrimitive } from 'bits-ui';
	import type { Snippet } from 'svelte';

	type Props = {
		class?: string;
		children?: Snippet<[{ props: Record<string, any> }]>;
		[key: string]: any;
	};

	let { children: childSnippet, ...restProps }: Props = $props();
</script>

<DropdownMenuPrimitive.Trigger {...restProps}>
	{#snippet child({ props }: { props: Record<string, any> })}
		{#if childSnippet}
			{@render childSnippet({ props })}
		{/if}
	{/snippet}
</DropdownMenuPrimitive.Trigger>
