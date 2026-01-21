<script lang="ts">
	import type { Component } from 'svelte';
	import { cn } from '$lib/utils';
	import { Badge } from '$lib/components/ui/badge';

	interface Props {
		name: string;
		icon: Component;
		href: string;
		isActive?: boolean;
		badge?: string | number;
		class?: string;
	}

	let { name, icon: Icon, href, isActive = false, badge, class: className }: Props = $props();
</script>

<a
	{href}
	class={cn(
		'group relative flex items-center justify-between rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-300',
		isActive
			? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
			: 'text-slate-400 hover:bg-white/5 hover:text-slate-50',
		className
	)}
>
	{#if isActive}
		<div
			class="absolute left-0 top-2.5 bottom-2.5 w-1 bg-white rounded-full transition-all duration-500"
		></div>
	{/if}

	<div class="flex items-center gap-3">
		<Icon
			class={cn(
				'h-4 w-4 transition-transform duration-300 group-hover:scale-110',
				isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-200'
			)}
		/>
		<span class="tracking-tight">{name}</span>
	</div>
	{#if badge !== undefined}
		<Badge
			variant={isActive ? 'default' : 'secondary'}
			class={cn(
				'h-5 min-w-[20px] justify-center px-1.5 text-[10px] font-bold border-none transition-all duration-300',
				isActive ? 'bg-white text-blue-600' : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700'
			)}
		>
			{badge}
		</Badge>
	{/if}
</a>
