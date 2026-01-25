<script lang="ts">
	import type { PageData } from './$types';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import * as Table from '$lib/components/ui/table';
	import { Input } from '$lib/components/ui/input';
	import { Badge } from '$lib/components/ui/badge';
	import { Search, Filter, ChevronLeft, ChevronRight, FileText, User, Globe, Shield, AlertTriangle, Lock, ArrowRight } from 'lucide-svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { i18n } from '$lib/i18n/index.svelte';
	import AdminPageHeader from '$lib/components/admin/AdminPageHeader.svelte';

	let { data } = $props<{ data: PageData }>();

	let actionFilter = $state(page.url.searchParams.get('action') || '');
	let dateFrom = $state(page.url.searchParams.get('from') || '');
	let dateTo = $state(page.url.searchParams.get('to') || '');

	function applyFilters() {
		const url = new URL(page.url);
		if (actionFilter) url.searchParams.set('action', actionFilter);
		else url.searchParams.delete('action');

		if (dateFrom) url.searchParams.set('from', dateFrom);
		else url.searchParams.delete('from');

		if (dateTo) url.searchParams.set('to', dateTo);
		else url.searchParams.delete('to');

		url.searchParams.set('page', '1');
		goto(url.toString());
	}

	function changePage(newPage: number) {
		const url = new URL(page.url);
		url.searchParams.set('page', newPage.toString());
		goto(url.toString());
	}

	const getActionBadgeStyle = (action: string) => {
		if (action.includes('delete'))
			return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
		if (action.includes('create'))
			return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
		if (action.includes('update'))
			return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
		return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
	};

	let selectedLog = $state<any>(null);
</script>

<AdminPageHeader
	title={i18n.t('admin.security.title')}
	description={i18n.t('admin.security.subtitle')}
/>

<!-- Security Stats -->
<div class="grid gap-4 md:grid-cols-3 mb-8">
	<Card.Root>
		<Card.Header class="pb-2">
			<Card.Title class="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
				<Shield class="h-4 w-4" />
				{i18n.t('admin.security.totalLogs')}
			</Card.Title>
		</Card.Header>
		<Card.Content>
			<div class="text-2xl font-bold">{data.pagination.total}</div>
			<p class="text-xs text-muted-foreground">{i18n.t('admin.security.allTime')}</p>
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header class="pb-2">
			<Card.Title class="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
				<AlertTriangle class="h-4 w-4 text-yellow-500" />
				{i18n.t('admin.security.failedLogins')}
			</Card.Title>
		</Card.Header>
		<Card.Content>
			<div class="text-2xl font-bold text-yellow-600">{data.stats.failedLogins}</div>
			<p class="text-xs text-muted-foreground">{i18n.t('admin.security.last7Days')}</p>
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header class="pb-2">
			<Card.Title class="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
				<Lock class="h-4 w-4 text-red-500" />
				{i18n.t('admin.security.suspiciousActivity')}
			</Card.Title>
		</Card.Header>
		<Card.Content>
			<div class="text-2xl font-bold text-red-600">{data.stats.suspiciousActivity}</div>
			<p class="text-xs text-muted-foreground">{i18n.t('admin.security.deleteActions')}</p>
		</Card.Content>
	</Card.Root>
</div>

<!-- Quick Actions -->
<div class="grid gap-4 md:grid-cols-2 mb-8">
	<a href="/admin/system/settings" class="block">
		<Card.Root class="hover:shadow-lg transition-shadow cursor-pointer">
			<Card.Content class="pt-6">
				<div class="flex items-center gap-3 mb-2">
					<div
						class="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600"
					>
						<Lock class="h-5 w-5" />
					</div>
					<div>
						<h3 class="font-semibold">{i18n.t('admin.security.securitySettings')}</h3>
						<p class="text-sm text-muted-foreground">{i18n.t('admin.security.configureDesc')}</p>
					</div>
				</div>
				<div class="flex items-center text-sm font-medium text-purple-600">
					<span>{i18n.t('common.view')}</span>
					<ArrowRight class="h-4 w-4 ml-1" />
				</div>
			</Card.Content>
		</Card.Root>
	</a>

	<Card.Root class="bg-muted/30 border-dashed">
		<Card.Content class="pt-6">
			<div class="flex items-center gap-3 mb-2">
				<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
					<FileText class="h-5 w-5" />
				</div>
				<div>
					<h3 class="font-semibold text-muted-foreground">{i18n.t('admin.security.auditReports')}</h3>
					<p class="text-sm text-muted-foreground">{i18n.t('admin.security.comingSoon')}</p>
				</div>
			</div>
		</Card.Content>
	</Card.Root>
