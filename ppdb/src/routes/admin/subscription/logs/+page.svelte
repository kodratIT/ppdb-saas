<script lang="ts">
	import type { PageData } from './$types';
	import SubscriptionNav from '$lib/components/admin/SubscriptionNav.svelte';
	import * as Card from '$lib/components/ui/card';
	import * as Table from '$lib/components/ui/table';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { Search, History, User, Activity } from 'lucide-svelte';
	import { i18n } from '$lib/i18n/index.svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';

	let { data }: { data: PageData } = $props();

	let searchValue = $state(page.url.searchParams.get('q') || '');

	function handleSearch() {
		const query = new URLSearchParams(page.url.searchParams);
		if (searchValue) query.set('q', searchValue);
		else query.delete('q');
		goto(`?${query.toString()}`, { keepFocus: true, noScroll: true });
	}
</script>

<div class="flex flex-col gap-6 p-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold tracking-tight mb-1">Audit Logs</h1>
			<p class="text-muted-foreground">Track all administrative changes to subscriptions, packages, and coupons.</p>
		</div>
	</div>

	<div class="relative w-full max-w-sm">
		<Search class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
		<Input
			type="search"
			placeholder="Search by target..."
			class="pl-8"
			bind:value={searchValue}
			onchange={handleSearch}
		/>
	</div>

	<Card.Root>
		<Card.Content class="p-0">
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>Date</Table.Head>
						<Table.Head>Actor</Table.Head>
						<Table.Head>Action</Table.Head>
						<Table.Head>Target</Table.Head>
						<Table.Head>Details</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#if data.logs.length === 0}
						<Table.Row>
							<Table.Cell colspan={5} class="text-center py-8 text-muted-foreground">
								<History class="h-8 w-8 mx-auto mb-2 opacity-20" />
								No logs found for subscription activities.
							</Table.Cell>
						</Table.Row>
					{:else}
						{#each data.logs as entry}
							<Table.Row>
								<Table.Cell class="text-xs text-muted-foreground">
									{new Date(entry.log.createdAt).toLocaleString('id-ID')}
								</Table.Cell>
								<Table.Cell>
									<div class="flex items-center gap-2">
										<User class="h-3 w-3 text-muted-foreground" />
										<span class="font-medium text-xs">{entry.actor?.name || 'Unknown'}</span>
									</div>
								</Table.Cell>
								<Table.Cell>
									<span class="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">
										{entry.log.action}
									</span>
								</Table.Cell>
								<Table.Cell class="text-xs font-medium">{entry.log.target}</Table.Cell>
								<Table.Cell class="max-w-xs truncate text-[10px] text-muted-foreground">
									{entry.log.details || '-'}
								</Table.Cell>
							</Table.Row>
						{/each}
					{/if}
				</Table.Body>
			</Table.Root>
		</Card.Content>
	</Card.Root>
</div>
