<script lang="ts">
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import Button from '$lib/components/ui/button.svelte';
	import Checkbox from '$lib/components/ui/checkbox.svelte';
	import { enhance } from '$app/forms';
	import { toast } from '$lib/utils/toast';
	import { i18n } from '$lib/i18n/index.svelte';
	import {
		Globe,
		ExternalLink,
		Power,
		Loader2,
		MoreHorizontal,
		UserPlus2,
		Building2,
		School,
		ArrowUp,
		ArrowDown,
		ArrowUpDown,
		Edit,
		BarChart3,
		CreditCard,
		Trash2
	} from 'lucide-svelte';
	import { cn } from '$lib/utils';
	import { invalidate } from '$app/navigation';
	import {
		Root as Table,
		Header as TableHeader,
		Body as TableBody,
		Row as TableRow,
		Head as TableHead,
		Cell as TableCell
	} from '$lib/components/ui/table';

	interface Tenant {
		id: string;
		name: string;
		slug: string;
		status: 'active' | 'inactive';
		type?: 'single' | 'foundation';
		createdAt?: string | Date;
		stats?: {
			applications: number;
			paidInvoices: number;
		};
	}

	interface Props {
		tenants: Tenant[];
		selectedIds?: string[];
		loadingTenants?: Set<string>;
		sortBy?: string;
		sortOrder?: 'asc' | 'desc';
		density?: 'compact' | 'standard' | 'flexible';
		visibleColumns?: string[];
		onSelect?: (id: string, checked: boolean) => void;
		onSelectAll?: (checked: boolean) => void;
		onSort?: (column: string, order: 'asc' | 'desc') => void;
	}

	// Column width definitions for consistency
	const columnWidths = {
		checkbox: 'w-[50px]',
		name: 'w-[280px] min-w-[240px]',
		type: 'w-[120px]',
		url: 'w-[200px]',
		applications: 'w-[120px]',
		performance: 'w-[130px]',
		status: 'w-[100px]',
		actions: 'w-[60px]'
	};

	let {
		tenants,
		selectedIds = [],
		loadingTenants = new Set(),
		sortBy = 'createdAt',
		sortOrder = 'desc',
		density = 'standard',
		visibleColumns = $bindable([]),
		onSelect,
		onSelectAll,
		onSort
	}: Props = $props();

	// Derived
	const allSelected = $derived(
		tenants.length > 0 && tenants.every((t) => selectedIds.includes(t.id))
	);
	const someSelected = $derived(selectedIds.length > 0 && !allSelected);

	// Row padding based on density
	const rowPadding = $derived(
		{
			compact: 'py-2',
			standard: 'py-3',
			flexible: 'py-4'
		}[density]
	);

	function handleSelectAll(checked: boolean) {
		onSelectAll?.(checked);
	}

	function handleSelect(id: string, checked: boolean) {
		onSelect?.(id, checked);
	}

	function handleSort(column: string) {
		if (sortBy === column) {
			onSort?.(column, sortOrder === 'asc' ? 'desc' : 'asc');
		} else {
			onSort?.(column, 'asc');
		}
	}

	async function handleQuickToggle(tenantId: string, currentStatus: string) {
		loadingTenants.add(tenantId);
		loadingTenants = loadingTenants;

		const newStatus =
			currentStatus === 'active'
				? i18n.t('admin.schools.inactive')
				: i18n.t('admin.schools.active');
		const loadingToastId = toast.loading(i18n.t('messages.loading.saving'));

		try {
			const formData = new FormData();
			formData.append('tenantId', tenantId);
			formData.append('currentStatus', currentStatus);

			const response = await fetch('?/toggleStatus', {
				method: 'POST',
				body: formData
			});

			const result = (await response.json()) as any;
			toast.dismiss(loadingToastId);

			if (result.type === 'success') {
				toast.success(
					result.data?.message ||
						i18n.t('messages.success.updated', { item: i18n.t('common.status') })
				);
				await invalidate('admin:tenants');
			} else {
				toast.error(result.data?.error?.message || i18n.t('messages.error.generic'));
			}
		} catch (error) {
			console.error('Toggle status error:', error);
			toast.dismiss(loadingToastId);
			toast.error(i18n.t('messages.error.network'));
		} finally {
			loadingTenants.delete(tenantId);
			loadingTenants = loadingTenants;
		}
	}

	// Generate gradient color based on name
	function getAvatarGradient(name: string): string {
		const gradients = [
			'from-blue-500 to-cyan-400',
			'from-purple-500 to-pink-400',
			'from-emerald-500 to-teal-400',
			'from-orange-500 to-amber-400',
			'from-rose-500 to-red-400',
			'from-indigo-500 to-violet-400',
			'from-sky-500 to-blue-400',
			'from-fuchsia-500 to-purple-400'
		];
		const index = name.charCodeAt(0) % gradients.length;
		return gradients[index];
	}
