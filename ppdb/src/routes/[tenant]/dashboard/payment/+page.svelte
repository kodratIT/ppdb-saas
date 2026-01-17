<script lang="ts">
	/* eslint-disable svelte/no-navigation-without-resolve */
	import { enhance } from '$app/forms';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Alert } from '$lib/components/ui/alert';
	import { CheckCircle2, Clock, XCircle, CreditCard, Landmark, Download } from 'lucide-svelte';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { generateInvoicePDF } from '$lib/utils/invoice';

	export let data;
	let showManualUpload = false;
	let uploading = false;

	function formatCurrency(amount: number) {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			minimumFractionDigits: 0
		}).format(amount);
	}

	function handleDownloadInvoice() {
		if (!data.latestInvoice || !data.application) return;

		generateInvoicePDF({
			invoiceNumber: data.latestInvoice.externalId,
			date: new Date(data.latestInvoice.createdAt).toLocaleDateString('id-ID'),
			studentName: data.application.childFullName || '',
			parentName: data.application.parentFullName || data.application.user?.name || 'Orang Tua',
			amount: data.latestInvoice.amount,
			schoolName: data.bankInfo.bankName ? `Sekolah (via ${data.bankInfo.bankName})` : 'Sekolah', // Fallback name
			status: data.latestInvoice.status,
			paymentMethod: 'Transfer'
		});
	}
</script>

<svelte:head>
	<title>Pembayaran - {data.application?.childFullName}</title>
</svelte:head>

