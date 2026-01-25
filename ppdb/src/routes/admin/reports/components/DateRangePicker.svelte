<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Calendar, ChevronDown } from 'lucide-svelte';
	import { i18n } from '$lib/i18n/index.svelte';

	let { value, onChange }: {
		value: { from: Date; to: Date };
		onChange: (range: { from: Date; to: Date }) => void;
	} = $props();

	let showDropdown = $state(false);

	const presets = [
		{
			label: i18n.t('admin.reports.last7Days'),
			from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
			to: new Date()
		},
		{
			label: i18n.t('admin.reports.last30Days'),
			from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
			to: new Date()
		},
		{
			label: i18n.t('admin.reports.thisMonth'),
			from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
			to: new Date()
		},
		{
			label: i18n.t('admin.reports.lastMonth'),
			from: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
			to: new Date(new Date().getFullYear(), new Date().getMonth(), 0)
		}
	];

	function applyPreset(preset: { from: Date; to: Date }) {
		value = preset;
		onChange?.(value);
		showDropdown = false;
	}

	function formatDate(date: Date): string {
		return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
	}
</script>

<div class="relative">
	<Button
		variant="outline"
		class="gap-2"
		onclick={() => showDropdown = !showDropdown}
	>
		<Calendar class="h-4 w-4" />
		<span class="hidden sm:inline">
			{formatDate(value.from)} - {formatDate(value.to)}
		</span>
		<span class="sm:hidden">{i18n.t('admin.reports.dateRange')}</span>
		<ChevronDown class="h-4 w-4" />
	</Button>

	{#if showDropdown}
		<div class="absolute top-full mt-2 right-0 z-50 w-48 bg-popover border rounded-md shadow-lg p-1 dropdown-content">
			{#each presets as preset}
				<button
					class="flex w-full rounded px-2 py-1.5 text-sm hover:bg-accent text-left"
					onclick={() => applyPreset(preset)}
				>
					{preset.label}
				</button>
			{/each}
		</div>
	{/if}
</div>
