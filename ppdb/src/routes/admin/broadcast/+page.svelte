<script lang="ts">
	import type { ActionData, PageData } from './$types';
	import { i18n } from '$lib/i18n/index.svelte';
	import BroadcastForm from '$lib/components/admin/BroadcastForm.svelte';
	import BroadcastHistory from '$lib/components/admin/BroadcastHistory.svelte';
	import BroadcastAnalytics from '$lib/components/admin/BroadcastAnalytics.svelte';
	import MessageTemplateManager from '$lib/components/admin/MessageTemplateManager.svelte';
	import MessagePreviewModal from '$lib/components/admin/MessagePreviewModal.svelte';
	import { toast } from '$lib/utils/toast';
	import * as Tabs from '$lib/components/ui/tabs';
	import AdminPageHeader from '$lib/components/admin/AdminPageHeader.svelte';
	import { invalidate } from '$app/navigation';
	import { fade } from 'svelte/transition';

	let { data, form } = $props<{ data: PageData; form: ActionData }>();

	let activeTab = $state('compose');
	let isPreviewOpen = $state(false);
	let previewData = $state<any>(null);
	let isLoading = $state(false);

	// Analytics state (lazy loaded)
	let analytics = $state(null);

	async function handleSend(broadcastData: any) {
		isLoading = true;
		const formData = new FormData();
		Object.entries(broadcastData).forEach(([key, value]) => {
			if (value !== undefined && value !== null) {
				if (typeof value === 'object') {
					formData.append(key, JSON.stringify(value));
				} else {
					formData.append(key, String(value));
				}
			}
		});

		try {
			const response = await fetch('?/send', {
				method: 'POST',
				body: formData
			});
			const result = await response.json();

			if (result.type === 'success') {
				toast.success(i18n.t('admin.broadcast.successTitle'));
				activeTab = 'history';
				await invalidate('admin:broadcast');
			} else {
				toast.error(result.data?.error || 'Failed to send broadcast');
			}
		} catch (e) {
			toast.error('Network error occurred');
		} finally {
			isLoading = false;
		}
	}

	async function handleSaveTemplate(templateData: any) {
		try {
			const response = await fetch('/admin/api/broadcast', {
				method: 'POST',
				body: JSON.stringify({
					action: 'save_template',
					template: templateData
				})
			});
			if (response.ok) {
				toast.success('Template saved successfully');
				await invalidate('admin:broadcast');
			} else {
				toast.error('Failed to save template');
			}
		} catch (e) {
			toast.error('Network error');
		}
	}

	async function handleDeleteTemplate(id: string) {
		try {
			const response = await fetch('/admin/api/broadcast', {
				method: 'POST',
				body: JSON.stringify({
					action: 'delete_template',
					id
				})
			});
			if (response.ok) {
				toast.success('Template deleted');
				await invalidate('admin:broadcast');
			}
		} catch (e) {
			toast.error('Network error');
		}
	}

	function handlePreview(data: any) {
		previewData = data;
		isPreviewOpen = true;
	}

	async function loadAnalytics() {
		if (analytics) return;
		const response = await fetch('/admin/api/broadcast?type=analytics');
		if (response.ok) {
			analytics = await response.json();
		}
	}

	$effect(() => {
		if (activeTab === 'analytics') {
			loadAnalytics();
		}
	});
</script>

<div class="container mx-auto py-10 max-w-6xl space-y-8">
	<AdminPageHeader
		title={i18n.t('admin.broadcast.title')}
		description={i18n.t('admin.broadcast.subtitle')}
	/>

	<Tabs.Root bind:value={activeTab} class="space-y-6">
		<Tabs.List class="grid grid-cols-4 w-full md:w-[600px] h-12 p-1 bg-muted/50">
			<Tabs.Trigger value="compose" class="text-xs font-bold uppercase tracking-widest"
				>Compose</Tabs.Trigger
			>
			<Tabs.Trigger value="history" class="text-xs font-bold uppercase tracking-widest"
				>History</Tabs.Trigger
			>
			<Tabs.Trigger value="analytics" class="text-xs font-bold uppercase tracking-widest"
				>Analytics</Tabs.Trigger
			>
			<Tabs.Trigger value="templates" class="text-xs font-bold uppercase tracking-widest"
				>Templates</Tabs.Trigger
			>
		</Tabs.List>

		<Tabs.Content value="compose">
			<div in:fade>
				<BroadcastForm
					tenants={data.tenants}
					templates={data.templates}
					{isLoading}
					onSend={handleSend}
					onSaveTemplate={handleSaveTemplate}
					onPreview={handlePreview}
				/>
			</div>
		</Tabs.Content>

		<Tabs.Content value="history">
			<div in:fade>
				<BroadcastHistory
					history={data.history}
					onViewDetails={(id) => console.log('View', id)}
					onResend={(id) => console.log('Resend', id)}
				/>
			</div>
		</Tabs.Content>

		<Tabs.Content value="analytics">
			<div in:fade>
				<BroadcastAnalytics analytics={analytics || undefined} />
			</div>
		</Tabs.Content>

		<Tabs.Content value="templates">
			<div in:fade>
				<MessageTemplateManager
					templates={data.templates}
					onSave={handleSaveTemplate}
					onDelete={handleDeleteTemplate}
				/>
			</div>
		</Tabs.Content>
	</Tabs.Root>
</div>

{#if previewData}
	<MessagePreviewModal
		bind:open={isPreviewOpen}
		message={previewData.message}
		variables={previewData.variables}
		onSendTest={(phone) => console.log('Test send to', phone)}
	/>
{/if}
