<script lang="ts">
	import type { ActionData } from './$types';
	import { fade } from 'svelte/transition';

	let { form } = $props<{ form: ActionData }>();

	// Simple client-side state for button loading (optional enhancement)
	let isSubmitting = $state(false);

	function handleSubmit() {
		isSubmitting = true;
		// In a real app, use use:enhance to reset this if validation fails client-side or after response
		setTimeout(() => (isSubmitting = false), 2000); // Fallback reset
	}
</script>

<div class="max-w-3xl mx-auto">
	<!-- Header Section -->
	<div class="mb-8">
		<h1 class="text-2xl font-bold text-gray-900 dark:text-white">Register New School</h1>
		<p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
			Create a new tenant environment and assign a dedicated School Admin.
		</p>
	</div>

	<div
		class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden"
	>
		<!-- Progress Steps (Visual only for now) -->
		<div
			class="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between"
		>
			<div class="flex items-center space-x-2">
				<span
					class="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 text-xs font-medium text-blue-600 dark:text-blue-300"
					>1</span
				>
				<span class="text-sm font-medium text-gray-900 dark:text-white">School Details</span>
			</div>
			<div class="h-0.5 w-12 bg-gray-200 dark:bg-gray-600"></div>
			<div class="flex items-center space-x-2">
				<span
					class="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-600 text-xs font-medium text-gray-500 dark:text-gray-300"
					>2</span
				>
				<span class="text-sm font-medium text-gray-500 dark:text-gray-400">Admin Account</span>
			</div>
		</div>

		<form method="POST" action="?/create" class="p-6 space-y-6" onsubmit={handleSubmit}>
			<!-- School Details Section -->
			<div class="space-y-4">
				<h3
					class="text-lg font-medium text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-2"
				>
					Organization Info
				</h3>

				<div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
					<div class="sm:col-span-2">
						<label for="name" class="block text-sm font-medium text-gray-700 dark:text-gray-300"
							>School Name</label
						>
						<div class="mt-1 relative rounded-md shadow-sm">
							<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
								<svg
									class="h-5 w-5 text-gray-400"
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
							</div>
							<input
								type="text"
								name="name"
								id="name"
								class="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md p-2.5 border"
								placeholder="e.g. SMA Harapan Bangsa"
								required
							/>
						</div>
					</div>

					<div class="sm:col-span-2">
						<label for="slug" class="block text-sm font-medium text-gray-700 dark:text-gray-300"
							>Subdomain Slug</label
						>
						<div class="mt-1 flex rounded-md shadow-sm">
							<span
								class="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 sm:text-sm"
							>
								https://
							</span>
							<input
								type="text"
								name="slug"
								id="slug"
								class="flex-1 min-w-0 block w-full px-3 py-2 rounded-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white border"
								placeholder="school-name"
								required
							/>
							<span
								class="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 sm:text-sm"
							>
								.ppdb.id
							</span>
						</div>
						<p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
							Only lowercase letters, numbers, and hyphens.
						</p>
					</div>
				</div>
			</div>

			<!-- Admin Account Section -->
			<div class="space-y-4 pt-4">
				<h3
					class="text-lg font-medium text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-2"
				>
					Super Admin Account
				</h3>

				<div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
					<div class="sm:col-span-2">
						<label
							for="adminEmail"
							class="block text-sm font-medium text-gray-700 dark:text-gray-300"
							>Email Address</label
						>
						<div class="mt-1 relative rounded-md shadow-sm">
							<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
								<svg
									class="h-5 w-5 text-gray-400"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
									/>
								</svg>
							</div>
							<input
								type="email"
								name="adminEmail"
								id="adminEmail"
								class="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md p-2.5 border"
								placeholder="admin@school.sch.id"
								required
							/>
						</div>
					</div>

					<div class="sm:col-span-2">
						<label
							for="adminPassword"
							class="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label
						>
						<div class="mt-1 relative rounded-md shadow-sm">
							<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
								<svg
									class="h-5 w-5 text-gray-400"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
									/>
								</svg>
							</div>
							<input
								type="password"
								name="adminPassword"
								id="adminPassword"
								class="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md p-2.5 border"
								placeholder="Minimum 6 characters"
								minlength="6"
								required
							/>
						</div>
					</div>
				</div>
			</div>

			{#if form?.message}
				<div
					transition:fade
					class="rounded-md bg-red-50 dark:bg-red-900/30 p-4 border border-red-200 dark:border-red-800"
				>
					<div class="flex">
						<div class="flex-shrink-0">
							<svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
								<path
									fill-rule="evenodd"
									d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
									clip-rule="evenodd"
								/>
							</svg>
						</div>
						<div class="ml-3">
							<h3 class="text-sm font-medium text-red-800 dark:text-red-200">
								Registration Failed
							</h3>
							<div class="mt-2 text-sm text-red-700 dark:text-red-300">
								<p>{form.message}</p>
							</div>
						</div>
					</div>
				</div>
			{/if}

			{#if form?.success}
				<div
					transition:fade
					class="rounded-md bg-green-50 dark:bg-green-900/30 p-4 border border-green-200 dark:border-green-800"
				>
					<div class="flex">
						<div class="flex-shrink-0">
							<svg class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
								<path
									fill-rule="evenodd"
									d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
									clip-rule="evenodd"
								/>
							</svg>
						</div>
						<div class="ml-3">
							<h3 class="text-sm font-medium text-green-800 dark:text-green-200">
								Registration Successful
							</h3>
							<div class="mt-2 text-sm text-green-700 dark:text-green-300">
								<p>School has been created. You can now login with the admin credentials.</p>
							</div>
						</div>
					</div>
				</div>
			{/if}

			<div class="pt-4 flex items-center justify-end border-t border-gray-100 dark:border-gray-700">
				<button
					type="button"
					class="mr-3 px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
				>
					Cancel
				</button>
				<button
					type="submit"
					disabled={isSubmitting}
					class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
				>
					{#if isSubmitting}
						<svg
							class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
						>
							<circle
								class="opacity-25"
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								stroke-width="4"
							></circle>
							<path
								class="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
							></path>
						</svg>
						Creating...
					{:else}
						Create Tenant
					{/if}
				</button>
			</div>
		</form>
	</div>
</div>
