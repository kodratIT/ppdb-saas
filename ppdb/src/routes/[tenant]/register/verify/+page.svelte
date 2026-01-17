<script lang="ts">
	/* eslint-disable svelte/no-navigation-without-resolve */
	import { enhance } from '$app/forms';
	import Button from '$lib/components/ui/button.svelte';
	import Input from '$lib/components/ui/input.svelte';
	import Label from '$lib/components/ui/label.svelte';
	import Card from '$lib/components/ui/card.svelte';
	import Alert from '$lib/components/ui/alert.svelte';

	let { data, form } = $props();

	let otp = $state('');
	let isSubmitting = $state(false);
</script>

<svelte:head>
	<title>Verifikasi Kode OTP</title>
</svelte:head>

<div
	class="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4"
>
	<Card class="w-full max-w-md p-8">
		<div class="text-center mb-8">
			<h1 class="text-3xl font-bold text-gray-900 mb-2">Verifikasi Kode OTP</h1>
			<p class="text-gray-600">Kode verifikasi telah dikirim ke WhatsApp</p>
			<p class="font-mono text-lg text-blue-600 mt-2">
				{data.phone}
			</p>
		</div>

		{#if form?.error}
			<Alert variant="destructive" class="mb-6">
				{form.error}
			</Alert>
		{/if}

		<form
			method="POST"
			action="?/verifyOTP"
			use:enhance={() => {
				isSubmitting = true;
				return async ({ update }) => {
					await update();
					isSubmitting = false;
				};
			}}
		>
			<input type="hidden" name="phone" value={data.phone} />

			<div class="space-y-6">
				<div>
					<Label for="otp">Kode OTP (6 digit)</Label>
					<Input
						id="otp"
						name="otp"
						type="text"
						inputmode="numeric"
						pattern="[0-9]{6}"
						maxlength="6"
						placeholder="123456"
						required
						class="mt-2 text-center text-2xl tracking-widest font-mono"
					/>
					<p class="text-sm text-gray-500 mt-2">Kode OTP berlaku selama 5 menit</p>
				</div>

				<Button type="submit" class="w-full" disabled={isSubmitting || otp.length !== 6}>
					{isSubmitting ? 'Memverifikasi...' : 'Verifikasi'}
				</Button>
			</div>
		</form>

		<div class="mt-6 text-center space-y-2">
			<p class="text-sm text-gray-600">Tidak menerima kode?</p>
			<a
				href="/{data.tenantSlug}/register/start"
				class="text-sm text-blue-600 hover:text-blue-700 inline-block"
			>
				Kirim Ulang Kode
			</a>
		</div>
	</Card>
</div>
