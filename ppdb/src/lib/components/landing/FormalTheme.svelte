<script lang="ts">
	import { fade } from 'svelte/transition';

	let { school, tenant, branding } = $props();

	const steps = [
		{ title: 'Registrasi Akun', desc: 'Daftar menggunakan nomor WhatsApp aktif.' },
		{ title: 'Lengkapi Data', desc: 'Isi formulir dan unggah dokumen persyaratan.' },
		{ title: 'Verifikasi', desc: 'Tim panitia akan memverifikasi data Anda.' },
		{ title: 'Pengumuman', desc: 'Pantau hasil seleksi secara real-time.' }
	];
</script>

<div class="min-h-screen bg-white font-sans text-[#333]">
	<!-- Top Bar -->
	<div class="bg-[#002C5F] text-white py-2 px-4 md:px-8 text-sm flex justify-between items-center">
		<span>Penerimaan Peserta Didik Baru (PPDB) Online</span>
		<div class="hidden md:flex gap-4">
			<a href="/faq" class="hover:underline text-xs">Bantuan</a>
			<a href="/contact" class="hover:underline text-xs">Kontak Kami</a>
		</div>
	</div>

	<!-- Header/Navbar -->
	<nav
		class="bg-white border-b py-4 px-4 md:px-8 flex justify-between items-center sticky top-0 z-50 shadow-sm"
	>
		<div class="flex items-center gap-4">
			{#if school.logoUrl}
				<img src={school.logoUrl} alt="Logo" class="h-12 w-12 object-contain" />
			{/if}
			<div>
				<h1 class="font-bold text-xl text-[#002C5F] uppercase leading-tight">{school.name}</h1>
				<p class="text-xs text-gray-500 uppercase tracking-widest">Portal Pendaftaran Resmi</p>
			</div>
		</div>
		<div class="flex gap-4">
			<a
				href="/sign-in"
				class="px-4 py-2 text-[#002C5F] font-semibold hover:bg-gray-50 rounded transition-colors text-sm self-center"
				>Masuk</a
			>
			<a
				href="/{tenant?.slug}/register"
				class="bg-[#002C5F] text-white px-6 py-2 rounded font-semibold hover:bg-[#001A3A] transition-colors shadow-md text-sm"
			>
				Daftar Sekarang
			</a>
		</div>
	</nav>

	<!-- Hero Section -->
	<header class="bg-gradient-to-r from-[#002C5F] to-[#004A8F] text-white py-20 px-4 md:px-8">
		<div class="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
			<div in:fade={{ duration: 800 }}>
				<h2 class="text-4xl md:text-5xl font-bold leading-tight mb-6">
					Selamat Datang di Portal <br /> Layanan PPDB Online
				</h2>
				<p class="text-lg text-blue-100 mb-8 leading-relaxed">
					{school.description ||
						'Sistem informasi pendaftaran siswa baru yang transparan, akuntabel, dan terintegrasi.'}
				</p>
				<div class="flex flex-wrap gap-4">
					<a
						href="/{tenant?.slug}/register"
						class="bg-white text-[#002C5F] px-8 py-3 rounded-md font-bold text-lg hover:bg-blue-50 transition-all shadow-lg"
					>
						Mulai Pendaftaran
					</a>
					<a
						href="#alur"
						class="border border-white/30 hover:bg-white/10 px-8 py-3 rounded-md font-bold text-lg transition-all"
					>
						Lihat Alur
					</a>
				</div>
			</div>
			<div class="hidden md:block">
				<div class="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20">
					<div class="bg-white rounded-lg p-6 shadow-2xl">
						<h3 class="text-[#002C5F] font-bold text-xl mb-4 border-b pb-2">Informasi Penting</h3>
						<ul class="text-gray-700 space-y-3 text-sm">
							<li class="flex items-start gap-2">
								<span class="text-blue-600 font-bold">•</span>
								Pastikan data yang diinput sesuai KK & Ijazah.
							</li>
							<li class="flex items-start gap-2">
								<span class="text-blue-600 font-bold">•</span>
								Siapkan scan dokumen persyaratan (PDF/JPG).
							</li>
							<li class="flex items-start gap-2">
								<span class="text-blue-600 font-bold">•</span>
								Pantau status verifikasi secara berkala.
							</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	</header>

	<!-- Steps Section -->
	<section id="alur" class="py-20 px-4 md:px-8 bg-gray-50">
		<div class="max-w-7xl mx-auto">
			<div class="text-center mb-16">
				<h3 class="text-3xl font-bold text-[#002C5F] mb-4">Alur Pendaftaran Online</h3>
				<div class="w-20 h-1 bg-[#002C5F] mx-auto"></div>
			</div>
			<div class="grid md:grid-cols-4 gap-8">
				{#each steps as step, i}
					<div
						class="bg-white p-8 rounded-xl border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow"
					>
						<div
							class="text-6xl font-black text-gray-50 absolute -right-2 -top-2 transition-colors group-hover:text-blue-50"
						>
							{i + 1}
						</div>
						<div class="relative z-10">
							<h4 class="font-bold text-xl text-[#002C5F] mb-3">{step.title}</h4>
							<p class="text-gray-600 text-sm leading-relaxed">{step.desc}</p>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<!-- Footer -->
	<footer class="bg-[#001A3A] text-white py-12 px-4 md:px-8">
		<div class="max-w-7xl mx-auto">
			<div
				class="flex flex-col md:flex-row justify-between items-start gap-12 pb-12 border-b border-white/10 mb-8"
			>
				<div>
					<div class="flex items-center gap-3 mb-4">
						{#if school.logoUrl}
							<img src={school.logoUrl} alt="Logo" class="h-10 w-10 brightness-0 invert" />
						{/if}
						<span class="font-bold text-xl uppercase tracking-tighter">{school.name}</span>
					</div>
					<p class="text-blue-300 opacity-60 text-sm italic max-w-md">
						Portal pendaftaran resmi sekolah yang dikelola secara profesional untuk menjamin
						transparansi data.
					</p>
				</div>
				<div class="flex gap-12 text-sm">
					<div>
						<h5 class="font-bold mb-4 uppercase tracking-widest text-xs text-blue-400">Navigasi</h5>
						<ul class="space-y-2 opacity-80">
							<li><a href="#" class="hover:text-white transition-colors">Beranda</a></li>
							<li><a href="#" class="hover:text-white transition-colors">Alur</a></li>
							<li><a href="#" class="hover:text-white transition-colors">Bantuan</a></li>
						</ul>
					</div>
					<div>
						<h5 class="font-bold mb-4 uppercase tracking-widest text-xs text-blue-400">Legal</h5>
						<ul class="space-y-2 opacity-80">
							<li><a href="#" class="hover:text-white transition-colors">Privasi</a></li>
							<li><a href="#" class="hover:text-white transition-colors">Syarat</a></li>
						</ul>
					</div>
				</div>
			</div>
			<div class="flex flex-col md:flex-row justify-between items-center gap-6">
				<p class="text-blue-300 opacity-60 text-xs italic">
					© 2026 {school.name}. Seluruh hak cipta dilindungi.
				</p>
				<div
					class="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-full border border-white/10 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all group"
				>
					<span class="text-[10px] font-bold uppercase tracking-widest text-blue-200"
						>System by</span
					>
					<span class="font-black text-xs uppercase tracking-tighter italic text-white"
						>{branding?.brandName || 'PPDB-SAAS'}</span
					>
					{#if branding?.logoUrl}
						<img src={branding.logoUrl} alt="System Logo" class="h-4 w-4 object-contain" />
					{/if}
				</div>
			</div>
		</div>
	</footer>
</div>
