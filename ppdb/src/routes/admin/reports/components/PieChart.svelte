<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { formatCurrency } from '$lib/utils';

	let { data, title = 'Revenue Distribution' }: {
		data: Array<{ label: string; value: number; color?: string }>;
		title?: string;
	} = $props();

	const total = $derived(data.reduce((sum, d) => sum + d.value, 0));

	const colors = [
		'hsl(var(--primary))',
		'hsl(215, 25%, 27%)',
		'hsl(142, 76%, 36%)',
		'hsl(38, 92%, 50%)',
		'hsl(0, 84%, 60%)',
		'hsl(270, 60%, 50%)',
		'hsl(180, 60%, 40%)',
		'hsl(30, 80%, 50%)'
	];

	const segments = $derived(() => {
		let currentAngle = 0;
		return data.map((d, i) => {
			const percentage = total > 0 ? (d.value / total) * 100 : 0;
			const angle = (percentage / 100) * 360;
			const startAngle = currentAngle;
			const endAngle = currentAngle + angle;
			currentAngle = endAngle;

			// Calculate SVG path for pie slice
			const x1 = 50 + 40 * Math.cos((Math.PI * startAngle) / 180);
			const y1 = 50 + 40 * Math.sin((Math.PI * startAngle) / 180);
			const x2 = 50 + 40 * Math.cos((Math.PI * endAngle) / 180);
			const y2 = 50 + 40 * Math.sin((Math.PI * endAngle) / 180);

			const largeArcFlag = angle > 180 ? 1 : 0;

			const path = `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

			return {
				...d,
				percentage,
				path,
				color: d.color || colors[i % colors.length]
			};
		});
	});
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>{title}</Card.Title>
		<Card.Description>Revenue distribution by category</Card.Description>
	</Card.Header>
	<Card.Content>
		<div class="flex items-center gap-6">
			<!-- Pie Chart -->
			<div class="relative">
				<svg viewBox="0 0 100 100" class="w-32 h-32">
					{#each segments as segment}
						<path
							d={segment.path}
							fill={segment.color}
							class="hover:opacity-80 transition-opacity cursor-pointer"
						>
							<title>{segment.label}: {formatCurrency(segment.value)} ({segment.percentage.toFixed(1)}%)</title>
						</path>
					{/each}
					<!-- Center hole for donut effect -->
					<circle cx="50" cy="50" r="20" fill="hsl(var(--card-background))" />
				</svg>
			</div>

			<!-- Legend -->
			<div class="flex-1 space-y-2">
				{#each segments as segment}
					<div class="flex items-center justify-between text-sm">
						<div class="flex items-center gap-2">
							<div
								class="w-3 h-3 rounded"
								style="background-color: {segment.color}"
							></div>
							<span class="text-muted-foreground">{segment.label}</span>
						</div>
						<div class="flex items-center gap-3">
							<span class="font-medium">{formatCurrency(segment.value)}</span>
							<span class="text-muted-foreground text-xs">{segment.percentage.toFixed(1)}%</span>
						</div>
					</div>
				{/each}

				<!-- Total -->
				<div class="flex items-center justify-between text-sm pt-2 border-t">
					<span class="font-medium">Total</span>
					<span class="font-bold">{formatCurrency(total)}</span>
				</div>
			</div>
		</div>
	</Card.Content>
</Card.Root>
