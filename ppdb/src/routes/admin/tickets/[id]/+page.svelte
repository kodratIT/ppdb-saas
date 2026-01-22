<script lang="ts">
	import type { PageData } from './$types';
	import TicketDetail from '$lib/components/admin/tickets/TicketDetail.svelte';
	import { Button } from '$lib/components/ui/button';
	import { ArrowLeft } from 'lucide-svelte';

	let { data }: { data: PageData } = $props();
</script>

<div class="container mx-auto px-4 py-8 max-w-6xl h-[calc(100vh-4rem)] flex flex-col">
	<!-- Header -->
	<div class="flex items-center justify-between mb-6 shrink-0">
		<div class="flex items-center gap-4">
			<Button variant="ghost" size="icon" href="/admin/tickets">
				<ArrowLeft class="h-5 w-5" />
			</Button>
			<div>
				<div class="flex items-center gap-3">
					<h1 class="text-2xl font-bold tracking-tight">{data.ticket.subject}</h1>
					<div class="px-2 py-0.5 rounded text-xs font-mono bg-slate-100 text-slate-600 border">
						{data.ticket.id.slice(0, 8)}
					</div>
				</div>
				<p class="text-muted-foreground text-sm mt-1">
					From <span class="font-medium text-foreground">{data.ticket.tenant.name}</span>
				</p>
			</div>
		</div>
	</div>

	<!-- Detail Component -->
	<div class="flex-1 min-h-0">
		<TicketDetail
			ticket={data.ticket}
			currentUser={data.currentUser}
			staffMembers={data.staffMembers}
		/>
	</div>
</div>
