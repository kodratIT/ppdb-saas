<script lang="ts">
	/* eslint-disable svelte/no-navigation-without-resolve */
	import { goto } from '$app/navigation';
	import { enhance } from '$app/forms';
	import Button from '$lib/components/ui/button.svelte';
	import Input from '$lib/components/ui/input.svelte';
	import Label from '$lib/components/ui/label.svelte';
	import Card from '$lib/components/ui/card.svelte';
	import Alert from '$lib/components/ui/alert.svelte';

	let { data, form } = $props();

	// let phoneNumber = $state(form?.phone || '');
	let isSubmitting = $state(false);

	$effect(() => {
		if (form?.success && form?.phone) {
			goto(`/${data.tenantSlug}/register/verify?phone=${encodeURIComponent(form.phone)}`);
		}
	});
</script>

<svelte:head>
	<title>Mulai Pendaftaran</title>
</svelte:head>

<div
	class="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4"
>
	<Card class="w-full max-w-md p-8">
		<div class="text-center mb-8">
			<h1 class="text-3xl font-bold text-gray-900 mb-2">Mulai Pendaftaran</h1>
			<p class="text-gray-600">Masukkan nomor WhatsApp Anda untuk menerima kode verifikasi</p>
		</div>

		{#if form?.error}
			<Alert variant="destructive" class="mb-6">
				{form.error}
			</Alert>
		{/if}

		<form
			method="POST"
			action="?/requestOTP"
			use:enhance={() => {
				isSubmitting = true;
				return async ({ update }) => {
					await update();
					isSubmitting = false;
				};
			}}
		>
			<div class="space-y-6">
				<div>
					<Label for="phone">Nomor WhatsApp</Label>
					<Input
						id="phone"
						name="phone"
						type="tel"
						placeholder="+62 812 3456 7890"
						required
						class="mt-2"
					/>
					<p class="text-sm text-gray-500 mt-2">Format: +62, 62, atau 08 (contoh: +628123456789)</p>
				</div>

				<Button type="submit" class="w-full" disabled={isSubmitting}>
					{isSubmitting ? 'Mengirim...' : 'Kirim Kode Verifikasi'}
				</Button>
			</div>
		</form>

		<div class="mt-6 text-center">
			<a href="/{data.tenantSlug}/register" class="text-sm text-blue-600 hover:text-blue-700">
				← Kembali ke Halaman Utama
			</a>
		</div>
	</Card>
</div>
