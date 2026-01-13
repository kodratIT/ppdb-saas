<script lang="ts">
	interface Props {
		value: number;
		disabled?: boolean;
		onchange: (value: number) => void;
	}

	let { value = $bindable(0), disabled = false, onchange }: Props = $props();

	const scoreColor = $derived(() => {
		if (value >= 80) return 'text-green-600 border-green-500';
		if (value >= 60) return 'text-yellow-600 border-yellow-500';
		return 'text-red-600 border-red-500';
	});

	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		const newValue = parseInt(target.value) || 0;
		const clamped = Math.max(0, Math.min(100, newValue));
		value = clamped;
		onchange(clamped);
	}
</script>

<div class="score-input">
	<label for="score" class="block text-sm font-medium text-gray-700 mb-2">
		Score (0-100) <span class="text-red-500">*</span>
	</label>
	<div class="relative">
		<input
			type="number"
			id="score"
			min="0"
			max="100"
			{value}
			{disabled}
			oninput={handleInput}
			class="w-full px-4 py-3 text-2xl font-bold text-center rounded-lg border-2 transition-colors
        {scoreColor()}
        disabled:bg-gray-100 disabled:cursor-not-allowed
        focus:ring-2 focus:ring-blue-500"
		/>
		<div class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-normal">
			/ 100
		</div>
	</div>
	<p class="text-xs text-gray-500 mt-1">
		{#if value >= 80}
			Excellent score
		{:else if value >= 60}
			Good score
		{:else}
			Needs improvement
		{/if}
	</p>
</div>

<style>
	input[type='number']::-webkit-inner-spin-button,
	input[type='number']::-webkit-outer-spin-button {
		opacity: 1;
	}
</style>
