<script lang="ts">
	import {
		Card,
		CardContent,
		CardHeader,
		CardTitle,
		CardDescription
	} from '$lib/components/ui/card';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Button } from '$lib/components/ui/button';
	import { Alert } from '$lib/components/ui/alert';
	import { Badge } from '$lib/components/ui/badge';
	import { Send, Users, AlertTriangle, CheckCircle2, History } from 'lucide-svelte';
	import { enhance } from '$app/forms';

	export let data;

	let messageTemplate = '';
	let targetSegment = 'all';
	let sending = false;
	let showSuccess = false;
	let lastResult: any = null;

	// Simple preview computation
	$: previewMessage = messageTemplate || '(No message content)';
	
	function getSegmentLabel(segment: string) {
		switch (segment) {
			case 'all': return 'All Parents';
			case 'pending_payment': return 'Pending Payment';
			case 'verified': return 'Verified Documents';
			case 'accepted': return 'Accepted Students';
			default: return segment;
		}
	}

	function formatDate(date: Date) {
		return new Date(date).toLocaleDateString('id-ID', {
			day: 'numeric',
			month: 'short',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}
</script>

<div class="space-y-6">
	<div>
		<h1 class="text-3xl font-bold tracking-tight">Broadcast Messaging</h1>
		<p class="text-muted-foreground">Send mass announcements via WhatsApp.</p>
	</div>

	<div class="grid md:grid-cols-2 gap-6">
		<!-- Composition Area -->
		<Card>
			<CardHeader>
				<CardTitle>Compose Message</CardTitle>
				<CardDescription>Target specific groups of parents.</CardDescription>
			</CardHeader>
			<CardContent>
				<form
					method="POST"
					action="?/sendBroadcast"
					use:enhance={() => {
						sending = true;
						showSuccess = false;
						return async ({ result }) => {
							sending = false;
							if (result.type === 'success') {
								showSuccess = true;
								lastResult = result.data;
								// Optional: clear form or keep for repeat
							}
						};
					}}
					class="space-y-6"
				>
					<div class="space-y-2">
						<Label for="targetSegment">Target Audience</Label>
						<select
							id="targetSegment"
							name="targetSegment"
							bind:value={targetSegment}
							class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
						>
							<option value="all">All Parents</option>
							<option value="pending_payment">Pending Payment (Reminder)</option>
							<option value="verified">Verified Documents</option>
							<option value="accepted">Accepted Students</option>
						</select>
					</div>

					<div class="space-y-2">
						<Label for="messageTemplate">Message Content</Label>
						<Textarea
							id="messageTemplate"
							name="messageTemplate"
							placeholder="Type your message here..."
							class="min-h-[150px]"
							bind:value={messageTemplate}
						/>
						<p class="text-xs text-muted-foreground">
							Variables like {'{{parent_name}}'} are not yet supported in this version.
						</p>
					</div>

					<Button type="submit" class="w-full" disabled={sending || !messageTemplate}>
						{#if sending}
							<div class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
							Sending...
						{:else}
							<Send class="mr-2 h-4 w-4" />
							Send Broadcast
						{/if}
					</Button>
				</form>

				{#if showSuccess && lastResult}
					<Alert class="mt-4 bg-green-50 border-green-200">
						<div class="flex items-start gap-2">
							<CheckCircle2 class="h-4 w-4 text-green-600" />
							<div>
								<h4 class="text-green-800 font-semibold">Broadcast Sent!</h4>
								<p class="text-green-700">
									{lastResult.message}
									{#if lastResult.remaining > 0}
										<br /><strong>Note:</strong> {lastResult.remaining} recipients remaining. Please send again to continue batch.
									{/if}
								</p>
							</div>
						</div>
					</Alert>
				{/if}
			</CardContent>
		</Card>

		<!-- Preview & Tips -->
		<div class="space-y-6">
			<Card class="bg-muted/50">
				<CardHeader>
					<CardTitle class="text-sm font-medium">Message Preview</CardTitle>
				</CardHeader>
				<CardContent>
					<div class="bg-white p-4 rounded-lg shadow-sm border border-gray-100 min-h-[100px] whitespace-pre-wrap text-sm">
						{previewMessage}
					</div>
					<div class="mt-4 flex items-center text-xs text-muted-foreground gap-2">
						<AlertTriangle class="h-3 w-3" />
						<span>Messages are sent via WhatsApp API (WAHA).</span>
					</div>
				</CardContent>
			</Card>

			<!-- History -->
			<Card>
				<CardHeader>
					<CardTitle class="flex items-center gap-2">
						<History class="h-4 w-4" />
						Recent Broadcasts
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div class="space-y-4">
						{#each data.history as item}
							<div class="flex items-start justify-between border-b pb-4 last:border-0 last:pb-0">
								<div class="space-y-1">
									<p class="text-sm font-medium">{getSegmentLabel(item.targetSegment)}</p>
									<p class="text-xs text-muted-foreground line-clamp-1">{item.messageTemplate}</p>
									<p class="text-xs text-muted-foreground">{formatDate(item.createdAt)}</p>
								</div>
								<div class="text-right">
									<Badge variant="outline" class="bg-green-50 text-green-700 border-green-200">
										{item.sentCount} sent
									</Badge>
									{#if item.failedCount > 0}
										<Badge variant="outline" class="bg-red-50 text-red-700 border-red-200 ml-1">
											{item.failedCount} failed
										</Badge>
									{/if}
								</div>
							</div>
						{:else}
							<p class="text-sm text-muted-foreground text-center py-4">No history yet.</p>
						{/each}
					</div>
				</CardContent>
			</Card>
		</div>
	</div>
</div>
