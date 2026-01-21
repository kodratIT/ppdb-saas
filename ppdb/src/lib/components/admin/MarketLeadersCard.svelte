<script lang="ts">
	import { formatCurrency } from '$lib/utils';
	import * as Card from '$lib/components/ui/card';
	import { i18n } from '$lib/i18n/index.svelte';

	let { schools }: { schools: any[] } = $props();
</script>

<Card.Root class="bg-slate-900 text-white border-slate-800">
	<Card.Header class="pb-2">
		<Card.Title class="text-sm font-bold uppercase tracking-wider text-white">
			{i18n.t('admin.dashboard.marketLeaders')}
		</Card.Title>
	</Card.Header>
	<Card.Content class="space-y-4">
		{#each schools as school, i}
			<div class="flex items-center justify-between pb-3 border-b border-slate-800 last:border-0">
				<div class="flex items-center gap-3">
					<span class="text-[10px] font-bold text-slate-500">0{i + 1}</span>
					<div>
						<p class="text-xs font-bold uppercase truncate max-w-[140px] text-white">
							{school.name}
						</p>
						<p class="text-[10px] text-slate-400">
							{i18n.t('admin.dashboard.appsCount', { count: school.appCount })}
						</p>
					</div>
				</div>
				<p class="text-xs font-bold text-white">{formatCurrency(Number(school.revenue))}</p>
			</div>
		{/each}
	</Card.Content>
</Card.Root>
