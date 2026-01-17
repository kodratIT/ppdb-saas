<script lang="ts">
	/* eslint-disable svelte/require-each-key */
	/* eslint-disable svelte/no-navigation-without-resolve */
	import { goto } from '$app/navigation';
	import Card from '$lib/components/ui/card.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import Alert from '$lib/components/ui/alert.svelte';
	import CameraUpload from '$lib/components/forms/CameraUpload.svelte';
	import { compressImage } from '$lib/utils/image-compression';
	import { FileText, CheckCircle, Upload } from 'lucide-svelte';

	let { data } = $props();

	let showCamera = $state(false);
	let currentDocumentType = $state<'kk' | 'akta' | 'passport' | 'kitas'>('kk');
	let uploading = $state(false);
	let uploadError = $state<string | null>(null);

	const requiredDocuments = [
		{ type: 'kk', label: 'Kartu Keluarga', required: true },
		{ type: 'akta', label: 'Akta Kelahiran', required: true },
		{ type: 'passport', label: 'Paspor (Optional)', required: false },
		{ type: 'kitas', label: 'KITAS (Optional)', required: false }
	];

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const uploadedDocs = $derived(new Map(data.documents.map((doc: any) => [doc.documentType, doc])));

	function openCamera(type: 'kk' | 'akta' | 'passport' | 'kitas') {
		currentDocumentType = type;
		showCamera = true;
	}

	async function handleCapture(event: CustomEvent<File>) {
		const file = event.detail;
		uploading = true;
		uploadError = null;

		try {
			// Compress image
			const compressed = await compressImage(file, {
				maxWidthOrHeight: 1920,
				quality: 0.85,
				mimeType: 'image/jpeg'
			});

			// Upload to server
			const formData = new FormData();
			formData.append('file', compressed);
			formData.append('documentType', currentDocumentType);

			const response = await fetch(`/api/applications/${data.draft.id}/documents`, {
				method: 'POST',
				body: formData
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || 'Gagal mengunggah dokumen');
			}

			// Reload page to refresh document list
			window.location.reload();
		} catch (err) {
			console.error('Upload error:', err);
			uploadError = err instanceof Error ? err.message : 'Gagal mengunggah dokumen';
			uploading = false;
		}
	}

	function closeCamera() {
		showCamera = false;
	}

	async function handleNext() {
		// Check if required documents are uploaded
		const missingDocs = requiredDocuments
			.filter((doc) => doc.required && !uploadedDocs.has(doc.type))
			.map((doc) => doc.label);

		if (missingDocs.length > 0) {
			uploadError = `Mohon unggah dokumen: ${missingDocs.join(', ')}`;
			return;
		}

		await goto(`/${data.tenantSlug}/register/form/step-4`);
	}
</script>

<svelte:head>
	<title>Upload Dokumen - Langkah Documents</title>
</svelte:head>

<Card class="p-8">
	<div class="mb-6">
		<h1 class="text-2xl font-bold text-gray-900 mb-2">Dokumen Pendukung</h1>
		<p class="text-gray-600">Unggah dokumen yang diperlukan untuk verifikasi</p>
	</div>

	{#if uploadError}
		<Alert variant="destructive" class="mb-6">
			{uploadError}
		</Alert>
	{/if}

	<div class="space-y-4">
		{#each requiredDocuments as doc}
			{@const uploaded = uploadedDocs.get(doc.type)}
			<div class="border rounded-lg p-4 flex items-center justify-between">
				<div class="flex items-center gap-3">
					<FileText class="w-5 h-5 text-gray-400" />
					<div>
						<h3 class="font-medium text-gray-900">
							{doc.label}
							{#if doc.required}
								<span class="text-red-500">*</span>
							{/if}
						</h3>
						{#if uploaded}
							<p class="text-xs text-green-600 flex items-center gap-1">
								<CheckCircle class="w-3 h-3" />
								{uploaded.fileName}
							</p>
						{:else}
							<p class="text-xs text-gray-500">
								{doc.required ? 'Wajib diunggah' : 'Opsional'}
							</p>
						{/if}
					</div>
				</div>

				<div>
					{#if uploaded}
						<!-- eslint-disable-next-line @typescript-eslint/no-explicit-any -->
						<Button variant="outline" size="sm" onclick={() => openCamera(doc.type as any)}>
							Ganti
						</Button>
					{:else}
						<!-- eslint-disable-next-line @typescript-eslint/no-explicit-any -->
						<Button size="sm" onclick={() => openCamera(doc.type as any)}>
							<Upload class="w-4 h-4 mr-2" />
							Upload
						</Button>
					{/if}
				</div>
			</div>
		{/each}
	</div>

	<div class="flex justify-between mt-8">
		<Button variant="outline" onclick={() => goto(`/${data.tenantSlug}/register/form/step-3`)}>
			Kembali
		</Button>

		<Button onclick={handleNext} disabled={uploading}>
			{uploading ? 'Mengunggah...' : 'Lanjut ke Ringkasan'}
		</Button>
	</div>
</Card>

{#if showCamera}
	<CameraUpload
		documentType={currentDocumentType}
		oncapture={handleCapture}
		onclose={closeCamera}
	/>
{/if}

<p class="text-sm text-gray-500 text-center mt-4">
	Dokumen Anda akan dienkripsi untuk keamanan data
</p>
