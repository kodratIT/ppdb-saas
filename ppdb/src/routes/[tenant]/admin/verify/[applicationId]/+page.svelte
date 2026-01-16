<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';
	import Card from '$lib/components/ui/card.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import Badge from '$lib/components/ui/badge.svelte';
	import DocumentViewer from '$lib/components/verification/DocumentViewer.svelte';
	import FormDataPanel from '$lib/components/verification/FormDataPanel.svelte';
	import VerificationActions from '$lib/components/verification/VerificationActions.svelte';
	import { ArrowLeft, FileText, Clock, CheckCircle2, XCircle } from 'lucide-svelte';

	let { data } = $props();

	let selectedDocumentIndex = $state(0);
	let showHomeVisit = $state(false);

	const selectedDocument = $derived(data.documents[selectedDocumentIndex]);

	const documentTypeLabels: Record<string, string> = {
		kk: 'Kartu Keluarga',
		akta: 'Akta Kelahiran',
		passport: 'Paspor',
		kitas: 'KITAS',
		photo: 'Pas Foto',
		other: 'Dokumen Lain'
	};

	function getDocumentLabel(type: string): string {
		return documentTypeLabels[type] || type;
	}

	function getStatusBadgeVariant(status: string) {
		if (status === 'verified') return 'default'; // green
		if (status === 'rejected') return 'destructive'; // red
		return 'secondary'; // gray for pending
	}

	async function handleVerificationAction(action: string, reason?: string) {
		try {
			const response = await fetch(`/api/admin/documents/${selectedDocument.id}/verify`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ action, reason })
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || 'Verification failed');
			}

			// Reload data
			await invalidateAll();

			// Move to next document if available
			if (selectedDocumentIndex < data.documents.length - 1) {
				selectedDocumentIndex += 1;
			}
		} catch (error) {
			alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
		}
	}

	function formatDate(date: Date | string | null): string {
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
	<title>Verify Application - {data.application.childFullName}</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
	<!-- Header -->
	<div class="bg-white border-b sticky top-0 z-10">
		<div class="max-w-7xl mx-auto px-4 py-4">
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-4">
					<Button
						variant="outline"
						size="sm"
						onclick={() => goto(`/${data.tenantSlug}/admin/verify`)}
					>
						<ArrowLeft class="w-4 h-4 mr-2" />
						Back to List
					</Button>
					<div>
						<h1 class="text-xl font-bold text-gray-900">{data.application.childFullName}</h1>
						<p class="text-sm text-gray-500">
							{data.application.admissionPath?.name || 'N/A'} • Submitted {formatDate(
								data.application.submittedAt
							)}
						</p>
					</div>
				</div>
				<div class="flex items-center gap-4">
					<Badge variant={getStatusBadgeVariant(data.application.status)}>
						{data.application.status}
					</Badge>
					{#if data.application.status === 'accepted'}
						<form
							method="POST"
							action="?/withdraw"
							onsubmit={(e) => {
								if (!confirm('Are you sure you want to withdraw this student? This action will open up a slot for waitlisted candidates.')) {
									e.preventDefault();
								}
							}}
						>
							<Button variant="destructive" size="sm" type="submit">
								Withdraw / Reject
							</Button>
						</form>
					{/if}
					{#if data.isSuperAdmin}
						<form
							method="POST"
							action="?/delete_permanent"
							onsubmit={(e) => {
								if (!confirm('PERHATIAN: Anda akan menghapus data siswa ini secara PERMANEN (termasuk dokumen, nilai, invoice, dll). Data tidak bisa dikembalikan. Lanjutkan?')) {
									e.preventDefault();
								}
							}}
						>
							<Button variant="destructive" size="sm" type="submit" class="bg-red-800 hover:bg-red-900">
								Hapus Permanen (GDPR)
							</Button>
						</form>
					{/if}
				</div>
			</div>
		</div>
	</div>

	<div class="max-w-7xl mx-auto px-4 py-6">
		<!-- Document Tabs -->
		{#if data.documents.length > 0}
			<div class="mb-6">
				<div class="flex gap-2 overflow-x-auto pb-2">
					{#each data.documents as doc, index}
						<button
							onclick={() => {
								selectedDocumentIndex = index;
								showHomeVisit = false;
							}}
							class="px-4 py-2 rounded-lg border transition-all whitespace-nowrap
                {!showHomeVisit && selectedDocumentIndex === index
								? 'bg-blue-600 text-white border-blue-600'
								: 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'}"
						>
							<div class="flex items-center gap-2">
								<FileText class="w-4 h-4" />
								<span class="text-sm font-medium">{getDocumentLabel(doc.documentType)}</span>
								{#if doc.status === 'verified'}
									<CheckCircle2 class="w-4 h-4 text-green-500" />
								{:else if doc.status === 'rejected'}
									<XCircle class="w-4 h-4 text-red-500" />
								{:else}
									<Clock class="w-4 h-4 text-yellow-500" />
								{/if}
							</div>
						</button>
					{/each}

					{#if data.homeVisitReport}
						<button
							onclick={() => (showHomeVisit = true)}
							class="px-4 py-2 rounded-lg border transition-all whitespace-nowrap
                {showHomeVisit
								? 'bg-purple-600 text-white border-purple-600'
								: 'bg-white text-gray-700 border-gray-300 hover:border-purple-300'}"
						>
							<div class="flex items-center gap-2">
								<CheckCircle2 class="w-4 h-4" />
								<span class="text-sm font-medium">Home Visit Report</span>
							</div>
						</button>
					{:else}
						<button
							onclick={() => goto(`/${data.tenantSlug}/admin/home-visit/${data.application.id}`)}
							class="px-4 py-2 rounded-lg border border-dashed border-gray-300 text-gray-500 hover:border-purple-300 hover:text-purple-600 transition-all whitespace-nowrap"
						>
							<div class="flex items-center gap-2">
								<FileText class="w-4 h-4" />
								<span class="text-sm font-medium">Create Home Visit</span>
							</div>
						</button>
					{/if}
				</div>
			</div>

			<!-- Split View Layout -->
			<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<!-- Left: Form Data -->
				<div>
					<FormDataPanel application={data.application} />
				</div>

				<!-- Right: Document Viewer + Actions -->
				<div class="space-y-4">
					{#if showHomeVisit && data.homeVisitReport}
						<Card class="p-6">
							<div class="flex items-center justify-between mb-6">
								<h3 class="text-lg font-bold">Laporan Kunjungan Rumah</h3>
								<Badge variant={data.homeVisitReport.recommendation === 'recommended' ? 'default' : 'destructive'}>
									{data.homeVisitReport.recommendation === 'recommended' ? 'Direkomendasikan' : 'Tidak Direkomendasikan'}
								</Badge>
							</div>

							<div class="grid grid-cols-2 gap-4 mb-6 text-sm">
								<div class="space-y-1">
									<p class="text-gray-500">Petugas</p>
									<p class="font-medium">{data.homeVisitReport.officer?.name || 'N/A'}</p>
								</div>
								<div class="space-y-1">
									<p class="text-gray-500">Tanggal Kunjungan</p>
									<p class="font-medium">{formatDate(data.homeVisitReport.createdAt)}</p>
								</div>
								{#if data.homeVisitReport.gpsLocation}
									<div class="col-span-2 space-y-1">
										<p class="text-gray-500">Lokasi GPS</p>
										<p class="font-medium text-blue-600">
											<a href="https://www.google.com/maps/search/?api=1&query={data.homeVisitReport.gpsLocation}" target="_blank">
												{data.homeVisitReport.gpsLocation} (Lihat di Peta)
											</a>
										</p>
									</div>
								{/if}
							</div>

							<div class="space-y-4 mb-6">
								<div>
									<h4 class="text-sm font-semibold text-gray-700 mb-2">Detail Kondisi</h4>
									<div class="bg-gray-50 p-3 rounded-lg text-sm grid grid-cols-2 gap-2">
										{#if data.homeVisitReport.surveyData}
											{@const survey = JSON.parse(data.homeVisitReport.surveyData)}
											<p class="text-gray-500">Atap:</p> <p>{survey.roof || '-'}</p>
											<p class="text-gray-500">Lantai:</p> <p>{survey.floor || '-'}</p>
											<p class="text-gray-500">Dinding:</p> <p>{survey.walls || '-'}</p>
										{/if}
									</div>
								</div>

								<div>
									<h4 class="text-sm font-semibold text-gray-700 mb-2">Catatan Petugas</h4>
									<p class="text-sm bg-gray-50 p-3 rounded-lg">{data.homeVisitReport.summary || '-'}</p>
								</div>
							</div>

							{#if data.homeVisitReport.photos?.length > 0}
								<div>
									<h4 class="text-sm font-semibold text-gray-700 mb-3">Foto Lapangan</h4>
									<div class="grid grid-cols-2 gap-3">
										{#each data.homeVisitReport.photos as photo}
											<div class="space-y-1">
												<div class="aspect-video rounded-lg overflow-hidden border">
													<img src={photo.photoUrl} alt={photo.caption} class="w-full h-full object-cover" />
												</div>
												{#if photo.caption}
													<p class="text-xs text-center text-gray-500">{photo.caption}</p>
												{/if}
											</div>
										{/each}
									</div>
								</div>
							{/if}
						</Card>
					{:else if selectedDocument}
						<Card class="overflow-hidden">
							<div class="p-4 border-b bg-gray-50">
								<div class="flex items-center justify-between">
									<h3 class="font-semibold text-gray-900">
										{getDocumentLabel(selectedDocument.documentType)}
									</h3>
									<Badge variant={getStatusBadgeVariant(selectedDocument.status)}>
										{selectedDocument.status}
									</Badge>
								</div>
								<p class="text-xs text-gray-500 mt-1">
									Uploaded: {formatDate(selectedDocument.uploadedAt)}
								</p>
							</div>

							<div class="p-4">
								<DocumentViewer
									src={`/api/documents/${selectedDocument.id}/content`}
									alt={getDocumentLabel(selectedDocument.documentType)}
									documentType={getDocumentLabel(selectedDocument.documentType)}
								/>
							</div>

							<VerificationActions
								documentId={selectedDocument.id}
								currentStatus={selectedDocument.status}
								onAction={handleVerificationAction}
							/>
						</Card>

						<!-- Review History -->
						{#if data.reviewHistory[selectedDocument.id]?.length > 0}
							<Card class="p-4">
								<h3 class="font-semibold text-gray-900 mb-3">Review History</h3>
								<div class="space-y-3">
									{#each data.reviewHistory[selectedDocument.id] as review}
										<div class="border-l-4 border-gray-300 pl-3 py-1">
											<div class="flex items-center justify-between mb-1">
												<span class="text-xs font-medium text-gray-900">
													{review.action.toUpperCase()}
												</span>
												<span class="text-xs text-gray-500">
													{formatDate(review.createdAt)}
												</span>
											</div>
											<p class="text-xs text-gray-600">
												By: {review.reviewer?.name || review.reviewer?.email || 'Unknown'}
											</p>
											{#if review.reason}
												<p class="text-xs text-gray-700 mt-1 italic">"{review.reason}"</p>
											{/if}
										</div>
									{/each}
								</div>
							</Card>
						{/if}
					{/if}
				</div>
			</div>
		{:else}
			<Card class="p-12 text-center">
				<FileText class="w-16 h-16 mx-auto text-gray-300 mb-4" />
				<h3 class="text-lg font-medium text-gray-600">No Documents Uploaded</h3>
				<p class="text-gray-500 mt-2">This application has no documents to verify.</p>
			</Card>
		{/if}
	</div>
</div>
