<script lang="ts">
	import Button from '$lib/components/ui/button.svelte';
	import { Download, Loader2 } from 'lucide-svelte';
	import { enhance } from '$app/forms';
	import { toast } from '$lib/utils/toast';
	import { generateSchoolsCSV, downloadCSV } from '$lib/utils/export';

	interface Props {
		search?: string;
		status?: string;
	}

	let { search, status }: Props = $props();

	let loading = $state(false);

	async function handleExport() {
		loading = true;

		try {
			// Build URL with current filters
			const params = new URLSearchParams();
			if (search) params.set('search', search);
			if (status && status !== 'all') params.set('status', status);

			const response = await fetch(`?/exportSchools&${params.toString()}`, {
				method: 'POST'
			});

			const result = await response.json();

			if (result.type === 'success' && result.data?.schools) {
				const csv = generateSchoolsCSV(result.data.schools);
				const timestamp = new Date().toISOString().split('T')[0];
				const filename = `schools-export-${timestamp}.csv`;

				downloadCSV(csv, filename);
				toast.success(`Exported ${result.data.count} school(s) successfully`);
			} else {
				toast.error(result.data?.error?.message || 'Export failed');
			}
		} catch (error) {
			console.error('Export error:', error);
			toast.error('Failed to export schools');
		} finally {
			loading = false;
		}
	}
</script>

<Button
	variant="outline"
	size="sm"
	onclick={handleExport}
	disabled={loading}
	class="w-full sm:w-auto"
>
	{#if loading}
		<Loader2 class="mr-2 h-4 w-4 animate-spin" />
		Exporting...
	{:else}
		<Download class="mr-2 h-4 w-4" />
		Export CSV
	{/if}
</Button>
