<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';
	import type { PageData } from './$types';
	import { formatRoleForDisplay } from '$lib/schema/school-admin';
	import { Card, CardContent, CardHeader, CardTitle } from '$components/ui/card';
	import { Button } from '$components/ui/button';
	import { Input } from '$components/ui/input';
	import { Label } from '$components/ui/label';
	import {
		Select,
		SelectContent,
		SelectItem,
		SelectTrigger,
		SelectValue
	} from '$components/ui/select';
	import { Badge } from '$components/ui/badge';
	import { Trash2, Shield, UserPlus } from 'lucide-svelte';

	export let data: PageData;
	export let form: ActionData;

	let showCreateForm = false;
	let createEmail = '';
	let createName = '';
	let createRole: 'school_admin' | 'verifier' | 'treasurer' = 'school_admin';

	function getRoleBadgeColor(role: string): string {
		switch (role) {
			case 'super_admin':
				return 'bg-purple-500 text-white';
			case 'school_admin':
				return 'bg-blue-500 text-white';
			case 'verifier':
				return 'bg-green-500 text-white';
			case 'treasurer':
				return 'bg-orange-500 text-white';
			default:
				return 'bg-gray-500 text-white';
		}
	}

	function getStatusBadgeColor(status: string): string {
		switch (status) {
			case 'active':
				return 'bg-green-100 text-green-800';
			case 'inactive':
				return 'bg-red-100 text-red-800';
			case 'pending':
				return 'bg-yellow-100 text-yellow-800';
			default:
				return 'bg-gray-100 text-gray-800';
		}
	}
</script>

