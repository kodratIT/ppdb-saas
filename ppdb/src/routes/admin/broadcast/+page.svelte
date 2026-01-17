<script lang="ts">
	import type { ActionData, PageData } from './$types';
	import { enhance } from '$app/forms';
	import Button from '$lib/components/ui/button.svelte';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Label } from '$lib/components/ui/label';
	import { MessageSquare, Users, Send, CheckCircle2, AlertCircle } from 'lucide-svelte';

	let { data, form } = $props<{ data: PageData; form: ActionData }>();

	let sending = $state(false);
</script>

<div class="max-w-4xl mx-auto space-y-8 p-6">
	<div>
		<h1 class="text-3xl font-black text-[#002C5F] uppercase tracking-tight">Broadcast Center</h1>
		<p class="text-gray-500 font-medium italic">
			Kirim pesan WhatsApp massal ke seluruh pengelola sekolah.
		</p>
	</div>

	{#if form?.success}
		<div
			class="bg-green-50 border-2 border-green-200 p-6 rounded-xl flex items-center gap-4 text-green-700"
		>
			<CheckCircle2 class="w-8 h-8" />
			<div>
				<p class="font-black uppercase text-sm">Pesan Berhasil Dikirim!</p>
				<p class="text-xs font-bold opacity-80">
					{form.sentCount} dari {form.totalAdmins} Admin telah menerima pesan.
				</p>
			</div>
		</div>
	{/if}

	{#if form?.error}
		<div
			class="bg-red-50 border-2 border-red-200 p-6 rounded-xl flex items-center gap-4 text-red-700"
		>
			<AlertCircle class="w-8 h-8" />
			<div>
				<p class="font-black uppercase text-sm">Gagal Mengirim Pesan</p>
				<p class="text-xs font-bold opacity-80">{form.error}</p>
			</div>
		</div>
	{/if}

	<div class="grid md:grid-cols-3 gap-8">
		<!-- Form Column -->
		<div class="md:col-span-2 space-y-6">
			<div class="bg-white p-8 rounded-2xl border shadow-sm space-y-6">
				<form
					method="POST"
					action="?/send"
					use:enhance={() => {
						sending = true;
						return async ({ update }) => {
							await update();
							sending = false;
						};
					}}
					class="space-y-6"
				>
					<div class="space-y-2">
						<Label class="font-black uppercase text-[10px] tracking-widest text-gray-400"
							>Target Penerima</Label
						>
						<select
							name="target"
							class="w-full p-3 bg-gray-50 border-2 border-gray-100 rounded-lg font-bold text-sm focus:border-[#002C5F] outline-none"
						>
							<option value="all">Semua Admin Sekolah ({data.tenants.length} Tenant)</option>
							<option value="active">Sekolah Aktif Saja</option>
							<option value="inactive">Sekolah Inaktif Saja</option>
						</select>
					</div>

					<div class="space-y-2">
						<Label class="font-black uppercase text-[10px] tracking-widest text-gray-400"
							>Isi Pesan WhatsApp</Label
						>
						<Textarea
							name="message"
							placeholder="Ketik pesan pengumuman di sini..."
							rows={8}
							required
							class="font-medium text-sm p-4 border-2 border-gray-100 focus:border-[#002C5F] resize-none"
						/>
						<p class="text-[10px] text-gray-400 italic font-medium">
							* Gunakan bahasa yang sopan dan profesional.
						</p>
					</div>

					<Button
						type="submit"
						disabled={sending}
						class="w-full bg-[#002C5F] hover:bg-blue-800 h-14 font-black uppercase tracking-widest flex gap-3 shadow-lg transition-all active:scale-95"
					>
						{#if sending}
							<div
								class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"
							></div>
							Mengirim...
						{:else}
							<Send class="w-5 h-5" />
							Kirim Blast Sekarang
						{/if}
					</Button>
				</form>
			</div>
		</div>

		<!-- Info Column -->
		<div class="space-y-6">
			<div class="bg-[#001A3A] text-white p-8 rounded-2xl shadow-xl">
				<div class="flex items-center gap-3 mb-6">
					<div class="p-2 bg-blue-500/20 rounded-lg text-blue-300">
						<MessageSquare class="w-5 h-5" />
					</div>
					<h3 class="font-black uppercase text-xs tracking-widest">Broadcast Rules</h3>
				</div>
				<ul class="space-y-4 text-xs font-medium text-blue-100/70">
					<li class="flex gap-3">
						<span class="text-blue-400 font-black">•</span>
						Pesan akan dikirim langsung ke nomor WhatsApp utama Admin Sekolah.
					</li>
					<li class="flex gap-3">
						<span class="text-blue-400 font-black">•</span>
						Hindari mengirim pesan terlalu sering untuk mencegah blokir akun.
					</li>
					<li class="flex gap-3">
						<span class="text-blue-400 font-black">•</span>
						Sistem otomatis melakukan format nomor internasional (62xxx).
					</li>
				</ul>
			</div>

			<div class="bg-gray-50 p-8 rounded-2xl border-2 border-dashed border-gray-200">
				<div class="flex items-center gap-3 mb-4">
					<Users class="w-5 h-5 text-gray-400" />
					<h3 class="font-black uppercase text-xs tracking-widest text-gray-400">
						Audience Status
					</h3>
				</div>
				<p class="text-2xl font-black text-[#002C5F]">{data.tenants.length}</p>
				<p class="text-[10px] font-bold text-gray-400 uppercase">Total Potential Reach</p>
			</div>
		</div>
	</div>
</div>
