<script lang="ts">
	/* eslint-disable svelte/no-navigation-without-resolve */

	import Card from '$lib/components/ui/card.svelte';
	import Alert from '$lib/components/ui/alert.svelte';
	import OTPInput from '$lib/components/forms/OTPInput.svelte';
	import { Clock, CheckCircle, AlertCircle, MessageSquare } from 'lucide-svelte';

	let { data, form } = $props();

	const customValues = $derived(JSON.parse(data.draft?.customFieldValues || '{}'));

	let currentStep = $state('summary'); // 'summary' | 'otp' | 'verified'
	let sessionId = $state<string | null>(null);
	let phoneNumber = $state(data.draft?.parentPhone || '');
	let otpCode = $state('');
	let sendingOTP = $state(false);
	let verifyingOTP = $state(false);
	let otpSent = $state(false);
	let countdown = $state(0);
	let countdownInterval: number | null = null;

	async function handleSendOTP(event: SubmitEvent) {
		event.preventDefault();
		sendingOTP = true;
		otpSent = false;
		countdown = 0;

		try {
			const formData = new FormData(event.target as HTMLFormElement);
			const response = await fetch('?/sendOTP', {
				method: 'POST',
				body: formData
			});

			const result = (await response.json()) as any;

			if (result.success) {
				sessionId = result.sessionId;
				phoneNumber = result.phoneNumber;
				otpSent = true;
				currentStep = 'otp';
				startCountdown();
			} else {
				alert(result.error || 'Gagal mengirim OTP');
			}
		} catch (err) {
			console.error('Send OTP error:', err);
			alert('Terjadi kesalahan. Silakan coba lagi.');
		} finally {
			sendingOTP = false;
		}
	}

	async function handleVerifyOTP() {
		if (!otpCode || otpCode.length !== 6) {
			alert('Masukkan 6 digit kode OTP');
			return;
		}

		verifyingOTP = true;

		try {
			const formData = new FormData();
			formData.append('sessionId', sessionId || '');
			formData.append('otpCode', otpCode);
			formData.append('phoneNumber', phoneNumber);

			const response = await fetch('?/submitApplication', {
				method: 'POST',
				body: formData
			});

			if (response.ok) {
				currentStep = 'verified';
			} else {
				const result = (await response.json()) as any;
				alert(result.error || 'Kode OTP tidak valid');
				otpCode = '';
			}
		} catch (err) {
			console.error('Verify OTP error:', err);
			alert('Terjadi kesalahan. Silakan coba lagi.');
		} finally {
			verifyingOTP = false;
		}
	}

	function handleOTPComplete(code: string) {
		otpCode = code;
		if (code.length === 6) {
			handleVerifyOTP();
		}
	}

	function startCountdown() {
		countdown = 120; // 2 minutes

		if (countdownInterval) {
			clearInterval(countdownInterval);
		}

		countdownInterval = window.setInterval(() => {
			countdown--;
			if (countdown <= 0) {
				clearInterval(countdownInterval!);
			}
		}, 1000) as unknown as number;
	}

	async function resendOTP() {
		await handleSendOTP(new Event('submit') as SubmitEvent);
	}

	$effect(() => {
		return () => {
			if (countdownInterval) {
				clearInterval(countdownInterval as unknown as number);
			}
		};
	});
</script>

<svelte:head>
	<title>Finalisasi Pendaftaran - Langkah 5</title>
</svelte:head>

