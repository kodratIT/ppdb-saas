<script lang="ts">
	/* eslint-disable svelte/require-each-key */
	/* eslint-disable svelte/no-navigation-without-resolve */
	import { enhance } from '$app/forms';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Alert } from '$lib/components/ui/alert';
	import { onMount } from 'svelte';

	export let data;
	export let form;

	let photos: { file: File; preview: string; caption: string; base64: string }[] = [];
	let gpsLocation = '';
	let loading = false;
	let success = false;

	async function handleFileChange(e: Event) {
		const target = e.target as HTMLInputElement;
		if (!target.files) return;

		const newFiles = Array.from(target.files);
		for (const file of newFiles) {
			const preview = URL.createObjectURL(file);
			const base64 = await fileToBase64(file);
			photos = [...photos, { file, preview, caption: '', base64 }];
		}
	}

	function fileToBase64(file: File): Promise<string> {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.readAsDataURL(file);
			reader.onload = () => resolve(reader.result as string);
			reader.onerror = (error) => reject(error);
		});
	}

	function removePhoto(index: number) {
		URL.revokeObjectURL(photos[index].preview);
		photos = photos.filter((_, i) => i !== index);
	}

	onMount(() => {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition((position) => {
				gpsLocation = `${position.coords.latitude},${position.coords.longitude}`;
			});
		}
	});

	$: if (form?.success) {
		success = true;
	}
</script>

<div class="container max-w-2xl mx-auto py-8 px-4">
	<div class="mb-6">
		<a
			href="/{data.tenantSlug}/admin/verify/{data.application.id}"
			class="text-sm text-primary hover:underline"
		>
			&larr; Kembali ke Verifikasi
		</a>
		<h1 class="text-2xl font-bold mt-2">Laporan Kunjungan Rumah</h1>
		<p class="text-muted-foreground">Kandidat: {data.application.id}</p>
	</div>

	{#if success}
		<Alert class="mb-6 bg-green-50 border-green-200 text-green-800">
			Laporan berhasil disimpan. Anda dapat kembali ke halaman verifikasi.
		</Alert>
	{:else}
		<form
			method="POST"
			use:enhance={() => {
				loading = true;
				return async ({ update }) => {
					loading = false;
					await update();
				};
			}}
			class="space-y-6"
		>
			<input type="hidden" name="gpsLocation" value={gpsLocation} />

			<Card.Root>
				<Card.Header>
					<Card.Title>Kondisi Rumah</Card.Title>
					<Card.Description>Informasi mengenai kondisi fisik tempat tinggal</Card.Description>
				</Card.Header>
				<Card.Content class="space-y-4">
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div class="space-y-2">
							<Label for="roof">Kondisi Atap</Label>
							<Input id="roof" name="roof" placeholder="Misal: Genteng, Seng, Bocor..." required />
						</div>
						<div class="space-y-2">
							<Label for="floor">Kondisi Lantai</Label>
							<Input
								id="floor"
								name="floor"
								placeholder="Misal: Keramik, Semen, Tanah..."
								required
							/>
						</div>
						<div class="space-y-2">
							<Label for="walls">Kondisi Dinding</Label>
							<Input id="walls" name="walls" placeholder="Misal: Tembok, Kayu, Bambu..." required />
						</div>
					</div>
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Header>
					<Card.Title>Foto Lapangan</Card.Title>
					<Card.Description>Unggah minimal 2 foto (Depan rumah & Ruang tamu)</Card.Description>
				</Card.Header>
				<Card.Content class="space-y-4">
					<div class="grid grid-cols-2 gap-4">
						{#each photos as photo, i}
							<div class="relative group border rounded-lg overflow-hidden">
								<img src={photo.preview} alt="Preview" class="w-full h-32 object-cover" />
								<button
									type="button"
									aria-label="Remove photo"
									on:click={() => removePhoto(i)}
									class="absolute top-1 right-1 bg-destructive text-destructive-foreground p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="16"
										height="16"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
										stroke-linecap="round"
										stroke-linejoin="round"
										><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path
											d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"
										/></svg
									>
								</button>
								<div class="p-2">
									<Input
										placeholder="Keterangan foto"
										class="text-xs h-8"
										bind:value={photo.caption}
									/>
									<input type="hidden" name="photos" value={photo.base64} />
									<input type="hidden" name="captions" value={photo.caption} />
								</div>
							</div>
						{/each}

						<label
							class="border-2 border-dashed rounded-lg h-32 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="24"
								height="24"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
								class="text-muted-foreground mb-2"
								><path
									d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"
								/><circle cx="12" cy="13" r="3" /></svg
							>
							<span class="text-xs text-muted-foreground">Tambah Foto</span>
							<input
								type="file"
								accept="image/*"
								multiple
								on:change={handleFileChange}
								class="hidden"
							/>
						</label>
					</div>
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Header>
					<Card.Title>Kesimpulan & Rekomendasi</Card.Title>
				</Card.Header>
				<Card.Content class="space-y-4">
					<div class="space-y-2">
						<Label for="summary">Catatan Petugas</Label>
						<Textarea
							id="summary"
							name="summary"
							placeholder="Tuliskan detail temuan di lapangan..."
							required
						/>
					</div>
					<div class="space-y-2">
						<Label for="recommendation">Rekomendasi</Label>
						<select
							name="recommendation"
							class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
							required
						>
							<option value="">Pilih Rekomendasi</option>
							<option value="recommended">Layak Menerima Beasiswa</option>
							<option value="not_recommended">Tidak Layak Menerima Beasiswa</option>
						</select>
					</div>
				</Card.Content>
			</Card.Root>

			{#if form?.message}
				<Alert variant="destructive">{form.message}</Alert>
			{/if}

			<Button type="submit" class="w-full" disabled={loading || photos.length < 2}>
				{loading ? 'Menyimpan...' : 'Simpan Laporan'}
			</Button>
		</form>
	{/if}
</div>
