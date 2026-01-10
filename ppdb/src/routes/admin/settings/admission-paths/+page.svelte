<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';
	import Input from '$lib/components/ui/input.svelte';
	import Label from '$lib/components/ui/label.svelte';
	import Textarea from '$lib/components/ui/textarea.svelte';

	let { data }: { data: PageData } = $props();

	let showCreateModal = $state(false);
	let editingPath = $state<any>(null);
	let showDeleteConfirm = $state<string | null>(null);

	// Status badge colors
	const statusColors = {
		draft: 'bg-gray-100 text-gray-800',
		open: 'bg-green-100 text-green-800',
		closed: 'bg-red-100 text-red-800',
		archived: 'bg-purple-100 text-purple-800'
	};

	// Calculate progress percentage
	function getProgress(filledSlots: number, quota: number): number {
		return (filledSlots / quota) * 100;
	}

	// Get available actions based on status
	function getAvailableActions(status: string) {
		switch (status) {
			case 'draft':
				return ['publish', 'edit', 'delete'];
			case 'open':
				return ['close', 'edit'];
			case 'closed':
				return ['reopen', 'archive', 'edit'];
			case 'archived':
				return [];
			default:
				return [];
		}
	}
</script>

<div class="container mx-auto px-4 py-8 max-w-6xl">
	<div class="flex justify-between items-center mb-8">
		<div>
			<h1 class="text-3xl font-bold text-gray-900">Admission Paths & Quota</h1>
			<p class="text-gray-600 mt-2">Manage admission paths and track quota allocation</p>
		</div>
		<button
			onclick={() => (showCreateModal = true)}
			class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
		>
			+ Create New Path
		</button>
	</div>

	{#if data.error}
		<div class="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
			{data.error}
		</div>
	{/if}

	<!-- Admission Paths List -->
	<div class="space-y-4">
		{#if data.paths.length === 0}
			<div class="text-center py-12 bg-gray-50 rounded-lg">
				<p class="text-gray-500 text-lg">No admission paths configured yet.</p>
				<p class="text-gray-400 mt-2">Create your first admission path to get started.</p>
			</div>
		{:else}
			{#each data.paths as path}
				<div
					class="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
				>
					<div class="flex justify-between items-start mb-4">
						<div class="flex-1">
							<div class="flex items-center gap-3">
								<h3 class="text-xl font-semibold text-gray-900">{path.name}</h3>
								<span
									class="px-3 py-1 rounded-full text-xs font-medium {statusColors[path.status]}"
								>
									{path.status.toUpperCase()}
								</span>
							</div>
							{#if path.description}
								<p class="text-gray-600 mt-1">{path.description}</p>
							{/if}
						</div>

						<!-- Action Buttons -->
						<div class="flex gap-2 ml-4">
							{#if getAvailableActions(path.status).includes('publish')}
								<form method="POST" action="?/publish" use:enhance>
									<input type="hidden" name="pathId" value={path.id} />
									<button
										type="submit"
										class="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
									>
										Publish
									</button>
								</form>
							{/if}

							{#if getAvailableActions(path.status).includes('close')}
								<form method="POST" action="?/close" use:enhance>
									<input type="hidden" name="pathId" value={path.id} />
									<button
										type="submit"
										class="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
									>
										Close
									</button>
								</form>
							{/if}

							{#if getAvailableActions(path.status).includes('reopen')}
								<form method="POST" action="?/reopen" use:enhance>
									<input type="hidden" name="pathId" value={path.id} />
									<button
										type="submit"
										class="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
									>
										Reopen
									</button>
								</form>
							{/if}

							{#if getAvailableActions(path.status).includes('archive')}
								<form method="POST" action="?/archive" use:enhance>
									<input type="hidden" name="pathId" value={path.id} />
									<button
										type="submit"
										class="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700"
									>
										Archive
									</button>
								</form>
							{/if}

							{#if getAvailableActions(path.status).includes('edit')}
								<button
									onclick={() => (editingPath = path)}
									class="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
								>
									Edit
								</button>
							{/if}

							{#if getAvailableActions(path.status).includes('delete')}
								<button
									onclick={() => (showDeleteConfirm = path.id)}
									class="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
								>
									Delete
								</button>
							{/if}
						</div>
					</div>

					<!-- Quota Progress -->
					<div class="mt-4">
						<div class="flex justify-between text-sm mb-2">
							<span class="text-gray-600">Quota Utilization</span>
							<span class="font-medium text-gray-900">
								{path.filledSlots} / {path.quota} slots
							</span>
						</div>
						<div class="w-full bg-gray-200 rounded-full h-2.5">
							<div
								class="bg-blue-600 h-2.5 rounded-full transition-all"
								style="width: {getProgress(path.filledSlots, path.quota)}%"
							></div>
						</div>
					</div>
				</div>
			{/each}
		{/if}
	</div>
</div>

<!-- Create Modal -->
{#if showCreateModal}
	<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
		<div class="bg-white rounded-lg max-w-md w-full p-6">
			<h2 class="text-2xl font-bold mb-4">Create Admission Path</h2>
			<form method="POST" action="?/create" use:enhance>
				<div class="space-y-4">
					<div>
						<Label for="name" class="block text-gray-700 mb-1">Path Name *</Label>
						<Input
							type="text"
							id="name"
							name="name"
							required
							placeholder="e.g., Jalur Prestasi"
						/>
					</div>

					<div>
						<Label for="description" class="block text-gray-700 mb-1">Description</Label>
						<Textarea
							id="description"
							name="description"
							rows={3}
							placeholder="Optional description..."
						/>
					</div>

					<div>
						<Label for="quota" class="block text-gray-700 mb-1">Quota *</Label>
						<Input
							type="number"
							id="quota"
							name="quota"
							required
							min="1"
							max="10000"
							placeholder="e.g., 50"
						/>
					</div>
				</div>

				<div class="flex gap-3 mt-6">
					<button
						type="submit"
						class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
					>
						Create
					</button>
					<button
						type="button"
						onclick={() => (showCreateModal = false)}
						class="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
					>
						Cancel
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<!-- Edit Modal -->
{#if editingPath}
	<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
		<div class="bg-white rounded-lg max-w-md w-full p-6">
			<h2 class="text-2xl font-bold mb-4">Edit Admission Path</h2>
			<form method="POST" action="?/update" use:enhance>
				<input type="hidden" name="pathId" value={editingPath.id} />
				<div class="space-y-4">
					<div>
						<Label for="edit-name" class="block text-gray-700 mb-1">Path Name *</Label>
						<Input
							type="text"
							id="edit-name"
							name="name"
							required
							value={editingPath.name}
						/>
					</div>

					<div>
						<Label for="edit-description" class="block text-gray-700 mb-1">Description</Label>
						<Textarea
							id="edit-description"
							name="description"
							rows={3}
							value={editingPath.description || ''}
						/>
					</div>

					<div>
						<Label for="edit-quota" class="block text-gray-700 mb-1">Quota *</Label>
						<Input
							type="number"
							id="edit-quota"
							name="quota"
							required
							min={editingPath.filledSlots}
							max="10000"
							value={editingPath.quota}
						/>
						<p class="text-xs text-gray-500 mt-1">
							Current filled slots: {editingPath.filledSlots}
						</p>
					</div>
				</div>

				<div class="flex gap-3 mt-6">
					<button
						type="submit"
						class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
					>
						Update
					</button>
					<button
						type="button"
						onclick={() => (editingPath = null)}
						class="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
					>
						Cancel
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<!-- Delete Confirmation Modal -->
{#if showDeleteConfirm}
	<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
		<div class="bg-white rounded-lg max-w-md w-full p-6">
			<h2 class="text-2xl font-bold mb-4 text-red-600">Confirm Delete</h2>
			<p class="text-gray-700 mb-6">
				Are you sure you want to delete this admission path? This action cannot be undone.
			</p>
			<form method="POST" action="?/delete" use:enhance>
				<input type="hidden" name="pathId" value={showDeleteConfirm} />
				<div class="flex gap-3">
					<button
						type="submit"
						class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
					>
						Delete
					</button>
					<button
						type="button"
						onclick={() => (showDeleteConfirm = null)}
						class="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
					>
						Cancel
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
