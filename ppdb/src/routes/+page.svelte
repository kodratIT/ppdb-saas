<script lang="ts">
	import { fade, fly, slide } from 'svelte/transition';
	import type { PageData } from './$types';

	export let data: PageData;

	let openFaq: number | null = null;
	let activeTab = 0;

	const toggleFaq = (i: number) => {
		openFaq = openFaq === i ? null : i;
	};

	const analyticsData = [
		{ label: 'Zonasi', value: 65, color: 'bg-blue-600' },
		{ label: 'Prestasi', value: 25, color: 'bg-blue-400' },
		{ label: 'Afirmasi', value: 10, color: 'bg-blue-200' }
	];

	const comparisons = [
		{
			feature: 'Waktu Pendaftaran',
			manual: 'Datang ke sekolah, antre berjam-jam.',
			digital: '5 Menit, dari mana saja, kapan saja.',
			isGood: true
		},
		{
			feature: 'Manajemen Dokumen',
			manual: 'Map coklat menumpuk, risiko hilang tinggi.',
			digital: 'Tersimpan aman & terorganisir di Cloud.',
			isGood: true
		},
		{
			feature: 'Verifikasi Data',
			manual: 'Cek manual satu-persatu, rawan human error.',
			digital: 'Otomatisasi validasi & integrasi sistem.',
			isGood: true
		},
		{
			feature: 'Sistem Pembayaran',
			manual: 'Bayar tunai di bendahara, antre lagi.',
			digital: 'VA & QRIS, konfirmasi otomatis 24/7.',
			isGood: true
		}
	];

	const stats = [
		{ label: 'Sekolah Mitra', value: '150+' },
		{ label: 'Pendaftaran Sukses', value: '50.000+' },
		{ label: 'Uptime Sistem', value: '99.9%' }
	];

	const workflowSteps = [
		{
			title: 'Aktivasi Akun',
			desc: 'Daftarkan sekolah Anda dan dapatkan akses instan ke Dashboard Admin dalam hitungan menit.',
			detail:
				'Proses validasi cepat untuk memastikan kredibilitas sekolah. Setelah aktif, Anda memiliki kendali penuh atas sistem Anda sendiri.',
			icon: '🔑'
		},
		{
			title: 'Kustomisasi Form',
			desc: 'Gunakan Form Builder dinamis untuk menyesuaikan syarat dan data pendaftaran sesuai kebutuhan.',
			detail:
				'Seret dan lepas (drag-and-drop) komponen form. Tambahkan jalur zonasi, prestasi, atau syarat dokumen khusus dengan mudah.',
			icon: '⚙️'
		},
		{
			title: 'Siap Publikasi',
			desc: 'Buka pendaftaran secara resmi dan pantau setiap data yang masuk secara real-time.',
			detail:
				'Landing page sekolah Anda otomatis aktif. Orang tua siswa bisa langsung mendaftar dan mengunggah dokumen dari smartphone mereka.',
			icon: '🚀'
		}
	];

	const testimonials = [
		{
			name: 'Dr. Ahmad Subagjo',
			role: 'Kepala Yayasan Pendidikan Maju',
			quote:
				'PPDB-SAAS mengubah proses pendaftaran kami yang biasanya berbulan-bulan menjadi hanya hitungan minggu. Transparansinya luar biasa.',
			img: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmad'
		},
		{
			name: 'Siti Aminah, M.Pd',
			role: 'Admin PPDB Sekolah Unggulan',
			quote:
				'Sistem verifikasi otomatisnya sangat membantu tim kami. Tidak ada lagi tumpukan kertas dan antrean panjang di sekolah.',
			img: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Siti'
		}
	];

	const pillars = [
		{
			title: 'Skalabilitas Cloud',
			desc: 'Arsitektur berbasis cloud yang siap menangani ribuan pendaftar secara bersamaan tanpa lag.',
			icon: '☁️'
		},
		{
			title: 'Keamanan Data',
			desc: 'Enkripsi end-to-end untuk memastikan privasi data siswa dan orang tua terlindungi sepenuhnya.',
			icon: '🔒'
		},
		{
			title: 'Integrasi Pembayaran',
			desc: 'Mendukung berbagai metode pembayaran otomatis (VA, QRIS, Retail) untuk kemudahan verifikasi.',
			icon: '💳'
		},
		{
			title: 'Layanan 24/7',
			desc: 'Sistem selalu aktif kapan saja, memberikan fleksibilitas bagi pendaftar untuk melengkapi berkas.',
			icon: '⚡'
		}
	];

	const faqs = [
		{
			q: 'Berapa lama proses aktivasi untuk sekolah baru?',
			a: 'Proses aktivasi biasanya memakan waktu kurang dari 24 jam setelah tim kami melakukan verifikasi awal terhadap data sekolah Anda.'
		},
		{
			q: 'Apakah data kami aman dan tidak akan bocor?',
			a: 'Kami menggunakan standar keamanan industri dengan enkripsi database dan audit berkala untuk memastikan data tetap aman.'
		},
		{
			q: 'Apakah tersedia panduan penggunaan untuk admin?',
			a: 'Ya, kami menyediakan dokumentasi lengkap dan tim support yang siap membantu melalui WhatsApp atau Email.'
		}
	];
