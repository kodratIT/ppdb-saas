<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { enhance } from '$app/forms';
	import Input from '$lib/components/ui/input.svelte';
	import Label from '$lib/components/ui/label.svelte';
	import Textarea from '$lib/components/ui/textarea.svelte';
	import FormError from '$lib/components/forms/form-error.svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let saving = $state(false);

	// Type guard for form errors
	let errors = $derived(
		form && 'errors' in form && form.errors ? (form.errors as Record<string, string[]>) : null
	);
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
				<Label for="name" class="block text-gray-700 mb-1">
					School Name <span class="text-red-500">*</span>
				</Label>
				<Input
					id="name"
					name="name"
					value={data.profile.name}
					required
					class={errors?.name ? 'border-red-500' : ''}
				/>
				<FormError {errors} field="name" />
			</div>

			<div>
				<Label for="description" class="block text-gray-700 mb-1">Description</Label>
				<Textarea
					id="description"
					name="description"
					value={data.profile.description || ''}
					rows={4}
					class={errors?.description ? 'border-red-500' : ''}
				/>
				<FormError {errors} field="description" />
			</div>

			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div>
					<Label for="contactEmail" class="block text-gray-700 mb-1">Contact Email</Label>
					<Input
						type="email"
						id="contactEmail"
						name="contactEmail"
						value={data.profile.contactEmail || ''}
						class={errors?.contactEmail ? 'border-red-500' : ''}
					/>
					<FormError {errors} field="contactEmail" />
				</div>

				<div>
					<Label for="contactPhone" class="block text-gray-700 mb-1">Contact Phone</Label>
					<Input
						type="tel"
						id="contactPhone"
						name="contactPhone"
						value={data.profile.contactPhone || ''}
						placeholder="08123456789"
						class={errors?.contactPhone ? 'border-red-500' : ''}
					/>
					<FormError {errors} field="contactPhone" />
				</div>
			</div>

			<div>
				<Label for="address" class="block text-gray-700 mb-1">Address</Label>
				<Textarea
					id="address"
					name="address"
					value={data.profile.address || ''}
					rows={3}
					class={errors?.address ? 'border-red-500' : ''}
				/>
				<FormError {errors} field="address" />
			</div>
		</div>

		<!-- Progressive Enhancement Fields -->
		<div class="bg-white shadow-md rounded-lg p-6 space-y-4">
			<h2 class="text-xl font-semibold mb-4">Branding (Optional)</h2>

			<div>
				<Label for="logoUrl" class="block text-gray-700 mb-1">Logo URL</Label>
				<Input
					type="url"
					id="logoUrl"
					name="logoUrl"
					value={data.profile.logoUrl || ''}
					placeholder="https://example.com/logo.png"
					class={errors?.logoUrl ? 'border-red-500' : ''}
				/>
				<FormError {errors} field="logoUrl" />
			</div>

			<div>
				<Label for="bannerUrl" class="block text-gray-700 mb-1">Banner URL</Label>
				<Input
					type="url"
					id="bannerUrl"
					name="bannerUrl"
					value={data.profile.bannerUrl || ''}
					placeholder="https://example.com/banner.jpg"
					class={errors?.bannerUrl ? 'border-red-500' : ''}
				/>
				<FormError {errors} field="bannerUrl" />
			</div>

			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div>
					<Label for="primaryColor" class="block text-gray-700 mb-1">Primary Color</Label>
					<Input
						type="color"
						id="primaryColor"
						name="primaryColor"
						value={data.profile.primaryColor || '#002C5F'}
						class={errors?.primaryColor ? 'border-red-500 h-10 px-1 py-1' : 'h-10 px-1 py-1'}
					/>
					<FormError {errors} field="primaryColor" />
				</div>

				<div>
					<Label for="secondaryColor" class="block text-gray-700 mb-1">Secondary Color</Label>
					<Input
						type="color"
						id="secondaryColor"
						name="secondaryColor"
						value={data.profile.secondaryColor || '#FFFFFF'}
						class={errors?.secondaryColor ? 'border-red-500 h-10 px-1 py-1' : 'h-10 px-1 py-1'}
					/>
					<FormError {errors} field="secondaryColor" />
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
