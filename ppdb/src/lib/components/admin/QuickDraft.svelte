<script lang="ts">
	import { i18n } from '$lib/i18n/index.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Label } from '$lib/components/ui/label';
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Save, Send, Clock, FileText } from 'lucide-svelte';

	interface RecentDraft {
		id: string;
		title: string;
		createdAt: Date;
	}

	interface Props {
		recentDrafts?: RecentDraft[];
		isLoading?: boolean;
		onSaveDraft?: (data: { title: string; content: string }) => void;
		onPublish?: (data: { title: string; content: string }) => void;
		onEditDraft?: (id: string) => void;
	}

	let {
		recentDrafts = [],
		isLoading = false,
		onSaveDraft,
		onPublish,
		onEditDraft
	} = $props<Props>();

	let title = $state('');
	let content = $state('');

	function handleSaveDraft() {
		if (!title.trim() || !content.trim()) return;
		onSaveDraft?.({ title: title.trim(), content: content.trim() });
		// Reset form after save
		title = '';
		content = '';
	}

	function handlePublish() {
		if (!title.trim() || !content.trim()) return;
		onPublish?.({ title: title.trim(), content: content.trim() });
		title = '';
		content = '';
	}

	function formatDate(date: Date | string) {
		return new Intl.DateTimeFormat('id-ID', {
			day: '2-digit',
			month: 'short'
		}).format(new Date(date));
	}

	let canSubmit = $derived(title.trim().length >= 3 && content.trim().length >= 10);
</script>

<Card.Root class="sticky top-4">
	<Card.Header class="pb-4">
		<Card.Title class="text-lg font-bold flex items-center gap-2">
			<FileText class="w-5 h-5" />
			{i18n.t('admin.announcements.quickDraft')}
		</Card.Title>
		<Card.Description class="text-xs text-muted-foreground">
			Create a quick announcement draft
		</Card.Description>
	</Card.Header>
	<Card.Content class="space-y-4">
		<div class="space-y-1.5">
			<Label class="text-[10px] font-black uppercase tracking-widest text-muted-foreground"
				>Title</Label
			>
			<Input
				bind:value={title}
				placeholder={i18n.t('admin.announcements.tableTitle')}
				class="h-9"
				maxlength={200}
			/>
		</div>
		<div class="space-y-1.5">
			<Label class="text-[10px] font-black uppercase tracking-widest text-muted-foreground"
				>Content</Label
			>
			<Textarea
				bind:value={content}
				placeholder={i18n.t('admin.announcements.content')}
				rows={5}
				maxlength={2000}
			/>
			<p class="text-[10px] text-muted-foreground text-right">{content.length}/2000</p>
		</div>
		<div class="flex gap-2">
			<Button
				variant="outline"
				class="flex-1 h-9 text-xs font-bold"
				onclick={handleSaveDraft}
				disabled={!canSubmit || isLoading}
			>
				<Save class="w-3.5 h-3.5 mr-1.5" />
				{i18n.t('admin.announcements.saveDraft')}
			</Button>
			<Button
				class="flex-1 h-9 text-xs font-bold"
				onclick={handlePublish}
				disabled={!canSubmit || isLoading}
			>
				<Send class="w-3.5 h-3.5 mr-1.5" />
				{i18n.t('admin.announcements.publish')}
			</Button>
		</div>
	</Card.Content>

	{#if recentDrafts.length > 0}
		<Card.Footer class="flex flex-col items-stretch border-t pt-4">
			<p class="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">
				Recent Drafts
			</p>
			<div class="space-y-2">
				{#each recentDrafts.slice(0, 5) as draft}
					<button
						class="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors text-left group"
						onclick={() => onEditDraft?.(draft.id)}
					>
						<FileText class="w-4 h-4 text-muted-foreground shrink-0" />
						<span
							class="flex-1 text-sm font-medium truncate group-hover:text-primary transition-colors"
						>
							{draft.title}
						</span>
						<Badge variant="outline" class="text-[9px] px-1.5 py-0 shrink-0">
							<Clock class="w-2.5 h-2.5 mr-1" />
							{formatDate(draft.createdAt)}
						</Badge>
					</button>
				{/each}
			</div>
		</Card.Footer>
	{/if}
</Card.Root>
