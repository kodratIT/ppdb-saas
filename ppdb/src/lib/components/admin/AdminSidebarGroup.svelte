<script lang="ts">
	import type { Component } from 'svelte';
	import AdminNavItem from './AdminNavItem.svelte';
	import { cn } from '$lib/utils';
	import { page } from '$app/state';

	interface NavItem {
		name: string;
		icon: Component;
		href: string;
		badge?: string | number;
	}

	interface Props {
		group: {
			name: string;
			items: NavItem[];
		};
		class?: string;
	}

	let { group, class: className }: Props = $props();
</script>

<div class={cn('mb-6', className)}>
	<h3 class="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400/80">
		{group.name}
	</h3>
	<div class="space-y-1">
		{#each group.items as item}
			{@const isActive = page.url.pathname === item.href}
			<AdminNavItem
				name={item.name}
				icon={item.icon}
				href={item.href}
				badge={item.badge}
				{isActive}
			/>
		{/each}
	</div>
</div>
