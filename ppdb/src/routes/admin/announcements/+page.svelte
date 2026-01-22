<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { i18n } from '$lib/i18n/index.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Tabs from '$lib/components/ui/tabs';
	import * as Dialog from '$lib/components/ui/dialog';
	import AdminPageHeader from '$lib/components/admin/AdminPageHeader.svelte';
	import AnnouncementsList from '$lib/components/admin/AnnouncementsList.svelte';
	import AnnouncementForm from '$lib/components/admin/AnnouncementForm.svelte';
	import AnnouncementStats from '$lib/components/admin/AnnouncementStats.svelte';
	import QuickDraft from '$lib/components/admin/QuickDraft.svelte';
	import { toast } from '$lib/utils/toast';
	import { invalidate, goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { Plus, X } from 'lucide-svelte';
	import { fade } from 'svelte/transition';

	let { data, form } = $props<{ data: PageData; form: ActionData }>();

	let activeTab = $state<'list' | 'analytics'>('list');
	let showCreateDialog = $state(false);
	let showEditDialog = $state(false);
	let selectedAnnouncement = $state<(typeof data.announcements)[0] | null>(null);
	let isLoading = $state(false);

	// Handle form action results
	$effect(() => {
		if (form?.success) {
			toast.success('Operation completed successfully');
			showCreateDialog = false;
			showEditDialog = false;
			selectedAnnouncement = null;
			invalidate('admin:announcements');
		} else if (form?.error) {
			toast.error(form.error);
		}
	});

	function handleFilterChange(filters: Record<string, string>) {
		const url = new URL($page.url);
		Object.entries(filters).forEach(([key, value]) => {
			if (value && value !== 'all' && value !== '') {
				url.searchParams.set(key, value);
			} else {
				url.searchParams.delete(key);
			}
		});
		url.searchParams.set('page', '1');
		goto(url.toString(), { replaceState: true, noScroll: true });
	}

	function handlePageChange(newPage: number) {
		const url = new URL($page.url);
		url.searchParams.set('page', String(newPage));
		goto(url.toString(), { replaceState: true, noScroll: true });
	}

	function handleView(id: string) {
		const announcement = data.announcements.find((a) => a.id === id);
		if (announcement) {
			selectedAnnouncement = announcement;
			showEditDialog = true;
		}
	}

	function handleEdit(id: string) {
		handleView(id);
	}

	async function handleDelete(id: string) {
		if (!confirm('Are you sure you want to delete this announcement?')) return;

		isLoading = true;
		try {
			const formData = new FormData();
			formData.append('id', id);

			const response = await fetch('?/delete', {
				method: 'POST',
				body: formData
			});
			const result = await response.json();

			if (result.type === 'success') {
				toast.success('Announcement deleted');
				await invalidate('admin:announcements');
			} else {
				toast.error(result.data?.error || 'Failed to delete');
			}
		} catch (e) {
			toast.error('Network error');
		} finally {
			isLoading = false;
		}
	}

	async function handlePublish(id: string) {
		isLoading = true;
		try {
			const formData = new FormData();
			formData.append('id', id);

			const response = await fetch('?/publish', {
				method: 'POST',
				body: formData
			});
			const result = await response.json();

			if (result.type === 'success') {
				toast.success('Announcement published');
				await invalidate('admin:announcements');
			} else {
				toast.error(result.data?.error || 'Failed to publish');
			}
		} catch (e) {
			toast.error('Network error');
		} finally {
			isLoading = false;
		}
	}

	async function handleArchive(id: string) {
		isLoading = true;
		try {
			const formData = new FormData();
			formData.append('id', id);

			const response = await fetch('?/archive', {
				method: 'POST',
				body: formData
			});
			const result = await response.json();

			if (result.type === 'success') {
				toast.success('Announcement archived');
				await invalidate('admin:announcements');
			} else {
				toast.error(result.data?.error || 'Failed to archive');
			}
		} catch (e) {
			toast.error('Network error');
		} finally {
			isLoading = false;
		}
	}

	async function handleUnarchive(id: string) {
		isLoading = true;
		try {
			const formData = new FormData();
			formData.append('id', id);

			const response = await fetch('?/unarchive', {
				method: 'POST',
				body: formData
			});
			const result = await response.json();

			if (result.type === 'success') {
				toast.success('Announcement unarchived');
				await invalidate('admin:announcements');
			} else {
				toast.error(result.data?.error || 'Failed to unarchive');
			}
		} catch (e) {
			toast.error('Network error');
		} finally {
			isLoading = false;
		}
	}

	async function handleDuplicate(id: string) {
		isLoading = true;
		try {
			const formData = new FormData();
			formData.append('id', id);

			const response = await fetch('?/duplicate', {
				method: 'POST',
				body: formData
			});
			const result = await response.json();

			if (result.type === 'success') {
				toast.success('Announcement duplicated');
				await invalidate('admin:announcements');
			} else {
				toast.error(result.data?.error || 'Failed to duplicate');
			}
		} catch (e) {
			toast.error('Network error');
		} finally {
			isLoading = false;
		}
	}

	async function handleSave(
		formData: Parameters<NonNullable<(typeof AnnouncementForm.prototype)['onSave']>>[0],
		action: 'draft' | 'publish' | 'schedule'
	) {
		isLoading = true;
		try {
			const fd = new FormData();

			if (formData.id) {
				fd.append('id', formData.id);
			}
			fd.append('title', formData.title);
			fd.append('content', formData.content);
			fd.append('contentType', formData.contentType);
			fd.append('targetType', formData.targetType);
			if (formData.targetTenantIds?.length) {
				fd.append('targetTenantIds', JSON.stringify(formData.targetTenantIds));
			}
			if (formData.scheduledAt) {
				fd.append('scheduledAt', new Date(formData.scheduledAt).toISOString());
			}
			if (formData.expiresAt) {
				fd.append('expiresAt', new Date(formData.expiresAt).toISOString());
			}
			fd.append('priority', formData.priority);
			if (formData.category) {
				fd.append('category', formData.category);
			}
			if (formData.tags?.length) {
				fd.append('tags', JSON.stringify(formData.tags));
			}

			// Determine the action endpoint
			const endpoint = formData.id ? '?/update' : '?/create';

			const response = await fetch(endpoint, {
				method: 'POST',
				body: fd
			});
			const result = await response.json();

			if (result.type === 'success') {
				const announcementId = formData.id || result.data?.announcement?.id;

				// If action is publish and it's a new/draft announcement, publish it
				if (action === 'publish' && announcementId) {
					await handlePublish(announcementId);
				} else {
					toast.success(formData.id ? 'Announcement updated' : 'Announcement created');
					await invalidate('admin:announcements');
				}

				showCreateDialog = false;
				showEditDialog = false;
				selectedAnnouncement = null;
			} else {
				toast.error(result.data?.error || 'Failed to save');
			}
		} catch (e) {
			toast.error('Network error');
		} finally {
			isLoading = false;
		}
	}

	async function handleQuickSaveDraft(quickData: { title: string; content: string }) {
		isLoading = true;
		try {
			const fd = new FormData();
			fd.append('title', quickData.title);
			fd.append('content', quickData.content);
			fd.append('contentType', 'html');
			fd.append('targetType', 'all');
			fd.append('priority', 'normal');

			const response = await fetch('?/create', {
				method: 'POST',
				body: fd
			});
			const result = await response.json();

			if (result.type === 'success') {
				toast.success('Draft saved');
				await invalidate('admin:announcements');
			} else {
				toast.error(result.data?.error || 'Failed to save draft');
			}
		} catch (e) {
			toast.error('Network error');
		} finally {
			isLoading = false;
		}
	}

	async function handleQuickPublish(quickData: { title: string; content: string }) {
		isLoading = true;
		try {
			const fd = new FormData();
			fd.append('title', quickData.title);
			fd.append('content', quickData.content);
			fd.append('contentType', 'html');
			fd.append('targetType', 'all');
			fd.append('priority', 'normal');

			const response = await fetch('?/create', {
				method: 'POST',
				body: fd
			});
			const result = await response.json();

			if (result.type === 'success' && result.data?.announcement?.id) {
				// Publish immediately
				await handlePublish(result.data.announcement.id);
			} else {
				toast.error(result.data?.error || 'Failed to create');
			}
		} catch (e) {
			toast.error('Network error');
		} finally {
			isLoading = false;
		}
	}

	function handlePreview(
		formData: Parameters<NonNullable<(typeof AnnouncementForm.prototype)['onPreview']>>[0]
	) {
		// For now, just show a toast - could open a preview modal
		toast.info('Preview feature coming soon');
	}

	async function handleSaveAsTemplate(
		formData: Parameters<NonNullable<(typeof AnnouncementForm.prototype)['onSaveAsTemplate']>>[0]
	) {
		const templateName = prompt('Enter a name for this template:');
		if (!templateName) return;

		isLoading = true;
		try {
			const fd = new FormData();
			fd.append('name', templateName);
			fd.append('title', formData.title);
			fd.append('content', formData.content);
			fd.append('contentType', formData.contentType);
			fd.append('priority', formData.priority);
			if (formData.category) {
				fd.append('category', formData.category);
			}

			const response = await fetch('?/saveTemplate', {
				method: 'POST',
				body: fd
			});
			const result = await response.json();

			if (result.type === 'success') {
				toast.success('Template saved');
				await invalidate('admin:announcements');
			} else {
				toast.error(result.data?.error || 'Failed to save template');
			}
		} catch (e) {
			toast.error('Network error');
		} finally {
			isLoading = false;
		}
	}

	// Get drafts for quick draft component
	let recentDrafts = $derived(
		data.announcements
			.filter((a) => a.status === 'draft')
			.slice(0, 5)
			.map((a) => ({ id: a.id, title: a.title, createdAt: a.createdAt }))
	);
</script>

<div class="container mx-auto py-10 max-w-7xl space-y-8">
	<div class="flex items-center justify-between">
		<AdminPageHeader
			title={i18n.t('admin.announcements.title')}
			description={i18n.t('admin.announcements.subtitle')}
		/>
		<Button onclick={() => (showCreateDialog = true)} class="gap-2">
			<Plus class="h-4 w-4" />
			{i18n.t('admin.announcements.newAnnouncement')}
		</Button>
	</div>

	<Tabs.Root bind:value={activeTab} class="space-y-6">
		<Tabs.List class="grid grid-cols-2 w-full md:w-[300px] h-12 p-1 bg-muted/50">
			<Tabs.Trigger value="list" class="text-xs font-bold uppercase tracking-widest"
				>Announcements</Tabs.Trigger
			>
			<Tabs.Trigger value="analytics" class="text-xs font-bold uppercase tracking-widest"
				>Analytics</Tabs.Trigger
			>
		</Tabs.List>

		<Tabs.Content value="list">
			<div in:fade>
				<div class="grid gap-6 lg:grid-cols-4">
					<!-- Main List -->
					<div class="lg:col-span-3">
						<AnnouncementsList
							announcements={data.announcements}
							categories={data.categories}
							pagination={data.pagination}
							filters={data.filters}
							{isLoading}
							onFilterChange={handleFilterChange}
							onPageChange={handlePageChange}
							onView={handleView}
							onEdit={handleEdit}
							onDelete={handleDelete}
							onPublish={handlePublish}
							onArchive={handleArchive}
							onUnarchive={handleUnarchive}
							onDuplicate={handleDuplicate}
						/>
					</div>

					<!-- Quick Draft Sidebar -->
					<div class="lg:col-span-1">
						<QuickDraft
							{recentDrafts}
							{isLoading}
							onSaveDraft={handleQuickSaveDraft}
							onPublish={handleQuickPublish}
							onEditDraft={handleEdit}
						/>
					</div>
				</div>
			</div>
		</Tabs.Content>

		<Tabs.Content value="analytics">
			<div in:fade>
				<AnnouncementStats stats={data.stats} />
			</div>
		</Tabs.Content>
	</Tabs.Root>
</div>

<!-- Create Dialog -->
<Dialog.Root bind:open={showCreateDialog}>
	<Dialog.Content class="max-w-3xl max-h-[90vh] overflow-y-auto">
		<Dialog.Header>
			<Dialog.Title class="text-xl font-bold">
				{i18n.t('admin.announcements.newAnnouncement')}
			</Dialog.Title>
			<Dialog.Description>
				Create a new announcement to broadcast to tenant dashboards.
			</Dialog.Description>
		</Dialog.Header>
		<AnnouncementForm
			mode="create"
			categories={data.categories}
			templates={data.templates}
			tenants={data.tenants}
			{isLoading}
			onSave={handleSave}
			onCancel={() => (showCreateDialog = false)}
			onPreview={handlePreview}
			onSaveAsTemplate={handleSaveAsTemplate}
		/>
	</Dialog.Content>
</Dialog.Root>

<!-- Edit Dialog -->
<Dialog.Root bind:open={showEditDialog}>
	<Dialog.Content class="max-w-3xl max-h-[90vh] overflow-y-auto">
		<Dialog.Header>
			<Dialog.Title class="text-xl font-bold">Edit Announcement</Dialog.Title>
			<Dialog.Description>Update the announcement details.</Dialog.Description>
		</Dialog.Header>
		{#if selectedAnnouncement}
			<AnnouncementForm
				mode="edit"
				announcement={{
					id: selectedAnnouncement.id,
					title: selectedAnnouncement.title,
					content: selectedAnnouncement.content,
					contentType: selectedAnnouncement.contentType as 'html' | 'markdown',
					targetType: selectedAnnouncement.targetType as 'all' | 'active' | 'inactive' | 'custom',
					targetTenantIds: (selectedAnnouncement.targetTenantIds as string[]) || [],
					scheduledAt: selectedAnnouncement.scheduledAt
						? new Date(selectedAnnouncement.scheduledAt).toISOString().slice(0, 16)
						: '',
					expiresAt: selectedAnnouncement.expiresAt
						? new Date(selectedAnnouncement.expiresAt).toISOString().slice(0, 16)
						: '',
					priority: selectedAnnouncement.priority as 'low' | 'normal' | 'high' | 'urgent',
					category: selectedAnnouncement.category || '',
					tags: (selectedAnnouncement.tags as string[]) || []
				}}
				categories={data.categories}
				templates={data.templates}
				tenants={data.tenants}
				{isLoading}
				onSave={handleSave}
				onCancel={() => {
					showEditDialog = false;
					selectedAnnouncement = null;
				}}
				onPreview={handlePreview}
			/>
		{/if}
	</Dialog.Content>
</Dialog.Root>
