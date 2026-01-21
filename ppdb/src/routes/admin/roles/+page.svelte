<script lang="ts">
	import type { PageData } from './$types';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import * as Table from '$lib/components/ui/table';
	import { Badge } from '$lib/components/ui/badge';
	import { enhance } from '$app/forms';
	import { Shield, Users, UserCog, History, ShieldAlert } from 'lucide-svelte';
	import { i18n } from '$lib/i18n/index.svelte';

	let { data } = $props<{ data: PageData }>();

	const roles = [
		'super_admin',
		'school_admin',
		'verifier',
		'treasurer',
		'interviewer',
		'field_officer',
		'parent'
	];
	const statuses = ['active', 'inactive', 'pending'];

	const getRoleBadgeStyle = (role: string) => {
		switch (role) {
			case 'super_admin':
				return 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400';
			case 'school_admin':
				return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400';
			case 'verifier':
				return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400';
			case 'treasurer':
				return 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400';
			case 'interviewer':
				return 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400';
			case 'field_officer':
				return 'bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-400';
			default:
				return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400';
		}
	};

	const getStatusBadgeStyle = (status: string) => {
		switch (status.toLowerCase()) {
			case 'active':
				return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
			case 'inactive':
				return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
			case 'pending':
				return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
			default:
				return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
		}
	};

	const getStatusText = (status: string) => {
		switch (status.toLowerCase()) {
			case 'active':
				return i18n.t('admin.roles.active');
			case 'inactive':
				return i18n.t('admin.roles.inactive');
			case 'pending':
				return i18n.t('admin.roles.pending');
			default:
				return status.toUpperCase();
		}
	};

	const getRoleText = (role: string) => {
		const key = `admin.roles.${role}` as any;
		const translated = i18n.t(key);
		return translated !== key ? translated : role.replace('_', ' ').toUpperCase();
	};
</script>

<div class="container mx-auto px-4 py-8 max-w-6xl">
	<div class="flex items-center justify-between mb-8">
		<div>
			<h1 class="text-3xl font-bold tracking-tight">{i18n.t('admin.roles.title')}</h1>
			<p class="text-muted-foreground mt-1">{i18n.t('admin.roles.subtitle')}</p>
		</div>
	</div>

	<!-- Role Statistics -->
	<div class="grid gap-4 md:grid-cols-4 lg:grid-cols-7 mb-8">
		{#each data.roleStats as stat}
			<Card.Root>
				<Card.Header class="pb-2 p-4">
					<Card.Title class="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
						{getRoleText(stat.role)}
					</Card.Title>
				</Card.Header>
				<Card.Content class="px-4 pb-4">
					<div class="text-2xl font-bold">{stat.count}</div>
				</Card.Content>
			</Card.Root>
		{/each}
	</div>

	<!-- Users Table -->
	<Card.Root>
		<Card.Header>
			<Card.Title>{i18n.t('admin.roles.platformUsers')}</Card.Title>
			<Card.Description>{i18n.t('admin.roles.platformUsersDesc')}</Card.Description>
		</Card.Header>
		<Card.Content class="p-0">
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>{i18n.t('admin.roles.user')}</Table.Head>
						<Table.Head>{i18n.t('admin.schools.organization')}</Table.Head>
						<Table.Head>{i18n.t('admin.roles.role')}</Table.Head>
						<Table.Head>{i18n.t('common.status')}</Table.Head>
						<Table.Head>{i18n.t('admin.roles.joined')}</Table.Head>
						<Table.Head class="text-right">{i18n.t('common.actions')}</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each data.users as user}
						<Table.Row>
							<Table.Cell>
								<div class="font-medium text-sm">{user.name || 'N/A'}</div>
								<div class="text-[10px] text-muted-foreground">{user.email}</div>
							</Table.Cell>
							<Table.Cell class="text-xs">{user.tenantName || 'N/A'}</Table.Cell>
							<Table.Cell>
								<form action="?/updateRole" method="POST" use:enhance>
									<input type="hidden" name="userId" value={user.id} />
									<select
										name="role"
										class="text-[11px] font-medium border rounded-full px-2 py-0.5 appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500 {getRoleBadgeStyle(
											user.role
										)}"
										onchange={(e) => e.currentTarget.form?.requestSubmit()}
									>
										{#each roles as role}
											<option value={role} selected={role === user.role}>
												{getRoleText(role)}
											</option>
										{/each}
									</select>
								</form>
							</Table.Cell>
							<Table.Cell>
								<form action="?/updateStatus" method="POST" use:enhance>
									<input type="hidden" name="userId" value={user.id} />
									<select
										name="status"
										class="text-[11px] font-medium border rounded-full px-2 py-0.5 appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500 {getStatusBadgeStyle(
											user.status
										)}"
										onchange={(e) => e.currentTarget.form?.requestSubmit()}
									>
										{#each statuses as status}
											<option value={status} selected={status === user.status}>
												{getStatusText(status)}
											</option>
										{/each}
									</select>
								</form>
							</Table.Cell>
							<Table.Cell class="text-[11px] text-muted-foreground">
								{new Date(user.createdAt).toLocaleDateString(
									i18n.language === 'id' ? 'id-ID' : 'en-US'
								)}
							</Table.Cell>
							<Table.Cell class="text-right">
								<Button variant="ghost" size="sm" class="h-8 text-[11px]"
									>{i18n.t('admin.roles.view')}</Button
								>
							</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</Card.Content>
	</Card.Root>
</div>

<style>
	select {
		background-image: none;
	}
</style>
