<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import { RadioGroup, RadioGroupItem } from '$lib/components/ui/radio-group';
	import Checkbox from '$lib/components/ui/checkbox.svelte';
	import Label from '$lib/components/ui/label.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import { Download, Loader2, FileJson, FileSpreadsheet, Settings2 } from 'lucide-svelte';
	import { toast } from '$lib/utils/toast';
	import { generateSchoolsCSV, downloadCSV } from '$lib/utils/export';
	import { i18n } from '$lib/i18n/index.svelte';

	interface Props {
		search?: string;
		status?: string;
		type?: string;
		timeframe?: string;
	}

	let { search, status, type, timeframe }: Props = $props();

	let loading = $state(false);
	let open = $state(false);
	let format = $state<'csv' | 'json'>('csv');

	const availableFields = $derived([
		{ id: 'id', label: i18n.t('common.id') },
		{ id: 'name', label: i18n.t('common.name') },
		{ id: 'slug', label: i18n.t('admin.register.slug') },
		{ id: 'type', label: i18n.t('admin.schools.type') },
		{ id: 'status', label: i18n.t('common.status') },
		{ id: 'appCount', label: i18n.t('admin.schools.applicantsStat') },
		{ id: 'paidInvoices', label: i18n.t('admin.schools.performanceStat') },
		{ id: 'createdAt', label: i18n.t('common.date') }
	]);

	let selectedFields = $state([
		'id',
		'name',
		'slug',
		'type',
		'status',
		'appCount',
		'paidInvoices',
		'createdAt'
	]);

	async function handleExport() {
		loading = true;

		try {
			const params = new URLSearchParams();
			if (search) params.set('search', search);
			if (status && status !== 'all') params.set('status', status);
			if (type && type !== 'all') params.set('type', type);
			if (timeframe && timeframe !== 'all') params.set('timeframe', timeframe);

			const response = await fetch(`?/exportSchools&${params.toString()}`, {
				method: 'POST'
			});

			const result = (await response.json()) as any;

			if (result.type === 'success' && result.data?.schools) {
				const schools = result.data.schools;

				// Filter fields
				const filteredData = schools.map((s: any) => {
					const obj: any = {};
					selectedFields.forEach((field) => {
						obj[field] = s[field];
					});
					return obj;
				});

				const timestamp = new Date().toISOString().split('T')[0];

				if (format === 'csv') {
					const csv = generateSchoolsCSV(filteredData);
					downloadCSV(csv, `schools-export-${timestamp}.csv`);
				} else {
					const json = JSON.stringify(filteredData, null, 2);
					const blob = new Blob([json], { type: 'application/json' });
					const url = URL.createObjectURL(blob);
					const a = document.createElement('a');
					a.href = url;
					a.download = `schools-export-${timestamp}.json`;
					document.body.appendChild(a);
					a.click();
					document.body.removeChild(a);
					URL.revokeObjectURL(url);
				}

				toast.success(
					i18n.t('messages.success.exported', { count: result.data.count }) ||
						`Exported ${result.data.count} successfully`
				);
				open = false;
			} else {
				toast.error(result.data?.error?.message || i18n.t('messages.error.generic'));
			}
		} catch (error) {
			console.error('Export error:', error);
			toast.error(i18n.t('messages.error.network'));
		} finally {
			loading = false;
		}
	}

	function toggleField(id: string) {
		if (selectedFields.includes(id)) {
			selectedFields = selectedFields.filter((f) => f !== id);
		} else {
			selectedFields = [...selectedFields, id];
		}
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger>
		<Button variant="outline" size="sm" class="h-10 px-4">
			<Download class="mr-2 h-4 w-4" />
			{i18n.t('common.export')}
		</Button>
	</Dialog.Trigger>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title>{i18n.t('common.export')} {i18n.t('nav.organizations')}</Dialog.Title>
			<Dialog.Description>
				{i18n.t('admin.schools.exportDescription')}
			</Dialog.Description>
		</Dialog.Header>

		<div class="space-y-6 py-4">
			<!-- Format Selection -->
			<div class="space-y-3">
				<h4 class="text-sm font-bold uppercase tracking-wider text-muted-foreground/70">
					{i18n.t('common.format')}
				</h4>
				<RadioGroup bind:value={format} class="grid grid-cols-2 gap-4">
					<Label
						for="csv"
						class="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary transition-all cursor-pointer"
					>
						<RadioGroupItem value="csv" id="csv" class="sr-only" />
						<FileSpreadsheet class="mb-3 h-6 w-6 text-emerald-600" />
						<span class="text-xs font-bold uppercase"
							>CSV {i18n.t('common.format' as any) || 'Format'}</span
						>
					</Label>
					<Label
						for="json"
						class="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary transition-all cursor-pointer"
					>
						<RadioGroupItem value="json" id="json" class="sr-only" />
						<FileJson class="mb-3 h-6 w-6 text-blue-600" />
						<span class="text-xs font-bold uppercase"
							>JSON {i18n.t('common.format' as any) || 'Format'}</span
						>
					</Label>
				</RadioGroup>
			</div>

			<!-- Field Selection -->
			<div class="space-y-3">
				<div class="flex items-center justify-between">
					<h4 class="text-sm font-bold uppercase tracking-wider text-muted-foreground/70">
						{i18n.t('common.columns' as any) || 'Include Fields'}
					</h4>
					<Button
						variant="ghost"
						size="sm"
						class="h-7 text-[10px] uppercase font-bold"
						onclick={() => (selectedFields = availableFields.map((f) => f.id))}
					>
						{i18n.t('actions.selectAll')}
					</Button>
				</div>
				<div class="grid grid-cols-2 gap-y-3 gap-x-4 p-4 rounded-xl bg-muted/30 border">
					{#each availableFields as field}
						<div class="flex items-center space-x-2">
							<Checkbox
								id={field.id}
								checked={selectedFields.includes(field.id)}
								onCheckedChange={() => toggleField(field.id)}
							/>
							<Label for={field.id} class="text-sm font-medium leading-none cursor-pointer">
								{field.label}
							</Label>
						</div>
					{/each}
				</div>
			</div>
		</div>

		<Dialog.Footer>
			<Button variant="ghost" onclick={() => (open = false)} disabled={loading}
				>{i18n.t('common.cancel')}</Button
			>
			<Button
				onclick={handleExport}
				disabled={loading || selectedFields.length === 0}
				class="min-w-32"
			>
				{#if loading}
					<Loader2 class="mr-2 h-4 w-4 animate-spin" />
					{i18n.t('messages.loading.processing')}
				{:else}
					<Download class="mr-2 h-4 w-4" />
					{i18n.t('common.download')}
					{format.toUpperCase()}
				{/if}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
