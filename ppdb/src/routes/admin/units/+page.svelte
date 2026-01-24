<script lang="ts">
	import type { PageData } from './$types';
	import { enhance } from '$app/forms';
	import { invalidateAll, goto } from '$app/navigation';
	import { page } from '$app/state';
	import { toast } from 'svelte-sonner';
	import { i18n } from '$lib/i18n/index.svelte';
	import {
		Input,
		Button,
		Select,
		SelectContent,
		SelectItem,
		SelectTrigger
	} from '$lib/components/ui';
	import * as Card from '$lib/components/ui/card';
	import { Search, Filter, Building2, X, Plus } from 'lucide-svelte';

	// Import refactored components
	import UnitsStatsCards from '$lib/components/admin/UnitsStatsCards.svelte';
	import UnitsTable from '$lib/components/admin/UnitsTable.svelte';
	import UnitFormDialog from '$lib/components/admin/UnitFormDialog.svelte';
	import ConfirmDialog from '../schools/components/ConfirmDialog.svelte';

	// Types
	import type { Unit, Tenant, AdminUser, TableDensity } from '$lib/types/admin';

	let { data } = $props<{ data: PageData }>();

	// Cast page data to proper types
	const units = $derived(data.units as Unit[]);
	const tenants = $derived(data.tenants as Tenant[]);
	const user = $derived(data.user as AdminUser);

	// Dialog states
	let unitToDelete = $state<Unit | null>(null);
	let isConfirmOpen = $state(false);
	let isDeleting = $state(false);
	let isAddDialogOpen = $state(false);

	// Table options
	let density = $state<TableDensity>('normal');
	let visibleColumns = $state<string[]>(['name', 'level', 'npsn', 'accreditation', 'actions']);
	let groupByTenant = $state(true);

	// Filter states
	let search = $state(data.filters.search);
	let selectedLevelFilter = $state(data.filters.level);
	let selectedTenantIdFilter = $state(data.filters.tenantId);

	// Sync filters with data changes
	$effect(() => {
		search = data.filters.search;
		selectedLevelFilter = data.filters.level;
		selectedTenantIdFilter = data.filters.tenantId;
	});

	const schoolLevels = [
		{ value: 'all', label: i18n.t('admin.units.allLevels') },
		{ value: 'TK', label: i18n.t('admin.units.levels.TK') },
		{ value: 'SD', label: i18n.t('admin.units.levels.SD') },
		{ value: 'SMP', label: i18n.t('admin.units.levels.SMP') },
		{ value: 'SMA', label: i18n.t('admin.units.levels.SMA') },
		{ value: 'SMK', label: i18n.t('admin.units.levels.SMK') },
		{ value: 'Universitas', label: i18n.t('admin.units.levels.Universitas') }
	];

	function updateFilters() {
		const url = new URL(page.url);
		if (search) url.searchParams.set('search', search);
		else url.searchParams.delete('search');

		if (selectedLevelFilter !== 'all') url.searchParams.set('level', selectedLevelFilter);
		else url.searchParams.delete('level');

		if (selectedTenantIdFilter !== 'all') url.searchParams.set('tenant_id', selectedTenantIdFilter);
		else url.searchParams.delete('tenant_id');

		goto(url.toString(), { keepFocus: true, replaceState: true });
	}

	let debounceTimer: ReturnType<typeof setTimeout>;
	function handleSearchInput() {
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(updateFilters, 300);
	}

	function resetFilters() {
		search = '';
		selectedLevelFilter = 'all';
		selectedTenantIdFilter = 'all';
		goto(page.url.pathname);
	}

	function handleLevelFilterChange(value: string | undefined) {
		if (!value) return;
		selectedLevelFilter = value;
		updateFilters();
	}

	function handleTenantFilterChange(value: string | undefined) {
		if (!value) return;
		selectedTenantIdFilter = value;
		updateFilters();
	}

	function confirmDelete(unit: Unit) {
		unitToDelete = unit;
		isConfirmOpen = true;
	}
</script>

