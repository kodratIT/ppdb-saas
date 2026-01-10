<script lang="ts">
	import type { PageData, ActionData } from './$types';

	let { data, form } = $props<{ data: PageData; form: ActionData }>();
</script>

<div class="container mx-auto p-8">
	<div class="flex justify-between items-center mb-8">
		<h1 class="text-3xl font-bold text-[#002C5F]">Super Admin Dashboard</h1>
		<form method="POST" action="?/signout">
			<button
				type="submit"
				class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
			>
				Sign Out
			</button>
		</form>
	</div>

	<div class="grid grid-cols-1 md:grid-cols-2 gap-8">
		<!-- Create Tenant Form -->
		<div class="bg-white p-6 rounded-lg shadow-md border">
			<h2 class="text-xl font-semibold mb-4">Register New School</h2>
			<form method="POST" action="?/create" class="space-y-4">
				<div>
					<label for="name" class="block text-sm font-medium text-gray-700">School Name</label>
					<input
						type="text"
						name="name"
						id="name"
						class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
						placeholder="SMA Harapan Bangsa"
						required
					/>
				</div>
				<div>
					<label for="slug" class="block text-sm font-medium text-gray-700">Subdomain Slug</label>
					<div class="mt-1 flex rounded-md shadow-sm">
						<input
							type="text"
							name="slug"
							id="slug"
							class="block w-full min-w-0 flex-1 rounded-none rounded-l-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
							placeholder="harapan-bangsa"
							required
						/>
						<span
							class="inline-flex items-center rounded-r-md border border-l-0 border-gray-300 bg-gray-50 px-3 text-gray-500 sm:text-sm"
						>
							.ppdb.id
						</span>
					</div>
				</div>

				{#if form?.message}
					<div class="text-red-600 text-sm">{form.message}</div>
				{/if}

				<button
					type="submit"
					class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#002C5F] hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
				>
					Create Tenant
				</button>
			</form>
		</div>

		<!-- Tenant List -->
		<div class="bg-white p-6 rounded-lg shadow-md border">
			<h2 class="text-xl font-semibold mb-4">Registered Schools</h2>
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
							</tr>
						{/each}
						{#if data.tenants.length === 0}
							<tr>
								<td colspan="3" class="px-6 py-4 text-center text-gray-500 text-sm"
									>No tenants registered yet.</td
								>
							</tr>
						{/if}
					</tbody>
				</table>
			</div>
		</div>
	</div>
</div>
