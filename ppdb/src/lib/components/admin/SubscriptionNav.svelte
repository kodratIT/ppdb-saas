<script lang="ts">
	import { page } from '$app/stores';
	import { i18n } from '$lib/i18n/index.svelte';
	import { cn } from '$lib/utils';

	const links = [
		{
			href: '/admin/subscription',
			label: 'admin.subscription.overview',
			exact: true
		},
		{
			href: '/admin/plans',
			label: 'admin.packages.title',
			exact: false
		},
		{
			href: '/admin/subscription/tenants',
			label: 'admin.tenants.title',
			exact: false
		},
		{
			href: '/admin/subscription/transactions',
			label: 'admin.transactions.title',
			exact: false
		}
	];

	function isActive(path: string, exact: boolean) {
		const currentPath = $page.url.pathname;
		if (exact) {
			return currentPath === path;
		}
		return currentPath.startsWith(path);
	}
</script>

<nav class="flex space-x-2 border-b mb-6 overflow-x-auto">
	{#each links as link}
		<a
			href={link.href}
			class={cn(
				'px-4 py-2 text-sm font-medium transition-colors border-b-2 whitespace-nowrap',
				isActive(link.href, link.exact)
					? 'border-primary text-primary'
					: 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted'
			)}
		>
			{i18n.t(link.label)}
		</a>
	{/each}
</nav>
