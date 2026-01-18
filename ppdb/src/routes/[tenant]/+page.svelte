<script lang="ts">
	import GenZTheme from '$lib/components/landing/GenZTheme.svelte';
	import FormalTheme from '$lib/components/landing/FormalTheme.svelte';
	import UnitCard from '$lib/components/public/UnitCard.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const tenant = $derived(data?.tenant);
	const profile = $derived(data?.profile);
	const branding = $derived(data?.branding);
	const units = $derived(data?.units || []);

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

{#if units.length > 1}
	<div class="min-h-screen bg-slate-50/50 py-12 px-4 md:py-20">
		<div class="container mx-auto max-w-5xl">
			<!-- Header Selection -->
			<div class="mb-12 text-center">
				{#if schoolData.logoUrl}
					<img src={schoolData.logoUrl} alt={schoolData.name} class="mx-auto mb-6 h-20 w-auto" />
				{/if}
				<h1 class="mb-4 text-3xl font-black tracking-tight text-slate-900 md:text-5xl">
					Selamat Datang di {schoolData.name}
				</h1>
				<p class="mx-auto max-w-2xl text-lg text-muted-foreground">
					Silakan pilih unit sekolah untuk melanjutkan proses pendaftaran.
				</p>
			</div>

			<!-- Grid of Units -->
			<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
				{#each units as unit}
					<UnitCard {unit} tenantSlug={tenant.slug} />
				{/each}
			</div>

			<div class="mt-16 text-center text-sm text-muted-foreground">
				<p>&copy; {new Date().getFullYear()} {schoolData.name}. All rights reserved.</p>
				<p class="mt-1">Powered by PPDB Smart System</p>
			</div>
		</div>
	</div>
{:else if activeTheme === 'gen-z'}
	<GenZTheme school={schoolData} {tenant} {branding} />
{:else}
	<FormalTheme school={schoolData} {tenant} {branding} />
{/if}
