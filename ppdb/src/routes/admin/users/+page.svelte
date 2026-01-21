<script lang="ts">
	import type { PageData } from './$types';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import * as Card from '$lib/components/ui/card';
	import * as Table from '$lib/components/ui/table';
	import { Badge } from '$lib/components/ui/badge';
	import AdminPageHeader from '$lib/components/admin/AdminPageHeader.svelte';
	import AdminSearch from '$lib/components/admin/AdminSearch.svelte';
	import { Plus } from 'lucide-svelte';
	import { i18n } from '$lib/i18n/index.svelte';
	import { cn } from '$lib/utils';

	let { data } = $props<{ data: PageData }>();
	let users = $derived(data.users);

	const getRoleText = (role: string) => {
		const key = `admin.roles.${role}` as any;
		const translated = i18n.t(key);
		return translated !== key ? translated : role.replace('_', ' ').toUpperCase();
	};

	const getStatusText = (status: string) => {
		if (status === 'active') return i18n.t('admin.roles.active');
		if (status === 'inactive') return i18n.t('admin.roles.inactive');
		if (status === 'pending') return i18n.t('admin.roles.pending');
		return status.toUpperCase();
	};
</script>

<AdminPageHeader title={i18n.t('admin.users.title')} description={i18n.t('admin.users.subtitle')}>
	{#snippet actions()}
		<Button>
			<Plus class="mr-2 h-4 w-4" />
			{i18n.t('admin.users.inviteAdmin')}
		</Button>
	{/snippet}
</AdminPageHeader>

<div class="space-y-6">
	<!-- Filters -->
	<div class="flex items-center gap-4">
		<AdminSearch placeholder={i18n.t('admin.users.searchAdmins')} class="max-w-sm" />
	</div>

	<div
		class="bg-white/50 backdrop-blur-sm shadow-premium rounded-xl overflow-hidden border-none ring-1 ring-border"
	>
		<table class="table-modern">
			<thead>
				<tr>
					<th class="pl-8">{i18n.t('admin.users.adminName')}</th>
					<th>{i18n.t('admin.users.emailAddress')}</th>
					<th>{i18n.t('admin.users.role')}</th>
					<th>{i18n.t('admin.users.organization')}</th>
					<th>{i18n.t('admin.users.status')}</th>
					<th class="text-right pr-8">{i18n.t('admin.users.actions')}</th>
				</tr>
			</thead>
			<tbody>
				{#each users as user, i}
					<tr class="animate-in-fade" style="animation-delay: {i * 40}ms">
						<td class="pl-8">
							<div class="flex items-center gap-3">
								<div
									class="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 font-bold"
								>
									{user.name?.charAt(0) || 'U'}
								</div>
								<span class="font-bold text-slate-900"
									>{user.name || i18n.t('admin.users.anonymousAdmin')}</span
								>
							</div>
						</td>
						<td class="text-slate-600 font-medium">
							{user.email}
						</td>
						<td>
							<Badge
								variant="secondary"
								class="bg-indigo-50 text-indigo-700 border-none font-bold uppercase text-[10px] px-2.5 py-1"
							>
								{getRoleText(user.role)}
							</Badge>
						</td>
						<td class="text-slate-600 font-medium">
							{user.tenantName || i18n.t('admin.users.globalSystem')}
						</td>
						<td>
							<Badge
								variant="outline"
								class={cn(
									'border-none font-bold uppercase text-[10px] px-2.5 py-1',
									user.status === 'active'
										? 'bg-emerald-500/10 text-emerald-600'
										: user.status === 'pending'
											? 'bg-amber-100 text-amber-700'
											: 'bg-slate-100 text-slate-500'
								)}
							>
								{getStatusText(user.status)}
							</Badge>
						</td>
						<td class="text-right pr-8">
							<Button
								variant="ghost"
								size="sm"
								class="font-bold text-blue-600 hover:bg-blue-50 rounded-lg px-4"
							>
								{i18n.t('admin.users.manage')}
							</Button>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
