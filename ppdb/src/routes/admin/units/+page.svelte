<script lang="ts">
	import type { PageData } from './$types';
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import {
		Table,
		TableBody,
		TableCell,
		TableHead,
		TableHeader,
		TableRow
	} from '$lib/components/ui';
	import * as Card from '$lib/components/ui/card';
	import Button from '$lib/components/ui/button.svelte';
	import Badge from '$lib/components/ui/badge.svelte';
	import AddUnitDialog from './components/AddUnitDialog.svelte';
	import ConfirmDialog from '../schools/components/ConfirmDialog.svelte';
	import { School, Trash2, Calendar, LayoutGrid, Building2, Loader2 } from 'lucide-svelte';

	let { data } = $props<{ data: PageData }>();

	let unitToDelete = $state<string | null>(null);
	let isConfirmOpen = $state(false);
	let isDeleting = $state(false);

	// Group units by tenant for easier viewing
	const groupedUnits = $derived.by(() => {
		const groups: Record<string, { name: string; units: any[] }> = {};
		data.units.forEach((unit: any) => {
			const tenantId = unit.tenantId;
			if (!groups[tenantId]) {
				groups[tenantId] = {
					name: unit.tenant?.name || 'Sekolah Satuan',
					units: []
				};
			}
			groups[tenantId].units.push(unit);
		});
		return Object.entries(groups).map(([id, group]) => ({ id, ...group }));
	});

	function confirmDelete(id: string) {
		unitToDelete = id;
		isConfirmOpen = true;
	}

	function formatDate(date: Date) {
		return new Intl.DateTimeFormat('id-ID', {
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		}).format(new Date(date));
	}
</script>

<div class="space-y-6 p-8 pt-6">
	<!-- Hidden Form for Deletion -->
	<form
		id="delete-unit-form"
		method="POST"
		action="?/deleteUnit"
		use:enhance={() => {
			isDeleting = true;
			return async ({ result }) => {
				isDeleting = false;
				if (result.type === 'success') {
					toast.success('Unit berhasil dihapus');
					unitToDelete = null;
					isConfirmOpen = false;
					await invalidateAll();
				} else if (result.type === 'failure') {
					toast.error(result.data?.error || 'Gagal menghapus unit');
				}
			};
		}}
		class="hidden"
	>
		<input type="hidden" name="id" value={unitToDelete} />
	</form>

	<!-- Header -->
	<div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
		<div class="space-y-1">
			<h2 class="text-3xl font-bold tracking-tight text-foreground">Manajemen Unit Sekolah</h2>
			<p class="text-muted-foreground text-sm">
				Kelola unit sekolah (TK, SD, SMP, SMA, dsb) di bawah yayasan Anda.
			</p>
		</div>
		<AddUnitDialog tenants={data.tenants} user={data.user} />
	</div>

	<!-- Stats -->
	<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="text-sm font-medium">Total Unit</Card.Title>
				<School class="h-4 w-4 text-muted-foreground" />
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold">{data.units.length}</div>
				<p class="text-xs text-muted-foreground">Unit terdaftar di seluruh sistem</p>
			</Card.Content>
		</Card.Root>
	</div>

	<!-- Units Table with Grouping -->
	<Card.Root>
		<Card.Header>
			<Card.Title>Daftar Unit Terpusat</Card.Title>
			<Card.Description
				>Unit dikelompokkan berdasarkan Yayasan/Induk untuk memudahkan navigasi.</Card.Description
			>
		</Card.Header>
		<Card.Content class="p-0 overflow-hidden">
			<Table>
				<TableHeader>
					<TableRow class="bg-muted/50 hover:bg-muted/50">
						<TableHead class="pl-6 py-3">Nama Unit</TableHead>
						<TableHead class="py-3">Jenjang</TableHead>
						<TableHead class="py-3">NPSN</TableHead>
						<TableHead class="py-3">Tanggal Dibuat</TableHead>
						<TableHead class="text-right pr-6 py-3">Aksi</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{#if groupedUnits.length === 0}
						<TableRow>
							<TableCell colspan={5} class="h-24 text-center text-muted-foreground">
								Belum ada unit sekolah. Klik "Tambah Unit" untuk memulai.
							</TableCell>
						</TableRow>
					{:else}
						{#each groupedUnits as group (group.id)}
							<!-- Foundation Group Header -->
							<TableRow class="bg-primary/5 hover:bg-primary/10 border-y transition-colors">
								<TableCell colspan={5} class="py-2.5 pl-6">
									<div class="flex items-center gap-2">
										<Building2 class="h-4 w-4 text-primary" />
										<span class="font-bold text-primary uppercase tracking-wider text-[11px]">
											{group.name}
										</span>
										<div class="h-1 w-1 rounded-full bg-primary/30"></div>
										<span class="text-[10px] text-primary/70 font-medium">
											{group.units.length} Unit
										</span>
									</div>
								</TableCell>
							</TableRow>

							<!-- Units in this Foundation -->
							{#each group.units as unit (unit.id)}
								<TableRow class="group">
									<TableCell class="font-medium pl-10 py-4">
										<div class="flex items-center gap-3">
											<div
												class="rounded-lg bg-muted p-2 group-hover:bg-primary/10 group-hover:text-primary transition-colors"
											>
												<LayoutGrid class="h-4 w-4" />
											</div>
											<div class="flex flex-col gap-0.5">
												<span class="text-sm">{unit.name}</span>
												{#if unit.address}
													<span
														class="text-[10px] text-muted-foreground line-clamp-1 max-w-[250px]"
													>
														{unit.address}
													</span>
												{/if}
											</div>
										</div>
									</TableCell>
									<TableCell>
										<Badge variant="secondary" class="text-[10px] px-2 py-0 h-5 font-bold">
											{unit.level}
										</Badge>
									</TableCell>
									<TableCell class="text-xs font-mono text-muted-foreground">
										{unit.npsn || '-'}
									</TableCell>
									<TableCell>
										<div class="flex items-center gap-1.5 text-muted-foreground text-[11px]">
											<Calendar class="h-3.5 w-3.5" />
											{formatDate(unit.createdAt)}
										</div>
									</TableCell>
									<TableCell class="text-right pr-6">
										<Button
											variant="ghost"
											size="icon"
											class="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 w-8"
											onclick={() => confirmDelete(unit.id)}
											disabled={isDeleting && unitToDelete === unit.id}
										>
											{#if isDeleting && unitToDelete === unit.id}
												<Loader2 class="h-4 w-4 animate-spin" />
											{:else}
												<Trash2 class="h-4 w-4" />
											{/if}
											<span class="sr-only">Hapus</span>
										</Button>
									</TableCell>
								</TableRow>
							{/each}
						{/each}
					{/if}
				</TableBody>
			</Table>
		</Card.Content>
	</Card.Root>
</div>

<ConfirmDialog
	bind:open={isConfirmOpen}
	title="Hapus Unit Sekolah?"
	description="Tindakan ini tidak dapat dibatalkan. Unit hanya dapat dihapus jika belum memiliki jalur pendaftaran atau pendaftar."
	confirmText={isDeleting ? 'Menghapus...' : 'Ya, Hapus Unit'}
	variant="destructive"
	onConfirm={() => {
		const form = document.getElementById('delete-unit-form') as HTMLFormElement;
		form?.requestSubmit();
	}}
/>
