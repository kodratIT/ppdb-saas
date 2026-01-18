<script lang="ts">
	import { Search, Bell, User, ChevronDown } from 'lucide-svelte';

	let { breadcrumbs = [{ label: 'Dashboard', href: '/admin' }] } = $props();
</script>

<header
	class="flex h-16 items-center justify-between border-b bg-white px-8 shadow-sm dark:bg-slate-900"
>
	<div class="flex items-center gap-4">
		<nav class="flex items-center text-sm font-medium text-slate-500 dark:text-slate-400">
			{#each breadcrumbs as crumb, i}
				{#if i > 0}
					<span class="mx-2">/</span>
				{/if}
				<a
					href={crumb.href}
					class="transition-colors hover:text-slate-900 dark:hover:text-slate-100"
					class:text-slate-900={i === breadcrumbs.length - 1}
					class:dark:text-slate-100={i === breadcrumbs.length - 1}
				>
					{crumb.label}
				</a>
			{/each}
		</nav>
	</div>

	<div class="flex flex-1 items-center justify-center px-8">
		<div class="relative w-full max-w-md">
			<Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
			<input
				type="text"
				placeholder="Search anything..."
				class="h-10 w-full rounded-full border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm transition-all focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-800 dark:bg-slate-800 dark:focus:bg-slate-900"
			/>
		</div>
	</div>

	<div class="flex items-center gap-4">
		<button
			class="relative flex h-10 w-10 items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
		>
			<Bell class="h-5 w-5 text-slate-600 dark:text-slate-400" />
			<span class="absolute right-2.5 top-2.5 flex h-2 w-2">
				<span
					class="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"
				></span>
				<span class="relative inline-flex h-2 w-2 rounded-full bg-blue-500"></span>
			</span>
		</button>

		<div class="h-8 w-px bg-slate-200 dark:bg-slate-800"></div>

		<button
			class="flex items-center gap-3 rounded-lg p-1 hover:bg-slate-100 dark:hover:bg-slate-800"
		>
			<div
				class="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
			>
				<User class="h-5 w-5" />
			</div>
			<div class="hidden text-left sm:block">
				<p class="text-xs font-semibold text-slate-900 dark:text-slate-100">Super Admin</p>
				<p class="text-[10px] text-slate-500">System Control</p>
			</div>
			<ChevronDown class="h-4 w-4 text-slate-400" />
		</button>
	</div>
</header>
