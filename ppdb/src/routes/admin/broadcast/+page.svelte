<script lang="ts">
	import type { ActionData, PageData } from './$types';
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Label } from '$lib/components/ui/label';
	import Alert from '$lib/components/ui/alert.svelte';
	import {
		Card,
		CardContent,
		CardHeader,
		CardTitle,
		CardDescription,
		CardFooter
	} from '$lib/components/ui';
	import * as Select from '$lib/components/ui/select';
	import { MessageSquare, Users, Send } from 'lucide-svelte';
	import { i18n } from '$lib/i18n/index.svelte';

	let { data, form } = $props<{ data: PageData; form: ActionData }>();

	let sending = $state(false);
	let selectedTarget = $state('all');

	let targetOptions = $derived([
		{ value: 'all', label: i18n.t('admin.broadcast.allAdmins', { count: data.tenants.length }) },
		{ value: 'active', label: i18n.t('admin.broadcast.activeOnly') },
		{ value: 'inactive', label: i18n.t('admin.broadcast.inactiveOnly') }
	]);

	let selectedTargetLabel = $derived(
		targetOptions.find((o) => o.value === selectedTarget)?.label ??
			i18n.t('admin.broadcast.selectTarget')
	);
</script>

<div class="container mx-auto py-10 max-w-5xl space-y-8">
	<div class="space-y-2">
		<h1 class="text-3xl font-bold tracking-tight">{i18n.t('admin.broadcast.title')}</h1>
		<p class="text-muted-foreground">
			{i18n.t('admin.broadcast.subtitle')}
		</p>
	</div>

	{#if form?.success}
		<Alert
			variant="success"
			title={i18n.t('admin.broadcast.successTitle')}
			message={i18n.t('admin.broadcast.successMessage', {
				sentCount: form.sentCount,
				totalAdmins: form.totalAdmins
			})}
		/>
	{/if}

	{#if form?.error}
		<Alert variant="error" title={i18n.t('admin.broadcast.errorTitle')} message={form.error} />
	{/if}

	<div class="grid md:grid-cols-3 gap-8">
		<!-- Form Column -->
		<div class="md:col-span-2 space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>{i18n.t('admin.broadcast.createNew')}</CardTitle>
					<CardDescription>{i18n.t('admin.broadcast.createNewDesc')}</CardDescription>
				</CardHeader>
				<CardContent>
					<form
						method="POST"
						action="?/send"
						use:enhance={() => {
							sending = true;
							return async ({ update }) => {
								await update();
								sending = false;
							};
						}}
						class="space-y-6"
					>
						<div class="space-y-2">
							<Label>{i18n.t('admin.broadcast.targetAudience')}</Label>
							<Select.Root type="single" bind:value={selectedTarget}>
								<Select.Trigger class="w-full">
									{selectedTargetLabel}
								</Select.Trigger>
								<Select.Content>
									{#each targetOptions as option}
										<Select.Item value={option.value}>{option.label}</Select.Item>
									{/each}
								</Select.Content>
							</Select.Root>
							<input type="hidden" name="target" value={selectedTarget} />
						</div>

						<div class="space-y-2">
							<Label>{i18n.t('admin.broadcast.waMessage')}</Label>
							<Textarea
								name="message"
								placeholder={i18n.t('admin.broadcast.placeholder')}
								rows={8}
								required
								class="resize-none"
							/>
							<p class="text-[10px] text-muted-foreground italic font-medium">
								{i18n.t('admin.broadcast.helperText')}
							</p>
						</div>

						<Button type="submit" disabled={sending} class="w-full">
							{#if sending}
								<div
									class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"
								></div>
								{i18n.t('admin.broadcast.sending')}
							{:else}
								<Send class="w-4 h-4 mr-2" />
								{i18n.t('admin.broadcast.sendBlast')}
							{/if}
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>

		<!-- Info Column -->
		<div class="space-y-6">
			<Card class="bg-primary text-primary-foreground border-none shadow-xl">
				<CardHeader>
					<div class="flex items-center gap-3">
						<div class="p-2 bg-white/10 rounded-lg">
							<MessageSquare class="w-5 h-5" />
						</div>
						<CardTitle class="text-base uppercase tracking-widest"
							>{i18n.t('admin.broadcast.rules')}</CardTitle
						>
					</div>
				</CardHeader>
				<CardContent>
					<ul class="space-y-4 text-xs font-medium opacity-90">
						<li class="flex gap-3">
							<span class="font-black">•</span>
							{i18n.t('admin.broadcast.rule1')}
						</li>
						<li class="flex gap-3">
							<span class="font-black">•</span>
							{i18n.t('admin.broadcast.rule2')}
						</li>
						<li class="flex gap-3">
							<span class="font-black">•</span>
							{i18n.t('admin.broadcast.rule3')}
						</li>
					</ul>
				</CardContent>
			</Card>

			<Card class="border-dashed">
				<CardHeader>
					<div class="flex items-center gap-3">
						<Users class="w-5 h-5 text-muted-foreground" />
						<CardTitle class="text-sm font-bold uppercase tracking-widest text-muted-foreground">
							{i18n.t('admin.broadcast.audienceStatus')}
						</CardTitle>
					</div>
				</CardHeader>
				<CardContent>
					<p class="text-3xl font-black text-primary">{data.tenants.length}</p>
					<p class="text-xs font-bold text-muted-foreground uppercase mt-1">
						{i18n.t('admin.broadcast.potentialReach')}
					</p>
				</CardContent>
			</Card>
		</div>
	</div>
</div>