</div>

<!-- Filters -->
<Card.Root class="mb-8">
	<Card.Content class="pt-6">
		<div class="grid gap-4 md:grid-cols-4 items-end">
			<div class="space-y-2">
				<label
					for="action"
					class="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
				>
					{i18n.t('admin.auditLogs.actionType')}
				</label>
				<select
					id="action"
					bind:value={actionFilter}
					class="w-full text-sm border rounded-md px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
				>
					<option value="">{i18n.t('admin.auditLogs.allActions')}</option>
					{#each data.actions as action}
						<option value={action}>{action}</option>
					{/each}
				</select>
			</div>

			<div class="space-y-2">
				<label
					for="from"
					class="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
				>
					{i18n.t('admin.auditLogs.fromDate')}
				</label>
				<Input type="date" id="from" bind:value={dateFrom} class="h-10" />
			</div>

			<div class="space-y-2">
				<label
					for="to"
					class="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
				>
					{i18n.t('admin.auditLogs.toDate')}
				</label>
				<Input type="date" id="to" bind:value={dateTo} class="h-10" />
			</div>

			<div class="flex gap-2">
				<Button onclick={applyFilters} class="flex-1">
					<Search class="h-4 w-4 mr-2" />
					{i18n.t('common.filter')}
				</Button>
				<Button
					variant="outline"
					onclick={() => {
						actionFilter = '';
						dateFrom = '';
						dateTo = '';
						applyFilters();
					}}
				>
					{i18n.t('common.reset')}
				</Button>
			</div>
		</div>
	</Card.Content>
</Card.Root>

<!-- Logs Table -->
<Card.Root>
	<Card.Content class="p-0">
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head class="w-[180px]">{i18n.t('admin.auditLogs.timestamp')}</Table.Head>
					<Table.Head>{i18n.t('admin.auditLogs.actor')}</Table.Head>
					<Table.Head>{i18n.t('admin.auditLogs.action')}</Table.Head>
					<Table.Head>{i18n.t('admin.auditLogs.target')}</Table.Head>
					<Table.Head class="text-right">{i18n.t('admin.auditLogs.details')}</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each data.logs as log}
					<Table.Row class="group">
						<Table.Cell class="text-[11px] text-muted-foreground font-mono">
							{new Date(log.createdAt).toLocaleString(i18n.language === 'id' ? 'id-ID' : 'en-US')}
						</Table.Cell>
						<Table.Cell>
							<div class="flex items-center gap-2">
								<div
									class="h-7 w-7 rounded-full bg-slate-100 flex items-center justify-center dark:bg-slate-800"
								>
									<User class="h-3.5 w-3.5 text-slate-500" />
								</div>
								<div>
									<div class="text-xs font-medium">{log.actorName || 'System'}</div>
									<div class="text-[10px] text-muted-foreground">{log.actorEmail || 'N/A'}</div>
								</div>
							</div>
						</Table.Cell>
						<Table.Cell>
							<Badge variant="outline" class="text-[10px] py-0 {getActionBadgeStyle(log.action)}">
								{log.action.replace('_', ' ').toUpperCase()}
							</Badge>
						</Table.Cell>
						<Table.Cell class="text-xs font-medium">
							<div class="flex items-center gap-1.5">
								<Globe class="h-3 w-3 text-muted-foreground" />
								{log.target}
							</div>
							{#if log.tenantName}
								<div class="text-[10px] text-muted-foreground ml-4.5">{log.tenantName}</div>
							{/if}
						</Table.Cell>
						<Table.Cell class="text-right">
							<Button
								size="sm"
								variant="ghost"
								class="h-8 w-8 p-0"
								onclick={() => (selectedLog = log)}
							>
								<FileText class="h-4 w-4" />
							</Button>
						</Table.Cell>
					</Table.Row>
				{:else}
					<Table.Row>
						<Table.Cell colspan={5} class="text-center py-12 text-muted-foreground">
							{i18n.t('admin.auditLogs.noLogs')}
						</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</Card.Content>
	<Card.Footer class="flex items-center justify-between p-4 border-t">
		<div class="text-xs text-muted-foreground">
			{i18n.t('pagination.showing', {
				start: (data.pagination.page - 1) * data.pagination.limit + 1,
				end: Math.min(data.pagination.page * data.pagination.limit, data.pagination.total),
				total: data.pagination.total
			})}
		</div>
		<div class="flex items-center gap-2">
			<Button
				variant="outline"
				size="sm"
				class="h-8"
				disabled={data.pagination.page === 1}
				onclick={() => changePage(data.pagination.page - 1)}
			>
				<ChevronLeft class="h-4 w-4 mr-1" />
				{i18n.t('pagination.previous')}
			</Button>
			<div class="text-xs font-medium">
				{i18n.t('pagination.page', {
					page: data.pagination.page,
					total: data.pagination.totalPages
				})}
			</div>
			<Button
				variant="outline"
				size="sm"
				class="h-8"
				disabled={data.pagination.page === data.pagination.totalPages}
				onclick={() => changePage(data.pagination.page + 1)}
			>
				{i18n.t('pagination.next')}
				<ChevronRight class="h-4 w-4 ml-1" />
			</Button>
		</div>
	</Card.Footer>
</Card.Root>

{#if selectedLog}
	<div
		class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
		onclick={() => (selectedLog = null)}
	>
		<div
			class="bg-card w-full max-w-lg rounded-xl shadow-2xl border flex flex-col max-h-[80vh]"
			onclick={(e) => e.stopPropagation()}
		>
			<div class="p-4 border-b flex items-center justify-between bg-muted/30">
				<h3 class="font-bold flex items-center gap-2">
					<FileText class="h-5 w-5 text-blue-500" />
					{i18n.t('admin.auditLogs.logDetails')}
				</h3>
				<Button variant="ghost" size="sm" onclick={() => (selectedLog = null)}>✕</Button>
			</div>
			<div class="p-6 overflow-y-auto space-y-4">
				<div class="grid grid-cols-2 gap-4 text-sm">
					<div>
						<div class="text-xs font-bold uppercase text-muted-foreground mb-1">
							{i18n.t('admin.auditLogs.action')}
						</div>
						<div>{selectedLog.action}</div>
					</div>
					<div>
						<div class="text-xs font-bold uppercase text-muted-foreground mb-1">
							{i18n.t('admin.auditLogs.target')}
						</div>
						<div>{selectedLog.target}</div>
					</div>
					<div>
						<div class="text-xs font-bold uppercase text-muted-foreground mb-1">
							{i18n.t('admin.auditLogs.timestamp')}
						</div>
						<div class="font-mono">
							{new Date(selectedLog.createdAt).toLocaleString(
								i18n.language === 'id' ? 'id-ID' : 'en-US'
							)}
						</div>
					</div>
					<div>
						<div class="text-xs font-bold uppercase text-muted-foreground mb-1">
							{i18n.t('admin.auditLogs.actor')}
						</div>
						<div>{selectedLog.actorName || 'System'} ({selectedLog.actorEmail || 'N/A'})</div>
					</div>
				</div>
				<div>
					<div class="text-xs font-bold uppercase text-muted-foreground mb-1">
						{i18n.t('admin.auditLogs.dataChanges')}
					</div>
					<pre
						class="bg-muted p-4 rounded-lg text-xs overflow-x-auto border font-mono whitespace-pre-wrap">{JSON.stringify(
							JSON.parse(selectedLog.details || '{}'),
							null,
							2
						)}</pre
					>
				</div>
			</div>
			<div class="p-4 border-t flex justify-end">
				<Button onclick={() => (selectedLog = null)}>{i18n.t('common.close')}</Button>
			</div>
		</div>
	</div>
{/if}
