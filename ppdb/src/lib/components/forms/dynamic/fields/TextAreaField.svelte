<script lang="ts">
	import { Textarea } from '$lib/components/ui';
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
		value: string | undefined;
		error?: string;
	} = $props();
</script>

<div class="grid w-full items-center gap-1.5">
	<Label for={field.key} class={error ? 'text-destructive' : ''}>
		{field.label}
		{#if field.required}
			<span class="text-destructive">*</span>
		{/if}
	</Label>
	<Textarea
		id={field.key}
		name={field.key}
		placeholder={field.placeholder ?? ''}
		bind:value
		aria-invalid={!!error}
		aria-describedby={error
			? `${field.key}-error`
			: field.helpText
				? `${field.key}-help`
				: undefined}
		class={error ? 'border-destructive focus-visible:ring-destructive' : ''}
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
