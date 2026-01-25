<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import type { PageData } from './$types';
	import AdminPageHeader from '$lib/components/admin/AdminPageHeader.svelte';
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import {
		Activity,
		Search,
		Calendar,
		X,
		Download,
		Shield,
		AlertTriangle,
		CheckCircle,
		XCircle,
		FileText,
		ArrowUpDown,
		ChevronLeft,
		ChevronRight
	} from 'lucide-svelte';
	import { i18n } from '$lib/i18n/index.svelte';

	let { data }: { data: PageData } = $props();

	// Enums for filters
	const AUDIT_ACTIONS = ['LOGIN', 'LOGOUT', 'CREATE', 'READ', 'UPDATE', 'DELETE', 'EXPORT', 'IMPORT'];
	const AUDIT_ENTITIES = ['USER', 'TENANT', 'APPLICATION', 'ROLE', 'PERMISSION', 'SYSTEM', 'SETTING'];
	const AUDIT_SEVERITIES = ['info', 'warning', 'error', 'critical'];
	const AUDIT_STATUSES = ['success', 'failed', 'pending'];

	let searchTimer: NodeJS.Timeout;

	const updateFilter = (key: string, value: string | number | undefined | null) => {
		const url = new URL($page.url);
		if (value && value !== '') {
			url.searchParams.set(key, String(value));
		} else {
			url.searchParams.delete(key);
		}
		
		// Reset page to 1 when filtering (unless updating page itself)
		if (key !== 'page') {
			url.searchParams.delete('page');
		}

		goto(url, { keepFocus: true, noScroll: true });
	};

	const handleSearch = (e: Event) => {
		const value = (e.target as HTMLInputElement).value;
		clearTimeout(searchTimer);
		searchTimer = setTimeout(() => {
			updateFilter('q', value);
		}, 500);
	};

	const clearFilters = () => {
		goto($page.url.pathname);
	};

	const changePage = (newPage: number) => {
		updateFilter('page', newPage);
	};

	const exportLogs = () => {
		// Placeholder export functionality
		alert(i18n.t('admin.auditLogs.exportStarted') || 'Export started... Check console/network.');
		console.log('Export requested with filters:', Object.fromEntries($page.url.searchParams));
	};

	// Existing Helpers
	const getActionColor = (action: string) => {
		const actionLower = action?.toLowerCase() || '';
		if (actionLower.includes('create') || actionLower.includes('add')) {
			return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
		}
		if (actionLower.includes('update') || actionLower.includes('edit')) {
			return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
		}
		if (actionLower.includes('delete') || actionLower.includes('remove')) {
			return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
		}
		if (actionLower.includes('login') || actionLower.includes('logout')) {
			return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
		}
		return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
	};

	const getSeverityIcon = (severity: string) => {
		switch (severity?.toLowerCase()) {
			case 'critical':
			case 'high':
				return XCircle;
			case 'medium':
				return AlertTriangle;
			case 'low':
			case 'info':
				return Shield;
			default:
				return FileText;
		}
	};

	const getSeverityColor = (severity: string) => {
		switch (severity?.toLowerCase()) {
			case 'critical':
				return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
			case 'high':
				return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
			case 'medium':
				return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
			case 'low':
				return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
			case 'info':
				return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
			default:
				return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
		}
	};

	const getStatusIcon = (status: string) => {
		switch (status?.toLowerCase()) {
			case 'success':
			case 'completed':
				return CheckCircle;
			case 'failed':
			case 'error':
				return XCircle;
			case 'pending':
				return Activity;
			default:
				return FileText;
		}
	};

	const getStatusColor = (status: string) => {
		switch (status?.toLowerCase()) {
			case 'success':
			case 'completed':
				return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
			case 'failed':
			case 'error':
				return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
			case 'pending':
				return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
			default:
				return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
		}
	};

	const formatDate = (date: Date | string) => {
		const d = typeof date === 'string' ? new Date(date) : date;
		return d.toLocaleString(i18n.language === 'id' ? 'id-ID' : 'en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	};
</script>

<AdminPageHeader
	title={i18n.t('admin.auditLogs.title')}
	description={i18n.t('admin.auditLogs.description')}
/>

<!-- Stats Cards -->
<div class="grid gap-4 md:grid-cols-4 mb-8">
	<Card.Root>
		<Card.Header class="pb-2">
			<Card.Title class="text-sm font-medium text-muted-foreground uppercase tracking-wider">
				{i18n.t('admin.auditLogs.stats.total')}
			</Card.Title>
		</Card.Header>
		<Card.Content>
			<div class="flex items-center gap-2">
				<FileText class="h-5 w-5 text-blue-500" />
				<div class="text-2xl font-bold">{data.stats.total || 0}</div>
			</div>
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header class="pb-2">
			<Card.Title class="text-sm font-medium text-muted-foreground uppercase tracking-wider">
				{i18n.t('admin.auditLogs.stats.today')}
			</Card.Title>
		</Card.Header>
		<Card.Content>
			<div class="flex items-center gap-2">
				<Activity class="h-5 w-5 text-green-500" />
				<div class="text-2xl font-bold">{data.stats.today || 0}</div>
			</div>
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header class="pb-2">
			<Card.Title class="text-sm font-medium text-muted-foreground uppercase tracking-wider">
				{i18n.t('admin.auditLogs.stats.thisWeek')}
			</Card.Title>
		</Card.Header>
		<Card.Content>
			<div class="flex items-center gap-2">
				<Calendar class="h-5 w-5 text-purple-500" />
				<div class="text-2xl font-bold">{data.stats.thisWeek || 0}</div>
			</div>
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header class="pb-2">
			<Card.Title class="text-sm font-medium text-muted-foreground uppercase tracking-wider">
				{i18n.t('admin.auditLogs.stats.thisMonth')}
			</Card.Title>
		</Card.Header>
		<Card.Content>
			<div class="flex items-center gap-2">
				<Shield class="h-5 w-5 text-orange-500" />
				<div class="text-2xl font-bold">{data.stats.thisMonth || 0}</div>
			</div>
		</Card.Content>
	</Card.Root>
</div>

<!-- Filters Bar -->
<Card.Root class="mb-6">
	<Card.Content class="pt-6">
		<div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
			<!-- Search -->
			<div class="relative flex-1 max-w-md">
				<Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
				<input
					type="text"
					placeholder={i18n.t('admin.auditLogs.search')}
					value={data.filters.search || ''}
					oninput={handleSearch}
					class="w-full rounded-md border border-input bg-background pl-10 pr-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
				/>
			</div>

			<!-- Actions -->
			<div class="flex items-center gap-2">
				<Button variant="outline" size="sm" onclick={clearFilters}>
					<X class="h-4 w-4 mr-2" />
					{i18n.t('admin.auditLogs.clearFilters')}
				</Button>
				<Button variant="outline" size="sm" onclick={exportLogs}>
					<Download class="h-4 w-4 mr-2" />
					{i18n.t('admin.auditLogs.export')}
				</Button>
			</div>
		</div>

		<!-- Filter Options -->
		<div class="mt-4 flex flex-wrap gap-3">
			<select
				value={data.filters.action || ''}
				onchange={(e) => updateFilter('action', e.currentTarget.value)}
				class="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
			>
				<option value="">{i18n.t('admin.auditLogs.filterByAction')}</option>
				{#each AUDIT_ACTIONS as action}
					<option value={action}>{action}</option>
				{/each}
			</select>

			<select
				value={data.filters.entityType || ''}
				onchange={(e) => updateFilter('entity', e.currentTarget.value)}
				class="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
			>
				<option value="">{i18n.t('admin.auditLogs.filterByEntity')}</option>
				{#each AUDIT_ENTITIES as entity}
					<option value={entity}>{entity}</option>
				{/each}
			</select>

			<select
				value={data.filters.severity || ''}
				onchange={(e) => updateFilter('severity', e.currentTarget.value)}
				class="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
			>
				<option value="">{i18n.t('admin.auditLogs.filterBySeverity')}</option>
				{#each AUDIT_SEVERITIES as severity}
					<option value={severity}>{severity}</option>
				{/each}
			</select>

			<select
				value={data.filters.status || ''}
				onchange={(e) => updateFilter('status', e.currentTarget.value)}
				class="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
			>
				<option value="">{i18n.t('admin.auditLogs.filterByStatus')}</option>
				{#each AUDIT_STATUSES as status}
					<option value={status}>{status}</option>
				{/each}
			</select>

			<select
				value={data.filters.userId || ''}
				onchange={(e) => updateFilter('userId', e.currentTarget.value)}
				class="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
			>
				<option value="">{i18n.t('admin.auditLogs.filterByUser')}</option>
				{#each data.filterOptions.users as user}
					<option value={user.id}>{user.name || user.email}</option>
				{/each}
			</select>

			<select
				value={data.filters.tenantId || ''}
				onchange={(e) => updateFilter('tenantId', e.currentTarget.value)}
				class="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
			>
				<option value="">{i18n.t('admin.auditLogs.filterByTenant')}</option>
				{#each data.filterOptions.tenants as tenant}
					<option value={tenant.id}>{tenant.name}</option>
				{/each}
			</select>

			<div class="flex items-center gap-2">
				<Calendar class="h-4 w-4 text-muted-foreground" />
				<input
					type="date"
					value={data.filters.dateFrom ? new Date(data.filters.dateFrom).toISOString().split('T')[0] : ''}
					onchange={(e) => updateFilter('from', e.currentTarget.value)}
					class="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
				/>
				<span class="text-sm text-muted-foreground">-</span>
				<input
					type="date"
					value={data.filters.dateTo ? new Date(data.filters.dateTo).toISOString().split('T')[0] : ''}
					onchange={(e) => updateFilter('to', e.currentTarget.value)}
					class="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
				/>
			</div>
		</div>
	</Card.Content>
</Card.Root>

<!-- Logs Table -->
<Card.Root class="mb-6">
	<Card.Header>
		<Card.Title class="flex items-center gap-2">
			<Shield class="h-5 w-5 text-primary" />
			{i18n.t('admin.auditLogs.logs')}
		</Card.Title>
	</Card.Header>
	<Card.Content>
		<div class="overflow-x-auto">
			<table class="w-full">
				<thead>
					<tr class="border-b border-border">
						<th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
							{i18n.t('admin.auditLogs.timestamp')}
						</th>
						<th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
							{i18n.t('admin.auditLogs.user')}
						</th>
						<th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
							{i18n.t('admin.auditLogs.action')}
						</th>
						<th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
							{i18n.t('admin.auditLogs.entity')}
						</th>
						<th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
							{i18n.t('admin.auditLogs.severity')}
						</th>
						<th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
							{i18n.t('admin.auditLogs.status')}
						</th>
						<th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
							{i18n.t('admin.auditLogs.ipAddress')}
						</th>
						<th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
							{i18n.t('admin.auditLogs.details')}
						</th>
					</tr>
				</thead>
				<tbody>
					{#each data.logs as log}
						<tr class="border-b border-border hover:bg-muted/50">
							<td class="px-4 py-3 text-sm">
								{formatDate(log.timestamp)}
							</td>
							<td class="px-4 py-3 text-sm">
								<div class="font-medium">{log.user?.name || i18n.t('common.unknown')}</div>
								{#if log.user?.email}
									<div class="text-xs text-muted-foreground">{log.user.email}</div>
								{/if}
							</td>
							<td class="px-4 py-3 text-sm">
								<Badge class={getActionColor(log.action)} variant="outline">
									{log.action}
								</Badge>
							</td>
							<td class="px-4 py-3 text-sm">
								<div class="font-medium">{log.entityType || '-'}</div>
								{#if log.entityId}
									<div class="text-xs text-muted-foreground">ID: {log.entityId}</div>
								{/if}
							</td>
							<td class="px-4 py-3 text-sm">
								<Badge class={getSeverityColor(log.severity)} variant="outline">
									<svelte:component this={getSeverityIcon(log.severity)} class="h-3 w-3 mr-1" />
									{log.severity || 'info'}
								</Badge>
							</td>
							<td class="px-4 py-3 text-sm">
								<Badge class={getStatusColor(log.status)} variant="outline">
									<svelte:component this={getStatusIcon(log.status)} class="h-3 w-3 mr-1" />
									{log.status || 'unknown'}
								</Badge>
							</td>
							<td class="px-4 py-3 text-sm text-muted-foreground">
								{log.ipAddress || '-'}
							</td>
							<td class="px-4 py-3 text-sm">
								<Button variant="ghost" size="sm" class="h-8">
									{i18n.t('admin.auditLogs.viewDetails')}
								</Button>
							</td>
						</tr>
					{/each}
					{#if data.logs.length === 0}
						<tr>
							<td colspan="8" class="px-4 py-8 text-center text-sm text-muted-foreground">
								{i18n.t('admin.auditLogs.noLogsFound')}
							</td>
						</tr>
					{/if}
				</tbody>
			</table>
		</div>
	</Card.Content>
</Card.Root>

<!-- Pagination -->
{#if data.total > 0}
	<div class="flex items-center justify-between">
		<div class="text-sm text-muted-foreground">
			{i18n.t('admin.auditLogs.showing')} {Math.min((data.filters.page - 1) * data.filters.limit + 1, data.total)}
			{i18n.t('admin.auditLogs.of')} {data.total} {i18n.t('admin.auditLogs.logs')}
		</div>
		<div class="flex items-center gap-2">
			<Button
				variant="outline"
				size="sm"
				disabled={data.filters.page <= 1}
				onclick={() => changePage(data.filters.page - 1)}
			>
				<ChevronLeft class="h-4 w-4" />
			</Button>
			<div class="flex items-center gap-1">
				<span class="px-3 py-1 text-sm font-medium bg-primary text-primary-foreground rounded">
					{data.filters.page}
				</span>
			</div>
			<Button
				variant="outline"
				size="sm"
				disabled={data.filters.page * data.filters.limit >= data.total}
				onclick={() => changePage(data.filters.page + 1)}
			>
				<ChevronRight class="h-4 w-4" />
			</Button>
		</div>
	</div>
{/if}

<style>
	:global(.grid) {
		display: grid;
	}
</style>
