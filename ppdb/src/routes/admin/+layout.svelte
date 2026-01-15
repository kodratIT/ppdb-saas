<script lang="ts">
	import { page } from '$app/stores';
	import Header from '$lib/components/admin/Header.svelte';

	// Helper untuk mengecek apakah route aktif
	const isActive = (path: string) => $page.url.pathname === path;
</script>

<div class="flex min-h-screen bg-gray-50 dark:bg-gray-900">
	<!-- Sidebar -->
	<aside class="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col fixed h-full z-10 transition-colors duration-300">
		<!-- Sidebar Header -->
		<div class="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-700">
			<span class="text-xl font-bold text-[#002C5F] dark:text-blue-400">PPDB SaaS Admin</span>
		</div>

		<!-- Navigation Links -->
		<nav class="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
			<a
				href="/admin"
				class="group flex items-center px-3 py-2 text-sm font-medium rounded-md {isActive(
					'/admin'
				)
					? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
					: 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'}"
			>
				<!-- Icon Dashboard (Simple SVG) -->
				<svg
					class="mr-3 h-5 w-5 {isActive('/admin')
						? 'text-blue-500 dark:text-blue-400'
						: 'text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-300'}"
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
					/>
				</svg>
				Dashboard
			</a>

			<a
				href="/admin/register"
				class="group flex items-center px-3 py-2 text-sm font-medium rounded-md {isActive(
					'/admin/register'
				)
					? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
					: 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'}"
			>
				<!-- Icon Plus Circle -->
				<svg
					class="mr-3 h-5 w-5 {isActive('/admin/register')
						? 'text-blue-500 dark:text-blue-400'
						: 'text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-300'}"
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
				Register School
			</a>

			<a
				href="/admin/schools"
				class="group flex items-center px-3 py-2 text-sm font-medium rounded-md {isActive(
					'/admin/schools'
				)
					? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
					: 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'}"
			>
				<!-- Icon Office Building -->
				<svg
					class="mr-3 h-5 w-5 {isActive('/admin/schools')
						? 'text-blue-500 dark:text-blue-400'
						: 'text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-300'}"
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
					/>
				</svg>
				Schools
			</a>
		</nav>

		<!-- Sidebar Footer (User Profile & Logout) -->
		<div class="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800/50">
			<div class="flex items-center mb-3">
				<div class="flex-shrink-0">
					<span
						class="inline-block h-8 w-8 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center"
					>
						<svg
							class="h-5 w-5 text-gray-500 dark:text-gray-400"
							fill="currentColor"
							viewBox="0 0 20 20"
						>
							<path
								fill-rule="evenodd"
								d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
								clip-rule="evenodd"
							/>
						</svg>
					</span>
				</div>
				<div class="ml-3">
					<p class="text-sm font-medium text-gray-700 dark:text-gray-200">Super Admin</p>
					<p class="text-xs text-gray-500 dark:text-gray-400">System Administrator</p>
				</div>
			</div>
			<form method="POST" action="/admin?/signout">
				<button
					type="submit"
					class="w-full flex justify-center items-center px-4 py-2 text-sm font-medium text-red-700 dark:text-red-400 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 shadow-sm transition-colors"
				>
					<svg
						class="mr-2 h-4 w-4"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
						/>
					</svg>
					Sign Out
				</button>
			</form>
		</div>
	</aside>

	<!-- Main Content Wrapper -->
	<div class="flex-1 flex flex-col ml-64 transition-all duration-300">
		<!-- Top Header -->
		<Header />

		<!-- Main Content Area -->
		<main class="flex-1 overflow-y-auto p-8 bg-gray-50 dark:bg-gray-900">
			<slot />
		</main>
	</div>
</div>
