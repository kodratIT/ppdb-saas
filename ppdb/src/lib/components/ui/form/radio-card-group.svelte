<script lang="ts">
	import { RadioGroup, RadioGroupItem } from '$lib/components/ui/radio-group';
	import { Label } from '$lib/components/ui/label';
	import type { Component } from 'svelte';

	interface Option {
		value: string;
		label: string;
		description?: string;
		icon?: Component;
	}

	interface Props {
		label?: string;
		value: string;
		options: Option[];
		required?: boolean;
		error?: string | string[];
		helpText?: string;
		columns?: 1 | 2 | 3 | 4;
		onValueChange?: (value: string) => void;
	}

	let {
		label,
		value = $bindable(''),
		options = [],
		required = false,
		error,
		helpText,
		columns = 2,
		onValueChange
	}: Props = $props();

	// Handle error message display
	const errorMessage = $derived(() => {
		if (!error) return '';
		if (Array.isArray(error)) return error[0] || '';
		return error;
	});

	function handleChange(newValue: string) {
		value = newValue;
		onValueChange?.(newValue);
	}

	const gridClass = $derived(() => {
		switch (columns) {
			case 1:
				return 'grid-cols-1';
			case 2:
				return 'grid-cols-1 sm:grid-cols-2';
			case 3:
				return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
			case 4:
				return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
			default:
				return 'grid-cols-1 sm:grid-cols-2';
		}
	});
</script>

<div class="space-y-3">
	{#if label}
		<Label class="flex items-center gap-1">
			{label}
			{#if required}
				<span class="text-destructive">*</span>
			{/if}
		</Label>
	{/if}

	<RadioGroup {value} onValueChange={handleChange} class="grid {gridClass()} gap-3">
		{#each options as option (option.value)}
			{@const isSelected = value === option.value}
			<div
				class="relative flex cursor-pointer rounded-lg border-2 p-4 transition-all duration-200
					hover:bg-accent/50 hover:border-accent-foreground/20
					{isSelected ? 'border-primary bg-primary/5 ring-1 ring-primary/20' : 'border-input bg-card'}"
				role="button"
				tabindex="0"
				onclick={() => handleChange(option.value)}
				onkeydown={(e) => e.key === 'Enter' && handleChange(option.value)}
			>
				<div class="flex items-start gap-3 w-full">
					<RadioGroupItem value={option.value} id={`radio-${option.value}`} class="mt-0.5" />
					<div class="flex-1">
						<Label
							for={`radio-${option.value}`}
							class="text-sm font-medium cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
						>
							{option.label}
						</Label>
						{#if option.description}
							<p class="mt-1 text-xs text-muted-foreground">{option.description}</p>
						{/if}
					</div>
					{#if option.icon}
						<div class="text-muted-foreground {isSelected ? 'text-primary' : ''}">
							<svelte:component this={option.icon} class="w-5 h-5" />
						</div>
					{/if}
				</div>

				<!-- Check mark indicator -->
				{#if isSelected}
					<div
						class="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center animate-in zoom-in duration-200"
					>
						<svg
							class="w-3 h-3 text-primary-foreground"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="3"
								d="M5 13l4 4L19 7"
							/>
						</svg>
					</div>
				{/if}
			</div>
		{/each}
	</RadioGroup>

	{#if errorMessage()}
		<p class="text-sm text-destructive animate-in fade-in slide-in-from-top-1 duration-200">
			{errorMessage()}
		</p>
	{/if}

	{#if helpText && !errorMessage()}
		<p class="text-xs text-muted-foreground">{helpText}</p>
	{/if}
</div>
