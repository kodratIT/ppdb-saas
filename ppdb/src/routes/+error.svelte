<script lang="ts">
	import { page } from '$app/stores';
	import Button from '$lib/components/ui/button.svelte';
	import { ShieldAlert, ArrowLeft, Home, Lock } from 'lucide-svelte';

	const status = $derived($page.status);
	const message = $derived($page.error?.message || 'Something went wrong');

	const errorDetails: Record<number, { title: string; desc: string; icon: any }> = {
		403: {
			title: 'Akses Terbatas',
			desc: 'Maaf, Anda tidak memiliki izin untuk mengakses area ini. Halaman ini dikhususkan untuk Administrator Sistem tingkat tinggi.',
			icon: Lock
		},
		404: {
			title: 'Halaman Tidak Ditemukan',
			desc: 'Maaf, alamat yang Anda tuju tidak tersedia atau telah dipindahkan ke lokasi lain.',
			icon: ShieldAlert
		},
		500: {
			title: 'Gangguan Sistem',
			desc: 'Terjadi kesalahan internal pada server kami. Tim teknis telah diberitahu mengenai masalah ini.',
			icon: ShieldAlert
		}
	};

	const currentError = $derived(
		errorDetails[status] || {
			title: 'Terjadi Kesalahan',
			desc: message,
			icon: ShieldAlert
		}
	);
</script>

<svelte:head>
	<title>{status} - {currentError.title}</title>
</svelte:head>

<div class="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 font-sans">
	<!-- Background Pattern -->
	<div
		class="absolute inset-0 opacity-[0.03] pointer-events-none"
		style="background-image: url('https://www.transparenttextures.com/patterns/grid-me.png');"
	></div>

	<div class="max-w-md w-full text-center relative z-10">
		<!-- Icon Circle -->
		<div
			class="w-24 h-24 bg-white border-4 border-[#002C5F] shadow-[8px_8px_0px_0px_rgba(0,44,95,0.1)] rounded-3xl flex items-center justify-center mx-auto mb-10 transform -rotate-3 hover:rotate-0 transition-transform duration-500"
		>
			<svelte:component this={currentError.icon} class="w-12 h-12 text-[#002C5F]" />
		</div>

		<!-- Error Code -->
		<p class="text-[10px] font-black uppercase tracking-[0.5em] text-[#002C5F] mb-4 opacity-50">
			Error Code: {status}
		</p>

		<!-- Title -->
		<h1 class="text-4xl font-black text-[#001A3A] uppercase tracking-tighter mb-6 leading-none">
			{currentError.title}
		</h1>

		<!-- Description -->
		<p class="text-gray-500 font-medium leading-relaxed mb-12">
			{currentError.desc}
		</p>

		<!-- Actions -->
		<div class="flex flex-col gap-4">
			<Button
				href="/"
				class="bg-[#002C5F] hover:bg-[#001A3A] h-14 font-black uppercase tracking-widest flex gap-3 shadow-lg transition-all active:scale-95 text-white"
			>
				<Home class="w-5 h-5" />
				Kembali ke Beranda
			</Button>

			<button
				onclick={() => history.back()}
				class="flex items-center justify-center gap-2 text-[#002C5F] font-black uppercase text-xs tracking-widest hover:underline"
			>
				<ArrowLeft class="w-4 h-4" />
				Halaman Sebelumnya
			</button>
		</div>

		<!-- Footer Brand -->
		<div
			class="mt-20 pt-8 border-t border-gray-200 flex items-center justify-center gap-2 opacity-30 grayscale"
		>
			<div
				class="w-6 h-6 bg-[#002C5F] rounded flex items-center justify-center text-white font-black text-[10px]"
			>
				P
			</div>
			<span class="text-[10px] font-black uppercase tracking-widest italic"
				>PPDB-SAAS Enterprise</span
			>
		</div>
	</div>
</div>