<div class="container max-w-2xl mx-auto py-8 px-4">
	<div class="mb-6">
		<h1 class="text-2xl font-bold">Pembayaran Biaya Pendaftaran</h1>
		<p class="text-gray-600">Selesaikan pembayaran untuk melanjutkan proses pendaftaran.</p>
	</div>

	{#if !data.fee}
		<Alert class="bg-gray-50 border-gray-200">
			<CheckCircle2 class="w-4 h-4 text-gray-500" />
			<span>Tidak ada biaya pendaftaran yang perlu dibayar saat ini.</span>
		</Alert>
	{:else}
		<Card.Root>
			<Card.Header>
				<Card.Title>Rincian Tagihan</Card.Title>
				<Card.Description>
					Invoice untuk {data.application.childFullName}
				</Card.Description>
			</Card.Header>
			<Card.Content class="space-y-4">
				<div class="flex justify-between items-center py-2 border-b">
					<span class="text-gray-600">{data.fee.name}</span>
					<span class="font-bold">{formatCurrency(data.fee.amount)}</span>
				</div>

				{#if data.latestInvoice}
					<div class="rounded-lg border p-4 space-y-3">
						<div class="flex justify-between items-center">
							<span class="text-sm text-gray-500">Status Pembayaran</span>
							{#if data.latestInvoice.status === 'PAID'}
								<span class="flex items-center gap-1 text-green-600 font-bold text-sm">
									<CheckCircle2 class="w-4 h-4" /> LUNAS
								</span>
								<Button
									variant="outline"
									size="sm"
									class="ml-4 h-8 gap-2"
									onclick={handleDownloadInvoice}
								>
									<Download class="w-3 h-3" /> Invoice
								</Button>
							{:else if data.latestInvoice.status === 'PENDING'}
								<span class="flex items-center gap-1 text-orange-600 font-bold text-sm">
									<Clock class="w-4 h-4" /> MENUNGGU PEMBAYARAN
								</span>
							{:else if data.latestInvoice.status === 'VERIFYING'}
								<span class="flex items-center gap-1 text-blue-600 font-bold text-sm">
									<Clock class="w-4 h-4" /> SEDANG DIVERIFIKASI
								</span>
							{:else}
								<span class="flex items-center gap-1 text-red-600 font-bold text-sm">
									<XCircle class="w-4 h-4" />
									{data.latestInvoice.status}
								</span>
							{/if}
						</div>

						{#if data.latestInvoice.status === 'PENDING'}
							<div class="pt-2">
								<a
									href={data.latestInvoice.invoiceUrl}
									target="_blank"
									class="block w-full text-center py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
								>
									Lanjutkan Pembayaran
								</a>
								<p class="text-xs text-center text-gray-500 mt-2">
									Link akan kadaluarsa pada {new Date(
										data.latestInvoice.expiryDate
									).toLocaleString()}
								</p>
							</div>
						{:else if data.latestInvoice.status === 'VERIFYING'}
							<Alert class="bg-blue-50 border-blue-200 mt-2">
								<Clock class="w-4 h-4 text-blue-500" />
								<span>Pembayaran Anda sedang kami verifikasi. Mohon tunggu 1x24 jam.</span>
							</Alert>
						{:else if data.latestInvoice.status === 'REJECTED'}
							<Alert class="bg-red-50 border-red-200 mt-2">
								<XCircle class="w-4 h-4 text-red-500" />
								<span>Pembayaran ditolak. Silakan upload ulang bukti pembayaran yang valid.</span>
							</Alert>
						{/if}
					</div>
				{/if}

				{#if !data.latestInvoice || data.latestInvoice.status === 'EXPIRED' || data.latestInvoice.status === 'FAILED' || data.latestInvoice.status === 'REJECTED'}
					<div class="space-y-4">
						<form method="POST" action="?/pay" use:enhance>
							<Button type="submit" class="w-full gap-2">
								<CreditCard class="w-4 h-4" />
								Bayar Online (Virtual Account / QRIS)
							</Button>
						</form>

						{#if data.bankInfo?.bankAccountNumber}
							<div class="relative">
								<div class="absolute inset-0 flex items-center">
									<span class="w-full border-t"></span>
								</div>
								<div class="relative flex justify-center text-xs uppercase">
									<span class="bg-white px-2 text-muted-foreground">Atau</span>
								</div>
							</div>

							<Button
								variant="outline"
								class="w-full gap-2"
								onclick={() => (showManualUpload = !showManualUpload)}
							>
								<Landmark class="w-4 h-4" />
								Transfer Manual
							</Button>

							{#if showManualUpload}
								<div class="rounded-lg border p-4 bg-gray-50 mt-4">
									<h3 class="font-semibold text-sm mb-2">Instruksi Transfer</h3>
									<div class="text-sm space-y-1 text-gray-700 mb-4">
										<p>Silakan transfer ke rekening berikut:</p>
										<p class="font-medium">{data.bankInfo.bankName}</p>
										<p class="font-mono text-lg font-bold">{data.bankInfo.bankAccountNumber}</p>
										<p>A.n {data.bankInfo.bankAccountName}</p>
										<p class="text-xs text-gray-500 mt-2">
											Nominal: <span class="font-bold text-gray-900"
												>{formatCurrency(data.fee.amount)}</span
											>
										</p>
									</div>

									<form
										method="POST"
										action="?/uploadProof"
										enctype="multipart/form-data"
										class="space-y-3"
										use:enhance={() => {
											uploading = true;
											return async ({ update }) => {
												uploading = false;
												await update();
											};
										}}
									>
										<div class="space-y-2">
											<Label for="proof">Upload Bukti Transfer</Label>
											<Input id="proof" name="proof" type="file" accept="image/*" required />
										</div>
										<div class="space-y-2">
											<Label for="notes">Catatan (Nama Pengirim / Bank)</Label>
											<Input id="notes" name="notes" placeholder="Contoh: Budi - BCA" />
										</div>
										<Button type="submit" disabled={uploading} class="w-full">
											{uploading ? 'Mengupload...' : 'Kirim Bukti Transfer'}
										</Button>
									</form>
								</div>
							{/if}
						{/if}
					</div>
				{/if}
			</Card.Content>
		</Card.Root>
	{/if}
</div>
