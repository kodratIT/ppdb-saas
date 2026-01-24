<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { formatCurrency } from '$lib/utils';
	import {
		CheckCircle2,
		XCircle,
		Clock,
		FileText,
		Building2,
		User,
		Calendar,
		Hash,
		X,
		Loader2
	} from 'lucide-svelte';
	import { cn } from '$lib/utils';

	export interface AuditLog {
		id: string;
		action: string;
		previousStatus?: string;
		newStatus: string;
		actorName: string;
		notes?: string | null;
		createdAt: Date | string;
	}

	export interface PayoutDetails {
		id: string;
		tenantName: string;
		amount: number;
		status: 'pending' | 'processed' | 'completed' | 'failed' | 'rejected';
		bankName: string;
		accountNumber: string;
		accountName: string;
		reference?: string | null;
		requestedByName: string;
		requesterEmail?: string;
		createdAt: Date | string;
		processedAt?: Date | string | null;
		processedByName?: string | null;
		notes?: string | null;
		auditLogs: AuditLog[];
	}

	interface Props {
		payout: PayoutDetails | null;
		isOpen: boolean;
		onClose: () => void;
		onApprove?: (id: string, notes?: string) => void;
		onReject?: (id: string, reason: string) => void;
		isSubmitting?: boolean;
	}

	let {
		payout,
		isOpen,
		onClose,
		onApprove,
		onReject,
		isSubmitting = false
	}: Props = $props();

	let actionNotes = $state('');
	let rejectionReason = $state('');

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
				return XCircle;
			default:
				return FileText;
		}
	}

	function formatDate(date: Date | string | null | undefined) {
		if (!date) return '-';
		return new Intl.DateTimeFormat('id-ID', {
			dateStyle: 'long',
			timeStyle: 'short'
		}).format(new Date(date));
	}

	function getActionIcon(action: string) {
		switch (action) {
			case 'approved':
				return CheckCircle2;
			case 'rejected':
				return XCircle;
			case 'processed':
				return Clock;
			default:
				return FileText;
		}
	}

	function getActionBadgeVariant(action: string) {
		switch (action) {
			case 'approved':
				return 'default';
			case 'rejected':
				return 'destructive';
			case 'processed':
				return 'secondary';
			default:
				return 'outline';
		}
	}

	function handleApprove() {
		onApprove?.(payout!.id, actionNotes || undefined);
		actionNotes = '';
	}

	function handleReject() {
		if (!rejectionReason.trim()) return;
		onReject?.(payout!.id, rejectionReason);
		rejectionReason = '';
	}

	function handleClose() {
		actionNotes = '';
		rejectionReason = '';
		onClose();
	}
</script>

