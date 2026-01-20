<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { enhance } from '$app/forms';
	import { Badge } from '$lib/components/ui/badge';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import * as Table from '$lib/components/ui/table';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { MoreHorizontal, FileText, Search, X, CheckCircle, Ban, Loader2, Calendar } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let searchValue = $state(data.filters.search);
	let statusValue = $state(data.filters.status);
	let timeout: NodeJS.Timeout;

	// Update Status State
	let isStatusDialogOpen = $state(false);
	let isDetailDialogOpen = $state(false);
	let isUpdating = $state(false);
	let selectedInvoice = $state<any>(null);
	let selectedStatus = $state<'paid' | 'pending' | 'void'>('pending');

	function handleSearch() {
		clearTimeout(timeout);
		timeout = setTimeout(() => {
			updateFilters();
		}, 500);
	}

	function handleStatusChange() {
		updateFilters();
	}

	function updateFilters() {
		const query = new URLSearchParams(page.url.searchParams);
		if (searchValue) query.set('q', searchValue);
		else query.delete('q');

		if (statusValue && statusValue !== 'all') query.set('status', statusValue);
		else query.delete('status');

		goto(`?${query.toString()}`, { keepFocus: true, noScroll: true });
	}

	function resetFilters() {
		searchValue = '';
		statusValue = 'all';
		goto('?', { keepFocus: true, noScroll: true });
	}

	function openStatusDialog(invoice: any, status: 'paid' | 'pending' | 'void') {
		selectedInvoice = invoice;
		selectedStatus = status;
		isStatusDialogOpen = true;
	}

	function openDetailDialog(invoice: any) {
		selectedInvoice = invoice;
		isDetailDialogOpen = true;
	}

	function getStatusVariant(status: string) {
		switch (status) {
			case 'paid':
				return 'default';
			case 'pending':
				return 'secondary';
			case 'void':
				return 'destructive';
			default:
				return 'outline';
		}
	}

	function formatCurrency(amount: number) {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			minimumFractionDigits: 0
		}).format(amount);
	}
</script>

