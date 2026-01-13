<script lang="ts">
	import { goto } from '$app/navigation';
	import Card from '$lib/components/ui/card.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import { FileText, Clock, CheckCircle, AlertCircle, UserPlus, ChevronRight } from 'lucide-svelte';

	let { data } = $props();

	const statusIcons = {
		draft: { icon: FileText, color: 'text-gray-400', label: 'Draft' },
		submitted: { icon: Clock, color: 'text-yellow-500', label: 'Disubmit' },
		under_review: { icon: Clock, color: 'text-blue-500', label: 'Dalam Review' },
		verified: { icon: CheckCircle, color: 'text-green-500', label: 'Terverifikasi' },
		accepted: { icon: CheckCircle, color: 'text-green-600', label: 'Diterima' },
		rejected: { icon: AlertCircle, color: 'text-red-500', label: 'Tidak Lolos' },
		waitlisted: { icon: AlertCircle, color: 'text-orange-500', label: 'Cadangan' },
		pending_announcement: { icon: Clock, color: 'text-blue-500', label: 'Menunggu Pengumuman' }
	};

	function handleRegisterChild() {
		// Store latest application data for pre-fill
		if (data.latestApplication) {
			sessionStorage.setItem(
				'prefillData',
				JSON.stringify({
					parentFullName: data.latestApplication.parentFullName,
					parentPhone: data.latestApplication.parentPhone,
					parentEmail: data.latestApplication.parentEmail,
					address: data.latestApplication.address,
					city: data.latestApplication.city,
					province: data.latestApplication.province,
					postalCode: data.latestApplication.postalCode
				})
			);
		}

		goto(`/${data.tenantSlug}/register/form/step-1`);
	}

	function formatDate(date: Date | string | null): string {
		if (!date) return '-';

		const d = typeof date === 'string' ? new Date(date) : date;
		return d.toLocaleDateString('id-ID', {
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		});
	}

	function formatDateTime(date: Date | string | null): string {
		if (!date) return '-';

		const d = typeof date === 'string' ? new Date(date) : date;
		return d.toLocaleString('id-ID', {
			day: 'numeric',
			month: 'short',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}
</script>

<svelte:head>
	<title>Dashboard - {data.tenant?.name}</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8 px-4">
	<div class="max-w-5xl mx-auto">
		<!-- Header -->
		<div class="mb-8">
			<div class="flex items-center justify-between">
				<div>
					<h1 class="text-3xl font-bold text-gray-900">Dashboard Orang Tua</h1>
					<p class="text-gray-600 mt-1">
						Selamat datang, {data.applications[0]?.childFullName || 'Orang Tua'}
					</p>
				</div>

				<Button onclick={handleRegisterChild} class="bg-blue-600 hover:bg-blue-700">
					<UserPlus class="w-4 h-4 mr-2" />
					Daftar Anak Lain
				</Button>
			</div>
		</div>

		<!-- Stats Overview -->
		<div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
			<Card class="p-4">
				<div class="flex items-center gap-3">
					<div class="p-2 bg-blue-100 rounded-lg">
						<FileText class="w-6 h-6 text-blue-600" />
					</div>
					<div>
						<p class="text-2xl font-bold text-gray-900">
							{data.applications.length}
						</p>
						<p class="text-sm text-gray-500">Total Pendaftaran</p>
					</div>
				</div>
			</Card>

			<Card class="p-4">
				<div class="flex items-center gap-3">
					<div class="p-2 bg-green-100 rounded-lg">
						<CheckCircle class="w-6 h-6 text-green-600" />
					</div>
					<div>
						<p class="text-2xl font-bold text-gray-900">
							{data.applications.filter(
								(app: any) => app.status === 'veried' || app.status === 'accepted'
							).length}
						</p>
						<p class="text-sm text-gray-500">Pendaftaran Diterima</p>
					</div>
				</div>
			</Card>

			<Card class="p-4">
				<div class="flex items-center gap-3">
					<div class="p-2 bg-yellow-100 rounded-lg">
						<Clock class="w-6 h-6 text-yellow-600" />
					</div>
					<div>
						<p class="text-2xl font-bold text-gray-900">
							{data.applications.filter(
								(app: any) => app.status === 'under_review' || app.status === 'submitted'
							).length}
						</p>
						<p class="text-sm text-gray-500">Dalam Proses Review</p>
					</div>
				</div>
			</Card>

			<Card class="p-4">
				<div class="flex items-center gap-3">
					<div class="p-2 bg-red-100 rounded-lg">
						<AlertCircle class="w-6 h-6 text-red-600" />
					</div>
					<div>
						<p class="text-2xl font-bold text-gray-900">
							{data.applications.filter(
								(app: any) => app.status === 'rejected' || app.status === 'waitlisted'
							).length}
						</p>
						<p class="text-sm text-gray-500">Perlu Perhatian</p>
					</div>
				</div>
			</Card>
		</div>

		<!-- Applications List -->
		<Card class="p-6">
			<h2 class="text-xl font-bold text-gray-900 mb-4">Daftar Pendaftaran Anak</h2>

			{#if data.applications.length === 0}
				<div class="text-center py-12">
					<FileText class="w-16 h-16 mx-auto text-gray-300 mb-4" />
					<h3 class="text-lg font-medium text-gray-600 mb-2">Belum ada pendaftaran</h3>
					<p class="text-gray-500 mb-4">Mulai pendaftaran anak Anda sekarang</p>
					<Button onclick={handleRegisterChild} class="bg-blue-600 hover:bg-blue-700">
						<UserPlus class="w-4 h-4 mr-2" />
						Daftar Anak Pertama
					</Button>
				</div>
			{:else}
				<div class="space-y-4">
					{#each data.applications as app (app.id)}
						{@const appAny = app as any}
						{@const statusInfo = statusIcons[appAny.status as keyof typeof statusIcons] || statusIcons.draft}
						<div class="border rounded-lg p-4 hover:border-blue-300 transition-colors">
							<div class="flex items-start justify-between gap-4 mb-3">
								<div class="flex items-center gap-3">
									<div class="p-2 bg-gray-100 rounded-lg">
										<svelte:component this={statusInfo.icon} class="w-5 h-5 {statusInfo.color}" />
									</div>
									<div>
										<h3 class="font-semibold text-gray-900">
											{app.childFullName}
										</h3>
										<p class="text-xs text-gray-500">
											REG-{app.id.slice(0, 8).toUpperCase()}
										</p>
									</div>
								</div>

								<ChevronRight class="w-5 h-5 text-gray-400 flex-shrink-0" />
							</div>

							<!-- Status Result Banners -->
							{#if appAny.status === 'pending_announcement'}
								<div class="bg-blue-50 border border-blue-200 rounded-md p-3 mb-3">
									<div class="flex items-center gap-2 text-blue-800 mb-1">
										<Clock class="w-4 h-4" />
										<span class="font-bold text-sm">Pengumuman Belum Dibuka</span>
									</div>
									<p class="text-sm text-blue-700">
										Hasil seleksi akan diumumkan pada <span class="font-semibold"
											>{formatDateTime(appAny.announcementDate)}</span
										>
									</p>
								</div>
							{:else if app.status === 'accepted'}
								<div class="bg-green-50 border border-green-200 rounded-md p-3 mb-3">
									<div class="flex items-center gap-2 text-green-800 mb-1">
										<CheckCircle class="w-4 h-4" />
										<span class="font-bold text-sm">SELAMAT! Anda Diterima</span>
									</div>
									<p class="text-sm text-green-700">
										Selamat! Anda dinyatakan lolos seleksi. Silakan cek menu pembayaran/daftar ulang.
									</p>
								</div>
							{:else if app.status === 'waitlisted'}
								<div class="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-3">
									<div class="flex items-center gap-2 text-yellow-800 mb-1">
										<Clock class="w-4 h-4" />
										<span class="font-bold text-sm">Daftar Cadangan (Reserved)</span>
									</div>
									<p class="text-sm text-yellow-700">
										Anda berada dalam daftar cadangan. Kami akan menghubungi Anda jika kuota tersedia.
									</p>
								</div>
							{:else if app.status === 'rejected'}
								<div class="bg-gray-50 border border-gray-200 rounded-md p-3 mb-3">
									<div class="flex items-center gap-2 text-gray-800 mb-1">
										<AlertCircle class="w-4 h-4" />
										<span class="font-bold text-sm">Mohon Maaf, Belum Lolos</span>
									</div>
									<p class="text-sm text-gray-600">
										Mohon maaf, Anda belum lolos seleksi pada periode ini.
									</p>
								</div>
							{:else}
								<!-- Standard Status Badge -->
								<div class="mb-3">
									<span
										class="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium
										{statusInfo.color === 'text-gray-400' ? 'bg-gray-100 text-gray-600' : ''}
										{statusInfo.color === 'text-yellow-500' ? 'bg-yellow-100 text-yellow-700' : ''}
										{statusInfo.color === 'text-blue-500' ? 'bg-blue-100 text-blue-700' : ''}
										{statusInfo.color === 'text-green-500' || statusInfo.color === 'text-green-600'
											? 'bg-green-100 text-green-700'
											: ''}
										{statusInfo.color === 'text-red-500' || statusInfo.color === 'text-orange-500'
											? 'bg-red-100 text-red-700'
											: ''}
									"
									>
										{statusInfo.label}
									</span>
								</div>
							{/if}

							<div
								class="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3 pt-3 border-t border-gray-100 text-sm"
							>
								<div>
									<span class="text-gray-500">Jalur:</span>
									<span class="font-medium">{appAny.admissionPathName || 'N/A'}</span>
								</div>
								<div>
									<span class="text-gray-500">Tanggal Daftar:</span>
									<span class="font-medium">{formatDate(app.createdAt)}</span>
								</div>
								<div>
									<span class="text-gray-500">Status Update:</span>
									<span class="font-medium">{formatDateTime(app.updatedAt)}</span>
								</div>
								{#if app.submittedAt}
									<div>
										<span class="text-gray-500">Tgl Submit:</span>
										<span class="font-medium">{formatDate(app.submittedAt)}</span>
									</div>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</Card>

		<!-- Tenant Info Footer -->
		<div class="mt-8 text-center text-sm text-gray-400">
			<p>
				{data.tenant?.name} • Powered by PPDB SaaS V2
			</p>
		</div>
	</div>
</div>
