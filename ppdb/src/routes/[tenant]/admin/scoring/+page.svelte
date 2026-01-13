<script lang="ts">
	import { goto } from '$app/navigation';
	import Card from '$lib/components/ui/card.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import Badge from '$lib/components/ui/badge.svelte';
	import { FileCheck, Clock, CheckCircle2, XCircle, Search, Filter } from 'lucide-svelte';

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
					app.parentFullName?.toLowerCase().includes(query)
			);
		}

		// Status filter
		if (statusFilter === 'not_scored') {
			filtered = filtered.filter((app: any) => !app.scoreId);
		} else if (statusFilter === 'draft') {
			filtered = filtered.filter((app: any) => app.scoreId && !app.isFinalized);
		} else if (statusFilter === 'finalized') {
			filtered = filtered.filter((app: any) => app.isFinalized);
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

	function handleScore(applicationId: string) {
		goto(`/${data.tenantSlug}/admin/scoring/${applicationId}`);
	}
</script>

<svelte:head>
	<title>Scoring Dashboard</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8 px-4">
	<div class="max-w-7xl mx-auto">
		<div class="mb-8">
			<h1 class="text-3xl font-bold text-gray-900">Candidate Scoring</h1>
			<p class="text-gray-600 mt-1">Review and score verified candidates</p>
		</div>

		<!-- Stats Cards -->
		<div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
			<Card class="p-4">
				<div class="flex items-center gap-3">
					<div class="p-2 bg-blue-100 rounded-lg">
						<FileCheck class="w-6 h-6 text-blue-600" />
					</div>
					<div>
						<p class="text-2xl font-bold text-gray-900">{data.stats.totalVerified}</p>
						<p class="text-sm text-gray-500">Total Verified</p>
					</div>
				</div>
			</Card>

			<Card class="p-4">
				<div class="flex items-center gap-3">
					<div class="p-2 bg-yellow-100 rounded-lg">
						<XCircle class="w-6 h-6 text-yellow-600" />
					</div>
					<div>
						<p class="text-2xl font-bold text-gray-900">{data.stats.notScored}</p>
						<p class="text-sm text-gray-500">Not Scored</p>
					</div>
				</div>
			</Card>

			<Card class="p-4">
				<div class="flex items-center gap-3">
					<div class="p-2 bg-orange-100 rounded-lg">
						<Clock class="w-6 h-6 text-orange-600" />
					</div>
					<div>
						<p class="text-2xl font-bold text-gray-900">{data.stats.scoredDraft}</p>
						<p class="text-sm text-gray-500">Draft Scores</p>
					</div>
				</div>
			</Card>

			<Card class="p-4">
				<div class="flex items-center gap-3">
					<div class="p-2 bg-green-100 rounded-lg">
						<CheckCircle2 class="w-6 h-6 text-green-600" />
					</div>
					<div>
						<p class="text-2xl font-bold text-gray-900">{data.stats.scoredFinalized}</p>
						<p class="text-sm text-gray-500">Finalized</p>
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
							placeholder="Search by name..."
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
						<option value="all">All Candidates</option>
						<option value="not_scored">Not Scored</option>
						<option value="draft">Draft Scores</option>
						<option value="finalized">Finalized</option>
					</select>
				</div>
			</div>
		</Card>

		<!-- Applications Table -->
		<Card class="overflow-hidden">
			{#if filteredApplications().length === 0}
				<div class="text-center py-12">
					<FileCheck class="w-16 h-16 mx-auto text-gray-300 mb-4" />
					<h3 class="text-lg font-medium text-gray-600 mb-2">No candidates found</h3>
					<p class="text-gray-500">
						{searchQuery || statusFilter !== 'all'
							? 'Try adjusting your filters'
							: 'No verified candidates yet'}
					</p>
				</div>
			{:else}
				<div class="overflow-x-auto">
					<table class="w-full">
						<thead class="bg-gray-50 border-b">
							<tr>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
									>Candidate</th
								>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
									>Admission Path</th
								>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
									>Score Status</th
								>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
									>Verified Date</th
								>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
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
										</div>
									</td>
									<td class="px-6 py-4">
										<span class="text-sm text-gray-900">{app.admissionPathName || 'N/A'}</span>
									</td>
									<td class="px-6 py-4">
										{#if app.isFinalized}
											<Badge variant="default">
												<CheckCircle2 class="w-3 h-3 mr-1" />
												Finalized ({app.score})
											</Badge>
										{:else if app.scoreId}
											<Badge variant="secondary">
												<Clock class="w-3 h-3 mr-1" />
												Draft ({app.score})
											</Badge>
										{:else}
											<Badge variant="secondary">
												<XCircle class="w-3 h-3 mr-1" />
												Not Scored
											</Badge>
										{/if}
									</td>
									<td class="px-6 py-4">
										<span class="text-sm text-gray-900">{formatDate(app.submittedAt)}</span>
									</td>
									<td class="px-6 py-4">
										<Button
											size="sm"
											onclick={() => handleScore(app.id)}
											class="bg-blue-600 hover:bg-blue-700"
										>
											{app.scoreId ? 'Edit Score' : 'Score Now'}
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
