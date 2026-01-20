<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import * as Card from '$lib/components/ui/card';
	import * as Avatar from '$lib/components/ui/avatar';
	import { Badge } from '$lib/components/ui/badge';
	import { Separator } from '$lib/components/ui/separator';
	import {
		ArrowLeft,
		Send,
		Paperclip,
		Clock,
		User,
		MoreVertical,
		CheckCircle2,
		AlertCircle
	} from 'lucide-svelte';
	import { formatDistanceToNow } from 'date-fns';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let replyText = $state('');
	let submitting = $state(false);

	let ticket = $derived(data.ticket);
</script>

<div class="container mx-auto px-4 py-8 max-w-6xl h-[calc(100vh-4rem)] flex flex-col">
	<!-- Header -->
	<div class="flex items-center justify-between mb-6">
		<div class="flex items-center gap-4">
			<Button variant="ghost" size="icon" href="/admin/tickets">
				<ArrowLeft class="h-5 w-5" />
			</Button>
			<div>
				<div class="flex items-center gap-3">
					<h1 class="text-2xl font-bold tracking-tight">{ticket.subject}</h1>
					<Badge variant="outline" class="text-sm font-mono">{ticket.id.slice(0, 8)}</Badge>
				</div>
				<p class="text-muted-foreground text-sm mt-1">
					From <span class="font-medium text-foreground">{ticket.tenant.name}</span> • {formatDistanceToNow(
						new Date(ticket.createdAt),
						{ addSuffix: true }
					)}
				</p>
			</div>
		</div>
		<div class="flex gap-2">
			<form
				method="POST"
				action="?/reply"
				use:enhance={() => {
					return async ({ update }) => {
						await update();
					};
				}}
			>
				<input type="hidden" name="content" value="Ticket marked as resolved." />
				<input type="hidden" name="status" value="resolved" />
				<Button variant="outline" type="submit">
					<CheckCircle2 class="mr-2 h-4 w-4" />
					Mark as Resolved
				</Button>
			</form>
			<Button variant="ghost" size="icon">
				<MoreVertical class="h-4 w-4" />
			</Button>
		</div>
	</div>

	<div class="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
		<!-- Main Chat Area -->
		<Card.Root class="lg:col-span-2 flex flex-col h-full overflow-hidden">
			<Card.Content class="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
				{#if ticket.messages.length === 0}
					<div class="text-center py-10 text-muted-foreground">
						<p>No messages yet.</p>
					</div>
				{:else}
					{#each ticket.messages as msg}
						<div class="flex gap-4 {msg.senderId === ticket.user.id ? '' : 'flex-row-reverse'}">
							<Avatar.Root class="h-8 w-8">
								<Avatar.Fallback
									class={msg.senderId === ticket.user.id
										? 'bg-slate-200 text-slate-700'
										: 'bg-blue-100 text-blue-700'}
								>
									{msg.sender.name ? msg.sender.name[0] : 'U'}
								</Avatar.Fallback>
							</Avatar.Root>
							<div
								class="flex flex-col max-w-[80%] gap-1 {msg.senderId === ticket.user.id
									? ''
									: 'items-end'}"
							>
								<div class="flex items-center gap-2">
									<span class="text-sm font-medium">{msg.sender.name || 'User'}</span>
									<span class="text-xs text-muted-foreground">
										{formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
									</span>
								</div>
								<div
									class="rounded-lg p-3 text-sm {msg.senderId === ticket.user.id
										? 'bg-white border shadow-sm'
										: 'bg-blue-600 text-white'}"
								>
									{msg.content}
								</div>
							</div>
						</div>
					{/each}
				{/if}
			</Card.Content>
			
			<div class="p-4 border-t bg-white">
				<form
					method="POST"
					action="?/reply"
					use:enhance={() => {
						submitting = true;
						return async ({ update }) => {
							await update();
							submitting = false;
							replyText = ''; // Clear input on success
						};
					}}
					class="flex gap-2"
				>
					<Button variant="ghost" size="icon" class="shrink-0" type="button">
						<Paperclip class="h-5 w-5 text-muted-foreground" />
					</Button>
					<Textarea
						name="content"
						placeholder="Type your reply..."
						class="min-h-[2.5rem] max-h-32 resize-none"
						rows={1}
						bind:value={replyText}
						onkeydown={(e) => {
							if (e.key === 'Enter' && !e.shiftKey) {
								e.preventDefault();
								// Trigger submit manually if needed or just let the button do it
							}
						}}
					/>
					<input type="hidden" name="status" value="in_progress" />
					<Button class="shrink-0" type="submit" disabled={submitting || !replyText.trim()}>
						<Send class="h-4 w-4" />
					</Button>
				</form>
			</div>
		</Card.Root>

		<!-- Sidebar Info -->
		<div class="space-y-6">
			<!-- Status Card -->
			<Card.Root>
				<Card.Header>
					<Card.Title class="text-sm font-medium uppercase tracking-wider text-muted-foreground">
						Ticket Details
					</Card.Title>
				</Card.Header>
				<Card.Content class="space-y-4">
					<div class="flex justify-between items-center">
						<span class="text-sm">Status</span>
						<Badge
							variant="default"
							class={ticket.status === 'open'
								? 'bg-red-500'
								: ticket.status === 'resolved'
									? 'bg-green-500'
									: 'bg-yellow-500'}
						>
							{ticket.status}
						</Badge>
					</div>
					<Separator />
					<div class="flex justify-between items-center">
						<span class="text-sm">Priority</span>
						<div
							class="flex items-center gap-1 text-sm font-medium {ticket.priority === 'high' ||
							ticket.priority === 'critical'
								? 'text-red-600'
								: 'text-slate-600'}"
						>
							<AlertCircle class="h-4 w-4" />
							{ticket.priority}
						</div>
					</div>
					<Separator />
					<div class="flex justify-between items-center">
						<span class="text-sm">Assignee</span>
						<div class="flex items-center gap-2 text-sm">
							<Avatar.Root class="h-6 w-6">
								<Avatar.Fallback>SA</Avatar.Fallback>
							</Avatar.Root>
							<span>Support Agent</span>
						</div>
					</div>
				</Card.Content>
			</Card.Root>

			<!-- Customer Info -->
			<Card.Root>
				<Card.Header>
					<Card.Title class="text-sm font-medium uppercase tracking-wider text-muted-foreground">
						Customer Info
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
					<div class="text-sm space-y-2 pt-2">
						<div class="flex justify-between">
							<span class="text-muted-foreground">Email:</span>
							<span>{ticket.user.email}</span>
						</div>
						<div class="flex justify-between">
							<span class="text-muted-foreground">Tenant:</span>
							<span>{ticket.tenant.name}</span>
						</div>
					</div>
				</Card.Content>
			</Card.Root>
		</div>
	</div>
</div>
