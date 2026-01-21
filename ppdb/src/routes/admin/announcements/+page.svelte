<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import * as Card from '$lib/components/ui/card';
	import * as Table from '$lib/components/ui/table';
	import { Badge } from '$lib/components/ui/badge';
	import { i18n } from '$lib/i18n/index.svelte';

	// Mock data for UI shell
	let announcements = [
		{
			id: 1,
			title: 'Scheduled Maintenance',
			content: 'We will be performing system maintenance on Sunday.',
			status: 'Published',
			date: '2023-10-25'
		},
		{
			id: 2,
			title: 'New Feature: WhatsApp Integration',
			content: 'You can now connect your WAHA instance.',
			status: 'Draft',
			date: '2023-10-20'
		}
	];

	const getStatusText = (status: string) => {
		if (status === 'Published') return i18n.t('admin.announcements.published');
		if (status === 'Draft') return i18n.t('admin.announcements.draft');
		return status;
	};
</script>

<div class="container mx-auto px-4 py-8 max-w-6xl">
	<div class="flex items-center justify-between mb-8">
		<div>
			<h1 class="text-3xl font-bold tracking-tight">{i18n.t('admin.announcements.title')}</h1>
			<p class="text-muted-foreground mt-1">{i18n.t('admin.announcements.subtitle')}</p>
		</div>
		<Button>{i18n.t('admin.announcements.newAnnouncement')}</Button>
	</div>

	<div class="grid gap-6 md:grid-cols-3">
		<!-- List (Left) -->
		<div class="md:col-span-2">
			<Card.Root>
				<Card.Header>
					<Card.Title>{i18n.t('admin.announcements.history')}</Card.Title>
				</Card.Header>
				<Card.Content>
					<Table.Root>
						<Table.Header>
							<Table.Row>
								<Table.Head>{i18n.t('admin.announcements.tableTitle')}</Table.Head>
								<Table.Head>{i18n.t('admin.announcements.status')}</Table.Head>
								<Table.Head>{i18n.t('admin.announcements.date')}</Table.Head>
								<Table.Head class="text-right">{i18n.t('admin.announcements.action')}</Table.Head>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{#each announcements as item}
								<Table.Row>
									<Table.Cell class="font-medium">{item.title}</Table.Cell>
									<Table.Cell>
										<Badge variant={item.status === 'Published' ? 'default' : 'secondary'}>
											{getStatusText(item.status)}
										</Badge>
									</Table.Cell>
									<Table.Cell
										>{new Date(item.date).toLocaleDateString(
											i18n.language === 'id' ? 'id-ID' : 'en-US'
										)}</Table.Cell
									>
									<Table.Cell class="text-right">
										<Button variant="ghost" size="sm">{i18n.t('common.edit')}</Button>
									</Table.Cell>
								</Table.Row>
							{/each}
						</Table.Body>
					</Table.Root>
				</Card.Content>
			</Card.Root>
		</div>

		<!-- Quick Draft (Right) -->
		<div>
			<Card.Root>
				<Card.Header>
					<Card.Title>{i18n.t('admin.announcements.quickDraft')}</Card.Title>
				</Card.Header>
				<Card.Content class="space-y-4">
					<Input placeholder={i18n.t('admin.announcements.tableTitle')} />
					<Textarea placeholder={i18n.t('admin.announcements.content')} rows={4} />
					<div class="flex justify-end gap-2">
						<Button variant="outline">{i18n.t('admin.announcements.saveDraft')}</Button>
						<Button>{i18n.t('admin.announcements.publish')}</Button>
					</div>
				</Card.Content>
			</Card.Root>
		</div>
	</div>
</div>
