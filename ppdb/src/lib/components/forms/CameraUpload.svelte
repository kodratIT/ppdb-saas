<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { X, Camera, Upload } from 'lucide-svelte';
	import Button from '$lib/components/ui/button.svelte';

	let {
		documentType = 'kk',
		onCapture,
		maxSizeMB = 2
	}: {
		documentType?: 'kk' | 'akta' | 'passport' | 'kitas' | 'photo' | 'other';
		onCapture?: (file: File) => void;
		maxSizeMB?: number;
	} = $props();

	const dispatch = createEventDispatcher();

	let videoRef = $state<HTMLVideoElement>();
	let canvasRef = $state<HTMLCanvasElement>();
	let stream = $state<MediaStream | null>(null);
	let isCameraActive = $state(false);
	let capturedImage = $state<string | null>(null);
	let error = $state<string | null>(null);

	const documentGuides = {
		kk: { label: 'Kartu Keluarga', ratio: 1.4 },
		akta: { label: 'Akta Kelahiran', ratio: 1.4 },
		passport: { label: 'Paspor', ratio: 0.7 },
		kitas: { label: 'KITAS', ratio: 1.6 },
		photo: { label: 'Foto', ratio: 0.75 },
		other: { label: 'Dokumen', ratio: 1.4 }
	};

	const guide = $derived(documentGuides[documentType]);

	async function startCamera() {
		try {
			error = null;
			stream = await navigator.mediaDevices.getUserMedia({
				video: {
					facingMode: 'environment',
					width: { ideal: 1920 },
					height: { ideal: 1080 }
				}
			});

			if (videoRef) {
				videoRef.srcObject = stream;
				await videoRef.play();
				isCameraActive = true;
			}
		} catch (err) {
			console.error('Camera access error:', err);
			error = 'Tidak dapat mengakses kamera. Pastikan izin kamera telah diberikan.';
		}
	}

	function stopCamera() {
		if (stream) {
			stream.getTracks().forEach((track) => track.stop());
			stream = null;
		}
		isCameraActive = false;
	}

	function capturePhoto() {
		if (!videoRef || !canvasRef) return;

		const video = videoRef;
		const canvas = canvasRef;
		const context = canvas.getContext('2d');

		if (!context) return;

		// Set canvas size to video size
		canvas.width = video.videoWidth;
		canvas.height = video.videoHeight;

		// Draw current video frame to canvas
		context.drawImage(video, 0, 0, canvas.width, canvas.height);

		// Convert to blob and compress
		canvas.toBlob(
			async (blob) => {
				if (!blob) return;

				// Create File from blob
				const file = new File([blob], `${documentType}_${Date.now()}.jpg`, {
					type: 'image/jpeg'
				});

				// Check file size
				const fileSizeMB = file.size / (1024 * 1024);
				if (fileSizeMB > maxSizeMB) {
					error = `Ukuran file terlalu besar (${fileSizeMB.toFixed(1)}MB). Maksimal ${maxSizeMB}MB.`;
					return;
				}

				capturedImage = canvas.toDataURL('image/jpeg', 0.85);
				stopCamera();

				if (onCapture) {
					onCapture(file);
				}
				dispatch('capture', file);
			},
			'image/jpeg',
			0.85
		);
	}

	function retakePhoto() {
		capturedImage = null;
		startCamera();
	}

	function handleFileInput(event: Event) {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];

		if (file) {
			const fileSizeMB = file.size / (1024 * 1024);
			if (fileSizeMB > maxSizeMB) {
				error = `Ukuran file terlalu besar (${fileSizeMB.toFixed(1)}MB). Maksimal ${maxSizeMB}MB.`;
				return;
			}

			if (!file.type.startsWith('image/')) {
				error = 'File harus berupa gambar (JPG, PNG, etc.)';
				return;
			}

			const reader = new FileReader();
			reader.onload = (e) => {
				capturedImage = e.target?.result as string;
				if (onCapture) {
					onCapture(file);
				}
				dispatch('capture', file);
			};
			reader.readAsDataURL(file);
		}
	}

	$effect(() => {
		return () => {
			stopCamera();
		};
	});
