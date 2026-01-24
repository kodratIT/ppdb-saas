<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Badge } from '$lib/components/ui/badge';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import * as Select from '$lib/components/ui/select';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import {
		Search,
		MoreHorizontal,
		Eye,
		CheckCircle2,
		XCircle,
		Clock,
		AlertTriangle,
		Download,
		FileText,
		X
	} from 'lucide-svelte';
	import { cn } from '$lib/utils';
	import { formatCurrency } from '$lib/utils';

	export interface Payout {
		id: string;
		tenantName: string;
		amount: number;
		status: 'pending' | 'processed' | 'completed' | 'failed' | 'rejected';
		bankName: string;
		accountNumber: string;
		accountName: string;
		requestedByName: string;
		createdAt: Date | string;
		processedAt?: Date | string | null;
		reference?: string | null;
	}

	interface Props {
		payouts: Payout[];
		pagination: { page: number; total: number; totalPages: number };
		filters: { status: string; dateFrom: string; dateTo: string; search: string };
		isLoading?: boolean;
		onPageChange?: (page: number) => void;
		onFilterChange?: (filters: Record<string, string>) => void;
		onViewDetails?: (id: string) => void;
		onApprove?: (id: string) => void;
		onReject?: (id: string) => void;
		onProcess?: (id: string) => void;
		onBulkApprove?: (ids: string[]) => void;
		onBulkReject?: (ids: string[]) => void;
		onExport?: () => void;
	}

	let {
		payouts = [],
		pagination = { page: 1, total: 0, totalPages: 1 },
		filters = { status: 'all', dateFrom: '', dateTo: '', search: '' },
		isLoading = false,
		onPageChange,
		onFilterChange,
		onViewDetails,
		onApprove,
		onReject,
		onProcess,
		onBulkApprove,
		onBulkReject,
		onExport
	}: Props = $props();

	let selectedIds = $state<string[]>([]);
	let searchQuery = $state(filters.search);
	let statusFilter = $state(filters.status);
	let dateFrom = $state(filters.dateFrom);
	let dateTo = $state(filters.dateTo);

	let selectAll = $derived(selectedIds.length === payouts.length && payouts.length > 0);

	function toggleSelectAll() {
		if (selectAll) {
			selectedIds = [];
		} else {
			selectedIds = payouts.map((p) => p.id);
		}
	}

	function toggleSelect(id: string) {
		if (selectedIds.includes(id)) {
			selectedIds = selectedIds.filter((i) => i !== id);
		} else {
			selectedIds = [...selectedIds, id];
		}
	}

	function handleSearch() {
		onFilterChange?.({ ...filters, search: searchQuery });
	}

	function handleStatusChange(value: string) {
		statusFilter = value;
		onFilterChange?.({ ...filters, status: value });
	}

	function handleDateChange() {
		onFilterChange?.({ ...filters, dateFrom, dateTo });
	}

	function resetFilters() {
		searchQuery = '';
		statusFilter = 'all';
		dateFrom = '';
		dateTo = '';
		onFilterChange?.({ status: 'all', dateFrom: '', dateTo: '', search: '' });
	}

	function getStatusVariant(status: string) {
		switch (status) {
			case 'completed':
				return 'default';
			case 'processed':
				return 'secondary';
			case 'pending':
				return 'outline';
			case 'rejected':
				return 'destructive';
			case 'failed':
				return 'destructive';
			default:
				return 'outline';
		}
	}

	function getStatusIcon(status: string) {
		switch (status) {
			case 'completed':
				return CheckCircle2;
			case 'processed':
				return Clock;
			case 'pending':
				return Clock;
			case 'rejected':
				return XCircle;
			case 'failed':
				return AlertTriangle;
			default:
				return FileText;
		}
	}

	function formatDate(date: Date | string | null | undefined) {
		if (!date) return '-';
		return new Intl.DateTimeFormat('id-ID', {
			dateStyle: 'medium',
			timeStyle: 'short'
		}).format(new Date(date));
	}

	function maskAccountNumber(accountNumber: string) {
		if (accountNumber.length <= 8) return accountNumber;
		return accountNumber.slice(0, 4) + '****' + accountNumber.slice(-4);
	}
</script>

