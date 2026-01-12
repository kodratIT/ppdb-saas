<script lang="ts">
	import { enhance } from '$app/forms';
	import Button from '$lib/components/ui/button.svelte';
	import Label from '$lib/components/ui/label.svelte';
	import Card from '$lib/components/ui/card.svelte';
	import Alert from '$lib/components/ui/alert.svelte';
	import DynamicField from '$lib/components/forms/dynamic/DynamicField.svelte';
	import { createFormDraft } from '$lib/stores/form-draft.svelte';

	let { data, form } = $props();

	// Initialize store
	const draftStore = createFormDraft(data.draft || {});

	let parentFullName = $state(data.draft?.parentFullName || '');
	let parentPhone = $state(data.draft?.parentPhone || '');
	let parentEmail = $state(data.draft?.parentEmail || '');
	let isSubmitting = $state(false);

	// Update store when base fields change
	$effect(() => {
		draftStore.update({
			parentFullName,
			parentPhone,
			parentEmail
		});
	});
</script>

<svelte:head>
	<title>Formulir Pendaftaran - Langkah 2</title>
</svelte:head>

<Card class="p-8">
	<div class="mb-6">
		<h1 class="text-2xl font-bold text-gray-900 mb-2">Data Orang Tua</h1>
		<p class="text-gray-600">Silakan isi informasi kontak orang tua / wali</p>
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
				<Label for="parentFullName">Nama Lengkap Orang Tua *</Label>
				<input
					id="parentFullName"
					name="parentFullName"
					type="text"
					placeholder="Nama lengkap wali murid"
					bind:value={parentFullName}
					required
					class="mt-2 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
				/>
			</div>

			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div>
					<Label for="parentPhone">Nomor WhatsApp *</Label>
					<input
						id="parentPhone"
						name="parentPhone"
						type="tel"
						placeholder="0812..."
						bind:value={parentPhone}
						required
						class="mt-2 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
					/>
				</div>

				<div>
					<Label for="parentEmail">Email</Label>
					<input
						id="parentEmail"
						name="parentEmail"
						type="email"
						placeholder="nama@email.com"
						bind:value={parentEmail}
						class="mt-2 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
					/>
				</div>
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
				{isSubmitting ? 'Menyimpan...' : 'Lanjut ke Langkah 3'}
			</button>
		</div>
	</form>
</Card>

<p class="text-sm text-gray-500 text-center mt-4">
	Data Anda tersimpan otomatis. Anda dapat melanjutkan nanti.
</p>
