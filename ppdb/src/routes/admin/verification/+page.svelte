<script lang="ts">
	/* eslint-disable svelte/require-each-key */
	/* eslint-disable svelte/no-navigation-without-resolve */
	import type { PageData } from './$types';
	import Badge from '$lib/components/ui/badge.svelte';
	import * as Select from '$lib/components/ui/select';
	import { goto } from '$app/navigation';

	let { data }: { data: PageData } = $props();

	let selectedUnitLabel = $derived(
		data.units.find((u: any) => u.id === data.selectedUnitId)?.name || 'Semua Unit'
	);

	function handleUnitChange(value: string | undefined) {
		if (!value) return;
		const url = new URL(window.location.href);
		if (value === 'all') {
			url.searchParams.delete('unit_id');
		} else {
			url.searchParams.set('unit_id', value);
		}
		goto(url.toString());
	}
</script>

<div class="container mx-auto py-6 space-y-6">
	<div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
		<div>
			<h1 class="text-3xl font-bold text-gray-900">Verification Queue</h1>
			<p class="text-gray-600 mt-1">Review and verify applicant documents</p>
		</div>

		<div class="flex items-center gap-2">
			<span class="text-sm font-medium text-gray-700 whitespace-nowrap">Filter Unit:</span>
			<Select.Root type="single" value={data.selectedUnitId} onValueChange={handleUnitChange}>
				<Select.Trigger class="w-[200px]">
					{selectedUnitLabel}
				</Select.Trigger>
				<Select.Content>
					<Select.Item value="all">Semua Unit</Select.Item>
					{#each data.units as unit}
						<Select.Item value={unit.id}>{unit.name}</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
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
