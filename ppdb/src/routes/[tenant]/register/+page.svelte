<script lang="ts">
	/* eslint-disable svelte/require-each-key */
	/* eslint-disable svelte/no-navigation-without-resolve */
	import { goto } from '$app/navigation';

	import Badge from '$lib/components/ui/badge.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import Card from '$lib/components/ui/card.svelte';

	let { data } = $props();

	function startRegistration() {
		goto(`/${data.tenantSlug}/register/start`);
	}
</script>

<svelte:head>
	<title>Pendaftaran - {data.school.name}</title>
	<meta name="description" content="Daftar siswa baru di {data.school.name}" />
</svelte:head>

<div class="min-h-screen bg-gradient-to-b from-blue-50 to-white">
	<div class="container mx-auto px-4 py-12">
		{#if data.school.bannerUrl}
			<img
				src={data.school.bannerUrl}
				alt="{data.school.name} banner"
				class="w-full h-64 object-cover rounded-lg shadow-lg mb-8"
			/>
		{/if}

		<div class="text-center mb-12">
			{#if data.school.logoUrl}
				<img
					src={data.school.logoUrl}
					alt="{data.school.name} logo"
					class="w-24 h-24 mx-auto mb-4 rounded-full shadow-md"
				/>
			{/if}
			<h1 class="text-4xl font-bold text-gray-900 mb-4">
				{data.school.name}
			</h1>
			{#if data.school.description}
				<p class="text-xl text-gray-600 max-w-2xl mx-auto">
					{data.school.description}
				</p>
			{/if}
		</div>

		<div class="text-center mb-16">
			<Button onclick={startRegistration} size="lg" class="px-8 py-6 text-lg">
				Mulai Pendaftaran
			</Button>
			<p class="text-sm text-gray-500 mt-4">Proses pendaftaran mudah dan cepat, hanya 5 menit!</p>
		</div>

		<div class="max-w-4xl mx-auto">
			<h2 class="text-2xl font-semibold text-gray-900 mb-6">Jalur Pendaftaran</h2>

			{#if data.admissionPaths.length === 0}
				<Card class="p-8 text-center">
					<p class="text-gray-500">
						Saat ini belum ada jalur pendaftaran yang dibuka. Silakan hubungi sekolah untuk
						informasi lebih lanjut.
					</p>
				</Card>
			{:else}
				<div class="grid gap-6 md:grid-cols-2">
					{#each data.admissionPaths as path}
						<Card class="p-6 hover:shadow-lg transition-shadow">
							<div class="flex items-start justify-between mb-4">
								<h3 class="text-xl font-semibold text-gray-900">{path.name}</h3>
								<Badge variant="status" status="active">Buka</Badge>
							</div>

							{#if path.description}
								<p class="text-gray-600 mb-4">{path.description}</p>
							{/if}

							<div class="flex items-center justify-between text-sm">
								<span class="text-gray-500">
									Kuota: <span class="font-semibold text-gray-900">{path.quota} siswa</span>
								</span>
							</div>
						</Card>
					{/each}
				</div>
			{/if}
		</div>

		<div class="max-w-2xl mx-auto mt-16 text-center">
			<h3 class="text-lg font-semibold text-gray-900 mb-4">Butuh Bantuan?</h3>
			<div class="flex flex-col sm:flex-row gap-4 justify-center">
				{#if data.school.contactPhone}
					<a
						href="https://wa.me/{data.school.contactPhone.replace(/\+/g, '')}"
						target="_blank"
						class="inline-flex items-center gap-2 text-green-600 hover:text-green-700"
					>
						<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
							<path
								d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"
							/>
						</svg>
						WhatsApp
					</a>
				{/if}
				{#if data.school.contactEmail}
					<a
						href="mailto:{data.school.contactEmail}"
						class="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
					>
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
							/>
						</svg>
						Email
					</a>
				{/if}
			</div>
		</div>
	</div>
</div>
