<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import { Textarea } from '$lib/components/ui/textarea';
	import * as Card from '$lib/components/ui/card';
	import * as Avatar from '$lib/components/ui/avatar';
	import * as Select from '$lib/components/ui/select';
	import { Badge } from '$lib/components/ui/badge';
	import { Separator } from '$lib/components/ui/separator';
	import { Switch } from '$lib/components/ui/switch';
	import { Label } from '$lib/components/ui/label';
	import {
		Send,
		Paperclip,
		User,
		AlertCircle,
		CheckCircle2,
		Lock,
		Unlock,
		MoreVertical
	} from 'lucide-svelte';
	import { formatDistanceToNow } from 'date-fns';
	import { i18n } from '$lib/i18n/index.svelte';

	interface TicketMessage {
		id: string;
		content: string;
		isInternal: boolean;
		createdAt: Date;
		senderId: string;
		sender: { name: string | null; role: string };
	}

	interface Ticket {
		id: string;
		subject: string;
		status: string;
		priority: string;
		createdAt: Date;
		updatedAt: Date;
		tenant: { name: string };
		user: { id: string; name: string | null; email: string };
		assignee?: { id: string; name: string | null } | null;
		messages: TicketMessage[];
	}

	interface User {
		id: string;
		name: string | null;
	}

	interface Props {
		ticket: Ticket;
		currentUser: { id: string };
		staffMembers?: User[];
	}

	let { ticket, currentUser, staffMembers = [] } = $props();

	let replyText = $state('');
	let isInternalNote = $state(false);
	let submitting = $state(false);

	// Derived
	let sortedMessages = $derived(
		[...ticket.messages].sort(
			(a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
		)
	);

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

	function getPriorityColor(priority: string) {
		switch (priority) {
			case 'critical':
			case 'high':
				return 'text-red-600';
			case 'medium':
				return 'text-yellow-600';
			default:
				return 'text-slate-600';
		}
	}
</script>

<div class="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-0">
	<!-- Main Chat Area -->
	<div
		class="lg:col-span-2 flex flex-col h-full min-h-[600px] border rounded-lg overflow-hidden bg-background"
	>
		<!-- Message List -->
		<div class="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
			{#if sortedMessages.length === 0}
				<div class="text-center py-10 text-muted-foreground">
					<p>{i18n.t('admin.tickets.noMessages')}</p>
				</div>
			{:else}
				{#each sortedMessages as msg}
					<div
						class="flex flex-col gap-1 {msg.senderId === currentUser.id
							? 'items-end'
							: 'items-start'}"
					>
						<!-- Metadata -->
						<div class="flex items-center gap-2 text-xs text-muted-foreground px-1">
							<span class="font-medium">{msg.sender.name || 'User'}</span>
							<span>•</span>
							<span>{formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}</span>
							{#if msg.isInternal}
								<span
									class="flex items-center gap-0.5 text-amber-600 font-medium bg-amber-100 px-1.5 py-0.5 rounded"
								>
									<Lock class="h-3 w-3" /> Internal
								</span>
							{/if}
						</div>

						<!-- Bubble -->
						<div
							class="max-w-[85%] rounded-lg p-3 text-sm whitespace-pre-wrap shadow-sm
							{msg.isInternal
								? 'bg-amber-50 border border-amber-200 text-amber-900'
								: msg.senderId === currentUser.id
									? 'bg-blue-600 text-white'
									: 'bg-white border text-slate-900'}"
						>
							{msg.content}
						</div>
					</div>
				{/each}
			{/if}
		</div>

		<!-- Reply Box -->
		<div class="p-4 border-t bg-white space-y-3">
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-2">
					<Switch id="internal-mode" bind:checked={isInternalNote} />
					<Label
						for="internal-mode"
						class="flex items-center gap-1.5 cursor-pointer text-sm font-medium"
					>
						{#if isInternalNote}
							<Lock class="h-3.5 w-3.5 text-amber-600" />
							<span class="text-amber-600">Internal Note</span>
						{:else}
							<Unlock class="h-3.5 w-3.5 text-muted-foreground" />
							<span class="text-muted-foreground">Public Reply</span>
						{/if}
					</Label>
				</div>
			</div>

			<form
				method="POST"
				action="?/reply"
				use:enhance={() => {
					submitting = true;
					return async ({ update }) => {
						await update();
						submitting = false;
						replyText = '';
					};
				}}
				class="flex gap-2 items-end"
			>
				<div class="relative flex-1">
					<Textarea
						name="content"
						placeholder={isInternalNote
							? 'Add an internal note (only visible to staff)...'
							: 'Type your reply to the customer...'}
						class="min-h-[80px] resize-none pr-12 {isInternalNote
							? 'bg-amber-50/50 border-amber-200 focus-visible:ring-amber-500'
							: ''}"
						bind:value={replyText}
						onkeydown={(e) => {
							if (e.key === 'Enter' && !e.shiftKey) {
								e.preventDefault();
								// Allow manual submit via button for now to avoid accidents
							}
						}}
					/>
					<Button
						variant="ghost"
						size="icon"
						class="absolute bottom-2 right-2 h-8 w-8 text-muted-foreground"
						type="button"
					>
						<Paperclip class="h-4 w-4" />
					</Button>
				</div>

				<input type="hidden" name="isInternal" value={isInternalNote.toString()} />

				<Button
					type="submit"
					disabled={submitting || !replyText.trim()}
					class={isInternalNote ? 'bg-amber-600 hover:bg-amber-700' : ''}
				>
					<Send class="h-4 w-4 mr-2" />
					{isInternalNote ? 'Add Note' : 'Reply'}
				</Button>
			</form>
		</div>
	</div>

	<!-- Sidebar -->
	<div class="space-y-6">
		<!-- Ticket Info -->
		<Card.Root>
			<Card.Header>
				<Card.Title class="text-sm font-medium uppercase tracking-wider text-muted-foreground">
					Ticket Properties
				</Card.Title>
			</Card.Header>
			<Card.Content class="space-y-6">
				<!-- Status -->
				<div class="space-y-2">
					<Label class="text-xs text-muted-foreground">Status</Label>
					<form method="POST" action="?/updateStatus" use:enhance>
						<Select.Root
							type="single"
							name="status"
							value={ticket.status}
							onValueChange={(v) => {
								// In real app, we might want to auto-submit here
							}}
						>
							<Select.Trigger>
								<div class="flex items-center gap-2">
									<div class={`h-2 w-2 rounded-full ${getStatusColor(ticket.status)}`}></div>
									<span class="capitalize">{ticket.status.replace('_', ' ')}</span>
								</div>
							</Select.Trigger>
							<Select.Content>
								<Select.Item value="open">Open</Select.Item>
								<Select.Item value="in_progress">In Progress</Select.Item>
								<Select.Item value="resolved">Resolved</Select.Item>
								<Select.Item value="closed">Closed</Select.Item>
							</Select.Content>
						</Select.Root>
						<div class="mt-2 flex justify-end">
							<Button size="sm" variant="secondary" type="submit">Update Status</Button>
						</div>
					</form>
				</div>

				<Separator />

				<!-- Priority -->
				<div class="space-y-2">
					<Label class="text-xs text-muted-foreground">Priority</Label>
					<form method="POST" action="?/updatePriority" use:enhance>
						<Select.Root type="single" name="priority" value={ticket.priority}>
							<Select.Trigger>
								<div class="flex items-center gap-2 {getPriorityColor(ticket.priority)}">
									<AlertCircle class="h-4 w-4" />
									<span class="capitalize">{ticket.priority}</span>
								</div>
							</Select.Trigger>
							<Select.Content>
								<Select.Item value="low">Low</Select.Item>
								<Select.Item value="medium">Medium</Select.Item>
								<Select.Item value="high">High</Select.Item>
								<Select.Item value="critical">Critical</Select.Item>
							</Select.Content>
						</Select.Root>
						<div class="mt-2 flex justify-end">
							<Button size="sm" variant="secondary" type="submit">Update Priority</Button>
						</div>
					</form>
				</div>

				<Separator />

				<!-- Assignee -->
				<div class="space-y-2">
					<Label class="text-xs text-muted-foreground">Assignee</Label>
					<form method="POST" action="?/assign" use:enhance>
						<Select.Root
							type="single"
							name="assigneeId"
							value={ticket.assignee?.id || 'unassigned'}
						>
							<Select.Trigger>
								<div class="flex items-center gap-2">
									<Avatar.Root class="h-5 w-5">
										<Avatar.Fallback class="text-[10px]">
											{ticket.assignee?.name?.[0] || 'U'}
										</Avatar.Fallback>
									</Avatar.Root>
									<span>{ticket.assignee?.name || 'Unassigned'}</span>
								</div>
							</Select.Trigger>
							<Select.Content>
								<Select.Item value="unassigned">Unassigned</Select.Item>
								{#each staffMembers as staff}
									<Select.Item value={staff.id}>{staff.name}</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
						<div class="mt-2 flex justify-end">
							<Button size="sm" variant="secondary" type="submit">Assign</Button>
						</div>
					</form>
				</div>
			</Card.Content>
		</Card.Root>

		<!-- Requester Info -->
		<Card.Root>
			<Card.Header>
				<Card.Title class="text-sm font-medium uppercase tracking-wider text-muted-foreground">
					Requester
				</Card.Title>
			</Card.Header>
			<Card.Content class="space-y-4">
				<div class="flex items-start gap-3">
					<div class="p-2 bg-slate-100 rounded-lg">
						<User class="h-5 w-5 text-slate-600" />
					</div>
					<div>
						<p class="font-medium text-sm">{ticket.user.name || 'Unknown User'}</p>
						<p class="text-xs text-muted-foreground">School Admin</p>
					</div>
				</div>
				<div class="text-sm space-y-2 pt-2 border-t mt-2">
					<div class="flex justify-between">
						<span class="text-muted-foreground">Email:</span>
						<span class="truncate max-w-[150px]" title={ticket.user.email}>{ticket.user.email}</span
						>
					</div>
					<div class="flex justify-between">
						<span class="text-muted-foreground">Tenant:</span>
						<span class="truncate max-w-[150px] font-medium" title={ticket.tenant.name}
							>{ticket.tenant.name}</span
						>
					</div>
				</div>
			</Card.Content>
		</Card.Root>
	</div>
</div>
