<script lang="ts">
	import {
		Table,
		TableBody,
		TableCell,
		TableHead,
		TableHeader,
		TableRow,
		Badge,
		Button,
		Switch
	} from '$lib/components/ui';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import { Label } from '$lib/components/ui/label';
	import {
		Building2,
		LayoutGrid,
		Trash2,
		Loader2,
		Columns3,
		ChevronDown,
		Rows3,
		Pencil
	} from 'lucide-svelte';
	import { i18n } from '$lib/i18n/index.svelte';
	import type {
		Unit,
		Tenant,
		AdminUser,
		TableDensity,
		GroupedUnits,
		ColumnConfig
	} from '$lib/types/admin';
	import UnitFormDialog from './UnitFormDialog.svelte';

	interface Props {
		units: Unit[];
		tenants?: Tenant[];
		user: AdminUser;
		loading?: boolean;
		density?: TableDensity;
		visibleColumns?: string[];
		groupByTenant?: boolean;
		onDelete?: (unit: Unit) => void;
		onDensityChange?: (density: TableDensity) => void;
		onColumnToggle?: (column: string, visible: boolean) => void;
		onGroupByTenantChange?: (enabled: boolean) => void;
	}

	let {
		units = [],
		tenants = [],
		user,
		loading = false,
		density = $bindable('normal'),
		visibleColumns = $bindable(['name', 'level', 'npsn', 'accreditation', 'actions']),
		groupByTenant = $bindable(true),
		onDelete,
		onDensityChange,
		onColumnToggle,
		onGroupByTenantChange
	}: Props = $props();

	// Column configurations
	const columns: ColumnConfig[] = [
		{ id: 'name', label: i18n.t('admin.units.unitName'), visible: true },
		{ id: 'level', label: i18n.t('admin.units.level'), visible: true, sortable: true },
		{ id: 'npsn', label: i18n.t('admin.units.npsn'), visible: true },
		{ id: 'accreditation', label: i18n.t('admin.units.accreditation'), visible: true },
		{ id: 'contact', label: i18n.t('admin.units.waAdmin'), visible: false },
		{ id: 'actions', label: i18n.t('admin.units.action'), visible: true }
	];

	// Edit dialog state
	let editDialogOpen = $state(false);
	let selectedUnit = $state<Unit | undefined>(undefined);
	let deletingUnitId = $state<string | null>(null);

	// Density config
	const densityOptions: { value: TableDensity; label: string }[] = [
		{ value: 'compact', label: i18n.t('admin.units.density.compact') ?? 'Compact' },
		{ value: 'normal', label: i18n.t('admin.units.density.normal') ?? 'Normal' },
		{ value: 'comfortable', label: i18n.t('admin.units.density.comfortable') ?? 'Comfortable' }
	];

	// Density CSS classes
	const densityClasses: Record<TableDensity, string> = {
		compact: 'py-1.5',
		normal: 'py-3',
		comfortable: 'py-5'
	};

	// Group units by tenant
	const groupedUnits = $derived.by((): GroupedUnits[] => {
		if (!groupByTenant) {
			// Return single group with all units
			return [
				{
					id: 'all',
					name: i18n.t('admin.units.allUnits'),
					units
				}
			];
		}

		const groups: Record<string, { name: string; units: Unit[] }> = {};
		units.forEach((unit) => {
			const tenantId = unit.tenantId;
			if (!groups[tenantId]) {
				groups[tenantId] = {
					name: unit.tenant?.name || i18n.t('admin.units.singleSchool'),
					units: []
				};
			}
			groups[tenantId].units.push(unit);
		});
		return Object.entries(groups).map(([id, group]) => ({ id, ...group }));
	});

	// Check if column is visible
	function isColumnVisible(columnId: string): boolean {
		return visibleColumns.includes(columnId);
	}

	// Toggle column visibility
	function toggleColumn(columnId: string) {
		const isVisible = visibleColumns.includes(columnId);
		if (isVisible) {
			visibleColumns = visibleColumns.filter((c) => c !== columnId);
		} else {
			visibleColumns = [...visibleColumns, columnId];
		}
		onColumnToggle?.(columnId, !isVisible);
	}

	// Handle density change
	function handleDensityChange(value: TableDensity) {
		density = value;
		onDensityChange?.(value);
		// Persist to localStorage
		if (typeof localStorage !== 'undefined') {
			localStorage.setItem('units-table-density', value);
		}
	}

	// Handle group toggle
	function handleGroupToggle(checked: boolean) {
		groupByTenant = checked;
		onGroupByTenantChange?.(checked);
	}

	// Handle edit
	function handleEdit(unit: Unit) {
		selectedUnit = unit;
		editDialogOpen = true;
	}

	// Handle delete
	function handleDelete(unit: Unit) {
		deletingUnitId = unit.id;
		onDelete?.(unit);
	}

	// Count visible columns for colspan
	const visibleColumnCount = $derived(columns.filter((c) => isColumnVisible(c.id)).length);

	// Load density from localStorage on mount
	$effect(() => {
		if (typeof localStorage !== 'undefined') {
			const savedDensity = localStorage.getItem('units-table-density') as TableDensity | null;
			if (savedDensity && ['compact', 'normal', 'comfortable'].includes(savedDensity)) {
				density = savedDensity;
			}
		}
	});
