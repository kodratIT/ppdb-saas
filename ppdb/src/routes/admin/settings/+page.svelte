<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { enhance } from '$app/forms';

	export let data: PageData;
	export let form: ActionData;

	let saving = false;

	// Type guard for form errors
	$: hasErrors: Record<string, string[]> | null = (form && 'errors' in form && form.errors) ? form.errors : null;
</script>

<div class="container mx-auto px-4 py-8 max-w-4xl">
	<h1 class="text-3xl font-bold mb-6">School Profile Settings</h1>

	{#if form?.success}
		<div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
			Profile updated successfully!
		</div>
	{/if}

	{#if form?.error}
		<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
			{form.error}
		</div>
	{/if}

	<form
		method="POST"
		action="?/updateProfile"
		use:enhance={() => {
			saving = true;
			return async ({ update }) => {
				await update();
				saving = false;
			};
		}}
		class="space-y-6"
	>
		<!-- Core Fields (MVP) -->
		<div class="bg-white shadow-md rounded-lg p-6 space-y-4">
			<h2 class="text-xl font-semibold mb-4">Basic Information</h2>

			<div>
				<label for="name" class="block text-sm font-medium text-gray-700 mb-1">
					School Name <span class="text-red-500">*</span>
				</label>
				<input
					type="text"
					id="name"
					name="name"
					value={data.profile.name}
					required
					class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
					class:border-red-500={hasErrors && hasErrors.name}
				/>
				{#if hasErrors && hasErrors.name}
					<p class="text-red-500 text-sm mt-1">{hasErrors.name[0]}</p>
				{/if}
			</div>

			<div>
				<label for="description" class="block text-sm font-medium text-gray-700 mb-1">
					Description
				</label>
				<textarea
					id="description"
					name="description"
					value={data.profile.description || ''}
					rows="4"
					class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
					class:border-red-500={hasErrors && hasErrors.description}
				></textarea>
				{#if hasErrors && hasErrors.description}
					<p class="text-red-500 text-sm mt-1">{hasErrors.description[0]}</p>
				{/if}
			</div>

			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div>
					<label for="contactEmail" class="block text-sm font-medium text-gray-700 mb-1">
						Contact Email
					</label>
					<input
						type="email"
						id="contactEmail"
						name="contactEmail"
						value={data.profile.contactEmail || ''}
						class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						class:border-red-500={hasErrors && hasErrors.contactEmail}
					/>
					{#if hasErrors && hasErrors.contactEmail}
						<p class="text-red-500 text-sm mt-1">{hasErrors.contactEmail[0]}</p>
					{/if}
				</div>

				<div>
					<label for="contactPhone" class="block text-sm font-medium text-gray-700 mb-1">
						Contact Phone
					</label>
					<input
						type="tel"
						id="contactPhone"
						name="contactPhone"
						value={data.profile.contactPhone || ''}
						placeholder="08123456789"
						class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						class:border-red-500={hasErrors && hasErrors.contactPhone}
					/>
					{#if hasErrors && hasErrors.contactPhone}
						<p class="text-red-500 text-sm mt-1">{hasErrors.contactPhone[0]}</p>
					{/if}
				</div>
			</div>

			<div>
				<label for="address" class="block text-sm font-medium text-gray-700 mb-1"> Address </label>
				<textarea
					id="address"
					name="address"
					value={data.profile.address || ''}
					rows="3"
					class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
					class:border-red-500={hasErrors && hasErrors.address}
				></textarea>
				{#if hasErrors && hasErrors.address}
					<p class="text-red-500 text-sm mt-1">{hasErrors.address[0]}</p>
				{/if}
			</div>

			<div>
				<label for="description" class="block text-sm font-medium text-gray-700 mb-1">
					Description
				</label>
				<textarea
					id="description"
					name="description"
					value={data.profile.description || ''}
					rows="4"
					class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
					class:border-red-500={hasErrors && hasErrors.description}
				></textarea>
				{#if hasErrors && hasErrors.description}
					<p class="text-red-500 text-sm mt-1">{hasErrors.description[0]}</p>
				{/if}
			</div>

			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div>
					<label for="contactEmail" class="block text-sm font-medium text-gray-700 mb-1">
						Contact Email
					</label>
					<input
						type="email"
						id="contactEmail"
						name="contactEmail"
						value={data.profile.contactEmail || ''}
						class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						class:border-red-500={hasErrors && hasErrors.contactEmail}
					/>
					{#if hasErrors && hasErrors.contactEmail}
						<p class="text-red-500 text-sm mt-1">{hasErrors.contactEmail[0]}</p>
					{/if}
				</div>

				<div>
					<label for="contactPhone" class="block text-sm font-medium text-gray-700 mb-1">
						Contact Phone
					</label>
					<input
						type="tel"
						id="contactPhone"
						name="contactPhone"
						value={data.profile.contactPhone || ''}
						placeholder="08123456789"
						class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						class:border-red-500={hasErrors && hasErrors.contactPhone}
					/>
					{#if hasErrors && hasErrors.contactPhone}
						<p class="text-red-500 text-sm mt-1">{hasErrors.contactPhone[0]}</p>
					{/if}
				</div>
			</div>

			<div>
				<label for="address" class="block text-sm font-medium text-gray-700 mb-1"> Address </label>
				<textarea
					id="address"
					name="address"
					value={data.profile.address || ''}
					rows="3"
					class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
					class:border-red-500={hasErrors && hasErrors.address}
				></textarea>
				{#if hasErrors && hasErrors.address}
					<p class="text-red-500 text-sm mt-1">{hasErrors.address[0]}</p>
				{/if}
			</div>
		</div>

		<!-- Progressive Enhancement Fields -->
		<div class="bg-white shadow-md rounded-lg p-6 space-y-4">
			<h2 class="text-xl font-semibold mb-4">Branding (Optional)</h2>

			<div>
				<label for="logoUrl" class="block text-sm font-medium text-gray-700 mb-1"> Logo URL </label>
				<input
					type="url"
					id="logoUrl"
					name="logoUrl"
					value={data.profile.logoUrl || ''}
					placeholder="https://example.com/logo.png"
					class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
					class:border-red-500={hasErrors && hasErrors.logoUrl}
				/>
				{#if hasErrors && hasErrors.logoUrl}
					<p class="text-red-500 text-sm mt-1">{hasErrors.logoUrl[0]}</p>
				{/if}
			</div>

			<div>
				<label for="bannerUrl" class="block text-sm font-medium text-gray-700 mb-1">
					Banner URL
				</label>
				<input
					type="url"
					id="bannerUrl"
					name="bannerUrl"
					value={data.profile.bannerUrl || ''}
					placeholder="https://example.com/banner.jpg"
					class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
					class:border-red-500={hasErrors && hasErrors.bannerUrl}
				/>
				{#if hasErrors && hasErrors.bannerUrl}
					<p class="text-red-500 text-sm mt-1">{hasErrors.bannerUrl[0]}</p>
				{/if}
			</div>

			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div>
					<label for="primaryColor" class="block text-sm font-medium text-gray-700 mb-1">
						Primary Color
					</label>
					<input
						type="color"
						id="primaryColor"
						name="primaryColor"
						value={data.profile.primaryColor || '#002C5F'}
						class="w-full h-10 px-1 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>
					{#if hasErrors && hasErrors.primaryColor}
						<p class="text-red-500 text-sm mt-1">{hasErrors.primaryColor[0]}</p>
					{/if}
				</div>

				<div>
					<label for="secondaryColor" class="block text-sm font-medium text-gray-700 mb-1">
						Secondary Color
					</label>
					<input
						type="color"
						id="secondaryColor"
						name="secondaryColor"
						value={data.profile.secondaryColor || '#FFFFFF'}
						class="w-full h-10 px-1 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>
					{#if hasErrors && hasErrors.secondaryColor}
						<p class="text-red-500 text-sm mt-1">{hasErrors.secondaryColor[0]}</p>
					{/if}
				</div>
			</div>
		</div>

		<div class="flex justify-end">
			<button
				type="submit"
				disabled={saving}
				class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
			>
				{saving ? 'Saving...' : 'Save Changes'}
			</button>
		</div>
	</form>
</div>
