<script lang="ts">
	import { page } from '$app/stores';
	import { enhance } from '$app/forms';
	import { formatCurrency } from '$lib/utils';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import {
		Dialog,
		DialogContent,
		DialogDescription,
		DialogFooter,
		DialogHeader,
		DialogTitle,
		DialogTrigger
	} from '$lib/components/ui/dialog';
	import { ArrowLeft, Check, X, ExternalLink, Download } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	export let data;

	$: tenant = $page.params.tenant;

	let rejectReason = '';
	let isRejectDialogOpen = false;
	let isSubmitting = false;
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
		<Card class="md:col-span-1">
			<CardHeader>
				<CardTitle>Transfer Proof</CardTitle>
			</CardHeader>
			<CardContent>
				<div
					class="bg-muted flex aspect-[3/4] w-full items-center justify-center overflow-hidden rounded-md border"
				>
					<!-- Validating if fileUrl is an image or other file type -->
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
			</CardContent>
		</Card>

		<!-- Details & Actions -->
		<div class="flex flex-col gap-6">
			<!-- Details Card -->
			<Card>
				<CardHeader>
					<CardTitle>Payment Details</CardTitle>
				</CardHeader>
				<CardContent class="grid gap-4">
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
				</CardContent>
			</Card>

			<!-- Action Card -->
			<Card class="border-primary/20 shadow-sm">
				<CardHeader>
					<CardTitle>Verification</CardTitle>
				</CardHeader>
				<CardContent>
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

						<Dialog bind:open={isRejectDialogOpen}>
							<DialogTrigger asChild let:builder>
								<Button
									builders={[builder]}
									variant="destructive"
									size="lg"
									class="w-full"
									disabled={isSubmitting}
								>
									<X class="mr-2 h-4 w-4" /> Reject Payment
								</Button>
							</DialogTrigger>
							<DialogContent>
								<DialogHeader>
									<DialogTitle>Reject Payment Proof</DialogTitle>
									<DialogDescription>
										Please provide a reason for rejection. This will be sent to the parent so they
										can correct it.
									</DialogDescription>
								</DialogHeader>
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
											<Label htmlFor="reason">Reason for Rejection</Label>
											<Textarea
												id="reason"
												name="reason"
												bind:value={rejectReason}
												placeholder="e.g. Image is blurry, incorrect amount, transfer to wrong account..."
												required
											/>
										</div>
									</div>
									<DialogFooter>
										<Button
											type="button"
											variant="outline"
											on:click={() => (isRejectDialogOpen = false)}
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
									</DialogFooter>
								</form>
							</DialogContent>
						</Dialog>
					</div>
				</CardContent>
			</Card>
		</div>
	</div>
</div>
