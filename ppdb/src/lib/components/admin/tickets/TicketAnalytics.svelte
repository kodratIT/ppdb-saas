<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Ticket, AlertCircle, CheckCircle2, Clock, Zap } from 'lucide-svelte';
	import { i18n } from '$lib/i18n/index.svelte';
	import Progress from '$lib/components/ui/progress.svelte';

	interface Props {
		stats: {
			total: number;
			open: number;
			resolved: number;
			newTickets24h: number;
			priorityStats: Record<string, number>;
			avgResponseTime: string;
		};
	}

	let { stats }: Props = $props();

	// Calculate percentages for priority visualizer
	let priorityStats = $derived([
		{ label: 'Critical', value: stats.priorityStats.critical || 0, color: 'bg-red-600' },
		{ label: 'High', value: stats.priorityStats.high || 0, color: 'bg-orange-500' },
		{ label: 'Medium', value: stats.priorityStats.medium || 0, color: 'bg-blue-500' },
		{ label: 'Low', value: stats.priorityStats.low || 0, color: 'bg-slate-400' }
	]);
</script>

<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
	<Card.Root>
		<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
			<Card.Title class="text-sm font-medium">{i18n.t('admin.tickets.totalTickets')}</Card.Title>
			<Ticket class="h-4 w-4 text-muted-foreground" />
		</Card.Header>
		<Card.Content>
			<div class="text-2xl font-bold">{stats.total}</div>
			<p class="text-xs text-muted-foreground">{i18n.t('admin.tickets.allTime')}</p>
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
			<Card.Title class="text-sm font-medium"
				>{i18n.t('admin.tickets.newTickets24h') || 'New (24h)'}</Card.Title
			>
			<Zap class="h-4 w-4 text-amber-500" />
		</Card.Header>
		<Card.Content>
			<div class="text-2xl font-bold">{stats.newTickets24h}</div>
			<p class="text-xs text-muted-foreground">
				{i18n.t('admin.tickets.recentlyCreated') || 'Recently created'}
			</p>
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
			<Card.Title class="text-sm font-medium">{i18n.t('admin.tickets.openTickets')}</Card.Title>
			<AlertCircle class="h-4 w-4 text-red-500" />
		</Card.Header>
		<Card.Content>
			<div class="text-2xl font-bold">{stats.open}</div>
			<p class="text-xs text-muted-foreground">{i18n.t('admin.tickets.needAttention')}</p>
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
			<Card.Title class="text-sm font-medium">{i18n.t('admin.tickets.avgResponseTime')}</Card.Title>
			<Clock class="h-4 w-4 text-muted-foreground" />
		</Card.Header>
		<Card.Content>
			<div class="text-2xl font-bold">{stats.avgResponseTime}</div>
			<p class="text-xs text-muted-foreground">{i18n.t('admin.tickets.last30Days')}</p>
		</Card.Content>
	</Card.Root>
</div>

<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mb-8">
	<Card.Root class="lg:col-span-4">
		<Card.Header>
			<Card.Title class="text-base"
				>{i18n.t('admin.tickets.ticketsByPriority') || 'Tickets by Priority'}</Card.Title
			>
		</Card.Header>
		<Card.Content class="space-y-4">
			{#each priorityStats as item}
				<div class="space-y-1">
					<div class="flex items-center justify-between text-sm">
						<span class="font-medium">{item.label}</span>
						<span class="text-muted-foreground">{item.value}</span>
					</div>
					<Progress value={(item.value / stats.total) * 100} class="h-2" barClass={item.color} />
				</div>
			{/each}
		</Card.Content>
	</Card.Root>

	<Card.Root class="lg:col-span-3">
		<Card.Header>
			<Card.Title class="text-base"
				>{i18n.t('admin.tickets.ticketStatus') || 'Ticket Status'}</Card.Title
			>
		</Card.Header>
		<Card.Content>
			<div class="flex flex-col gap-4">
				<div class="flex items-center gap-4">
					<div class="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
						<AlertCircle class="h-5 w-5 text-red-600" />
					</div>
					<div class="flex-1">
						<div class="flex items-center justify-between">
							<p class="text-sm font-medium">{i18n.t('admin.tickets.open')}</p>
							<p class="text-sm font-bold">{stats.open}</p>
						</div>
						<Progress
							value={(stats.open / stats.total) * 100}
							class="h-1 bg-red-100"
							barClass="bg-red-500"
						/>
					</div>
				</div>

				<div class="flex items-center gap-4">
					<div class="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
						<CheckCircle2 class="h-5 w-5 text-green-600" />
					</div>
					<div class="flex-1">
						<div class="flex items-center justify-between">
							<p class="text-sm font-medium">{i18n.t('admin.tickets.resolved')}</p>
							<p class="text-sm font-bold">{stats.resolved}</p>
						</div>
						<Progress
							value={(stats.resolved / stats.total) * 100}
							class="h-1 bg-green-100"
							barClass="bg-green-500"
						/>
					</div>
				</div>

				<div class="flex items-center gap-4">
					<div class="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
						<Clock class="h-5 w-5 text-slate-600" />
					</div>
					<div class="flex-1">
						<div class="flex items-center justify-between">
							<p class="text-sm font-medium">{i18n.t('admin.tickets.other') || 'Other'}</p>
							<p class="text-sm font-bold">{stats.total - stats.open - stats.resolved}</p>
						</div>
						<Progress
							value={((stats.total - stats.open - stats.resolved) / stats.total) * 100}
							class="h-1 bg-slate-100"
							barClass="bg-slate-500"
						/>
					</div>
				</div>
			</div>
		</Card.Content>
	</Card.Root>
</div>
