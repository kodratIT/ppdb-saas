<script lang="ts">
	interface Step {
		label: string;
		value: number;
		color: string;
	}

	interface Props {
		steps: Step[];
	}

	let { steps }: Props = $props();

	const max = $derived(steps[0]?.value || 100);

	function calculatePercentage(value: number) {
		return Math.round((value / max) * 100);
	}

	function calculateDropoff(current: number, previous: number) {
		if (previous === 0) return 0;
		return Math.round(((previous - current) / previous) * 100);
	}
</script>

<div class="space-y-6">
	{#each steps as step, i}
		<div class="relative">
			<div class="mb-2 flex items-end justify-between">
				<div class="space-y-1">
					<span class="text-[10px] font-bold uppercase tracking-wider text-slate-400"
						>Step {i + 1}</span
					>
					<h4 class="text-sm font-black text-slate-900 dark:text-slate-100">{step.label}</h4>
				</div>
				<div class="text-right">
					<span class="text-lg font-black text-slate-900 dark:text-slate-100"
						>{step.value.toLocaleString()}</span
					>
					<span class="ml-1 text-[10px] font-bold text-slate-400"
						>({calculatePercentage(step.value)}%)</span
					>
				</div>
			</div>

			<div class="h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
				<div
					class="h-full rounded-full transition-all duration-1000 ease-out {step.color}"
					style="width: {calculatePercentage(step.value)}%"
				></div>
			</div>

			{#if i < steps.length - 1}
				{@const dropoff = calculateDropoff(steps[i + 1].value, step.value)}
				<div class="absolute -bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-2">
					<div class="h-4 w-[1px] bg-slate-200 dark:bg-slate-700"></div>
					<span class="text-[10px] font-bold text-rose-500">-{dropoff}% drop-off</span>
					<div class="h-4 w-[1px] bg-slate-200 dark:bg-slate-700"></div>
				</div>
			{/if}
		</div>
		{#if i < steps.length - 1}
			<div class="h-4"></div>
		{/if}
	{/each}
</div>
