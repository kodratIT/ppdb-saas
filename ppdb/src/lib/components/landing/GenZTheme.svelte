<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import DoodleLayer from './DoodleLayer.svelte';

	let { school, tenant, branding } = $props();

	const bentoItems = [
		{
			title: '⚡ SAT-SET',
			desc: 'Daftar cuma 5 menit, gak pake lama!',
			color: 'bg-[#CCFF00]',
			size: 'col-span-2 md:col-span-1'
		},
		{
			title: '📂 NO MORE MAP COKLAT',
			desc: 'Upload dokumen tinggal sat-set dari HP.',
			color: 'bg-white',
			size: 'col-span-2'
		},
		{
			title: '💰 TRANSPARAN',
			desc: 'Cek ranking & biaya real-time, no cap!',
			color: 'bg-[#FF00FF]',
			size: 'col-span-2 md:col-span-1'
		},
		{
			title: '🤖 AI VERIFIKASI',
			desc: 'Data dicek otomatis, anti antre.',
			color: 'bg-[#0000FF] text-white',
			size: 'col-span-2'
		}
	];
</script>

<div
	class="min-h-screen bg-[#F0F0F0] font-sans selection:bg-black selection:text-white p-4 md:p-8 relative overflow-x-hidden"
>
	<DoodleLayer />
	<!-- Navbar -->
	<nav
		class="max-w-7xl mx-auto flex justify-between items-center p-4 bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-12 relative z-10"
	>
		<div class="flex items-center gap-2">
			<div
				class="w-10 h-10 bg-black rotate-3 flex items-center justify-center text-white font-black text-xl"
			>
				{school.name.charAt(0)}
			</div>
			<span class="font-black text-xl uppercase tracking-tighter">{school.name}</span>
		</div>
		<div class="flex gap-4">
			<a href="/sign-in" class="font-bold hover:underline hidden md:block self-center">Login</a>
			<a
				href="/{tenant?.slug}/register"
				class="bg-[#0000FF] text-white px-6 py-2 border-2 border-black font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
			>
				DAFTAR
			</a>
		</div>
	</nav>

	<!-- Hero Section -->
	<header class="max-w-7xl mx-auto text-center mb-20 relative z-10" in:fade={{ delay: 200 }}>
		<h1 class="text-6xl md:text-9xl font-black uppercase tracking-tighter leading-none mb-6">
			PPDB <span class="bg-[#CCFF00] px-4 rotate-[-2deg] inline-block">ANTI RIBET</span><br />
			<span class="text-stroke-3">SAT-SET TERUS!</span>
		</h1>
		<p class="text-xl md:text-2xl font-bold max-w-2xl mx-auto mb-10">
			{school.description}
		</p>
		<div class="flex flex-wrap justify-center gap-6">
			<a
				href="/{tenant?.slug}/register"
				class="bg-[#CCFF00] text-black px-12 py-6 text-2xl border-4 border-black font-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none transition-all uppercase"
			>
				Gas Daftar Sekarang!
			</a>
		</div>
	</header>

	<!-- Bento Grid -->
	<section class="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-3 gap-6 mb-20 relative z-10">
		{#each bentoItems as item, i}
			<div
				class="{item.color} {item.size} border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-transform"
				in:fly={{ y: 50, delay: 400 + i * 100 }}
			>
				<h3 class="text-3xl font-black mb-4 uppercase">{item.title}</h3>
				<p class="text-lg font-bold leading-tight">{item.desc}</p>
			</div>
		{/each}
	</section>

	<!-- Footer -->
	<footer
		class="max-w-7xl mx-auto border-t-4 border-black pt-12 pb-20 flex flex-col md:flex-row justify-between items-start gap-8 relative z-10"
	>
		<div>
			<h4 class="text-4xl font-black uppercase mb-4 italic">No Cap. No Bureaucracy.</h4>
			<p class="font-bold opacity-70 mb-2">© 2026 {school.name}. All rights reserved.</p>
			<div
				class="flex items-center gap-2 pt-4 border-t border-black/10 mt-4 opacity-50 grayscale hover:opacity-100 transition-all"
			>
				<span class="text-[10px] font-black uppercase tracking-widest">Powered by</span>
				<div class="bg-black text-white px-2 py-0.5 text-[10px] font-black italic">
					{branding?.brandName || 'PPDB-SAAS'}
				</div>
			</div>
		</div>
		<div class="flex gap-10">
			<div>
				<p class="font-black uppercase mb-2 text-xs">Socials</p>
				<ul class="font-bold text-sm">
					<li><a href="#" class="hover:underline">Instagram</a></li>
					<li><a href="#" class="hover:underline">TikTok</a></li>
				</ul>
			</div>
			<div>
				<p class="font-black uppercase mb-2 text-xs">Help</p>
				<ul class="font-bold text-sm">
					<li><a href="#" class="hover:underline">WhatsApp CS</a></li>
					<li><a href="#" class="hover:underline">FAQ</a></li>
				</ul>
			</div>
		</div>
	</footer>
</div>

<style>
	.text-stroke-3 {
		-webkit-text-stroke: 2px black;
		color: transparent;
	}
</style>
