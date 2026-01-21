<script lang="ts">
	import type { Snippet } from 'svelte';
	import AdminBreadcrumb from './AdminBreadcrumb.svelte';
	import { cn } from '$lib/utils';
	import { format } from 'date-fns';
	import { id as localeID, enUS } from 'date-fns/locale';
	import { i18n } from '$lib/i18n/index.svelte';

	interface BreadcrumbItem {
		label: string;
		href?: string;
	}

	interface Props {
		title: string;
		description?: string;
		actions?: Snippet;
		breadcrumbs?: BreadcrumbItem[];
		showDate?: boolean;
		class?: string;
	}

	let {
		title,
		description,
		actions,
		breadcrumbs = [],
		showDate = false,
		class: className
	}: Props = $props();

	const today = new Date();

	const dateLocale = $derived(i18n.language === 'id' ? localeID : enUS);
</script>

<div class={cn('space-y-6 pb-8 animate-in-fade', className)}>
	{#if breadcrumbs.length > 0}
		<AdminBreadcrumb items={breadcrumbs} class="mb-2" />
	{/if}

	<div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
		<div class="space-y-2">
			<h1 class="text-4xl font-extrabold tracking-tight text-foreground/90">{title}</h1>
			{#if description}
				<p class="text-base text-muted-foreground/80 max-w-2xl leading-relaxed">{description}</p>
			{:else if showDate}
				<p class="text-sm font-medium text-muted-foreground/60 uppercase tracking-widest">
					{format(today, 'EEEE, d MMMM yyyy', { locale: dateLocale })}
				</p>
			{/if}
		</div>

		{#if actions}
			<div class="flex items-center gap-3">
				{@render actions()}
			</div>
		{/if}
	</div>
</div>
