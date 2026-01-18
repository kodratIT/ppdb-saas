<script lang="ts">
	import { Check } from 'lucide-svelte';
	import { cn } from '$lib/utils';

	let { steps = [], currentStep = 1 } = $props<{
		steps: string[];
		currentStep: number;
	}>();
</script>

<div class="w-full px-2 pb-8 pt-2">
	<div class="relative flex w-full items-center justify-between">
		<!-- Progress Bar Background -->
		<div
			class="absolute left-0 top-1/2 -z-0 h-1 w-full -translate-y-1/2 rounded-full bg-muted"
		></div>

		<!-- Active Progress Bar -->
		<div
			class="absolute left-0 top-1/2 -z-0 h-1 -translate-y-1/2 rounded-full bg-primary transition-all duration-500 ease-in-out"
			style="width: {steps.length > 1
				? (Math.max(0, currentStep - 1) / (steps.length - 1)) * 100
				: 0}%"
		></div>

		<!-- Steps -->
		{#each steps as step, i}
			{@const stepNum = i + 1}
			{@const isActive = stepNum === currentStep}
			{@const isCompleted = stepNum < currentStep}

			<div class="group relative z-10 flex flex-col items-center justify-center">
				<div
					class={cn(
						'flex h-10 w-10 items-center justify-center rounded-full border-2 bg-background text-sm font-semibold transition-all duration-300 ease-in-out',
						isActive &&
							'border-primary bg-primary text-primary-foreground scale-110 shadow-[0_0_20px_rgba(var(--primary),0.3)] ring-4 ring-primary/20',
						isCompleted && 'border-primary bg-primary text-primary-foreground',
						!isActive && !isCompleted && 'border-muted text-muted-foreground bg-background'
					)}
				>
					{#if isCompleted}
						<Check class="h-5 w-5 animate-in zoom-in duration-300" strokeWidth={3} />
					{:else}
						<span class={cn('transition-colors duration-300', isActive && 'scale-110')}>
							{stepNum}
						</span>
					{/if}
				</div>

				<!-- Label -->
				<div
					class={cn(
						'absolute -bottom-8 w-32 text-center text-xs font-medium transition-all duration-300',
						isActive ? 'text-primary -translate-y-1 font-bold' : 'text-muted-foreground',
						isCompleted && 'text-primary/80'
					)}
				>
					{step}
				</div>
			</div>
		{/each}
	</div>
</div>
