<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import Badge from '$lib/components/ui/badge.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import { ArrowRight, School, Eye, ExternalLink } from 'lucide-svelte';
	import { cn, formatCurrency } from '$lib/utils';
	import { i18n } from '$lib/i18n/index.svelte';

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

<Card.Root class="shadow-premium border-none bg-card/50 backdrop-blur-sm overflow-hidden">
	<Card.Header class="flex flex-row items-center justify-between pb-6 px-6 pt-6">
		<div class="space-y-1">
			<Card.Title class="text-xl font-bold tracking-tight"
				>{i18n.t('admin.dashboard.recentRegistrations')}</Card.Title
			>
			<Card.Description class="text-sm"
				>{i18n.t('admin.dashboard.latestSchoolsJoining')}</Card.Description
			>
		</div>
		<Button
			variant="ghost"
			size="sm"
			href="/admin/schools"
			class="text-primary hover:bg-primary/5 font-semibold transition-colors"
		>
			{i18n.t('admin.dashboard.viewAll')}
			<ArrowRight class="ml-2 h-4 w-4" />
		</Button>
	</Card.Header>
	<Card.Content class="p-0">
		<div class="overflow-x-auto">
			<table class="table-modern">
				<thead>
					<tr>
						<th class="w-[300px]">{i18n.t('admin.dashboard.schoolName')}</th>
						<th class="hidden md:table-cell">{i18n.t('admin.dashboard.subdomain')}</th>
						<th>{i18n.t('admin.dashboard.status')}</th>
						<th class="hidden md:table-cell text-right">{i18n.t('admin.dashboard.joinedDate')}</th>
						<th class="text-right pr-8">{i18n.t('admin.dashboard.actions')}</th>
					</tr>
				</thead>
				<tbody>
					{#each tenants as tenant, i (tenant.id)}
						<tr class="animate-in-fade" style="animation-delay: {i * 50}ms">
							<td class="font-medium">
								<div class="flex items-center gap-4">
									<div
										class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/5 text-primary group-hover:bg-primary/10 transition-colors"
									>
										<School class="h-5 w-5" />
									</div>
									<div class="flex flex-col min-w-0">
										<span class="font-bold text-foreground truncate">{tenant.name}</span>
										<span
											class="text-[10px] text-muted-foreground uppercase tracking-wider md:hidden"
											>{tenant.slug}.ppdb.com</span
										>
									</div>
								</div>
							</td>
							<td class="hidden md:table-cell">
								<a
									href={`http://${tenant.slug}.ppdb.com`}
									target="_blank"
									class="inline-flex items-center text-sm font-medium text-muted-foreground/70 hover:text-primary transition-colors"
								>
									{tenant.slug}.ppdb.com
									<ExternalLink class="ml-1.5 h-3 w-3" />
								</a>
							</td>
							<td>
								<Badge
									variant={tenant.status === 'active' ? 'default' : 'secondary'}
									class={cn(
										'px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider',
										tenant.status === 'active'
											? 'bg-emerald-500/10 text-emerald-600 border-none'
											: 'bg-muted/50 text-muted-foreground border-none'
									)}
								>
									{tenant.status === 'active'
										? i18n.t('admin.schools.active')
										: i18n.t('admin.schools.inactive')}
								</Badge>
							</td>
							<td class="hidden md:table-cell text-right text-muted-foreground font-medium">
								{new Date(tenant.createdAt).toLocaleDateString(
									i18n.language === 'id' ? 'id-ID' : 'en-US',
									{
										day: 'numeric',
										month: 'short',
										year: 'numeric'
									}
								)}
							</td>
							<td class="text-right pr-8">
								<Button
									variant="ghost"
									size="icon"
									href={`/admin/schools/${tenant.id}`}
									class="h-9 w-9 rounded-xl hover:bg-primary/5 hover:text-primary transition-all"
								>
									<Eye class="h-4 w-4" />
									<span class="sr-only">{i18n.t('admin.dashboard.viewDetails')}</span>
								</Button>
							</td>
						</tr>
					{/each}
					{#if tenants.length === 0}
						<tr>
							<td colspan={5} class="h-40 text-center text-muted-foreground">
								<div class="flex flex-col items-center gap-2">
									<School class="h-8 w-8 opacity-20" />
									<p class="font-medium">{i18n.t('admin.dashboard.noRecentRegistrations')}</p>
								</div>
							</td>
						</tr>
					{/if}
				</tbody>
			</table>
		</div>
	</Card.Content>
</Card.Root>
