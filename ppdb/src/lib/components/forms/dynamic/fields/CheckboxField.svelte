<script lang="ts">
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
		value: boolean | undefined;
		error?: string;
	} = $props();
</script>

<div class="flex flex-col gap-1.5">
	<div class="flex items-center space-x-2">
		<input
			type="checkbox"
			id={field.key}
			name={field.key}
			bind:checked={value}
			class="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
		/>
		<Label for={field.key} class={error ? 'text-destructive' : ''}>
			{field.label}
			{#if field.required}
				<span class="text-destructive">*</span>
			{/if}
		</Label>
	</div>
	{#if error}
		<p id="{field.key}-error" class="text-xs font-medium text-destructive">
			{error}
		</p>
	{:else if field.helpText}
		<p id="{field.key}-help" class="ml-6 text-xs text-muted-foreground">
			{field.helpText}
		</p>
	{/if}
</div>
