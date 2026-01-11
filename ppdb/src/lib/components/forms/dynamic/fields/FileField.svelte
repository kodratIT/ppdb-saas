<script lang="ts">
	import { Input } from '$lib/components/ui';
	import { Label } from '$lib/components/ui';
	import type { customFieldSchema } from '$lib/server/domain/form-builder.schema';
	import type { z } from 'zod';

	type CustomField = z.infer<typeof customFieldSchema>;

	let {
		field,
		value = $bindable(),
		error
	}: {
		field: CustomField;
		value: FileList | undefined;
		error?: string;
	} = $props();

	function handleChange(e: Event) {
		const target = e.target as HTMLInputElement;
		value = target.files ?? undefined;
	}
</script>

<div class="grid w-full items-center gap-1.5">
	<Label for={field.key} class={error ? 'text-destructive' : ''}>
		{field.label}
		{#if field.required}
			<span class="text-destructive">*</span>
		{/if}
	</Label>
	<input
		type="file"
		id={field.key}
		name={field.key}
		onchange={handleChange}
		aria-invalid={!!error}
		aria-describedby={error
			? `${field.key}-error`
			: field.helpText
				? `${field.key}-help`
				: undefined}
		class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
	/>
	{#if error}
		<p id="{field.key}-error" class="text-xs font-medium text-destructive">
			{error}
		</p>
	{:else if field.helpText}
		<p id="{field.key}-help" class="text-xs text-muted-foreground">
			{field.helpText}
		</p>
	{/if}
</div>