</script>

<div class="fixed inset-0 z-50 bg-black">
	{#if !capturedImage}
		<!-- Camera View -->
		<div class="relative w-full h-full">
			<video
				bind:this={videoRef}
				class="absolute inset-0 w-full h-full object-cover"
				playsinline
				muted
			></video>

			<!-- Guided Overlay -->
			{#if isCameraActive}
				<div class="absolute inset-0 flex items-center justify-center p-4">
					<!-- Dark overlay with transparent center -->
					<div class="absolute inset-0 bg-black/50"></div>

					<!-- Document frame guide -->
					<div
						class="relative z-10 border-4 border-white rounded-lg shadow-2xl"
						style="width: 85%; aspect-ratio: {guide.ratio}; max-width: 500px;"
					>
						<!-- Corner guides -->
						<div
							class="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-blue-400"
						></div>
						<div
							class="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-blue-400"
						></div>
						<div
							class="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-blue-400"
						></div>
						<div
							class="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-blue-400"
						></div>

						<!-- Instruction text -->
						<div class="absolute -top-16 left-0 right-0 text-center">
							<p class="text-white text-sm font-semibold drop-shadow-lg">
								Posisikan {guide.label} di dalam bingkai
							</p>
						</div>
					</div>
				</div>
			{/if}

			<!-- Top bar -->
			<div
				class="absolute top-0 left-0 right-0 p-4 flex justify-between items-center bg-gradient-to-b from-black/70 to-transparent"
			>
				<button onclick={stopCamera} class="text-white p-2">
					<X class="w-6 h-6" />
				</button>
				<h3 class="text-white font-semibold">Upload {guide.label}</h3>
				<div class="w-10"></div>
			</div>

			<!-- Bottom controls -->
			<div
				class="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/70 to-transparent"
			>
				{#if error}
					<p class="text-red-400 text-sm text-center mb-4">{error}</p>
				{/if}

				{#if !isCameraActive}
					<div class="flex flex-col gap-3">
						<Button onclick={startCamera} class="w-full bg-blue-600 hover:bg-blue-700">
							<Camera class="w-5 h-5 mr-2" />
							Buka Kamera
						</Button>

						<label class="w-full">
							<input type="file" accept="image/*" onchange={handleFileInput} class="hidden" />
							<Button
								as="div"
								variant="outline"
								class="w-full text-white border-white hover:bg-white/10"
							>
								<Upload class="w-5 h-5 mr-2" />
								Pilih dari Galeri
							</Button>
						</label>
					</div>
				{:else}
					<Button
						onclick={capturePhoto}
						class="w-20 h-20 mx-auto rounded-full bg-white border-4 border-blue-500 hover:bg-gray-100"
					>
						<div class="w-16 h-16 rounded-full bg-white border-2 border-gray-300"></div>
					</Button>
				{/if}
			</div>
		</div>
	{:else}
		<!-- Preview -->
		<div class="relative w-full h-full flex flex-col bg-black">
			<div class="flex-1 flex items-center justify-center p-4">
				<img src={capturedImage} alt="Preview" class="max-w-full max-h-full object-contain" />
			</div>

			<div class="p-6 bg-gradient-to-t from-black to-transparent">
				<div class="flex gap-3">
					<Button onclick={retakePhoto} variant="outline" class="flex-1 text-white border-white">
						Ambil Ulang
					</Button>
					<Button onclick={stopCamera} class="flex-1 bg-blue-600 hover:bg-blue-700">
						Gunakan Foto Ini
					</Button>
				</div>
			</div>
		</div>
	{/if}

	<!-- Hidden canvas for capture -->
	<canvas bind:this={canvasRef} class="hidden"></canvas>
</div>
