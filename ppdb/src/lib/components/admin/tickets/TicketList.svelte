<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import * as Table from '$lib/components/ui/table';
	import * as Select from '$lib/components/ui/select';
	import { Separator } from '$lib/components/ui/separator';
	import { Badge } from '$lib/components/ui/badge';
	import {
		Search,
		Filter,
		MoreHorizontal,
		ArrowUpDown,
		ChevronLeft,
		ChevronRight,
		User
	} from 'lucide-svelte';
	import { formatDistanceToNow } from 'date-fns';
	import { id as idLocale, enUS } from 'date-fns/locale';
	import { i18n } from '$lib/i18n/index.svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	interface Ticket {
		id: string;
		subject: string;
		status: 'open' | 'in_progress' | 'resolved' | 'closed';
		priority: 'low' | 'medium' | 'high' | 'critical';
		updatedAt: Date;
		tenant: { name: string };
		user: { name: string | null; email: string };
		assignee?: { name: string | null } | null;
	}

	interface Props {
		tickets: Ticket[];
		total: number;
		currentPage: number;
		totalPages: number;
		staffMembers?: { id: string; name: string | null }[];
		isLoading?: boolean;
	}

	let {
		tickets,
		total,
		currentPage,
		totalPages,
		staffMembers = [],
		isLoading = false
	}: Props = $props();

	let searchQuery = $state($page.url.searchParams.get('search') || '');
	let activePriority = $state($page.url.searchParams.get('priority') || 'all');
	let activeAssignee = $state($page.url.searchParams.get('assigneeId') || 'all');
	let timer: NodeJS.Timeout;

	function handleSearch(e: Event) {
		const value = (e.target as HTMLInputElement).value;
		searchQuery = value;
		clearTimeout(timer);
		timer = setTimeout(() => {
			updateQuery('search', value);
		}, 500);
	}

	function updateQuery(key: string, value: string | null) {
		const url = new URL($page.url);
		if (value && value !== 'all') {
			url.searchParams.set(key, value);
		} else {
			url.searchParams.delete(key);
		}
		// Reset page on filter change
		if (key !== 'page') {
			url.searchParams.set('page', '1');
		}
		goto(url, { keepFocus: true, noScroll: true });
	}

	function handlePageChange(newPage: number) {
		if (newPage < 1 || newPage > totalPages) return;
		updateQuery('page', newPage.toString());
	}

	function getPriorityVariant(priority: string) {
		switch (priority) {
			case 'critical':
			case 'high':
				return 'destructive';
			case 'medium':
				return 'default';
			default:
				return 'outline';
		}
	}

	function getStatusColor(status: string) {
		switch (status) {
			case 'open':
				return 'bg-red-500';
			case 'in_progress':
				return 'bg-yellow-500';
			case 'resolved':
				return 'bg-green-500';
			case 'closed':
				return 'bg-slate-500';
			default:
				return 'bg-slate-500';
		}
	}
</script>