{#if currentStep === 'summary'}
	<Card class="p-8">
		<div class="mb-6">
			<h1 class="text-2xl font-bold text-gray-900 mb-2">Ringkasan Pendaftaran</h1>
			<p class="text-gray-600">Periksa kembali data Anda sebelum mengirim</p>
		</div>

		{#if form?.error}
			<Alert variant="destructive" class="mb-6">
				{form.error}
			</Alert>
		{/if}

		<div class="space-y-8">
			<!-- Step 1 Summary -->
			<section>
				<h3 class="text-lg font-semibold border-b pb-2 mb-4">Data Anak</h3>
				<div class="grid grid-cols-2 gap-y-2 text-sm">
					<span class="text-gray-500">Nama Lengkap:</span>
					<span class="font-medium">{data.draft.childFullName}</span>
					<span class="text-gray-500">Panggilan:</span>
					<span class="font-medium">{data.draft.childNickname || '-'}</span>
					<span class="text-gray-500">Tgl Lahir:</span>
					<span class="font-medium">
						{data.draft.childDob instanceof Date
							? data.draft.childDob.toISOString().split('T')[0]
							: String(data.draft.childDob).split('T')[0]}
					</span>
					<span class="text-gray-500">Jenis Kelamin:</span>
					<span class="font-medium"
						>{data.draft.childGender === 'male' ? 'Laki-laki' : 'Perempuan'}</span
					>
				</div>
			</section>

			<!-- Step 2 Summary -->
			<section>
				<h3 class="text-lg font-semibold border-b pb-2 mb-4">Data Orang Tua</h3>
				<div class="grid grid-cols-2 gap-y-2 text-sm">
					<span class="text-gray-500">Nama Orang Tua:</span>
					<span class="font-medium">{data.draft.parentFullName}</span>
					<span class="text-gray-500">WhatsApp:</span>
					<span class="font-medium">{data.draft.parentPhone}</span>
					<span class="text-gray-500">Email:</span>
					<span class="font-medium">{customValues.parent_email || '-'}</span>
				</div>
			</section>

			<!-- Step 3 Summary -->
			<section>
				<h3 class="text-lg font-semibold border-b pb-2 mb-4">Alamat</h3>
				<div class="text-sm">
					<p class="font-medium">{customValues.address || '-'}</p>
					<p class="text-gray-600">
						{customValues.city || ''}, {customValues.province || ''}
						{customValues.postalCode || ''}
					</p>
				</div>
			</section>
		</div>

		<div class="bg-blue-50 p-4 rounded-md mb-8">
			<p class="text-sm text-blue-800">
				Dengan mengirimkan formulir ini, saya menyatakan bahwa data yang diisi adalah benar dan
				dapat dipertanggungjawabkan.
			</p>
		</div>

		<form method="POST" action="?/sendOTP" onsubmit={handleSendOTP}>
			<div class="mb-6">
				<label class="block text-sm font-medium text-gray-700 mb-2">
					Nomor WhatsApp untuk Verifikasi
				</label>
				<div class="flex gap-2">
					<input
						type="tel"
						name="phoneNumber"
						placeholder="0812..."
						value={phoneNumber}
						required
						class="flex-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
					/>
					<button
						type="submit"
						disabled={sendingOTP}
						class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 h-10 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
					>
						{sendingOTP ? 'Mengirim...' : 'Kirim Kode OTP'}
					</button>
				</div>
			</div>

			<div class="flex justify-between">
				<button
					type="button"
					onclick={() => window.history.back()}
					class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 h-10 px-4 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground"
				>
					Kembali
				</button>

				<button
					type="submit"
					disabled={sendingOTP}
					class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 h-10 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
				>
					{sendingOTP ? 'Mengirim...' : 'Lanjut ke Verifikasi'}
				</button>
			</div>
		</form>
	</Card>
{:else if currentStep === 'otp'}
	<Card class="p-8 text-center">
		<div class="mb-6">
			<div
				class="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4"
			>
				<MessageSquare class="w-8 h-8 text-green-600" />
			</div>
			<h1 class="text-2xl font-bold text-gray-900 mb-2">Verifikasi WhatsApp</h1>
			<p class="text-gray-600">
				Kami telah mengirimkan 6-digit kode OTP ke nomor <strong>{phoneNumber}</strong>
			</p>
		</div>

		<OTPInput bind:value={otpCode} oncomplete={handleOTPComplete} />

		<div class="mt-6">
			{#if countdown > 0}
				<p class="text-sm text-gray-600 mb-2">
					<Clock class="w-4 h-4 inline mr-1" />
					Kirim ulang dalam {Math.floor(countdown / 60)}:{(countdown % 60)
						.toString()
						.padStart(2, '0')}
				</p>
			{:else}
				<button
					onclick={resendOTP}
					disabled={sendingOTP}
					class="text-sm text-blue-600 hover:underline disabled:opacity-50"
				>
					Kirim ulang kode OTP
				</button>
			{/if}
		</div>

		<button
			onclick={() => (currentStep = 'summary')}
			class="mt-6 text-sm text-gray-500 hover:text-gray-700"
		>
			Kembali ke Ringkasan
		</button>

		<p class="text-xs text-gray-400 text-center mt-4">Kode OTP berlaku selama 5 menit</p>
	</Card>
{:else if currentStep === 'verified'}
	<div
		class="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center py-12 px-4"
	>
		<div class="max-w-md w-full">
			<!-- Success Card -->
			<div
				class="bg-white rounded-2xl shadow-2xl p-8 text-center transform transition-all duration-500 animate-in"
			>
				<div
					class="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6"
				>
					<CheckCircle class="w-10 h-10 text-green-600" />
				</div>

				<h1 class="text-3xl font-bold text-gray-900 mb-4">Pendaftaran Berhasil!</h1>

				<div class="bg-blue-50 rounded-xl p-6 mb-6 border-2 border-blue-200">
					<p class="text-sm text-gray-600 mb-2">Nomor Pendaftaran Anda:</p>
					<p class="text-2xl font-bold text-blue-600 tracking-wider">
						REG-{data.draft.id.slice(0, 8).toUpperCase()}
					</p>
				</div>

				<div class="space-y-3 text-left">
					<div class="flex items-start gap-3">
						<CheckCircle class="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
						<div>
							<h3 class="font-semibold text-gray-900">Draft terkonversi ke Submitted</h3>
							<p class="text-sm text-gray-600">
								Pendaftaran Anda telah disubmitkan dan akan diproses
							</p>
						</div>
					</div>

					<div class="flex items-start gap-3">
						<CheckCircle class="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
						<div>
							<h3 class="font-semibold text-gray-900">Akun berhasil dibuat</h3>
							<p class="text-sm text-gray-600">
								Anda dapat login menggunakan nomor WhatsApp {phoneNumber}
							</p>
						</div>
					</div>

					<div class="flex items-start gap-3">
						<AlertCircle class="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
						<div>
							<h3 class="font-semibold text-gray-900">Langkah Berikutnya</h3>
							<p class="text-sm text-gray-600">
								Tim verifikasi akan menghubungi Anda untuk verifikasi dokumen. Status pendaftaran
								dapat dicek melalui dashboard.
							</p>
						</div>
					</div>
				</div>

				<div class="mt-8 pt-6 border-t border-gray-200">
					<p class="text-sm text-gray-500 mb-4">
						Simpan nomor pendaftaran ini untuk tracking status Anda
					</p>
					<a
						href="/{data.tenantSlug}/dashboard"
						class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 h-10 px-6 py-2 bg-primary text-primary-foreground hover:bg-primary/90 w-full"
					>
						Masuk ke Dashboard
					</a>
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	@keyframes animate-in {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.animate-in {
		animation: animate-in 0.5s ease-out;
	}
</style>
