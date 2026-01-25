<script lang="ts">
	import { onMount } from 'svelte';
	import AdminPageHeader from '$lib/components/admin/AdminPageHeader.svelte';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { ArrowRight, Info } from 'lucide-svelte';
	import { i18n } from '$lib/i18n/index.svelte';

	onMount(() => {
		// Redirect to old settings for now
		window.location.href = '/admin/settings#general';
	});
</script>

<AdminPageHeader
	title={i18n.t('admin.platformSettings.title')}
	description={i18n.t('admin.platformSettings.subtitle')}
/>

<div class="container mx-auto px-4 py-8 max-w-5xl">
	<Card.Root class="mb-8 bg-blue-50 border-blue-200">
		<Card.Content class="pt-6">
			<div class="flex items-start gap-4">
				<div class="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
					<Info class="h-5 w-5" />
				</div>
				<div class="flex-1">
					<h3 class="font-semibold text-blue-900 mb-2">
						{i18n.t('admin.platformSettings.redirectTitle')}
					</h3>
					<p class="text-sm text-blue-700 mb-4">
						{i18n.t('admin.platformSettings.redirectDesc')}
					</p>
					<div class="flex flex-wrap gap-2 text-sm">
						<div class="px-3 py-1 bg-white rounded-md border border-blue-200">
							✓ {i18n.t('admin.platformSettings.general')}
						</div>
						<div class="px-3 py-1 bg-white rounded-md border border-blue-200">
							✓ {i18n.t('admin.platformSettings.email')}
						</div>
						<div class="px-3 py-1 bg-gray-100 rounded-md border border-gray-200 text-gray-500 line-through">
							✗ {i18n.t('admin.platformSettings.billing')} → {i18n.t('nav.subscription')}
						</div>
						<div class="px-3 py-1 bg-gray-100 rounded-md border border-gray-200 text-gray-500 line-through">
							✗ {i18n.t('admin.platformSettings.integrations')} → {i18n.t('nav.operations')}
						</div>
						<div class="px-3 py-1 bg-gray-100 rounded-md border border-gray-200 text-gray-500 line-through">
							✗ {i18n.t('admin.platformSettings.security')} → {i18n.t('nav.security')}
						</div>
					</div>
				</div>
			</div>
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Content class="pt-6 text-center">
			<p class="text-muted-foreground mb-4">{i18n.t('admin.platformSettings.autoRedirect')}</p>
			<Button onclick={() => (window.location.href = '/admin/settings#general')}>
				{i18n.t('admin.platformSettings.goToSettings')}
				<ArrowRight class="ml-2 h-4 w-4" />
			</Button>
		</Card.Content>
	</Card.Root>
</div>
