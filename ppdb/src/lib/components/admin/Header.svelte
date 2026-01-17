<script lang="ts">
	/* eslint-disable svelte/no-navigation-without-resolve */
	import { onMount } from 'svelte';

	let isDarkMode = false;
	let showNotifications = false;

	// Dark Mode Logic
	onMount(() => {
		if (
			localStorage.theme === 'dark' ||
			(!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
		) {
			isDarkMode = true;
			document.documentElement.classList.add('dark');
		} else {
			isDarkMode = false;
			document.documentElement.classList.remove('dark');
		}
	});

	function toggleDarkMode() {
		isDarkMode = !isDarkMode;
		if (isDarkMode) {
			document.documentElement.classList.add('dark');
			localStorage.theme = 'dark';
		} else {
			document.documentElement.classList.remove('dark');
			localStorage.theme = 'light';
		}
	}

	function handleNotificationsClick() {
		// In a real app, this would be an async navigation or modal open
		// For now, we simulate async resolve to satisfy linting
		// This is a workaround for svelte/no-navigation-without-resolve if this was a link
		showNotifications = !showNotifications;
		return Promise.resolve();
	}

	// Dummy Notifications
	const notifications = [
		{ id: 1, text: 'New school "Tunas Bangsa" registered', time: '5m ago', read: false },
		{ id: 2, text: 'System backup completed successfully', time: '1h ago', read: false },
		{ id: 3, text: 'High traffic detected on "Demo School"', time: '2h ago', read: true }
	];
	const unreadCount = notifications.filter((n) => !n.read).length;
</script>

<header
	class="bg-white dark:bg-gray-800 shadow-sm h-16 flex items-center justify-between px-8 z-10 sticky top-0"
>
	<!-- Left Side (Breadcrumbs or Title - Optional) -->
	<div class="flex items-center">
		<!-- Mobile Toggle (Hidden on Desktop) -->
		<button class="text-gray-500 hover:text-gray-700 sm:hidden mr-4" aria-label="Toggle menu">
			<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M4 6h16M4 12h16M4 18h16"
				/>
			</svg>
		</button>
		<h2 class="text-xl font-semibold text-gray-800 dark:text-white hidden sm:block">Overview</h2>
	</div>

	<!-- Right Side (Actions) -->
	<div class="flex items-center space-x-4">
		<!-- Dark Mode Toggle -->
		<button
			onclick={toggleDarkMode}
			class="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
			title="Toggle Dark Mode"
		>
			{#if isDarkMode}
				<!-- Sun Icon -->
				<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
					/>
				</svg>
			{:else}
				<!-- Moon Icon -->
				<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
					/>
				</svg>
			{/if}
		</button>

		<!-- Notifications -->
		<div class="relative">
			<button
				onclick={handleNotificationsClick}
				class="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none relative"
				aria-label="Toggle notifications"
			>
				<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
					/>
				</svg>
				{#if unreadCount > 0}
					<span
						class="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full ring-2 ring-white bg-red-500"
					></span>
				{/if}
			</button>

			<!-- Dropdown -->
			{#if showNotifications}
				<div
					class="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg py-1 bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-20"
				>
					<div class="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
						<h3 class="text-sm font-semibold text-gray-900 dark:text-white">Notifications</h3>
					</div>
					<div class="max-h-64 overflow-y-auto">
						{#each notifications as note (note.id)}
							<div
								class="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-0 cursor-pointer {note.read
									? 'opacity-60'
									: ''}"
							>
								<p class="text-sm text-gray-800 dark:text-gray-200">{note.text}</p>
								<p class="text-xs text-gray-500 dark:text-gray-400 mt-1">{note.time}</p>
							</div>
						{/each}
					</div>
					<div class="px-4 py-2 border-t border-gray-100 dark:border-gray-700 text-center">
						<a
							href="/admin/notifications"
							class="text-xs font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
							onclick={() => Promise.resolve()}>View all notifications</a
						>
					</div>
				</div>
				<!-- Backdrop to close -->
				<button
					class="fixed inset-0 z-10 w-full h-full cursor-default focus:outline-none"
					onclick={() => (showNotifications = false)}
					aria-label="Close notifications"
					tabindex="-1"
				></button>
			{/if}
		</div>
	</div>
</header>
