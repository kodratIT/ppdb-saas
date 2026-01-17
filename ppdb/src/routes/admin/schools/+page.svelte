<script lang="ts">
	/* eslint-disable svelte/require-each-key */
	/* eslint-disable svelte/no-navigation-without-resolve */
	import type { PageData } from './$types';
	import { enhance } from '$app/forms';
	import Button from '$lib/components/ui/button.svelte';
	import { Table, TableBody, TableCell, TableHead, TableRow } from '$lib/components/ui/table';
	import { Badge } from '$lib/components/ui/badge';
	import { School, Globe, Activity, Shield, ExternalLink, Power } from 'lucide-svelte';

	let { data } = $props<{ data: PageData }>();
</script>

<div class="space-y-8 p-6">
	<div class="flex justify-between items-center">
		<div>
			<h1 class="text-3xl font-black text-[#002C5F] uppercase tracking-tight">
				Management Sekolah
			</h1>
			<p class="text-gray-500 font-medium">Kendalikan akses dan pantau performa seluruh tenant.</p>
		</div>
		<Button href="/admin/register" class="bg-[#002C5F] hover:bg-blue-800">
			Daftarkan Sekolah Baru
		</Button>
	</div>

	<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
		<div class="bg-white p-6 rounded-xl border shadow-sm">
			<div class="flex items-center gap-4 mb-2">
				<div class="p-2 bg-blue-50 text-blue-600 rounded-lg"><School class="w-5 h-5" /></div>
				<span class="text-sm font-bold text-gray-400 uppercase tracking-widest">Total Sekolah</span>
			</div>
			<p class="text-4xl font-black text-[#002C5F]">{data.tenants.length}</p>
		</div>
		<div class="bg-white p-6 rounded-xl border shadow-sm">
			<div class="flex items-center gap-4 mb-2">
				<div class="p-2 bg-green-50 text-green-600 rounded-lg"><Activity class="w-5 h-5" /></div>
				<span class="text-sm font-bold text-gray-400 uppercase tracking-widest">Sekolah Aktif</span>
			</div>
			<p class="text-4xl font-black text-green-600">
				{data.tenants.filter((t: any) => t.status === 'active').length}
			</p>
		</div>
		<div class="bg-white p-6 rounded-xl border shadow-sm">
			<div class="flex items-center gap-4 mb-2">
				<div class="p-2 bg-purple-50 text-purple-600 rounded-lg"><Shield class="w-5 h-5" /></div>
				<span class="text-sm font-bold text-gray-400 uppercase tracking-widest"
					>Security Status</span
				>
			</div>
			<p class="text-xl font-black text-purple-600 uppercase italic">Enterprise Safe</p>
		</div>
	</div>

	<div class="bg-white rounded-xl border shadow-md overflow-hidden">
		<Table>
			<thead class="bg-gray-50">
				<TableRow>
					<TableHead class="font-black uppercase text-[10px] tracking-widest"
						>Identitas Sekolah</TableHead
					>
					<TableHead class="font-black uppercase text-[10px] tracking-widest">Akses URL</TableHead>
					<TableHead class="font-black uppercase text-[10px] tracking-widest text-center"
						>Pendaftar</TableHead
					>
					<TableHead class="font-black uppercase text-[10px] tracking-widest text-center"
						>Keuangan</TableHead
					>
					<TableHead class="font-black uppercase text-[10px] tracking-widest">Status</TableHead>
					<TableHead class="font-black uppercase text-[10px] tracking-widest text-right"
						>Aksi Cepat</TableHead
					>
				</TableRow>
			</thead>
			<TableBody>
				{#each data.tenants as tenant}
					<TableRow class="hover:bg-gray-50/50 transition-colors">
						<TableCell>
							<div class="flex items-center gap-3">
								<div
									class="w-10 h-10 bg-[#002C5F] text-white rounded flex items-center justify-center font-black"
								>
									{tenant.name.charAt(0)}
								</div>
								<div>
									<p class="font-black text-[#002C5F] uppercase text-sm">{tenant.name}</p>
									<p class="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
										ID: {tenant.id.slice(0, 8)}
									</p>
								</div>
							</div>
						</TableCell>
						<TableCell>
							<div class="flex items-center gap-2 text-blue-600 font-bold text-xs">
								<Globe class="w-3 h-3" />
								{tenant.slug}.ppdb.id
							</div>
						</TableCell>
						<TableCell class="text-center font-black text-gray-600">
							{tenant.stats?.applications || 0}
						</TableCell>
						<TableCell class="text-center">
							<Badge
								variant="outline"
								class="border-green-200 text-green-700 bg-green-50 font-bold"
							>
								{tenant.stats?.paidInvoices || 0} PAID
							</Badge>
						</TableCell>
						<TableCell>
							<Badge
								variant={tenant.status === 'active' ? 'default' : 'destructive'}
								class="font-black uppercase text-[9px] tracking-widest"
							>
								{tenant.status}
							</Badge>
						</TableCell>
						<TableCell class="text-right">
							<div class="flex justify-end gap-2">
								<form method="POST" action="?/toggleStatus" use:enhance>
									<input type="hidden" name="tenantId" value={tenant.id} />
									<input type="hidden" name="currentStatus" value={tenant.status} />
									<Button
										variant="outline"
										size="sm"
										class="h-8 w-8 p-0 {tenant.status === 'active'
											? 'text-red-500 border-red-100 hover:bg-red-50'
											: 'text-green-500 border-green-100 hover:bg-green-50'}"
										title={tenant.status === 'active' ? 'Deactivate School' : 'Activate School'}
									>
										<Power class="w-4 h-4" />
									</Button>
								</form>
								<Button
									variant="outline"
									size="sm"
									href={`/${tenant.slug}/admin`}
									target="_blank"
									class="h-8 flex gap-2 font-bold text-[10px] uppercase border-[#002C5F] text-[#002C5F] hover:bg-blue-50"
								>
									<ExternalLink class="w-3 h-3" /> Admin View
								</Button>
							</div>
						</TableCell>
					</TableRow>
				{:else}
					<TableRow>
						<TableCell colspan={6} class="text-center py-20">
							<School class="w-12 h-12 text-gray-200 mx-auto mb-4" />
							<p class="text-gray-400 font-bold uppercase tracking-widest text-sm">
								Belum ada sekolah terdaftar.
							</p>
						</TableCell>
					</TableRow>
				{/each}
			</TableBody>
		</Table>
	</div>
</div>
