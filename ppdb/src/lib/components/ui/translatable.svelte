<script lang="ts">
	import { i18n } from '$lib/i18n/index.svelte';
	import type { TranslationKey } from '$lib/i18n/types';

	let {
		key,
		params = undefined,
		html = false
	} = $props<{
		key: TranslationKey | string; // Allow string for dynamic keys not strictly typed yet
		params?: Record<string, string | number>;
		html?: boolean;
	}>();

	const text = $derived(i18n.t(key as TranslationKey, params));
</script>

{#if html}
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	<span>{@html text}</span>
{:else}
	<span>{text}</span>
{/if}
