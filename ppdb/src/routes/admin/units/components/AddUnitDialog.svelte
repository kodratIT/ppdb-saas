<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Select, SelectContent, SelectItem, SelectTrigger } from '$lib/components/ui';
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import { Plus, Loader2 } from 'lucide-svelte';

	let open = $state(false);
	let loading = $state(false);

	const schoolLevels = [
		{ value: 'TK', label: 'TK (Taman Kanak-Kanak)' },
		{ value: 'SD', label: 'SD (Sekolah Dasar)' },
		{ value: 'SMP', label: 'SMP (Sekolah Menengah Pertama)' },
		{ value: 'SMA', label: 'SMA (Sekolah Menengah Atas)' },
		{ value: 'SMK', label: 'SMK (Sekolah Menengah Kejuruan)' },
		{ value: 'Universitas', label: 'Universitas' },
		{ value: 'Lainnya', label: 'Lainnya' }
	];

	let selectedLevel = $state('SD');

	function handleLevelChange(value: string) {
		selectedLevel = value;
	}

	function getLevelLabel(value: string) {
		return schoolLevels.find((l) => l.value === value)?.label || value;
	}
</script>

<Button onclick={() => (open = true)}>
	<Plus class="mr-2 h-4 w-4" />
	Tambah Unit
</Button>

<Dialog.Root bind:open>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>Tambah Unit Sekolah</Dialog.Title>
			<Dialog.Description>
				Tambahkan unit sekolah baru ke dalam yayasan/tenant Anda.
			</Dialog.Description>
		</Dialog.Header>
		<form
			method="POST"
			action="?/addUnit"
			use:enhance={() => {
				loading = true;
				return async ({ result, update }) => {
					loading = false;
					if (result.type === 'success') {
						toast.success('Unit berhasil ditambahkan');
						open = false;
						await update();
						await invalidateAll();
					} else if (result.type === 'failure') {
						toast.error(result.data?.error || 'Gagal menambah unit');
					}
				};
			}}
			class="space-y-4 py-4"
		>
			<div class="space-y-2">
				<Label for="name">Nama Unit</Label>
				<Input id="name" name="name" placeholder="Contoh: SMA Negeri 1 Jakarta" required />
			</div>
			<div class="space-y-2">
				<Label for="level">Jenjang</Label>
				<Select type="single" value={selectedLevel} onValueChange={handleLevelChange}>
					<SelectTrigger id="level">
						{getLevelLabel(selectedLevel)}
					</SelectTrigger>
					<SelectContent>
						{#each schoolLevels as level}
							<SelectItem value={level.value}>{level.label}</SelectItem>
						{/each}
					</SelectContent>
				</Select>
				<input type="hidden" name="level" value={selectedLevel} />
			</div>
			<Dialog.Footer>
				<Button type="button" variant="outline" onclick={() => (open = false)}>Batal</Button>
				<Button type="submit" disabled={loading}>
					{#if loading}
						<Loader2 class="mr-2 h-4 w-4 animate-spin" />
						Menyimpan...
					{:else}
						Simpan
					{/if}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
