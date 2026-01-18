<script lang="ts">
	import type { PageData } from './$types';
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import * as Table from '$lib/components/ui/table';
	import * as Card from '$lib/components/ui/card';
	import Button from '$lib/components/ui/button.svelte';
	import Badge from '$lib/components/ui/badge.svelte';
	import AddUnitDialog from './components/AddUnitDialog.svelte';
	import ConfirmDialog from '../schools/components/ConfirmDialog.svelte';
	import { School, Trash2, Calendar, LayoutGrid } from 'lucide-svelte';

	let { data } = $props<{ data: PageData }>();

	let unitToDelete = $state<string | null>(null);
	let isConfirmOpen = $state(false);
	let isDeleting = $state(false);

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
			<h2 class="text-3xl font-bold tracking-tight">Manajemen Unit Sekolah</h2>
			<p class="text-muted-foreground">
				Kelola unit sekolah (TK, SD, SMP, SMA, dsb) di bawah yayasan Anda.
			</p>
		</div>
		<AddUnitDialog />
	</div>

	<!-- Stats (Optional but good for dashboard look) -->
	<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="text-sm font-medium">Total Unit</Card.Title>
				<School class="h-4 w-4 text-muted-foreground" />
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold">{data.units.length}</div>
				<p class="text-xs text-muted-foreground">Unit terdaftar</p>
			</Card.Content>
		</Card.Root>
	</div>

	<!-- Units Table -->
	<Card.Root>
		<Card.Header>
			<Card.Title>Daftar Unit</Card.Title>
			<Card.Description>Seluruh unit sekolah yang aktif dalam sistem pendaftaran.</Card.Description>
		</Card.Header>
		<Card.Content>
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>Nama Unit</Table.Head>
						{#if data.user.role === 'super_admin'}
							<Table.Head>Yayasan</Table.Head>
						{/if}
						<Table.Head>Jenjang</Table.Head>
						<Table.Head>Tanggal Dibuat</Table.Head>
						<Table.Head class="text-right">Aksi</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#if data.units.length === 0}
						<Table.Row>
							<Table.Cell
								colspan={data.user.role === 'super_admin' ? 5 : 4}
								class="h-24 text-center"
							>
								Belum ada unit sekolah. Klik "Tambah Unit" untuk memulai.
							</Table.Cell>
						</Table.Row>
					{:else}
						{#each data.units as unit}
							<Table.Row>
								<Table.Cell class="font-medium">
									<div class="flex items-center gap-2">
										<div class="rounded-md bg-muted p-2">
											<LayoutGrid class="h-4 w-4" />
										</div>
										{unit.name}
									</div>
								</Table.Cell>
								{#if data.user.role === 'super_admin'}
									<Table.Cell>
										<Badge variant="outline">{unit.tenant?.name || 'Central'}</Badge>
									</Table.Cell>
								{/if}
								<Table.Cell>
									<Badge variant="secondary">{unit.level}</Badge>
								</Table.Cell>
								<Table.Cell>
									<div class="flex items-center gap-1 text-muted-foreground text-sm">
										<Calendar class="h-3 w-3" />
										{formatDate(unit.createdAt)}
									</div>
								</Table.Cell>
								<Table.Cell class="text-right">
									<Button
										variant="ghost"
										size="icon"
										class="text-destructive hover:text-destructive hover:bg-destructive/10"
										onclick={() => confirmDelete(unit.id)}
									>
										<Trash2 class="h-4 w-4" />
										<span class="sr-only">Hapus</span>
									</Button>
								</Table.Cell>
							</Table.Row>
						{/each}
					{/if}
				</Table.Body>
			</Table.Root>
		</Card.Content>
	</Card.Root>
</div>

<ConfirmDialog
	bind:open={isConfirmOpen}
	title="Hapus Unit Sekolah?"
	description="Tindakan ini tidak dapat dibatalkan. Unit hanya dapat dihapus jika belum memiliki jalur pendaftaran atau pendaftar."
	confirmText={isDeleting ? 'Menghapus...' : 'Hapus'}
	variant="destructive"
	onConfirm={() => {
		const form = document.getElementById('delete-unit-form') as HTMLFormElement;
		form?.requestSubmit();
	}}
/>
