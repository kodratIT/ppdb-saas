<script lang="ts">
	import type { ComponentEvents } from 'svelte';
	import * as Table from '$lib/components/ui/table';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import Badge from '$lib/components/ui/badge.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import Checkbox from '$lib/components/ui/checkbox.svelte';
	import { enhance } from '$app/forms';
	import { toast } from '$lib/utils/toast';
	import { TENANT_ID_DISPLAY_LENGTH } from '$lib/constants/admin';
	import {
		Globe,
		ExternalLink,
		Power,
		Loader2,
		MoreHorizontal
	} from 'lucide-svelte';

	interface Tenant {
		id: string;
		name: string;
		slug: string;
		status: 'active' | 'inactive';
		stats?: {
			applications: number;
			paidInvoices: number;
		};
	}

	interface Props {
		tenants: Tenant[];
		selectedIds?: string[];
		loadingTenants?: Set<string>;
		onSelect?: (id: string, checked: boolean) => void;
		onSelectAll?: (checked: boolean) => void;
	}

	let {
		tenants,
		selectedIds = [],
		loadingTenants = new Set(),
		onSelect,
		onSelectAll
	}: Props = $props();

	const allSelected = $derived(
		tenants.length > 0 && tenants.every((t) => selectedIds.includes(t.id))
	);
	const someSelected = $derived(
		selectedIds.length > 0 && !allSelected
	);

	function handleSelectAll(checked: boolean) {
		onSelectAll?.(checked);
	}

	function handleSelect(id: string, checked: boolean) {
		onSelect?.(id, checked);
	}
</script>

<Table.Root>
	<Table.Header>
		<Table.Row>
			<Table.Head class="w-12 pl-6">
				<Checkbox
					checked={allSelected}
					indeterminate={someSelected}
					onCheckedChange={handleSelectAll}
					aria-label="Select all schools"
				/>
			</Table.Head>
			<Table.Head class="w-80">School Identity</Table.Head>
			<Table.Head>Access URL</Table.Head>
			<Table.Head class="text-center">Applicants</Table.Head>
			<Table.Head class="text-center">Paid Invoices</Table.Head>
			<Table.Head>Status</Table.Head>
			<Table.Head class="text-right pr-6">Actions</Table.Head>
		</Table.Row>
	</Table.Header>
	<Table.Body>
		{#each tenants as tenant (tenant.id)}
			<Table.Row class="group hover:bg-muted/50">
				<Table.Cell class="pl-6">
					<Checkbox
						checked={selectedIds.includes(tenant.id)}
						onCheckedChange={(checked) => handleSelect(tenant.id, checked === true)}
						aria-label={`Select ${tenant.name}`}
					/>
				</Table.Cell>
				<Table.Cell>
					<div class="flex items-center gap-3">
						<div
							class="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold"
						>
							{tenant.name.charAt(0)}
						</div>
						<div class="flex flex-col">
							<span class="font-semibold text-foreground truncate max-w-48">{tenant.name}</span>
							<span class="text-xs text-muted-foreground font-mono">
								ID: {tenant.id.slice(0, TENANT_ID_DISPLAY_LENGTH)}
							</span>
						</div>
					</div>
				</Table.Cell>
				<Table.Cell>
					<a
						href={`http://${tenant.slug}.ppdb.id`}
						target="_blank"
						class="inline-flex items-center text-sm font-medium text-primary hover:underline"
					>
						<Globe class="mr-1.5 h-3.5 w-3.5" />
						{tenant.slug}.ppdb.id
					</a>
				</Table.Cell>
				<Table.Cell class="text-center font-medium">
					{tenant.stats?.applications || 0}
				</Table.Cell>
				<Table.Cell class="text-center">
					<Badge variant="success">
						{tenant.stats?.paidInvoices || 0} PAID
					</Badge>
				</Table.Cell>
				<Table.Cell>
					<Badge variant={tenant.status === 'active' ? 'default' : 'destructive'} class="capitalize">
						{tenant.status}
					</Badge>
				</Table.Cell>
				<Table.Cell class="text-right pr-6">
					<DropdownMenu.Root>
						<DropdownMenu.Trigger>
							<Button variant="ghost" size="icon" class="h-8 w-8">
								<MoreHorizontal class="h-4 w-4" />
								<span class="sr-only">Open menu</span>
							</Button>
						</DropdownMenu.Trigger>
						<DropdownMenu.Content align="end">
							<DropdownMenu.Label>Actions</DropdownMenu.Label>
							<DropdownMenu.Item href={`/${tenant.slug}/admin`} target="_blank">
								<ExternalLink class="mr-2 h-4 w-4" /> View as Admin
							</DropdownMenu.Item>
							<DropdownMenu.Separator />
							<form 
								method="POST" 
								action="?/toggleStatus" 
								use:enhance={() => {
									loadingTenants.add(tenant.id);
									loadingTenants = loadingTenants;
									
									// Show loading toast
									const loadingToastId = toast.loading(
										`${tenant.status === 'active' ? 'Deactivating' : 'Activating'} ${tenant.name}...`
									);
									
									return async ({ result, update }) => {
										loadingTenants.delete(tenant.id);
										loadingTenants = loadingTenants;
										
										console.log('Toggle status result:', result);
										
										// Dismiss loading toast
										toast.dismiss(loadingToastId);
										
										if (result.type === 'success') {
											const message = result.data?.message || 'Status updated successfully';
											console.log('Success message:', message);
											toast.success(message);
											await update();
										} else if (result.type === 'failure') {
											const errorMessage = result.data?.error?.message || 'Failed to update status';
											console.log('Error message:', errorMessage);
											toast.error(errorMessage);
										}
									};
								}}
							>
								<input type="hidden" name="tenantId" value={tenant.id} />
								<input type="hidden" name="currentStatus" value={tenant.status} />
								<button 
									type="submit"
									class="relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground disabled:pointer-events-none disabled:opacity-50 {tenant.status === 'active' ? 'text-destructive focus:text-destructive' : 'text-green-600 focus:text-green-600'}"
									disabled={loadingTenants.has(tenant.id)}
								>
									{#if loadingTenants.has(tenant.id)}
										<Loader2 class="mr-2 h-4 w-4 animate-spin" />
									{:else}
										<Power class="mr-2 h-4 w-4" />
									{/if}
									{tenant.status === 'active' ? 'Deactivate School' : 'Activate School'}
								</button>
							</form>
						</DropdownMenu.Content>
					</DropdownMenu.Root>
				</Table.Cell>
			</Table.Row>
		{:else}
			<Table.Row>
				<Table.Cell colspan={7} class="h-24 text-center">
					No schools found.
				</Table.Cell>
			</Table.Row>
		{/each}
	</Table.Body>
</Table.Root>
