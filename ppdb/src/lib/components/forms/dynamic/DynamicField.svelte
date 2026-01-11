<script lang="ts">
	import { fieldRegistry } from './registry';
	import type { customFieldSchema } from '$lib/server/domain/form-builder.schema';
	import type { z } from 'zod';

	type CustomField = z.infer<typeof customFieldSchema>;

	let {
		field,
		value = $bindable(),
		error
	}: {
		field: CustomField;
		value: any;
		error?: string;
	} = $props();

	const SelectedComponent = $derived(fieldRegistry[field.fieldType]);
</script>

{#if SelectedComponent}
	<SelectedComponent {field} bind:value {error} />
{:else}
	<div class="rounded-md border border-destructive p-4 text-sm text-destructive">
		Unknown field type: <strong>{field.fieldType}</strong>
	</div>
{/if}
