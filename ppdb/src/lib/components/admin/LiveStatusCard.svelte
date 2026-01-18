<script lang="ts">
	import { Clock } from 'lucide-svelte';
	import * as Card from '$lib/components/ui/card';
	import Progress from '$lib/components/ui/progress.svelte';
</script>

<Card.Root>
	<Card.Header class="pb-2">
		<div class="flex items-center justify-between">
			<Card.Title class="text-sm font-bold uppercase tracking-wider">Live Status</Card.Title>
			<span
				class="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-600"
			>
				<span class="relative flex h-1.5 w-1.5">
					<span
						class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"
					></span>
					<span class="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
				</span>
				Operational
			</span>
		</div>
	</Card.Header>
	<Card.Content class="space-y-6">
		<!-- System Stats -->
		<div class="space-y-4">
			<div>
				<div class="mb-1.5 flex justify-between text-[10px] font-medium">
					<span class="text-muted-foreground">CPU Usage</span>
					<span>12%</span>
				</div>
				<Progress value={12} showLabel={false} class="h-1.5" />
			</div>
			<div>
				<div class="mb-1.5 flex justify-between text-[10px] font-medium">
					<span class="text-muted-foreground">Active Sessions</span>
					<span>1,240</span>
				</div>
				<Progress value={65} showLabel={false} class="h-1.5" />
			</div>
		</div>

		<!-- Recent Activity Mini -->
		<div class="pt-4 border-t">
			<h4 class="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
				Latest Activity
			</h4>
			<div class="flex gap-3">
				<div
					class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600"
				>
					<Clock class="h-4 w-4" />
				</div>
				<div class="space-y-0.5">
					<p class="text-xs font-bold">New School Registered</p>
					<p class="text-[10px] text-muted-foreground">Global Islamic School applied.</p>
					<p class="text-[9px] font-medium uppercase tracking-wider text-muted-foreground">
						2 mins ago
					</p>
				</div>
			</div>
		</div>
	</Card.Content>
</Card.Root>
