<script lang="ts">
	import { enhance } from '$app/forms';
	import { i18n } from '$lib/i18n/index.svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import {
		Badge,
		Button,
		buttonVariants,
		Input,
		Label,
		Select,
		SelectContent,
		SelectItem,
		SelectTrigger
	} from '$lib/components/ui';
	import * as Card from '$lib/components/ui/card';
	import * as Table from '$lib/components/ui/table';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import {
		MoreHorizontal,
		CreditCard,
		Loader2,
		Search,
		Eye,
		Filter,
		Building2,
		X,
		Download,
		Calendar,
		AlertTriangle,
		CheckCircle,
		XCircle,
		Clock
	} from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let search = $state(data.filters.search || '');
	let selectedStatus = $state(data.filters.status || 'all');
	let selectedPackageId = $state(data.filters.packageId || 'all');

	let searchTimer: ReturnType<typeof setTimeout>;

	function updateFilters() {
		const url = new URL($page.url);
		if (search) url.searchParams.set('search', search);
		else url.searchParams.delete('search');

		if (selectedStatus !== 'all') url.searchParams.set('status', selectedStatus);
		else url.searchParams.delete('status');

		if (selectedPackageId !== 'all') url.searchParams.set('packageId', selectedPackageId);
		else url.searchParams.delete('packageId');

		url.searchParams.set('page', '1');
		goto(url);
	}

	function handleSearchInput() {
		clearTimeout(searchTimer);
		searchTimer = setTimeout(updateFilters, 300);
	}

	function handleStatusChange(value: string | undefined) {
		if (!value) return;
		selectedStatus = value;
		updateFilters();
	}

	function handlePackageChange(value: string | undefined) {
		if (!value) return;
		selectedPackageId = value;
		updateFilters();
	}

	function handlePageChange(newPage: number) {
		const url = new URL($page.url);
		url.searchParams.set('page', newPage.toString());
		goto(url);
	}

	function resetFilters() {
		search = '';
		selectedStatus = 'all';
		selectedPackageId = 'all';
		const url = new URL($page.url);
		url.searchParams.delete('search');
		url.searchParams.delete('status');
		url.searchParams.delete('packageId');
		url.searchParams.set('page', '1');
		goto(url);
	}

	function handleExport() {
		const url = new URL($page.url);
		url.pathname = '/admin/subscription/tenants/export';
		window.location.href = url.toString();
	}

	// Dialog States
	let isManageDialogOpen = $state(false);
	let isExtendDialogOpen = $state(false);
	let isCancelDialogOpen = $state(false);
	let isSaving = $state(false);

	let selectedTenant = $state<{
		id: string;
		name: string;
		packageId?: string;
		billingCycle?: string;
		status?: string;
		currentPeriodEnd?: string;
	} | null>(null);

	function openManageDialog(row: any) {
		selectedTenant = {
			id: row.tenant.id,
			name: row.tenant.name,
			packageId: row.subscription?.packageId || data.packages[0]?.id || '',
			billingCycle: row.subscription?.billingCycle || 'monthly',
			status: row.subscription?.status || 'active',
			currentPeriodEnd: row.subscription?.currentPeriodEnd
				? new Date(row.subscription.currentPeriodEnd).toISOString().split('T')[0]
				: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0]
		};
		isManageDialogOpen = true;
	}

	function openExtendDialog(row: any) {
		selectedTenant = {
			id: row.tenant.id,
			name: row.tenant.name
		};
		isExtendDialogOpen = true;
	}

	function openCancelDialog(row: any) {
		selectedTenant = {
			id: row.tenant.id,
			name: row.tenant.name
		};
		isCancelDialogOpen = true;
	}

	function getStatusVariant(status: string | undefined) {
		switch (status?.toLowerCase()) {
			case 'active':
				return 'default';
			case 'trial':
				return 'outline';
			case 'past_due':
				return 'destructive';
			case 'cancelled':
				return 'secondary';
			default:
				return 'secondary';
		}
	}

	function getUsagePercentage(count: number, limit: number) {
		if (limit === -1) return 0;
		return Math.min((count / limit) * 100, 100);
	}

	function getUsageColor(percentage: number) {
		if (percentage >= 90) return 'bg-red-500';
		if (percentage >= 75) return 'bg-yellow-500';
		return 'bg-green-500';
	}

	const getStatusText = (status: string | undefined) => {
		if (!status) return i18n.t('admin.tenants.noSubscription');
		const key = `admin.tenants.${status.toLowerCase()}` as any;
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

<div class="space-y-6 p-8 pt-6">
	<div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
		<div class="space-y-1">
			<h2 class="text-3xl font-bold tracking-tight text-foreground">
				{i18n.t('admin.tenants.title')}
			</h2>
			<p class="text-muted-foreground text-sm">
				{i18n.t('admin.tenants.subtitle')}
			</p>
		</div>
		<Button variant="outline" onclick={handleExport}>
			<Download class="mr-2 h-4 w-4" />
			{i18n.t('common.export')}
		</Button>
	</div>

	<!-- Stats Cards -->
	<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="text-sm font-medium">{i18n.t('common.all')}</Card.Title>
				<Building2 class="h-4 w-4 text-muted-foreground" />
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold">{data.stats?.total || 0}</div>
			</Card.Content>
		</Card.Root>
		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="text-sm font-medium">{i18n.t('admin.tenants.active')}</Card.Title>
				<CheckCircle class="h-4 w-4 text-green-500" />
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold text-green-600">{data.stats?.active || 0}</div>
			</Card.Content>
		</Card.Root>
		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="text-sm font-medium">{i18n.t('admin.tenants.trial')}</Card.Title>
				<Clock class="h-4 w-4 text-blue-500" />
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold text-blue-600">{data.stats?.trial || 0}</div>
			</Card.Content>
		</Card.Root>
		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="text-sm font-medium">{i18n.t('admin.tenants.past_due')}</Card.Title>
				<AlertTriangle class="h-4 w-4 text-red-500" />
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold text-red-600">{data.stats?.past_due || 0}</div>
			</Card.Content>
		</Card.Root>
		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="text-sm font-medium">{i18n.t('admin.tenants.cancelled')}</Card.Title>
				<XCircle class="h-4 w-4 text-muted-foreground" />
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold text-muted-foreground">{data.stats?.cancelled || 0}</div>
			</Card.Content>
		</Card.Root>
	</div>

	<!-- Filters Bar -->
	<Card.Root>
		<Card.Content class="p-4">
			<div class="flex flex-col md:flex-row items-end gap-4">
				<!-- Search -->
				<div class="flex-1 space-y-2 w-full">
					<div
						class="text-[10px] font-bold text-muted-foreground flex items-center gap-1 uppercase tracking-widest"
					>
						<Search class="h-3 w-3" />
						{i18n.t('admin.tenants.searchTenants')}
					</div>
					<Input
						placeholder={i18n.t('common.searchPlaceholder')}
						bind:value={search}
						oninput={handleSearchInput}
						class="h-9"
					/>
				</div>

				<!-- Status Filter -->
				<div class="w-full md:w-[180px] space-y-2">
					<div
						class="text-[10px] font-bold text-muted-foreground flex items-center gap-1 uppercase tracking-widest"
					>
						<Filter class="h-3 w-3" />
						{i18n.t('common.status')}
					</div>
					<Select type="single" value={selectedStatus} onValueChange={handleStatusChange}>
						<SelectTrigger class="h-9">
							{selectedStatus === 'all' ? i18n.t('common.allStatus') : getStatusText(selectedStatus)}
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">{i18n.t('common.allStatus')}</SelectItem>
							<SelectItem value="active">{i18n.t('admin.tenants.active')}</SelectItem>
							<SelectItem value="trial">{i18n.t('admin.tenants.trial')}</SelectItem>
							<SelectItem value="past_due">{i18n.t('admin.tenants.past_due')}</SelectItem>
							<SelectItem value="cancelled">{i18n.t('admin.tenants.cancelled')}</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<!-- Package Filter -->
				<div class="w-full md:w-[220px] space-y-2">
					<div
						class="text-[10px] font-bold text-muted-foreground flex items-center gap-1 uppercase tracking-widest"
					>
						<Building2 class="h-3 w-3" />
						{i18n.t('admin.tenants.package')}
					</div>
					<Select type="single" value={selectedPackageId} onValueChange={handlePackageChange}>
						<SelectTrigger class="h-9">
							<span class="truncate">
								{selectedPackageId === 'all'
									? `${i18n.t('common.all')} ${i18n.t('admin.tenants.package')}`
									: (data.packages.find((p) => p.id === selectedPackageId)?.name ??
										i18n.t('admin.tenants.package'))}
							</span>
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all"
								>{i18n.t('common.all')} {i18n.t('admin.tenants.package')}</SelectItem
							>
							{#each data.packages as pkg}
								<SelectItem value={pkg.id}>{pkg.name}</SelectItem>
							{/each}
						</SelectContent>
					</Select>
				</div>

				<!-- Reset -->
				<Button
					variant="outline"
					size="icon"
					class="h-9 w-9 shrink-0"
					onclick={resetFilters}
					title={i18n.t('common.reset')}
				>
					<X class="h-4 w-4" />
				</Button>
			</div>
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header>
			<Card.Title>{i18n.t('admin.tenants.tenants')}</Card.Title>
			<Card.Description>{i18n.t('admin.tenants.description')}</Card.Description>
		</Card.Header>
		<Card.Content>
			<div class="overflow-x-auto">
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head>{i18n.t('admin.tenants.tenantName')}</Table.Head>
							<Table.Head>{i18n.t('admin.packages.slug')}</Table.Head>
							<Table.Head>{i18n.t('admin.tenants.package')}</Table.Head>
							<Table.Head>{i18n.t('admin.tenants.usageStudents')}</Table.Head>
							<Table.Head>{i18n.t('admin.packages.status')}</Table.Head>
							<Table.Head>{i18n.t('admin.tenants.cycle')}</Table.Head>
							<Table.Head>{i18n.t('admin.tenants.validUntil')}</Table.Head>
							<Table.Head class="text-right">{i18n.t('common.actions')}</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each data.tenants as row}
							<Table.Row>
								<Table.Cell class="font-medium">{row.tenant.name}</Table.Cell>
								<Table.Cell>{row.tenant.slug}</Table.Cell>
								<Table.Cell>
									{#if row.package}
										<Badge variant="outline">{row.package.name}</Badge>
									{:else}
										<span class="text-muted-foreground">-</span>
									{/if}
								</Table.Cell>
								<Table.Cell>
									{#if row.package}
										{@const limit = row.package.limits?.max_students ?? 0}
										{@const count = row.applicationCount ?? 0}
										{@const percentage = getUsagePercentage(count, limit)}

										<div class="flex flex-col gap-1 w-32">
											<div class="flex justify-between text-xs text-muted-foreground">
												<span>{count}</span>
												<span>{limit === -1 ? '∞' : limit}</span>
											</div>
											{#if limit !== -1}
												<div class="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
													<div
														class="h-full {getUsageColor(percentage)} transition-all duration-500"
														style="width: {percentage}%"
													></div>
												</div>
											{:else}
												<div class="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
													<div class="h-full bg-blue-500 w-full opacity-20"></div>
												</div>
											{/if}
										</div>
									{:else}
										<span class="text-muted-foreground">-</span>
									{/if}
								</Table.Cell>
								<Table.Cell>
									<Badge variant={getStatusVariant(row.subscription?.status)}>
										{getStatusText(row.subscription?.status)}
									</Badge>
								</Table.Cell>
								<Table.Cell>
									{getCycleText(row.subscription?.billingCycle)}
								</Table.Cell>
								<Table.Cell>
									{row.subscription?.currentPeriodEnd
										? new Date(row.subscription.currentPeriodEnd).toLocaleDateString(
												i18n.language === 'id' ? 'id-ID' : 'en-US'
											)
										: '-'}
								</Table.Cell>
								<Table.Cell class="text-right">
									<DropdownMenu.Root>
										<DropdownMenu.Trigger
											class={buttonVariants({ variant: 'ghost', size: 'icon' })}
										>
											<MoreHorizontal class="h-4 w-4" />
										</DropdownMenu.Trigger>
										<DropdownMenu.Content align="end">
											<DropdownMenu.Label>{i18n.t('common.actions')}</DropdownMenu.Label>
											<DropdownMenu.Separator />
											<DropdownMenu.Item href="/admin/subscription/tenants/{row.tenant.id}">
												<Eye class="mr-2 h-4 w-4" />
												{i18n.t('common.viewDetails')}
											</DropdownMenu.Item>
											<DropdownMenu.Item onclick={() => openManageDialog(row)}>
												<CreditCard class="mr-2 h-4 w-4" />
												{i18n.t('admin.tenants.manageSubscription')}
											</DropdownMenu.Item>
											{#if row.subscription?.status === 'trial'}
												<DropdownMenu.Item onclick={() => openExtendDialog(row)}>
													<Calendar class="mr-2 h-4 w-4" />
													{i18n.t('admin.tenants.extendTrial')}
												</DropdownMenu.Item>
											{/if}
											{#if row.subscription?.status && row.subscription.status !== 'cancelled'}
												<DropdownMenu.Item
													class="text-destructive focus:text-destructive"
													onclick={() => openCancelDialog(row)}
												>
													<AlertTriangle class="mr-2 h-4 w-4" />
													{i18n.t('admin.tenants.cancelSubscription')}
												</DropdownMenu.Item>
											{/if}
										</DropdownMenu.Content>
									</DropdownMenu.Root>
								</Table.Cell>
							</Table.Row>
						{:else}
							<Table.Row>
								<Table.Cell colspan={8} class="h-24 text-center">
									<div class="flex flex-col items-center justify-center text-muted-foreground">
										<Building2 class="h-8 w-8 mb-2 opacity-20" />
										<p>{i18n.t('common.noData')}</p>
									</div>
								</Table.Cell>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			</div>
		</Card.Content>
	</Card.Root>

	<div class="flex items-center justify-end space-x-2 py-4">
		<Button
			variant="outline"
			size="sm"
			disabled={data.pagination.page === 1}
			onclick={() => handlePageChange(data.pagination.page - 1)}
		>
			{i18n.t('common.previous')}
		</Button>
		<div class="text-sm text-muted-foreground">
			{i18n.t('common.page')}
			{data.pagination.page}
			{i18n.t('common.of')}
			{data.pagination.totalPages}
		</div>
		<Button
			variant="outline"
			size="sm"
			disabled={data.pagination.page >= data.pagination.totalPages}
			onclick={() => handlePageChange(data.pagination.page + 1)}
		>
			{i18n.t('common.next')}
		</Button>
	</div>

	<!-- Manage Subscription Dialog -->
	<Dialog.Root bind:open={isManageDialogOpen}>
		<Dialog.Content class="sm:max-w-[425px]">
			<Dialog.Header>
				<Dialog.Title>{i18n.t('admin.tenants.manageSubscription')}</Dialog.Title>
				<Dialog.Description>
					{i18n.t('admin.tenants.manageSubDesc', { name: selectedTenant?.name })}
				</Dialog.Description>
			</Dialog.Header>
			<form
				action="?/updateSubscription"
				method="POST"
				use:enhance={() => {
					isSaving = true;
					const toastId = toast.loading(i18n.t('admin.tenants.savingSub'));

					return async ({ result, update }) => {
						isSaving = false;
						if (result.type === 'success') {
							toast.dismiss(toastId);
							toast.success(i18n.t('admin.tenants.subUpdated'));
							isManageDialogOpen = false;
							update();
						} else {
							toast.dismiss(toastId);
							toast.error(i18n.t('admin.tenants.subUpdateFailed'));
							console.error('Update failed:', result);
						}
					};
				}}
			>
				{#if selectedTenant}
					<input type="hidden" name="tenantId" value={selectedTenant.id} />
					<div class="grid gap-4 py-4">
						<div class="grid grid-cols-4 items-center gap-4">
							<Label for="packageId" class="text-right">{i18n.t('admin.tenants.package')}</Label>
							<div class="col-span-3">
								<Select
									type="single"
									name="packageId"
									bind:value={selectedTenant.packageId}
									required
								>
									<SelectTrigger class="w-full">
										{data.packages.find((p) => p.id === selectedTenant?.packageId)?.name ??
											i18n.t('admin.tenants.package')}
									</SelectTrigger>
									<SelectContent>
										{#each data.packages as pkg}
											<SelectItem value={pkg.id}>
												{pkg.name} (Rp {pkg.priceMonthly.toLocaleString('id-ID')})
											</SelectItem>
										{/each}
									</SelectContent>
								</Select>
							</div>
						</div>
						<div class="grid grid-cols-4 items-center gap-4">
							<Label for="billingCycle" class="text-right">{i18n.t('admin.tenants.cycle')}</Label>
							<div class="col-span-3">
								<Select
									type="single"
									name="billingCycle"
									bind:value={selectedTenant.billingCycle}
									required
								>
									<SelectTrigger class="w-full">
										{getCycleText(selectedTenant.billingCycle)}
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="monthly">{i18n.t('admin.tenants.monthly')}</SelectItem>
										<SelectItem value="yearly">{i18n.t('admin.tenants.yearly')}</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>
						<div class="grid grid-cols-4 items-center gap-4">
							<Label for="status" class="text-right">{i18n.t('admin.packages.status')}</Label>
							<div class="col-span-3">
								<Select type="single" name="status" bind:value={selectedTenant.status} required>
									<SelectTrigger class="w-full">
										{getStatusText(selectedTenant.status)}
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="active">{i18n.t('admin.tenants.active')}</SelectItem>
										<SelectItem value="trial">{i18n.t('admin.tenants.trial')}</SelectItem>
										<SelectItem value="past_due">{i18n.t('admin.tenants.past_due')}</SelectItem>
										<SelectItem value="cancelled">{i18n.t('admin.tenants.cancelled')}</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>
						<div class="grid grid-cols-4 items-center gap-4">
							<Label for="currentPeriodEnd" class="text-right">
								{i18n.t('admin.tenants.validUntil')}
							</Label>
							<Input
								id="currentPeriodEnd"
								name="currentPeriodEnd"
								type="date"
								class="col-span-3"
								bind:value={selectedTenant.currentPeriodEnd}
								required
							/>
						</div>
					</div>
					<Dialog.Footer>
						<Button
							type="button"
							variant="ghost"
							onclick={() => (isManageDialogOpen = false)}
							disabled={isSaving}>{i18n.t('actions.cancel')}</Button
						>
						<Button type="submit" disabled={isSaving}>
							{#if isSaving}
								<Loader2 class="mr-2 h-4 w-4 animate-spin" />
								{i18n.t('messages.loading.saving')}
							{:else}
								{i18n.t('actions.saveChanges')}
							{/if}
						</Button>
					</Dialog.Footer>
				{/if}
			</form>
		</Dialog.Content>
	</Dialog.Root>

	<!-- Extend Trial Dialog -->
	<Dialog.Root bind:open={isExtendDialogOpen}>
		<Dialog.Content class="sm:max-w-[425px]">
			<Dialog.Header>
				<Dialog.Title>{i18n.t('admin.tenants.extendTrial')}</Dialog.Title>
				<Dialog.Description>
					{i18n.t('admin.tenants.extendTrialDesc', { name: selectedTenant?.name })}
				</Dialog.Description>
			</Dialog.Header>
			<form
				action="?/extendTrial"
				method="POST"
				use:enhance={() => {
					isSaving = true;
					return async ({ result, update }) => {
						isSaving = false;
						if (result.type === 'success') {
							toast.success(i18n.t('admin.tenants.trialExtended'));
							isExtendDialogOpen = false;
							update();
						} else {
							toast.error(i18n.t('admin.tenants.actionFailed'));
						}
					};
				}}
			>
				<input type="hidden" name="tenantId" value={selectedTenant?.id} />
				<div class="grid gap-4 py-4">
					<div class="grid gap-2">
						<Label>{i18n.t('admin.tenants.duration')}</Label>
						<div class="flex flex-col gap-2">
							{#each [7, 14, 30] as days}
								<div class="flex items-center space-x-2">
									<input
										type="radio"
										id="d{days}"
										name="days"
										value={days}
										class="aspect-square h-4 w-4 rounded-full border border-primary text-primary shadow focus:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
										checked={days === 7}
									/>
									<Label for="d{days}">{days} {i18n.t('common.days')}</Label>
								</div>
							{/each}
						</div>
					</div>
				</div>
				<Dialog.Footer>
					<Button
						type="button"
						variant="ghost"
						onclick={() => (isExtendDialogOpen = false)}
						disabled={isSaving}
					>
						{i18n.t('actions.cancel')}
					</Button>
					<Button type="submit" disabled={isSaving}>
						{i18n.t('actions.confirm')}
					</Button>
				</Dialog.Footer>
			</form>
		</Dialog.Content>
	</Dialog.Root>

	<!-- Cancel Subscription Dialog -->
	<Dialog.Root bind:open={isCancelDialogOpen}>
		<Dialog.Content class="sm:max-w-[425px]">
			<Dialog.Header>
				<Dialog.Title>{i18n.t('admin.tenants.cancelSubscription')}</Dialog.Title>
				<Dialog.Description>
					{i18n.t('admin.tenants.cancelWarning')}
				</Dialog.Description>
			</Dialog.Header>
			<form
				action="?/cancelSubscription"
				method="POST"
				use:enhance={() => {
					isSaving = true;
					return async ({ result, update }) => {
						isSaving = false;
						if (result.type === 'success') {
							toast.success(i18n.t('admin.tenants.subCancelled'));
							isCancelDialogOpen = false;
							update();
						} else {
							toast.error(i18n.t('admin.tenants.actionFailed'));
						}
					};
				}}
			>
				<input type="hidden" name="tenantId" value={selectedTenant?.id} />
				<Dialog.Footer>
					<Button
						type="button"
						variant="ghost"
						onclick={() => (isCancelDialogOpen = false)}
						disabled={isSaving}
					>
						{i18n.t('actions.keepSubscription')}
					</Button>
					<Button type="submit" variant="destructive" disabled={isSaving}>
						{i18n.t('actions.confirmCancel')}
					</Button>
				</Dialog.Footer>
			</form>
		</Dialog.Content>
	</Dialog.Root>
</div>
