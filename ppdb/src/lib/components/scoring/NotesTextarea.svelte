<script lang="ts">
	interface Props {
		value: string;
		disabled?: boolean;
		onchange: (value: string) => void;
	}

	let { value = $bindable(''), disabled = false, onchange }: Props = $props();

	const maxLength = 2000;
	const charCount = $derived(value?.length || 0);
	const remaining = $derived(maxLength - charCount);

	function handleInput(e: Event) {
		const target = e.target as HTMLTextAreaElement;
		value = target.value;
		onchange(target.value);
	}
</script>

<div class="notes-textarea">
	<label for="notes" class="block text-sm font-medium text-gray-700 mb-2">
		Qualitative Notes (Optional)
	</label>
	<textarea
		id="notes"
		rows="6"
		maxlength={maxLength}
		{value}
		{disabled}
		oninput={handleInput}
		placeholder="Enter interview observations, strengths, areas for improvement..."
		class="w-full px-4 py-3 rounded-lg border border-gray-300 resize-none
      focus:ring-2 focus:ring-blue-500 focus:border-transparent
      disabled:bg-gray-100 disabled:cursor-not-allowed"
	/>
	<div class="flex justify-between mt-1">
		<p class="text-xs text-gray-500">Optional qualitative feedback for committee review</p>
		<p class="text-xs" class:text-gray-500={remaining > 100} class:text-red-500={remaining <= 100}>
			{charCount} / {maxLength} characters
		</p>
	</div>
</div>
