<script lang="ts">
	import Stepper from '$lib/components/ui/stepper/Stepper.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import { enhance } from '$app/forms';
	import { fade } from 'svelte/transition';
	import { identitySchema, locationSchema, adminSchema, type RegistrationFormData } from './schema';
	import type { ActionData } from './$types';

	let { form } = $props<{ form: ActionData }>();

	const steps = ['Identity', 'Location', 'Admin Account', 'Review'];

	let currentStep = $state(1);
	let isSubmitting = $state(false);
	let errors = $state<Record<string, string[]>>({});

	// Initialize with default values
	let formData = $state<Partial<RegistrationFormData>>({
		status: 'active',
		level: 'SMA',
		// Initialize other fields to empty strings to avoid uncontrolled/controlled warnings if bound later
		name: '',
		npsn: '',
		slug: '',
		province: '',
		city: '',
		district: '',
		village: '',
		address: '',
		postalCode: '',
		adminName: '',
		email: '',
		password: '',
		whatsapp: ''
	});

	function validateStep(step: number): boolean {
		errors = {};
		let result;

		if (step === 1) {
			result = identitySchema.safeParse(formData);
		} else if (step === 2) {
			result = locationSchema.safeParse(formData);
		} else if (step === 3) {
			result = adminSchema.safeParse(formData);
		} else {
			return true;
		}

		if (!result.success) {
			errors = result.error.flatten().fieldErrors;
			return false;
		}
		return true;
	}

	function nextStep() {
		if (validateStep(currentStep)) {
			currentStep++;
		}
	}

	function prevStep() {
		if (currentStep > 1) {
			currentStep--;
			errors = {}; // Clear errors when going back
		}
	}
</script>

<div class="max-w-4xl mx-auto py-6">
	<div class="mb-8">
		<h1 class="text-2xl font-bold text-gray-900 dark:text-white">Register New School</h1>
		<p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
			Complete the steps below to set up a new school tenant.
		</p>
	</div>

	<div
		class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700"
	>
		<div class="p-6">
			<Stepper {steps} {currentStep} />
		</div>

		<div class="p-6 min-h-[400px]">
			{#if currentStep === 1}
				<div class="space-y-4" in:fade>
					<h2 class="text-lg font-medium">School Identity</h2>
					<div
						class="p-8 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg text-center text-gray-500"
					>
						<p>Step 1: School Name, NPSN, Level, Slug</p>
						<p class="text-xs mt-2">Inputs will be implemented here</p>
						<!-- Temporary Debug: Show validation errors -->
						{#if Object.keys(errors).length > 0}
							<div class="mt-4 text-red-500 text-sm text-left">
								<pre>{JSON.stringify(errors, null, 2)}</pre>
							</div>
						{/if}
					</div>
				</div>
			{:else if currentStep === 2}
				<div class="space-y-4" in:fade>
					<h2 class="text-lg font-medium">Location Details</h2>
					<div
						class="p-8 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg text-center text-gray-500"
					>
						<p>Step 2: Address, Province, City, District</p>
						<p class="text-xs mt-2">Inputs will be implemented here</p>
					</div>
				</div>
			{:else if currentStep === 3}
				<div class="space-y-4" in:fade>
					<h2 class="text-lg font-medium">Super Admin Account</h2>
					<div
						class="p-8 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg text-center text-gray-500"
					>
						<p>Step 3: Admin Name, Email, Password, WhatsApp</p>
						<p class="text-xs mt-2">Inputs will be implemented here</p>
					</div>
				</div>
			{:else if currentStep === 4}
				<div class="space-y-4" in:fade>
					<h2 class="text-lg font-medium">Review & Submit</h2>
					<div class="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-lg space-y-4">
						<h3 class="font-medium">Summary</h3>
						<div class="grid grid-cols-2 gap-4 text-sm">
							<div>
								<span class="text-gray-500 block">School Name</span>
								<span class="font-medium">{formData.name || '-'}</span>
							</div>
							<div>
								<span class="text-gray-500 block">Level</span>
								<span class="font-medium">{formData.level || '-'}</span>
							</div>
							<div>
								<span class="text-gray-500 block">Email</span>
								<span class="font-medium">{formData.email || '-'}</span>
							</div>
						</div>
					</div>
				</div>
			{/if}
		</div>

		<!-- Footer Actions -->
		<div
			class="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center rounded-b-lg"
		>
			<Button variant="outline" onclick={prevStep} disabled={currentStep === 1 || isSubmitting}>
				Back
			</Button>

			{#if currentStep < 4}
				<Button onclick={nextStep}>Next Step</Button>
			{:else}
				<form
					method="POST"
					action="?/create"
					use:enhance={() => {
						isSubmitting = true;
						return async ({ update }) => {
							await update();
							isSubmitting = false;
						};
					}}
				>
					<!-- Hidden inputs mapping to existing server action requirements -->
					<input type="hidden" name="name" value={formData.name} />
					<input type="hidden" name="slug" value={formData.slug} />
					<input type="hidden" name="adminEmail" value={formData.email} />
					<input type="hidden" name="adminPassword" value={formData.password} />

					<!-- Additional data for future action update -->
					<input type="hidden" name="formData" value={JSON.stringify(formData)} />

					<Button type="submit" disabled={isSubmitting}>
						{#if isSubmitting}
							Creating...
						{:else}
							Complete Registration
						{/if}
					</Button>
				</form>
			{/if}
		</div>
	</div>

	<!-- Server Messages -->
	{#if form?.message}
		<div
			class="mt-4 p-4 rounded-md bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800"
			transition:fade
		>
			{form.message}
		</div>
	{/if}

	{#if form?.success}
		<div
			class="mt-4 p-4 rounded-md bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800"
			transition:fade
		>
			Registration Successful!
		</div>
	{/if}
</div>
