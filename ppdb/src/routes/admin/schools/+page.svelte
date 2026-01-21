<script lang="ts">
	/* eslint-disable svelte/require-each-key */
	import type { PageData } from './$types';
	import { invalidate } from '$app/navigation';
	import { navigating, page } from '$app/state';
	import { goto } from '$app/navigation';
	import Button from '$lib/components/ui/button.svelte';
	import * as Card from '$lib/components/ui/card';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import * as Select from '$lib/components/ui/select';
	import AdminStatsCards from '$lib/components/admin/AdminStatsCards.svelte';
	import TableSkeleton from '$lib/components/ui/table-skeleton.svelte';
	import SchoolsTable from './components/SchoolsTable.svelte';
	import BulkActionBar from '$lib/components/admin/BulkActionBar.svelte';
	import ConfirmDialog from './components/ConfirmDialog.svelte';
	import AdminPageHeader from '$lib/components/admin/AdminPageHeader.svelte';
	import AdvancedSearch from '$lib/components/admin/AdvancedSearch.svelte';
	import ExportButton from './components/ExportButton.svelte';
	import { toast } from 'svelte-sonner';
	import { i18n } from '$lib/i18n/index.svelte';
	import {
		School,
		Plus,
		Filter,
		Shield,
		Activity,
		ChevronLeft,
		ChevronRight,
		X,
		Rows2,
		Rows3,
		Rows4,
		Settings2
	} from 'lucide-svelte';

	let { data } = $props<{ data: PageData }>();

	const totalSchools = $derived(data.tenants.total);
	const activeSchools = $derived(data.tenants.activeCount || 0);
	const isLoading = $derived(!!navigating.to);

	const statsItems = $derived([
		{
			title: i18n.t('admin.schools.totalSchools'),
			value: totalSchools,
			subtitle: i18n.t('admin.schools.listRegistered'),
			trendDirection: 'neutral' as const,
			icon: School
		},
		{
			title: i18n.t('admin.schools.activeSchools'),
			value: activeSchools,
			subtitle: i18n.t('admin.schools.active'),
			trendDirection: 'up' as const,
			icon: Activity
		},
		{
			title: i18n.t('admin.schools.securityStatus'),
			value: i18n.t('admin.schools.enterprise'),
			subtitle: i18n.t('admin.schools.systemProtection'),
			trendDirection: 'neutral' as const,
			icon: Shield
		}
	]);

	const availableColumns = $derived([
		{ id: 'name', label: i18n.t('admin.schools.schoolIdentity') },
		{ id: 'type', label: i18n.t('admin.schools.type') },
		{ id: 'url', label: i18n.t('admin.schools.accessUrl') },
		{ id: 'applications', label: i18n.t('admin.schools.applicantsStat') },
		{ id: 'performance', label: i18n.t('admin.schools.performanceStat') },
		{ id: 'status', label: i18n.t('common.status') }
	]);

	// Loading state for individual tenant actions
	let loadingTenants = $state<Set<string>>(new Set());

	// Selection state for bulk operations
	let selectedIds = $state<string[]>([]);
	let bulkLoading = $state(false);
	let confirmDialogOpen = $state(false);
	let bulkAction = $state<'activate' | 'deactivate'>('activate');

	// View Options
	let density = $state<'compact' | 'standard' | 'flexible'>('standard');
	let visibleColumns = $state<string[]>(availableColumns.map((c) => c.id));

	function toggleColumn(id: string) {
		if (visibleColumns.includes(id)) {
			visibleColumns = visibleColumns.filter((c) => c !== id);
		} else {
			visibleColumns = [...visibleColumns, id];
		}
	}

	function handleSelect(id: string, checked: boolean) {
		if (checked) {
			selectedIds = [...selectedIds, id];
		} else {
			selectedIds = selectedIds.filter((selectedId) => selectedId !== id);
		}
	}

	function handleSelectAll(checked: boolean) {
		if (checked) {
			selectedIds = data.tenants.data.map((t: any) => t.id);
		} else {
			selectedIds = [];
		}
	}

	function handleClearSelection() {
		selectedIds = [];
	}

	function handleBulkActivate() {
		bulkAction = 'activate';
		confirmDialogOpen = true;
	}

	function handleBulkDeactivate() {
		bulkAction = 'deactivate';
		confirmDialogOpen = true;
	}

	async function handleBulkConfirm() {
		bulkLoading = true;

		const loadingToastId = toast.loading(
			`${bulkAction === 'activate' ? i18n.t('actions.activate') : i18n.t('actions.deactivate')} ${selectedIds.length} ${i18n.t('nav.organizations').toLowerCase()}...`
		);

		try {
			const formData = new FormData();
			formData.append('tenantIds', JSON.stringify(selectedIds));
			formData.append('status', bulkAction === 'activate' ? 'active' : 'inactive');

			const response = await fetch('?/bulkUpdateStatus', {
				method: 'POST',
				body: formData
			});

			const result = (await response.json()) as any;

			toast.dismiss(loadingToastId);

			if (result.type === 'success') {
				const message =
					result.data?.message ||
					`${selectedIds.length} ${i18n.t('nav.organizations').toLowerCase()} ${bulkAction === 'activate' ? i18n.t('messages.success.activated', { item: '' }) : i18n.t('messages.success.deactivated', { item: '' })}`.trim();
				toast.success(message);
				selectedIds = [];
				await invalidate('admin:tenants');
			} else {
				const errorMessage = result.data?.error?.message || i18n.t('messages.error.generic');
				toast.error(errorMessage);
			}
		} catch (error) {
			console.error('Bulk operation error:', error);
			toast.dismiss(loadingToastId);
			toast.error(i18n.t('messages.error.network'));
		} finally {
			bulkLoading = false;
		}
	}

	// Filtering and Sorting state from URL
	let search = $state(page.url.searchParams.get('search') || '');
	let searchField = $state(page.url.searchParams.get('searchField') || 'all');
	let searchOperator = $state(page.url.searchParams.get('searchOperator') || 'contains');
	let status = $state(page.url.searchParams.get('status') || 'all');
	let type = $state(page.url.searchParams.get('type') || 'all');
	let timeframe = $state(page.url.searchParams.get('timeframe') || 'all');
	let sortBy = $state(page.url.searchParams.get('sortBy') || 'createdAt');
	let sortOrder = $state((page.url.searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc');

	function updateFilters() {
		const url = new URL(page.url);

		if (search) url.searchParams.set('search', search);
		else url.searchParams.delete('search');

		if (searchField !== 'all') url.searchParams.set('searchField', searchField);
		else url.searchParams.delete('searchField');

		if (searchOperator !== 'contains') url.searchParams.set('searchOperator', searchOperator);
		else url.searchParams.delete('searchOperator');

		if (status !== 'all') url.searchParams.set('status', status);
		else url.searchParams.delete('status');

		if (type !== 'all') url.searchParams.set('type', type);
		else url.searchParams.delete('type');

		if (timeframe !== 'all') url.searchParams.set('timeframe', timeframe);
		else url.searchParams.delete('timeframe');

		url.searchParams.set('sortBy', sortBy);
		url.searchParams.set('sortOrder', sortOrder);
		url.searchParams.set('page', '1');

		goto(url.toString(), { keepFocus: true, replaceState: true });
	}

	function handleSort(column: string, order: 'asc' | 'desc') {
		sortBy = column;
		sortOrder = order;
		updateFilters();
	}

	function handleQuickFilter(filterType: 'status' | 'type' | 'timeframe', value: string) {
		if (filterType === 'status') status = value;
		if (filterType === 'type') type = value;
		if (filterType === 'timeframe') timeframe = value;
		updateFilters();
	}

	function handleClearFilters() {
		search = '';
		searchField = 'all';
		searchOperator = 'contains';
		status = 'all';
		type = 'all';
		timeframe = 'all';
		updateFilters();
	}

	// Pagination Helpers
	const currentPage = $derived(data.tenants.page);
	const totalPages = $derived(data.tenants.totalPages);
	const totalItems = $derived(data.tenants.total);
	const limit = 20;

	const startItem = $derived(totalItems === 0 ? 0 : (currentPage - 1) * limit + 1);
	const endItem = $derived(Math.min(currentPage * limit, totalItems));

	function getUpdatedUrl(newPage: number) {
		const url = new URL(page.url);
		url.searchParams.set('page', newPage.toString());
		return url.pathname + url.search;
	}

	// Polling
	$effect(() => {
		const interval = setInterval(() => {
			invalidate('admin:tenants');
		}, 60000);
		return () => clearInterval(interval);
	});
</script>

<AdminPageHeader
	title={i18n.t('admin.schools.title')}
	description={i18n.t('admin.schools.subtitle')}
>
	{#snippet actions()}
		<div class="flex items-center gap-2">
			<ExportButton {search} {status} {type} {timeframe} />
			<Button href="/admin/register">
				<Plus class="mr-2 h-4 w-4" />
				{i18n.t('admin.schools.addNewSchool')}
			</Button>
		</div>
	{/snippet}
</AdminPageHeader>

<div class="space-y-6">
	<!-- Stats Cards -->
	<AdminStatsCards items={statsItems} {isLoading} columns={3} />

	<!-- Main Content Card -->
	<Card.Root class="border-none shadow-premium-sm overflow-hidden">
		<Card.Header class="p-4 border-b">
			<div class="flex flex-col xl:flex-row gap-4 items-start xl:items-center justify-between">
				<div class="flex flex-col sm:flex-row gap-3 w-full xl:w-auto items-center">
					<AdvancedSearch
						placeholder={i18n.t('admin.schools.searchOrgs')}
						bind:value={search}
						bind:field={searchField}
						bind:operator={searchOperator}
						onchange={updateFilters}
						class="w-full sm:w-[320px]"
					/>

					<div class="grid grid-cols-2 sm:flex items-center gap-2 w-full sm:w-auto">
						<Select.Root
							type="single"
							bind:value={status}
							onValueChange={(v: string) => handleQuickFilter('status', v)}
						>
							<Select.Trigger class="w-full sm:w-[130px]">
								{status === 'all'
									? `${i18n.t('common.status')}: ${i18n.t('common.all')}`
									: status === 'active'
										? i18n.t('admin.schools.active')
										: i18n.t('admin.schools.inactive')}
							</Select.Trigger>
							<Select.Content>
								<Select.Item value="all">{i18n.t('admin.schools.allStatus')}</Select.Item>
								<Select.Item value="active">{i18n.t('admin.schools.active')}</Select.Item>
								<Select.Item value="inactive">{i18n.t('admin.schools.inactive')}</Select.Item>
							</Select.Content>
						</Select.Root>

						<Select.Root
							type="single"
							bind:value={type}
							onValueChange={(v: string) => handleQuickFilter('type', v)}
						>
							<Select.Trigger class="w-full sm:w-[130px]">
								{type === 'all'
									? `${i18n.t('admin.schools.type')}: ${i18n.t('common.all')}`
									: type === 'single'
										? i18n.t('admin.register.singleSchool')
										: i18n.t('admin.register.foundation')}
							</Select.Trigger>
							<Select.Content>
								<Select.Item value="all">{i18n.t('common.all')}</Select.Item>
								<Select.Item value="single">{i18n.t('admin.register.singleSchool')}</Select.Item>
								<Select.Item value="foundation">{i18n.t('admin.register.foundation')}</Select.Item>
							</Select.Content>
						</Select.Root>
					</div>

					<div class="hidden sm:flex items-center gap-2">
						<Select.Root
							type="single"
							bind:value={timeframe}
							onValueChange={(v: string) => handleQuickFilter('timeframe', v)}
						>
							<Select.Trigger class="w-[140px]">
								{timeframe === 'all'
									? `${i18n.t('common.time')}: ${i18n.t('common.all')}`
									: timeframe === 'week'
										? i18n.t('time.thisWeek')
										: i18n.t('time.thisMonth')}
							</Select.Trigger>
							<Select.Content>
								<Select.Item value="all">{i18n.t('common.all')}</Select.Item>
								<Select.Item value="week">{i18n.t('time.thisWeek')}</Select.Item>
								<Select.Item value="month">{i18n.t('time.thisMonth')}</Select.Item>
							</Select.Content>
						</Select.Root>

						{#if search || status !== 'all' || type !== 'all' || timeframe !== 'all'}
							<Button
								variant="ghost"
								size="icon"
								onclick={handleClearFilters}
								title={i18n.t('actions.reset')}
							>
								<X class="h-4 w-4" />
							</Button>
						{/if}
					</div>
				</div>
				<div class="flex items-center gap-2 w-full sm:w-auto justify-end">
					<Select.Root type="single" value={density} onValueChange={(v: any) => (density = v)}>
						<Select.Trigger class="w-[130px]">
							<span class="truncate">
								{density === 'compact'
									? i18n.t('common.compact' as any) || 'Compact'
									: density === 'standard'
										? i18n.t('common.standard' as any) || 'Standard'
										: i18n.t('common.flexible' as any) || 'Flexible'}
							</span>
						</Select.Trigger>
						<Select.Content>
							<Select.Group>
								<Select.Label>{i18n.t('common.density' as any) || 'Density'}</Select.Label>
								<Select.Item value="compact">
									<div class="flex items-center gap-2">
										<Rows4 class="h-4 w-4" />
										{i18n.t('common.compact' as any) || 'Compact'}
									</div>
								</Select.Item>
								<Select.Item value="standard">
									<div class="flex items-center gap-2">
										<Rows3 class="h-4 w-4" />
										{i18n.t('common.standard' as any) || 'Standard'}
									</div>
								</Select.Item>
								<Select.Item value="flexible">
									<div class="flex items-center gap-2">
										<Rows2 class="h-4 w-4" />
										{i18n.t('common.flexible' as any) || 'Flexible'}
									</div>
								</Select.Item>
							</Select.Group>
						</Select.Content>
					</Select.Root>

					<DropdownMenu.Root>
						<DropdownMenu.Trigger>
							<Button variant="outline" size="sm" class="h-10">
								<Settings2 class="mr-2 h-4 w-4" />
								{i18n.t('common.columns' as any) || 'Columns'}
							</Button>
						</DropdownMenu.Trigger>
						<DropdownMenu.Content align="end" class="w-[150px]">
							<DropdownMenu.Label
								>{i18n.t('common.toggleColumns' as any) || 'Toggle columns'}</DropdownMenu.Label
							>
							<DropdownMenu.Separator />
							{#each availableColumns as column}
								<DropdownMenu.CheckboxItem
									checked={visibleColumns.includes(column.id)}
									onCheckedChange={() => toggleColumn(column.id)}
									class="capitalize"
								>
									{column.label}
								</DropdownMenu.CheckboxItem>
							{/each}
						</DropdownMenu.Content>
					</DropdownMenu.Root>
				</div>
				<div class="text-sm text-muted-foreground whitespace-nowrap hidden xl:block">
					{i18n.t('common.all')}: <span class="font-medium text-foreground">{totalItems}</span>
				</div>
			</div>
		</Card.Header>
		<Card.Content class="p-0">
			<BulkActionBar
				selectedCount={selectedIds.length}
				title={i18n.t('nav.organizations').toLowerCase()}
				onActivate={handleBulkActivate}
				onDeactivate={handleBulkDeactivate}
				onClear={handleClearSelection}
				loading={bulkLoading}
			/>
			<div class="relative w-full overflow-auto">
				{#if isLoading}
					<TableSkeleton
						columns={availableColumns.map((c) => ({ key: c.id, label: c.label, width: '150px' }))}
						rows={10}
					/>
				{:else}
					<SchoolsTable
						tenants={data.tenants.data}
						{selectedIds}
						{loadingTenants}
						{sortBy}
						{sortOrder}
						{density}
						bind:visibleColumns
						onSelect={handleSelect}
						onSelectAll={handleSelectAll}
						onSort={handleSort}
					/>
				{/if}
			</div>
		</Card.Content>
		<Card.Footer class="flex items-center justify-between p-4">
			<div class="text-xs text-muted-foreground">
				{i18n.t('admin.schools.showingRange', {
					start: startItem,
					end: endItem,
					total: totalItems
				})}
			</div>
			<div class="flex items-center space-x-2">
				<Button
					variant="outline"
					size="sm"
					href={currentPage > 1 ? getUpdatedUrl(currentPage - 1) : undefined}
					disabled={currentPage <= 1}
				>
					<ChevronLeft class="h-4 w-4" />
					{i18n.t('pagination.previous')}
				</Button>
				<Button
					variant="outline"
					size="sm"
					href={currentPage < totalPages ? getUpdatedUrl(currentPage + 1) : undefined}
					disabled={currentPage >= totalPages}
				>
					{i18n.t('pagination.next')}
					<ChevronRight class="h-4 w-4" />
				</Button>
			</div>
		</Card.Footer>
	</Card.Root>
</div>

<ConfirmDialog
	bind:open={confirmDialogOpen}
	title={bulkAction === 'activate'
		? i18n.t('admin.schools.activateSchool')
		: i18n.t('admin.schools.deactivateSchool')}
	description={bulkAction === 'activate'
		? i18n.t('messages.confirm.activate', {
				item: `${selectedIds.length} ${i18n.t('nav.organizations').toLowerCase()}`
			})
		: i18n.t('messages.confirm.deactivate', {
				item: `${selectedIds.length} ${i18n.t('nav.organizations').toLowerCase()}`
			})}
	confirmText={bulkAction === 'activate'
		? i18n.t('actions.activate')
		: i18n.t('actions.deactivate')}
	variant={bulkAction === 'deactivate' ? 'destructive' : 'default'}
	onConfirm={handleBulkConfirm}
/>
