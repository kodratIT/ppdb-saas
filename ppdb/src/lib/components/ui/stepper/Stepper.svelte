<script lang="ts">
	interface Props {
		currentStep: number;
		totalSteps: number;
		steps?: string[];
	}

	let { currentStep = 1, totalSteps = 4, steps = [] }: Props = $props();

	const defaultSteps = ['Identity', 'Location', 'Admin', 'Review'];
	const stepLabels = steps.length > 0 ? steps : defaultSteps.slice(0, totalSteps);
</script>

<div class="w-full py-4">
	<div class="flex items-center justify-between">
		{#each Array(totalSteps) as _, index}
			{@const stepNumber = index + 1}
			{@const isActive = stepNumber === currentStep}
			{@const isCompleted = stepNumber < currentStep}

			<div class="flex flex-1 items-center">
				<!-- Step Circle -->
				<div class="flex flex-col items-center">
					<div
						class="flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all {isCompleted
							? 'border-primary bg-primary text-primary-foreground'
							: isActive
								? 'border-primary bg-primary text-primary-foreground'
								: 'border-muted-foreground bg-background text-muted-foreground'}"
					>
						{#if isCompleted}
							<svg
								class="h-5 w-5"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M5 13l4 4L19 7"
								></path>
							</svg>
						{:else}
							<span class="text-sm font-semibold">{stepNumber}</span>
						{/if}
					</div>
					<span
						class="mt-2 text-xs font-medium {isActive || isCompleted
							? 'text-primary'
							: 'text-muted-foreground'}"
					>
						{stepLabels[index]}
					</span>
				</div>

				<!-- Connector Line -->
				{#if index < totalSteps - 1}
					<div
						class="mx-2 h-0.5 flex-1 transition-all {isCompleted
							? 'bg-primary'
							: 'bg-muted-foreground/30'}"
					></div>
				{/if}
			</div>
		{/each}
	</div>
</div>