</script>

<!-- Table Controls -->
<div class="flex flex-wrap items-center justify-between gap-4 mb-4">
	<div class="flex items-center gap-4">
		<!-- Group by Tenant Toggle -->
		{#if user.role === 'super_admin'}
			<div class="flex items-center gap-2">
				<Switch id="group-by-tenant" checked={groupByTenant} onCheckedChange={handleGroupToggle} />
				<Label for="group-by-tenant" class="text-sm cursor-pointer">
					{i18n.t('admin.units.groupByFoundation')}
				</Label>
			</div>
		{/if}
	</div>

	<div class="flex items-center gap-2">
		<!-- Density Selector -->
		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				{#snippet child({ props })}
					<Button variant="outline" size="sm" {...props}>
						<Rows3 class="h-4 w-4 mr-2" />
						{densityOptions.find((d) => d.value === density)?.label || 'Normal'}
						<ChevronDown class="h-3 w-3 ml-1" />
					</Button>
				{/snippet}
			</DropdownMenu.Trigger>
			<DropdownMenu.Content align="end">
				{#each densityOptions as option}
					<DropdownMenu.CheckboxItem
						checked={density === option.value}
						onCheckedChange={() => handleDensityChange(option.value)}
					>
						{option.label}
					</DropdownMenu.CheckboxItem>
				{/each}
			</DropdownMenu.Content>
		</DropdownMenu.Root>

		<!-- Column Visibility -->
		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				{#snippet child({ props })}
					<Button variant="outline" size="sm" {...props}>
						<Columns3 class="h-4 w-4 mr-2" />
						{i18n.t('admin.units.columns')}
						<ChevronDown class="h-3 w-3 ml-1" />
					</Button>
				{/snippet}
			</DropdownMenu.Trigger>
			<DropdownMenu.Content align="end">
				{#each columns.filter((c) => c.id !== 'actions') as column}
					<DropdownMenu.CheckboxItem
						checked={isColumnVisible(column.id)}
						onCheckedChange={() => toggleColumn(column.id)}
					>
						{column.label}
					</DropdownMenu.CheckboxItem>
				{/each}
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</div>
</div>

<!-- Units Table -->
<div class="rounded-lg border overflow-hidden">
	<Table>
		<TableHeader>
			<TableRow class="bg-muted/50 hover:bg-muted/50 border-b-0">
				{#if isColumnVisible('name')}
					<TableHead class="pl-6 {densityClasses[density]} text-foreground font-semibold">
						{i18n.t('admin.units.unitName')}
					</TableHead>
				{/if}
				{#if isColumnVisible('level')}
					<TableHead class="{densityClasses[density]} text-foreground font-semibold">
						{i18n.t('admin.units.level')}
					</TableHead>
				{/if}
				{#if isColumnVisible('npsn')}
					<TableHead class="{densityClasses[density]} text-foreground font-semibold">
						{i18n.t('admin.units.npsn')}
					</TableHead>
				{/if}
				{#if isColumnVisible('accreditation')}
					<TableHead class="{densityClasses[density]} text-foreground font-semibold">
						{i18n.t('admin.units.accreditation')}
					</TableHead>
				{/if}
				{#if isColumnVisible('contact')}
					<TableHead class="{densityClasses[density]} text-foreground font-semibold">
						{i18n.t('admin.units.waAdmin')}
					</TableHead>
				{/if}
				{#if isColumnVisible('actions')}
					<TableHead
						class="text-right pr-6 {densityClasses[density]} text-foreground font-semibold"
					>
						{i18n.t('admin.units.action')}
					</TableHead>
				{/if}
			</TableRow>
		</TableHeader>
		<TableBody>
			{#if loading}
				<!-- Loading Skeleton -->
				{#each Array(5) as _}
					<TableRow>
						<TableCell colspan={visibleColumnCount} class="{densityClasses[density]} pl-6">
							<div class="flex items-center gap-3">
								<Skeleton class="h-8 w-8 rounded-lg" />
								<div class="flex flex-col gap-1">
									<Skeleton class="h-4 w-40" />
									<Skeleton class="h-3 w-24" />
								</div>
							</div>
						</TableCell>
					</TableRow>
				{/each}
			{:else if groupedUnits.length === 0 || (groupedUnits.length === 1 && groupedUnits[0].units.length === 0)}
				<!-- Empty State -->
				<TableRow>
					<TableCell colspan={visibleColumnCount} class="h-24 text-center text-muted-foreground">
						{i18n.t('common.none')}
					</TableCell>
				</TableRow>
			{:else}
				{#each groupedUnits as group (group.id)}
					<!-- Foundation Group Header -->
					{#if groupByTenant && user.role === 'super_admin'}
						<TableRow
							class="bg-primary/5 hover:bg-primary/10 border-y transition-colors text-xs uppercase tracking-wider font-bold"
						>
							<TableCell
								colspan={visibleColumnCount}
								class="{densityClasses[density]} pl-6 text-primary"
							>
								<div class="flex items-center gap-2">
									<Building2 class="h-4 w-4" />
									{group.name}
									<div class="h-1 w-1 rounded-full bg-primary/30"></div>
									<span class="text-[10px] text-primary/70 font-medium lowercase">
										{i18n.t('admin.units.unit', { count: group.units.length })}
									</span>
								</div>
							</TableCell>
						</TableRow>
					{/if}

					<!-- Units in this Group -->
					{#each group.units as unit (unit.id)}
						<TableRow class="group border-b last:border-0 hover:bg-muted/30 transition-colors">
							{#if isColumnVisible('name')}
								<TableCell
									class="font-medium {groupByTenant && user.role === 'super_admin'
										? 'pl-10'
										: 'pl-6'} {densityClasses[density]}"
								>
									<div class="flex items-center gap-3">
										<div
											class="rounded-lg bg-muted p-2 group-hover:bg-primary/10 group-hover:text-primary transition-colors"
										>
											<LayoutGrid class="h-4 w-4" />
										</div>
										<div class="flex flex-col gap-0.5">
											<span class="text-sm">{unit.name}</span>
											{#if unit.address}
												<span class="text-[10px] text-muted-foreground line-clamp-1 max-w-[250px]">
													{unit.address}
												</span>
											{/if}
										</div>
									</div>
								</TableCell>
							{/if}
							{#if isColumnVisible('level')}
								<TableCell class={densityClasses[density]}>
									<Badge variant="secondary" class="text-[10px] px-2 py-0 h-5 font-bold">
										{unit.level}
									</Badge>
								</TableCell>
							{/if}
							{#if isColumnVisible('npsn')}
								<TableCell
									class="text-xs font-mono text-muted-foreground {densityClasses[density]}"
								>
									{unit.npsn || '-'}
								</TableCell>
							{/if}
							{#if isColumnVisible('accreditation')}
								<TableCell class="text-xs {densityClasses[density]}">
									{#if unit.accreditation}
										<Badge
											variant={unit.accreditation === 'A' ? 'default' : 'secondary'}
											class="text-[10px]"
										>
											{unit.accreditation}
										</Badge>
									{:else}
										<span class="text-muted-foreground">-</span>
									{/if}
								</TableCell>
							{/if}
							{#if isColumnVisible('contact')}
								<TableCell class="text-xs text-muted-foreground {densityClasses[density]}">
									{unit.contactPhone || '-'}
								</TableCell>
							{/if}
							{#if isColumnVisible('actions')}
								<TableCell class="text-right pr-6 {densityClasses[density]}">
									<div class="flex items-center justify-end gap-1">
										<Button
											variant="ghost"
											size="icon"
											class="h-8 w-8 text-muted-foreground hover:text-primary"
											onclick={() => handleEdit(unit)}
											aria-label={i18n.t('admin.units.editUnit', { name: unit.name })}
										>
											<Pencil class="h-4 w-4" />
											<span class="sr-only">{i18n.t('common.edit')}</span>
										</Button>
										<Button
											variant="ghost"
											size="icon"
											class="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 w-8"
											onclick={() => handleDelete(unit)}
											disabled={deletingUnitId === unit.id}
											aria-label={i18n.t('common.delete')}
										>
											{#if deletingUnitId === unit.id}
												<Loader2 class="h-4 w-4 animate-spin" />
											{:else}
												<Trash2 class="h-4 w-4" />
											{/if}
											<span class="sr-only">{i18n.t('common.delete')}</span>
										</Button>
									</div>
								</TableCell>
							{/if}
						</TableRow>
					{/each}
				{/each}
			{/if}
		</TableBody>
	</Table>
</div>

<!-- Edit Dialog -->
<UnitFormDialog
	bind:open={editDialogOpen}
	mode="edit"
	unit={selectedUnit}
	{tenants}
	{user}
	onClose={() => {
		editDialogOpen = false;
		selectedUnit = undefined;
	}}
/>
