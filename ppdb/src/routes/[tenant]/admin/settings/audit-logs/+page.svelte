<script lang="ts">
	import {
		Card,
		CardContent,
		CardHeader,
		CardTitle,
		CardDescription
	} from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Table, TableBody, TableCell, TableHead, TableRow } from '$lib/components/ui/table';
	import { History, ShieldAlert } from 'lucide-svelte';

	export let data;

	function formatDate(date: Date) {
		return new Date(date).toLocaleDateString('id-ID', {
			day: 'numeric',
			month: 'short',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit'
		});
	}

	function getActionColor(action: string) {
		if (action.includes('failure')) return 'bg-red-100 text-red-800';
		if (action.includes('sensitive')) return 'bg-yellow-100 text-yellow-800';
		if (action.includes('success')) return 'bg-green-100 text-green-800';
		return 'bg-gray-100 text-gray-800';
	}
</script>

<div class="space-y-6">
	<div>
		<h1 class="text-3xl font-bold tracking-tight">Audit Logs</h1>
		<p class="text-muted-foreground">Immutable history of system activities.</p>
	</div>

	<Card>
		<CardHeader>
			<CardTitle class="flex items-center gap-2">
				<History class="h-5 w-5" />
				Activity History
			</CardTitle>
			<CardDescription>
				Showing latest 100 actions performed by users in this tenant.
			</CardDescription>
		</CardHeader>
		<CardContent>
			<div class="rounded-md border">
				<Table>
					<thead>
						<TableRow>
							<TableHead>Timestamp</TableHead>
							<TableHead>Actor</TableHead>
							<TableHead>Action</TableHead>
							<TableHead>Target</TableHead>
							<TableHead>Details</TableHead>
						</TableRow>
					</thead>
					<TableBody>
						{#each data.logs as log (log.id)}
							<TableRow>
								<TableCell class="font-mono text-xs whitespace-nowrap">
									{formatDate(log.timestamp)}
								</TableCell>
								<TableCell>
									<div class="font-medium text-sm">{log.actorName}</div>
									<div class="text-xs text-muted-foreground">{log.actorRole}</div>
								</TableCell>
								<TableCell>
									<Badge variant="outline" class={getActionColor(log.action)}>
										{log.action}
									</Badge>
								</TableCell>
								<TableCell class="font-mono text-xs">
									{log.target}
								</TableCell>
								<TableCell>
									<div
										class="max-w-[300px] truncate text-xs text-muted-foreground font-mono"
										title={JSON.stringify(log.details, null, 2)}
									>
										{JSON.stringify(log.details)}
									</div>
								</TableCell>
							</TableRow>
						{:else}
							<TableRow>
								<TableCell colspan="5" class="text-center py-8 text-muted-foreground">
									No logs found.
								</TableCell>
							</TableRow>
						{/each}
					</TableBody>
				</Table>
			</div>
		</CardContent>
	</Card>

	<div
		class="flex items-center gap-2 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800"
	>
		<ShieldAlert class="h-5 w-5" />
		<p>
			<strong>Security Note:</strong> These logs are immutable (read-only) and cannot be modified or deleted
			by any admin.
		</p>
	</div>
</div>
