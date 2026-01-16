<script lang="ts">
	import { goto } from '$app/navigation';
	import Card from '$lib/components/ui/card.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import Badge from '$lib/components/ui/badge.svelte';
	import { FileCheck, Clock, CheckCircle2, AlertCircle, Eye, Search, Filter, Download } from 'lucide-svelte';

	let { data } = $props();

	let searchQuery = $state('');
	let statusFilter = $state<string>('all');

	const filteredApplications = $derived(() => {
		let filtered = data.applications;

		// Search filter
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase();
			filtered = filtered.filter(
				(app: any) =>
					app.childFullName?.toLowerCase().includes(query) ||
					app.parentFullName?.toLowerCase().includes(query) ||
					app.parentPhone?.includes(query)
			);
		}

		// Status filter
		if (statusFilter !== 'all') {
			filtered = filtered.filter((app: any) => {
				if (statusFilter === 'pending') return Number(app.pendingDocuments) > 0;
				if (statusFilter === 'verified')
					return (
						Number(app.totalDocuments) > 0 &&
						Number(app.pendingDocuments) === 0 &&
						Number(app.rejectedDocuments) === 0
					);
				if (statusFilter === 'rejected') return Number(app.rejectedDocuments) > 0;
				return true;
			});
		}

		return filtered;
	});

	function formatDate(date: Date | string | null): string {
		if (!date) return '-';
		const d = typeof date === 'string' ? new Date(date) : date;
		return d.toLocaleDateString('id-ID', {
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		});
	}

	function handleViewApplication(applicationId: string) {
		goto(`/${data.tenantSlug}/admin/verify/${applicationId}`);
	}
</script>

<svelte:head>
	<title>Verification Dashboard</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8 px-4">
	<div class="max-w-7xl mx-auto">
		<!-- Header -->
		<div class="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
			<div>
				<h1 class="text-3xl font-bold text-gray-900">Document Verification</h1>
				<p class="text-gray-600 mt-1">Review and verify application documents</p>
			</div>
			
			<div class="flex gap-2">
				<Button
					href="/{data.tenantSlug}/admin/export/dapodik"
					variant="outline"
					class="flex items-center gap-2"
				>
					<Download class="w-4 h-4" />
					Export Dapodik
				</Button>
			</div>
		</div>

		<!-- Stats Cards -->
		<div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
			<Card class="p-4">
				<div class="flex items-center gap-3">
					<div class="p-2 bg-blue-100 rounded-lg">
						<FileCheck class="w-6 h-6 text-blue-600" />
					</div>
					<div>
						<p class="text-2xl font-bold text-gray-900">{data.stats.totalPending}</p>
						<p class="text-sm text-gray-500">Total Pending</p>
					</div>
				</div>
			</Card>

			<Card class="p-4">
				<div class="flex items-center gap-3">
					<div class="p-2 bg-yellow-100 rounded-lg">
						<Clock class="w-6 h-6 text-yellow-600" />
					</div>
					<div>
						<p class="text-2xl font-bold text-gray-900">{data.stats.needsReview}</p>
						<p class="text-sm text-gray-500">Needs Review</p>
					</div>
				</div>
			</Card>

			<Card class="p-4">
				<div class="flex items-center gap-3">
					<div class="p-2 bg-green-100 rounded-lg">
						<CheckCircle2 class="w-6 h-6 text-green-600" />
					</div>
					<div>
						<p class="text-2xl font-bold text-gray-900">{data.stats.fullyVerified}</p>
						<p class="text-sm text-gray-500">Verified</p>
					</div>
				</div>
			</Card>

			<Card class="p-4">
				<div class="flex items-center gap-3">
					<div class="p-2 bg-red-100 rounded-lg">
						<AlertCircle class="w-6 h-6 text-red-600" />
					</div>
					<div>
						<p class="text-2xl font-bold text-gray-900">{data.stats.hasRejections}</p>
						<p class="text-sm text-gray-500">Has Rejections</p>
					</div>
				</div>
			</Card>
		</div>

		<!-- Filters -->
		<Card class="p-4 mb-6">
			<div class="flex flex-col md:flex-row gap-4">
				<div class="flex-1">
					<div class="relative">
						<Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
						<input
							type="text"
							placeholder="Search by name, phone..."
							bind:value={searchQuery}
							class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						/>
					</div>
				</div>
				<div class="flex items-center gap-2">
					<Filter class="w-4 h-4 text-gray-500" />
					<select
						bind:value={statusFilter}
						class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
					>
						<option value="all">All Status</option>
						<option value="pending">Pending Docs</option>
						<option value="verified">Fully Verified</option>
						<option value="rejected">Has Rejections</option>
					</select>
				</div>
			</div>
		</Card>

		<!-- Applications Table -->
		<Card class="overflow-hidden">
			{#if filteredApplications().length === 0}
				<div class="text-center py-12">
					<FileCheck class="w-16 h-16 mx-auto text-gray-300 mb-4" />
					<h3 class="text-lg font-medium text-gray-600 mb-2">No applications found</h3>
					<p class="text-gray-500">
						{searchQuery || statusFilter !== 'all'
							? 'Try adjusting your filters'
							: 'All applications have been verified'}
					</p>
				</div>
			{:else}
				<div class="overflow-x-auto">
					<table class="w-full">
						<thead class="bg-gray-50 border-b">
							<tr>
								<th
									class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
									>Applicant</th
								>
								<th
									class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
									>Admission Path</th
								>
								<th
									class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
									>Documents</th
								>
								<th
									class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
									>Submitted</th
								>
								<th
									class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
									>Actions</th
								>
							</tr>
						</thead>
						<tbody class="bg-white divide-y divide-gray-200">
							{#each filteredApplications() as app}
								<tr class="hover:bg-gray-50 transition-colors">
									<td class="px-6 py-4">
										<div>
											<p class="font-medium text-gray-900">{app.childFullName}</p>
											<p class="text-sm text-gray-500">{app.parentFullName}</p>
											<p class="text-xs text-gray-400">{app.parentPhone}</p>
										</div>
									</td>
									<td class="px-6 py-4">
										<Badge variant="outline">{app.admissionPath.name}</Badge>
									</td>
									<td class="px-6 py-4">
										<div class="flex flex-col gap-1">
											<div class="flex items-center text-xs">
												<span class="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
												<span>{app.totalDocuments} Total</span>
											</div>
											{#if Number(app.pendingDocuments) > 0}
												<div class="flex items-center text-xs text-blue-600 font-medium">
													<span class="w-2 h-2 rounded-full bg-blue-500 mr-2 animate-pulse"
													></span>
													<span>{app.pendingDocuments} Pending</span>
												</div>
											{/if}
											{#if Number(app.rejectedDocuments) > 0}
												<div class="flex items-center text-xs text-red-600 font-medium">
													<span class="w-2 h-2 rounded-full bg-red-500 mr-2"></span>
													<span>{app.rejectedDocuments} Rejected</span>
												</div>
											{/if}
										</div>
									</td>
									<td class="px-6 py-4 text-sm text-gray-500">
										{formatDate(app.submittedAt)}
									</td>
									<td class="px-6 py-4">
										<Button
											variant="ghost"
											size="sm"
											onclick={() => handleViewApplication(app.id)}
										>
											<Eye class="w-4 h-4 mr-2" />
											View
										</Button>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
		</Card>
	</div>
</div>
