<script lang="ts">
	/* eslint-disable svelte/require-each-key */
	import { page } from '$app/stores';
	import { Table, TableBody, TableCell, TableHead, TableRow } from '$lib/components/ui/table';
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardHeader,
		CardTitle,
		CardDescription
	} from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { ArrowLeft, CheckCircle2 } from 'lucide-svelte';

	export let data;

	$: tenant = $page.params.tenant;

	function formatCurrency(amount: number) {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			minimumFractionDigits: 0
		}).format(amount);
	}
</script>

<div class="flex flex-col gap-6 p-6">
	<!-- Header -->
	<div class="flex items-center gap-4">
		<Button variant="outline" size="icon" href="/{tenant}/admin/finance">
			<ArrowLeft class="h-4 w-4" />
		</Button>
		<div>
			<h1 class="text-2xl font-bold tracking-tight">Payment Verification</h1>
			<p class="text-muted-foreground">Verify manual transfer proofs from parents.</p>
		</div>
	</div>

	<!-- Content -->
	<Card>
		<CardHeader>
			<CardTitle>Pending Proofs</CardTitle>
			<CardDescription>
				There are {data.proofs.length} payment proofs waiting for review.
			</CardDescription>
		</CardHeader>
		<CardContent>
			{#if data.proofs.length === 0}
				<div class="flex flex-col items-center justify-center py-12 text-center">
					<div class="mb-4 rounded-full bg-green-100 p-4 dark:bg-green-900/20">
						<CheckCircle2 class="h-8 w-8 text-green-600 dark:text-green-400" />
					</div>
					<h3 class="text-lg font-semibold">All Caught Up!</h3>
					<p class="text-muted-foreground max-w-sm">
						There are no pending payment proofs to verify at the moment.
					</p>
					<div class="mt-6">
						<Button variant="outline" href="/{tenant}/admin/finance">
							Back to Finance Dashboard
						</Button>
					</div>
				</div>
			{:else}
				<Table>
					<thead>
						<TableRow>
							<TableHead>Date</TableHead>
							<TableHead>Student</TableHead>
							<TableHead>Amount</TableHead>
							<TableHead>Parent</TableHead>
							<TableHead class="text-right">Action</TableHead>
						</TableRow>
					</thead>
					<TableBody>
						{#each data.proofs as proof}
							<TableRow>
								<TableCell>
									<div class="flex flex-col">
										<span class="font-medium">
											{new Date(proof.uploadedAt).toLocaleDateString('id-ID', {
												day: 'numeric',
												month: 'long',
												year: 'numeric'
											})}
										</span>
										<span class="text-muted-foreground text-xs">
											{new Date(proof.uploadedAt).toLocaleTimeString('id-ID', {
												hour: '2-digit',
												minute: '2-digit'
											})}
										</span>
									</div>
								</TableCell>
								<TableCell>
									<div class="font-medium">{proof.studentName}</div>
									{#if proof.notes}
										<div class="text-muted-foreground truncate max-w-[200px] text-xs">
											Note: {proof.notes}
										</div>
									{/if}
								</TableCell>
								<TableCell>
									<Badge variant="outline" class="font-mono">
										{formatCurrency(proof.amount)}
									</Badge>
								</TableCell>
								<TableCell>{proof.parentName}</TableCell>
								<TableCell class="text-right">
									<Button
										size="sm"
										variant="default"
										href="/{tenant}/admin/finance/verification/{proof.id}"
									>
										Review
									</Button>
								</TableCell>
							</TableRow>
						{/each}
					</TableBody>
				</Table>
			{/if}
		</CardContent>
	</Card>
</div>
