<script lang="ts">
	// Define type manually to avoid importing server-only schema in client component
	interface Tenant {
		id: string;
		name: string;
		slug: string;
		status: 'active' | 'inactive';
		createdAt: Date;
		updatedAt: Date;
	}

	export let tenants: Tenant[] = [];
</script>

<div class="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
	<div class="px-6 py-5 border-b border-gray-100 dark:border-gray-700">
		<h3 class="text-lg font-medium leading-6 text-gray-900 dark:text-white">Recent Registrations</h3>
	</div>
	<div class="overflow-x-auto">
		<table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
			<thead class="bg-gray-50 dark:bg-gray-700">
				<tr>
					<th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
						School Name
					</th>
					<th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
						Subdomain
					</th>
					<th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
						Status
					</th>
					<th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
						Joined Date
					</th>
				</tr>
			</thead>
			<tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
				{#each tenants as tenant}
					<tr class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
						<td class="px-6 py-4 whitespace-nowrap">
							<div class="text-sm font-medium text-gray-900 dark:text-white">{tenant.name}</div>
						</td>
						<td class="px-6 py-4 whitespace-nowrap">
							<div class="text-sm text-gray-500 dark:text-gray-400">{tenant.slug}.ppdb.com</div>
						</td>
						<td class="px-6 py-4 whitespace-nowrap">
							<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full {tenant.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}">
								{tenant.status}
							</span>
						</td>
						<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
							{new Date(tenant.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
						</td>
					</tr>
				{/each}
				{#if tenants.length === 0}
					<tr>
						<td colspan="4" class="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
							No recent registrations found.
						</td>
					</tr>
				{/if}
			</tbody>
		</table>
	</div>
    <div class="px-6 py-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-right">
        <a href="/admin/schools" class="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">View all schools &rarr;</a>
    </div>
</div>
