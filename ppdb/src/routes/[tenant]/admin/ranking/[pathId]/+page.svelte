<script lang="ts">
	/* eslint-disable @typescript-eslint/no-explicit-any */
	/* eslint-disable svelte/no-navigation-without-resolve */
	import { page } from '$app/stores';
	import {
		Button,
		Input,
		Label,
		Table,
		TableBody,
		TableCell,
		TableHead,
		TableRow,
		Badge
	} from '$lib/components/ui';
	import { goto } from '$app/navigation';
	import { Loader2 } from 'lucide-svelte';

	export let data: { ranking: any };

	let ranking = data.ranking;

	let quotaAccepted = ranking.quota;
	let quotaReserved = 0;
	let isSubmitting = false;

	// Reactive ranking calculation to simulate changes client-side before finalizing
	$: candidates = ranking.candidates.map((c: any, index: number) => {
		let estimatedStatus = 'rejected';
		if (index + 1 <= quotaAccepted) {
			estimatedStatus = 'accepted';
		} else if (index + 1 <= quotaAccepted + quotaReserved) {
			estimatedStatus = 'reserved';
		}
		return { ...c, estimatedStatus };
	});

	$: acceptedCount = candidates.filter((c: any) => c.estimatedStatus === 'accepted').length;
	$: reservedCount = candidates.filter((c: any) => c.estimatedStatus === 'reserved').length;
	$: rejectedCount = candidates.filter((c: any) => c.estimatedStatus === 'rejected').length;

	async function handleFinalize() {
		if (
			!confirm(
				'Are you sure you want to finalize this ranking? This will update application statuses.'
			)
		)
			return;

		isSubmitting = true;
		try {
			const res = await fetch(`/api/admin/ranking/${ranking.pathId}/finalize`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					quotaAccepted: Number(quotaAccepted),
					quotaReserved: Number(quotaReserved)
				})
			});

			if (!res.ok) {
				const err = await res.json();
				throw new Error(err.message || 'Failed to finalize');
			}

			alert('Ranking finalized successfully!');
			// Redirect or refresh
			window.location.href = `/${$page.params.tenant}/admin/ranking`;
		} catch (e: any) {
			alert(e.message);
		} finally {
			isSubmitting = false;
		}
	}
</script>

<div class="space-y-6">
	<div class="flex justify-between items-center">
		<div>
			<h2 class="text-3xl font-bold tracking-tight">Ranking Simulator: {ranking.pathName}</h2>
			<p class="text-muted-foreground">Adjust quotas to simulate selection results.</p>
		</div>
		<div class="flex gap-2">
			<Button variant="outline" onclick={() => goto(`/${$page.params.tenant}/admin/ranking`)}
				>Cancel</Button
			>
			<Button onclick={handleFinalize} disabled={isSubmitting}>
				{#if isSubmitting}
					<Loader2 class="mr-2 h-4 w-4 animate-spin" />
				{/if}
				Finalize Ranking
			</Button>
		</div>
	</div>

	<div class="grid gap-4 md:grid-cols-3">
		<div class="bg-card p-4 rounded-lg border shadow-sm">
			<Label for="quotaAccepted">Accepted Quota</Label>
			<Input type="number" id="quotaAccepted" bind:value={quotaAccepted} class="mt-2" min="0" />
			<p class="text-xs text-muted-foreground mt-1">Candidates: {acceptedCount}</p>
		</div>
		<div class="bg-card p-4 rounded-lg border shadow-sm">
			<Label for="quotaReserved">Reserved/Waiting Quota</Label>
			<Input type="number" id="quotaReserved" bind:value={quotaReserved} class="mt-2" min="0" />
			<p class="text-xs text-muted-foreground mt-1">Candidates: {reservedCount}</p>
		</div>
		<div class="bg-card p-4 rounded-lg border shadow-sm flex items-center justify-center">
			<div class="text-center">
				<div class="text-2xl font-bold text-red-500">{rejectedCount}</div>
				<div class="text-sm text-muted-foreground">Projected Rejected</div>
			</div>
		</div>
	</div>

	<div class="rounded-md border">
		<Table>
			<thead>
				<TableRow>
					<TableHead class="w-[80px]">Rank</TableHead>
					<TableHead>Name</TableHead>
					<TableHead>Score</TableHead>
					<TableHead>Distance (m)</TableHead>
					<TableHead>Age (y)</TableHead>
					<TableHead>Current Status</TableHead>
					<TableHead>Est. Status</TableHead>
				</TableRow>
			</thead>
			<TableBody>
				{#each candidates as candidate (candidate.id)}
					<TableRow
						class={candidate.estimatedStatus === 'accepted'
							? 'bg-green-50/50'
							: candidate.estimatedStatus === 'reserved'
								? 'bg-yellow-50/50'
								: 'bg-red-50/50 text-muted-foreground'}
					>
						<TableCell class="font-medium">{candidate.rank}</TableCell>
						<TableCell>{candidate.name}</TableCell>
						<TableCell>{candidate.score}</TableCell>
						<TableCell>{candidate.distance ?? '-'}</TableCell>
						<TableCell>{candidate.age ?? '-'}</TableCell>
						<TableCell>
							<Badge variant="outline">{candidate.status}</Badge>
						</TableCell>
						<TableCell>
							<Badge
								variant={candidate.estimatedStatus === 'accepted'
									? 'default'
									: candidate.estimatedStatus === 'reserved'
										? 'secondary'
										: 'destructive'}
							>
								{candidate.estimatedStatus.toUpperCase()}
							</Badge>
						</TableCell>
					</TableRow>
				{/each}
			</TableBody>
		</Table>
	</div>
</div>
