<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { formatCurrency } from '$lib/utils';
	import { TrendingUp, TrendingDown } from 'lucide-svelte';

	let { data, title = 'Revenue Trend' }: {
		data: Array<{ date: string; amount: number }>;
		title?: string;
	} = $props();

	const hasData = $derived(data && data.length > 0);
	const maxValue = $derived(hasData ? Math.max(...data.map((d) => d.amount), 1) : 1);
	const minValue = $derived(hasData ? Math.min(...data.map((d) => d.amount), 0) : 0);

	const growthRate = $derived(() => {
		if (!hasData || data.length < 2) return 0;
		const first = data[0].amount;
		const last = data[data.length - 1].amount;
		return first > 0 ? ((last - first) / first) * 100 : 0;
	});

	const points = $derived(() => {
		if (!hasData || data.length === 0) return '';

		const padding = 40;
		const width = 800;
		const height = 300;
		const chartWidth = width - padding * 2;
		const chartHeight = height - padding * 2;

		return data
			.map((d, i) => {
				const x = padding + (i / (data.length - 1 || 1)) * chartWidth;
				const y = padding + chartHeight - ((d.amount - minValue) / (maxValue - minValue || 1)) * chartHeight;
				return `${x},${y}`;
			})
			.join(' ');
	});

	const areaPoints = $derived(() => {
		if (!hasData || data.length === 0) return '';

		const padding = 40;
		const height = 300;
		const chartHeight = height - padding * 2;
		const bottomY = padding + chartHeight;

		// Only generate area points if we have valid points
		if (!points || points === '') return '';

		const lastX = padding + ((data.length - 1) / (data.length - 1 || 1)) * (width - padding * 2);

		return `${padding},${bottomY} ${points} ${lastX},${bottomY}`;
	});

	const yAxisLabels = $derived(
		Array.from({ length: 5 }, (_, i) => {
			const value = maxValue - ((maxValue - minValue) / 4) * i;
			return formatCurrency(value, 'IDR', 0);
		})
	);
</script>

<Card.Root>
	<Card.Header>
		<div class="flex items-center justify-between">
			<div>
				<Card.Title>{title}</Card.Title>
				<Card.Description>Revenue trend over selected period</Card.Description>
			</div>
			<div class="flex items-center gap-1 text-sm">
				{#if growthRate() > 0}
					<TrendingUp class="h-4 w-4 text-green-600" />
					<span class="text-green-600 font-medium">+{growthRate().toFixed(1)}%</span>
				{:else if growthRate() < 0}
					<TrendingDown class="h-4 w-4 text-red-600" />
					<span class="text-red-600 font-medium">{growthRate().toFixed(1)}%</span>
				{:else}
					<span class="text-muted-foreground">0%</span>
				{/if}
			</div>
		</div>
	</Card.Header>
	<Card.Content>
		<div class="relative w-full">
			{#if !hasData}
				<div class="flex items-center justify-center h-[300px] text-muted-foreground">
					<p>No data available for the selected period</p>
				</div>
			{:else}
				<!-- SVG Chart -->
				<svg viewBox="0 0 800 300" class="w-full h-auto" preserveAspectRatio="none">
					<!-- Y-axis labels -->
					<text x="10" y="20" class="text-[10px]" fill="hsl(var(--muted-foreground))">
						{yAxisLabels[0]}
					</text>
					<text x="10" y="90" class="text-[10px]" fill="hsl(var(--muted-foreground))">
						{yAxisLabels[1]}
					</text>
					<text x="10" y="160" class="text-[10px]" fill="hsl(var(--muted-foreground))">
						{yAxisLabels[2]}
					</text>
					<text x="10" y="230" class="text-[10px]" fill="hsl(var(--muted-foreground))">
						{yAxisLabels[3]}
					</text>

					<!-- Grid lines -->
					<line x1="40" y1="40" x2="780" y2="40" stroke="hsl(var(--border))" stroke-dasharray="4" />
					<line x1="40" y1="110" x2="780" y2="110" stroke="hsl(var(--border))" stroke-dasharray="4" />
					<line x1="40" y1="180" x2="780" y2="180" stroke="hsl(var(--border))" stroke-dasharray="4" />
					<line x1="40" y1="250" x2="780" y2="250" stroke="hsl(var(--border))" />

					<!-- Area fill -->
					<polygon
						points={areaPoints}
						fill="hsl(var(--primary))"
						fill-opacity="0.1"
					/>

					<!-- Line -->
					<polyline
						points={points}
						fill="none"
						stroke="hsl(var(--primary))"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>

					<!-- Data points -->
					{#each data as d, i}
						{@const x = 40 + (i / (data.length - 1 || 1)) * 740}
						{@const y = 40 + 260 - ((d.amount - minValue) / (maxValue - minValue || 1)) * 260}
						<circle
							cx={x}
							cy={y}
							r="3"
							fill="hsl(var(--primary))"
							class="transition-all cursor-pointer"
						>
							<title>{d.date}: {formatCurrency(d.amount)}</title>
						</circle>
					{/each}
				</svg>

				<!-- X-axis labels -->
				{#if data.length > 0}
					<div class="flex justify-between text-[10px] text-muted-foreground mt-2 px-2">
						<span>{data[0].date}</span>
						{#if data.length > 1}
							<span>{data[Math.floor(data.length / 2)].date}</span>
						{/if}
						<span>{data[data.length - 1].date}</span>
					</div>
				{/if}
			{/if}
		</div>
	</Card.Content>
</Card.Root>
