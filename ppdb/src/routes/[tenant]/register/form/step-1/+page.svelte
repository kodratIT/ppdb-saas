<script lang="ts">
	import { enhance } from '$app/forms';
	import Button from '$lib/components/ui/button.svelte';
	import Input from '$lib/components/ui/input.svelte';
	import Label from '$lib/components/ui/label.svelte';
	import Select from '$lib/components/ui/select.svelte';
	import Card from '$lib/components/ui/card.svelte';
	import Alert from '$lib/components/ui/alert.svelte';
	import Progress from '$lib/components/ui/progress.svelte';

	let { data, form } = $props();

	let admissionPathId = $state(data.draft?.admissionPathId || '');
	let childFullName = $state(data.draft?.childFullName || '');
	let childNickname = $state(data.draft?.childNickname || '');
	let childDob = $state(data.draft?.childDob?.split('T')[0] || '');
	let childGender = $state(data.draft?.childGender || '');
	let isSubmitting = $state(false);

	const currentStep = 1;
	const totalSteps = 4;

	function handleInput(e: Event, ref: string) {
		const target = e.currentTarget as HTMLInputElement;
		if (ref === 'fullName') childFullName = target.value;
		if (ref === 'nickname') childNickname = target.value;
		if (ref === 'dob') childDob = target.value;
	}
</script>

<svelte:head>
	<title>Formulir Pendaftaran - Langkah 1</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4">
	<div class="max-w-2xl mx-auto">
		<div class="mb-8">
			<div class="flex items-center justify-between mb-2">
				<span class="text-sm font-medium text-gray-700">
					Langkah {currentStep} dari {totalSteps}
				</span>
				<span class="text-sm text-gray-500"
					>{Math.round((currentStep / totalSteps) * 100)}% selesai</span
				>
			</div>
			<Progress value={(currentStep / totalSteps) * 100} />
		</div>

		<Card class="p-8">
			<div class="mb-6">
				<h1 class="text-2xl font-bold text-gray-900 mb-2">Data Anak</h1>
				<p class="text-gray-600">Silakan isi informasi dasar tentang anak Anda</p>
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
						<Label for="admissionPathId">Jalur Pendaftaran *</Label>
						<select
							id="admissionPathId"
							name="admissionPathId"
							bind:value={admissionPathId}
							required
							class="mt-2 w-full rounded-md border border-input bg-background px-3 py-2"
						>
							<option value="">Pilih Jalur Pendaftaran</option>
							{#each data.admissionPaths as path}
								<option value={path.id}>
									{path.name} (Kuota: {path.quota})
								</option>
							{/each}
						</select>
					</div>

					<div>
						<Label for="childFullName">Nama Lengkap Anak *</Label>
						<input
							id="childFullName"
							name="childFullName"
							type="text"
							placeholder="Sesuai akta kelahiran"
							value={childFullName}
							oninput={(e) => handleInput(e, 'fullName')}
							required
							class="mt-2 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
						/>
					</div>

					<div>
						<Label for="childNickname">Nama Panggilan</Label>
						<input
							id="childNickname"
							name="childNickname"
							type="text"
							placeholder="Nama yang biasa digunakan"
							value={childNickname}
							oninput={(e) => handleInput(e, 'nickname')}
							class="mt-2 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
						/>
					</div>

					<div>
						<Label for="childDob">Tanggal Lahir *</Label>
						<input
							id="childDob"
							name="childDob"
							type="date"
							value={childDob}
							oninput={(e) => handleInput(e, 'dob')}
							required
							class="mt-2 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
						/>
					</div>

					<div>
						<Label for="childGender">Jenis Kelamin *</Label>
						<select
							id="childGender"
							name="childGender"
							bind:value={childGender}
							required
							class="mt-2 w-full rounded-md border border-input bg-background px-3 py-2"
						>
							<option value="">Pilih</option>
							<option value="male">Laki-laki</option>
							<option value="female">Perempuan</option>
						</select>
					</div>
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
						{isSubmitting ? 'Menyimpan...' : 'Lanjut ke Langkah 2'}
					</button>
				</div>
			</form>
		</Card>

		<p class="text-sm text-gray-500 text-center mt-4">
			Data Anda tersimpan otomatis. Anda dapat melanjutkan nanti.
		</p>
	</div>
</div>
