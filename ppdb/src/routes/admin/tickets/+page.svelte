<script lang="ts">
	import type { PageData } from './$types';
	import TicketList from '$lib/components/admin/tickets/TicketList.svelte';
	import TicketAnalytics from '$lib/components/admin/tickets/TicketAnalytics.svelte';
	import * as Card from '$lib/components/ui/card';
	import * as Tabs from '$lib/components/ui/tabs';
	import { Ticket, AlertCircle, CheckCircle2, Clock } from 'lucide-svelte';
	import { i18n } from '$lib/i18n/index.svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	let { data }: { data: PageData } = $props();

	// Stats
	let stats = $derived(data.stats);

	// Tab handling for status filter
	// We map tabs to status query param
	let activeTab = $state($page.url.searchParams.get('status') || 'all');

	function handleTabChange(value: string) {
		activeTab = value;
		const url = new URL($page.url);
		url.searchParams.delete('status'); // Clear existing first
		if (value === 'all') {
			// No status param = all
		} else if (value === 'open') {
			url.searchParams.append('status', 'open');
			url.searchParams.append('status', 'in_progress');
		} else {
			url.searchParams.set('status', value);
		}
		url.searchParams.set('page', '1');
		goto(url, { keepFocus: true, noScroll: true });
	}
</script>

<div class="container mx-auto px-4 py-8 max-w-6xl">
	<div class="flex items-center justify-between mb-8">
		<div>
			<h1 class="text-3xl font-bold tracking-tight">{i18n.t('admin.tickets.title')}</h1>
			<p class="text-muted-foreground mt-1">{i18n.t('admin.tickets.subtitle')}</p>
		</div>
	</div>

	<!-- Analytics -->
	<TicketAnalytics stats={data.stats} />

	<!-- Tabs & List -->
	<Tabs.Root value={activeTab} class="w-full" onValueChange={handleTabChange}>
		<div class="flex items-center justify-between mb-4">
			<Tabs.List>
				<Tabs.Trigger value="all">{i18n.t('admin.tickets.allTickets')}</Tabs.Trigger>
				<Tabs.Trigger value="open">{i18n.t('admin.tickets.open')}</Tabs.Trigger>
				<Tabs.Trigger value="resolved">{i18n.t('admin.tickets.resolved')}</Tabs.Trigger>
			</Tabs.List>
		</div>

		<Tabs.Content value={activeTab} class="m-0">
			<TicketList
				tickets={data.tickets}
				total={data.pagination.total}
				currentPage={data.pagination.page}
				totalPages={data.pagination.totalPages}
				staffMembers={data.staffMembers}
			/>
		</Tabs.Content>
	</Tabs.Root>
</div>
