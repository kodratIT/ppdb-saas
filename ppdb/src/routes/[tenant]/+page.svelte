<script lang="ts">
	import GenZTheme from '$lib/components/landing/GenZTheme.svelte';
	import FormalTheme from '$lib/components/landing/FormalTheme.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// @ts-ignore
	const tenant = $derived(data?.tenant);
	// @ts-ignore
	const profile = $derived(data?.profile);

	// Get theme from landingPageConfig or default to 'formal'
	const config = $derived((profile?.landingPageConfig as any) || {});
	const activeTheme = $derived(config.theme || 'formal');

	const schoolData = $derived({
		name: profile?.name || tenant?.name || 'Sekolah Kami',
		description: profile?.description || 'Portal pendaftaran resmi siswa baru.',
		logoUrl: profile?.logoUrl,
		primaryColor: profile?.primaryColor,
		secondaryColor: profile?.secondaryColor
	});
</script>

<svelte:head>
	<title>{schoolData.name} - PPDB Online</title>
</svelte:head>

{#if activeTheme === 'gen-z'}
	<GenZTheme school={schoolData} {tenant} />
{:else}
	<FormalTheme school={schoolData} {tenant} />
{/if}
