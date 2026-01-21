<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import FormField from './form-field.svelte';

	interface Props {
		value: string;
		label?: string;
		error?: string | string[];
		required?: boolean;
		id?: string;
		helpText?: string;
		placeholder?: string;
		excludeId?: string;
		onCheck?: (email: string) => Promise<boolean>;
		oninput?: (e: Event) => void;
	}

	let {
		value = $bindable(''),
		label = 'Email Address',
		error,
		required = false,
		id = 'email',
		helpText = 'This email will be used to log in to the admin dashboard.',
		placeholder = 'e.g., admin@school.sch.id',
		excludeId,
		onCheck,
		oninput
	}: Props = $props();

	let isChecking = $state(false);
	let isAvailable = $state<boolean | null>(null);
	let checkError = $state<string | null>(null);
	let checkDebounceTimer: ReturnType<typeof setTimeout>;

	// Basic email format validation
	function isValidEmailFormat(email: string): boolean {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	}

	async function checkEmailAvailability(email: string) {
		if (!email || !onCheck || !isValidEmailFormat(email)) {
			isAvailable = null;
			return;
		}

		clearTimeout(checkDebounceTimer);
		checkDebounceTimer = setTimeout(async () => {
			isChecking = true;
			checkError = null;
			try {
				isAvailable = await onCheck(email);
			} catch (err) {
				checkError = 'Failed to check availability';
				isAvailable = null;
			} finally {
				isChecking = false;
			}
		}, 500);
	}

	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		value = target.value;
		checkEmailAvailability(value);
		oninput?.(e);
	}

	// Format validation status
	const formatValid = $derived(value ? isValidEmailFormat(value) : null);
</script>

<FormField {label} {required} {error} helpText={!error && !isAvailable ? helpText : undefined} {id}>
	<div class="relative">
		<Input
			{id}
			type="email"
			{placeholder}
			{value}
			oninput={handleInput}
			class="pr-10 {error ? 'border-destructive' : ''}"
		/>

		<!-- Status Icon -->
		<div class="absolute right-3 top-1/2 -translate-y-1/2">
			{#if isChecking}
				<svg class="w-4 h-4 animate-spin text-muted-foreground" viewBox="0 0 24 24">
					<circle
						class="opacity-25"
						cx="12"
						cy="12"
						r="10"
						stroke="currentColor"
						stroke-width="4"
						fill="none"
					/>
					<path
						class="opacity-75"
						fill="currentColor"
						d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
					/>
				</svg>
			{:else if value && formatValid === false}
				<svg class="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
					/>
				</svg>
			{:else if isAvailable === true}
				<svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M5 13l4 4L19 7"
					/>
				</svg>
			{:else if isAvailable === false}
				<svg class="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M6 18L18 6M6 6l12 12"
					/>
				</svg>
			{/if}
		</div>
	</div>

	<!-- Availability/Format status -->
	{#if value && onCheck}
		<div class="mt-1.5 flex items-center gap-1.5 text-xs">
			{#if formatValid === false}
				<span class="text-yellow-600 dark:text-yellow-400">Please enter a valid email format</span>
			{:else if checkError}
				<span class="text-yellow-600 dark:text-yellow-400">{checkError}</span>
			{:else if isAvailable === true}
				<span class="text-green-600 dark:text-green-400">Email is available</span>
			{:else if isAvailable === false}
				<span class="text-red-600 dark:text-red-400">This email is already registered</span>
			{/if}
		</div>
	{/if}
</FormField>
