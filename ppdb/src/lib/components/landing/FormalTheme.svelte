<script lang="ts">
	import { fade } from 'svelte/transition';

	export let school: any;
	export let tenant: any;

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
			<a href="/faq" class="hover:underline">Bantuan</a>
			<a href="/contact" class="hover:underline">Kontak Kami</a>
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
				class="px-4 py-2 text-[#002C5F] font-semibold hover:bg-gray-50 rounded transition-colors"
				>Masuk</a
			>
			<a
				href="/{tenant?.slug}/register"
				class="bg-[#002C5F] text-white px-6 py-2 rounded font-semibold hover:bg-[#001A3A] transition-colors shadow-md"
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
						<ul class="text-gray-700 space-y-3">
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
							<p class="text-gray-600 leading-relaxed">{step.desc}</p>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<!-- Info Section -->
	<section class="py-20 px-4 md:px-8">
		<div class="max-w-7xl mx-auto grid md:grid-cols-3 gap-12 text-center">
			<div>
				<div
					class="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl"
				>
					✓
				</div>
				<h4 class="font-bold text-lg mb-2 text-[#002C5F]">Transparansi Data</h4>
				<p class="text-gray-500">
					Hasil seleksi dapat dipantau secara langsung dan terbuka oleh publik.
				</p>
			</div>
			<div>
				<div
					class="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl"
				>
					🔒
				</div>
				<h4 class="font-bold text-lg mb-2 text-[#002C5F]">Keamanan Data</h4>
				<p class="text-gray-500">Data pendaftar tersimpan dengan enkripsi standar industri.</p>
			</div>
			<div>
				<div
					class="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl"
				>
					📱
				</div>
				<h4 class="font-bold text-lg mb-2 text-[#002C5F]">Akses Mudah</h4>
				<p class="text-gray-500">
					Pendaftaran dapat dilakukan dari mana saja melalui perangkat seluler.
				</p>
			</div>
		</div>
	</section>

	<!-- Footer -->
	<footer class="bg-[#001A3A] text-white py-12 px-4 md:px-8">
		<div class="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
			<div>
				<div class="flex items-center gap-3 mb-4">
					{#if school.logoUrl}
						<img src={school.logoUrl} alt="Logo" class="h-10 w-10 brightness-0 invert" />
					{/if}
					<span class="font-bold text-xl uppercase tracking-tighter">{school.name}</span>
				</div>
				<p class="text-blue-300 opacity-60 text-sm italic">
					© 2026 Portal PPDB Terintegrasi. Dikembangkan secara profesional.
				</p>
			</div>
			<div class="flex gap-8 text-sm">
				<a href="#" class="text-blue-200 hover:text-white transition-colors">Kebijakan Privasi</a>
				<a href="#" class="text-blue-200 hover:text-white transition-colors">Syarat & Ketentuan</a>
				<a href="#" class="text-blue-200 hover:text-white transition-colors">Panduan User</a>
			</div>
		</div>
	</footer>
</div>
