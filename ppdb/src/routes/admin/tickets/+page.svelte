<script lang="ts">
	import type { PageData } from './$types';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import * as Card from '$lib/components/ui/card';
	import * as Table from '$lib/components/ui/table';
	import * as Tabs from '$lib/components/ui/tabs';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Badge } from '$lib/components/ui/badge';
	import { Search, Filter, Ticket, AlertCircle, CheckCircle2, Clock } from 'lucide-svelte';
	import { formatDistanceToNow } from 'date-fns';
	import { id as idLocale, enUS } from 'date-fns/locale';
	import { i18n } from '$lib/i18n/index.svelte';

	let { data }: { data: PageData } = $props();

	// Client-side filtering logic
	let activeTab = $state('all');
	let searchQuery = $state('');
	let priorityFilter = $state<string | null>(null);

	// Derived statistics
	let totalTickets = $derived(data.tickets.length);
	let openTickets = $derived(
		data.tickets.filter((t) => t.status === 'open' || t.status === 'in_progress').length
	);
	let resolvedTickets = $derived(
		data.tickets.filter((t) => t.status === 'resolved' || t.status === 'closed').length
	);
	// Mock average response time (in real app, calculate from message timestamps)
	let avgResponseTime = '2h 15m';

	// Derived filtered tickets
	let filteredTickets = $derived(
		data.tickets.filter((ticket) => {
			const matchesTab =
				activeTab === 'all'
					? true
					: activeTab === 'open'
						? ['open', 'in_progress'].includes(ticket.status)
						: ['resolved', 'closed'].includes(ticket.status);

			const matchesSearch =
				searchQuery === '' ||
				ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
				ticket.tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				ticket.id.includes(searchQuery);

			const matchesPriority = priorityFilter ? ticket.priority === priorityFilter : true;

			return matchesTab && matchesSearch && matchesPriority;
		})
	);

	const getPriorityText = (priority: string) => {
		const key = `admin.tickets.${priority.toLowerCase()}` as any;
		return i18n.t(key);
	};

	const getStatusText = (status: string) => {
		const key = `admin.tickets.${status.toLowerCase().replace('_', '')}` as any;
		if (status === 'in_progress') return i18n.t('admin.tickets.inProgress');
		return i18n.t(key);
	};
</script>

