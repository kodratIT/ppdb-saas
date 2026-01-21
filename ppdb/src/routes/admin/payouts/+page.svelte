<script lang="ts">
	import type { PageData } from './$types';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import * as Table from '$lib/components/ui/table';
	import { Badge } from '$lib/components/ui/badge';
	import { formatCurrency } from '$lib/utils';
	import { enhance } from '$app/forms';
	import { CreditCard, CheckCircle2, XCircle, Clock, ExternalLink } from 'lucide-svelte';
	import { i18n } from '$lib/i18n/index.svelte';

	let { data } = $props<{ data: PageData }>();
	let payouts = $derived(data.payouts);

	const getStatusColor = (status: string) => {
		switch (status.toLowerCase()) {
			case 'completed':
				return 'bg-green-100 text-green-700 border-green-200';
			case 'pending':
				return 'bg-yellow-100 text-yellow-700 border-yellow-200';
			case 'processed':
				return 'bg-blue-100 text-blue-700 border-blue-200';
			case 'failed':
				return 'bg-red-100 text-red-700 border-red-200';
			case 'rejected':
				return 'bg-slate-100 text-slate-700 border-slate-200';
			default:
				return 'bg-gray-100 text-gray-700';
		}
	};

	const getStatusText = (status: string) => {
		switch (status.toLowerCase()) {
			case 'completed':
				return i18n.t('admin.payouts.completed');
			case 'pending':
				return i18n.t('admin.payouts.pending');
			case 'processed':
				return i18n.t('admin.payouts.processed');
			case 'failed':
				return i18n.t('admin.payouts.failed');
			case 'rejected':
				return i18n.t('admin.payouts.rejected');
			default:
				return status.toUpperCase();
		}
	};
</script>

<div class="container mx-auto px-4 py-8 max-w-6xl">
	<div class="flex items-center justify-between mb-8">
		<div>
			<h1 class="text-3xl font-bold tracking-tight">{i18n.t('admin.payouts.title')}</h1>
			<p class="text-muted-foreground mt-1">{i18n.t('admin.payouts.subtitle')}</p>
		</div>
	</div>

	<div class="grid gap-4 md:grid-cols-3 mb-8">
		<Card.Root>
			<Card.Header class="pb-2">
				<Card.Title class="text-sm font-medium text-muted-foreground uppercase tracking-wider">
					{i18n.t('admin.payouts.totalPayouts')}
				</Card.Title>
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold">{payouts.length}</div>
				<p class="text-xs text-muted-foreground mt-1">
					{i18n.t('admin.payouts.requestsProcessed')}
				</p>
			</Card.Content>
		</Card.Root>
		<Card.Root>
			<Card.Header class="pb-2">
				<Card.Title class="text-sm font-medium text-muted-foreground uppercase tracking-wider">
					{i18n.t('admin.payouts.pendingAmount')}
				</Card.Title>
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold">
					{formatCurrency(
						payouts.filter((p) => p.status === 'pending').reduce((acc, p) => acc + p.amount, 0)
					)}
				</div>
				<p class="text-xs text-muted-foreground mt-1">{i18n.t('admin.payouts.awaitingApproval')}</p>
			</Card.Content>
		</Card.Root>
		<Card.Root>
			<Card.Header class="pb-2">
				<Card.Title class="text-sm font-medium text-muted-foreground uppercase tracking-wider">
					{i18n.t('admin.payouts.operational')}
				</Card.Title>
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold text-green-600">{i18n.t('admin.payouts.operational')}</div>
				<p class="text-xs text-muted-foreground mt-1">{i18n.t('admin.payouts.bridgeConnected')}</p>
			</Card.Content>
		</Card.Root>
	</div>

	<Card.Root>
		<Card.Header>
			<Card.Title>{i18n.t('admin.payouts.payoutRequests')}</Card.Title>
			<Card.Description>{i18n.t('admin.payouts.payoutRequestsDesc')}</Card.Description>
		</Card.Header>
		<Card.Content class="p-0">
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>{i18n.t('admin.payouts.organization')}</Table.Head>
						<Table.Head>{i18n.t('admin.payouts.amount')}</Table.Head>
						<Table.Head>{i18n.t('admin.payouts.bankDetails')}</Table.Head>
						<Table.Head>{i18n.t('admin.payouts.status')}</Table.Head>
						<Table.Head>{i18n.t('admin.payouts.requestedAt')}</Table.Head>
						<Table.Head class="text-right">{i18n.t('admin.payouts.actions')}</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#if payouts.length === 0}
						<Table.Row>
							<Table.Cell colspan={6} class="text-center py-12 text-muted-foreground">
								{i18n.t('admin.payouts.noRequests')}
							</Table.Cell>
						</Table.Row>
					{:else}
						{#each payouts as payout}
							<Table.Row>
								<Table.Cell>
									<div class="font-medium">{payout.tenantName}</div>
									<div class="text-xs text-muted-foreground">
										{i18n.t('admin.payouts.byActor', { name: payout.requestedByName })}
									</div>
								</Table.Cell>
								<Table.Cell class="font-bold">
									{formatCurrency(payout.amount)}
								</Table.Cell>
								<Table.Cell>
									<div class="text-sm font-medium uppercase">{payout.bankName}</div>
									<div class="text-xs font-mono">{payout.accountNumber}</div>
									<div class="text-xs text-muted-foreground">{payout.accountName}</div>
								</Table.Cell>
								<Table.Cell>
									<Badge class={getStatusColor(payout.status)} variant="outline">
										{getStatusText(payout.status)}
									</Badge>
								</Table.Cell>
								<Table.Cell class="text-xs text-muted-foreground">
									{new Date(payout.createdAt).toLocaleDateString(
										i18n.language === 'id' ? 'id-ID' : 'en-US'
									)}
								</Table.Cell>
								<Table.Cell class="text-right">
									{#if payout.status === 'pending'}
										<div class="flex justify-end gap-2">
											<form action="?/updateStatus" method="POST" use:enhance>
												<input type="hidden" name="payoutId" value={payout.id} />
												<input type="hidden" name="status" value="completed" />
												<Button
													size="sm"
													variant="outline"
													class="h-8 border-green-200 text-green-700 hover:bg-green-50"
												>
													<CheckCircle2 class="mr-1 h-3.5 w-3.5" />
													{i18n.t('admin.payouts.complete')}
												</Button>
											</form>
											<form action="?/updateStatus" method="POST" use:enhance>
												<input type="hidden" name="payoutId" value={payout.id} />
												<input type="hidden" name="status" value="rejected" />
												<Button size="sm" variant="ghost" class="h-8 text-red-600 hover:bg-red-50">
													<XCircle class="mr-1 h-3.5 w-3.5" />
													{i18n.t('admin.payouts.reject')}
												</Button>
											</form>
										</div>
									{:else}
										<div class="text-xs text-muted-foreground italic">
											{payout.processedAt
												? i18n.t('admin.payouts.processedOn', {
														date: new Date(payout.processedAt).toLocaleDateString(
															i18n.language === 'id' ? 'id-ID' : 'en-US'
														)
													})
												: 'N/A'}
										</div>
									{/if}
								</Table.Cell>
							</Table.Row>
						{/each}
					{/if}
				</Table.Body>
			</Table.Root>
		</Card.Content>
	</Card.Root>
</div>
