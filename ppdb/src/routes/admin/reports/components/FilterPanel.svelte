<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Filter, X, ChevronDown } from 'lucide-svelte';
	import { i18n } from '$lib/i18n/index.svelte';
	import { browser } from '$app/environment';

	let { schools, onFilterChange }: {
		schools: Array<{ id: string; name: string }>;
		onFilterChange: (filters: FilterState) => void;
	} = $props();

	interface FilterState {
		schoolIds: string[];
		planType: string;
		paymentStatus: string;
	}

	let filters = $state<FilterState>({
		schoolIds: [],
		planType: 'all',
		paymentStatus: 'all'
	});

	// Dropdown states - ensure they're reactive
	let showSchoolDropdown = $state(false);
	let showPlanDropdown = $state(false);
	let showStatusDropdown = $state(false);

	const planTypes = [
		{ value: 'all', label: 'All Plans' },
		{ value: 'basic', label: 'Basic' },
		{ value: 'pro', label: 'Pro' },
		{ value: 'enterprise', label: 'Enterprise' }
	];

	const paymentStatuses = [
		{ value: 'all', label: 'All Statuses' },
		{ value: 'paid', label: 'Paid' },
		{ value: 'pending', label: 'Pending' },
		{ value: 'failed', label: 'Failed' },
		{ value: 'refunded', label: 'Refunded' }
	];

	function toggleSchool(schoolId: string) {
		const index = filters.schoolIds.indexOf(schoolId);
		if (index === -1) {
			filters.schoolIds = [...filters.schoolIds, schoolId];
		} else {
			filters.schoolIds = filters.schoolIds.filter((id) => id !== schoolId);
		}
		onFilterChange(filters);
	}

	function toggleSchoolDropdown() {
		showSchoolDropdown = !showSchoolDropdown;
	}

	function togglePlanDropdown() {
		showPlanDropdown = !showPlanDropdown;
	}

	function toggleStatusDropdown() {
		showStatusDropdown = !showStatusDropdown;
	}

	function updateFilter(key: keyof FilterState, value: string) {
		filters = { ...filters, [key]: value };
		onFilterChange(filters);
	}

	function clearFilters() {
		filters = {
			schoolIds: [],
			planType: 'all',
			paymentStatus: 'all'
		};
		onFilterChange(filters);
	}

	function getActiveFilterCount(): number {
		let count = 0;
		if (filters.schoolIds.length > 0) count++;
		if (filters.planType !== 'all') count++;
		if (filters.paymentStatus !== 'all') count++;
		return count;
	}

	function handleClickOutside(event: MouseEvent) {
		const target = event.target as HTMLElement;
		
		// Check if click is inside any dropdown
		const clickedSchoolDropdown = target.closest('.school-dropdown');
		const clickedPlanDropdown = target.closest('.plan-dropdown');
		const clickedStatusDropdown = target.closest('.status-dropdown');
		const clickedSchoolButton = target.closest('.school-button');
		const clickedPlanButton = target.closest('.plan-button');
		const clickedStatusButton = target.closest('.status-button');

		// Close dropdown if click was outside
		if (!clickedSchoolDropdown && !clickedSchoolButton) {
			showSchoolDropdown = false;
		}
		if (!clickedPlanDropdown && !clickedPlanButton) {
			showPlanDropdown = false;
		}
		if (!clickedStatusDropdown && !clickedStatusButton) {
			showStatusDropdown = false;
		}
	}
</script>

<svelte:window onclick={handleClickOutside} />

<div class="flex items-center gap-2">
	<!-- School Filter -->
	<div class="relative school-button">
		<Button
			variant="outline"
			class="gap-2"
			onclick={toggleSchoolDropdown}
			aria-label="Filter by school"
		>
			<Filter class="h-4 w-4" />
			<span>Schools</span>
			{#if filters.schoolIds.length > 0}
				<span class="ml-auto bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
					{filters.schoolIds.length}
				</span>
			{/if}
			<ChevronDown class="h-4 w-4" />
		</Button>

		{#if showSchoolDropdown}
			<div class="absolute top-full mt-2 right-0 z-50 w-56 bg-popover border rounded-md shadow-lg school-dropdown dropdown-content">
				<div class="max-h-64 overflow-y-auto p-2">
					{#if schools.length === 0}
						<p class="text-sm text-muted-foreground text-center py-4">No schools available</p>
					{:else}
						{#each schools as school}
							<button
								class="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-accent"
								onclick={() => toggleSchool(school.id)}
							>
								<div class="flex h-4 w-4 items-center justify-center rounded border border-primary">
									{#if filters.schoolIds.includes(school.id)}
										<div class="h-2.5 w-2.5 rounded-sm bg-primary"></div>
									{/if}
								</div>
								<span class="flex-1 text-left">{school.name}</span>
							</button>
						{/each}
					{/if}
				</div>
			</div>
		{/if}
	</div>

	<!-- Plan Type Filter -->
	<div class="relative plan-button">
		<Button
			variant="outline"
			class="gap-2"
			onclick={togglePlanDropdown}
			aria-label="Filter by plan type"
		>
			<span>Plan</span>
			{#if filters.planType !== 'all'}
				<span class="ml-auto bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
					{planTypes.find((p) => p.value === filters.planType)?.label}
				</span>
			{/if}
			<ChevronDown class="h-4 w-4" />
		</Button>

		{#if showPlanDropdown}
			<div class="absolute top-full mt-2 right-0 z-50 w-40 bg-popover border rounded-md shadow-lg p-1 plan-dropdown dropdown-content">
				{#each planTypes as plan}
					<button
						class="flex w-full rounded px-2 py-1.5 text-sm hover:bg-accent text-left"
						onclick={() => {
							updateFilter('planType', plan.value);
							showPlanDropdown = false;
						}}
					>
						{plan.label}
					</button>
				{/each}
			</div>
		{/if}
	</div>

	<!-- Payment Status Filter -->
	<div class="relative status-button">
		<Button
			variant="outline"
			class="gap-2"
			onclick={toggleStatusDropdown}
			aria-label="Filter by payment status"
		>
			<span>Status</span>
			{#if filters.paymentStatus !== 'all'}
				<span class="ml-auto bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
					{paymentStatuses.find((s) => s.value === filters.paymentStatus)?.label}
				</span>
			{/if}
			<ChevronDown class="h-4 w-4" />
		</Button>

		{#if showStatusDropdown}
			<div class="absolute top-full mt-2 right-0 z-50 w-40 bg-popover border rounded-md shadow-lg p-1 status-dropdown dropdown-content">
				{#each paymentStatuses as status}
					<button
						class="flex w-full rounded px-2 py-1.5 text-sm hover:bg-accent text-left"
						onclick={() => {
							updateFilter('paymentStatus', status.value);
							showStatusDropdown = false;
						}}
					>
						{status.label}
					</button>
				{/each}
			</div>
		{/if}
	</div>

	<!-- Clear Filters -->
	{#if getActiveFilterCount() > 0}
		<Button variant="ghost" size="sm" class="gap-1" onclick={clearFilters}>
			<X class="h-4 w-4" />
			Clear ({getActiveFilterCount()})
		</Button>
	{/if}
</div>

<style>
	.dropdown-content :global(.bg-popover) {
		/* Ensure dropdowns have this class */
	}
</style>
