<script lang="ts">
	import { Label } from '$lib/components/ui/label';
	import type { Snippet } from 'svelte';

	interface Props {
		label: string;
		required?: boolean;
		error?: string | string[];
		helpText?: string;
		id?: string;
		class?: string;
		children: Snippet;
	}

	let {
		label,
		required = false,
		error,
		helpText,
		id,
		class: className = '',
		children
	}: Props = $props();

	// Handle both string and string[] error types
	const errorMessage = $derived(() => {
		if (!error) return '';
		if (Array.isArray(error)) return error[0] || '';
		return error;
	});
</script>

<div class="space-y-2 {className}">
	<Label for={id} class="flex items-center gap-1">
		{label}
		{#if required}
			<span class="text-destructive">*</span>
		{/if}
	</Label>
	{@render children()}
	{#if errorMessage()}
		<p class="text-sm text-destructive animate-in fade-in slide-in-from-top-1 duration-200">
			{errorMessage()}
		</p>
	{/if}
	{#if helpText && !errorMessage()}
		<p class="text-xs text-muted-foreground">
			{helpText}
		</p>
	{/if}
</div>
