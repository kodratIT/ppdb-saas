<script lang="ts">
	/* eslint-disable svelte/require-each-key */
	import { enhance } from '$app/forms';
	import Label from '$lib/components/ui/label.svelte';
	import Card from '$lib/components/ui/card.svelte';
	import Alert from '$lib/components/ui/alert.svelte';
	import DynamicField from '$lib/components/forms/dynamic/DynamicField.svelte';
	import { createFormDraft } from '$lib/stores/form-draft.svelte';

	let { data, form } = $props();

	// Initialize store
	const draftStore = createFormDraft(data.draft || {});

	let address = $state(data.draft?.address || '');
	let city = $state(data.draft?.city || '');
	let province = $state(data.draft?.province || '');
	let postalCode = $state(data.draft?.postalCode || '');
	let isSubmitting = $state(false);

	// Update store when base fields change
	$effect(() => {
		draftStore.update({
			address,
			city,
			province,
			postalCode
		});
	});
</script>

<svelte:head>
	<title>Formulir Pendaftaran - Langkah 3</title>
</svelte:head>

<Card class="p-8">
	<div class="mb-6">
		<h1 class="text-2xl font-bold text-gray-900 mb-2">Alamat Tinggal</h1>
		<p class="text-gray-600">Silakan isi informasi domisili anak saat ini</p>
	</div>

	{#if form?.error}
		<Alert variant="destructive" class="mb-6">
			{form.error}
		</Alert>
	{/if}

	<form
		method="POST"
		action="?/saveDraft"
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
				<Label for="address">Alamat Lengkap *</Label>
				<textarea
					id="address"
					name="address"
					placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan"
					bind:value={address}
					required
					rows="3"
					class="mt-2 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
				></textarea>
			</div>

			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div>
					<Label for="province">Provinsi *</Label>
					<input
						id="province"
						name="province"
						type="text"
						placeholder="Provinsi"
						bind:value={province}
						required
						class="mt-2 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
					/>
				</div>

				<div>
					<Label for="city">Kota/Kabupaten *</Label>
					<input
						id="city"
						name="city"
						type="text"
						placeholder="Kota/Kabupaten"
						bind:value={city}
						required
						class="mt-2 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
					/>
				</div>
			</div>

			<div>
				<Label for="postalCode">Kode Pos</Label>
				<input
					id="postalCode"
					name="postalCode"
					type="text"
					placeholder="12345"
					bind:value={postalCode}
					class="mt-2 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
				/>
			</div>

			<!-- Dynamic Custom Fields -->
			{#if data.customFields && data.customFields.length > 0}
				<div class="pt-4 border-t border-gray-100">
					<h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
						Informasi Tambahan
					</h3>
					<div class="space-y-6">
						{#each data.customFields as field}
							<DynamicField
								{field}
								value={draftStore.data.customFieldValues[field.key]}
								onchange={(val) => draftStore.updateCustomField(field.key, val)}
							/>
							<input
								type="hidden"
								name={field.key}
								value={draftStore.data.customFieldValues[field.key] || ''}
							/>
						{/each}
					</div>
				</div>
			{/if}
		</div>

		<div class="flex justify-between mt-8">
			<button
				type="button"
				onclick={() => window.history.back()}
				class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 h-10 px-4 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground"
			>
				Kembali
			</button>

			<button
				type="submit"
				disabled={isSubmitting}
				class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 h-10 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
			>
				{isSubmitting ? 'Menyimpan...' : 'Lanjut ke Ringkasan'}
			</button>
		</div>
	</form>
</Card>

<p class="text-sm text-gray-500 text-center mt-4">
	Data Anda tersimpan otomatis. Anda dapat melanjutkan nanti.
</p>
