<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';
	import Card from '$lib/components/ui/card.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import Badge from '$lib/components/ui/badge.svelte';
	import ScoreInput from '$lib/components/scoring/ScoreInput.svelte';
	import NotesTextarea from '$lib/components/scoring/NotesTextarea.svelte';
	import { ArrowLeft, Lock, Unlock, Save, CheckCircle } from 'lucide-svelte';

	let { data } = $props();

	let score = $state(data.score?.score || 0);
	let notes = $state(data.score?.notes || '');
	let isSubmitting = $state(false);
	let showUnlockModal = $state(false);
	let unlockReason = $state('');

	const isFinalized = $derived(data.score?.isFinalized || false);
	const isLocked = $derived(isFinalized && !data.isAdmin);

	async function handleSave(finalize = false) {
		isSubmitting = true;
		try {
			const response = await fetch(`/api/admin/scores/${data.application.id}`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ score, notes, finalize })
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || 'Failed to save score');
			}

			await invalidateAll();
			alert(finalize ? 'Score finalized successfully!' : 'Score saved as draft');
		} catch (error) {
			alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
		} finally {
			isSubmitting = false;
		}
	}

	async function handleUnlock() {
		if (!unlockReason.trim() || unlockReason.length < 10) {
			alert('Unlock reason must be at least 10 characters');
			return;
		}

		if (!data.score?.id) {
			alert('Score not found');
			return;
		}

		isSubmitting = true;
		try {
			const response = await fetch(`/api/admin/scores/${data.score.id}/unlock`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ reason: unlockReason })
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || 'Failed to unlock score');
			}

			await invalidateAll();
			showUnlockModal = false;
			unlockReason = '';
			alert('Score unlocked successfully');
		} catch (error) {
			alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
		} finally {
			isSubmitting = false;
		}
	}
</script>

<svelte:head>
	<title>Score Candidate - {data.application.childFullName}</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 py-8 px-4">
	<div class="max-w-4xl mx-auto">
		<!-- Header -->
		<div class="mb-6">
			<Button variant="outline" size="sm" onclick={() => goto(`/${data.tenantSlug}/admin/scoring`)}>
				<ArrowLeft class="w-4 h-4 mr-2" />
				Back to List
			</Button>
		</div>

		<!-- Application Info -->
		<Card class="p-6 mb-6">
			<div class="flex items-start justify-between">
				<div>
					<h1 class="text-2xl font-bold text-gray-900">{data.application.childFullName}</h1>
					<p class="text-gray-600 mt-1">{data.application.admissionPath?.name || 'N/A'}</p>
				</div>
				{#if isFinalized}
					<Badge variant="default">
						<Lock class="w-3 h-3 mr-1" />
						Finalized
					</Badge>
				{/if}
			</div>

			<div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t">
				<div>
					<p class="text-xs text-gray-500">Parent</p>
					<p class="text-sm font-medium">{data.application.parentFullName}</p>
				</div>
				<div>
					<p class="text-xs text-gray-500">Phone</p>
					<p class="text-sm font-medium">{data.application.parentPhone}</p>
				</div>
				<div>
					<p class="text-xs text-gray-500">Gender</p>
					<p class="text-sm font-medium capitalize">{data.application.childGender || '-'}</p>
				</div>
				<div>
					<p class="text-xs text-gray-500">DOB</p>
					<p class="text-sm font-medium">
						{data.application.childDob
							? new Date(data.application.childDob).toLocaleDateString('id-ID')
							: '-'}
					</p>
				</div>
			</div>
		</Card>

		<!-- Scoring Form -->
		<Card class="p-6">
			<h2 class="text-lg font-bold text-gray-900 mb-6">Candidate Scoring</h2>

			<div class="space-y-6">
				<ScoreInput value={score} disabled={isLocked} onchange={(val) => (score = val)} />

				<NotesTextarea value={notes} disabled={isLocked} onchange={(val) => (notes = val)} />

				{#if data.score?.unlockedBy}
					<div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
						<p class="text-sm text-yellow-800">
							<strong>Unlocked by admin:</strong>
							{data.score.unlocker?.name || data.score.unlocker?.email}
						</p>
						<p class="text-xs text-yellow-700 mt-1">Reason: {data.score.unlockReason}</p>
					</div>
				{/if}

				<div class="flex gap-3 pt-4">
					{#if isLocked}
						<p class="text-gray-600 flex items-center gap-2">
							<Lock class="w-4 h-4" />
							Score is finalized. Contact admin to unlock.
						</p>
						{#if data.isAdmin}
							<Button variant="outline" onclick={() => (showUnlockModal = true)}>
								<Unlock class="w-4 h-4 mr-2" />
								Unlock Score
							</Button>
						{/if}
					{:else}
						<Button variant="outline" onclick={() => handleSave(false)} disabled={isSubmitting}>
							<Save class="w-4 h-4 mr-2" />
							Save Draft
						</Button>
						<Button
							onclick={() => handleSave(true)}
							disabled={isSubmitting}
							class="bg-green-600 hover:bg-green-700"
						>
							<CheckCircle class="w-4 h-4 mr-2" />
							Finalize Score
						</Button>
					{/if}
				</div>
			</div>
		</Card>
	</div>
</div>

<!-- Unlock Modal -->
{#if showUnlockModal}
	<div class="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
		<div class="bg-white rounded-lg max-w-md w-full p-6">
			<h3 class="text-lg font-bold text-gray-900 mb-4">Unlock Score</h3>
			<p class="text-sm text-gray-600 mb-4">
				Please provide a reason for unlocking this finalized score. This will be recorded in the
				audit log.
			</p>
			<textarea
				bind:value={unlockReason}
				placeholder="e.g., Interviewer entered wrong score due to input error"
				rows="4"
				class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
			></textarea>
			<div class="flex gap-3 mt-6">
				<Button
					variant="outline"
					class="flex-1"
					onclick={() => (showUnlockModal = false)}
					disabled={isSubmitting}
				>
					Cancel
				</Button>
				<Button
					class="flex-1 bg-yellow-600 hover:bg-yellow-700"
					onclick={handleUnlock}
					disabled={isSubmitting}
				>
					Unlock
				</Button>
			</div>
		</div>
	</div>
{/if}
