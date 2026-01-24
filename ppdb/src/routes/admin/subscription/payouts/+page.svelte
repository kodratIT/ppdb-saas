<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { enhance } from '$app/forms';
	import { i18n } from '$lib/i18n/index.svelte';
	import PayoutsStatsCard from '$lib/components/admin/payouts/PayoutsStatsCard.svelte';
	import PayoutsList from '$lib/components/admin/payouts/PayoutsList.svelte';
	import PayoutDetailsModal from '$lib/components/admin/payouts/PayoutDetailsModal.svelte';
	import { invalidateAll } from '$app/navigation';
	import { onMount } from 'svelte';

	let { data, form }: { data: PageData; form?: ActionData } = $props();

	let selectedPayoutId = $state<string | null>(null);
	let isModalOpen = $state(false);
	let selectedPayoutDetails = $state<any>(null);
	let isLoadingDetails = $state(false);

	// Handle form responses
	$effect(() => {
		if (form?.success) {
			invalidateAll();
		}
	});

	async function handleViewDetails(id: string) {
		selectedPayoutId = id;
		isLoadingDetails = true;

		try {
			const response = await fetch(`/api/admin/payouts/${id}`);
			if (response.ok) {
				selectedPayoutDetails = await response.json();
				isModalOpen = true;
			}
		} catch (error) {
			console.error('Failed to fetch payout details:', error);
		} finally {
			isLoadingDetails = false;
		}
	}

	async function handleApprove(id: string, notes?: string) {
		const formData = new FormData();
		formData.append('payoutId', id);
		formData.append('status', 'completed');
		if (notes) formData.append('notes', notes);

		await fetch('?/updateStatus', {
			method: 'POST',
			body: formData
		});

		isModalOpen = false;
		invalidateAll();
	}

	async function handleReject(id: string, reason: string) {
		const formData = new FormData();
		formData.append('payoutId', id);
		formData.append('status', 'rejected');
		formData.append('notes', reason);

		await fetch('?/updateStatus', {
			method: 'POST',
			body: formData
		});

		isModalOpen = false;
		invalidateAll();
	}

	function handleFilterChange(filters: Record<string, string>) {
		const params = new URLSearchParams();
		Object.entries(filters).forEach(([key, value]) => {
			if (value) params.set(key, value);
		});

		// Navigate with new filters
		window.location.href = `?${params.toString()}`;
	}

	function handlePageChange(page: number) {
		const params = new URLSearchParams(window.location.search);
		params.set('page', page.toString());
		window.location.href = `?${params.toString()}`;
	}

	async function handleExport() {
		const params = new URLSearchParams();
		params.set('format', 'csv');
		params.set('status', data.filters.status);
		if (data.filters.dateFrom) params.set('dateFrom', data.filters.dateFrom);
		if (data.filters.dateTo) params.set('dateTo', data.filters.dateTo);
		if (data.filters.search) params.set('search', data.filters.search);

		try {
			const response = await fetch(`?/export`, {
				method: 'POST',
				body: params
			});

			if (response.ok) {
				const result = await response.json();
				if (result.data) {
					// Download file
					const blob = new Blob([result.data], { type: 'text/csv' });
					const url = window.URL.createObjectURL(blob);
					const a = document.createElement('a');
					a.href = url;
					a.download = result.filename || 'payouts.csv';
					document.body.appendChild(a);
					a.click();
					document.body.removeChild(a);
					window.URL.revokeObjectURL(url);
				}
			}
		} catch (error) {
			console.error('Export failed:', error);
		}
	}

	async function handleBulkApprove(ids: string[]) {
		const formData = new FormData();
		formData.append('ids', ids.join(','));
		formData.append('status', 'completed');

		await fetch('?/bulkUpdate', {
			method: 'POST',
			body: formData
		});

		invalidateAll();
	}

	async function handleBulkReject(ids: string[]) {
		const formData = new FormData();
		formData.append('ids', ids.join(','));
		formData.append('status', 'rejected');

		await fetch('?/bulkUpdate', {
			method: 'POST',
			body: formData
		});

		invalidateAll();
	}

	function closeModal() {
		isModalOpen = false;
		selectedPayoutId = null;
		selectedPayoutDetails = null;
	}
</script>

<div class="container mx-auto px-4 py-8 max-w-7xl">
	<div class="flex items-center justify-between mb-8">
		<div>
			<h1 class="text-3xl font-bold tracking-tight">{i18n.t('admin.payouts.title')}</h1>
			<p class="text-muted-foreground mt-1">{i18n.t('admin.payouts.subtitle')}</p>
		</div>
	</div>

	<!-- Stats Cards -->
	<PayoutsStatsCard stats={data.stats} isLoading={false} />

	<!-- Success/Error Messages -->
	{#if form?.success && form?.message}
		<div class="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg flex items-center gap-2">
			<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
				<path
					fill-rule="evenodd"
					d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
					clip-rule="evenodd"
				/>
			</svg>
			<span class="text-sm font-medium">{form.message}</span>
		</div>
	{/if}

	{#if form?.errors}
		<div class="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg">
			<div class="text-sm font-medium mb-1">Some operations failed:</div>
			<ul class="text-xs list-disc list-inside">
				{#each form.errors as error}
					<li>{error}</li>
				{/each}
			</ul>
		</div>
	{/if}

	<!-- Payouts List -->
	<PayoutsList
		payouts={data.payouts}
		pagination={data.pagination}
		filters={data.filters}
		isLoading={false}
		onPageChange={handlePageChange}
		onFilterChange={handleFilterChange}
		onViewDetails={handleViewDetails}
		onApprove={(id) => handleApprove(id)}
		onReject={(id) => handleReject(id)}
		onBulkApprove={handleBulkApprove}
		onBulkReject={handleBulkReject}
		onExport={handleExport}
	/>

	<!-- Details Modal -->
	{#if isModalOpen && selectedPayoutDetails}
		<PayoutDetailsModal
			payout={selectedPayoutDetails}
			isOpen={isModalOpen}
			onClose={closeModal}
			onApprove={handleApprove}
			onReject={handleReject}
			isSubmitting={false}
		/>
	{/if}
</div>
