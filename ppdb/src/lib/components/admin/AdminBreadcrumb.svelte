<script lang="ts">
	import { ChevronRight, Home } from 'lucide-svelte';
	import { cn } from '$lib/utils';
	import { i18n } from '$lib/i18n/index.svelte';

	interface BreadcrumbItem {
		label: string;
		href?: string;
	}

	interface Props {
		items: BreadcrumbItem[];
		class?: string;
	}

	let { items, class: className }: Props = $props();
</script>

<nav aria-label="Breadcrumb" class={cn('flex', className)}>
	<ol class="flex items-center space-x-2 text-sm text-slate-500">
		<li class="flex items-center">
			<a href="/admin" class="hover:text-slate-900 transition-colors">
				<Home class="h-4 w-4" />
				<span class="sr-only">{i18n.t('nav.main')}</span>
			</a>
		</li>

		{#each items as item, i}
			<li class="flex items-center">
				<ChevronRight class="h-4 w-4 flex-shrink-0 text-slate-300" />
				{#if item.href && i !== items.length - 1}
					<a href={item.href} class="ml-2 hover:text-slate-900 transition-colors">
						{item.label}
					</a>
				{:else}
					<span class="ml-2 font-bold text-slate-900" aria-current="page">
						{item.label}
					</span>
				{/if}
			</li>
		{/each}
	</ol>
</nav>
