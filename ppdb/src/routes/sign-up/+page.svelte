<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';

	let { form } = $props();
	let errors = $state({ email: '', password: '', confirmPassword: '' });
	let loading = $state(false);
</script>

<div class="min-h-screen flex items-center justify-center bg-gray-50">
	<div class="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
		<div>
			<h1 class="text-3xl font-bold text-center text-gray-900">Sign Up</h1>
			<p class="mt-2 text-center text-sm text-gray-600">Create your account</p>
		</div>

		{#if form?.error}
			<div class="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-md" role="alert">
				{form.error}
			</div>
		{/if}

		<form
			method="POST"
			class="space-y-6"
			use:enhance={() => {
				loading = true;
				return async () => {
					loading = false;
				};
			}}
		>
			<div>
				<label for="email" class="block text-sm font-medium text-gray-700"> Email address </label>
				<input
					id="email"
					name="email"
					type="email"
					required
					class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
					placeholder="admin@example.com"
				/>
				{#if errors.email}
					<p class="mt-2 text-sm text-red-600">{errors.email}</p>
				{/if}
			</div>

			<div>
				<label for="password" class="block text-sm font-medium text-gray-700"> Password </label>
				<input
					id="password"
					name="password"
					type="password"
					required
					minlength="6"
					class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
					placeholder="•••••••••"
				/>
				{#if errors.password}
					<p class="mt-2 text-sm text-red-600">{errors.password}</p>
				{/if}
			</div>

			<div>
				<label for="confirmPassword" class="block text-sm font-medium text-gray-700">
					Confirm Password
				</label>
				<input
					id="confirmPassword"
					name="confirmPassword"
					type="password"
					required
					minlength="6"
					class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
					placeholder="•••••••••"
				/>
				{#if errors.confirmPassword}
					<p class="mt-2 text-sm text-red-600">{errors.confirmPassword}</p>
				{/if}
			</div>

			<button
				type="submit"
				disabled={loading}
				class="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
			>
				{#if loading}
					Creating account...
				{:else}
					Sign Up
				{/if}
			</button>
		</form>

		<div class="text-center">
			<a href="/sign-in" class="text-sm text-indigo-600 hover:text-indigo-500">
				Already have an account? Sign in
			</a>
		</div>
	</div>
</div>
