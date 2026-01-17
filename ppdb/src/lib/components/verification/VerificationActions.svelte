<script lang="ts">
	import Button from '$lib/components/ui/button.svelte';
	import { CheckCircle2, XCircle, AlertCircle, Loader2 } from 'lucide-svelte';

	interface Props {
		documentId: string;
		currentStatus: string;
		onAction: (action: string, reason?: string) => Promise<void>;
	}

	let { documentId, currentStatus, onAction }: Props = $props();

	let isProcessing = $state(false);
	let showRejectModal = $state(false);
	let showReviseModal = $state(false);
	let rejectReason = $state('');
	let reviseReason = $state('');

	async function handleApprove() {
		isProcessing = true;
		try {
			await onAction('approve');
		} finally {
			isProcessing = false;
		}
	}

	async function handleReject() {
		if (!rejectReason.trim()) {
			alert('Alasan penolakan harus diisi');
			return;
		}
		isProcessing = true;
		try {
			await onAction('reject', rejectReason);
			showRejectModal = false;
			rejectReason = '';
		} finally {
			isProcessing = false;
		}
	}

	async function handleRequestRevision() {
		if (!reviseReason.trim()) {
			alert('Alasan revisi harus diisi');
			return;
		}
		isProcessing = true;
		try {
			await onAction('request_revision', reviseReason);
			showReviseModal = false;
			reviseReason = '';
		} finally {
			isProcessing = false;
		}
	}
</script>

<div
	class="verification-actions bg-white border-t border-gray-200 p-4"
	data-document-id={documentId}
>
	{#if currentStatus === 'verified'}
		<div class="flex items-center justify-center gap-2 text-green-600">
			<CheckCircle2 class="w-5 h-5" />
			<span class="font-medium">Document Verified</span>
		</div>
	{:else if currentStatus === 'rejected'}
		<div class="flex items-center justify-center gap-2 text-red-600">
			<XCircle class="w-5 h-5" />
			<span class="font-medium">Document Rejected</span>
		</div>
	{:else}
		<div class="flex flex-wrap gap-3 justify-center">
			<Button
				onclick={handleApprove}
				disabled={isProcessing}
				class="bg-green-600 hover:bg-green-700 text-white"
			>
				{#if isProcessing}
					<Loader2 class="w-4 h-4 mr-2 animate-spin" />
				{:else}
					<CheckCircle2 class="w-4 h-4 mr-2" />
				{/if}
				Approve
			</Button>

			<Button
				onclick={() => (showReviseModal = true)}
				disabled={isProcessing}
				variant="outline"
				class="border-yellow-600 text-yellow-600 hover:bg-yellow-50"
			>
				<AlertCircle class="w-4 h-4 mr-2" />
				Request Revision
			</Button>

			<Button
				onclick={() => (showRejectModal = true)}
				disabled={isProcessing}
				variant="destructive"
			>
				<XCircle class="w-4 h-4 mr-2" />
				Reject
			</Button>
		</div>
	{/if}
</div>

<!-- Reject Modal -->
{#if showRejectModal}
	<div class="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
		<div class="bg-white rounded-lg max-w-md w-full p-6">
			<h3 class="text-lg font-bold text-gray-900 mb-4">Reject Document</h3>
			<p class="text-sm text-gray-600 mb-4">
				Please provide a reason for rejecting this document. This will be visible to the applicant.
			</p>
			<textarea
				bind:value={rejectReason}
				placeholder="e.g., Document is blurry and unreadable"
				rows="4"
				class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
			></textarea>
			<div class="flex gap-3 mt-6">
				<Button
					onclick={() => {
						showRejectModal = false;
						rejectReason = '';
					}}
					variant="outline"
					class="flex-1"
					disabled={isProcessing}
				>
					Cancel
				</Button>
				<Button onclick={handleReject} variant="destructive" class="flex-1" disabled={isProcessing}>
					{#if isProcessing}
						<Loader2 class="w-4 h-4 mr-2 animate-spin" />
					{/if}
					Confirm Reject
				</Button>
			</div>
		</div>
	</div>
{/if}

<!-- Revise Modal -->
{#if showReviseModal}
	<div class="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
		<div class="bg-white rounded-lg max-w-md w-full p-6">
			<h3 class="text-lg font-bold text-gray-900 mb-4">Request Revision</h3>
			<p class="text-sm text-gray-600 mb-4">
				Specify what needs to be corrected. The applicant will be able to re-upload this document.
			</p>
			<textarea
				bind:value={reviseReason}
				placeholder="e.g., Please upload a clearer photo of the document"
				rows="4"
				class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
			></textarea>
			<div class="flex gap-3 mt-6">
				<Button
					onclick={() => {
						showReviseModal = false;
						reviseReason = '';
					}}
					variant="outline"
					class="flex-1"
					disabled={isProcessing}
				>
					Cancel
				</Button>
				<Button
					onclick={handleRequestRevision}
					class="flex-1 bg-yellow-600 hover:bg-yellow-700"
					disabled={isProcessing}
				>
					{#if isProcessing}
						<Loader2 class="w-4 h-4 mr-2 animate-spin" />
					{/if}
					Send Request
				</Button>
			</div>
		</div>
	</div>
{/if}
