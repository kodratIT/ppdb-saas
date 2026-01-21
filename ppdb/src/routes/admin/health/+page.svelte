<script lang="ts">
	import type { PageData } from './$types';
	import { Activity, Server, Database, Wifi, WifiOff, Cpu, HardDrive, Zap } from 'lucide-svelte';
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { i18n } from '$lib/i18n/index.svelte';

	let { data } = $props<{ data: PageData }>();

	const getStatusColor = (status: string) => {
		switch (status.toLowerCase()) {
			case 'healthy':
			case 'operational':
				return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
			case 'degraded':
				return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
			case 'error':
				return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
			default:
				return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
		}
	};

	const getStatusText = (status: string) => {
		switch (status.toLowerCase()) {
			case 'healthy':
				return i18n.t('admin.health.healthy');
			case 'operational':
				return i18n.t('admin.health.operational');
			case 'degraded':
				return i18n.t('admin.health.degraded');
			case 'error':
				return i18n.t('admin.health.error');
			default:
				return status.toUpperCase();
		}
	};
</script>

<div class="container mx-auto px-4 py-8 max-w-6xl">
	<div class="flex items-center justify-between mb-8">
		<div>
			<h1 class="text-3xl font-bold tracking-tight">{i18n.t('admin.health.title')}</h1>
			<p class="text-muted-foreground mt-1">{i18n.t('admin.health.subtitle')}</p>
		</div>
		<Badge class={getStatusColor(data.status)} variant="outline">
			{getStatusText(data.status)}
		</Badge>
	</div>

	<!-- Overall Status -->
	<div class="grid gap-4 md:grid-cols-4 mb-8">
		<Card.Root>
			<Card.Header class="pb-2">
				<Card.Title class="text-sm font-medium text-muted-foreground uppercase tracking-wider">
					{i18n.t('admin.health.systemStatus')}
				</Card.Title>
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold capitalize">{getStatusText(data.status)}</div>
				<p class="text-xs text-muted-foreground">
					{i18n.t('admin.health.lastChecked', {
						time: new Date(data.timestamp).toLocaleTimeString(
							i18n.language === 'id' ? 'id-ID' : 'en-US'
						)
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
					<Cpu class="h-5 w-5 text-blue-500" />
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
					<HardDrive class="h-5 w-5 text-purple-500" />
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
					<div class="text-2xl font-bold capitalize">{getStatusText(data.database.status)}</div>
				</div>
				<p class="text-xs text-muted-foreground">
					{i18n.t('admin.health.latency', { count: data.database.latency })}
				</p>
			</Card.Content>
		</Card.Root>
	</div>

	<!-- Integrations -->
	<div class="grid gap-4 md:grid-cols-3 mb-8">
		<Card.Root>
			<Card.Header>
				<Card.Title class="flex items-center gap-2">
					<Zap class="h-5 w-5 text-yellow-500" />
					WAHA (WhatsApp)
				</Card.Title>
			</Card.Header>
			<Card.Content>
				<div class="flex items-center justify-between">
					<Badge class={getStatusColor(data.integrations.waha.status)} variant="outline">
						{getStatusText(data.integrations.waha.status)}
					</Badge>
					<span class="text-sm text-muted-foreground"
						>{i18n.t('admin.health.latency', { count: data.integrations.waha.latency })}</span
					>
				</div>
				<p class="text-xs text-muted-foreground mt-2">{data.integrations.waha.message}</p>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header>
				<Card.Title class="flex items-center gap-2">
					<Activity class="h-5 w-5 text-blue-500" />
					Xendit (Payment)
				</Card.Title>
			</Card.Header>
			<Card.Content>
				<div class="flex items-center justify-between">
					<Badge class={getStatusColor(data.integrations.xendit.status)} variant="outline">
						{getStatusText(data.integrations.xendit.status)}
					</Badge>
					<span class="text-sm text-muted-foreground"
						>{i18n.t('admin.health.latency', { count: data.integrations.xendit.latency })}</span
					>
				</div>
				<p class="text-xs text-muted-foreground mt-2">{data.integrations.xendit.message}</p>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header>
				<Card.Title>{i18n.t('admin.health.platformStats')}</Card.Title>
			</Card.Header>
			<Card.Content>
				<div class="space-y-2 text-sm">
					<div class="flex justify-between">
						<span>{i18n.t('admin.health.activeTenants')}</span>
						<span class="font-semibold"
							>{data.platform.tenants.active}/{data.platform.tenants.total}</span
						>
					</div>
					<div class="flex justify-between">
						<span>{i18n.t('admin.health.totalUsers')}</span>
						<span class="font-semibold">{data.platform.users.total}</span>
					</div>
					<div class="flex justify-between">
						<span>{i18n.t('admin.health.transactionsToday')}</span>
						<span class="font-semibold">{data.platform.transactions.today}</span>
					</div>
				</div>
			</Card.Content>
		</Card.Root>
	</div>
</div>