<div class="container mx-auto py-6 space-y-6">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold text-gray-900">School Admin Management</h1>
			<p class="text-gray-600 mt-1">Manage administrators and their access levels</p>
		</div>
		<Button on:click={() => (showCreateForm = !showCreateForm)} class="flex items-center gap-2">
			<UserPlus class="h-4 w-4" />
			<span>Add Admin</span>
		</Button>
	</div>

	<!-- Create Admin Form (Collapsible) -->
	{#if showCreateForm}
		<Card class="mb-6">
			<CardHeader>
				<CardTitle>Invite New Admin</CardTitle>
			</CardHeader>
			<CardContent>
				<form method="POST" action="?/createAdmin" use:enhance class="space-y-4">
					<!-- Email -->
					<div class="space-y-2">
						<Label for="email">Email Address</Label>
						<Input
							id="email"
							name="email"
							type="email"
							placeholder="admin@school.com"
							bind:value={createEmail}
							required
						/>
					</div>

					<!-- Name -->
					<div class="space-y-2">
						<Label for="name">Full Name</Label>
						<Input
							id="name"
							name="name"
							type="text"
							placeholder="Admin Name"
							bind:value={createName}
							required
						/>
					</div>

					<!-- Role -->
					<div class="space-y-2">
						<Label for="role">Role</Label>
						<Select name="role" bind:value={createRole}>
							<SelectTrigger>
								<SelectValue placeholder="Select a role" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="school_admin">School Admin</SelectItem>
								<SelectItem value="verifier">Verifier</SelectItem>
								<SelectItem value="treasurer">Treasurer</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<!-- Actions -->
					<div class="flex gap-2 justify-end">
						<Button type="button" variant="outline" on:click={() => (showCreateForm = false)}>
							Cancel
						</Button>
						<Button type="submit">Send Invite</Button>
					</div>
				</form>

				{#if form?.message}
					<div class="mt-4 rounded-md bg-red-50 p-4 text-red-800">
						{form.message}
					</div>
				{/if}
			</CardContent>
		</Card>
	{/if}

	<!-- Admins List -->
	<Card>
		<CardHeader>
			<CardTitle class="flex items-center gap-2">
				<Shield class="h-5 w-5" />
				<span>Current Administrators</span>
				<span class="ml-auto text-sm font-normal text-gray-500">
					{data.admins.length} admin(s)
				</span>
			</CardTitle>
		</CardHeader>
		<CardContent>
			{#if data.admins.length === 0}
				<div class="py-12 text-center">
					<Shield class="mx-auto h-12 w-12 text-gray-400" />
					<h3 class="mt-4 text-lg font-semibold text-gray-900">No administrators yet</h3>
					<p class="mt-2 text-gray-600">Add your first administrator to get started.</p>
				</div>
			{:else}
				<div class="space-y-3">
					{#each data.admins as admin}
						<div class="flex items-center justify-between rounded-lg border p-4">
							<div class="flex items-center gap-4">
								<!-- Avatar -->
								<div
									class="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold"
								>
									{admin.name?.charAt(0).toUpperCase() || admin.email.charAt(0).toUpperCase()}
								</div>

								<!-- Info -->
								<div>
									<div class="font-semibold text-gray-900">
										{admin.name || 'Unknown'}
									</div>
									<div class="text-sm text-gray-600">{admin.email}</div>
									<div class="mt-1 flex gap-2">
										<Badge class={getRoleBadgeColor(admin.role)}>
											{formatRoleForDisplay(admin.role)}
										</Badge>
										<Badge class={getStatusBadgeColor(admin.status)}>
											{admin.status}
										</Badge>
									</div>
								</div>
							</div>

							<!-- Actions -->
							<div class="flex gap-2">
								<!-- Change Role -->
								<form method="POST" action="?/assignRole" use:enhance class="inline">
									<input type="hidden" name="userId" value={admin.id} />
									<Select name="role" class="h-8">
										<SelectTrigger>
											<SelectValue placeholder="Change Role" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="school_admin">School Admin</SelectItem>
											<SelectItem value="verifier">Verifier</SelectItem>
											<SelectItem value="treasurer">Treasurer</SelectItem>
										</SelectContent>
									</Select>
								</form>

								<!-- Revoke Access -->
								{#if admin.role !== 'super_admin'}
									<form method="POST" action="?/revokeAccess" use:enhance>
										<input type="hidden" name="userId" value={admin.id} />
										<Button type="submit" variant="destructive" size="icon" title="Revoke Access">
											<Trash2 class="h-4 w-4" />
										</Button>
									</form>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</CardContent>
	</Card>

	<!-- Role Descriptions -->
	<Card class="mt-6">
		<CardHeader>
			<CardTitle>Role Permissions</CardTitle>
		</CardHeader>
		<CardContent>
			<div class="grid gap-4 md:grid-cols-2">
				<div class="space-y-2">
					<h4 class="font-semibold text-blue-600">School Admin</h4>
					<ul class="list-disc list-inside space-y-1 text-sm text-gray-600">
						<li>Full access to school settings</li>
						<li>Manage other administrators</li>
						<li>Access verification workflow</li>
						<li>Access finance pages</li>
					</ul>
				</div>

				<div class="space-y-2">
					<h4 class="font-semibold text-green-600">Verifier</h4>
					<ul class="list-disc list-inside space-y-1 text-sm text-gray-600">
						<li>Access verification workflow</li>
						<li>Review applicant documents</li>
						<li>Update verification status</li>
					</ul>
				</div>

				<div class="space-y-2">
					<h4 class="font-semibold text-orange-600">Treasurer</h4>
					<ul class="list-disc list-inside space-y-1 text-sm text-gray-600">
						<li>Access finance pages</li>
						<li>Verify manual payments</li>
						<li>Generate invoices</li>
					</ul>
				</div>

				<div class="space-y-2">
					<h4 class="font-semibold text-purple-600">Super Admin</h4>
					<ul class="list-disc list-inside space-y-1 text-sm text-gray-600">
						<li>Manage all tenants</li>
						<li>Access global platform metrics</li>
						<li>System configuration</li>
					</ul>
				</div>
			</div>
		</CardContent>
	</Card>
</div>
