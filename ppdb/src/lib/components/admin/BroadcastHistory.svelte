<script lang="ts">
	import { i18n } from '$lib/i18n/index.svelte';
	import type { BroadcastRecord } from '$lib/types/admin';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Select from '$lib/components/ui/select';
	import { Badge } from '$lib/components/ui/badge';
	import {
		Eye,
		Send,
		RotateCcw,
		Search,
		Download,
		Clock,
		CheckCircle2,
		AlertCircle,
		Loader2,
		Filter,
		Calendar
	} from 'lucide-svelte';
	import { cn } from '$lib/utils';
	import { fade, slide } from 'svelte/transition';

	interface Props {
		history?: BroadcastRecord[];
		isLoading?: boolean;
		onViewDetails?: (id: string) => void;
		onResend?: (id: string) => void;
		onExport?: (filters: any) => void;
	}

	let { history = [], isLoading = false, onViewDetails, onResend, onExport } = $props<Props>();

	let statusFilter = $state('all');
	let searchQuery = $state('');
	let dateFrom = $state('');
	let dateTo = $state('');

	let currentPage = $state(1);
	let itemsPerPage = 10;

	let filteredHistory = $derived(
		history.filter((record) => {
			const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
			const matchesSearch =
				record.messagePreview.toLowerCase().includes(searchQuery.toLowerCase()) ||
				record.targetType.toLowerCase().includes(searchQuery.toLowerCase());

			const recordDate = new Date(record.createdAt).getTime();
			const matchesDateFrom = !dateFrom || recordDate >= new Date(dateFrom).getTime();
			const matchesDateTo = !dateTo || recordDate <= new Date(dateTo).getTime() + 86400000;

			return matchesStatus && matchesSearch && matchesDateFrom && matchesDateTo;
		})
	);

	let totalPages = $derived(Math.ceil(filteredHistory.length / itemsPerPage));
	let paginatedHistory = $derived(
		filteredHistory.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
	);

	function getStatusVariant(status: string) {
		switch (status) {
			case 'sent':
				return 'default';
			case 'scheduled':
				return 'secondary';
			case 'failed':
				return 'destructive';
			case 'pending':
				return 'outline';
			case 'cancelled':
				return 'outline';
			default:
				return 'outline';
		}
	}

	function getStatusIcon(status: string) {
		switch (status) {
			case 'sent':
				return CheckCircle2;
			case 'scheduled':
				return Clock;
			case 'failed':
				return AlertCircle;
			case 'pending':
				return Loader2;
			case 'cancelled':
				return RotateCcw;
			default:
				return Loader2;
		}
	}

	function formatDate(date: Date | string) {
		return new Intl.DateTimeFormat('id-ID', {
			dateStyle: 'medium',
			timeStyle: 'short'
		}).format(new Date(date));
	}

	function handleExport() {
		if (onExport) {
			onExport({ statusFilter, searchQuery, dateFrom, dateTo });
		}
	}

	function handleResend(id: string) {
		if (onResend) onResend(id);
	}

	function handleViewDetails(id: string) {
		if (onViewDetails) onViewDetails(id);
	}
</script>

