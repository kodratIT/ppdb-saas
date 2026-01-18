<script lang="ts">
	interface Props {
		data: number[];
		labels: string[];
		color?: string;
		height?: number;
	}

	let { data, labels, color = '#3b82f6', height = 300 }: Props = $props();

	let svgWidth = $state(0);
	let tooltip = $state<{ x: number; y: number; value: number; label: string } | null>(null);

	const padding = { top: 20, right: 20, bottom: 40, left: 40 };

	const min = 0;
	const max = $derived(Math.max(...data) * 1.1 || 100);

	const points = $derived(
		data.map((val, i) => {
			const x = padding.left + (i / (data.length - 1)) * (svgWidth - padding.left - padding.right);
			const y =
				height -
				padding.bottom -
				((val - min) / (max - min)) * (height - padding.top - padding.bottom);
			return { x, y, value: val, label: labels[i] };
		})
	);

	const pathData = $derived(
		points.length > 0
			? `M ${points[0].x} ${points[0].y} ` +
					points
						.slice(1)
						.map((p) => `L ${p.x} ${p.y}`)
						.join(' ')
			: ''
	);

	const areaData = $derived(
		points.length > 0
			? `${pathData} L ${points[points.length - 1].x} ${height - padding.bottom} L ${points[0].x} ${height - padding.bottom} Z`
			: ''
	);

	function handleMouseMove(e: MouseEvent) {
		const svg = e.currentTarget as SVGSVGElement;
		const rect = svg.getBoundingClientRect();
		const mouseX = e.clientX - rect.left;

		// Find closest point
		let closest = points[0];
		let minDist = Math.abs(mouseX - points[0].x);

		for (const p of points) {
			const dist = Math.abs(mouseX - p.x);
			if (dist < minDist) {
				minDist = dist;
				closest = p;
			}
		}

		tooltip = closest;
	}

	function handleMouseLeave() {
		tooltip = null;
	}
</script>

<div class="relative w-full" bind:clientWidth={svgWidth}>
	<svg
		{height}
		width={svgWidth}
		onmousemove={handleMouseMove}
		onmouseleave={handleMouseLeave}
		class="overflow-visible"
	>
		<!-- Grid Lines -->
		{#each Array(5) as _, i}
			{@const y = padding.top + (i / 4) * (height - padding.top - padding.bottom)}
			<line
				x1={padding.left}
				x2={svgWidth - padding.right}
				y1={y}
				y2={y}
				class="stroke-slate-100 dark:stroke-slate-800"
				stroke-dasharray="4"
			/>
		{/each}

		<!-- X-Axis Labels -->
		{#each points as p, i}
			{#if i % Math.ceil(points.length / 6) === 0}
				<text
					x={p.x}
					y={height - 10}
					text-anchor="middle"
					class="fill-slate-400 text-[10px] font-medium"
				>
					{p.label}
				</text>
			{/if}
		{/each}

		<!-- Area -->
		<path d={areaData} fill={color} fill-opacity="0.1" />

		<!-- Line -->
		<path
			d={pathData}
			fill="none"
			stroke={color}
			stroke-width="3"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>

		<!-- Points -->
		{#each points as p}
			<circle
				cx={p.x}
				cy={p.y}
				r="4"
				fill="white"
				stroke={color}
				stroke-width="2"
				class="transition-all duration-200 {tooltip?.label === p.label
					? 'opacity-100'
					: 'opacity-0'}"
			/>
		{/each}

		<!-- Tooltip Line -->
		{#if tooltip}
			<line
				x1={tooltip.x}
				x2={tooltip.x}
				y1={padding.top}
				y2={height - padding.bottom}
				stroke={color}
				stroke-width="1"
				stroke-dasharray="4"
			/>
		{/if}
	</svg>

	{#if tooltip}
		<div
			class="pointer-events-none absolute z-10 flex flex-col gap-1 rounded-lg border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-700 dark:bg-slate-800"
			style="left: {tooltip.x}px; top: {tooltip.y - 10}px; transform: translate(-50%, -100%)"
		>
			<span class="text-[10px] font-bold text-slate-500 uppercase">{tooltip.label}</span>
			<span class="text-sm font-black text-slate-900 dark:text-slate-100">
				IDR {tooltip.value.toLocaleString()}
			</span>
		</div>
	{/if}
</div>
