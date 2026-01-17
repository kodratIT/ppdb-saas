<script lang="ts">
	/* eslint-disable @typescript-eslint/no-unused-vars */
	import { createEventDispatcher, onMount } from 'svelte';

	let {
		length = 6,
		value = $bindable(''),
		disabled = false,
		error = false
	}: {
		length?: number;
		value?: string;
		disabled?: boolean;
		error?: boolean;
	} = $props();

	const dispatch = createEventDispatcher();

	let inputs = $state<HTMLInputElement[]>([]);
	let digits = $state<string[]>(Array(length).fill(''));

	// Sync internal digits with external value
	$effect(() => {
		if (value && value.length > 0) {
			const valueDigits = value.split('').slice(0, length);
			digits = [...valueDigits, ...Array(length - valueDigits.length).fill('')];
		}
	});

	// Update external value when digits change
	$effect(() => {
		const newValue = digits.join('');
		if (newValue !== value) {
			value = newValue;
			if (newValue.length === length) {
				dispatch('complete', newValue);
			}
		}
	});

	function handleInput(index: number, event: Event) {
		const input = event.target as HTMLInputElement;
		const inputValue = input.value;

		// Only allow digits
		const sanitized = inputValue.replace(/[^0-9]/g, '');

		if (sanitized.length > 0) {
			digits[index] = sanitized[sanitized.length - 1];

			// Auto-focus next input
			if (index < length - 1 && inputs[index + 1]) {
				inputs[index + 1].focus();
				inputs[index + 1].select();
			}
		} else {
			digits[index] = '';
		}
	}

	function handleKeydown(index: number, event: KeyboardEvent) {
		const input = event.target as HTMLInputElement;

		if (event.key === 'Backspace') {
			if (!input.value && index > 0) {
				// Move to previous input on backspace if current is empty
				inputs[index - 1]?.focus();
				inputs[index - 1]?.select();
			} else {
				digits[index] = '';
			}
		} else if (event.key === 'ArrowLeft' && index > 0) {
			inputs[index - 1]?.focus();
			inputs[index - 1]?.select();
		} else if (event.key === 'ArrowRight' && index < length - 1) {
			inputs[index + 1]?.focus();
			inputs[index + 1]?.select();
		} else if (event.key === 'Delete') {
			digits[index] = '';
		}
	}

	function handlePaste(event: ClipboardEvent) {
		event.preventDefault();
		const pastedData = event.clipboardData?.getData('text') || '';
		const pastedDigits = pastedData
			.replace(/[^0-9]/g, '')
			.split('')
			.slice(0, length);

		if (pastedDigits.length > 0) {
			digits = [...pastedDigits, ...Array(Math.max(0, length - pastedDigits.length)).fill('')];

			// Focus the next empty input or last input
			const nextEmptyIndex = digits.findIndex((d) => d === '');
			const focusIndex = nextEmptyIndex >= 0 ? nextEmptyIndex : length - 1;
			inputs[focusIndex]?.focus();
		}
	}

	onMount(() => {
		// Auto-focus first input
		if (inputs[0]) {
			inputs[0].focus();
		}
	});
</script>

<div class="flex gap-2 justify-center">
	{#each Array(length) as _, i (i)}
		<input
			bind:this={inputs[i]}
			type="text"
			inputmode="numeric"
			maxlength="1"
			value={digits[i]}
			{disabled}
			oninput={(e) => handleInput(i, e)}
			onkeydown={(e) => handleKeydown(i, e)}
			onpaste={handlePaste}
			class="w-12 h-14 text-center text-2xl font-bold border-2 rounded-lg transition-all duration-200
				{error
				? 'border-red-500 bg-red-50 focus:border-red-600 focus:ring-red-500'
				: 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'}
				{disabled ? 'opacity-50 cursor-not-allowed bg-gray-100' : 'bg-white'}
				focus:outline-none"
			aria-label={`Digit ${i + 1}`}
		/>
	{/each}
</div>

<style>
	/* Remove number input spinners */
	input[type='text']::-webkit-inner-spin-button,
	input[type='text']::-webkit-outer-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}

	input[type='text'] {
		-moz-appearance: textfield;
	}
</style>
