<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Download, ChevronDown } from 'lucide-svelte';
	import { i18n } from '$lib/i18n/index.svelte';

	let { data, dateRange }: {
		data: any;
		dateRange: { from: Date; to: Date };
	} = $props();

	let showDropdown = $state(false);

	const formats = [
		{ id: 'csv', label: i18n.t('admin.reports.exportCsv'), icon: '📄' },
		{ id: 'excel', label: i18n.t('admin.reports.exportExcel'), icon: '📊' },
		{ id: 'pdf', label: i18n.t('admin.reports.exportPdf'), icon: '📑' }
	];

	async function handleExport(format: string) {
		const params = new URLSearchParams({
			from: dateRange.from.toISOString(),
			to: dateRange.to.toISOString(),
			format
		});

		try {
			const response = await fetch(`/api/admin/reports/export?${params.toString()}`);
			if (!response.ok) throw new Error('Export failed');

			const blob = await response.blob();
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `report-${format}-${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : format}`;
			document.body.appendChild(a);
			a.click();
			window.URL.revokeObjectURL(url);
			document.body.removeChild(a);
			showDropdown = false;
		} catch (error) {
			console.error('Export error:', error);
		}
	}
</script>

<div class="relative">
	<Button
		variant="outline"
		class="gap-2"
		onclick={() => showDropdown = !showDropdown}
	>
		<Download class="h-4 w-4" />
		<span class="hidden sm:inline">{i18n.t('admin.reports.export')}</span>
		<ChevronDown class="h-4 w-4" />
	</Button>

	{#if showDropdown}
		<div class="absolute top-full mt-2 right-0 z-50 w-48 bg-popover border rounded-md shadow-lg p-1 dropdown-content">
			{#each formats as format}
				<button
					class="flex w-full rounded px-2 py-1.5 text-sm hover:bg-accent text-left"
					onclick={() => handleExport(format.id)}
				>
					<span class="mr-2">{format.icon}</span>
					{format.label}
				</button>
			{/each}
		</div>
	{/if}
</div>
