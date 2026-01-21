<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import FormField from './form-field.svelte';

	interface Props {
		value: string;
		label?: string;
		error?: string | string[];
		showStrength?: boolean;
		placeholder?: string;
		id?: string;
		required?: boolean;
		helpText?: string;
		oninput?: (e: Event) => void;
	}

	let {
		value = $bindable(''),
		label = 'Password',
		error,
		showStrength = true,
		placeholder = 'Enter password',
		id = 'password',
		required = false,
		helpText,
		oninput
	}: Props = $props();

	let showPassword = $state(false);

	// Calculate password strength
	const strength = $derived(() => {
		if (!value) return { score: 0, label: '', color: '' };

		let score = 0;
		const checks = {
			length: value.length >= 6,
			hasNumber: /\d/.test(value),
			hasUpper: /[A-Z]/.test(value),
			hasLower: /[a-z]/.test(value),
			hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(value),
			isLong: value.length >= 10
		};

		if (checks.length) score += 1;
		if (checks.hasNumber) score += 1;
		if (checks.hasUpper) score += 1;
		if (checks.hasLower) score += 1;
		if (checks.hasSpecial) score += 1;
		if (checks.isLong) score += 1;

		let label = '';
		let color = '';

		if (score <= 2) {
			label = 'Weak';
			color = 'bg-red-500';
		} else if (score <= 4) {
			label = 'Medium';
			color = 'bg-yellow-500';
		} else {
			label = 'Strong';
			color = 'bg-green-500';
		}

		return { score, label, color, checks };
	});

	const requirements = [
		{ key: 'length', label: 'At least 6 characters' },
		{ key: 'hasNumber', label: 'Contains a number' },
		{ key: 'hasUpper', label: 'Contains uppercase letter' }
	];

	function togglePassword() {
		showPassword = !showPassword;
	}

	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		value = target.value;
		oninput?.(e);
	}
</script>

<FormField {label} {required} {error} {helpText} {id}>
	<div class="relative">
		<Input
			{id}
			type={showPassword ? 'text' : 'password'}
			{placeholder}
			{value}
			oninput={handleInput}
			class="pr-10 {error ? 'border-destructive' : ''}"
		/>
		<button
			type="button"
			onclick={togglePassword}
			class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
			tabindex="-1"
			aria-label={showPassword ? 'Hide password' : 'Show password'}
		>
			{#if showPassword}
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="18"
					height="18"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<path
						d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
					/>
					<line x1="1" y1="1" x2="23" y2="23" />
				</svg>
			{:else}
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="18"
					height="18"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
					<circle cx="12" cy="12" r="3" />
				</svg>
			{/if}
		</button>
	</div>

	{#if showStrength && value}
		<div class="mt-3 space-y-2">
			<!-- Strength Bar -->
			<div class="flex items-center gap-2">
				<span class="text-xs text-muted-foreground">Strength:</span>
				<div class="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
					<div
						class="h-full transition-all duration-300 {strength().color}"
						style="width: {(strength().score / 6) * 100}%"
					></div>
				</div>
				<span
					class="text-xs font-medium {strength().score <= 2
						? 'text-red-500'
						: strength().score <= 4
							? 'text-yellow-500'
							: 'text-green-500'}"
				>
					{strength().label}
				</span>
			</div>

			<!-- Requirements Checklist -->
			<div class="flex flex-wrap gap-x-4 gap-y-1">
				{#each requirements as req}
					{@const checks = strength().checks || {}}
					<div class="flex items-center gap-1.5 text-xs">
						{#if checks[req.key as keyof typeof checks]}
							<svg
								class="w-3.5 h-3.5 text-green-500"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M5 13l4 4L19 7"
								/>
							</svg>
							<span class="text-green-600 dark:text-green-400">{req.label}</span>
						{:else}
							<svg
								class="w-3.5 h-3.5 text-muted-foreground"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<circle cx="12" cy="12" r="10" stroke-width="2" />
							</svg>
							<span class="text-muted-foreground">{req.label}</span>
						{/if}
					</div>
				{/each}
			</div>
		</div>
	{/if}
</FormField>
