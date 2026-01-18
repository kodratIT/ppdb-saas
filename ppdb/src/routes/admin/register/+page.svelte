<script lang="ts">
	import Stepper from '$lib/components/ui/stepper/Stepper.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import { enhance } from '$app/forms';
	import { fade } from 'svelte/transition';
	import { identitySchema, locationSchema, adminSchema, type RegistrationFormData } from './schema';
	import type { ActionData } from './$types';
	import StepIdentity from './steps/StepIdentity.svelte';
	import StepLocation from './steps/StepLocation.svelte';
	import StepAdmin from './steps/StepAdmin.svelte';
	import StepReview from './steps/StepReview.svelte';

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
			<Stepper currentStep={currentStep} totalSteps={4} steps={steps} />
		</div>

		<div class="p-6 min-h-[400px]">
			{#if currentStep === 1}
				<div in:fade>
					<StepIdentity bind:formData {errors} onUpdate={(data) => (formData = { ...formData, ...data })} />
				</div>
			{:else if currentStep === 2}
				<div in:fade>
					<StepLocation bind:formData {errors} onUpdate={(data) => (formData = { ...formData, ...data })} />
				</div>
			{:else if currentStep === 3}
				<div in:fade>
					<StepAdmin bind:formData {errors} onUpdate={(data) => (formData = { ...formData, ...data })} />
				</div>
			{:else if currentStep === 4}
				<div in:fade>
					<StepReview {formData} />
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
