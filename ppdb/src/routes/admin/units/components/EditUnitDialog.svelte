<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Select, SelectContent, SelectItem, SelectTrigger } from '$lib/components/ui';
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import { Pencil, Loader2, MapPin, Phone, School, Info, Building2 } from 'lucide-svelte';

	interface Props {
		unit: any;
		tenants?: any[];
		user: any;
	}

	let { unit, tenants = [], user } = $props<Props>();

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

	const accreditations = [
		{ value: 'A', label: 'Akreditasi A' },
		{ value: 'B', label: 'Akreditasi B' },
		{ value: 'C', label: 'Akreditasi C' },
		{ value: 'Belum Terakreditasi', label: 'Belum Terakreditasi' }
	];

	let selectedLevel = $state(unit.level || 'SD');
	let selectedAccreditation = $state(unit.accreditation || 'A');
	let selectedTenantId = $state(unit.tenantId || '');

	function handleLevelChange(value: string) {
		selectedLevel = value;
	}

	function handleAccreditationChange(value: string) {
		selectedAccreditation = value;
	}

	function handleTenantChange(value: string) {
		selectedTenantId = value;
	}

	function getLevelLabel(value: string) {
		return schoolLevels.find((l) => l.value === value)?.label || value;
	}

	function getAccLabel(value: string) {
		return accreditations.find((a) => a.value === value)?.label || value;
	}

	function getTenantLabel(id: string) {
		return tenants.find((t) => t.id === id)?.name || 'Pilih Yayasan';
	}
</script>

<Button
	variant="ghost"
	size="icon"
	class="h-8 w-8 text-muted-foreground hover:text-primary"
	onclick={() => (open = true)}
>
	<Pencil class="h-4 w-4" />
	<span class="sr-only">Edit</span>
</Button>

<Dialog.Root bind:open>
	<Dialog.Content class="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
		<Dialog.Header>
			<Dialog.Title>Edit Unit Sekolah</Dialog.Title>
			<Dialog.Description>
				Perbarui informasi profil unit sekolah {unit.name}.
			</Dialog.Description>
		</Dialog.Header>
		<form
			method="POST"
			action="?/updateUnit"
			use:enhance={() => {
				loading = true;
				return async ({ result, update }) => {
					loading = false;
					if (result.type === 'success') {
						toast.success('Unit berhasil diperbarui');
						open = false;
						await update();
						await invalidateAll();
					} else if (result.type === 'failure') {
						// @ts-ignore
						toast.error(result.data?.error || 'Gagal memperbarui unit');
					}
				};
			}}
			class="space-y-6 py-4"
		>
			<input type="hidden" name="id" value={unit.id} />

			<!-- Super Admin: Tenant Selection -->
			{#if user.role === 'super_admin'}
				<div class="space-y-4 bg-muted/30 p-4 rounded-lg border border-dashed">
					<h4 class="text-sm font-semibold flex items-center gap-2 text-blue-600">
						<Building2 class="h-4 w-4" /> Relasi Yayasan / Tenant
					</h4>
					<div class="space-y-2">
						<Label for="tenantId">Pilih Yayasan Tujuan *</Label>
						<Select type="single" value={selectedTenantId} onValueChange={handleTenantChange}>
							<SelectTrigger id="tenantId">
								{getTenantLabel(selectedTenantId)}
							</SelectTrigger>
							<SelectContent>
								{#each tenants as tenant}
									<SelectItem value={tenant.id}>{tenant.name}</SelectItem>
								{/each}
							</SelectContent>
						</Select>
						<input type="hidden" name="tenantId" value={selectedTenantId} />
					</div>
				</div>
			{/if}

			<!-- Informasi Dasar -->
			<div class="space-y-4">
				<h4 class="text-sm font-semibold flex items-center gap-2 text-primary">
					<School class="h-4 w-4" /> Informasi Identitas
				</h4>

				<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<div class="space-y-2">
						<Label for="name">Nama Unit *</Label>
						<Input id="name" name="name" value={unit.name} required />
					</div>
					<div class="space-y-2">
						<Label for="npsn">NPSN Unit</Label>
						<Input
							id="npsn"
							name="npsn"
							value={unit.npsn || ''}
							placeholder="8 digit NPSN"
							maxlength="8"
						/>
					</div>
				</div>

				<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<div class="space-y-2">
						<Label for="level">Jenjang *</Label>
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
					<div class="space-y-2">
						<Label for="accreditation">Akreditasi</Label>
						<Select
							type="single"
							value={selectedAccreditation}
							onValueChange={handleAccreditationChange}
						>
							<SelectTrigger id="accreditation">
								{getAccLabel(selectedAccreditation)}
							</SelectTrigger>
							<SelectContent>
								{#each accreditations as acc}
									<SelectItem value={acc.value}>{acc.label}</SelectItem>
								{/each}
							</SelectContent>
						</Select>
						<input type="hidden" name="accreditation" value={selectedAccreditation} />
					</div>
				</div>
			</div>

			<!-- Kontak & Lokasi -->
			<div class="space-y-4 pt-2 border-t">
				<h4 class="text-sm font-semibold flex items-center gap-2 text-primary">
					<MapPin class="h-4 w-4" /> Kontak & Lokasi Unit
				</h4>

				<div class="space-y-2">
					<Label for="contactPhone">WhatsApp Admin Unit</Label>
					<div class="relative">
						<Phone class="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
						<Input
							id="contactPhone"
							name="contactPhone"
							value={unit.contactPhone || ''}
							placeholder="0812xxxx"
							class="pl-9"
						/>
					</div>
				</div>

				<div class="space-y-2">
					<Label for="address">Alamat Lengkap Unit</Label>
					<Textarea
						id="address"
						name="address"
						value={unit.address || ''}
						placeholder="Jl. Pendidikan No. 123, Kelurahan..."
						rows={3}
					/>
				</div>
			</div>

			<Dialog.Footer class="pt-4">
				<Button type="button" variant="outline" onclick={() => (open = false)}>Batal</Button>
				<Button type="submit" disabled={loading}>
					{#if loading}
						<Loader2 class="mr-2 h-4 w-4 animate-spin" />
						Menyimpan...
					{:else}
						Perbarui Unit
					{/if}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
