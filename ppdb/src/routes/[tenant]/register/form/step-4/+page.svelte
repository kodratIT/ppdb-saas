<script lang="ts">
	import { enhance } from '$app/forms';
	import Button from '$lib/components/ui/button.svelte';
	import Label from '$lib/components/ui/label.svelte';
	import Card from '$lib/components/ui/card.svelte';
	import Alert from '$lib/components/ui/alert.svelte';
	import Progress from '$lib/components/ui/progress.svelte';
	import DynamicField from '$lib/components/forms/dynamic/DynamicField.svelte';
	import { createFormDraft } from '$lib/stores/form-draft.svelte';

	let { data, form } = $props();

	// Initialize store
	const draftStore = createFormDraft(data.draft || {});

	const currentStep = 4;
	const totalSteps = 4;
	let isSubmitting = $state(false);

	const fieldsByStep = $derived.by(() => {
		const grouped: Record<number, any[]> = { 1: [], 2: [], 3: [] };
		data.customFields.forEach((f: any) => {
			if (f.step <= 3) {
				if (!grouped[f.step]) grouped[f.step] = [];
				grouped[f.step].push(f);
			}
		});
		return grouped;
	});

	const customValues = $derived(draftStore.data.customFieldValues);
</script>

<svelte:head>
	<title>Ringkasan Pendaftaran - Langkah 4</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4">
	<div class="max-w-2xl mx-auto">
		<div class="mb-8">
			<div class="flex items-center justify-between mb-2">
				<span class="text-sm font-medium text-gray-700">
					Langkah {currentStep} dari {totalSteps}
				</span>
				<span class="text-sm text-gray-500">Hampir selesai!</span>
			</div>
			<Progress value={100} />
		</div>

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
						<span class="font-medium">{data.draft.childDob?.split('T')[0]}</span>
						<span class="text-gray-500">Jenis Kelamin:</span>
						<span class="font-medium"
							>{data.draft.childGender === 'male' ? 'Laki-laki' : 'Perempuan'}</span
						>
					</div>
					{#if fieldsByStep[1].length > 0}
						<div class="mt-4 space-y-2">
							{#each fieldsByStep[1] as field}
								<div class="grid grid-cols-2 text-sm">
									<span class="text-gray-500">{field.label}:</span>
									<span class="font-medium">{customValues[field.key] || '-'}</span>
								</div>
							{/each}
						</div>
					{/if}
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
						<span class="font-medium">{data.draft.parentEmail || '-'}</span>
					</div>
					{#if fieldsByStep[2].length > 0}
						<div class="mt-4 space-y-2">
							{#each fieldsByStep[2] as field}
								<div class="grid grid-cols-2 text-sm">
									<span class="text-gray-500">{field.label}:</span>
									<span class="font-medium">{customValues[field.key] || '-'}</span>
								</div>
							{/each}
						</div>
					{/if}
				</section>

				<!-- Step 3 Summary -->
				<section>
					<h3 class="text-lg font-semibold border-b pb-2 mb-4">Alamat</h3>
					<div class="text-sm">
						<p class="font-medium">{data.draft.address}</p>
						<p class="text-gray-600">
							{data.draft.city}, {data.draft.province}
							{data.draft.postalCode || ''}
						</p>
					</div>
					{#if fieldsByStep[3].length > 0}
						<div class="mt-4 space-y-2">
							{#each fieldsByStep[3] as field}
								<div class="grid grid-cols-2 text-sm">
									<span class="text-gray-500">{field.label}:</span>
									<span class="font-medium">{customValues[field.key] || '-'}</span>
								</div>
							{/each}
						</div>
					{/if}
				</section>
			</div>

			<form
				method="POST"
				action="?/submitApplication"
				class="mt-12"
				use:enhance={() => {
					isSubmitting = true;
					return async ({ update }) => {
						await update();
						isSubmitting = false;
					};
				}}
			>
				<div class="bg-blue-50 p-4 rounded-md mb-8">
					<p class="text-sm text-blue-800">
						Dengan mengirimkan formulir ini, saya menyatakan bahwa data yang diisi adalah benar dan
						dapat dipertanggungjawabkan.
					</p>
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
						disabled={isSubmitting}
						class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 h-10 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
					>
						{isSubmitting ? 'Mengirim...' : 'Kirim Pendaftaran'}
					</button>
				</div>
			</form>
		</Card>
	</div>
</div>