<div class="flex flex-col gap-6 p-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold tracking-tight">Transactions</h1>
			<p class="text-muted-foreground">History of subscription invoices and payments.</p>
		</div>
	</div>

	<!-- Filter Toolbar -->
	<div class="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card p-4 rounded-lg border shadow-sm">
		<div class="relative w-full sm:w-72">
			<Search class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
			<Input
				type="search"
				placeholder="Search tenant name or slug..."
				class="pl-8"
				bind:value={searchValue}
				oninput={handleSearch}
			/>
		</div>
		<div class="flex items-center gap-3 w-full sm:w-auto">
			<select
				class="flex h-9 w-full sm:w-[180px] items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
				bind:value={statusValue}
				onchange={handleStatusChange}
			>
				<option value="all">All Status</option>
				<option value="pending">Pending</option>
				<option value="paid">Paid</option>
				<option value="void">Void</option>
			</select>
			{#if searchValue || statusValue !== 'all'}
				<Button variant="ghost" onclick={resetFilters} size="sm">
					<X class="mr-2 h-4 w-4" /> Reset
				</Button>
			{/if}
		</div>
	</div>

	<Card.Root>
		<Card.Header>
			<Card.Title>Invoices</Card.Title>
		</Card.Header>
		<Card.Content>
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>Invoice ID</Table.Head>
						<Table.Head>Tenant</Table.Head>
						<Table.Head>Amount</Table.Head>
						<Table.Head>Status</Table.Head>
						<Table.Head>Due Date</Table.Head>
						<Table.Head>Paid At</Table.Head>
						<Table.Head class="text-right">Actions</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each data.invoices as row}
						<Table.Row>
							<Table.Cell class="font-mono text-xs">{row.invoice.id.slice(0, 8)}...</Table.Cell>
							<Table.Cell class="font-medium">
								{row.tenant?.name || 'Unknown'}
								<div class="text-xs text-muted-foreground">{row.tenant?.slug}</div>
							</Table.Cell>
							<Table.Cell>{formatCurrency(row.invoice.amount)}</Table.Cell>
							<Table.Cell>
								<Badge variant={getStatusVariant(row.invoice.status)}>
									{row.invoice.status}
								</Badge>
							</Table.Cell>
							<Table.Cell>
								{new Date(row.invoice.dueDate).toLocaleDateString('id-ID')}
							</Table.Cell>
							<Table.Cell>
								{row.invoice.paidAt ? new Date(row.invoice.paidAt).toLocaleDateString('id-ID') : '-'}
							</Table.Cell>
							<Table.Cell class="text-right">
								<DropdownMenu.Root>
									<DropdownMenu.Trigger
										class={buttonVariants({ variant: 'ghost', size: 'icon' })}
									>
										<MoreHorizontal class="h-4 w-4" />
									</DropdownMenu.Trigger>
									<DropdownMenu.Content align="end">
										<DropdownMenu.Label>Actions</DropdownMenu.Label>
										<DropdownMenu.Separator />
										<DropdownMenu.Item onclick={() => openDetailDialog(row)}>
											<FileText class="mr-2 h-4 w-4" />
											View Details
										</DropdownMenu.Item>
										<DropdownMenu.Separator />
										<DropdownMenu.Item onclick={() => openStatusDialog(row.invoice, 'paid')}>
											<CheckCircle class="mr-2 h-4 w-4 text-green-500" />
											Mark as Paid
										</DropdownMenu.Item>
										<DropdownMenu.Item onclick={() => openStatusDialog(row.invoice, 'pending')}>
											<FileText class="mr-2 h-4 w-4" />
											Mark as Pending
										</DropdownMenu.Item>
										<DropdownMenu.Item onclick={() => openStatusDialog(row.invoice, 'void')}>
											<Ban class="mr-2 h-4 w-4 text-red-500" />
											Void Invoice
										</DropdownMenu.Item>
									</DropdownMenu.Content>
								</DropdownMenu.Root>
							</Table.Cell>
						</Table.Row>
					{/each}
					{#if data.invoices.length === 0}
						<Table.Row>
							<Table.Cell colspan={7} class="text-center h-24 text-muted-foreground">
								No transactions found matching your filters.
							</Table.Cell>
						</Table.Row>
					{/if}
				</Table.Body>
			</Table.Root>
		</Card.Content>
	</Card.Root>

	<!-- Status Update Dialog -->
	<Dialog.Root bind:open={isStatusDialogOpen}>
		<Dialog.Content class="sm:max-w-[425px]">
			<Dialog.Header>
				<Dialog.Title>Update Invoice Status</Dialog.Title>
				<Dialog.Description>
					Change status to <span class="font-bold uppercase">{selectedStatus}</span> for invoice #{selectedInvoice?.id.slice(0, 8)}.
				</Dialog.Description>
			</Dialog.Header>
			<form
				action="?/updateStatus"
				method="POST"
				use:enhance={() => {
					isUpdating = true;
					const toastId = toast.loading('Updating invoice status...');
					
					return async ({ result, update }) => {
						isUpdating = false;
						if (result.type === 'success') {
							toast.dismiss(toastId);
							toast.success('Invoice status updated successfully');
							isStatusDialogOpen = false;
							update();
						} else {
							toast.dismiss(toastId);
							toast.error('Failed to update status');
							console.error(result);
						}
					};
				}}
			>
				{#if selectedInvoice}
					<input type="hidden" name="id" value={selectedInvoice.id} />
					<input type="hidden" name="status" value={selectedStatus} />
					<div class="grid gap-4 py-4">
						<div class="grid w-full gap-1.5">
							<Label for="notes">Notes (Optional)</Label>
							<Textarea
								id="notes"
								name="notes"
								placeholder="e.g., Transfer received via BCA on {new Date().toLocaleDateString()}"
								rows={3}
								value={selectedInvoice.notes}
							/>
						</div>
					</div>
					<Dialog.Footer>
						<Button type="button" variant="ghost" onclick={() => isStatusDialogOpen = false} disabled={isUpdating}>Cancel</Button>
						<Button type="submit" disabled={isUpdating}>
							{#if isUpdating}
								<Loader2 class="mr-2 h-4 w-4 animate-spin" />
								Updating...
							{:else}
								Confirm Update
							{/if}
						</Button>
					</Dialog.Footer>
				{/if}
			</form>
		</Dialog.Content>
	</Dialog.Root>

	<!-- Invoice Detail Dialog -->
	<Dialog.Root bind:open={isDetailDialogOpen}>
		<Dialog.Content class="sm:max-w-[600px]">
			<Dialog.Header>
				<Dialog.Title>Invoice Details</Dialog.Title>
				<Dialog.Description>
					Detailed information for invoice #{selectedInvoice?.invoice.id.slice(0, 8)}.
				</Dialog.Description>
			</Dialog.Header>
			{#if selectedInvoice}
				<div class="grid gap-6 py-4">
					<!-- Header Info -->
					<div class="flex justify-between items-start border-b pb-4">
						<div>
							<h3 class="font-semibold text-lg">{selectedInvoice.tenant.name}</h3>
							<p class="text-sm text-muted-foreground">{selectedInvoice.tenant.slug}</p>
						</div>
						<Badge variant={getStatusVariant(selectedInvoice.invoice.status)} class="text-sm px-3 py-1">
							{selectedInvoice.invoice.status}
						</Badge>
					</div>

					<!-- Subscription Info -->
					<div class="grid grid-cols-2 gap-4">
						<div class="space-y-1">
							<p class="text-xs text-muted-foreground uppercase font-bold">Package</p>
							<p class="font-medium">
								{selectedInvoice.subscription?.packageId ? 'Pro/Basic' : 'Custom'} Plan
							</p>
						</div>
						<div class="space-y-1">
							<p class="text-xs text-muted-foreground uppercase font-bold">Billing Cycle</p>
							<p class="font-medium capitalize">{selectedInvoice.subscription?.billingCycle || 'Monthly'}</p>
						</div>
						<div class="space-y-1">
							<p class="text-xs text-muted-foreground uppercase font-bold">Amount Due</p>
							<p class="font-bold text-lg text-primary">{formatCurrency(selectedInvoice.invoice.amount)}</p>
						</div>
						<div class="space-y-1">
							<p class="text-xs text-muted-foreground uppercase font-bold">Due Date</p>
							<div class="flex items-center gap-2">
								<Calendar class="h-4 w-4 text-muted-foreground" />
								<span>{new Date(selectedInvoice.invoice.dueDate).toLocaleDateString('id-ID', { dateStyle: 'long' })}</span>
							</div>
						</div>
					</div>

					<!-- Payment Info -->
					<div class="bg-muted/50 p-4 rounded-lg space-y-3">
						<h4 class="font-medium text-sm flex items-center gap-2">
							<FileText class="h-4 w-4" /> Payment Information
						</h4>
						{#if selectedInvoice.invoice.paidAt}
							<div class="flex justify-between text-sm">
								<span class="text-muted-foreground">Paid On:</span>
								<span class="font-medium text-green-600">
									{new Date(selectedInvoice.invoice.paidAt).toLocaleDateString('id-ID', { dateStyle: 'full', timeStyle: 'short' })}
								</span>
							</div>
						{:else}
							<p class="text-sm text-muted-foreground italic">No payment recorded yet.</p>
						{/if}
						
						{#if selectedInvoice.invoice.notes}
							<div class="pt-2 border-t border-dashed border-slate-300">
								<p class="text-xs text-muted-foreground mb-1">Notes:</p>
								<p class="text-sm whitespace-pre-wrap">{selectedInvoice.invoice.notes}</p>
							</div>
						{/if}
					</div>
				</div>
				<Dialog.Footer>
					<Button type="button" variant="outline" onclick={() => isDetailDialogOpen = false}>Close</Button>
					{#if selectedInvoice.invoice.status !== 'paid'}
						<Button 
							type="button" 
							onclick={() => {
								isDetailDialogOpen = false;
								openStatusDialog(selectedInvoice.invoice, 'paid');
							}}
						>
							<CheckCircle class="mr-2 h-4 w-4" /> Mark as Paid
						</Button>
					{/if}
				</Dialog.Footer>
			{/if}
		</Dialog.Content>
	</Dialog.Root>
</div>
