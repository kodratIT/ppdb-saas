<script lang="ts">
	import type { PageData } from './$types';
	import AdminPageHeader from '$lib/components/admin/AdminPageHeader.svelte';
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import {
		Activity,
		Users,
		ShieldAlert,
		ArrowRight,
		Gauge,
		Server,
		Database,
		Zap,
		RefreshCw,
		AlertCircle,
		Lock
	} from 'lucide-svelte';
	import { i18n } from '$lib/i18n/index.svelte';
	import { goto } from '$app/navigation';

	let { data }: { data: PageData } = $props();
	let isLoading = $state(false);
	let error = $state<string | null>(null);
	let navigatingTo = $state<string | null>(null);

	// Check if data is empty
	let isEmpty = $derived(
		!data ||
		data.platform.tenants.active === 0 ||
		data.platform.users.total === 0
	);

	async function refreshData() {
		isLoading = true;
		error = null;
		try {
			// Reload the page to fetch fresh data
			await new Promise(resolve => setTimeout(resolve, 500));
			window.location.reload();
		} catch (err) {
			error = err instanceof Error ? err.message : i18n.t('common.error');
			isLoading = false;
		}
	}

	async function navigateToPage(href: string) {
		navigatingTo = href;
		try {
			await goto(href, { invalidateAll: true });
		} catch (err) {
			console.error('Navigation error:', err);
			navigatingTo = null;
		}
	}

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

	const quickActions = [
		{
			title: i18n.t('admin.system.viewUsers'),
			description: i18n.t('admin.system.manageUsersDesc'),
			href: '/admin/system/users',
			icon: Users,
			available: true
		},
		{
			title: i18n.t('admin.system.checkHealth'),
			description: i18n.t('admin.system.monitorSystemDesc'),
			href: '/admin/system/operations',
			icon: Activity,
			available: true
		},
		{
			title: i18n.t('admin.system.securityAudit'),
			description: i18n.t('admin.system.reviewLogsDesc'),
			href: '/admin/system/security',
			icon: ShieldAlert,
			available: true
		},
		{
			title: i18n.t('admin.system.platformSettings'),
			description: i18n.t('admin.system.configureSettingsDesc'),
			href: '/admin/system/settings',
			icon: Gauge,
			available: true
		}
	];
</script>

<AdminPageHeader
	title={i18n.t('admin.system.systemOverview')}
	description={i18n.t('admin.system.systemOverviewDesc')}
