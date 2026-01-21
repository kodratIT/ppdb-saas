<script lang="ts">
	/* eslint-disable svelte/require-each-key */
	/* eslint-disable svelte/no-navigation-without-resolve */
	import type { PageData } from './$types';
	import Badge from '$lib/components/ui/badge.svelte';
	import { Select, SelectContent, SelectItem, SelectTrigger } from '$lib/components/ui';
	import { goto } from '$app/navigation';
	import AdminPageHeader from '$lib/components/admin/AdminPageHeader.svelte';
	import { i18n } from '$lib/i18n/index.svelte';

	let { data }: { data: PageData } = $props();

	let selectedUnitId = $state(data.selectedUnitId);

	let selectedUnitLabel = $derived(
		data.units.find((u: any) => u.id === selectedUnitId)?.name ||
			i18n.t('admin.verification.allUnits')
	);

	function handleUnitChange(value: string | undefined) {
		if (!value) return;
		selectedUnitId = value;
		const url = new URL(window.location.href);
		if (value === 'all') {
			url.searchParams.delete('unit_id');
		} else {
			url.searchParams.set('unit_id', value);
		}
		goto(url.toString());
	}
</script>

<AdminPageHeader
	title={i18n.t('admin.verification.title')}
	description={i18n.t('admin.verification.subtitle')}
>
	{#snippet actions()}
		<div class="flex items-center gap-2">
			<span class="text-sm font-medium text-muted-foreground whitespace-nowrap"
				>{i18n.t('admin.verification.filterUnit')}</span
			>
			<Select type="single" value={selectedUnitId} onValueChange={handleUnitChange}>
				<SelectTrigger class="w-[200px]">
					{selectedUnitLabel}
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="all">{i18n.t('admin.verification.allUnits')}</SelectItem>
					{#each data.units as unit}
						<SelectItem value={unit.id}>{unit.name}</SelectItem>
					{/each}
				</SelectContent>
			</Select>
		</div>
	{/snippet}
</AdminPageHeader>

<div class="space-y-6">
	<div
		class="bg-card/50 backdrop-blur-sm shadow-premium rounded-xl overflow-hidden border-none ring-1 ring-border"
	>
		{#if data.queue.length === 0}
			<div class="py-20 text-center text-slate-500">
				<p class="font-medium text-lg">{i18n.t('admin.verification.noPending')}</p>
				<p class="text-sm">{i18n.t('admin.verification.everythingUpToDate')}</p>
			</div>
		{:else}
			<table class="table-modern">
				<thead>
					<tr>
						<th class="pl-8">{i18n.t('admin.verification.submissionDate')}</th>
						<th>{i18n.t('admin.verification.applicantDetails')}</th>
						<th>{i18n.t('admin.verification.programPath')}</th>
						<th>{i18n.t('admin.verification.status')}</th>
						<th>{i18n.t('admin.verification.documents')}</th>
						<th class="text-right pr-8">{i18n.t('admin.verification.actions')}</th>
					</tr>
				</thead>
				<tbody>
					{#each data.queue as app, i}
						<tr class="animate-in-fade" style="animation-delay: {i * 40}ms">
							<td class="pl-8 text-sm text-slate-600 font-medium">
								{new Date(app.submittedAt || app.updatedAt).toLocaleDateString(
									i18n.language === 'id' ? 'id-ID' : 'en-US',
									{
										day: 'numeric',
										month: 'short',
										year: 'numeric'
									}
								)}
							</td>
							<td>
								<div class="font-bold text-slate-900">{app.childFullName}</div>
								<div class="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
									{i18n.t('admin.verification.by', { parent: app.parentFullName })}
								</div>
							</td>
							<td>
								<Badge
									variant="secondary"
									class="bg-blue-50 text-blue-700 border-none font-bold uppercase text-[10px] px-2.5 py-1"
								>
									{app.admissionPath.name}
								</Badge>
							</td>
							<td>
								<Badge
									variant="outline"
									class="border-slate-200 text-slate-600 font-bold uppercase text-[10px] px-2.5 py-1"
								>
									{app.status}
								</Badge>
							</td>
							<td>
								<div class="flex flex-col">
									<span class="text-sm font-bold text-slate-700"
										>{i18n.t('admin.verification.files', { count: app.documents.length })}</span
									>
									<span class="text-[10px] font-bold text-emerald-600 uppercase tracking-tighter">
										{i18n.t('admin.verification.verified', {
											count: app.documents.filter((d: any) => d.status === 'verified').length
										})}
									</span>
								</div>
							</td>
							<td class="text-right pr-8">
								<a
									href="/admin/verification/{app.id}"
									class="inline-flex items-center px-4 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 shadow-md shadow-blue-500/10 transition-all uppercase tracking-wider"
								>
									{i18n.t('admin.verification.process')}
								</a>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		{/if}
	</div>
</div>
