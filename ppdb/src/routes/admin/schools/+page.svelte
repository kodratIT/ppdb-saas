<script lang="ts">
	/* eslint-disable svelte/require-each-key */
	import type { PageData } from './$types';
	import { enhance } from '$app/forms';
	import { invalidate } from '$app/navigation';
	import { navigating, page } from '$app/state';
	import { goto } from '$app/navigation';
	import Button from '$lib/components/ui/button.svelte';
	import * as Table from '$lib/components/ui/table';
	import * as Card from '$lib/components/ui/card';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import Badge from '$lib/components/ui/badge.svelte';
	import Input from '$lib/components/ui/input.svelte';
	import KPICard from '$lib/components/admin/KPICard.svelte';
	import TableSkeleton from './components/TableSkeleton.svelte';
	import StatsCards from './components/StatsCards.svelte';
	import SchoolsTable from './components/SchoolsTable.svelte';
	import BulkActionToolbar from './components/BulkActionToolbar.svelte';
	import ConfirmDialog from './components/ConfirmDialog.svelte';
	import ExportButton from './components/ExportButton.svelte';
	import { toast } from 'svelte-sonner';
	import {
		Globe,
		ExternalLink,
		Power,
		School,
		Loader2,
		MoreHorizontal,
		Search,
		Plus,
		Filter,
		Shield,
		Activity,
		ChevronLeft,
		ChevronRight
	} from 'lucide-svelte';

	let { data } = $props<{ data: PageData }>();

	const totalSchools = $derived(data.tenants.total);
	const activeSchools = $derived(data.tenants.activeCount || 0);
	const isLoading = $derived(!!navigating.to);

	// Loading state for individual tenant actions
	let loadingTenants = $state<Set<string>>(new Set());

	// Selection state for bulk operations
	let selectedIds = $state<string[]>([]);
	let bulkLoading = $state(false);
	let confirmDialogOpen = $state(false);
	let bulkAction = $state<'activate' | 'deactivate'>('activate');

	function handleSelect(id: string, checked: boolean) {
		if (checked) {
			selectedIds = [...selectedIds, id];
		} else {
			selectedIds = selectedIds.filter((selectedId) => selectedId !== id);
		}
	}

	function handleSelectAll(checked: boolean) {
		if (checked) {
			selectedIds = data.tenants.data.map((t) => t.id);
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
		
		// Show loading toast
		const loadingToastId = toast.loading(
			`${bulkAction === 'activate' ? 'Activating' : 'Deactivating'} ${selectedIds.length} school(s)...`
		);
		
		try {
			const formData = new FormData();
			formData.append('tenantIds', JSON.stringify(selectedIds));
			formData.append('status', bulkAction === 'activate' ? 'active' : 'inactive');

			const response = await fetch('?/bulkUpdateStatus', {
				method: 'POST',
				body: formData
			});

			const result = await response.json();
			
			console.log('Bulk operation result:', result); // Debug
			
			// Dismiss loading toast
			toast.dismiss(loadingToastId);
			
			if (result.type === 'success') {
				const message = result.data?.message || `${selectedIds.length} school(s) ${bulkAction === 'activate' ? 'activated' : 'deactivated'} successfully`;
				console.log('Success message:', message); // Debug
				toast.success(message);
				selectedIds = [];
				await invalidate('admin:tenants');
			} else {
				const errorMessage = result.data?.error?.message || 'Bulk operation failed';
				console.log('Error message:', errorMessage); // Debug
				toast.error(errorMessage);
			}
		} catch (error) {
			console.error('Bulk operation error:', error);
			toast.dismiss(loadingToastId);
			toast.error('Failed to perform bulk operation');
		} finally {
			bulkLoading = false;
		}
	}

	// Search & Filter State
	let search = $state(page.url.searchParams.get('search') || '');
	let status = $state(page.url.searchParams.get('status') || 'all');
	let timer: ReturnType<typeof setTimeout>;

	function updateFilters() {
		const url = new URL(page.url);
		if (search) {
			url.searchParams.set('search', search);
		} else {
			url.searchParams.delete('search');
		}

		if (status && status !== 'all') {
			url.searchParams.set('status', status);
		} else {
			url.searchParams.delete('status');
		}

		url.searchParams.set('page', '1');
		goto(url.toString(), { keepFocus: true, replaceState: true });
	}

	function handleSearch() {
		clearTimeout(timer);
		timer = setTimeout(updateFilters, 300);
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

<div class="space-y-8 p-8 pt-6">
	<!-- Header -->
	<div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
		<div class="space-y-1">
			<h2 class="text-3xl font-bold tracking-tight">Schools Management</h2>
			<p class="text-muted-foreground">
				Manage access, monitor performance, and configure tenant settings.
			</p>
		</div>
		<Button href="/admin/register" class="w-full sm:w-auto">
			<Plus class="mr-2 h-4 w-4" /> Add New School
		</Button>
	</div>

	<!-- Stats Cards -->
	<div class="grid gap-4 md:grid-cols-3">
		<KPICard
			title="Total Schools"
			value={totalSchools}
			subtitle="Registered tenants"
			trendDirection="neutral"
		>
			{#snippet icon()}<School class="h-4 w-4" />{/snippet}
		</KPICard>
		<KPICard
			title="Active Schools"
			value={activeSchools}
			subtitle="Currently operational"
			trendDirection="up"
		>
			{#snippet icon()}<Activity class="h-4 w-4" />{/snippet}
		</KPICard>
		<KPICard
			title="Security Status"
			value="Enterprise"
			subtitle="System-wide protection"
			trendDirection="neutral"
		>
			{#snippet icon()}<Shield class="h-4 w-4" />{/snippet}
		</KPICard>
	</div>

	<!-- Main Content Card -->
	<Card.Root>
		<Card.Header>
			<div class="flex flex-col sm:flex-row items-center justify-between gap-4">
				<div class="space-y-1 text-left w-full">
					<Card.Title>All Schools</Card.Title>
					<Card.Description>A list of all registered schools in the system.</Card.Description>
				</div>
				<!-- Search & Filter Toolbar -->
				<div class="flex items-center gap-2 w-full sm:w-auto">
					<div class="relative flex-1 sm:w-64">
						<Search class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
						<Input
							type="search"
							placeholder="Search schools..."
							class="pl-8"
							bind:value={search}
							oninput={handleSearch}
						/>
					</div>
					<DropdownMenu.Root>
						<DropdownMenu.Trigger>
							<Button variant="outline" size="icon">
								<Filter class="h-4 w-4" />
							</Button>
						</DropdownMenu.Trigger>
						<DropdownMenu.Content align="end">
							<DropdownMenu.Label>Filter by Status</DropdownMenu.Label>
							<DropdownMenu.Separator />
							<DropdownMenu.Item on:click={() => { status = 'all'; updateFilters(); }}>
								All Status
							</DropdownMenu.Item>
							<DropdownMenu.Item on:click={() => { status = 'active'; updateFilters(); }}>
								Active
							</DropdownMenu.Item>
							<DropdownMenu.Item on:click={() => { status = 'inactive'; updateFilters(); }}>
								Inactive
							</DropdownMenu.Item>
						</DropdownMenu.Content>
					</DropdownMenu.Root>
				</div>
			</div>
		</Card.Header>
		<Card.Content class="p-0">
			<BulkActionToolbar
				selectedCount={selectedIds.length}
				onActivate={handleBulkActivate}
				onDeactivate={handleBulkDeactivate}
				onClear={handleClearSelection}
				loading={bulkLoading}
			/>
			<div class="relative w-full overflow-auto">
				{#if isLoading}
					<TableSkeleton rows={10} />
				{:else}
					<SchoolsTable
						tenants={data.tenants.data}
						{selectedIds}
						{loadingTenants}
						onSelect={handleSelect}
						onSelectAll={handleSelectAll}
					/>
				{/if}
			</div>
		</Card.Content>
		<Card.Footer class="flex items-center justify-between py-4">
			<div class="text-xs text-muted-foreground">
				Showing <strong>{startItem}-{endItem}</strong> of <strong>{totalItems}</strong> schools
			</div>
			<div class="flex items-center space-x-2">
				<Button
					variant="outline"
					size="sm"
					href={currentPage > 1 ? getUpdatedUrl(currentPage - 1) : undefined}
					disabled={currentPage <= 1}
				>
					<ChevronLeft class="h-4 w-4" />
					Previous
				</Button>
				<Button
					variant="outline"
					size="sm"
					href={currentPage < totalPages ? getUpdatedUrl(currentPage + 1) : undefined}
					disabled={currentPage >= totalPages}
				>
					Next
					<ChevronRight class="h-4 w-4" />
				</Button>
			</div>
		</Card.Footer>
	</Card.Root>
</div>

<ConfirmDialog
	bind:open={confirmDialogOpen}
	title={bulkAction === 'activate' ? 'Activate Schools' : 'Deactivate Schools'}
	description={`Are you sure you want to ${bulkAction} ${selectedIds.length} school(s)? This action will ${bulkAction === 'activate' ? 'enable access for' : 'disable access to'} the selected schools.`}
	confirmText={bulkAction === 'activate' ? 'Activate' : 'Deactivate'}
	variant={bulkAction === 'deactivate' ? 'destructive' : 'default'}
	onConfirm={handleBulkConfirm}
/>

