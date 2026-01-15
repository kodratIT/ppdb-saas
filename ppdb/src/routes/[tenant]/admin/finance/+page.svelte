<script lang="ts">
	import {
		Card,
		CardContent,
		CardHeader,
		CardTitle,
		CardDescription
	} from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Search, DollarSign, Clock, AlertCircle, CheckCircle2, Eye, Download } from 'lucide-svelte';
	import { enhance } from '$app/forms';
	// Custom Dialog replacement
	import { fly } from 'svelte/transition';

	export let data;

	let searchQuery = '';
	let statusFilter = 'all';
	let selectedProof: any = null;
	let showProofModal = false;
	let rejectReason = '';
	let processing = false;

	$: filteredInvoices = data.invoices.filter((inv) => {
		const matchesSearch =
			inv.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
			inv.parentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
			inv.externalId.toLowerCase().includes(searchQuery.toLowerCase());

		const matchesStatus = statusFilter === 'all' || inv.status.toLowerCase() === statusFilter;

		return matchesSearch && matchesStatus;
	});

	function formatCurrency(amount: number) {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			minimumFractionDigits: 0
		}).format(amount);
	}

	function formatDate(date: Date) {
		return new Date(date).toLocaleDateString('id-ID', {
			day: 'numeric',
			month: 'short',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function openProofModal(proof: any) {
		selectedProof = proof;
		showProofModal = true;
		rejectReason = '';
	}

	function closeProofModal() {
		showProofModal = false;
		selectedProof = null;
	}

	const statusColors = {
		PENDING: 'bg-yellow-100 text-yellow-800',
		VERIFYING: 'bg-blue-100 text-blue-800',
		PAID: 'bg-green-100 text-green-800',
		EXPIRED: 'bg-gray-100 text-gray-800',
		FAILED: 'bg-red-100 text-red-800',
		REJECTED: 'bg-red-100 text-red-800'
	};
</script>

<div class="space-y-6">
	<div>
		<h1 class="text-3xl font-bold tracking-tight">Financial Overview</h1>
		<p class="text-muted-foreground">Monitor payments and revenue.</p>
	</div>

	<!-- Stats Cards -->
	<div class="grid gap-4 md:grid-cols-4">
		<Card>
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium">Total Revenue</CardTitle>
				<DollarSign class="h-4 w-4 text-muted-foreground" />
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold">{formatCurrency(data.stats.totalRevenue)}</div>
			</CardContent>
		</Card>
		<Card>
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium">Paid Invoices</CardTitle>
				<CheckCircle2 class="h-4 w-4 text-green-600" />
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold">{data.stats.paidCount}</div>
			</CardContent>
		</Card>
		<Card>
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium">Needs Verification</CardTitle>
				<Eye class="h-4 w-4 text-blue-600" />
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold">{data.stats.verifyingCount}</div>
			</CardContent>
		</Card>
		<Card>
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium">Pending</CardTitle>
				<Clock class="h-4 w-4 text-yellow-600" />
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold">{data.stats.pendingCount}</div>
			</CardContent>
		</Card>
	</div>

	<!-- Filters -->
	<div class="flex items-center gap-4">
		<div class="relative flex-1 max-w-sm">
			<Search class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
			<Input
				type="search"
				placeholder="Search invoice, student..."
				class="pl-8"
				bind:value={searchQuery}
			/>
		</div>
		<select
			bind:value={statusFilter}
			class="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
		>
			<option value="all">All Status</option>
			<option value="verifying">Needs Verification</option>
			<option value="pending">Pending</option>
			<option value="paid">Paid</option>
			<option value="expired">Expired</option>
			<option value="failed">Failed</option>
		</select>
		
		<Button
			variant="outline"
			class="ml-auto"
			onclick={() => {
				const url = new URL(window.location.href);
				// Append /export to the current path (handling potential trailing slash)
				url.pathname = url.pathname.replace(/\/$/, '') + '/export';
				url.searchParams.set('status', statusFilter);
				window.location.href = url.toString();
			}}
		>
			<Download class="mr-2 h-4 w-4" />
			Export CSV
		</Button>
	</div>

	<!-- Invoices Table -->
	<Card>
		<div class="rounded-md border">
			<table class="w-full text-sm">
				<thead class="bg-muted/50 text-left font-medium text-muted-foreground">
					<tr>
						<th class="p-4">Invoice ID</th>
						<th class="p-4">Student / Parent</th>
						<th class="p-4">Amount</th>
						<th class="p-4">Status</th>
						<th class="p-4">Date</th>
						<th class="p-4 text-right">Actions</th>
					</tr>
				</thead>
				<tbody class="divide-y">
					{#each filteredInvoices as invoice}
						<tr class="hover:bg-muted/50">
							<td class="p-4 font-mono">{invoice.externalId}</td>
							<td class="p-4">
								<div class="font-medium">{invoice.studentName}</div>
								<div class="text-xs text-muted-foreground">{invoice.parentName}</div>
							</td>
							<td class="p-4">{formatCurrency(invoice.amount)}</td>
							<td class="p-4">
								<span
									class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 {statusColors[
										invoice.status
									]}"
								>
									{invoice.status}
								</span>
							</td>
							<td class="p-4">
								<div>{formatDate(invoice.createdAt)}</div>
								{#if invoice.status === 'PENDING'}
									<div class="text-xs text-red-500">
										Exp: {formatDate(invoice.expiryDate)}
									</div>
								{/if}
							</td>
							<td class="p-4 text-right">
								{#if invoice.status === 'VERIFYING' && invoice.latestProof}
									<Button size="sm" onclick={() => openProofModal(invoice.latestProof)}>
										Verify Proof
									</Button>
								{/if}
							</td>
						</tr>
					{:else}
						<tr>
							<td colspan="6" class="p-8 text-center text-muted-foreground">
								No invoices found.
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</Card>
</div>

<!-- Proof Verification Modal -->
{#if showProofModal && selectedProof}
	<div
		class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
		onclick={closeProofModal}
		aria-hidden="true"
	>
		<div
			class="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col"
			transition:fly={{ y: 20, duration: 300 }}
			onclick={(e) => e.stopPropagation()}
			aria-hidden="true"
		>
			<div class="p-6 border-b flex justify-between items-center">
				<h3 class="text-lg font-semibold">Verify Payment Proof</h3>
				<button onclick={closeProofModal} class="text-gray-500 hover:text-gray-700">
					<span class="sr-only">Close</span>
					<svg
						class="h-6 w-6"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>
			</div>

			<div class="flex-1 overflow-y-auto p-6">
				<div class="grid md:grid-cols-2 gap-6">
					<div>
						<h4 class="font-medium mb-2 text-sm text-gray-500">Proof Image</h4>
						<div class="border rounded-lg overflow-hidden bg-gray-100">
							<img
								src={selectedProof.imageUrl.startsWith('r2:') ? `/api/payment-proofs/${selectedProof.id}/image` : selectedProof.imageUrl}
								alt="Payment Proof"
								class="w-full h-auto object-contain max-h-[400px]"
							/>
						</div>
					</div>
					<div class="space-y-4">
						<div>
							<h4 class="font-medium text-sm text-gray-500">Uploaded At</h4>
							<p>{formatDate(selectedProof.uploadedAt)}</p>
						</div>
						{#if selectedProof.notes}
							<div>
								<h4 class="font-medium text-sm text-gray-500">Sender Notes</h4>
								<p class="text-sm p-3 bg-gray-50 rounded-md">{selectedProof.notes}</p>
							</div>
						{/if}

						<div class="pt-4 border-t space-y-4">
							<form
								method="POST"
								action="?/verify"
								use:enhance={() => {
									processing = true;
									return async ({ update }) => {
										processing = false;
										closeProofModal();
										await update();
									};
								}}
							>
								<input type="hidden" name="proofId" value={selectedProof.id} />
								
								<div class="space-y-4">
									<div class="space-y-2">
										<label for="reason" class="text-sm font-medium text-gray-700">
											Rejection Reason (Optional)
										</label>
										<Input
											id="reason"
											name="reason"
											placeholder="Only required if rejecting..."
											bind:value={rejectReason}
										/>
									</div>

									<div class="grid grid-cols-2 gap-3">
										<Button
											type="submit"
											name="action"
											value="reject"
											variant="destructive"
											disabled={processing}
											class="w-full"
										>
											Reject
										</Button>
										<Button
											type="submit"
											name="action"
											value="approve"
											disabled={processing}
											class="w-full bg-green-600 hover:bg-green-700"
										>
											Approve Payment
										</Button>
									</div>
								</div>
							</form>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}
