<script lang="ts">
	import { Select, SelectContent, SelectItem, SelectTrigger } from '$lib/components/ui/select';
	import FormField from './form-field.svelte';

	interface Option {
		value: string;
		label: string;
	}

	interface Props {
		label: string;
		value?: string;
		options: Option[];
		placeholder?: string;
		required?: boolean;
		error?: string | string[];
		helpText?: string;
		loading?: boolean;
		disabled?: boolean;
		id?: string;
		onValueChange?: (value: string) => void;
	}

	let {
		label,
		value = '',
		options = [],
		placeholder = 'Select an option',
		required = false,
		error,
		helpText,
		loading = false,
		disabled = false,
		id,
		onValueChange
	}: Props = $props();

	const selectedLabel = $derived(() => {
		if (loading) return 'Loading...';
		if (!value) return placeholder;
		const option = options.find((opt) => opt.value === value);
		return option?.label || placeholder;
	});

	function handleValueChange(newValue: string) {
		onValueChange?.(newValue);
	}
</script>

<FormField {label} {required} {error} {helpText} {id}>
	<Select type="single" {value} onValueChange={handleValueChange} disabled={disabled || loading}>
		<SelectTrigger
			{id}
			class="{error ? 'border-destructive' : ''} {loading ? 'animate-pulse' : ''}"
		>
			{#if loading}
				<div class="flex items-center gap-2">
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
					<span>Loading...</span>
				</div>
			{:else}
				{selectedLabel()}
			{/if}
		</SelectTrigger>
		<SelectContent>
			{#each options as option (option.value)}
				<SelectItem value={option.value}>{option.label}</SelectItem>
			{/each}
			{#if options.length === 0 && !loading}
				<div class="px-2 py-1.5 text-sm text-muted-foreground">No options available</div>
			{/if}
		</SelectContent>
	</Select>
</FormField>
