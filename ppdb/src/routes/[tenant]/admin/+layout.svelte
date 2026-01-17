<script lang="ts">
	/* eslint-disable svelte/no-navigation-without-resolve */
	import { page } from '$app/stores';
	import {
		LayoutDashboard,
		FileCheck,
		Trophy,
		CreditCard,
		Settings,
		Users,
		LogOut,
		School,
		Menu
	} from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	// Replaced Sheet with custom implementation since component is missing
	// import { Sheet, SheetContent, SheetTrigger } from '$lib/components/ui/sheet';
	import { fly } from 'svelte/transition';

	let { children } = $props();

	const sidebarItems = [
		{
			title: 'Dashboard',
			href: `/${$page.params.tenant}/admin`,
			icon: LayoutDashboard
		},
		{
			title: 'Verification',
			href: `/${$page.params.tenant}/admin/verify`,
			icon: FileCheck
		},
		{
			title: 'Ranking',
			href: `/${$page.params.tenant}/admin/ranking`,
			icon: Trophy
		},
		{
			title: 'Finance',
			href: `/${$page.params.tenant}/admin/finance`,
			icon: CreditCard
		}
	];

	const settingsItems = [
		{
			title: 'Admission Paths',
			href: `/${$page.params.tenant}/admin/settings/admission-paths`,
			icon: School
		},
		{
			title: 'Fee Structures',
			href: `/${$page.params.tenant}/admin/settings/fee-structures`,
			icon: CreditCard
		},
		{
			title: 'School Admins',
			href: `/${$page.params.tenant}/admin/settings/school-admins`,
			icon: Users
		},
		{
			title: 'Payment Config',
			href: `/${$page.params.tenant}/admin/settings/payments`,
			icon: Settings
		},
		{
			title: 'Audit Logs',
			href: `/${$page.params.tenant}/admin/settings/audit-logs`,
			icon: FileCheck
		}
	];

	let isSidebarOpen = $state(false);
</script>

<div class="min-h-screen bg-gray-50 flex flex-col md:flex-row">
	<!-- Mobile Header -->
	<header
		class="md:hidden bg-white border-b p-4 flex items-center justify-between sticky top-0 z-50"
	>
		<span class="font-bold text-lg text-[#002C5F]">School Admin</span>
		<Button variant="ghost" size="icon" onclick={() => (isSidebarOpen = !isSidebarOpen)}>
			<Menu class="h-6 w-6" />
		</Button>
	</header>

	<!-- Mobile Sidebar Overlay -->
	{#if isSidebarOpen}
		<div
			class="fixed inset-0 bg-black/50 z-40 md:hidden"
			onclick={() => (isSidebarOpen = false)}
			aria-hidden="true"
		></div>
		<div
			class="fixed inset-y-0 left-0 w-64 bg-white z-50 border-r shadow-lg md:hidden"
			transition:fly={{ x: -264, duration: 300 }}
		>
			<div class="h-full flex flex-col">
				<div class="p-6 border-b flex justify-between items-center">
					<span class="text-xl font-bold text-[#002C5F]">PPDB Admin</span>
					<button onclick={() => (isSidebarOpen = false)}>
						<LogOut class="h-5 w-5 text-gray-500" />
					</button>
				</div>
				<nav class="flex-1 overflow-y-auto py-4">
					<div class="px-4 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
						Main
					</div>
					<ul class="space-y-1 px-2 mb-6">
						{#each sidebarItems as item (item.title)}
							<li>
								<a
									href={item.href}
									class="flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-md transition-colors
										{$page.url.pathname === item.href ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}"
									onclick={() => (isSidebarOpen = false)}
								>
									<item.icon class="h-5 w-5" />
									{item.title}
								</a>
							</li>
						{/each}
					</ul>

					<div class="px-4 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
						Settings
					</div>
					<ul class="space-y-1 px-2">
						{#each settingsItems as item (item.title)}
							<li>
								<a
									href={item.href}
									class="flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-md transition-colors
										{$page.url.pathname === item.href ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}"
									onclick={() => (isSidebarOpen = false)}
								>
									<item.icon class="h-5 w-5" />
									{item.title}
								</a>
							</li>
						{/each}
					</ul>
				</nav>
				<div class="p-4 border-t">
					<form method="POST" action="/sign-in?/signout">
						<button
							type="submit"
							class="flex w-full items-center gap-3 px-4 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-50"
						>
							<LogOut class="h-5 w-5" />
							Sign Out
						</button>
					</form>
				</div>
			</div>
		</div>
	{/if}

	<!-- Desktop Sidebar -->
	<aside class="hidden md:flex flex-col w-64 bg-white border-r h-screen sticky top-0">
		<div class="p-6 border-b">
			<span class="text-xl font-bold text-[#002C5F]">PPDB Admin</span>
		</div>
		<nav class="flex-1 overflow-y-auto py-4">
			<div class="px-4 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Main</div>
			<ul class="space-y-1 px-2 mb-6">
				{#each sidebarItems as item (item.title)}
					<li>
						<a
							href={item.href}
							class="flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-md transition-colors
								{$page.url.pathname === item.href ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}"
						>
							<item.icon class="h-5 w-5" />
							{item.title}
						</a>
					</li>
				{/each}
			</ul>

			<div class="px-4 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
				Settings
			</div>
			<ul class="space-y-1 px-2">
				{#each settingsItems as item (item.title)}
					<li>
						<a
							href={item.href}
							class="flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-md transition-colors
								{$page.url.pathname === item.href ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}"
						>
							<item.icon class="h-5 w-5" />
							{item.title}
						</a>
					</li>
				{/each}
			</ul>
		</nav>
		<div class="p-4 border-t">
			<form method="POST" action="/sign-in?/signout">
				<button
					type="submit"
					class="flex w-full items-center gap-3 px-4 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-50"
				>
					<LogOut class="h-5 w-5" />
					Sign Out
				</button>
			</form>
		</div>
	</aside>

	<!-- Main Content -->
	<main class="flex-1 p-6 overflow-y-auto h-[calc(100vh-64px)] md:h-screen">
		<div class="max-w-6xl mx-auto">
			{@render children()}
		</div>
	</main>
</div>