<div class="space-y-4">
	<!-- Toolbar -->
	<div class="flex flex-col md:flex-row items-center justify-between gap-4">
		<div class="flex items-center gap-2 flex-1 w-full max-w-sm">
			<div class="relative w-full">
				<Search class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
				<Input
					type="search"
					placeholder={i18n.t('admin.tickets.searchPlaceholder')}
					class="pl-9"
					value={searchQuery}
					oninput={handleSearch}
				/>
			</div>
		</div>
		<div class="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
			<!-- Priority Filter -->
			<Select.Root
				type="single"
				value={activePriority}
				onValueChange={(v) => updateQuery('priority', v)}
			>
				<Select.Trigger class="w-[140px]">
					<div class="flex items-center gap-2">
						<Filter class="h-4 w-4 text-muted-foreground" />
						<span>{activePriority === 'all' ? 'Priority: All' : activePriority}</span>
					</div>
				</Select.Trigger>
				<Select.Content>
					<Select.Item value="all">All Priorities</Select.Item>
					<Select.Item value="low">Low</Select.Item>
					<Select.Item value="medium">Medium</Select.Item>
					<Select.Item value="high">High</Select.Item>
					<Select.Item value="critical">Critical</Select.Item>
				</Select.Content>
			</Select.Root>

			<!-- Assignee Filter -->
			<Select.Root
				type="single"
				value={activeAssignee}
				onValueChange={(v) => updateQuery('assigneeId', v)}
			>
				<Select.Trigger class="w-[160px]">
					<div class="flex items-center gap-2">
						<User class="h-4 w-4 text-muted-foreground" />
						<span class="truncate"
							>{activeAssignee === 'all'
								? 'Assignee: All'
								: activeAssignee === 'unassigned'
									? 'Unassigned'
									: staffMembers.find((s) => s.id === activeAssignee)?.name || 'Admin'}</span
						>
					</div>
				</Select.Trigger>
				<Select.Content>
					<Select.Item value="all">All Assignees</Select.Item>
					<Select.Item value="unassigned">Unassigned</Select.Item>
					<Separator class="my-1" />
					{#each staffMembers as staff}
						<Select.Item value={staff.id}>{staff.name || 'Admin'}</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>

			<Button
				variant="outline"
				size="sm"
				onclick={() => {
					const url = new URL($page.url);
					url.searchParams.delete('search');
					url.searchParams.delete('priority');
					url.searchParams.delete('assigneeId');
					url.searchParams.delete('status'); // Also reset status if we want "Clear All"
					url.searchParams.set('page', '1');
					goto(url);
					searchQuery = '';
					activePriority = 'all';
					activeAssignee = 'all';
				}}
			>
				Reset
			</Button>
		</div>
	</div>

	<!-- Table -->
	<div class="rounded-md border">
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head class="w-[100px]">{i18n.t('common.id')}</Table.Head>
					<Table.Head>{i18n.t('admin.tickets.subject')}</Table.Head>
					<Table.Head>{i18n.t('admin.tickets.school')}</Table.Head>
					<Table.Head>{i18n.t('admin.tickets.requester')}</Table.Head>
					<Table.Head>{i18n.t('admin.tickets.priority')}</Table.Head>
					<Table.Head>{i18n.t('admin.packages.status')}</Table.Head>
					<Table.Head>{i18n.t('admin.tickets.assignee')}</Table.Head>
					<Table.Head class="text-right">{i18n.t('admin.announcements.action')}</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#if isLoading}
					<Table.Row>
						<Table.Cell colspan={8} class="h-24 text-center">Loading...</Table.Cell>
					</Table.Row>
				{:else if tickets.length === 0}
					<Table.Row>
						<Table.Cell colspan={8} class="h-24 text-center text-muted-foreground">
							{i18n.t('admin.tickets.noTickets')}
						</Table.Cell>
					</Table.Row>
				{:else}
					{#each tickets as ticket}
						<Table.Row>
							<Table.Cell class="font-mono text-xs font-medium">
								{ticket.id.slice(0, 8)}
							</Table.Cell>
							<Table.Cell>
								<div class="flex flex-col">
									<span class="font-medium truncate max-w-[200px]">{ticket.subject}</span>
									<span class="text-xs text-muted-foreground">
										{formatDistanceToNow(new Date(ticket.updatedAt), {
											addSuffix: true,
											locale: i18n.language === 'id' ? idLocale : enUS
										})}
									</span>
								</div>
							</Table.Cell>
							<Table.Cell>{ticket.tenant.name}</Table.Cell>
							<Table.Cell>
								<div class="flex flex-col">
									<span class="text-sm">{ticket.user.name || 'User'}</span>
									<span class="text-xs text-muted-foreground">{ticket.user.email}</span>
								</div>
							</Table.Cell>
							<Table.Cell>
								<Badge variant={getPriorityVariant(ticket.priority)}>
									{ticket.priority}
								</Badge>
							</Table.Cell>
							<Table.Cell>
								<div class="flex items-center gap-2">
									<div class={`h-2 w-2 rounded-full ${getStatusColor(ticket.status)}`}></div>
									<span class="capitalize">{ticket.status.replace('_', ' ')}</span>
								</div>
							</Table.Cell>
							<Table.Cell>
								{#if ticket.assignee}
									<span class="text-sm">{ticket.assignee.name || 'Admin'}</span>
								{:else}
									<span class="text-sm text-muted-foreground italic">Unassigned</span>
								{/if}
							</Table.Cell>
							<Table.Cell class="text-right">
								<Button variant="ghost" size="icon" href="/admin/tickets/{ticket.id}">
									<MoreHorizontal class="h-4 w-4" />
								</Button>
							</Table.Cell>
						</Table.Row>
					{/each}
				{/if}
			</Table.Body>
		</Table.Root>
	</div>

	<!-- Pagination -->
	<div class="flex items-center justify-between px-2">
		<div class="text-sm text-muted-foreground">
			Showing {(currentPage - 1) * 10 + 1} to {Math.min(currentPage * 10, total)} of {total} results
		</div>
		<div class="flex items-center space-x-2">
			<Button
				variant="outline"
				size="sm"
				onclick={() => handlePageChange(currentPage - 1)}
				disabled={currentPage <= 1 || isLoading}
			>
				<ChevronLeft class="h-4 w-4" />
				Previous
			</Button>
			<div class="text-sm font-medium">
				Page {currentPage} of {totalPages}
			</div>
			<Button
				variant="outline"
				size="sm"
				onclick={() => handlePageChange(currentPage + 1)}
				disabled={currentPage >= totalPages || isLoading}
			>
				Next
				<ChevronRight class="h-4 w-4" />
			</Button>
		</div>
	</div>
</div>