<div class="space-y-6">
	<!-- Filters Bar -->
	<div
		class="flex flex-col md:flex-row gap-4 justify-between items-end bg-card p-4 rounded-xl border shadow-sm"
	>
		<div class="grid grid-cols-2 md:flex gap-4 w-full">
			<div class="space-y-1 w-full md:w-48">
				<Label class="text-[10px] font-black uppercase tracking-widest text-muted-foreground"
					>Status</Label
				>
				<Select.Root type="single" bind:value={statusFilter}>
					<Select.Trigger class="h-9">
						{statusFilter === 'all' ? 'All Status' : statusFilter.toUpperCase()}
					</Select.Trigger>
					<Select.Content>
						<Select.Item value="all">All Status</Select.Item>
						<Select.Item value="sent">Sent</Select.Item>
						<Select.Item value="scheduled">Scheduled</Select.Item>
						<Select.Item value="failed">Failed</Select.Item>
						<Select.Item value="pending">Pending</Select.Item>
					</Select.Content>
				</Select.Root>
			</div>

			<div class="space-y-1 w-full md:flex-1">
				<Label class="text-[10px] font-black uppercase tracking-widest text-muted-foreground"
					>Search</Label
				>
				<div class="relative">
					<Search class="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
					<Input
						bind:value={searchQuery}
						placeholder="Search messages or targets..."
						class="h-9 pl-9"
					/>
				</div>
			</div>

			<div class="space-y-1 w-full md:w-36">
				<Label class="text-[10px] font-black uppercase tracking-widest text-muted-foreground"
					>From</Label
				>
				<div class="relative">
					<Calendar
						class="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground"
					/>
					<Input type="date" bind:value={dateFrom} class="h-9 pl-9" />
				</div>
			</div>

			<div class="space-y-1 w-full md:w-36">
				<Label class="text-[10px] font-black uppercase tracking-widest text-muted-foreground"
					>To</Label
				>
				<div class="relative">
					<Calendar
						class="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground"
					/>
					<Input type="date" bind:value={dateTo} class="h-9 pl-9" />
				</div>
			</div>
		</div>

		<Button
			variant="outline"
			class="h-9 px-4 text-xs font-bold uppercase tracking-wider shrink-0"
			onclick={handleExport}
		>
			<Download class="w-3 h-3 mr-2" />
			Export
		</Button>
	</div>

	<!-- History Table -->
	<div class="bg-card rounded-xl border shadow-sm overflow-hidden">
		<div class="overflow-x-auto">
			<table class="w-full text-left border-collapse">
				<thead>
					<tr class="bg-muted/30 border-b">
						<th class="p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground"
							>Created At</th
						>
						<th class="p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground"
							>Target</th
						>
						<th class="p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground"
							>Message Preview</th
						>
						<th
							class="p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center"
							>Status</th
						>
						<th
							class="p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center"
							>Reach / Success</th
						>
						<th
							class="p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right"
							>Actions</th
						>
					</tr>
				</thead>
				<tbody class="divide-y">
					{#each paginatedHistory as record (record.id)}
						<tr class="hover:bg-muted/20 transition-colors group">
							<td class="p-4">
								<div class="flex flex-col">
									<span class="text-xs font-bold">{formatDate(record.createdAt)}</span>
									{#if record.senderName}
										<span class="text-[10px] text-muted-foreground">by {record.senderName}</span>
									{/if}
								</div>
							</td>
							<td class="p-4 text-xs font-medium">
								<Badge variant="outline" class="text-[10px] uppercase font-black px-1.5 py-0">
									{record.targetType}
								</Badge>
							</td>
							<td class="p-4">
								<p class="text-xs text-muted-foreground line-clamp-1 max-w-sm italic">
									"{record.messagePreview}"
								</p>
							</td>
							<td class="p-4 text-center">
								<Badge
									variant={getStatusVariant(record.status)}
									class="text-[9px] uppercase font-black tracking-tight flex items-center gap-1.5 mx-auto w-fit"
								>
									{@const Icon = getStatusIcon(record.status)}
									<Icon class={cn('w-2.5 h-2.5', record.status === 'pending' && 'animate-spin')} />
									{record.status}
								</Badge>
							</td>
							<td class="p-4 text-center">
								<div class="flex flex-col items-center">
									<span class="text-xs font-bold tabular-nums">
										{record.sentCount} / {record.targetCount}
									</span>
									<div class="w-16 h-1 bg-muted rounded-full mt-1 overflow-hidden">
										<div
											class={cn(
												'h-full transition-all duration-1000',
												record.status === 'failed' ? 'bg-destructive' : 'bg-primary'
											)}
											style="width: {record.targetCount > 0
												? (record.sentCount / record.targetCount) * 100
												: 0}%"
										></div>
									</div>
								</div>
							</td>
							<td class="p-4 text-right">
								<div
									class="flex justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity"
								>
									<Button
										variant="ghost"
										size="icon"
										class="h-8 w-8 text-muted-foreground hover:text-primary"
										onclick={() => handleViewDetails(record.id)}
									>
										<Eye class="h-4 w-4" />
									</Button>
									<Button
										variant="ghost"
										size="icon"
										class="h-8 w-8 text-muted-foreground hover:text-primary"
										onclick={() => handleResend(record.id)}
									>
										<Send class="h-4 w-4" />
									</Button>
								</div>
							</td>
						</tr>
					{/each}
					{#if paginatedHistory.length === 0}
						<tr>
							<td colspan="6" class="p-12 text-center text-muted-foreground italic text-sm">
								No broadcast records found.
							</td>
						</tr>
					{/if}
				</tbody>
			</table>
		</div>

		<!-- Pagination -->
		{#if totalPages > 1}
			<div class="flex items-center justify-between px-4 py-3 bg-muted/10 border-t">
				<div class="text-[10px] text-muted-foreground font-black uppercase tracking-widest">
					Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(
						currentPage * itemsPerPage,
						filteredHistory.length
					)} of {filteredHistory.length}
				</div>
				<div class="flex gap-2">
					<Button
						variant="outline"
						size="sm"
						disabled={currentPage === 1}
						onclick={() => (currentPage -= 1)}
						class="h-8 text-[10px] font-black uppercase tracking-widest"
					>
						Previous
					</Button>
					<Button
						variant="outline"
						size="sm"
						disabled={currentPage === totalPages}
						onclick={() => (currentPage += 1)}
						class="h-8 text-[10px] font-black uppercase tracking-widest"
					>
						Next
					</Button>
				</div>
			</div>
		{/if}
	</div>
</div>
