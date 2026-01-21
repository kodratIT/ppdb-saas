<script lang="ts">
	import type { PageData } from './$types';
	import { enhance } from '$app/forms';
	import { invalidateAll, goto } from '$app/navigation';
	import { page } from '$app/state';
	import { toast } from 'svelte-sonner';
	import { i18n } from '$lib/i18n/index.svelte';
	import {
		Table,
		TableBody,
		TableCell,
		TableHead,
		TableHeader,
		TableRow,
		Select,
		SelectContent,
		SelectItem,
		SelectTrigger,
		Input,
		Badge,
		Button
	} from '$lib/components/ui';
	import * as Card from '$lib/components/ui/card';
	import AddUnitDialog from './components/AddUnitDialog.svelte';
	import EditUnitDialog from './components/EditUnitDialog.svelte';
	import ConfirmDialog from '../schools/components/ConfirmDialog.svelte';
	import {
		School,
		Trash2,
		Calendar,
		LayoutGrid,
		Building2,
		Loader2,
		Search,
		Filter,
		X
	} from 'lucide-svelte';

	let { data } = $props<{ data: PageData }>();

	let unitToDelete = $state<string | null>(null);
	let isConfirmOpen = $state(false);
	let isDeleting = $state(false);

	// Filter states
	let search = $state(data.filters.search);
	let selectedLevelFilter = $state(data.filters.level);
	let selectedTenantIdFilter = $state(data.filters.tenantId);

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

	// Group units by tenant for easier viewing
	const groupedUnits = $derived.by(() => {
		const groups: Record<string, { name: string; units: any[] }> = {};
		data.units.forEach((unit: any) => {
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

	function confirmDelete(id: string) {
		unitToDelete = id;
		isConfirmOpen = true;
	}

	function formatDate(date: any) {
		try {
			if (!date) return '-';
			return new Intl.DateTimeFormat(i18n.language === 'id' ? 'id-ID' : 'en-US', {
				day: 'numeric',
				month: 'long',
				year: 'numeric'
			}).format(new Date(date));
		} catch (e) {
			return '-';
		}
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
		<input type="hidden" name="id" value={unitToDelete} />
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
		<AddUnitDialog tenants={data.tenants} user={data.user} />
	</div>

	<!-- Stats -->
	<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="text-sm font-medium">{i18n.t('admin.units.totalUnits')}</Card.Title>
				<School class="h-4 w-4 text-muted-foreground" />
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold">{data.units.length}</div>
				<p class="text-xs text-muted-foreground">{i18n.t('admin.units.unitsMatching')}</p>
			</Card.Content>
		</Card.Root>
	</div>

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
				{#if data.user.role === 'super_admin'}
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
									{data.tenants.find((t: any) => t.id === selectedTenantIdFilter)?.name ||
										i18n.t('admin.units.allFoundations')}
								</span>
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">{i18n.t('admin.units.allFoundations')}</SelectItem>
								{#each data.tenants as tenant}
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
				>
					<X class="h-4 w-4" />
				</Button>
			</div>
		</Card.Content>
	</Card.Root>

	<!-- Units Table with Grouping -->
	<Card.Root>
		<Card.Header>
			<Card.Title>{i18n.t('admin.units.centralizedList')}</Card.Title>
			<Card.Description>{i18n.t('admin.units.centralizedDesc')}</Card.Description>
		</Card.Header>
		<Card.Content class="p-0 overflow-hidden">
			<Table>
				<TableHeader>
					<TableRow class="bg-muted/50 hover:bg-muted/50 border-b-0">
						<TableHead class="pl-6 py-3 text-foreground font-semibold"
							>{i18n.t('admin.units.unitName')}</TableHead
						>
						<TableHead class="py-3 text-foreground font-semibold"
							>{i18n.t('admin.units.level')}</TableHead
						>
						<TableHead class="py-3 text-foreground font-semibold"
							>{i18n.t('admin.units.npsn')}</TableHead
						>
						<TableHead class="text-right pr-6 py-3 text-foreground font-semibold"
							>{i18n.t('admin.units.action')}</TableHead
						>
					</TableRow>
				</TableHeader>
				<TableBody>
					{#if groupedUnits.length === 0}
						<TableRow>
							<TableCell colspan={4} class="h-24 text-center text-muted-foreground">
								{i18n.t('common.none')}
							</TableCell>
						</TableRow>
					{:else}
						{#each groupedUnits as group (group.id)}
							<!-- Foundation Group Header -->
							<TableRow
								class="bg-primary/5 hover:bg-primary/10 border-y transition-colors text-xs uppercase tracking-wider font-bold"
							>
								<TableCell colspan={4} class="py-2.5 pl-6 text-primary">
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

							<!-- Units in this Foundation -->
							{#each group.units as unit (unit.id)}
								<TableRow class="group border-b last:border-0 hover:bg-muted/30 transition-colors">
									<TableCell class="font-medium pl-10 py-4">
										<div class="flex items-center gap-3">
											<div
												class="rounded-lg bg-muted p-2 group-hover:bg-primary/10 group-hover:text-primary transition-colors"
											>
												<LayoutGrid class="h-4 w-4" />
											</div>
											<div class="flex flex-col gap-0.5">
												<span class="text-sm">{unit.name}</span>
												{#if unit.address}
													<span
														class="text-[10px] text-muted-foreground line-clamp-1 max-w-[250px]"
													>
														{unit.address}
													</span>
												{/if}
											</div>
										</div>
									</TableCell>
									<TableCell>
										<Badge variant="secondary" class="text-[10px] px-2 py-0 h-5 font-bold">
											{unit.level}
										</Badge>
									</TableCell>
									<TableCell class="text-xs font-mono text-muted-foreground">
										{unit.npsn || '-'}
									</TableCell>
									<TableCell class="text-right pr-6">
										<div class="flex items-center justify-end gap-1">
											<EditUnitDialog {unit} tenants={data.tenants} user={data.user} />
											<Button
												variant="ghost"
												size="icon"
												class="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 w-8"
												onclick={() => confirmDelete(unit.id)}
												disabled={isDeleting && unitToDelete === unit.id}
											>
												{#if isDeleting && unitToDelete === unit.id}
													<Loader2 class="h-4 w-4 animate-spin" />
												{:else}
													<Trash2 class="h-4 w-4" />
												{/if}
												<span class="sr-only">{i18n.t('common.delete')}</span>
											</Button>
										</div>
									</TableCell>
								</TableRow>
							{/each}
						{/each}
					{/if}
				</TableBody>
			</Table>
		</Card.Content>
	</Card.Root>
</div>

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
