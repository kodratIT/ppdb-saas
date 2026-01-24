<script lang="ts">
	import type { PageData } from './$types';
	import SubscriptionNav from '$lib/components/admin/SubscriptionNav.svelte';
	import * as Card from '$lib/components/ui/card';
	import * as Table from '$lib/components/ui/table';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Plus, Edit, Trash2, CheckCircle2, XCircle, Ticket } from 'lucide-svelte';
	import { i18n } from '$lib/i18n/index.svelte';
	import { enhance } from '$app/forms';

	let { data }: { data: PageData } = $props();

	function formatDate(date: Date | null) {
		if (!date) return 'Never';
		return new Date(date).toLocaleDateString('id-ID', {
			dateStyle: 'medium'
		});
	}
</script>

<div class="flex flex-col gap-6 p-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold tracking-tight mb-1">Coupon Management</h1>
			<p class="text-muted-foreground">Create and manage discount codes.</p>
		</div>
		<Button href="/admin/subscription/coupons/new">
			<Plus class="mr-2 h-4 w-4" /> New Coupon
		</Button>
	</div>

	<Card.Root>
		<Card.Content class="p-0">
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>Code</Table.Head>
						<Table.Head>Type</Table.Head>
						<Table.Head>Value</Table.Head>
						<Table.Head>Usage</Table.Head>
						<Table.Head>Expires</Table.Head>
						<Table.Head>Status</Table.Head>
						<Table.Head class="text-right">Actions</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#if data.coupons.length === 0}
						<Table.Row>
							<Table.Cell colspan={7} class="text-center py-8 text-muted-foreground">
								<Ticket class="h-8 w-8 mx-auto mb-2 opacity-20" />
								No coupons found. Create your first one!
							</Table.Cell>
						</Table.Row>
					{:else}
						{#each data.coupons as coupon}
							<Table.Row>
								<Table.Cell class="font-bold">{coupon.code}</Table.Cell>
								<Table.Cell class="capitalize">{coupon.type.replace('_', ' ')}</Table.Cell>
								<Table.Cell>
									{coupon.type === 'percentage' ? `${coupon.value}%` : `Rp ${coupon.value.toLocaleString('id-ID')}`}
								</Table.Cell>
								<Table.Cell>
									{coupon.redemptionsCount} / {coupon.maxRedemptions ?? '∞'}
								</Table.Cell>
								<Table.Cell>{formatDate(coupon.expiresAt)}</Table.Cell>
								<Table.Cell>
									<Badge variant={coupon.isActive ? 'default' : 'secondary'}>
										{coupon.isActive ? 'Active' : 'Inactive'}
									</Badge>
								</Table.Cell>
								<Table.Cell class="text-right">
									<div class="flex justify-end gap-2">
										<form method="POST" action="?/toggleStatus" use:enhance>
											<input type="hidden" name="id" value={coupon.id} />
											<input type="hidden" name="isActive" value={coupon.isActive} />
											<Button variant="ghost" size="icon" type="submit" title={coupon.isActive ? 'Deactivate' : 'Activate'}>
												{#if coupon.isActive}
													<XCircle class="h-4 w-4 text-orange-500" />
												{:else}
													<CheckCircle2 class="h-4 w-4 text-green-500" />
												{/if}
											</Button>
										</form>
										<Button variant="ghost" size="icon" href="/admin/subscription/coupons/{coupon.id}">
											<Edit class="h-4 w-4" />
										</Button>
										<form method="POST" action="?/delete" use:enhance onsubmit={() => confirm('Are you sure?')}>
											<input type="hidden" name="id" value={coupon.id} />
											<Button variant="ghost" size="icon" type="submit" class="text-red-500">
												<Trash2 class="h-4 w-4" />
											</Button>
										</form>
									</div>
								</Table.Cell>
							</Table.Row>
						{/each}
					{/if}
				</Table.Body>
			</Table.Root>
		</Card.Content>
	</Card.Root>
</div>
