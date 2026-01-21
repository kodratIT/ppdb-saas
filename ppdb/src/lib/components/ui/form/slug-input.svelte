<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import FormField from './form-field.svelte';

	interface Props {
		value: string;
		sourceValue?: string;
		type?: 'school' | 'foundation';
		label?: string;
		error?: string | string[];
		required?: boolean;
		id?: string;
		domain?: string;
		onCheck?: (slug: string) => Promise<boolean>;
		oninput?: (e: Event) => void;
	}

	let {
		value = $bindable(''),
		sourceValue = '',
		type = 'school',
		label = 'Slug',
		error,
		required = false,
		id = 'slug',
		domain = 'ppdb.id',
		onCheck,
		oninput
	}: Props = $props();

	let autoGenerate = $state(true);
	let isChecking = $state(false);
	let isAvailable = $state<boolean | null>(null);
	let checkError = $state<string | null>(null);
	let checkDebounceTimer: ReturnType<typeof setTimeout>;

	// Auto-generate slug from source value
	function slugify(text: string): string {
		return text
			.toLowerCase()
			.trim()
			.replace(/[^\w\s-]/g, '') // Remove special characters
			.replace(/[\s_-]+/g, '-') // Replace spaces, underscores with hyphens
			.replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
	}

	// Watch source value changes for auto-generation
	$effect(() => {
		if (autoGenerate && sourceValue) {
			const newSlug = slugify(sourceValue);
			if (newSlug !== value) {
				value = newSlug;
				checkSlugAvailability(newSlug);
			}
		}
	});

	async function checkSlugAvailability(slug: string) {
		if (!slug || !onCheck) {
			isAvailable = null;
			return;
		}

		clearTimeout(checkDebounceTimer);
		checkDebounceTimer = setTimeout(async () => {
			isChecking = true;
			checkError = null;
			try {
				isAvailable = await onCheck(slug);
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
		// Clean the input to only allow valid slug characters
		const cleanValue = target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
		value = cleanValue;
		autoGenerate = false;
		checkSlugAvailability(cleanValue);
		oninput?.(e);
	}

	function toggleAutoGenerate() {
		autoGenerate = !autoGenerate;
		if (autoGenerate && sourceValue) {
			value = slugify(sourceValue);
			checkSlugAvailability(value);
		}
	}

	const placeholder = $derived(type === 'foundation' ? 'yayasan-pendidikan' : 'sma-negeri-1');
</script>

<FormField {label} {required} {error} {id}>
	<!-- Auto-generate toggle -->
	{#if sourceValue}
		<div class="mb-2">
			<label class="flex items-center gap-2 text-sm cursor-pointer">
				<input
					type="checkbox"
					checked={autoGenerate}
					onchange={toggleAutoGenerate}
					class="rounded border-gray-300 text-primary focus:ring-primary"
				/>
				<span class="text-muted-foreground">Auto-generate from name</span>
			</label>
		</div>
	{/if}

	<!-- Slug input with domain suffix -->
	<div class="flex">
		<Input
			{id}
			type="text"
			{placeholder}
			{value}
			oninput={handleInput}
			disabled={autoGenerate && !!sourceValue}
			class="rounded-r-none border-r-0 {error ? 'border-destructive' : ''} {autoGenerate &&
			sourceValue
				? 'bg-muted text-muted-foreground'
				: ''}"
		/>
		<div
			class="flex items-center px-3 bg-muted border border-l-0 border-input rounded-r-md text-sm text-muted-foreground"
		>
			.{domain}
		</div>
	</div>

	<!-- Availability status -->
	{#if value && onCheck && !error && value.length >= 3}
		<div class="mt-1.5 flex items-center gap-1.5 text-xs">
			{#if isChecking}
				<svg class="w-3.5 h-3.5 animate-spin text-muted-foreground" viewBox="0 0 24 24">
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
				<span class="text-muted-foreground">Checking availability...</span>
			{:else if checkError}
				<svg
					class="w-3.5 h-3.5 text-yellow-500"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
					/>
				</svg>
				<span class="text-yellow-600 dark:text-yellow-400">{checkError}</span>
			{:else if isAvailable === true}
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
				<span class="text-green-600 dark:text-green-400">Available</span>
			{:else if isAvailable === false}
				<svg class="w-3.5 h-3.5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M6 18L18 6M6 6l12 12"
					/>
				</svg>
				<span class="text-red-600 dark:text-red-400">This slug is already taken</span>
			{/if}
		</div>
	{/if}

	<!-- Subdomain preview -->
	{#if value}
		<p class="mt-1 text-xs text-muted-foreground">
			Your {type === 'foundation' ? 'foundation' : 'school'}'s subdomain:
			<strong class="text-foreground">{value}.{domain}</strong>
		</p>
	{/if}
</FormField>