<div class="space-y-6 p-8 pt-6">
	<!-- Hidden Form for Deletion -->
	<form
		id="delete-unit-form"
		method="POST"
		action="?/deleteUnit"
		use:enhance={() => {
			isDeleting = true;
			return async ({ result }) => {
				isDeleting = false;
				if (result.type === 'success') {
					toast.success(i18n.t('admin.units.deleteSuccess'));
					unitToDelete = null;
					isConfirmOpen = false;
					await invalidateAll();
				} else if (result.type === 'failure') {
					// @ts-ignore
					toast.error(result.data?.error || i18n.t('admin.units.deleteFailed'));
				}
			};
		}}
		class="hidden"
	>
		<input type="hidden" name="id" value={unitToDelete?.id ?? ''} />
	</form>

	<!-- Header -->
	<div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
		<div class="space-y-1">
			<h2 class="text-3xl font-bold tracking-tight text-foreground">
				{i18n.t('admin.units.title')}
			</h2>
			<p class="text-muted-foreground text-sm">
				{i18n.t('admin.units.subtitle')}
			</p>
		</div>
		<Button onclick={() => (isAddDialogOpen = true)}>
			<Plus class="mr-2 h-4 w-4" />
			{i18n.t('admin.units.addUnit')}
		</Button>
	</div>

	<!-- Stats Cards Component -->
	<UnitsStatsCards {units} />

	<!-- Filters Bar -->
	<Card.Root>
		<Card.Content class="p-4">
			<div class="flex flex-col md:flex-row items-end gap-4">
				<!-- Search -->
				<div class="flex-1 space-y-2 w-full">
					<div
						class="text-[10px] font-bold text-muted-foreground flex items-center gap-1 uppercase tracking-widest"
					>
						<Search class="h-3 w-3" />
						{i18n.t('admin.units.searchUnits')}
					</div>
					<Input
						placeholder={i18n.t('admin.units.searchPlaceholder')}
						bind:value={search}
						oninput={handleSearchInput}
						class="h-9"
						aria-label={i18n.t('admin.units.searchUnits')}
					/>
				</div>

				<!-- Level Filter -->
				<div class="w-full md:w-[180px] space-y-2">
					<div
						class="text-[10px] font-bold text-muted-foreground flex items-center gap-1 uppercase tracking-widest"
					>
						<Filter class="h-3 w-3" />
						{i18n.t('admin.units.level')}
					</div>
					<Select type="single" value={selectedLevelFilter} onValueChange={handleLevelFilterChange}>
						<SelectTrigger class="h-9">
							{schoolLevels.find((l) => l.value === selectedLevelFilter)?.label ||
								i18n.t('admin.units.allLevels')}
						</SelectTrigger>
						<SelectContent>
							{#each schoolLevels as level}
								<SelectItem value={level.value}>{level.label}</SelectItem>
							{/each}
						</SelectContent>
					</Select>
				</div>

				<!-- Tenant Filter (Super Admin Only) -->
				{#if user.role === 'super_admin'}
					<div class="w-full md:w-[220px] space-y-2">
						<div
							class="text-[10px] font-bold text-muted-foreground flex items-center gap-1 uppercase tracking-widest"
						>
							<Building2 class="h-3 w-3" />
							{i18n.t('admin.units.foundation')}
						</div>
						<Select
							type="single"
							value={selectedTenantIdFilter}
							onValueChange={handleTenantFilterChange}
						>
							<SelectTrigger class="h-9">
								<span class="truncate">
									{tenants.find((t) => t.id === selectedTenantIdFilter)?.name ||
										i18n.t('admin.units.allFoundations')}
								</span>
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">{i18n.t('admin.units.allFoundations')}</SelectItem>
								{#each tenants as tenant}
									<SelectItem value={tenant.id}>{tenant.name}</SelectItem>
								{/each}
							</SelectContent>
						</Select>
					</div>
				{/if}

				<!-- Reset -->
				<Button
					variant="outline"
					size="icon"
					class="h-9 w-9 shrink-0"
					onclick={resetFilters}
					title={i18n.t('admin.units.resetFilter')}
					aria-label={i18n.t('admin.units.resetFilter')}
				>
					<X class="h-4 w-4" />
				</Button>
			</div>
		</Card.Content>
	</Card.Root>

	<!-- Units Table Component -->
	<Card.Root>
		<Card.Header>
			<Card.Title>{i18n.t('admin.units.centralizedList')}</Card.Title>
			<Card.Description>{i18n.t('admin.units.centralizedDesc')}</Card.Description>
		</Card.Header>
		<Card.Content class="p-0 overflow-hidden">
			<div class="p-4 pt-0">
				<UnitsTable
					{units}
					{tenants}
					{user}
					bind:density
					bind:visibleColumns
					bind:groupByTenant
					onDelete={confirmDelete}
				/>
			</div>
		</Card.Content>
	</Card.Root>
</div>

<!-- Add Unit Dialog -->
<UnitFormDialog
	bind:open={isAddDialogOpen}
	mode="add"
	{tenants}
	{user}
	onClose={() => (isAddDialogOpen = false)}
/>

<!-- Delete Confirmation Dialog -->
<ConfirmDialog
	bind:open={isConfirmOpen}
	title={i18n.t('admin.units.deleteUnit')}
	description={i18n.t('admin.units.deleteDesc')}
	confirmText={isDeleting ? i18n.t('admin.units.deleting') : i18n.t('admin.units.confirmDelete')}
	variant="destructive"
	onConfirm={() => {
		const form = document.getElementById('delete-unit-form') as HTMLFormElement;
		form?.requestSubmit();
	}}
/>
