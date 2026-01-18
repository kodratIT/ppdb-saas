<script lang="ts">
	import * as Table from '$lib/components/ui/table';
	import * as Card from '$lib/components/ui/card';
	import Badge from '$lib/components/ui/badge.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import { ArrowRight, School, Eye, ExternalLink } from 'lucide-svelte';

	// Define type manually to avoid importing server-only schema in client component
	interface Tenant {
		id: string;
		name: string;
		slug: string;
		status: 'active' | 'inactive';
		createdAt: Date;
		updatedAt: Date;
	}

	let { tenants = [] } = $props<{ tenants: Tenant[] }>();
</script>

<Card.Root>
	<Card.Header class="flex flex-row items-center justify-between pb-4">
		<div class="space-y-1">
			<Card.Title class="text-lg font-bold">Recent Registrations</Card.Title>
			<Card.Description>Latest schools joining the platform</Card.Description>
		</div>
		<Button variant="outline" size="sm" href="/admin/schools" class="text-xs h-8">
			View All <ArrowRight class="ml-2 h-3.5 w-3.5" />
		</Button>
	</Card.Header>
	<Card.Content class="p-0">
		<Table.Root>
			<Table.Header>
				<Table.Row class="hover:bg-transparent">
					<Table.Head class="w-[300px] pl-6">School Name</Table.Head>
					<Table.Head class="hidden md:table-cell">Subdomain</Table.Head>
					<Table.Head>Status</Table.Head>
					<Table.Head class="hidden md:table-cell text-right">Joined Date</Table.Head>
					<Table.Head class="text-right pr-6">Actions</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each tenants as tenant (tenant.id)}
					<Table.Row class="group hover:bg-muted/50">
						<Table.Cell class="font-medium pl-6">
							<div class="flex items-center gap-3">
								<div class="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
									<School class="h-5 w-5" />
								</div>
								<div class="flex flex-col">
									<span class="font-semibold text-foreground truncate max-w-[150px] md:max-w-[200px]">{tenant.name}</span>
									<span class="text-xs text-muted-foreground md:hidden">{tenant.slug}.ppdb.com</span>
								</div>
							</div>
						</Table.Cell>
						<Table.Cell class="hidden md:table-cell">
							<a 
								href={`http://${tenant.slug}.ppdb.com`} 
								target="_blank" 
								class="inline-flex items-center text-sm text-muted-foreground hover:text-primary hover:underline transition-colors"
							>
								{tenant.slug}.ppdb.com
								<ExternalLink class="ml-1 h-3 w-3" />
							</a>
						</Table.Cell>
						<Table.Cell>
							<Badge variant={tenant.status === 'active' ? 'default' : 'secondary'} class="capitalize">
								{tenant.status}
							</Badge>
						</Table.Cell>
						<Table.Cell class="hidden md:table-cell text-right text-muted-foreground">
							{new Date(tenant.createdAt).toLocaleDateString('id-ID', {
								day: 'numeric',
								month: 'short',
								year: 'numeric'
							})}
						</Table.Cell>
						<Table.Cell class="text-right pr-6">
							<Button variant="ghost" size="icon" href={`/admin/schools/${tenant.id}`} class="h-8 w-8">
								<Eye class="h-4 w-4" />
								<span class="sr-only">View Details</span>
							</Button>
						</Table.Cell>
					</Table.Row>
				{/each}
				{#if tenants.length === 0}
					<Table.Row>
						<Table.Cell colspan={5} class="h-32 text-center text-muted-foreground">
							No recent registrations found.
						</Table.Cell>
					</Table.Row>
				{/if}
			</Table.Body>
		</Table.Root>
	</Card.Content>
</Card.Root>