<div class="container mx-auto px-4 py-8 max-w-6xl">
	<div class="flex items-center justify-between mb-8">
		<div>
			<h1 class="text-3xl font-bold tracking-tight">{i18n.t('admin.tickets.title')}</h1>
			<p class="text-muted-foreground mt-1">{i18n.t('admin.tickets.subtitle')}</p>
		</div>
	</div>

	<!-- Summary Cards -->
	<div class="grid gap-4 md:grid-cols-3 mb-8">
		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="text-sm font-medium">{i18n.t('admin.tickets.totalTickets')}</Card.Title>
				<Ticket class="h-4 w-4 text-muted-foreground" />
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold">{totalTickets}</div>
				<p class="text-xs text-muted-foreground">{i18n.t('admin.tickets.allTime')}</p>
			</Card.Content>
		</Card.Root>
		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="text-sm font-medium">{i18n.t('admin.tickets.openTickets')}</Card.Title>
				<AlertCircle class="h-4 w-4 text-red-500" />
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold">{openTickets}</div>
				<p class="text-xs text-muted-foreground">{i18n.t('admin.tickets.needAttention')}</p>
			</Card.Content>
		</Card.Root>
		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="text-sm font-medium"
					>{i18n.t('admin.tickets.avgResponseTime')}</Card.Title
				>
				<Clock class="h-4 w-4 text-muted-foreground" />
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold">{avgResponseTime}</div>
				<p class="text-xs text-muted-foreground">{i18n.t('admin.tickets.last30Days')}</p>
			</Card.Content>
		</Card.Root>
	</div>

	<!-- Tabs & Filters -->
	<Tabs.Root value="all" class="w-full" onValueChange={(v) => (activeTab = v)}>
		<div class="flex items-center justify-between mb-4">
			<Tabs.List>
				<Tabs.Trigger value="all">{i18n.t('admin.tickets.allTickets')}</Tabs.Trigger>
				<Tabs.Trigger value="open">{i18n.t('admin.tickets.openInProgress')}</Tabs.Trigger>
				<Tabs.Trigger value="resolved">{i18n.t('admin.tickets.resolved')}</Tabs.Trigger>
			</Tabs.List>

			<div class="flex items-center gap-2">
				<div class="relative w-full max-w-sm">
					<Search class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
					<Input
						type="search"
						placeholder={i18n.t('admin.tickets.searchPlaceholder')}
						class="pl-9 w-[250px]"
						bind:value={searchQuery}
					/>
				</div>
				<DropdownMenu.Root>
					<DropdownMenu.Trigger>
						{#snippet child({ props })}
							<Button variant="outline" class="gap-2" {...props}>
								<Filter class="h-4 w-4" />
								{priorityFilter
									? i18n.t('admin.tickets.priorityFilter', {
											priority: getPriorityText(priorityFilter)
										})
									: i18n.t('common.filter')}
							</Button>
						{/snippet}
					</DropdownMenu.Trigger>
					<DropdownMenu.Content align="end">
						<DropdownMenu.Label>{i18n.t('admin.tickets.filterByPriority')}</DropdownMenu.Label>
						<DropdownMenu.Separator />
						<DropdownMenu.Item on:click={() => (priorityFilter = null)}
							>{i18n.t('common.all')}</DropdownMenu.Item
						>
						<DropdownMenu.Item on:click={() => (priorityFilter = 'high')}
							>{i18n.t('admin.tickets.high')}</DropdownMenu.Item
						>
						<DropdownMenu.Item on:click={() => (priorityFilter = 'medium')}
							>{i18n.t('admin.tickets.medium')}</DropdownMenu.Item
						>
						<DropdownMenu.Item on:click={() => (priorityFilter = 'low')}
							>{i18n.t('admin.tickets.low')}</DropdownMenu.Item
						>
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			</div>
		</div>

		<Tabs.Content value="all" class="m-0">
			<Card.Root>
				<Card.Content class="p-0">
					<Table.Root>
						<Table.Header>
							<Table.Row>
								<Table.Head>{i18n.t('common.id')}</Table.Head>
								<Table.Head>{i18n.t('admin.tickets.school')}</Table.Head>
								<Table.Head>{i18n.t('admin.tickets.subject')}</Table.Head>
								<Table.Head>{i18n.t('admin.tickets.priority')}</Table.Head>
								<Table.Head>{i18n.t('admin.packages.status')}</Table.Head>
								<Table.Head>{i18n.t('admin.tickets.lastUpdate')}</Table.Head>
								<Table.Head class="text-right">{i18n.t('admin.announcements.action')}</Table.Head>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{#if filteredTickets.length === 0}
								<Table.Row>
									<Table.Cell colspan={7} class="text-center py-8 text-muted-foreground">
										{i18n.t('admin.tickets.noTickets')}
									</Table.Cell>
								</Table.Row>
							{:else}
								{#each filteredTickets as ticket}
									<Table.Row>
										<Table.Cell class="font-mono text-xs">{ticket.id.slice(0, 8)}...</Table.Cell>
										<Table.Cell class="font-medium">{ticket.tenant.name}</Table.Cell>
										<Table.Cell>{ticket.subject}</Table.Cell>
										<Table.Cell>
											<Badge
												variant={ticket.priority === 'high' || ticket.priority === 'critical'
													? 'destructive'
													: ticket.priority === 'medium'
														? 'default'
														: 'outline'}
											>
												{getPriorityText(ticket.priority)}
											</Badge>
										</Table.Cell>
										<Table.Cell>
											<div class="flex items-center gap-2">
												<div
													class="h-2 w-2 rounded-full {ticket.status === 'open'
														? 'bg-red-500'
														: ticket.status === 'resolved'
															? 'bg-green-500'
															: 'bg-yellow-500'}"
												></div>
												{getStatusText(ticket.status)}
											</div>
										</Table.Cell>
										<Table.Cell class="text-muted-foreground text-sm">
											{formatDistanceToNow(new Date(ticket.updatedAt), {
												addSuffix: true,
												locale: i18n.language === 'id' ? idLocale : enUS
											})}
										</Table.Cell>
										<Table.Cell class="text-right">
											<Button variant="outline" size="sm" href="/admin/tickets/{ticket.id}">
												{i18n.t('common.view')}
											</Button>
										</Table.Cell>
									</Table.Row>
								{/each}
							{/if}
						</Table.Body>
					</Table.Root>
				</Card.Content>
			</Card.Root>
		</Tabs.Content>

		<!-- Re-use same table structure for other tabs for now -->
		<Tabs.Content value="open" class="m-0">
			<Card.Root>
				<Card.Content class="p-0">
					<!-- Copy of Table above (Svelte snippet would be better here in real refactor) -->
					<Table.Root>
						<Table.Header>
							<Table.Row>
								<Table.Head>{i18n.t('common.id')}</Table.Head>
								<Table.Head>{i18n.t('admin.tickets.school')}</Table.Head>
								<Table.Head>{i18n.t('admin.tickets.subject')}</Table.Head>
								<Table.Head>{i18n.t('admin.tickets.priority')}</Table.Head>
								<Table.Head>{i18n.t('admin.packages.status')}</Table.Head>
								<Table.Head>{i18n.t('admin.tickets.lastUpdate')}</Table.Head>
								<Table.Head class="text-right">{i18n.t('admin.announcements.action')}</Table.Head>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{#if filteredTickets.length === 0}
								<Table.Row>
									<Table.Cell colspan={7} class="text-center py-8 text-muted-foreground">
										{i18n.t('admin.tickets.noOpenTickets')}
									</Table.Cell>
								</Table.Row>
							{:else}
								{#each filteredTickets as ticket}
									<Table.Row>
										<Table.Cell class="font-mono text-xs">{ticket.id.slice(0, 8)}...</Table.Cell>
										<Table.Cell class="font-medium">{ticket.tenant.name}</Table.Cell>
										<Table.Cell>{ticket.subject}</Table.Cell>
										<Table.Cell>
											<Badge
												variant={ticket.priority === 'high' || ticket.priority === 'critical'
													? 'destructive'
													: ticket.priority === 'medium'
														? 'default'
														: 'outline'}
											>
												{getPriorityText(ticket.priority)}
											</Badge>
										</Table.Cell>
										<Table.Cell>
											<div class="flex items-center gap-2">
												<div
													class="h-2 w-2 rounded-full {ticket.status === 'open'
														? 'bg-red-500'
														: ticket.status === 'resolved'
															? 'bg-green-500'
															: 'bg-yellow-500'}"
												></div>
												{getStatusText(ticket.status)}
											</div>
										</Table.Cell>
										<Table.Cell class="text-muted-foreground text-sm">
											{formatDistanceToNow(new Date(ticket.updatedAt), {
												addSuffix: true,
												locale: i18n.language === 'id' ? idLocale : enUS
											})}
										</Table.Cell>
										<Table.Cell class="text-right">
											<Button variant="outline" size="sm" href="/admin/tickets/{ticket.id}">
												{i18n.t('common.view')}
											</Button>
										</Table.Cell>
									</Table.Row>
								{/each}
							{/if}
						</Table.Body>
					</Table.Root>
				</Card.Content>
			</Card.Root>
		</Tabs.Content>

		<Tabs.Content value="resolved" class="m-0">
			<Card.Root>
				<Card.Content class="p-0">
					<!-- Copy of Table above -->
					<Table.Root>
						<Table.Header>
							<Table.Row>
								<Table.Head>{i18n.t('common.id')}</Table.Head>
								<Table.Head>{i18n.t('admin.tickets.school')}</Table.Head>
								<Table.Head>{i18n.t('admin.tickets.subject')}</Table.Head>
								<Table.Head>{i18n.t('admin.tickets.priority')}</Table.Head>
								<Table.Head>{i18n.t('admin.packages.status')}</Table.Head>
								<Table.Head>{i18n.t('admin.tickets.lastUpdate')}</Table.Head>
								<Table.Head class="text-right">{i18n.t('admin.announcements.action')}</Table.Head>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{#if filteredTickets.length === 0}
								<Table.Row>
									<Table.Cell colspan={7} class="text-center py-8 text-muted-foreground">
										{i18n.t('admin.tickets.noResolvedTickets')}
									</Table.Cell>
								</Table.Row>
							{:else}
								{#each filteredTickets as ticket}
									<Table.Row>
										<Table.Cell class="font-mono text-xs">{ticket.id.slice(0, 8)}...</Table.Cell>
										<Table.Cell class="font-medium">{ticket.tenant.name}</Table.Cell>
										<Table.Cell>{ticket.subject}</Table.Cell>
										<Table.Cell>
											<Badge
												variant={ticket.priority === 'high' || ticket.priority === 'critical'
													? 'destructive'
													: ticket.priority === 'medium'
														? 'default'
														: 'outline'}
											>
												{getPriorityText(ticket.priority)}
											</Badge>
										</Table.Cell>
										<Table.Cell>
											<div class="flex items-center gap-2">
												<div
													class="h-2 w-2 rounded-full {ticket.status === 'open'
														? 'bg-red-500'
														: ticket.status === 'resolved'
															? 'bg-green-500'
															: 'bg-yellow-500'}"
												></div>
												{getStatusText(ticket.status)}
											</div>
										</Table.Cell>
										<Table.Cell class="text-muted-foreground text-sm">
											{formatDistanceToNow(new Date(ticket.updatedAt), {
												addSuffix: true,
												locale: i18n.language === 'id' ? idLocale : enUS
											})}
										</Table.Cell>
										<Table.Cell class="text-right">
											<Button variant="outline" size="sm" href="/admin/tickets/{ticket.id}">
												{i18n.t('common.view')}
											</Button>
										</Table.Cell>
									</Table.Row>
								{/each}
							{/if}
						</Table.Body>
					</Table.Root>
				</Card.Content>
			</Card.Root>
		</Tabs.Content>
	</Tabs.Root>
</div>
