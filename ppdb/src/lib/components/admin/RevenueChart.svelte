<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { formatCurrency } from '$lib/utils';

	let { data, maxRevenue } = $props<{ data: { date: string; amount: number }[]; maxRevenue: number }>();

	const yAxisLabels = $derived(
		Array.from({ length: 5 }, (_, i) => {
			const value = (maxRevenue / 4) * (4 - i);
			return formatCurrency(value, 'IDR', 0); // Compact format
		})
	);
</script>

<Card.Root class="lg:col-span-2">
	<Card.Header>
		<Card.Title>Revenue Velocity</Card.Title>
		<Card.Description>Daily revenue performance over the last 30 days</Card.Description>
	</Card.Header>
	<Card.Content>
		<div class="relative h-[300px] w-full pt-4">
			<!-- Grid Lines -->
			<div class="absolute inset-0 flex flex-col justify-between text-xs text-muted-foreground/50">
				{#each yAxisLabels as label}
					<div class="flex items-center gap-2 border-b border-dashed border-muted pb-1 last:border-0">
						<span class="w-16 text-right font-mono text-[10px]">{label}</span>
						<div class="flex-1"></div>
					</div>
				{/each}
				<!-- Zero line label -->
				<div class="flex items-center gap-2">
					<span class="w-16 text-right font-mono text-[10px]">Rp 0</span>
					<div class="flex-1"></div>
				</div>
			</div>

			<!-- Bars -->
			<div class="absolute inset-0 ml-20 flex items-end gap-1 sm:gap-2 pb-5">
				{#each data as day}
					<div class="group relative flex-1 flex flex-col justify-end h-full">
						<!-- Tooltip -->
						<div
							class="absolute bottom-full left-1/2 mb-2 -translate-x-1/2 rounded bg-popover px-2 py-1 text-[10px] font-medium text-popover-foreground shadow-md opacity-0 transition-opacity group-hover:opacity-100 whitespace-nowrap z-10 border"
						>
							{formatCurrency(day.amount)}
							<div class="text-[9px] text-muted-foreground text-center">
								{new Date(day.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
							</div>
						</div>
						
						<!-- Bar -->
						<div
							class="w-full rounded-t-sm bg-primary/80 transition-all hover:bg-primary"
							style="height: {Math.max((day.amount / maxRevenue) * 100, 2)}%"
						></div>
					</div>
				{/each}
			</div>
		</div>
	</Card.Content>
</Card.Root>