</script>

<svelte:head>
	<title>PPDB-SAAS Enterprise - Solusi Digitalisasi Pendaftaran Sekolah Profesional</title>
</svelte:head>

<div
	class="min-h-screen bg-[#FDFDFD] font-sans text-[#333] selection:bg-[#002C5F] selection:text-white"
>
	<!-- Business Alert Bar -->
	<div
		class="bg-[#001A3A] text-white py-1.5 overflow-hidden whitespace-nowrap border-b border-white/10 relative z-[60]"
	>
		<div class="inline-block animate-marquee font-bold text-[10px] uppercase tracking-[0.2em]">
			NEWS: PPDB-SAAS Kini Mendukung Integrasi Pembayaran Otomatis via Xendit • Bergabunglah dengan
			150+ Sekolah Unggulan • Transformasi Digital Sekarang Lebih Mudah • Sistem Aman, Terukur, &
			Terpercaya •
		</div>
	</div>

	<!-- Main Header -->
	<nav
		class="bg-white/95 backdrop-blur-md border-b py-5 px-4 md:px-12 flex justify-between items-center sticky top-0 z-50 shadow-sm"
	>
		<div class="flex items-center gap-4">
			<div
				class="w-12 h-12 bg-gradient-to-br from-[#002C5F] to-[#004A8F] p-2.5 flex items-center justify-center text-white rounded-xl shadow-lg transition-transform hover:scale-105"
			>
				<svg viewBox="0 0 24 24" class="w-full h-full fill-current">
					<path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
				</svg>
			</div>
			<div>
				<h1 class="font-black text-2xl text-[#002C5F] uppercase leading-none tracking-tighter">
					PPDB <span class="text-blue-600">SAAS</span>
				</h1>
				<p class="text-[9px] text-gray-400 uppercase tracking-[0.4em] font-black mt-1">
					Enterprise Grade Solutions
				</p>
			</div>
		</div>
		<div class="flex items-center gap-4 md:gap-8">
			<a
				href="/sign-in"
				class="text-[#002C5F] font-black text-xs hover:text-blue-700 transition-colors uppercase tracking-widest"
				>Client Login</a
			>
			<a
				href="/sign-up"
				class="bg-[#002C5F] text-white px-8 py-3.5 rounded-sm font-black text-xs hover:bg-blue-800 transition-all shadow-lg active:scale-95 uppercase tracking-widest"
			>
				Daftarkan Sekolah
			</a>
		</div>
	</nav>

	<!-- Hero Section -->
	<header class="relative bg-white pt-24 pb-36 px-4 md:px-12 overflow-hidden border-b">
		<div
			class="absolute inset-0 opacity-[0.03] pointer-events-none"
			style="background-image: url('https://www.transparenttextures.com/patterns/grid-me.png');"
		></div>

		<div class="max-w-7xl mx-auto flex flex-col items-center text-center relative z-10">
			<div
				class="inline-flex items-center gap-2 bg-blue-50 text-[#002C5F] px-4 py-2 rounded-full font-black text-[10px] mb-8 uppercase tracking-[0.2em] border border-blue-100 shadow-sm"
				in:fade
			>
				Solusi PPDB Paling Terpercaya di Indonesia
			</div>
			<h2
				class="text-5xl md:text-8xl font-black text-[#001A3A] leading-[0.9] mb-10 uppercase tracking-tighter"
				in:fly={{ y: 30 }}
			>
				Modernisasi PPDB <br />
				<span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-[#002C5F]"
					>Aman & Terukur</span
				>
			</h2>
			<p class="text-lg md:text-2xl text-gray-500 max-w-3xl mb-14 leading-relaxed font-semibold">
				Platform pendaftaran sekolah kelas dunia yang dirancang khusus untuk institusi pendidikan
				profesional. Fokus pada privasi data, skalabilitas sistem, dan pengalaman pengguna terbaik.
			</p>
			<div class="flex flex-col sm:flex-row gap-5">
				<a
					href="/sign-up"
					class="bg-[#002C5F] text-white px-12 py-6 rounded-sm font-black text-xl hover:bg-[#001430] transition-all shadow-2xl hover:-translate-y-1 uppercase tracking-widest"
				>
					Mulai Sekarang
				</a>
				<a
					href="#features"
					class="bg-white text-[#002C5F] border-2 border-[#002C5F] px-12 py-6 rounded-sm font-black text-xl hover:bg-gray-50 transition-all uppercase tracking-widest"
				>
					Pelajari Fitur
				</a>
			</div>
		</div>
	</header>

	<!-- Analytics Preview Section -->
	<section class="py-32 px-4 md:px-12 bg-white border-b overflow-hidden">
		<div class="max-w-7xl mx-auto grid lg:grid-cols-2 gap-24 items-center">
			<div>
				<h3
					class="text-4xl md:text-5xl font-black text-[#002C5F] mb-8 uppercase tracking-tighter leading-tight"
				>
					Analitik Cerdas <br /> <span class="text-blue-600">Real-Time Dashboard</span>
				</h3>
				<p class="text-lg text-gray-500 mb-10 font-medium leading-relaxed">
					Ambil keputusan berdasarkan data akurat. Pantau statistik pendaftar, grafik harian, dan
					pencapaian kuota secara otomatis tanpa perlu rekap manual lagi.
				</p>
				<div class="grid grid-cols-2 gap-8">
					<div class="border-l-4 border-[#002C5F] pl-6 py-2">
						<p class="text-3xl font-black text-[#002C5F]">Automated</p>
						<p class="text-xs font-bold uppercase text-gray-400 tracking-widest">Reporting</p>
					</div>
					<div class="border-l-4 border-blue-400 pl-6 py-2">
						<p class="text-3xl font-black text-blue-600">Visual</p>
						<p class="text-xs font-bold uppercase text-gray-400 tracking-widest">Insights</p>
					</div>
				</div>
			</div>

			<div class="relative scale-90 md:scale-100">
				<!-- Mock Dashboard Card -->
				<div class="bg-gray-50 rounded-3xl p-8 shadow-2xl border border-gray-100 relative z-10">
					<div class="flex justify-between items-center mb-10">
						<div class="space-y-1">
							<h4 class="font-black text-[#002C5F] uppercase text-xs tracking-widest">
								Pendaftar Hari Ini
							</h4>
							<p class="text-3xl font-black text-[#002C5F]">
								+142 <span class="text-xs text-green-500">↑ 12%</span>
							</p>
						</div>
						<div class="flex gap-2">
							<div class="w-8 h-8 rounded-full bg-blue-100"></div>
							<div class="w-8 h-8 rounded-full bg-blue-200"></div>
						</div>
					</div>

					<!-- Bar Chart Mockup -->
					<div class="space-y-6">
						{#each analyticsData as item}
							<div class="space-y-2">
								<div
									class="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-500"
								>
									<span>Jalur {item.label}</span>
									<span>{item.value}%</span>
								</div>
								<div class="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
									<div
										class="{item.color} h-full transition-all duration-1000"
										style="width: {item.value}%"
									></div>
								</div>
							</div>
						{/each}
					</div>

					<!-- Floating Stats Card -->
					<div
						class="absolute -bottom-10 -right-10 bg-[#001A3A] text-white p-6 rounded-2xl shadow-2xl border border-white/10 hidden md:block"
					>
						<p class="text-xs font-bold opacity-60 uppercase tracking-widest mb-1 text-blue-400">
							Total Kuota Terisi
						</p>
						<div class="flex items-end gap-3">
							<p class="text-4xl font-black italic">84%</p>
							<div class="w-12 h-2 bg-blue-600 rounded-full mb-2"></div>
						</div>
					</div>
				</div>
				<!-- Background Elements -->
				<div
					class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-50 rounded-full blur-3xl -z-10 opacity-60"
				></div>
			</div>
		</div>
	</section>

	<!-- Mobile Experience Showcase -->
	<section class="py-32 px-4 md:px-12 bg-white border-b">
		<div class="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
			<div class="order-2 lg:order-1">
				<h3
					class="text-4xl md:text-5xl font-black text-[#002C5F] mb-8 uppercase tracking-tighter leading-tight"
				>
					Pendaftaran Dalam <br /> <span class="text-blue-600">Genggaman Tangan</span>
				</h3>
				<p class="text-lg text-gray-500 mb-10 font-medium leading-relaxed">
					Berikan pengalaman terbaik bagi orang tua siswa. Sistem kami dioptimalkan sepenuhnya untuk
					perangkat mobile, memungkinkan pendaftaran dilakukan dari rumah semudah mengirim pesan
					WhatsApp.
				</p>
				<ul class="space-y-6">
					<li class="flex items-start gap-4">
						<span class="bg-blue-100 text-[#002C5F] p-2 rounded-lg font-black text-xl">📱</span>
						<div>
							<h4 class="font-black text-[#002C5F] uppercase text-sm">Responsive Interface</h4>
							<p class="text-sm text-gray-400 font-medium">
								Tampilan yang menyesuaikan otomatis di HP, Tablet, maupun Laptop.
							</p>
						</div>
					</li>
					<li class="flex items-start gap-4">
						<span class="bg-blue-100 text-[#002C5F] p-2 rounded-lg font-black text-xl">🔔</span>
						<div>
							<h4 class="font-black text-[#002C5F] uppercase text-sm">Instan Notification</h4>
							<p class="text-sm text-gray-400 font-medium">
								Update status pendaftaran dikirim langsung via WhatsApp orang tua.
							</p>
						</div>
					</li>
				</ul>
			</div>
			<div class="order-1 lg:order-2 flex justify-center">
				<div
					class="w-72 h-[550px] bg-[#001A3A] rounded-[3rem] border-8 border-[#002C5F] shadow-2xl relative overflow-hidden p-3 group hover:scale-105 transition-transform duration-500"
				>
					<div
						class="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-[#002C5F] rounded-b-2xl z-20"
					></div>
					<div class="h-full w-full bg-white rounded-[2rem] overflow-hidden flex flex-col">
						<div class="bg-[#002C5F] p-4 pt-8 text-white">
							<p class="text-[10px] font-bold opacity-70 uppercase tracking-widest">
								PPDB Sekolah Unggulan
							</p>
							<p class="text-xs font-black uppercase">Formulir Pendaftaran</p>
						</div>
						<div class="p-4 space-y-4 flex-1">
							<div class="h-2 bg-gray-100 rounded w-1/2"></div>
							<div class="h-8 bg-gray-50 border rounded w-full"></div>
							<div class="h-2 bg-gray-100 rounded w-1/3"></div>
							<div class="h-8 bg-gray-50 border rounded w-full"></div>
							<div class="h-2 bg-gray-100 rounded w-1/4"></div>
							<div
								class="h-24 bg-blue-50 border-2 border-dashed border-blue-200 rounded w-full flex items-center justify-center"
							>
								<span class="text-[10px] text-blue-400 font-bold">Upload Dokumen</span>
							</div>
						</div>
						<div class="p-4">
							<div
								class="h-10 bg-[#002C5F] rounded w-full flex items-center justify-center text-[10px] font-black text-white uppercase tracking-widest"
							>
								Kirim Data
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Comparison Section (Manual vs Digital) -->
	<section class="py-32 px-4 md:px-12 bg-[#F8FAFC]">
		<div class="max-w-7xl mx-auto">
			<div class="text-center mb-24">
				<h3 class="text-4xl font-black text-[#002C5F] mb-4 uppercase tracking-tighter">
					Beralihlah Dari Cara Lama
				</h3>
				<p class="text-gray-400 font-bold uppercase text-[10px] tracking-[0.4em]">
					Perbandingan Nyata Efisiensi Operasional
				</p>
			</div>

			<div class="overflow-hidden border-2 border-gray-100 rounded-2xl shadow-xl bg-white">
				<table class="w-full text-left border-collapse">
					<thead>
						<tr class="bg-[#002C5F] text-white">
							<th class="p-6 md:p-8 font-black uppercase tracking-widest text-sm">Fitur Sistem</th>
							<th class="p-6 md:p-8 font-black uppercase tracking-widest text-sm bg-black/20"
								>Cara Manual</th
							>
							<th class="p-6 md:p-8 font-black uppercase tracking-widest text-sm bg-blue-600"
								>PPDB-SAAS</th
							>
						</tr>
					</thead>
					<tbody class="divide-y divide-gray-100">
						{#each comparisons as row}
							<tr class="hover:bg-gray-50 transition-colors">
								<td class="p-6 md:p-8 font-black text-[#002C5F] uppercase text-xs tracking-tight"
									>{row.feature}</td
								>
								<td class="p-6 md:p-8 text-gray-400 text-sm font-medium italic">{row.manual}</td>
								<td class="p-6 md:p-8 text-[#002C5F] text-sm font-black bg-blue-50/50">
									<div class="flex items-center gap-2">
										<span class="text-green-600">✓</span>
										{row.digital}
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	</section>

	<!-- Workflow Section (Interactive Tabs) -->
	<section class="py-32 px-4 md:px-12 bg-white">
		<div class="max-w-7xl mx-auto">
			<div class="text-center mb-20">
				<h3 class="text-4xl font-black text-[#002C5F] mb-4 uppercase tracking-tighter">
					Cara Kerja Sistem
				</h3>
				<p class="text-gray-400 font-bold uppercase text-[10px] tracking-[0.4em]">
					Implementasi Tanpa Hambatan
				</p>
			</div>

			<div class="grid lg:grid-cols-2 gap-16 items-center">
				<div class="space-y-4">
					{#each workflowSteps as step, i}
						<button
							class="w-full text-left p-8 border-2 transition-all flex gap-6 {activeTab === i
								? 'border-[#002C5F] bg-blue-50/30'
								: 'border-gray-50 hover:border-gray-200'}"
							on:click={() => (activeTab = i)}
						>
							<span class="text-4xl">{step.icon}</span>
							<div>
								<h4 class="font-black text-[#002C5F] uppercase mb-2">{step.title}</h4>
								<p class="text-sm font-medium text-gray-500 leading-tight">{step.desc}</p>
							</div>
						</button>
					{/each}
				</div>
				<div class="bg-[#001A3A] rounded-2xl p-4 shadow-2xl relative overflow-hidden group">
					<div class="absolute inset-0 bg-blue-600/10 mix-blend-overlay"></div>
					<div
						class="bg-white/10 backdrop-blur-md rounded-xl p-8 min-h-[400px] flex flex-col justify-center text-white"
					>
						{#key activeTab}
							<div in:fade={{ duration: 400 }}>
								<span class="text-6xl mb-8 block opacity-50">{workflowSteps[activeTab].icon}</span>
								<h5 class="text-3xl font-black uppercase mb-6">{workflowSteps[activeTab].title}</h5>
								<p class="text-lg text-blue-100 leading-relaxed font-medium">
									{workflowSteps[activeTab].detail}
								</p>
							</div>
						{/key}
					</div>
					<div class="mt-4 flex gap-2">
						<div class="w-3 h-3 rounded-full bg-red-400"></div>
						<div class="w-3 h-3 rounded-full bg-yellow-400"></div>
						<div class="w-3 h-3 rounded-full bg-green-400"></div>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Pillars Section -->
	<section id="features" class="py-32 px-4 md:px-12 bg-[#F8FAFC]">
		<div class="max-w-7xl mx-auto">
			<div class="text-center mb-24">
				<h3 class="text-4xl font-black text-[#002C5F] mb-4 uppercase tracking-tighter">
					Pilar Utama Kami
				</h3>
				<p class="text-gray-400 font-bold uppercase text-[10px] tracking-[0.4em]">
					Standar Baru Dalam Manajemen PPDB
				</p>
			</div>
			<div class="grid md:grid-cols-4 gap-12">
				{#each pillars as pillar}
					<div
						class="bg-white p-10 rounded-2xl shadow-sm border border-gray-100 hover:border-blue-200 transition-all hover:shadow-xl group"
					>
						<div class="text-5xl mb-8 group-hover:scale-110 transition-transform duration-300">
							{pillar.icon}
						</div>
						<h4 class="text-xl font-black text-[#002C5F] mb-4 uppercase tracking-tight">
							{pillar.title}
						</h4>
						<p class="text-gray-500 text-sm leading-relaxed font-medium">{pillar.desc}</p>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<!-- Testimonials Section -->
	<section class="py-32 px-4 md:px-12 bg-white border-t">
		<div class="max-w-7xl mx-auto text-center">
			<div class="mb-20">
				<h3 class="text-4xl font-black text-[#002C5F] mb-4 uppercase tracking-tighter">
					Apa Kata Mereka?
				</h3>
				<p class="text-gray-400 font-bold uppercase text-[10px] tracking-[0.4em]">
					Kisah Sukses Sekolah Mitra Kami
				</p>
			</div>
			<div class="grid md:grid-cols-2 gap-12">
				{#each testimonials as t}
					<div
						class="bg-[#F8FAFC] p-12 text-left border-t-4 border-[#002C5F] shadow-sm relative overflow-hidden"
					>
						<div class="absolute top-4 right-8 text-8xl text-gray-200/50 font-serif leading-none">
							“
						</div>
						<p class="text-xl font-bold text-[#001A3A] italic leading-relaxed mb-10 relative z-10">
							{t.quote}
						</p>
						<div class="flex items-center gap-4">
							<img
								src={t.img}
								alt={t.name}
								class="w-14 h-14 rounded-full bg-blue-100 border-2 border-white shadow-sm"
							/>
							<div>
								<h5 class="font-black text-[#002C5F] uppercase text-sm">{t.name}</h5>
								<p class="text-xs text-gray-400 font-bold uppercase">{t.role}</p>
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<!-- FAQ Section -->
	<section class="py-32 px-4 md:px-12 bg-[#F8FAFC] border-t">
		<div class="max-w-3xl mx-auto">
			<div class="text-center mb-20">
				<h3 class="text-3xl font-black text-[#002C5F] mb-4 uppercase tracking-tighter">
					Pusat Bantuan Enterprise
				</h3>
				<p class="text-gray-400 font-bold uppercase text-[10px] tracking-[0.4em]">
					Informasi Implementasi & Keamanan
				</p>
			</div>
			<div class="space-y-4">
				{#each faqs as faq, i}
					<div
						class="border-2 border-gray-50 overflow-hidden transition-all {openFaq === i
							? 'border-blue-100 bg-blue-50/20'
							: ''}"
					>
						<button
							class="w-full p-6 text-left flex justify-between items-center bg-white hover:bg-gray-50 transition-colors"
							on:click={() => toggleFaq(i)}
						>
							<span class="font-black text-[#002C5F] uppercase tracking-tight text-sm">{faq.q}</span
							>
							<span
								class="text-2xl font-light transform transition-transform {openFaq === i
									? 'rotate-45'
									: ''}">+</span
							>
						</button>
						{#if openFaq === i}
							<div class="p-6 border-t border-gray-50" transition:slide>
								<p class="text-sm font-medium text-gray-500 leading-relaxed">{faq.a}</p>
							</div>
						{/if}
					</div>
				{/each}
			</div>
		</div>
	</section>

	<!-- Footer -->
	<footer class="bg-[#001A3A] text-white py-24 px-4 md:px-12 relative overflow-hidden">
		<div
			class="max-w-7xl mx-auto grid md:grid-cols-4 gap-16 relative z-10 text-center md:text-left"
		>
			<div class="col-span-1 md:col-span-2">
				<div class="flex items-center justify-center md:justify-start gap-3 mb-8">
					<div class="w-10 h-10 bg-white/10 flex items-center justify-center text-white rounded-lg">
						<svg viewBox="0 0 24 24" class="w-6 h-6 fill-current">
							<path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
						</svg>
					</div>
					<span class="font-black text-2xl tracking-tighter uppercase italic">PPDB-SAAS</span>
				</div>
				<p class="text-blue-200/50 text-sm leading-relaxed max-w-sm font-medium mx-auto md:mx-0">
					Penyedia infrastruktur digital pendaftaran sekolah terkemuka. Berfokus pada inovasi,
					keamanan, dan keunggulan operasional.
				</p>
			</div>
			<div>
				<h5 class="font-black text-[9px] uppercase tracking-[0.4em] mb-10 text-blue-400">
					Solusi Kami
				</h5>
				<ul class="space-y-4 text-xs font-bold uppercase tracking-widest">
					<li>
						<a href="#" class="text-gray-400 hover:text-white transition-colors"
							>School Management</a
						>
					</li>
					<li>
						<a href="#" class="text-gray-400 hover:text-white transition-colors">Data Security</a>
					</li>
					<li>
						<a href="#" class="text-gray-400 hover:text-white transition-colors">Cloud Hosting</a>
					</li>
				</ul>
			</div>
			<div>
				<h5 class="font-black text-[9px] uppercase tracking-[0.4em] mb-10 text-blue-400">
					Hubungi Kami
				</h5>
				<div class="text-xs font-bold text-gray-400 leading-loose uppercase tracking-widest">
					<p>Enterprise Plaza, Suite 402</p>
					<p>Jakarta Selatan, Indonesia</p>
					<p class="mt-6 text-blue-300 font-black">SALES@PPDB-SAAS.COM</p>
				</div>
			</div>
		</div>
		<div
			class="max-w-7xl mx-auto mt-24 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[9px] font-black text-gray-500 uppercase tracking-[0.4em]"
		>
			<p>© 2026 PPDB-SAAS Enterprise. Professional Grade Software Solutions.</p>
			<div class="flex gap-10">
				<a href="#" class="hover:text-white">Privacy Policy</a>
				<a href="#" class="hover:text-white">Terms of Service</a>
				<a href="#" class="hover:text-white">Security SLA</a>
			</div>
		</div>
	</footer>
</div>

<style>
	@keyframes marquee {
		0% {
			transform: translateX(100%);
		}
		100% {
			transform: translateX(-100%);
		}
	}
	.animate-marquee {
		display: inline-block;
		animation: marquee 40s linear infinite;
	}
	:global(html) {
		scroll-behavior: smooth;
	}
</style>
