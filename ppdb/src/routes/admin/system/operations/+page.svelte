<script lang="ts">
	import type { PageData } from './$types';
	import { Activity, Server, Database, Zap, RefreshCw } from 'lucide-svelte';
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { i18n } from '$lib/i18n/index.svelte';
	import AdminPageHeader from '$lib/components/admin/AdminPageHeader.svelte';

	let { data } = $props<{ data: PageData }>();
	let refreshing = $state(false);

	async function refreshHealth() {
		refreshing = true;
		try {
			await new Promise(resolve => setTimeout(resolve, 1000));
			window.location.reload();
		} finally {
			refreshing = false;
		}
	}

	const getStatusColor = (status: string) => {
		switch (status.toLowerCase()) {
			case 'healthy':
			case 'operational':
			case 'connected':
				return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200';
			case 'degraded':
			case 'warning':
				return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200';
			case 'error':
			case 'disconnected':
				return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200';
			default:
				return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border-gray-200';
		}
	};

	const getStatusText = (status: string) => {
		switch (status.toLowerCase()) {
			case 'healthy': return i18n.t('admin.health.healthy');
			case 'operational': return i18n.t('admin.health.operational');
			case 'degraded': return i18n.t('admin.health.degraded');
			case 'error': return i18n.t('admin.health.error');
			case 'connected': return 'Terhubung';
			case 'disconnected': return 'Terputus';
			default: return status.toUpperCase();
		}
	};
</script>

<AdminPageHeader
	title={i18n.t('admin.operations.title')}
	description={i18n.t('admin.operations.subtitle')}
>
	{#snippet actions()}
		<Button onclick={refreshHealth} disabled={refreshing}>
			<RefreshCw class="mr-2 h-4 w-4 {refreshing ? 'animate-spin' : ''}" />
			{refreshing ? i18n.t('admin.operations.refreshing') : i18n.t('admin.operations.refresh')}
		</Button>
	{/snippet}
</AdminPageHeader>

<!-- Overall Status -->
<div class="grid gap-4 md:grid-cols-4 mb-8">
	<Card.Root>
		<Card.Header class="pb-2">
			<Card.Title class="text-sm font-medium text-muted-foreground uppercase tracking-wider">
				{i18n.t('admin.health.systemStatus')}
			</Card.Title>
		</Card.Header>
		<Card.Content>
			<div class="flex items-center gap-2">
				<div class="h-2 w-2 rounded-full {data.status === 'operational' ? 'bg-green-500' : 'bg-yellow-500'}"></div>
				<div class="text-2xl font-bold capitalize">{getStatusText(data.status)}</div>
			</div>
			<p class="text-xs text-muted-foreground mt-1">
				{i18n.t('admin.health.lastChecked', {
					time: new Date(data.timestamp).toLocaleTimeString(i18n.language === 'id' ? 'id-ID' : 'en-US')
				})}
			</p>
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header class="pb-2">
			<Card.Title class="text-sm font-medium text-muted-foreground uppercase tracking-wider">
				{i18n.t('admin.health.serverUptime')}
			</Card.Title>
		</Card.Header>
		<Card.Content>
			<div class="flex items-center gap-2">
				<Server class="h-5 w-5 text-blue-500" />
				<div class="text-2xl font-bold">{data.server.uptime}m</div>
			</div>
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header class="pb-2">
			<Card.Title class="text-sm font-medium text-muted-foreground uppercase tracking-wider">
				{i18n.t('admin.health.memoryUsage')}
			</Card.Title>
		</Card.Header>
		<Card.Content>
			<div class="flex items-center gap-2">
				<Database class="h-5 w-5 text-purple-500" />
				<div class="text-2xl font-bold">{data.server.memoryUsage.heapUsed}MB</div>
			</div>
			<p class="text-xs text-muted-foreground">
				{i18n.t('admin.health.heapUsage', { total: data.server.memoryUsage.heapTotal })}
			</p>
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header class="pb-2">
			<Card.Title class="text-sm font-medium text-muted-foreground uppercase tracking-wider">
				{i18n.t('admin.health.database')}
			</Card.Title>
		</Card.Header>
		<Card.Content>
			<div class="flex items-center gap-2">
				<Database class="h-5 w-5 text-green-500" />
				<div class="text-lg font-bold capitalize">{getStatusText(data.database.status)}</div>
			</div>
			<p class="text-xs text-muted-foreground">
				{i18n.t('admin.health.latency', { count: data.database.latency })}
			</p>
		</Card.Content>
	</Card.Root>
</div>

<!-- System Health Section -->
<div class="mb-8">
	<h2 class="text-xl font-semibold mb-4">{i18n.t('admin.operations.systemHealth')}</h2>
	<div class="grid gap-4 md:grid-cols-2">
		<Card.Root>
			<Card.Header>
				<Card.Title class="flex items-center gap-2">
					<Zap class="h-5 w-5 text-yellow-500" />
					WAHA (WhatsApp Gateway)
				</Card.Title>
			</Card.Header>
			<Card.Content>
				<div class="flex items-center justify-between mb-2">
					<Badge class={getStatusColor(data.integrations.waha.status)} variant="outline">
						{getStatusText(data.integrations.waha.status)}
					</Badge>
					<span class="text-sm text-muted-foreground">
						{data.integrations.waha.latency}{i18n.t('admin.system.ms')}
					</span>
				</div>
				<p class="text-sm text-muted-foreground">{data.integrations.waha.message}</p>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header>
				<Card.Title class="flex items-center gap-2">
					<Activity class="h-5 w-5 text-blue-500" />
					Xendit (Payment Gateway)
				</Card.Title>
			</Card.Header>
			<Card.Content>
				<div class="flex items-center justify-between mb-2">
					<Badge class={getStatusColor(data.integrations.xendit.status)} variant="outline">
						{getStatusText(data.integrations.xendit.status)}
					</Badge>
					<span class="text-sm text-muted-foreground">
						{data.integrations.xendit.latency}{i18n.t('admin.system.ms')}
					</span>
				</div>
				<p class="text-sm text-muted-foreground">{data.integrations.xendit.message}</p>
			</Card.Content>
		</Card.Root>
	</div>
</div>

<!-- Platform Stats -->
<div>
	<h2 class="text-xl font-semibold mb-4">{i18n.t('admin.health.platformStats')}</h2>
	<Card.Root>
		<Card.Content class="pt-6">
			<div class="grid gap-4 md:grid-cols-3 text-sm">
				<div class="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
					<span class="text-muted-foreground">{i18n.t('admin.health.activeTenants')}</span>
					<span class="font-bold text-lg">{data.platform.tenants.active}/{data.platform.tenants.total}</span>
				</div>
				<div class="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
					<span class="text-muted-foreground">{i18n.t('admin.health.totalUsers')}</span>
					<span class="font-bold text-lg">{data.platform.users.total}</span>
				</div>
				<div class="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
					<span class="text-muted-foreground">{i18n.t('admin.health.transactionsToday')}</span>
					<span class="font-bold text-lg">{data.platform.transactions.today}</span>
				</div>
			</div>
		</Card.Content>
	</Card.Root>
</div>
