<script lang="ts">
	import type { PageData } from './$types';
    import StatsCard from '$lib/components/admin/StatsCard.svelte';
    import RecentTenantsTable from '$lib/components/admin/RecentTenantsTable.svelte';

	let { data } = $props<{ data: PageData }>();
    
    // Derived state for reactivity
    let stats = $derived(data.stats);
    let inactiveTenants = $derived(data.stats.tenants.total - data.stats.tenants.active);
</script>

<div class="space-y-6">
	<div class="flex justify-between items-center">
		<h1 class="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h1>
        <div class="text-sm text-gray-500 dark:text-gray-400">
            Last updated: {new Date().toLocaleTimeString()}
        </div>
	</div>

    <!-- Stats Grid -->
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- Total Schools -->
        <StatsCard 
            title="Total Schools" 
            value={stats.tenants.total} 
            subtitle="{stats.tenants.active} Active / {inactiveTenants} Inactive"
            iconColor="text-blue-600"
        >
            <span slot="icon">
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
            </span>
        </StatsCard>

        <!-- Total Users (Parents) -->
        <StatsCard 
            title="Total Parents" 
            value={stats.users.totalParents} 
            subtitle="Registered across all schools"
            iconColor="text-green-600"
        >
            <span slot="icon">
                <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            </span>
        </StatsCard>

        <!-- Total Transactions -->
        <StatsCard 
            title="Total Transactions" 
            value={stats.financial.totalTransactions} 
            subtitle="Successful payments"
            iconColor="text-purple-600"
        >
             <span slot="icon">
                <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
            </span>
        </StatsCard>

        <!-- Revenue (Formatted) -->
        <StatsCard 
            title="Total Revenue" 
            value={new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(stats.financial.totalRevenue)} 
            subtitle="Gross volume"
            iconColor="text-yellow-600"
        >
            <span slot="icon">
                <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </span>
        </StatsCard>
	</div>

    <!-- Recent Activity Section -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Main Table (2/3 width) -->
        <div class="lg:col-span-2">
            <RecentTenantsTable tenants={stats.tenants.list} />
        </div>

        <!-- Quick Actions / System Health (1/3 width) -->
        <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">System Health</h3>
            <div class="space-y-4">
                <div class="flex items-center justify-between">
                    <span class="text-sm text-gray-600 dark:text-gray-400">Database Status</span>
                    <span class="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Operational</span>
                </div>
                <div class="flex items-center justify-between">
                    <span class="text-sm text-gray-600 dark:text-gray-400">Storage Usage</span>
                    <span class="text-sm font-medium text-gray-900 dark:text-white">45%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                    <div class="bg-blue-600 h-2.5 rounded-full" style="width: 45%"></div>
                </div>
                
                 <div class="flex items-center justify-between mt-4">
                    <span class="text-sm text-gray-600 dark:text-gray-400">Last Backup</span>
                    <span class="text-sm font-medium text-gray-900 dark:text-white">2 hours ago</span>
                </div>
            </div>

            <div class="mt-8">
                <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Quick Actions</h3>
                <div class="space-y-2">
                    <a href="/admin/register" class="block w-full text-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        Add New School
                    </a>
                    <button class="block w-full text-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                        View System Logs
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>
