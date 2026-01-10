<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		placeholder?: string;
		children?: Snippet;
	}

	let { placeholder, children }: Props = $props();
</script>

{#if children}
	{@render children()}
{:else if placeholder}
	<span class="text-muted-foreground">{placeholder}</span>
{/if}
