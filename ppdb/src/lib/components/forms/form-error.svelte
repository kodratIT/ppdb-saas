<script lang="ts">
	interface Props {
		errors?: Record<string, string[]> | null;
		field: string;
	}

	let { errors = null, field }: Props = $props();
</script>

{#if errors?.[field]?.[0]}
	<p class="text-red-500 text-sm mt-1">{errors[field][0]}</p>
{/if}