<Dialog.Root open={isOpen} onOpenChange={(open) => !open && handleClose()}>
	<Dialog.Content class="max-w-3xl max-h-[90vh] overflow-y-auto">
		{#if payout}
			<Dialog.Header>
				<Dialog.Title class="flex items-center gap-2">
					<FileText class="h-5 w-5" />
					Payout Details
				</Dialog.Title>
				<Dialog.Description>
					Complete information and action history for this payout request.
				</Dialog.Description>
			</Dialog.Header>

			<div class="grid grid-cols-1 lg:grid-cols-2 gap-6 py-4">
				<!-- Left Column - Payout Information -->
				<div class="space-y-6">
					<!-- Status Badge -->
					<div class="flex items-center justify-between">
						<Badge
							variant={getStatusVariant(payout.status)}
							class="text-[9px] uppercase font-black tracking-tight flex items-center gap-1.5"
						>
							<svelte:component this={getStatusIcon(payout.status)} class="w-3 h-3" />
							{payout.status}
						</Badge>
						{#if payout.reference}
							<div class="flex items-center gap-1 text-xs text-muted-foreground">
								<Hash class="h-3 w-3" />
								<span class="font-mono">{payout.reference}</span>
							</div>
						{/if}
					</div>

					<!-- Amount -->
					<div class="p-4 bg-muted/50 rounded-lg border">
						<Label
							class="text-[10px] font-black uppercase tracking-widest text-muted-foreground"
						>
							Amount
						</Label>
						<div class="text-3xl font-bold tabular-nums mt-1">
							{formatCurrency(payout.amount)}
						</div>
					</div>

					<!-- Tenant Information -->
					<div class="space-y-2">
						<Label
							class="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5"
						>
							<Building2 class="h-3 w-3" />
							Tenant Information
						</Label>
						<div class="p-3 border rounded-lg bg-card space-y-1">
							<div class="text-sm font-bold">{payout.tenantName}</div>
						</div>
					</div>

					<!-- Bank Details -->
					<div class="space-y-2">
						<Label
							class="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5"
						>
							<Building2 class="h-3 w-3" />
							Bank Details
						</Label>
						<div class="p-3 border rounded-lg bg-card space-y-2">
							<div class="flex justify-between items-center">
								<span class="text-[10px] uppercase text-muted-foreground">Bank</span>
								<span class="text-xs font-bold uppercase">{payout.bankName}</span>
							</div>
							<div class="flex justify-between items-center">
								<span class="text-[10px] uppercase text-muted-foreground">Account No.</span>
								<span class="text-xs font-mono">{payout.accountNumber}</span>
							</div>
							<div class="flex justify-between items-center">
								<span class="text-[10px] uppercase text-muted-foreground">Account Name</span>
								<span class="text-xs font-medium">{payout.accountName}</span>
							</div>
						</div>
					</div>

					<!-- Dates & Requester -->
					<div class="space-y-2">
						<Label
							class="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5"
						>
							<Calendar class="h-3 w-3" />
							Timeline
						</Label>
						<div class="p-3 border rounded-lg bg-card space-y-2">
							<div class="space-y-1">
								<div class="flex justify-between items-center">
									<span class="text-[10px] uppercase text-muted-foreground">Requested</span>
									<span class="text-xs">{formatDate(payout.createdAt)}</span>
								</div>
								<div class="flex justify-between items-center">
									<span class="text-[10px] uppercase text-muted-foreground">Requested by</span>
									<span class="text-xs font-medium">{payout.requestedByName}</span>
								</div>
							</div>
							{#if payout.processedAt}
								<div class="pt-2 border-t space-y-1">
									<div class="flex justify-between items-center">
										<span class="text-[10px] uppercase text-muted-foreground">Processed</span>
										<span class="text-xs">{formatDate(payout.processedAt)}</span>
									</div>
									{#if payout.processedByName}
										<div class="flex justify-between items-center">
											<span class="text-[10px] uppercase text-muted-foreground">Processed by</span>
											<span class="text-xs font-medium">{payout.processedByName}</span>
										</div>
									{/if}
								</div>
							{/if}
						</div>
					</div>

					<!-- Notes -->
					{#if payout.notes}
						<div class="space-y-2">
							<Label
								class="text-[10px] font-black uppercase tracking-widest text-muted-foreground"
							>
								Notes
							</Label>
							<div class="p-3 border rounded-lg bg-card">
								<p class="text-xs">{payout.notes}</p>
							</div>
						</div>
					{/if}
				</div>

				<!-- Right Column - Action History -->
				<div class="space-y-2">
					<Label
						class="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5"
					>
						<User class="h-3 w-3" />
						Action History
					</Label>
					<div class="relative">
						<!-- Vertical Line -->
						<div class="absolute left-[11px] top-2 bottom-2 w-0.5 bg-border" />

						<div class="space-y-4">
							{#each payout.auditLogs as log}
								{@const ActionIcon = getActionIcon(log.action)}
								<div class="relative pl-8">
									<!-- Timeline Dot -->
									<div
										class="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-background border-2 border-primary flex items-center justify-center"
									>
										<ActionIcon class="h-2.5 w-2.5 text-primary" />
									</div>

									<!-- Log Content -->
									<div class="space-y-1.5">
										<div class="flex items-center gap-2">
											<Badge
												variant={getActionBadgeVariant(log.action)}
												class="text-[9px] uppercase font-black tracking-tight"
											>
												{log.action}
											</Badge>
											<span class="text-xs font-medium">{log.actorName}</span>
										</div>

										{#if log.previousStatus && log.newStatus}
											<div class="text-[10px] text-muted-foreground">
												<span class="line-through opacity-70">{log.previousStatus}</span>
												<span class="mx-1">→</span>
												<span class="font-medium">{log.newStatus}</span>
											</div>
										{/if}

										{#if log.notes}
											<div class="p-2 bg-muted/50 rounded text-xs">{log.notes}</div>
										{/if}

										<div class="text-[10px] text-muted-foreground">
											{formatDate(log.createdAt)}
										</div>
									</div>
								</div>
							{/each}
						</div>
					</div>
				</div>
			</div>

			<!-- Actions Footer -->
			{#if payout.status === 'pending'}
				<Dialog.Footer class="flex-col gap-3">
					{#if onReject}
						<div class="w-full space-y-2">
							<Label
								for="rejection-reason"
								class="text-[10px] font-black uppercase tracking-widest text-muted-foreground"
							>
								Rejection Reason
							</Label>
							<Textarea
								bind:value={rejectionReason}
								id="rejection-reason"
								placeholder="Enter reason for rejection..."
								class="min-h-[80px] text-sm"
							/>
							<Button
								variant="destructive"
								class="w-full"
								onclick={handleReject}
								disabled={isSubmitting || !rejectionReason.trim()}
							>
								{#if isSubmitting}
									<Loader2 class="mr-2 h-4 w-4 animate-spin" />
								{:else}
									<XCircle class="mr-2 h-4 w-4" />
								{/if}
								Reject Payout
							</Button>
						</div>
					{/if}

					<div class="w-full space-y-2">
						{#if onApprove}
							<Label
								for="approval-notes"
								class="text-[10px] font-black uppercase tracking-widest text-muted-foreground"
							>
								Approval Notes
								<span class="text-[9px] normal-case font-normal opacity-70">(optional)</span>
							</Label>
							<Textarea
								bind:value={actionNotes}
								id="approval-notes"
								placeholder="Add any notes for this approval..."
								class="min-h-[80px] text-sm"
							/>
							<Button
								variant="default"
								class="w-full"
								onclick={handleApprove}
								disabled={isSubmitting}
							>
								{#if isSubmitting}
									<Loader2 class="mr-2 h-4 w-4 animate-spin" />
								{:else}
									<CheckCircle2 class="mr-2 h-4 w-4" />
								{/if}
								Approve Payout
							</Button>
						{/if}
					</div>

					<Button variant="outline" class="w-full" onclick={handleClose} disabled={isSubmitting}>
						Cancel
					</Button>
				</Dialog.Footer>
			{:else}
				<Dialog.Footer>
					<Button variant="outline" onclick={handleClose} disabled={isSubmitting}>
						Close
					</Button>
				</Dialog.Footer>
			{/if}
		{/if}
	</Dialog.Content>
</Dialog.Root>
