<script lang="ts">
	/* eslint-disable @typescript-eslint/no-unused-vars */
	/* eslint-disable svelte/require-each-key */
	import { page } from '$app/state';
	import { fade, fly } from 'svelte/transition';
	import { CheckCircle2, Circle, HelpCircle, ChevronRight, ShieldCheck } from 'lucide-svelte';
	import Button from '$lib/components/ui/button.svelte';
	import Progress from '$lib/components/ui/progress.svelte';

	let { children } = $props();

	// Calculate current step from URL
	const stepMatch = $derived(page.url.pathname.match(/step-(\d+)/));
	const isDocuments = $derived(page.url.pathname.includes('/documents'));
	const currentStep = $derived(isDocuments ? 4 : stepMatch ? parseInt(stepMatch[1]) : 1);
	const totalSteps = 5;
	const progress = $derived((currentStep / totalSteps) * 100);

	const stepTitles = [
		'Data Calon Siswa',
		'Data Orang Tua',
		'Alamat & Domisili',
		'Upload Dokumen',
		'Review & Finalisasi'
	];

	const syncStatus = $derived(page.data.syncStatus || 'idle');
	const schoolName = $derived(page.data.school?.name || 'Sekolah');
	const logoUrl = $derived(page.data.school?.logoUrl);
</script>

<div class="min-h-screen bg-gray-50 flex flex-col lg:flex-row font-sans">
	<!-- Left Sidebar (Desktop) / Header (Mobile) -->
	<aside class="bg-white border-b lg:border-b-0 lg:border-r lg:w-80 xl:w-96 flex-shrink-0 lg:h-screen lg:sticky lg:top-0 flex flex-col z-20">
		<!-- Brand Header -->
		<div class="p-6 border-b flex items-center gap-3">
			{#if logoUrl}
				<img src={logoUrl} alt="Logo" class="w-10 h-10 object-contain" />
			{:else}
				<div class="w-10 h-10 bg-[#002C5F] rounded-lg flex items-center justify-center text-white font-bold">
					{schoolName.substring(0, 2)}
				</div>
			{/if}
			<div>
				<h1 class="text-sm font-bold text-gray-900 leading-tight uppercase tracking-wide">
					{schoolName}
				</h1>
				<p class="text-[10px] text-gray-500 font-medium tracking-wider">REGISTRATION</p>
			</div>
		</div>

		<!-- Mobile Progress (Visible only on small screens) -->
		<div class="lg:hidden p-4 bg-blue-50/50">
			<div class="flex justify-between items-center mb-2 text-sm">
				<span class="font-semibold text-[#002C5F]">Langkah {currentStep} dari {totalSteps}</span>
				<span class="text-gray-500">{Math.round(progress)}%</span>
			</div>
			<Progress value={progress} class="h-2" />
			<div class="mt-2 text-xs text-gray-600 truncate">
				{stepTitles[currentStep - 1]}
			</div>
		</div>

		<!-- Desktop Vertical Stepper -->
		<div class="hidden lg:flex flex-col flex-grow overflow-y-auto py-8 px-6">
			<nav class="space-y-1">
				{#each stepTitles as title, i}
					{@const stepNum = i + 1}
					{@const isActive = stepNum === currentStep}
					{@const isCompleted = stepNum < currentStep}
					
					<div class="relative pl-8 py-3 group">
						<!-- Connecting Line -->
						{#if i < stepTitles.length - 1}
							<div class="absolute left-[11px] top-8 bottom-0 w-0.5 bg-gray-100 {isCompleted ? 'bg-green-500' : ''}"></div>
						{/if}

						<!-- Step Indicator -->
						<div 
							class="absolute left-0 top-3.5 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 z-10
							{isActive ? 'border-[#002C5F] bg-[#002C5F] text-white ring-4 ring-blue-50' : ''}
							{isCompleted ? 'border-green-500 bg-green-500 text-white' : 'border-gray-200 bg-white text-gray-400'}"
						>
							{#if isCompleted}
								<CheckCircle2 class="w-4 h-4" />
							{:else}
								<span class="text-xs font-bold">{stepNum}</span>
							{/if}
						</div>

						<!-- Step Label -->
						<div class="ml-2">
							<p class="text-sm font-medium transition-colors {isActive ? 'text-[#002C5F]' : isCompleted ? 'text-gray-900' : 'text-gray-400'}">
								{title}
							</p>
							{#if isActive}
								<p class="text-xs text-blue-600 mt-0.5" in:fade>Sedang diisi...</p>
							{/if}
						</div>
					</div>
				{/each}
			</nav>

			<!-- Security Badge -->
			<div class="mt-auto pt-8">
				<div class="bg-blue-50 rounded-xl p-4 border border-blue-100">
					<div class="flex items-center gap-2 text-[#002C5F] mb-2">
						<ShieldCheck class="w-4 h-4" />
						<span class="text-xs font-bold uppercase">Koneksi Aman</span>
					</div>
					<p class="text-xs text-gray-600 leading-relaxed">
						Data Anda dienkripsi dan dilindungi. Draft tersimpan otomatis.
					</p>
					
					<div class="mt-3 flex items-center justify-between text-xs border-t border-blue-200 pt-2">
						<span class="text-gray-500">Status Simpan:</span>
						{#if syncStatus === 'saving'}
							<span class="text-blue-600 animate-pulse font-medium">Menyimpan...</span>
						{:else if syncStatus === 'idle'}
							<span class="text-green-600 font-medium flex items-center gap-1"><CheckCircle2 class="w-3 h-3" /> Tersimpan</span>
						{:else if syncStatus === 'error'}
							<span class="text-red-600 font-medium">Gagal</span>
						{/if}
					</div>
				</div>
			</div>
		</div>
	</aside>

	<!-- Main Content Area -->
	<main class="flex-grow flex flex-col min-w-0">
		<div class="flex-grow w-full max-w-3xl mx-auto p-4 lg:p-12">
			<!-- Breadcrumb / Header for Content -->
			<div class="mb-8 hidden lg:block">
				<div class="flex items-center text-sm text-gray-500 mb-1">
					<span>Pendaftaran</span>
					<ChevronRight class="w-4 h-4 mx-1" />
					<span class="text-gray-900 font-medium">Langkah {currentStep}</span>
				</div>
				<h2 class="text-3xl font-bold text-gray-900">{stepTitles[currentStep - 1]}</h2>
				<p class="text-gray-500 mt-2">Silakan lengkapi data di bawah ini dengan benar.</p>
			</div>

			<!-- Form Content with Transition -->
			{#key page.url.pathname}
				<div 
					in:fly={{ y: 20, duration: 300, delay: 150 }} 
					out:fade={{ duration: 150 }}
					class="bg-white rounded-xl shadow-sm border p-6 md:p-8"
				>
					{@render children()}
				</div>
			{/key}
		</div>
		
		<!-- Footer -->
		<footer class="p-6 text-center text-xs text-gray-400 border-t mt-auto bg-white lg:bg-transparent lg:border-t-0">
			&copy; {new Date().getFullYear()} {schoolName} PPDB System. ID: {page.data.applicationId || 'NEW'}
		</footer>
	</main>
</div>