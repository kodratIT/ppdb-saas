<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { enhance } from '$app/forms';
	import Input from '$lib/components/ui/input.svelte';
	import Label from '$lib/components/ui/label.svelte';
	import Textarea from '$lib/components/ui/textarea.svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let saving = $state(false);
	let showCreateModal = $state(false);
	let editingFee = $state<(typeof data.feeStructures)[0] | null>(null);

	// Helper function to format currency
	function formatCurrency(amount: number, currency: string = 'IDR'): string {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: currency,
			minimumFractionDigits: 0,
			maximumFractionDigits: 0
		}).format(amount);
	}

	// Get payment timing description
	function getPaymentTimingDescription(timing: string): string {
		const descriptions: Record<string, string> = {
			registration: 'Due upon registration',
			acceptance: 'Due upon acceptance',
			enrollment: 'Due upon enrollment',
			custom: 'Custom timing'
		};
		return descriptions[timing] || timing;
	}

	// Get admission path name by ID
	function getAdmissionPathName(pathId: string): string {
		const path = data.admissionPaths.find((p) => p.id === pathId);
		return path?.name || 'Unknown Path';
	}

	// Open edit modal
	function openEditModal(fee: (typeof data.feeStructures)[0]) {
		editingFee = fee;
		showCreateModal = true;
	}

	// Close modal and reset state
	function closeModal() {
		showCreateModal = false;
		editingFee = null;
	}

	// Type guard for form errors
	let hasErrors = $derived(form && 'errors' in form && form.errors ? (form.errors as any[]) : null);

	let errorMessage = $derived(form && 'error' in form ? (form.error as string) : null);
	let successMessage = $derived(
		form && 'success' in form && form.success ? (form.message as string) : null
	);
</script>

