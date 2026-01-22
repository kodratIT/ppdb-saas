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
	import {
		MoreHorizontal,
		FileText,
		Search,
		X,
		CheckCircle,
		Ban,
		Loader2,
		Calendar,
		Plus
	} from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import type { PageData } from './$types';
	import { i18n } from '$lib/i18n/index.svelte';
	import SubscriptionNav from '$lib/components/admin/SubscriptionNav.svelte';

	let { data }: { data: PageData } = $props();

	let searchValue = $state(data.filters.search);
	let statusValue = $state(data.filters.status);
	let timeout: NodeJS.Timeout;

	// Dialog States
	let isStatusDialogOpen = $state(false);
	let isDetailDialogOpen = $state(false);
	let isCreateDialogOpen = $state(false);
	let isUpdating = $state(false);
	let isCreating = $state(false);

	let selectedInvoice = $state<any>(null);
	let selectedStatus = $state<'paid' | 'pending' | 'void'>('pending');

	// Create Invoice Form State
	let createForm = $state({
		tenantId: '',
		amount: '',
		dueDate: '',
		notes: ''
	});

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

	function openCreateDialog() {
		createForm = {
			tenantId: '',
			amount: '',
			dueDate: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split('T')[0],
			notes: ''
		};
		isCreateDialogOpen = true;
	}

	function getStatusVariant(status: string) {
		switch (status.toLowerCase()) {
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
		return new Intl.NumberFormat(i18n.language === 'id' ? 'id-ID' : 'en-US', {
			style: 'currency',
			currency: 'IDR',
			minimumFractionDigits: 0
		}).format(amount);
	}

	const getStatusText = (status: string) => {
		const key = `admin.transactions.${status.toLowerCase()}` as any;
		const translated = i18n.t(key);
		return translated !== key ? translated : status.toUpperCase();
	};

	const getCycleText = (cycle: string | undefined) => {
		if (!cycle) return '-';
		const key = `admin.tenants.${cycle.toLowerCase()}` as any;
		const translated = i18n.t(key);
		return translated !== key ? translated : cycle;
	};
</script>

<div class="flex flex-col gap-6 p-6">
	<SubscriptionNav />

	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold tracking-tight">{i18n.t('admin.transactions.title')}</h1>
			<p class="text-muted-foreground">{i18n.t('admin.transactions.subtitle')}</p>
		</div>
		<Button onclick={openCreateDialog}>
			<Plus class="mr-2 h-4 w-4" />
			Create Invoice
		</Button>
	</div>

	<!-- Filter Toolbar -->
	<div
		class="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card p-4 rounded-lg border shadow-sm"
	>
		<div class="relative w-full sm:w-72">
			<Search class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
			<Input
				type="search"
				placeholder={i18n.t('admin.transactions.searchPlaceholder')}
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
				<option value="all">{i18n.t('admin.transactions.allStatus')}</option>
				<option value="pending">{i18n.t('admin.transactions.pending')}</option>
				<option value="paid">{i18n.t('admin.transactions.paid')}</option>
				<option value="void">{i18n.t('admin.transactions.void')}</option>
			</select>
			{#if searchValue || statusValue !== 'all'}
				<Button variant="ghost" onclick={resetFilters} size="sm">
					<X class="mr-2 h-4 w-4" />
					{i18n.t('common.reset')}
				</Button>
			{/if}
		</div>
	</div>

	<Card.Root>
		<Card.Header>
			<Card.Title>{i18n.t('admin.transactions.invoices')}</Card.Title>
		</Card.Header>
		<Card.Content>
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>{i18n.t('admin.transactions.invoiceId')}</Table.Head>
						<Table.Head>{i18n.t('admin.transactions.tenant')}</Table.Head>
						<Table.Head>{i18n.t('admin.transactions.amount')}</Table.Head>
						<Table.Head>{i18n.t('admin.packages.status')}</Table.Head>
						<Table.Head>{i18n.t('admin.transactions.dueDate')}</Table.Head>
						<Table.Head>{i18n.t('admin.transactions.paidAt')}</Table.Head>
						<Table.Head class="text-right">{i18n.t('common.actions')}</Table.Head>
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
									{getStatusText(row.invoice.status)}
								</Badge>
							</Table.Cell>
							<Table.Cell>
								{new Date(row.invoice.dueDate).toLocaleDateString(
									i18n.language === 'id' ? 'id-ID' : 'en-US'
								)}
							</Table.Cell>
							<Table.Cell>
								{row.invoice.paidAt
									? new Date(row.invoice.paidAt).toLocaleDateString(
											i18n.language === 'id' ? 'id-ID' : 'en-US'
										)
									: '-'}
							</Table.Cell>
							<Table.Cell class="text-right">
								<DropdownMenu.Root>
									<DropdownMenu.Trigger class={buttonVariants({ variant: 'ghost', size: 'icon' })}>
										<MoreHorizontal class="h-4 w-4" />
									</DropdownMenu.Trigger>
									<DropdownMenu.Content align="end">
										<DropdownMenu.Label>{i18n.t('common.actions')}</DropdownMenu.Label>
										<DropdownMenu.Separator />
										<DropdownMenu.Item onclick={() => openDetailDialog(row)}>
											<FileText class="mr-2 h-4 w-4" />
											{i18n.t('admin.transactions.viewDetails')}
										</DropdownMenu.Item>
										<DropdownMenu.Separator />
										<DropdownMenu.Item onclick={() => openStatusDialog(row.invoice, 'paid')}>
											<CheckCircle class="mr-2 h-4 w-4 text-green-500" />
											{i18n.t('admin.transactions.markPaid')}
										</DropdownMenu.Item>
										<DropdownMenu.Item onclick={() => openStatusDialog(row.invoice, 'pending')}>
											<FileText class="mr-2 h-4 w-4" />
											{i18n.t('admin.transactions.markPending')}
										</DropdownMenu.Item>
										<DropdownMenu.Item onclick={() => openStatusDialog(row.invoice, 'void')}>
											<Ban class="mr-2 h-4 w-4 text-red-500" />
											{i18n.t('admin.transactions.voidInvoice')}
										</DropdownMenu.Item>
									</DropdownMenu.Content>
								</DropdownMenu.Root>
							</Table.Cell>
						</Table.Row>
					{/each}
					{#if data.invoices.length === 0}
						<Table.Row>
							<Table.Cell colspan={7} class="text-center h-24 text-muted-foreground">
								{i18n.t('admin.transactions.noTransactions')}
							</Table.Cell>
						</Table.Row>
					{/if}
				</Table.Body>
			</Table.Root>
		</Card.Content>
	</Card.Root>

	<!-- Create Invoice Dialog -->
	<Dialog.Root bind:open={isCreateDialogOpen}>
		<Dialog.Content class="sm:max-w-[500px]">
			<Dialog.Header>
				<Dialog.Title>Create New Invoice</Dialog.Title>
				<Dialog.Description>Create a manual invoice for a tenant.</Dialog.Description>
			</Dialog.Header>
			<form
				action="?/create"
				method="POST"
				use:enhance={() => {
					isCreating = true;
					return async ({ result, update }) => {
						isCreating = false;
						if (result.type === 'success') {
							toast.success('Invoice created successfully');
							isCreateDialogOpen = false;
							update();
						} else {
							toast.error(result.data?.message || 'Failed to create invoice');
						}
					};
				}}
			>
				<div class="grid gap-4 py-4">
					<div class="grid gap-2">
						<Label for="tenantId">Tenant</Label>
						<select
							id="tenantId"
							name="tenantId"
							class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
							bind:value={createForm.tenantId}
							required
						>
							<option value="" disabled>Select a tenant</option>
							{#each data.tenants as tenant}
								<option value={tenant.id}>{tenant.name} ({tenant.slug})</option>
							{/each}
						</select>
					</div>
					<div class="grid gap-2">
						<Label for="amount">Amount (IDR)</Label>
						<Input
							id="amount"
							name="amount"
							type="number"
							bind:value={createForm.amount}
							placeholder="e.g. 500000"
							required
						/>
					</div>
					<div class="grid gap-2">
						<Label for="dueDate">Due Date</Label>
						<Input
							id="dueDate"
							name="dueDate"
							type="date"
							bind:value={createForm.dueDate}
							required
						/>
					</div>
					<div class="grid gap-2">
						<Label for="notes">Notes</Label>
						<Textarea
							id="notes"
							name="notes"
							bind:value={createForm.notes}
							placeholder="Description of the invoice..."
						/>
					</div>
				</div>
				<Dialog.Footer>
					<Button type="button" variant="ghost" onclick={() => (isCreateDialogOpen = false)}
						>Cancel</Button
					>
					<Button type="submit" disabled={isCreating}>
						{#if isCreating}
							<Loader2 class="mr-2 h-4 w-4 animate-spin" />
							Creating...
						{:else}
							Create Invoice
						{/if}
					</Button>
				</Dialog.Footer>
			</form>
		</Dialog.Content>
	</Dialog.Root>

	<!-- Status Update Dialog -->
	<Dialog.Root bind:open={isStatusDialogOpen}>
		<Dialog.Content class="sm:max-w-[425px]">
			<Dialog.Header>
				<Dialog.Title>{i18n.t('admin.transactions.updateStatus')}</Dialog.Title>
				<Dialog.Description>
					{i18n.t('admin.transactions.changeStatusTo', {
						status: selectedStatus.toUpperCase(),
						id: selectedInvoice?.invoice.id.slice(0, 8)
					})}
				</Dialog.Description>
			</Dialog.Header>
			<form
				action="?/updateStatus"
				method="POST"
				use:enhance={() => {
					isUpdating = true;
					const toastId = toast.loading(i18n.t('admin.transactions.updatingInvoice'));

					return async ({ result, update }) => {
						isUpdating = false;
						if (result.type === 'success') {
							toast.dismiss(toastId);
							toast.success(i18n.t('admin.transactions.statusUpdated'));
							isStatusDialogOpen = false;
							update();
						} else {
							toast.dismiss(toastId);
							toast.error(i18n.t('admin.transactions.updateFailed'));
							console.error(result);
						}
					};
				}}
			>
				{#if selectedInvoice}
					<input type="hidden" name="id" value={selectedInvoice.invoice.id} />
					<input type="hidden" name="status" value={selectedStatus} />
					<div class="grid gap-4 py-4">
						<div class="grid w-full gap-1.5">
							<Label for="notes">{i18n.t('admin.transactions.notesOptional')}</Label>
							<Textarea
								id="notes"
								name="notes"
								placeholder={i18n.t('admin.transactions.notesPlaceholder', {
									date: new Date().toLocaleDateString(i18n.language === 'id' ? 'id-ID' : 'en-US')
								})}
								rows={3}
								value={selectedInvoice.invoice.notes}
							/>
						</div>
					</div>
					<Dialog.Footer>
						<Button
							type="button"
							variant="ghost"
							onclick={() => (isStatusDialogOpen = false)}
							disabled={isUpdating}>{i18n.t('common.cancel')}</Button
						>
						<Button type="submit" disabled={isUpdating}>
							{#if isUpdating}
								<Loader2 class="mr-2 h-4 w-4 animate-spin" />
								{i18n.t('common.loading.loading')}
							{:else}
								{i18n.t('admin.transactions.confirmUpdate')}
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
				<Dialog.Title>{i18n.t('admin.transactions.invoiceDetails')}</Dialog.Title>
				<Dialog.Description>
					{i18n.t('admin.transactions.detailsFor', { id: selectedInvoice?.invoice.id.slice(0, 8) })}
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
						<Badge
							variant={getStatusVariant(selectedInvoice.invoice.status)}
							class="text-sm px-3 py-1"
						>
							{getStatusText(selectedInvoice.invoice.status)}
						</Badge>
					</div>

					<!-- Subscription Info -->
					<div class="grid grid-cols-2 gap-4">
						<div class="space-y-1">
							<p class="text-xs text-muted-foreground uppercase font-bold">
								{i18n.t('admin.tenants.package')}
							</p>
							<p class="font-medium">
								{i18n.t('admin.transactions.plan', {
									name: selectedInvoice.subscription?.packageId ? 'Pro/Basic' : 'Custom'
								})}
							</p>
						</div>
						<div class="space-y-1">
							<p class="text-xs text-muted-foreground uppercase font-bold">
								{i18n.t('admin.tenants.cycle')}
							</p>
							<p class="font-medium capitalize">
								{getCycleText(selectedInvoice.subscription?.billingCycle)}
							</p>
						</div>
						<div class="space-y-1">
							<p class="text-xs text-muted-foreground uppercase font-bold">
								{i18n.t('admin.transactions.amount')}
							</p>
							<p class="font-bold text-lg text-primary">
								{formatCurrency(selectedInvoice.invoice.amount)}
							</p>
						</div>
						<div class="space-y-1">
							<p class="text-xs text-muted-foreground uppercase font-bold">
								{i18n.t('admin.transactions.dueDate')}
							</p>
							<div class="flex items-center gap-2">
								<Calendar class="h-4 w-4 text-muted-foreground" />
								<span
									>{new Date(selectedInvoice.invoice.dueDate).toLocaleDateString(
										i18n.language === 'id' ? 'id-ID' : 'en-US',
										{ dateStyle: 'long' }
									)}</span
								>
							</div>
						</div>
					</div>

					<!-- Payment Info -->
					<div class="bg-muted/50 p-4 rounded-lg space-y-3">
						<h4 class="font-medium text-sm flex items-center gap-2">
							<FileText class="h-4 w-4" />
							{i18n.t('admin.transactions.paymentInfo')}
						</h4>
						{#if selectedInvoice.invoice.paidAt}
							<div class="flex justify-between text-sm">
								<span class="text-muted-foreground">{i18n.t('admin.transactions.paidOn')}</span>
								<span class="font-medium text-green-600">
									{new Date(selectedInvoice.invoice.paidAt).toLocaleDateString(
										i18n.language === 'id' ? 'id-ID' : 'en-US',
										{ dateStyle: 'full', timeStyle: 'short' }
									)}
								</span>
							</div>
						{:else}
							<p class="text-sm text-muted-foreground italic">
								{i18n.t('admin.transactions.noPayment')}
							</p>
						{/if}

						{#if selectedInvoice.invoice.notes}
							<div class="pt-2 border-t border-dashed border-slate-300">
								<p class="text-xs text-muted-foreground mb-1">
									{i18n.t('admin.transactions.notes')}
								</p>
								<p class="text-sm whitespace-pre-wrap">{selectedInvoice.invoice.notes}</p>
							</div>
						{/if}
					</div>
				</div>
				<Dialog.Footer>
					<Button type="button" variant="outline" onclick={() => (isDetailDialogOpen = false)}
						>{i18n.t('common.close')}</Button
					>
					{#if selectedInvoice.invoice.status !== 'paid'}
						<Button
							type="button"
							onclick={() => {
								isDetailDialogOpen = false;
								openStatusDialog(selectedInvoice.invoice, 'paid');
							}}
						>
							<CheckCircle class="mr-2 h-4 w-4" />
							{i18n.t('admin.transactions.markPaid')}
						</Button>
					{/if}
				</Dialog.Footer>
			{/if}
		</Dialog.Content>
	</Dialog.Root>
</div>