<div class="space-y-6">
	<!-- Filters -->
	<div
		class="flex flex-col md:flex-row gap-4 justify-between items-end bg-card p-4 rounded-xl border shadow-sm"
	>
		<div class="grid grid-cols-2 md:flex gap-4 w-full">
			<div class="space-y-1 w-full md:w-40">
				<Label class="text-[10px] font-black uppercase tracking-widest text-muted-foreground"
					>Status</Label
				>
				<Select.Root type="single" bind:value={statusFilter} onValueChange={handleStatusChange}>
					<Select.Trigger class="h-9">
						{statusFilter === 'all'
							? 'All Status'
							: statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
					</Select.Trigger>
					<Select.Content>
						<Select.Item value="all">All Status</Select.Item>
						<Select.Item value="pending">Pending</Select.Item>
						<Select.Item value="processed">Processed</Select.Item>
						<Select.Item value="completed">Completed</Select.Item>
						<Select.Item value="rejected">Rejected</Select.Item>
						<Select.Item value="failed">Failed</Select.Item>
					</Select.Content>
				</Select.Root>
			</div>

			<div class="space-y-1 w-full md:w-36">
				<Label class="text-[10px] font-black uppercase tracking-widest text-muted-foreground"
					>From</Label
				>
				<Input
					type="date"
					bind:value={dateFrom}
					onchange={handleDateChange}
					class="h-9 text-xs"
				/>
			</div>

			<div class="space-y-1 w-full md:w-36">
				<Label class="text-[10px] font-black uppercase tracking-widest text-muted-foreground"
					>To</Label
				>
				<Input type="date" bind:value={dateTo} onchange={handleDateChange} class="h-9 text-xs" />
			</div>

			<div class="space-y-1 w-full md:flex-1 col-span-2 md:col-span-1">
				<Label class="text-[10px] font-black uppercase tracking-widest text-muted-foreground"
					>Search</Label
				>
				<div class="relative">
					<Search class="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
					<Input
						bind:value={searchQuery}
						placeholder="Search tenant or account..."
						class="h-9 pl-9"
						onkeydown={(e) => e.key === 'Enter' && handleSearch()}
					/>
				</div>
			</div>

			<div class="flex gap-2 items-end">
				<Button variant="outline" size="sm" onclick={resetFilters} class="h-9">
					<X class="mr-1 h-3 w-3" />
					Reset
				</Button>
				<Button variant="outline" size="sm" onclick={onExport} class="h-9">
					<Download class="mr-1 h-3 w-3" />
					Export
				</Button>
			</div>
		</div>
	</div>

	<!-- Bulk Actions -->
	{#if selectedIds.length > 0}
		<div
			class="flex items-center gap-4 px-4 py-3 bg-primary/10 border border-primary/20 rounded-lg"
		>
			<span class="text-sm font-medium">{selectedIds.length} selected</span>
			<div class="flex gap-2">
				{#if onBulkApprove}
					<Button variant="outline" size="sm" onclick={() => onBulkApprove?.(selectedIds)}>
						<CheckCircle2 class="mr-1 h-3.5 w-3.5" />
						Approve All
					</Button>
				{/if}
				{#if onBulkReject}
					<Button variant="outline" size="sm" onclick={() => onBulkReject?.(selectedIds)}>
						<XCircle class="mr-1 h-3.5 w-3.5" />
						Reject All
					</Button>
				{/if}
				<Button variant="outline" size="sm" onclick={() => (selectedIds = [])}>
					Clear
				</Button>
			</div>
		</div>
	{/if}

	<!-- Table -->
	<div class="bg-card rounded-xl border shadow-sm overflow-hidden">
		<div class="overflow-x-auto">
			<table class="w-full text-left border-collapse">
				<thead>
					<tr class="bg-muted/30 border-b">
						<th class="p-4 w-10">
							<Checkbox checked={selectAll} onCheckedChange={toggleSelectAll} />
						</th>
						<th class="p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground"
							>Tenant</th
						>
						<th class="p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground"
							>Amount</th
						>
						<th class="p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground"
							>Bank Details</th
						>
						<th
							class="p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center"
							>Status</th
						>
						<th class="p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground"
							>Date</th
						>
						<th
							class="p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right"
							>Actions</th
						>
					</tr>
				</thead>
				<tbody class="divide-y">
					{#each payouts as payout (payout.id)}
						<tr class="hover:bg-muted/20 transition-colors group">
							<td class="p-4">
								<Checkbox
									checked={selectedIds.includes(payout.id)}
									onCheckedChange={() => toggleSelect(payout.id)}
								/>
							</td>
							<td class="p-4">
								<div class="flex flex-col gap-1">
									<button
										class="text-sm font-bold text-left hover:text-primary transition-colors"
										onclick={() => onViewDetails?.(payout.id)}
									>
										{payout.tenantName}
									</button>
									<p class="text-xs text-muted-foreground">
										by {payout.requestedByName}
									</p>
								</div>
							</td>
							<td class="p-4">
								<span class="text-sm font-bold tabular-nums">{formatCurrency(payout.amount)}</span>
							</td>
							<td class="p-4">
								<div class="flex flex-col gap-0.5">
									<span class="text-xs font-medium uppercase">{payout.bankName}</span>
									<span class="text-xs font-mono text-muted-foreground">
										{maskAccountNumber(payout.accountNumber)}
									</span>
									<span class="text-[10px] text-muted-foreground">{payout.accountName}</span>
								</div>
							</td>
							<td class="p-4 text-center">
								<Badge
									variant={getStatusVariant(payout.status)}
									class="text-[9px] uppercase font-black tracking-tight flex items-center gap-1.5 mx-auto w-fit"
								>
									<svelte:component this={getStatusIcon(payout.status)} class="w-2.5 h-2.5" />
									{payout.status}
								</Badge>
							</td>
							<td class="p-4">
								<div class="flex flex-col">
									<span class="text-xs font-medium">{formatDate(payout.createdAt)}</span>
									{#if payout.processedAt}
										<span class="text-[10px] text-muted-foreground"
											>Processed: {formatDate(payout.processedAt)}</span
										>
									{/if}
								</div>
							</td>
							<td class="p-4 text-right">
								<DropdownMenu.Root>
									<DropdownMenu.Trigger>
										{#snippet child({ props })}
											<Button variant="ghost" size="icon" class="h-8 w-8" {...props}>
												<MoreHorizontal class="h-4 w-4" />
											</Button>
										{/snippet}
									</DropdownMenu.Trigger>
									<DropdownMenu.Content align="end">
										<DropdownMenu.Item onclick={() => onViewDetails?.(payout.id)}>
											<Eye class="mr-2 h-4 w-4" />
											View Details
										</DropdownMenu.Item>
										<DropdownMenu.Separator />
										{#if payout.status === 'pending'}
											<DropdownMenu.Item onclick={() => onApprove?.(payout.id)}>
												<CheckCircle2 class="mr-2 h-4 w-4" />
												Approve
											</DropdownMenu.Item>
											<DropdownMenu.Item onclick={() => onReject?.(payout.id)}>
												<XCircle class="mr-2 h-4 w-4" />
												Reject
											</DropdownMenu.Item>
										{:else if payout.status === 'processed'}
											<DropdownMenu.Item onclick={() => onProcess?.(payout.id)}>
												<CheckCircle2 class="mr-2 h-4 w-4" />
												Mark Complete
											</DropdownMenu.Item>
										{/if}
									</DropdownMenu.Content>
								</DropdownMenu.Root>
							</td>
						</tr>
					{/each}
					{#if payouts.length === 0 && !isLoading}
						<tr>
							<td colspan="7" class="p-12 text-center text-muted-foreground italic text-sm">
								No payouts found.
							</td>
						</tr>
					{/if}
				</tbody>
			</table>
		</div>

		<!-- Pagination -->
		{#if pagination.totalPages > 1}
			<div class="flex items-center justify-between px-4 py-3 bg-muted/10 border-t">
				<div class="text-[10px] text-muted-foreground font-black uppercase tracking-widest">
					Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
				</div>
				<div class="flex gap-2">
					<Button
						variant="outline"
						size="sm"
						disabled={pagination.page === 1}
						onclick={() => onPageChange?.(pagination.page - 1)}
						class="h-8 text-[10px] font-black uppercase tracking-widest"
					>
						Previous
					</Button>
					<Button
						variant="outline"
						size="sm"
						disabled={pagination.page === pagination.totalPages}
						onclick={() => onPageChange?.(pagination.page + 1)}
						class="h-8 text-[10px] font-black uppercase tracking-widest"
					>
						Next
					</Button>
				</div>
			</div>
		{/if}
	</div>
</div>
