<script lang="ts">
	/* eslint-disable svelte/require-each-key */
	/* eslint-disable svelte/no-navigation-without-resolve */
	import { goto } from '$app/navigation';
	import Badge from '$lib/components/ui/badge.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import * as Card from '$lib/components/ui/card';
	import { ShieldCheck, Clock, Phone, Mail, MapPin, ArrowRight, CheckCircle2 } from 'lucide-svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// @ts-ignore
	const school = $derived(
		data.school || {
			name: 'Sekolah Kami',
			description: 'Portal Resmi Pendaftaran Siswa Baru.',
			logoUrl: null,
			bannerUrl: null,
			address: null,
			contactPhone: null,
			contactEmail: null
		}
	);

	// @ts-ignore
	const admissionPaths = $derived((data.admissionPaths as any[]) || []);

	function startRegistration() {
		goto(`/${data.tenantSlug}/register/start`);
	}
</script>

<svelte:head>
	<title>Pendaftaran Peserta Didik Baru - {school.name}</title>
	<meta name="description" content="Portal Resmi Pendaftaran Siswa Baru di {school.name}" />
</svelte:head>

<div class="min-h-screen bg-gray-50 flex flex-col font-sans">
	<!-- Official Header -->
	<header class="bg-white border-b sticky top-0 z-50 shadow-sm">
		<div class="container mx-auto px-4 h-16 flex items-center justify-between">
			<div class="flex items-center gap-3">
				{#if school.logoUrl}
					<img src={school.logoUrl} alt="Logo" class="w-10 h-10 object-contain" />
				{/if}
				<div class="leading-tight">
					<h1 class="text-sm font-bold text-[#002C5F] uppercase tracking-wide">
						{school.name}
					</h1>
					<p class="text-[10px] text-gray-500 font-medium tracking-widest">OFFICIAL PPDB PORTAL</p>
				</div>
			</div>
			<div class="flex items-center gap-4 text-sm">
				<a href="#paths" class="text-gray-600 hover:text-[#002C5F] hidden sm:block font-medium"
					>Jalur</a
				>
				<a href="#help" class="text-gray-600 hover:text-[#002C5F] hidden sm:block font-medium"
					>Bantuan</a
				>
				<Button onclick={startRegistration} size="sm" class="bg-[#002C5F] hover:bg-[#003C7F]">
					Masuk / Daftar
				</Button>
			</div>
		</div>
	</header>

	<main class="flex-grow">
		<!-- Hero Section -->
		<section class="relative bg-[#002C5F] text-white overflow-hidden">
			<!-- Background Pattern -->
			<div
				class="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]"
			></div>

			<div
				class="container mx-auto px-4 py-20 relative z-10 grid md:grid-cols-2 gap-12 items-center"
			>
				<div class="space-y-6">
					<Badge variant="outline" class="text-white border-white/30 bg-white/10 px-4 py-1">
						<span class="mr-2">🎉</span> Pendaftaran Tahun Ajaran 2026/2027 Dibuka
					</Badge>
					<h2 class="text-4xl md:text-5xl font-extrabold leading-tight tracking-tight">
						Bergabunglah Menjadi Bagian dari <span class="text-blue-300">{school.name}</span>
					</h2>
					<p class="text-lg text-blue-100 max-w-xl leading-relaxed">
						{school.description ||
							'Wujudkan masa depan gemilang bersama kami. Sistem pendaftaran online yang transparan, mudah, dan terpercaya.'}
					</p>
					<div class="flex flex-wrap gap-4 pt-4">
						<Button
							onclick={startRegistration}
							size="lg"
							class="bg-white text-[#002C5F] hover:bg-blue-50 font-semibold px-8 h-12"
						>
							Daftar Sekarang <ArrowRight class="ml-2 w-4 h-4" />
						</Button>
						<a
							href="#paths"
							class="inline-flex items-center justify-center h-12 px-8 rounded-md border border-white/30 hover:bg-white/10 text-white font-medium transition-colors"
						>
							Lihat Jalur
						</a>
					</div>

					<div class="flex items-center gap-6 pt-6 text-sm text-blue-200">
						<div class="flex items-center gap-2">
							<ShieldCheck class="w-4 h-4" /> Resmi & Aman
						</div>
						<div class="flex items-center gap-2">
							<Clock class="w-4 h-4" /> Proses Cepat
						</div>
					</div>
				</div>

				<div class="relative hidden md:block">
					<div
						class="absolute inset-0 bg-blue-500 rounded-2xl rotate-3 opacity-20 transform scale-105"
					></div>
					{#if school.bannerUrl}
						<img
							src={school.bannerUrl}
							alt="School Activity"
							class="relative rounded-2xl shadow-2xl border-4 border-white/10 w-full object-cover aspect-video"
						/>
					{:else}
						<div
							class="relative rounded-2xl shadow-2xl border-4 border-white/10 w-full aspect-video bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center"
						>
							<span class="text-white/50 text-xl font-medium">Foto Sekolah</span>
						</div>
					{/if}
				</div>
			</div>
		</section>

		<!-- Info Steps Section -->
		<section class="py-16 bg-white border-b">
			<div class="container mx-auto px-4">
				<div class="text-center mb-12">
					<h3 class="text-2xl font-bold text-gray-900">Alur Pendaftaran</h3>
					<p class="text-gray-500 mt-2">4 Langkah mudah bergabung dengan kami</p>
				</div>

				<div class="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
					<!-- Connecting Line (Desktop) -->
					<div
						class="hidden md:block absolute top-12 left-[12%] right-[12%] h-0.5 bg-gray-100 -z-10"
					></div>

					{#each [{ title: 'Buat Akun', desc: 'Isi data diri singkat untuk akses dashboard', icon: '1' }, { title: 'Isi Formulir', desc: 'Lengkapi biodata siswa dan orang tua', icon: '2' }, { title: 'Upload Dokumen', desc: 'Unggah berkas persyaratan (KK, Akta, dll)', icon: '3' }, { title: 'Verifikasi', desc: 'Pantau status verifikasi dan pengumuman', icon: '4' }] as step}
						<div class="flex flex-col items-center text-center group">
							<div
								class="w-10 h-10 rounded-full bg-blue-50 text-[#002C5F] font-bold flex items-center justify-center mb-4 ring-4 ring-white shadow-sm group-hover:bg-[#002C5F] group-hover:text-white transition-colors"
							>
								{step.icon}
							</div>
							<h4 class="font-semibold text-gray-900 mb-2">{step.title}</h4>
							<p class="text-sm text-gray-500 px-4">{step.desc}</p>
						</div>
					{/each}
				</div>
			</div>
		</section>

		<!-- Admission Paths Section -->
		<section id="paths" class="py-20 bg-gray-50">
			<div class="container mx-auto px-4">
				<div class="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
					<div>
						<h3 class="text-3xl font-bold text-gray-900">Jalur Pendaftaran</h3>
						<p class="text-gray-600 mt-2">Pilih jalur yang sesuai dengan kualifikasi Anda</p>
					</div>
					{#if admissionPaths.length > 0}
						<div
							class="text-sm text-gray-500 bg-white px-4 py-2 rounded-full shadow-sm border font-medium"
						>
							Total Kuota: <span class="font-bold text-[#002C5F]"
								>{admissionPaths.reduce((acc: number, p: any) => acc + (p.quota || 0), 0)} Siswa</span
							>
						</div>
					{/if}
				</div>

				{#if admissionPaths.length === 0}
					<Card.Root class="p-12 text-center border-dashed">
						<Card.Content>
							<div
								class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4"
							>
								<Clock class="w-8 h-8 text-gray-400" />
							</div>
							<h4 class="text-lg font-medium text-gray-900">Belum Ada Jalur Dibuka</h4>
							<p class="text-gray-500 mt-2 max-w-md mx-auto">
								Mohon maaf, saat ini belum ada jalur pendaftaran yang aktif. Silakan cek kembali
								secara berkala atau hubungi panitia.
							</p>
						</Card.Content>
					</Card.Root>
				{:else}
					<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
						{#each admissionPaths as path}
							<div
								class="bg-white rounded-xl border hover:border-blue-500 hover:shadow-lg transition-all duration-300 group overflow-hidden flex flex-col"
							>
								<div class="p-6 flex-grow">
									<div class="flex justify-between items-start mb-4">
										<Badge variant="secondary" class="bg-blue-50 text-blue-700 hover:bg-blue-100">
											Jalur Reguler
										</Badge>
										{#if (path.quota || 0) > 0}
											<span
												class="text-xs font-medium text-green-600 flex items-center gap-1 bg-green-50 px-2 py-1 rounded-full"
											>
												<CheckCircle2 class="w-3 h-3" /> Buka
											</span>
										{:else}
											<span
												class="text-xs font-medium text-red-600 flex items-center gap-1 bg-red-50 px-2 py-1 rounded-full"
											>
												Penuh
											</span>
										{/if}
									</div>
									<h4
										class="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors"
									>
										{path.name}
									</h4>
									<p class="text-gray-600 text-sm leading-relaxed mb-6">
										{path.description ||
											'Jalur pendaftaran standar untuk calon peserta didik baru.'}
									</p>

									<div class="space-y-3">
										<div
											class="flex items-center justify-between text-sm py-2 border-b border-dashed"
										>
											<span class="text-gray-500">Kuota Tersedia</span>
											<span class="font-semibold text-gray-900">{path.quota || 0} Kursi</span>
										</div>
										<div
											class="flex items-center justify-between text-sm py-2 border-b border-dashed"
										>
											<span class="text-gray-500">Seleksi</span>
											<span class="font-medium text-gray-900">Administrasi & Tes</span>
										</div>
									</div>
								</div>
								<div class="p-4 bg-gray-50 border-t mt-auto">
									<Button
										onclick={startRegistration}
										class="w-full bg-white border border-gray-200 text-gray-700 hover:bg-[#002C5F] hover:text-white hover:border-[#002C5F] transition-all"
									>
										Daftar Jalur Ini
									</Button>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		</section>
	</main>

	<!-- Professional Footer -->
	<footer id="help" class="bg-white border-t pt-16 pb-8">
		<div class="container mx-auto px-4">
			<div class="grid md:grid-cols-4 gap-12 mb-12">
				<div class="col-span-1 md:col-span-2">
					<div class="flex items-center gap-3 mb-6">
						{#if school.logoUrl}
							<img src={school.logoUrl} alt="Logo" class="w-12 h-12 grayscale opacity-80" />
						{/if}
						<div>
							<h5 class="font-bold text-gray-900 uppercase tracking-wide">{school.name}</h5>
							<p class="text-xs text-gray-500">Official Registration Portal</p>
						</div>
					</div>
					<p class="text-gray-500 text-sm leading-relaxed max-w-sm">
						Sistem Penerimaan Peserta Didik Baru (PPDB) Online yang dikelola secara resmi oleh
						panitia sekolah untuk menjamin transparansi dan kemudahan akses bagi seluruh calon
						siswa.
					</p>
				</div>

				<div>
					<h6 class="font-bold text-gray-900 mb-4">Kontak Panitia</h6>
					<ul class="space-y-3 text-sm text-gray-600">
						{#if school.address}
							<li class="flex items-start gap-3">
								<MapPin class="w-4 h-4 mt-0.5 text-blue-600" />
								<span>{school.address}</span>
							</li>
						{/if}
						{#if school.contactPhone}
							<li class="flex items-center gap-3">
								<Phone class="w-4 h-4 text-blue-600" />
								<a href="tel:{school.contactPhone}" class="hover:text-blue-600"
									>{school.contactPhone}</a
								>
							</li>
						{/if}
						{#if school.contactEmail}
							<li class="flex items-center gap-3">
								<Mail class="w-4 h-4 text-blue-600" />
								<a href="mailto:{school.contactEmail}" class="hover:text-blue-600"
									>{school.contactEmail}</a
								>
							</li>
						{/if}
					</ul>
				</div>

				<div>
					<h6 class="font-bold text-gray-900 mb-4">Link Penting</h6>
					<ul class="space-y-2 text-sm text-gray-600">
						<li>
							<a href="#" class="hover:text-blue-600 transition-colors">Panduan Pendaftaran</a>
						</li>
						<li>
							<a href="#" class="hover:text-blue-600 transition-colors">Syarat & Ketentuan</a>
						</li>
						<li><a href="#" class="hover:text-blue-600 transition-colors">Jadwal Seleksi</a></li>
						<li><a href="#" class="hover:text-blue-600 transition-colors">Pengumuman</a></li>
					</ul>
				</div>
			</div>

			<div class="border-t pt-8 text-center">
				<p class="text-sm text-gray-400">
					&copy; {new Date().getFullYear()}
					{school.name}. All rights reserved. • Powered by
					<span class="font-medium text-gray-500">PPDB SaaS</span>
				</p>
			</div>
		</div>
	</footer>
</div>
