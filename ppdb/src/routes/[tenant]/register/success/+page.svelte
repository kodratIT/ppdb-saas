<script lang="ts">
	let { data } = $props();
</script>

<svelte:head>
	<title>Pendaftaran Berhasil</title>
</svelte:head>

<div
	class="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4"
>
	<div class="max-w-md w-full text-center">
		<div class="mb-8">
			<div
				class="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="40"
					height="40"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="3"
					stroke-linecap="round"
					stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg
				>
			</div>
			<h1 class="text-3xl font-bold text-gray-900 mb-2">Pendaftaran Terkirim!</h1>
			<p class="text-gray-600">
				Terima kasih telah melakukan pendaftaran. Tim kami akan segera meninjau data Anda.
			</p>
		</div>

		<div class="bg-white p-6 rounded-lg shadow-sm border mb-8 text-left">
			<h3 class="font-semibold text-gray-900 mb-4">Apa langkah selanjutnya?</h3>
			<ul class="space-y-4 text-sm text-gray-600">
				<li class="flex gap-3">
					<span
						class="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold"
						>1</span
					>
					<span>Pantau status pendaftaran Anda secara berkala melalui WhatsApp.</span>
				</li>
				<li class="flex gap-3">
					<span
						class="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold"
						>2</span
					>
					<span>Siapkan dokumen asli untuk proses verifikasi fisik (jika diperlukan).</span>
				</li>
				<li class="flex gap-3">
					<span
						class="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold"
						>3</span
					>
					<span>Hubungi admin sekolah jika ada pertanyaan lebih lanjut.</span>
				</li>
			</ul>
		</div>

		<a
			href="/{data.tenantSlug}"
			class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 h-10 px-8 py-2 bg-primary text-primary-foreground hover:bg-primary/90"
		>
			Kembali ke Beranda
		</a>
	</div>
</div>
