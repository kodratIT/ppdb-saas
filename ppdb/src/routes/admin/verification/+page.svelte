<script lang="ts">
	/* eslint-disable svelte/require-each-key */
	/* eslint-disable svelte/no-navigation-without-resolve */
	import type { PageData } from './$types';
	import Badge from '$lib/components/ui/badge.svelte';

	let { data }: { data: PageData } = $props();
</script>

<div class="container mx-auto py-6 space-y-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold text-gray-900">Verification Queue</h1>
			<p class="text-gray-600 mt-1">Review and verify applicant documents</p>
		</div>
	</div>

	<div class="bg-white shadow-md rounded-lg overflow-hidden">
		{#if data.queue.length === 0}
			<div class="py-12 text-center text-gray-500">
				<p>No applications pending verification.</p>
			</div>
		{:else}
			<table class="w-full text-left border-collapse">
				<thead>
					<tr class="bg-gray-50 border-b border-gray-200">
						<th class="px-6 py-4 font-semibold text-gray-700">Date</th>
						<th class="px-6 py-4 font-semibold text-gray-700">Applicant</th>
						<th class="px-6 py-4 font-semibold text-gray-700">Path</th>
						<th class="px-6 py-4 font-semibold text-gray-700">Status</th>
						<th class="px-6 py-4 font-semibold text-gray-700">Documents</th>
						<th class="px-6 py-4 font-semibold text-gray-700 text-right">Action</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-200">
					{#each data.queue as app}
						<tr class="hover:bg-gray-50">
							<td class="px-6 py-4 text-sm text-gray-600">
								{new Date(app.submittedAt || app.updatedAt).toLocaleDateString()}
							</td>
							<td class="px-6 py-4">
								<div class="font-medium text-gray-900">{app.childFullName}</div>
								<div class="text-xs text-gray-500">{app.parentFullName}</div>
							</td>
							<td class="px-6 py-4 text-sm text-gray-600">
								{app.admissionPath.name}
							</td>
							<td class="px-6 py-4">
								<Badge variant="outline">{app.status}</Badge>
							</td>
							<td class="px-6 py-4 text-sm text-gray-600">
								{app.uploadedDocuments.length} docs
								<span class="text-xs text-gray-400">
									({app.uploadedDocuments.filter((d) => d.status === 'verified').length} verified)
								</span>
							</td>
							<td class="px-6 py-4 text-right">
								<a
									href="/admin/verification/{app.id}"
									class="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition"
								>
									Verify
								</a>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		{/if}
	</div>
</div>