<div class="container mx-auto px-4 py-8 max-w-6xl">
	<div class="flex justify-between items-center mb-6">
		<div>
			<h1 class="text-3xl font-bold">Fee Structures</h1>
			<p class="text-gray-600 mt-1">Configure fees and payment timing for each admission path</p>
		</div>
		<button
			onclick={() => (showCreateModal = true)}
			class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
		>
			Add New Fee
		</button>
	</div>

	{#if successMessage}
		<div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
			{successMessage}
		</div>
	{/if}

	{#if errorMessage}
		<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
			{errorMessage}
		</div>
	{/if}

	<!-- Fee Structures List -->
	{#if data.feeStructures.length === 0}
		<div class="bg-white shadow-md rounded-lg p-8 text-center">
			<div class="text-gray-500 mb-4">
				<svg
					class="mx-auto h-12 w-12 text-gray-400"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 6v6m0 0v6m0-6h6m-6 0H6"
					/>
				</svg>
				<p class="mt-2 text-lg font-medium">No fee structures configured</p>
				<p class="text-sm">Get started by adding a fee structure for your admission paths.</p>
			</div>
			<button
				onclick={() => (showCreateModal = true)}
				class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
			>
				Add First Fee Structure
			</button>
		</div>
	{:else}
		<div class="bg-white shadow-md rounded-lg overflow-hidden">
			<table class="min-w-full divide-y divide-gray-200">
				<thead class="bg-gray-50">
					<tr>
						<th
							class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
						>
							Fee Name
						</th>
						<th
							class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
						>
							Admission Path
						</th>
						<th
							class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
						>
							Amount
						</th>
						<th
							class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
						>
							Payment Timing
						</th>
						<th
							class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
						>
							Status
						</th>
						<th
							class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
						>
							Actions
						</th>
					</tr>
				</thead>
				<tbody class="bg-white divide-y divide-gray-200">
					{#each data.feeStructures as fee}
						<tr class="hover:bg-gray-50">
							<td class="px-6 py-4 whitespace-nowrap">
								<div class="text-sm font-medium text-gray-900">{fee.name}</div>
								{#if fee.description}
									<div class="text-sm text-gray-500">{fee.description}</div>
								{/if}
							</td>
							<td class="px-6 py-4 whitespace-nowrap">
								<span class="text-sm text-gray-900"
									>{getAdmissionPathName(fee.admissionPathId)}</span
								>
							</td>
							<td class="px-6 py-4 whitespace-nowrap">
								<span class="text-sm font-medium text-gray-900">
									{formatCurrency(fee.amount, fee.currency)}
								</span>
								{#if fee.penaltyAmount}
									<div class="text-xs text-red-500">
										+{formatCurrency(fee.penaltyAmount)} late fee
									</div>
								{/if}
							</td>
							<td class="px-6 py-4 whitespace-nowrap">
								<span class="text-sm text-gray-500">
									{getPaymentTimingDescription(fee.paymentTiming)}
								</span>
								{#if fee.paymentTiming === 'custom' && fee.dueDateOffsetDays > 0}
									<div class="text-xs text-gray-400">
										{fee.dueDateOffsetDays} days after registration
									</div>
								{/if}
							</td>
							<td class="px-6 py-4 whitespace-nowrap">
								<span
									class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full {fee.status ===
									'active'
										? 'bg-green-100 text-green-800'
										: 'bg-gray-100 text-gray-800'}"
								>
									{fee.status}
								</span>
							</td>
							<td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
								<button
									onclick={() => openEditModal(fee)}
									class="text-indigo-600 hover:text-indigo-900 mr-3"
								>
									Edit
								</button>
								<form
									method="POST"
									action="?/deleteFee"
									use:enhance={() => {
										saving = true;
										return async ({ update }) => {
											await update();
											saving = false;
										};
									}}
									class="inline"
								>
									<input type="hidden" name="feeId" value={fee.id} />
									<button
										type="submit"
										disabled={saving}
										class="text-red-600 hover:text-red-900 disabled:opacity-50"
									>
										Delete
									</button>
								</form>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>

<!-- Create/Edit Modal -->
{#if showCreateModal}
	<div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
		<div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center">
			<div
				class="inline-block align-middle bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all max-w-2xl w-full"
			>
				<div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
					<div class="sm:flex sm:items-start">
						<div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
							<h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
								{editingFee ? 'Edit Fee Structure' : 'Create New Fee Structure'}
							</h3>

							<form
								method="POST"
								action={editingFee ? '?/updateFee' : '?/createFee'}
								use:enhance={() => {
									saving = true;
									return async ({ update }) => {
										await update();
										saving = false;
										if (form?.success) {
											closeModal();
										}
									};
								}}
								class="mt-4 space-y-4"
							>
								{#if editingFee}
									<input type="hidden" name="feeId" value={editingFee.id} />
								{/if}

								<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<Label for="name" class="block text-gray-700 mb-1">
											Fee Name <span class="text-red-500">*</span>
										</Label>
										<Input
											type="text"
											id="name"
											name="name"
											value={editingFee?.name || ''}
											required
										/>
									</div>

									<div>
										<Label for="admissionPathId" class="block text-gray-700 mb-1">
											Admission Path <span class="text-red-500">*</span>
										</Label>
										<select
											id="admissionPathId"
											name="admissionPathId"
											required
											class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
										>
											<option value="">Select admission path</option>
											{#each data.admissionPaths as path}
												<option value={path.id} selected={editingFee?.admissionPathId === path.id}>
													{path.name}
												</option>
											{/each}
										</select>
									</div>
								</div>

								<div>
									<Label for="description" class="block text-gray-700 mb-1">Description</Label>
									<Textarea
										id="description"
										name="description"
										rows={2}
										value={editingFee?.description || ''}
									/>
								</div>

								<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
									<div>
										<Label for="amount" class="block text-gray-700 mb-1">
											Amount (IDR) <span class="text-red-500">*</span>
										</Label>
										<Input
											type="number"
											id="amount"
											name="amount"
											min="0"
											step="1000"
											required
											value={editingFee?.amount || ''}
										/>
									</div>

									<div>
										<Label for="currency" class="block text-gray-700 mb-1">Currency</Label>
										<select
											id="currency"
											name="currency"
											class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
										>
											<option value="IDR" selected={editingFee?.currency === 'IDR' || !editingFee}
												>IDR</option
											>
											<option value="USD" selected={editingFee?.currency === 'USD'}>USD</option>
											<option value="EUR" selected={editingFee?.currency === 'EUR'}>EUR</option>
										</select>
									</div>

									<div>
										<Label for="status" class="block text-gray-700 mb-1">Status</Label>
										<select
											id="status"
											name="status"
											class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
										>
											<option
												value="active"
												selected={editingFee?.status === 'active' || !editingFee}>Active</option
											>
											<option value="inactive" selected={editingFee?.status === 'inactive'}
												>Inactive</option
											>
										</select>
									</div>
								</div>

								<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<Label for="paymentTiming" class="block text-gray-700 mb-1">
											Payment Timing <span class="text-red-500">*</span>
										</Label>
										<select
											id="paymentTiming"
											name="paymentTiming"
											required
											class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
										>
											<option
												value="registration"
												selected={editingFee?.paymentTiming === 'registration' || !editingFee}
												>Upon Registration</option
											>
											<option
												value="acceptance"
												selected={editingFee?.paymentTiming === 'acceptance'}
												>Upon Acceptance</option
											>
											<option
												value="enrollment"
												selected={editingFee?.paymentTiming === 'enrollment'}
												>Upon Enrollment</option
											>
											<option value="custom" selected={editingFee?.paymentTiming === 'custom'}
												>Custom</option
											>
										</select>
									</div>

									<div>
										<Label for="dueDateOffsetDays" class="block text-gray-700 mb-1">
											Days After Registration (for custom)
										</Label>
										<Input
											type="number"
											id="dueDateOffsetDays"
											name="dueDateOffsetDays"
											min="0"
											value={editingFee?.dueDateOffsetDays || 0}
										/>
									</div>
								</div>

								<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<Label for="penaltyAmount" class="block text-gray-700 mb-1">
											Late Fee Amount (IDR)
										</Label>
										<Input
											type="number"
											id="penaltyAmount"
											name="penaltyAmount"
											min="0"
											step="1000"
											value={editingFee?.penaltyAmount || ''}
											placeholder="Optional"
										/>
									</div>

									<div>
										<Label for="penaltyGraceDays" class="block text-gray-700 mb-1">
											Grace Period (days)
										</Label>
										<Input
											type="number"
											id="penaltyGraceDays"
											name="penaltyGraceDays"
											min="0"
											value={editingFee?.penaltyGraceDays || 0}
										/>
									</div>
								</div>

								{#if hasErrors}
									<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
										<p class="font-bold">Validation Errors:</p>
										<ul class="list-disc list-inside">
											{#each hasErrors as error}
												<li>{error.message}</li>
											{/each}
										</ul>
									</div>
								{/if}

								<div class="flex justify-end space-x-3 pt-4 border-t">
									<button
										type="button"
										onclick={closeModal}
										class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
									>
										Cancel
									</button>
									<button
										type="submit"
										disabled={saving}
										class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
									>
										{saving ? 'Saving...' : editingFee ? 'Update Fee' : 'Create Fee'}
									</button>
								</div>
							</form>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}