</script>

<div class="w-full">
	<!-- Selection Info -->
	{#if selectedIds.length > 0}
		<div class="flex items-center justify-between py-3 px-1">
			<div class="text-sm text-muted-foreground">
				<span class="font-medium text-foreground">{selectedIds.length}</span>
				{i18n.t('common.selected')}
			</div>
		</div>
	{/if}

	<!-- Table Container -->
	<div class="rounded-lg border border-border/60 bg-card overflow-hidden shadow-sm">
		<div class="overflow-x-auto">
			<table class="w-full border-collapse table-fixed">
				<!-- Table Header -->
				<thead>
					<tr class="bg-muted/30 border-b border-border/60">
						<!-- Checkbox Column -->
						<th class={cn('px-4 text-left', columnWidths.checkbox, rowPadding)}>
							<Checkbox
								checked={allSelected}
								indeterminate={someSelected}
								onCheckedChange={handleSelectAll}
								aria-label={i18n.t('actions.selectAll')}
								class="translate-y-[1px]"
							/>
						</th>

						<!-- School Identity -->
						{#if visibleColumns.includes('name')}
							<th class={cn('px-4 text-left', columnWidths.name, rowPadding)}>
								<button
									class="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
									onclick={() => handleSort('name')}
								>
									{i18n.t('admin.schools.schoolIdentity')}
									{#if sortBy === 'name'}
										{#if sortOrder === 'asc'}
											<ArrowUp class="h-3.5 w-3.5 text-primary" />
										{:else}
											<ArrowDown class="h-3.5 w-3.5 text-primary" />
										{/if}
									{:else}
										<ArrowUpDown class="h-3.5 w-3.5 opacity-40" />
									{/if}
								</button>
							</th>
						{/if}

						<!-- Type -->
						{#if visibleColumns.includes('type')}
							<th class={cn('px-4 text-left', columnWidths.type, rowPadding)}>
								<span class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
									{i18n.t('admin.schools.type')}
								</span>
							</th>
						{/if}

						<!-- Access URL -->
						{#if visibleColumns.includes('url')}
							<th class={cn('px-4 text-left', columnWidths.url, rowPadding)}>
								<span class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
									{i18n.t('admin.schools.accessUrl')}
								</span>
							</th>
						{/if}

						<!-- Applicants -->
						{#if visibleColumns.includes('applications')}
							<th class={cn('px-4 text-right', columnWidths.applications, rowPadding)}>
								<button
									class="flex items-center justify-end gap-1.5 w-full text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
									onclick={() => handleSort('applications')}
								>
									{i18n.t('admin.schools.applicantsStat')}
									{#if sortBy === 'applications'}
										{#if sortOrder === 'asc'}
											<ArrowUp class="h-3.5 w-3.5 text-primary" />
										{:else}
											<ArrowDown class="h-3.5 w-3.5 text-primary" />
										{/if}
									{:else}
										<ArrowUpDown class="h-3.5 w-3.5 opacity-40" />
									{/if}
								</button>
							</th>
						{/if}

						<!-- Performance -->
						{#if visibleColumns.includes('performance')}
							<th class={cn('px-4 text-right', columnWidths.performance, rowPadding)}>
								<button
									class="flex items-center justify-end gap-1.5 w-full text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
									onclick={() => handleSort('paidInvoices')}
								>
									{i18n.t('admin.schools.performanceStat')}
									{#if sortBy === 'paidInvoices'}
										{#if sortOrder === 'asc'}
											<ArrowUp class="h-3.5 w-3.5 text-primary" />
										{:else}
											<ArrowDown class="h-3.5 w-3.5 text-primary" />
										{/if}
									{:else}
										<ArrowUpDown class="h-3.5 w-3.5 opacity-40" />
									{/if}
								</button>
							</th>
						{/if}

						<!-- Status -->
						{#if visibleColumns.includes('status')}
							<th class={cn('px-4 text-center', columnWidths.status, rowPadding)}>
								<span class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
									{i18n.t('common.status')}
								</span>
							</th>
						{/if}

						<!-- Actions -->
						<th class={cn('px-4 text-center', columnWidths.actions, rowPadding)}>
							<span class="sr-only">{i18n.t('common.actions')}</span>
						</th>
					</tr>
				</thead>

				<!-- Table Body -->
				<tbody class="divide-y divide-border/40">
					{#each tenants as tenant, index (tenant.id)}
						<tr
							class={cn(
								'transition-colors hover:bg-muted/40',
								selectedIds.includes(tenant.id) && 'bg-primary/5',
								index % 2 === 1 && 'bg-muted/10'
							)}
						>
							<!-- Checkbox -->
							<td class={cn('px-4', rowPadding)}>
								<Checkbox
									id={`table-checkbox-${tenant.id}`}
									checked={selectedIds.includes(tenant.id)}
									onCheckedChange={(checked) => handleSelect(tenant.id, checked === true)}
									aria-label={i18n.t('common.select')}
									class="translate-y-[1px]"
								/>
							</td>

							<!-- School Identity -->
							{#if visibleColumns.includes('name')}
								<td class={cn('px-4', rowPadding)}>
									<div class="flex items-center gap-3">
										<!-- Avatar with Gradient -->
										<div
											class={cn(
												'flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-white text-xs font-semibold uppercase shadow-sm',
												getAvatarGradient(tenant.name)
											)}
										>
											{tenant.name.substring(0, 2)}
										</div>
										<div class="flex flex-col min-w-0">
											<span class="font-medium text-sm text-foreground truncate">
												{tenant.name}
											</span>
											<span class="text-xs text-muted-foreground font-mono">
												{i18n.t('admin.schools.schoolId', { id: tenant.id.slice(0, 8) })}
											</span>
										</div>
									</div>
								</td>
							{/if}

							<!-- Type -->
							{#if visibleColumns.includes('type')}
								<td class={cn('px-4', rowPadding)}>
									<div class="flex items-center gap-2">
										{#if tenant.type === 'foundation'}
											<div class="flex items-center gap-1.5 text-sm text-purple-600">
												<Building2 class="h-4 w-4" />
												<span class="font-medium">{i18n.t('admin.register.foundation')}</span>
											</div>
										{:else}
											<div class="flex items-center gap-1.5 text-sm text-blue-600">
												<School class="h-4 w-4" />
												<span class="font-medium">{i18n.t('admin.register.singleSchool')}</span>
											</div>
										{/if}
									</div>
								</td>
							{/if}

							<!-- Access URL -->
							{#if visibleColumns.includes('url')}
								<td class={cn('px-4', rowPadding)}>
									<a
										href={`http://${tenant.slug}.ppdb.id`}
										target="_blank"
										rel="noopener noreferrer"
										class="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors group"
									>
										<span class="truncate max-w-[160px]">{tenant.slug}.ppdb.id</span>
										<ExternalLink
											class="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
										/>
									</a>
								</td>
							{/if}

							<!-- Applicants (Right Aligned) -->
							{#if visibleColumns.includes('applications')}
								<td class={cn('px-4 text-right', rowPadding)}>
									<span class="text-sm font-semibold tabular-nums text-foreground">
										{tenant.stats?.applications || 0}
									</span>
								</td>
							{/if}

							<!-- Performance (Right Aligned) -->
							{#if visibleColumns.includes('performance')}
								<td class={cn('px-4 text-right', rowPadding)}>
									<div class="flex items-center justify-end gap-1.5">
										<span class="text-sm font-semibold tabular-nums text-foreground">
											{tenant.stats?.paidInvoices || 0}
										</span>
										<span class="text-xs text-muted-foreground"
											>{i18n.t('admin.schools.paidInvoices')}</span
										>
									</div>
								</td>
							{/if}

							<!-- Status (Centered) -->
							{#if visibleColumns.includes('status')}
								<td class={cn('px-4 text-center', rowPadding)}>
									{#if tenant.status === 'active'}
										<span
											class="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200"
										>
											<span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
											{i18n.t('admin.schools.active')}
										</span>
									{:else}
										<span
											class="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200"
										>
											<span class="h-1.5 w-1.5 rounded-full bg-slate-400"></span>
											{i18n.t('admin.schools.inactive')}
										</span>
									{/if}
								</td>
							{/if}

							<!-- Actions -->
							<td class={cn('px-4 text-center', rowPadding)}>
								<DropdownMenu.Root>
									<DropdownMenu.Trigger
										class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-muted h-8 w-8 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
									>
										<span class="sr-only text-xs">{i18n.t('common.actions')}</span>
										<MoreHorizontal class="h-4 w-4 text-muted-foreground" />
									</DropdownMenu.Trigger>
									<DropdownMenu.Content align="end" class="w-52">
										<DropdownMenu.Label class="text-xs text-muted-foreground"
											>{i18n.t('common.actions')}</DropdownMenu.Label
										>
										<DropdownMenu.Separator />
										<DropdownMenu.Item>
											<a href={`/admin/schools/${tenant.id}/edit`} class="flex items-center w-full">
												<Edit class="mr-2 h-4 w-4" />
												{i18n.t('actions.edit')}
												{i18n.t('admin.register.singleSchool')}
											</a>
										</DropdownMenu.Item>
										<DropdownMenu.Item>
											<a
												href={`/admin/reports?tenantId=${tenant.id}`}
												class="flex items-center w-full"
											>
												<BarChart3 class="mr-2 h-4 w-4" />
												{i18n.t('nav.analytics')}
											</a>
										</DropdownMenu.Item>
										<DropdownMenu.Item>
											<a
												href={`/admin/subscription?tenantId=${tenant.id}`}
												class="flex items-center w-full"
											>
												<CreditCard class="mr-2 h-4 w-4" />
												{i18n.t('nav.subscription')}
											</a>
										</DropdownMenu.Item>
										<DropdownMenu.Separator />
										<form action={`/admin/impersonate/${tenant.id}`} method="POST">
											<DropdownMenu.Item>
												<button type="submit" class="flex w-full items-center">
													<UserPlus2 class="mr-2 h-4 w-4" />
													{i18n.t('admin.schools.loginAsAdmin')}
												</button>
											</DropdownMenu.Item>
										</form>
										<DropdownMenu.Separator />
										<DropdownMenu.Item
											onclick={() => {
												if (confirm(i18n.t('common.confirm')))
													handleQuickToggle(tenant.id, tenant.status);
											}}
										>
											{#if tenant.status === 'active'}
												<Power class="mr-2 h-4 w-4 text-amber-500" /> {i18n.t('actions.deactivate')}
											{:else}
												<Power class="mr-2 h-4 w-4 text-emerald-500" /> {i18n.t('actions.activate')}
											{/if}
										</DropdownMenu.Item>
										<form
											method="POST"
											action="?/deleteTenant"
											use:enhance={() => {
												if (!confirm(i18n.t('messages.confirm.delete', { item: tenant.name })))
													return;
												return async ({ update }) => {
													await update();
												};
											}}
										>
											<input type="hidden" name="tenantId" value={tenant.id} />
											<DropdownMenu.Item>
												<button
													type="submit"
													class="flex w-full items-center text-destructive focus:text-destructive"
												>
													<Trash2 class="mr-2 h-4 w-4" />
													{i18n.t('actions.delete')}
													{i18n.t('admin.register.singleSchool')}
												</button>
											</DropdownMenu.Item>
										</form>
									</DropdownMenu.Content>
								</DropdownMenu.Root>
							</td>
						</tr>
					{:else}
						<tr>
							<td colspan={visibleColumns.length + 2} class="h-32 text-center">
								<div class="flex flex-col items-center justify-center gap-2 text-muted-foreground">
									<School class="h-8 w-8 opacity-40" />
									<p class="text-sm">{i18n.t('admin.schools.noSchools')}</p>
									<p class="text-xs">{i18n.t('messages.error.validation')}</p>
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>

	<!-- Footer Info -->
	<p class="text-muted-foreground mt-3 text-center text-xs">
		{i18n.t('admin.schools.listRegistered')}
	</p>
</div>
