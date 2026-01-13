<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import {
		Button,
		Card,
		CardContent,
		CardHeader,
		CardTitle,
		CardDescription,
		Badge
	} from '$lib/components/ui';
	import { CalendarDays, Users, ArrowRight } from 'lucide-svelte';

	export let data: { paths: any[] };
</script>

<div class="flex items-center justify-between space-y-2">
	<h2 class="text-3xl font-bold tracking-tight">Ranking & Selection</h2>
</div>

<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-4">
	{#each data.paths as path}
		<Card>
			<CardHeader>
				<div class="flex justify-between items-start">
					<CardTitle>{path.name}</CardTitle>
					<Badge variant={path.status === 'open' ? 'default' : 'secondary'}>
						{path.status}
					</Badge>
				</div>
				<CardDescription>{path.description || 'No description'}</CardDescription>
			</CardHeader>
			<CardContent>
				<div class="space-y-4">
					<div class="flex items-center text-sm text-muted-foreground">
						<Users class="mr-2 h-4 w-4" />
						<span>Quota: {path.quota}</span>
					</div>
					{#if path.announcementDate}
						<div class="flex items-center text-sm text-muted-foreground">
							<CalendarDays class="mr-2 h-4 w-4" />
							<span>Announce: {new Date(path.announcementDate).toLocaleDateString()}</span>
						</div>
					{/if}

					<Button
						variant="outline"
						class="w-full mt-4"
						onclick={() => goto(`/${$page.params.tenant}/admin/ranking/${path.id}`)}
					>
						Manage Ranking
						<ArrowRight class="ml-2 h-4 w-4" />
					</Button>
				</div>
			</CardContent>
		</Card>
	{/each}

	{#if data.paths.length === 0}
		<div class="col-span-full text-center p-8 text-muted-foreground">
			No admission paths found. Create one in Settings > Admission Paths.
		</div>
	{/if}
</div>
