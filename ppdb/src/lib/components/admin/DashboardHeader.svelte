<script lang="ts">
	import { EyeOff } from 'lucide-svelte';
	import { page } from '$app/state';
	import AdminSearch from './AdminSearch.svelte';
	import AdminNotification from './AdminNotification.svelte';
	import AdminUserMenu from './AdminUserMenu.svelte';
	import AdminBreadcrumb from './AdminBreadcrumb.svelte';
	import { Button } from '$lib/components/ui/button';
	import { cn } from '$lib/utils';
	import { i18n } from '$lib/i18n/index.svelte';
	import LanguageSwitcher from '$lib/components/ui/language-switcher.svelte';

	interface BreadcrumbItem {
		label: string;
		href?: string;
	}

	let { breadcrumbs = [{ label: i18n.t('nav.dashboard'), href: '/admin' }] } = $props();

	// Check if impersonating
	let isImpersonating = $derived(page.data?.isImpersonating);
	let user = $derived(page.data?.session?.user || { name: 'Super Admin', role: 'System Control' });

	let searchQuery = $state('');

	function handleSearch(value: string) {
		console.log('Searching for:', value);
		// Implement search logic here
	}

	let signOutForm: HTMLFormElement;

	function handleSignOut() {
		signOutForm?.submit();
	}
</script>

<form action="/admin/sign-out" method="POST" bind:this={signOutForm} class="hidden"></form>

<header
	class={cn(
		'sticky top-0 z-30 flex h-16 items-center justify-between px-4 sm:px-8 transition-all duration-300 bg-white/70 backdrop-blur-md border-b border-slate-200 shadow-sm',
		isImpersonating ? 'border-b-amber-500/50 bg-amber-50/20' : ''
	)}
>
	<div class="flex items-center gap-6">
		{#if isImpersonating}
			<form action="/admin/impersonate/stop" method="POST" class="hidden sm:block">
				<Button
					type="submit"
					variant="outline"
					size="sm"
					class="h-8 gap-2 rounded-full border-amber-500/20 bg-amber-500/10 text-[10px] font-bold uppercase tracking-wider text-amber-600 hover:bg-amber-500/20 transition-all dark:text-amber-400"
				>
					<EyeOff class="h-3 w-3" />
					{i18n.t('common.stopImpersonating' as any) || 'Stop Impersonating'}
				</Button>
			</form>
		{/if}

		<AdminBreadcrumb items={breadcrumbs} class="hidden lg:flex" />
	</div>

	<div class="flex flex-1 items-center justify-center px-4 max-w-2xl">
		<AdminSearch
			placeholder={i18n.t('common.search')}
			bind:value={searchQuery}
			onchange={handleSearch}
			class="max-w-md w-full bg-slate-100/50 border-slate-200 focus-within:border-blue-500/30 transition-all"
		/>
	</div>

	<div class="flex items-center gap-2 sm:gap-6">
		<LanguageSwitcher variant="dropdown" />

		<AdminNotification count={3} />

		<div class="h-8 w-px bg-border/40 hidden sm:block"></div>

		<AdminUserMenu
			userName={user.name}
			userRole={user.role}
			{isImpersonating}
			onSignOut={handleSignOut}
		/>
	</div>
</header>
