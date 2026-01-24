<script lang="ts">
	import { i18n } from '$lib/i18n/index.svelte';
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
		Pencil,
		Trash2,
		Send,
		Archive,
		Copy,
		AlertTriangle,
		Clock,
		CheckCircle2,
		FileText,
		ArchiveRestore
	} from 'lucide-svelte';
	import { cn } from '$lib/utils';

	interface Announcement {
		id: string;
		title: string;
		content: string;
		status: 'draft' | 'scheduled' | 'published' | 'archived';
		priority: 'low' | 'normal' | 'high' | 'urgent';
		category: string | null;
		viewCount: number;
		createdAt: Date;
		publishedAt: Date | null;
		scheduledAt: Date | null;
	}

	interface Props {
		announcements?: Announcement[];
		categories?: string[];
		pagination?: { page: number; total: number; totalPages: number };
		filters?: { status: string; category: string; priority: string; search: string };
		isLoading?: boolean;
		onPageChange?: (page: number) => void;
		onFilterChange?: (filters: Record<string, string>) => void;
		onView?: (id: string) => void;
		onEdit?: (id: string) => void;
		onDelete?: (id: string) => void;
		onPublish?: (id: string) => void;
		onArchive?: (id: string) => void;
		onUnarchive?: (id: string) => void;
		onDuplicate?: (id: string) => void;
	}

	let {
		announcements = [],
		categories = [],
		pagination = { page: 1, total: 0, totalPages: 1 },
		filters = { status: 'all', category: 'all', priority: 'all', search: '' },
		isLoading = false,
		onPageChange,
		onFilterChange,
		onView,
		onEdit,
		onDelete,
		onPublish,
		onArchive,
		onUnarchive,
		onDuplicate
	} = $props<Props>();

	let selectedIds = $state<string[]>([]);
	let searchQuery = $state(filters.search);
	let statusFilter = $state(filters.status);
	let categoryFilter = $state(filters.category);
	let priorityFilter = $state(filters.priority);

	let selectAll = $derived(selectedIds.length === announcements.length && announcements.length > 0);

	function toggleSelectAll() {
		if (selectAll) {
			selectedIds = [];
		} else {
			selectedIds = announcements.map((a) => a.id);
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

	function handleCategoryChange(value: string) {
		categoryFilter = value;
		onFilterChange?.({ ...filters, category: value });
	}

	function handlePriorityChange(value: string) {
		priorityFilter = value;
		onFilterChange?.({ ...filters, priority: value });
	}

	function getStatusVariant(status: string) {
		switch (status) {
			case 'published':
				return 'default';
			case 'scheduled':
				return 'secondary';
			case 'draft':
				return 'outline';
			case 'archived':
				return 'outline';
			default:
				return 'outline';
		}
	}

	function getStatusIcon(status: string) {
		switch (status) {
			case 'published':
				return CheckCircle2;
			case 'scheduled':
				return Clock;
			case 'draft':
				return FileText;
			case 'archived':
				return Archive;
			default:
				return FileText;
		}
	}

	function getPriorityVariant(priority: string) {
		switch (priority) {
			case 'urgent':
				return 'destructive';
			case 'high':
				return 'default';
			case 'low':
				return 'secondary';
			default:
				return 'outline';
		}
	}

	function formatDate(date: Date | string | null) {
		if (!date) return '-';
		return new Intl.DateTimeFormat('id-ID', {
			dateStyle: 'medium',
			timeStyle: 'short'
		}).format(new Date(date));
	}

	function getPreviewText(content: string, maxLength = 80) {
		// Strip HTML tags
		const text = content.replace(/<[^>]*>/g, '');
		if (text.length <= maxLength) return text;
		return text.slice(0, maxLength) + '...';
	}
</script>

<div class="space-y-6">
	<!-- Filters -->
	<div
		class="flex flex-col md:flex-row gap-4 justify-between items-end bg-card p-4 rounded-xl border shadow-sm"
	>
		<div class="grid grid-cols-2 md:flex gap-4 w-full">
			<div class="space-y-1 w-full md:w-48">
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
						<Select.Item value="draft">Draft</Select.Item>
						<Select.Item value="scheduled">Scheduled</Select.Item>
						<Select.Item value="published">Published</Select.Item>
						<Select.Item value="archived">Archived</Select.Item>
					</Select.Content>
				</Select.Root>
			</div>

			<div class="space-y-1 w-full md:w-40">
				<Label class="text-[10px] font-black uppercase tracking-widest text-muted-foreground"
					>Priority</Label
				>
				<Select.Root type="single" bind:value={priorityFilter} onValueChange={handlePriorityChange}>
					<Select.Trigger class="h-9">
						{priorityFilter === 'all'
							? 'All Priority'
							: priorityFilter.charAt(0).toUpperCase() + priorityFilter.slice(1)}
					</Select.Trigger>
					<Select.Content>
						<Select.Item value="all">All Priority</Select.Item>
						<Select.Item value="low">Low</Select.Item>
						<Select.Item value="normal">Normal</Select.Item>
						<Select.Item value="high">High</Select.Item>
						<Select.Item value="urgent">Urgent</Select.Item>
					</Select.Content>
				</Select.Root>
			</div>

			{#if categories.length > 0}
				<div class="space-y-1 w-full md:w-40">
					<Label class="text-[10px] font-black uppercase tracking-widest text-muted-foreground"
						>Category</Label
					>
					<Select.Root
						type="single"
						bind:value={categoryFilter}
						onValueChange={handleCategoryChange}
					>
						<Select.Trigger class="h-9">
							{categoryFilter === 'all' ? 'All Categories' : categoryFilter}
						</Select.Trigger>
						<Select.Content>
							<Select.Item value="all">All Categories</Select.Item>
							{#each categories as cat}
								<Select.Item value={cat}>{cat}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>
			{/if}

			<div class="space-y-1 w-full md:flex-1 col-span-2 md:col-span-1">
				<Label class="text-[10px] font-black uppercase tracking-widest text-muted-foreground"
					>Search</Label
				>
				<div class="relative">
					<Search class="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
					<Input
						bind:value={searchQuery}
						placeholder="Search announcements..."
						class="h-9 pl-9"
						onkeydown={(e) => e.key === 'Enter' && handleSearch()}
					/>
				</div>
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
				<Button variant="outline" size="sm" onclick={() => (selectedIds = [])}>Clear</Button>
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
							>Title</th
						>
						<th
							class="p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center"
							>Status</th
						>
						<th
							class="p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center"
							>Priority</th
						>
						<th
							class="p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center"
							>Views</th
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
					{#each announcements as ann (ann.id)}
						<tr class="hover:bg-muted/20 transition-colors group">
							<td class="p-4">
								<Checkbox
									checked={selectedIds.includes(ann.id)}
									onCheckedChange={() => toggleSelect(ann.id)}
								/>
							</td>
							<td class="p-4">
								<div class="flex flex-col gap-1">
									<button
										class="text-sm font-bold text-left hover:text-primary transition-colors"
										onclick={() => onView?.(ann.id)}
									>
										{ann.title}
									</button>
									<p class="text-xs text-muted-foreground line-clamp-1">
										{getPreviewText(ann.content)}
									</p>
									{#if ann.category}
										<Badge variant="outline" class="w-fit text-[9px] px-1.5 py-0">
											{ann.category}
										</Badge>
									{/if}
								</div>
							</td>
							<td class="p-4 text-center">
								<Badge
									variant={getStatusVariant(ann.status)}
									class="text-[9px] uppercase font-black tracking-tight flex items-center gap-1.5 mx-auto w-fit"
								>
									{@const Icon = getStatusIcon(ann.status)}
									<Icon class="w-2.5 h-2.5" />
									{ann.status}
								</Badge>
							</td>
							<td class="p-4 text-center">
								<Badge
									variant={getPriorityVariant(ann.priority)}
									class="text-[9px] uppercase font-black tracking-tight flex items-center gap-1 mx-auto w-fit"
								>
									{#if ann.priority === 'urgent'}
										<AlertTriangle class="w-2.5 h-2.5" />
									{/if}
									{ann.priority}
								</Badge>
							</td>
							<td class="p-4 text-center">
								<span class="text-xs font-bold tabular-nums">{ann.viewCount}</span>
							</td>
							<td class="p-4">
								<div class="flex flex-col">
									<span class="text-xs font-medium">{formatDate(ann.createdAt)}</span>
									{#if ann.status === 'published' && ann.publishedAt}
										<span class="text-[10px] text-muted-foreground"
											>Published: {formatDate(ann.publishedAt)}</span
										>
									{:else if ann.status === 'scheduled' && ann.scheduledAt}
										<span class="text-[10px] text-muted-foreground"
											>Scheduled: {formatDate(ann.scheduledAt)}</span
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
										<DropdownMenu.Item onclick={() => onView?.(ann.id)}>
											<Eye class="mr-2 h-4 w-4" />
											View
										</DropdownMenu.Item>
										<DropdownMenu.Item onclick={() => onEdit?.(ann.id)}>
											<Pencil class="mr-2 h-4 w-4" />
											Edit
										</DropdownMenu.Item>
										<DropdownMenu.Item onclick={() => onDuplicate?.(ann.id)}>
											<Copy class="mr-2 h-4 w-4" />
											Duplicate
										</DropdownMenu.Item>
										<DropdownMenu.Separator />
										{#if ann.status === 'draft' || ann.status === 'scheduled'}
											<DropdownMenu.Item onclick={() => onPublish?.(ann.id)}>
												<Send class="mr-2 h-4 w-4" />
												Publish Now
											</DropdownMenu.Item>
										{/if}
										{#if ann.status !== 'archived'}
											<DropdownMenu.Item onclick={() => onArchive?.(ann.id)}>
												<Archive class="mr-2 h-4 w-4" />
												Archive
											</DropdownMenu.Item>
										{:else}
											<DropdownMenu.Item onclick={() => onUnarchive?.(ann.id)}>
												<ArchiveRestore class="mr-2 h-4 w-4" />
												Unarchive
											</DropdownMenu.Item>
										{/if}
										<DropdownMenu.Separator />
										<DropdownMenu.Item
											class="text-destructive focus:text-destructive"
											onclick={() => onDelete?.(ann.id)}
										>
											<Trash2 class="mr-2 h-4 w-4" />
											Delete
										</DropdownMenu.Item>
									</DropdownMenu.Content>
								</DropdownMenu.Root>
							</td>
						</tr>
					{/each}
					{#if announcements.length === 0}
						<tr>
							<td colspan="7" class="p-12 text-center text-muted-foreground italic text-sm">
								No announcements found.
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
