<script lang="ts">
	import { page } from '$app/state';
	import Progress from '$lib/components/ui/progress.svelte';
	import { fade } from 'svelte/transition';

	let { children } = $props();

	// Calculate current step from URL
	const stepMatch = $derived(page.url.pathname.match(/step-(\d+)/));
	const isDocuments = $derived(page.url.pathname.includes('/documents'));
	const currentStep = $derived(isDocuments ? 4 : stepMatch ? parseInt(stepMatch[1]) : 1);
	const totalSteps = 5;
	const progress = $derived((currentStep / totalSteps) * 100);

	const stepTitles = [
		'Data Anak',
		'Data Orang Tua',
		'Alamat Tinggal',
		'Upload Dokumen',
		'Ringkasan & Finalisasi'
	];

	// Get sync status from page data (assuming store is shared or accessible)
	// For now, let's add a placeholder for visual feedback
	const syncStatus = $derived(page.data.syncStatus || 'idle');
</script>

<div class="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4">
	<div class="max-w-2xl mx-auto">
		<!-- Shared Wizard Header & Progress -->
		<div class="mb-8">
			<div class="flex items-center justify-between mb-2">
				<div>
					<span class="text-sm font-medium text-blue-600">Langkah {currentStep}</span>
					<div class="flex items-center gap-2">
						<h2 class="text-lg font-semibold text-gray-900">{stepTitles[currentStep - 1]}</h2>

						{#if syncStatus === 'saving'}
							<span class="text-[10px] text-gray-400 animate-pulse">Menyimpan...</span>
						{:else if syncStatus === 'idle'}
							<span class="text-[10px] text-green-500">Tersimpan</span>
						{:else if syncStatus === 'error'}
							<span class="text-[10px] text-red-500">Gagal Simpan</span>
						{/if}
					</div>
				</div>
				<span class="text-sm text-gray-500 font-medium">{Math.round(progress)}% Selesai</span>
			</div>
			<Progress value={progress} class="h-2" />

			<!-- Step Indicators (Optional visual cue) -->
			<div class="flex justify-between mt-4">
				{#each Array(totalSteps) as _, i}
					<div
						class="h-1 flex-1 mx-0.5 rounded-full transition-colors duration-300"
						class:bg-blue-500={i + 1 <= currentStep}
						class:bg-gray-200={i + 1 > currentStep}
					></div>
				{/each}
			</div>
		</div>

		<!-- Page Content with Transition -->
		{#key page.url.pathname}
			<div in:fade={{ duration: 200, delay: 200 }} out:fade={{ duration: 200 }}>
				{@render children()}
			</div>
		{/key}

		<p class="text-xs text-gray-400 text-center mt-8">
			Draft ID: {page.data.applicationId || 'Baru'} • Sesi aman terenkripsi
		</p>
	</div>
</div>
