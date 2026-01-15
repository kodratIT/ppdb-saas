<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';
	import Badge from '$lib/components/ui/badge.svelte';
	import Button from '$lib/components/ui/button.svelte';

	let { data }: { data: PageData } = $props();
	let { application } = data;

	let selectedDocIndex = $state(0);
	// @ts-ignore
	let selectedDoc = $derived(application.uploadedDocuments[selectedDocIndex]);

	// For rejection modal/input
	let showReasonInput = $state(false);
	let rejectionAction = $state(''); // 'reject' | 'request_revision'
	let reason = $state('');
</script>

<div class="flex h-[calc(100vh-4rem)] overflow-hidden">
	<!-- Left Side: Application Data -->
	<div class="w-1/2 overflow-y-auto border-r border-gray-200 p-6 bg-gray-50">
		<h2 class="text-xl font-bold mb-4">Applicant Data</h2>

		<!-- Section: Student -->
		<div class="mb-6 bg-white p-4 rounded shadow-sm">
			<h3 class="font-semibold text-lg mb-2">Student Information</h3>
			<div class="grid grid-cols-2 gap-4 text-sm">
				<div>
					<label class="block text-gray-500">Full Name</label>
					<div class="font-medium">{application.childFullName}</div>
				</div>
				<div>
					<label class="block text-gray-500">Nickname</label>
					<div class="font-medium">{application.childNickname}</div>
				</div>
				<div>
					<label class="block text-gray-500">Date of Birth</label>
					<div class="font-medium">{new Date(application.childDob).toLocaleDateString()}</div>
				</div>
				<div>
					<label class="block text-gray-500">Gender</label>
					<div class="font-medium capitalize">{application.childGender}</div>
				</div>
			</div>
		</div>

		<!-- Section: Parent -->
		<div class="mb-6 bg-white p-4 rounded shadow-sm">
			<h3 class="font-semibold text-lg mb-2">Parent Information</h3>
			<div class="grid grid-cols-2 gap-4 text-sm">
				<div>
					<label class="block text-gray-500">Full Name</label>
					<div class="font-medium">{application.parentFullName}</div>
				</div>
				<div>
					<label class="block text-gray-500">Phone</label>
					<div class="font-medium">{application.parentPhone}</div>
				</div>
				<div>
					<label class="block text-gray-500">Email</label>
					<div class="font-medium">{application.parentEmail}</div>
				</div>
			</div>
		</div>

		<!-- Section: Address -->
		<div class="mb-6 bg-white p-4 rounded shadow-sm">
			<h3 class="font-semibold text-lg mb-2">Address</h3>
			<div class="text-sm">
				<div>{application.address}</div>
				<div>{application.city}, {application.province}</div>
				<div>{application.postalCode}</div>
				{#if application.distance_m}
					<div class="mt-2 text-gray-500">Distance to School: {application.distance_m}m</div>
				{/if}
			</div>
		</div>
	</div>

	<!-- Right Side: Document Verification -->
	<div class="w-1/2 flex flex-col bg-white">
		<!-- Document Tabs -->
		<div class="flex border-b border-gray-200 overflow-x-auto">
			{#each application.uploadedDocuments as doc, i}
				<button
					class="px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap
                    {selectedDocIndex === i
						? 'border-blue-600 text-blue-600'
						: 'border-transparent text-gray-500 hover:text-gray-700'}"
					onclick={() => {
						selectedDocIndex = i;
						showReasonInput = false;
					}}
				>
					{doc.documentType}
					{#if doc.status === 'verified'}
						<span class="ml-1 text-green-500">✓</span>
					{:else if doc.status === 'rejected'}
						<span class="ml-1 text-red-500">✗</span>
					{:else if doc.status === 'revision_requested'}
						<span class="ml-1 text-orange-500">↺</span>
					{/if}
				</button>
			{/each}
		</div>

		<!-- Viewer -->
		<div class="flex-1 p-6 overflow-y-auto flex flex-col items-center justify-center bg-gray-100">
			{#if selectedDoc}
				<div class="w-full h-full flex flex-col items-center">
					<!-- Viewer Logic -->
					{#if selectedDoc.mimeType.startsWith('image/')}
						<img
							src={`/api/documents/${selectedDoc.id}/content`}
							alt={selectedDoc.documentType}
							class="max-w-full max-h-[60vh] object-contain shadow-lg rounded"
						/>
					{:else if selectedDoc.mimeType === 'application/pdf'}
						<iframe
							src={`/api/documents/${selectedDoc.id}/content`}
							class="w-full h-[60vh] shadow-lg rounded bg-white"
							title="Document Viewer"
						></iframe>
					{:else}
						<div class="text-center p-12">
							<p>Preview not available for this file type.</p>
							<a
								href={`/api/documents/${selectedDoc.id}/content`}
								target="_blank"
								class="text-blue-600 underline">Download File</a
							>
						</div>
					{/if}

					<!-- Metadata -->
					<div class="mt-4 text-sm text-gray-500">
						{selectedDoc.fileName} ({(selectedDoc.fileSize / 1024).toFixed(1)} KB)
					</div>
				</div>
			{:else}
				<div class="text-gray-500">Select a document to verify</div>
			{/if}
		</div>

		<!-- Action Bar -->
		{#if selectedDoc}
			<div class="p-4 border-t border-gray-200 bg-white">
				<div class="flex items-center justify-between">
					<div>
						<div class="text-sm font-medium">
							Status: <Badge variant="outline">{selectedDoc.status}</Badge>
						</div>
						{#if selectedDoc.rejectionReason}
							<div class="text-xs text-red-600 mt-1">Note: {selectedDoc.rejectionReason}</div>
						{/if}
					</div>

					<div class="flex gap-2">
						<form method="POST" action="?/verifyDocument" use:enhance>
							<input type="hidden" name="documentId" value={selectedDoc.id} />
							<input type="hidden" name="action" value="approve" />
							<Button type="submit" variant="default" class="bg-green-600 hover:bg-green-700">
								Approve
							</Button>
						</form>

						<Button
							variant="destructive"
							onclick={() => {
								rejectionAction = 'reject';
								showReasonInput = true;
							}}
						>
							Reject
						</Button>

						<Button
							variant="outline"
							onclick={() => {
								rejectionAction = 'request_revision';
								showReasonInput = true;
							}}
						>
							Request Revision
						</Button>
					</div>
				</div>

				<!-- Reason Input (Collapsible) -->
				{#if showReasonInput}
					<div class="mt-4 border-t pt-4">
						<form
							method="POST"
							action="?/verifyDocument"
							use:enhance={() => {
								return async ({ result }) => {
									if (result.type === 'success') {
										showReasonInput = false;
										reason = '';
									}
								};
							}}
						>
							<input type="hidden" name="documentId" value={selectedDoc.id} />
							<input type="hidden" name="action" value={rejectionAction} />

							<label class="block text-sm font-medium text-gray-700 mb-1">
								{rejectionAction === 'reject' ? 'Rejection Reason' : 'Revision Instructions'}
							</label>
							<textarea
								name="reason"
								class="w-full border border-gray-300 rounded p-2 text-sm"
								rows="3"
								required
								placeholder="Please explain why..."
								bind:value={reason}
							></textarea>

							<div class="flex justify-end gap-2 mt-2">
								<Button type="button" variant="ghost" onclick={() => (showReasonInput = false)}
									>Cancel</Button
								>
								<Button type="submit" variant="destructive"
									>Confirm {rejectionAction === 'reject' ? 'Reject' : 'Revision'}</Button
								>
							</div>
						</form>
					</div>
				{/if}
			</div>
		{/if}
	</div>
</div>
