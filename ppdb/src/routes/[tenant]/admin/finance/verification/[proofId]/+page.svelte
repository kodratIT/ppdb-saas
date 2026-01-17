<script lang="ts">
	import { page } from '$app/stores';
	import { enhance } from '$app/forms';
	import { formatCurrency } from '$lib/utils';
	import Button from '$lib/components/ui/button.svelte';
	import * as Card from '$lib/components/ui/card';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import * as Dialog from '$lib/components/ui/dialog';
	import { ArrowLeft, Check, X, ExternalLink, Download } from 'lucide-svelte';

	let { data } = $props();

	const tenant = $derived($page.params.tenant);

	let rejectReason = $state('');
	let isRejectDialogOpen = $state(false);
	let isSubmitting = $state(false);
</script>

<div class="mx-auto max-w-4xl p-6">
	<!-- Navigation -->
	<div class="mb-6 flex items-center gap-4">
		<Button variant="outline" size="icon" href="/{tenant}/admin/finance/verification">
			<ArrowLeft class="h-4 w-4" />
		</Button>
		<div>
			<h1 class="text-2xl font-bold tracking-tight">Review Payment Proof</h1>
			<p class="text-muted-foreground">Verify the details below before approving.</p>
		</div>
	</div>

	<div class="grid gap-6 md:grid-cols-2">
		<!-- Proof Image Preview -->
		<Card.Root class="md:col-span-1">
			<Card.Header>
				<Card.Title>Transfer Proof</Card.Title>
			</Card.Header>
			<Card.Content>
				<div
					class="bg-muted flex aspect-[3/4] w-full items-center justify-center overflow-hidden rounded-md border"
				>
					{#if data.proof.fileUrl.match(/\.(jpeg|jpg|png|gif|webp)$/i)}
						<img
							src={data.proof.fileUrl}
							alt="Payment Proof"
							class="h-full w-full object-contain transition-transform hover:scale-105"
						/>
					{:else}
						<div class="text-center">
							<p class="text-muted-foreground mb-2 text-sm">Preview not available</p>
							<Button variant="outline" size="sm" href={data.proof.fileUrl} target="_blank">
								<Download class="mr-2 h-4 w-4" /> Download File
							</Button>
						</div>
					{/if}
				</div>
				<div class="mt-4 flex justify-center">
					<Button variant="ghost" size="sm" href={data.proof.fileUrl} target="_blank">
						<ExternalLink class="mr-2 h-4 w-4" /> Open Original
					</Button>
				</div>
			</Card.Content>
		</Card.Root>

		<!-- Details & Actions -->
		<div class="flex flex-col gap-6">
			<!-- Details Card -->
			<Card.Root>
				<Card.Header>
					<Card.Title>Payment Details</Card.Title>
				</Card.Header>
				<Card.Content class="grid gap-4">
					<div class="grid grid-cols-2 gap-2 text-sm">
						<span class="text-muted-foreground">Student Name:</span>
						<span class="font-medium text-right">{data.proof.studentName}</span>

						<span class="text-muted-foreground">Fee Type:</span>
						<span class="font-medium text-right">{data.proof.feeName}</span>

						<span class="text-muted-foreground">Amount:</span>
						<span class="font-mono font-medium text-right text-lg">
							{formatCurrency(data.proof.amount)}
						</span>

						<span class="text-muted-foreground">Uploaded At:</span>
						<span class="font-medium text-right">
							{new Date(data.proof.uploadedAt).toLocaleString('id-ID')}
						</span>

						<span class="text-muted-foreground">Parent Name:</span>
						<span class="font-medium text-right">{data.proof.parentName}</span>

						<span class="text-muted-foreground">Parent Email:</span>
						<span class="font-medium text-right">{data.proof.parentEmail}</span>
					</div>

					{#if data.proof.notes}
						<div class="bg-muted mt-2 rounded-md p-3 text-sm">
							<span
								class="font-semibold text-xs uppercase tracking-wider text-muted-foreground block mb-1"
							>
								Parent Notes
							</span>
							{data.proof.notes}
						</div>
					{/if}
				</Card.Content>
			</Card.Root>

			<!-- Action Card -->
			<Card.Root class="border-primary/20 shadow-sm">
				<Card.Header>
					<Card.Title>Verification</Card.Title>
				</Card.Header>
				<Card.Content>
					<div class="flex flex-col gap-3">
						<form
							method="POST"
							action="?/approve"
							use:enhance={() => {
								isSubmitting = true;
								return async ({ update }) => {
									isSubmitting = false;
									await update();
								};
							}}
						>
							<Button type="submit" class="w-full" size="lg" disabled={isSubmitting}>
								{#if isSubmitting}
									Processing...
								{:else}
									<Check class="mr-2 h-4 w-4" /> Approve Payment
								{/if}
							</Button>
						</form>

						<Dialog.Root bind:open={isRejectDialogOpen}>
							<Dialog.Trigger>
								<Button variant="destructive" size="lg" class="w-full" disabled={isSubmitting}>
									<X class="mr-2 h-4 w-4" /> Reject Payment
								</Button>
							</Dialog.Trigger>
							<Dialog.Content>
								<Dialog.Header>
									<Dialog.Title>Reject Payment Proof</Dialog.Title>
									<Dialog.Description>
										Please provide a reason for rejection. This will be sent to the parent so they
										can correct it.
									</Dialog.Description>
								</Dialog.Header>
								<form
									method="POST"
									action="?/reject"
									use:enhance={() => {
										isSubmitting = true;
										return async ({ update }) => {
											isSubmitting = false;
											isRejectDialogOpen = false;
											await update();
										};
									}}
								>
									<div class="grid gap-4 py-4">
										<div class="grid gap-2">
											<Label for="reason">Reason for Rejection</Label>
											<Textarea
												id="reason"
												name="reason"
												bind:value={rejectReason}
												placeholder="e.g. Image is blurry, incorrect amount, transfer to wrong account..."
												required
											/>
										</div>
									</div>
									<Dialog.Footer>
										<Button
											type="button"
											variant="outline"
											onclick={() => (isRejectDialogOpen = false)}
										>
											Cancel
										</Button>
										<Button
											type="submit"
											variant="destructive"
											disabled={!rejectReason || isSubmitting}
										>
											Reject Payment
										</Button>
									</Dialog.Footer>
								</form>
							</Dialog.Content>
						</Dialog.Root>
					</div>
				</Card.Content>
			</Card.Root>
		</div>
	</div>
</div>
