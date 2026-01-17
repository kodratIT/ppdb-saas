<script lang="ts">
	/* eslint-disable svelte/require-each-key */
	import { enhance } from '$app/forms';
	import { formatRoleForDisplay } from '$lib/schema/school-admin';
	import Input from '$lib/components/ui/input.svelte';
	import Label from '$lib/components/ui/label.svelte';
	import Badge from '$lib/components/ui/badge.svelte';

	let { data, form } = $props();

	let showCreateForm = false;
	let createEmail = '';
	let createName = '';
	let createRole: 'school_admin' | 'verifier' | 'treasurer' | 'interviewer' = 'school_admin';
</script>

<div class="container mx-auto py-6 space-y-6">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold text-gray-900">School Admin Management</h1>
			<p class="text-gray-600 mt-1">Manage administrators and their access levels</p>
		</div>
		<button
			onclick={() => (showCreateForm = !showCreateForm)}
			class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
		>
			<span>+ Add Admin</span>
		</button>
	</div>

	<!-- Create Admin Form (Collapsible) -->
	{#if showCreateForm}
		<div class="bg-white shadow-md rounded-lg p-6 mb-6">
			<h2 class="text-xl font-semibold mb-4">Invite New Admin</h2>
			<form method="POST" action="?/createAdmin" use:enhance class="space-y-4">
				<!-- Email -->
				<div>
					<Label for="email" class="block text-gray-700 mb-1">Email Address</Label>
					<Input
						type="email"
						id="email"
						name="email"
						placeholder="admin@school.com"
						bind:value={createEmail}
						required
					/>
				</div>

				<!-- Name -->
				<div>
					<Label for="name" class="block text-gray-700 mb-1">Full Name</Label>
					<Input
						type="text"
						id="name"
						name="name"
						placeholder="Admin Name"
						bind:value={createName}
						required
					/>
				</div>

				<!-- Role -->
				<div>
					<Label for="role" class="block text-gray-700 mb-1">Role</Label>
					<select
						id="role"
						name="role"
						bind:value={createRole}
						class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
					>
						<option value="school_admin">School Admin</option>
						<option value="verifier">Verifier</option>
						<option value="treasurer">Treasurer</option>
						<option value="interviewer">Interviewer</option>
					</select>
				</div>

				<!-- Actions -->
				<div class="flex gap-2 justify-end">
					<button
						type="button"
						onclick={() => (showCreateForm = false)}
						class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
					>
						Cancel
					</button>
					<button
						type="submit"
						class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
					>
						Send Invite
					</button>
				</div>
			</form>

			{#if form?.message}
				<div class="mt-4 bg-red-50 p-4 rounded-md text-red-800">
					{form.message}
				</div>
			{/if}
		</div>
	{/if}

	<!-- Admins List -->
	<div class="bg-white shadow-md rounded-lg overflow-hidden">
		<div class="px-6 py-4 border-b border-gray-200 flex items-center gap-2">
			<svg class="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
				/>
			</svg>
			<span class="font-semibold">Current Administrators</span>
			<span class="ml-auto text-sm text-gray-500">{data.admins.length} admin(s)</span>
		</div>

		{#if data.admins.length === 0}
			<div class="py-12 text-center">
				<svg
					class="mx-auto h-12 w-12 text-gray-400"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
					/>
				</svg>
				<h3 class="mt-4 text-lg font-semibold text-gray-900">No administrators yet</h3>
				<p class="mt-2 text-gray-600">Add your first administrator to get started.</p>
			</div>
		{:else}
			<div class="divide-y divide-gray-200">
				{#each data.admins as admin}
					<div class="p-6 flex items-center justify-between">
						<div class="flex items-center gap-4">
							<!-- Avatar -->
							<div
								class="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white font-bold"
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
									<Badge variant="role" role={admin.role}>
										{formatRoleForDisplay(admin.role)}
									</Badge>
									<Badge variant="status" status={admin.status}>
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
								<select
									name="role"
									class="h-8 px-2 border border-gray-300 rounded-md text-sm"
									onchange={(e) => e.currentTarget.form?.requestSubmit()}
								>
									<option value="school_admin" selected={admin.role === 'school_admin'}
										>School Admin</option
									>
									<option value="verifier" selected={admin.role === 'verifier'}>Verifier</option>
									<option value="treasurer" selected={admin.role === 'treasurer'}>Treasurer</option>
									<option value="interviewer" selected={admin.role === 'interviewer'}
										>Interviewer</option
									>
								</select>
							</form>

							<!-- Revoke Access -->
							{#if admin.role !== 'super_admin'}
								<form method="POST" action="?/revokeAccess" use:enhance>
									<input type="hidden" name="userId" value={admin.id} />
									<button
										type="submit"
										class="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
										title="Revoke Access"
									>
										Remove
									</button>
								</form>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>

	<!-- Role Descriptions -->
	<div class="bg-white shadow-md rounded-lg p-6 mt-6">
		<h2 class="text-xl font-semibold mb-4">Role Permissions</h2>
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
	</div>
</div>
