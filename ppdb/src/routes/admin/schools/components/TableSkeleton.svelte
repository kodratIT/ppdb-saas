<script lang="ts">
	import * as Table from '$lib/components/ui/table';
	import { Skeleton } from '$lib/components/ui/skeleton';

	let { rows = 5 } = $props<{ rows?: number }>();
</script>

<Table.Root>
	<Table.Header>
		<Table.Row>
			<Table.Head class="w-80 pl-6">School Identity</Table.Head>
			<Table.Head>Access URL</Table.Head>
			<Table.Head class="text-center">Applicants</Table.Head>
			<Table.Head class="text-center">Paid Invoices</Table.Head>
			<Table.Head>Status</Table.Head>
			<Table.Head class="text-right pr-6">Actions</Table.Head>
		</Table.Row>
	</Table.Header>
	<Table.Body>
		{#each Array(rows) as _, i (i)}
			<Table.Row>
				<Table.Cell class="pl-6">
					<div class="flex items-center gap-3">
						<Skeleton class="h-9 w-9 rounded-lg" />
						<div class="flex flex-col gap-2">
							<Skeleton class="h-4 w-32" />
							<Skeleton class="h-3 w-24" />
						</div>
					</div>
				</Table.Cell>
				<Table.Cell>
					<Skeleton class="h-4 w-40" />
				</Table.Cell>
				<Table.Cell class="text-center">
					<Skeleton class="h-4 w-8 mx-auto" />
				</Table.Cell>
				<Table.Cell class="text-center">
					<Skeleton class="h-6 w-20 mx-auto rounded-full" />
				</Table.Cell>
				<Table.Cell>
					<Skeleton class="h-6 w-16 rounded-full" />
				</Table.Cell>
				<Table.Cell class="text-right pr-6">
					<Skeleton class="h-8 w-8 ml-auto" />
				</Table.Cell>
			</Table.Row>
		{/each}
	</Table.Body>
</Table.Root>
