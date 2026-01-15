<script lang="ts">
	import type { PageData } from './$types';

	let { data } = $props<{ data: PageData }>();
</script>

<div class="container mx-auto p-8">
	<div class="flex justify-between items-center mb-6">
		<h1 class="text-2xl font-bold text-[#002C5F]">Registered Schools</h1>
	</div>

	<div class="bg-white p-6 rounded-lg shadow-md border">
		<div class="overflow-x-auto">
			<table class="min-w-full divide-y divide-gray-200">
				<thead class="bg-gray-50">
					<tr>
						<th
							scope="col"
							class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
							>Name</th
						>
						<th
							scope="col"
							class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
							>Subdomain</th
						>
						<th
							scope="col"
							class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
							>Status</th
						>
						<th
							scope="col"
							class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
							>Actions</th
						>
					</tr>
				</thead>
				<tbody class="bg-white divide-y divide-gray-200">
					{#each data.tenants as tenant}
						<tr>
							<td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900"
								>{tenant.name}</td
							>
							<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
								>{tenant.slug}.ppdb.id</td
							>
							<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
								<span
									class={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${tenant.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
								>
									{tenant.status}
								</span>
							</td>
							<td class="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
								<a
									href={`/${tenant.slug}/admin`}
									class="inline-flex items-center px-3 py-1 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 text-xs font-medium"
								>
									Open Admin
								</a>
							</td>
						</tr>
					{/each}
					{#if data.tenants.length === 0}
						<tr>
							<td colspan="4" class="px-6 py-4 text-center text-gray-500 text-sm"
								>No tenants registered yet.</td
							>
						</tr>
					{/if}
				</tbody>
			</table>
		</div>
	</div>
</div>