>
	{#snippet actions()}
		<Button onclick={refreshData} disabled={isLoading} variant="outline" size="sm">
			<RefreshCw class="mr-2 h-4 w-4 {isLoading ? 'animate-spin' : ''}" />
			{isLoading ? i18n.t('common.loading') : i18n.t('admin.operations.refresh')}
		</Button>
	{/snippet}
</AdminPageHeader>

<!-- Error State -->
{#if error}
	<Card.Root class="mb-6 border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-900/10">
		<Card.Content class="pt-6">
			<div class="flex items-start gap-4">
				<div class="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
					<AlertCircle class="h-5 w-5 text-red-600 dark:text-red-400" />
				</div>
				<div class="flex-1">
					<h3 class="font-semibold text-red-900 dark:text-red-100">
						{i18n.t('common.error')}
					</h3>
					<p class="text-sm text-red-700 dark:text-red-300 mt-1">
						{error}
					</p>
					<div class="flex gap-2 mt-3">
						<Button onclick={refreshData} disabled={isLoading} variant="outline" size="sm">
							<RefreshCw class="mr-2 h-4 w-4 {isLoading ? 'animate-spin' : ''}" />
							{i18n.t('actions.retry')}
						</Button>
					</div>
				</div>
			</div>
		</Card.Content>
	</Card.Root>
{/if}

<!-- Empty State -->
{#if isEmpty && !isLoading && !error}
	<Card.Root class="mb-6">
		<Card.Content class="pt-12 pb-12">
			<div class="flex flex-col items-center justify-center text-center">
				<div class="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
					<Activity class="h-8 w-8 text-muted-foreground" />
				</div>
				<h3 class="text-lg font-semibold mb-2">
					{i18n.language === 'id' ? 'Sistem Belum Siap' : 'System Not Ready'}
				</h3>
				<p class="text-sm text-muted-foreground max-w-md mb-6">
					{i18n.language === 'id'
						? 'Sistem belum memiliki data aktif. Mulai dengan menambahkan penyewa dan pengguna.'
						: 'The system doesn\'t have any active data yet. Start by adding tenants and users.'}
				</p>
				<div class="flex gap-2">
					<Button onclick={refreshData} variant="outline" size="sm">
						<RefreshCw class="mr-2 h-4 w-4" />
						{i18n.t('admin.operations.refresh')}
					</Button>
				</div>
			</div>
		</Card.Content>
	</Card.Root>
{/if}

<!-- System Status Cards -->
<div class="grid gap-4 md:grid-cols-4 mb-8">
	{#if isLoading}
		<!-- Loading Skeletons -->
		<Card.Root>
			<Card.Header class="pb-2">
				<Skeleton class="h-4 w-24" />
			</Card.Header>
			<Card.Content>
				<div class="flex items-center gap-2">
					<Skeleton class="h-2 w-2 rounded-full" />
					<Skeleton class="h-6 w-20" />
				</div>
				<Skeleton class="h-3 w-32 mt-2" />
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header class="pb-2">
				<Skeleton class="h-4 w-24" />
			</Card.Header>
			<Card.Content>
				<div class="flex items-center gap-2">
					<Skeleton class="h-5 w-5 rounded" />
					<Skeleton class="h-8 w-16" />
				</div>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header class="pb-2">
				<Skeleton class="h-4 w-24" />
			</Card.Header>
			<Card.Content>
				<div class="flex items-center gap-2">
					<Skeleton class="h-5 w-5 rounded" />
					<Skeleton class="h-8 w-12" />
				</div>
				<Skeleton class="h-3 w-24 mt-2" />
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header class="pb-2">
				<Skeleton class="h-4 w-24" />
			</Card.Header>
			<Card.Content>
				<div class="flex items-center gap-2">
					<Skeleton class="h-5 w-5 rounded" />
					<Skeleton class="h-6 w-20" />
				</div>
				<Skeleton class="h-3 w-32 mt-2" />
			</Card.Content>
		</Card.Root>
	{:else}
		<!-- System Status Card -->
		<Card.Root>
			<Card.Header class="pb-2">
				<Card.Title class="text-sm font-medium text-muted-foreground uppercase tracking-wider">
					{i18n.t('admin.system.systemStatus')}
				</Card.Title>
			</Card.Header>
			<Card.Content>
				<div class="flex items-center gap-2">
					<div
						class="h-2 w-2 rounded-full {data.status === 'operational'
							? 'bg-green-500'
							: 'bg-yellow-500'}"
					></div>
					<div class="text-lg font-bold capitalize">{data.status}</div>
				</div>
				<p class="text-xs text-muted-foreground mt-1">
					{new Date(data.timestamp).toLocaleTimeString(i18n.language === 'id' ? 'id-ID' : 'en-US')}
				</p>
			</Card.Content>
		</Card.Root>

		<!-- Server Uptime Card -->
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

		<!-- Active Tenants Card -->
		<Card.Root>
			<Card.Header class="pb-2">
				<Card.Title class="text-sm font-medium text-muted-foreground uppercase tracking-wider">
					{i18n.t('admin.system.activeTenants')}
				</Card.Title>
			</Card.Header>
			<Card.Content>
				<div class="flex items-center gap-2">
					<Users class="h-5 w-5 text-purple-500" />
					<div class="text-2xl font-bold">{data.platform.tenants.active}</div>
				</div>
				<p class="text-xs text-muted-foreground">
					{i18n.t('admin.health.totalUsers')}: {data.platform.users.total}
				</p>
			</Card.Content>
		</Card.Root>

		<!-- Database Status Card -->
		<Card.Root>
			<Card.Header class="pb-2">
				<Card.Title class="text-sm font-medium text-muted-foreground uppercase tracking-wider">
					{i18n.t('admin.health.database')}
				</Card.Title>
			</Card.Header>
			<Card.Content>
				<div class="flex items-center gap-2">
					<Database class="h-5 w-5 text-green-500" />
					<div class="text-lg font-bold capitalize">{data.database.status}</div>
				</div>
				<p class="text-xs text-muted-foreground">
					{i18n.t('admin.health.latency', { count: data.database.latency })}
				</p>
			</Card.Content>
		</Card.Root>
	{/if}
</div>

<!-- Integration Status -->
<div class="mb-8">
	<h2 class="text-lg font-semibold mb-4">{i18n.t('admin.system.integrations')}</h2>
	<div class="grid gap-4 md:grid-cols-2">
		{#if isLoading}
			<!-- Loading Skeletons for Integrations -->
			<Card.Root>
				<Card.Header>
					<div class="flex items-center gap-2">
						<Skeleton class="h-5 w-5 rounded" />
						<Skeleton class="h-5 w-32" />
					</div>
				</Card.Header>
				<Card.Content>
					<div class="flex items-center justify-between">
						<Skeleton class="h-6 w-20" />
						<Skeleton class="h-4 w-16" />
					</div>
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Header>
					<div class="flex items-center gap-2">
						<Skeleton class="h-5 w-5 rounded" />
						<Skeleton class="h-5 w-32" />
					</div>
				</Card.Header>
				<Card.Content>
					<div class="flex items-center justify-between">
						<Skeleton class="h-6 w-20" />
						<Skeleton class="h-4 w-16" />
					</div>
				</Card.Content>
			</Card.Root>
		{:else}
			<!-- WAHA Integration -->
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
							{data.integrations.waha.status}
						</Badge>
						<span class="text-sm text-muted-foreground"
							>{data.integrations.waha.latency}{i18n.t('admin.system.ms')}</span
						>
					</div>
				</Card.Content>
			</Card.Root>

			<!-- Xendit Integration -->
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
							{data.integrations.xendit.status}
						</Badge>
						<span class="text-sm text-muted-foreground"
							>{data.integrations.xendit.latency}{i18n.t('admin.system.ms')}</span
						>
					</div>
				</Card.Content>
			</Card.Root>
		{/if}
	</div>
</div>

<!-- Quick Actions -->
<div>
	<h2 class="text-lg font-semibold mb-4">{i18n.t('admin.system.quickActions')}</h2>
	<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
		{#each quickActions as action, index (index)}
			{#if action.available}
				<button
					onclick={() => navigateToPage(action.href)}
					disabled={navigatingTo === action.href}
					class="text-left group"
					aria-label={action.title}
				>
					<Card.Root
						class="hover:shadow-lg hover:scale-[1.02] transition-all cursor-pointer h-full
							{navigatingTo === action.href ? 'opacity-50' : ''}
							border border-border/50 hover:border-primary/50"
					>
						<Card.Content class="pt-6">
							{@const Icon = action.icon}
							<div class="flex items-center gap-3 mb-3">
								<div
									class="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10
										text-primary group-hover:bg-primary/20 transition-colors"
								>
									<Icon class="h-5 w-5" />
								</div>
								<h3 class="font-semibold group-hover:text-primary transition-colors">
									{action.title}
								</h3>
							</div>
							<p class="text-sm text-muted-foreground mb-3">{action.description}</p>
							<div class="flex items-center text-sm font-medium text-primary">
								{#if navigatingTo === action.href}
									<RefreshCw class="h-4 w-4 mr-1 animate-spin" />
									<span>{i18n.t('common.loading')}</span>
								{:else}
									<span>{i18n.t('common.view')}</span>
									<ArrowRight class="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
								{/if}
							</div>
						</Card.Content>
					</Card.Root>
				</button>
			{:else}
				<div class="relative">
					<Card.Root
						class="opacity-60 h-full border border-dashed border-muted-foreground/30 cursor-not-allowed"
					>
						<Card.Content class="pt-6">
							<div class="flex items-center gap-3 mb-3">
								<div
									class="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground"
								>
									<Lock class="h-5 w-5" />
								</div>
								<h3 class="font-semibold text-muted-foreground">{action.title}</h3>
							</div>
							<p class="text-sm text-muted-foreground mb-3">{action.description}</p>
							<div class="flex items-center text-sm font-medium text-muted-foreground">
								<span class="text-xs">{i18n.language === 'id' ? 'Segera Hadir' : 'Coming Soon'}</span>
							</div>
						</Card.Content>
					</Card.Root>
				</div>
			{/if}
		{/each}
	</div>
</div>

<style>
	:global(.grid) {
		display: grid;
	}
</style>
