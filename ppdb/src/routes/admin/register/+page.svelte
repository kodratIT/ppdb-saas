<script lang="ts">
	import { onMount, tick } from 'svelte';
	import Stepper from '$lib/components/ui/stepper/Stepper.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardFooter, CardHeader } from '$lib/components/ui/card';
	import Progress from '$lib/components/ui/progress.svelte';
	import { enhance } from '$app/forms';
	import { fade } from 'svelte/transition';
	import { identitySchema, locationSchema, adminSchema, type RegistrationFormData } from './schema';
	import type { ActionData } from './$types';
	import StepIdentity from './steps/StepIdentity.svelte';
	import StepLocation from './steps/StepLocation.svelte';
	import StepAdmin from './steps/StepAdmin.svelte';
	import StepReview from './steps/StepReview.svelte';
	import { Confetti } from '$lib/components/ui/confetti';
	import { goto } from '$app/navigation';
	import Alert from '$lib/components/ui/alert.svelte';
	import { i18n } from '$lib/i18n/index.svelte';

	let { form } = $props<{ form: ActionData }>();

	const steps = $derived([
		i18n.t('admin.register.stepIdentity'),
		i18n.t('admin.register.stepLocation'),
		i18n.t('admin.register.stepAdmin'),
		i18n.t('admin.register.stepReview')
	]);
	const DRAFT_KEY = 'ppdb-register-draft';

	let currentStep = $state(1);
	let isSubmitting = $state(false);
	let showSuccess = $state(false);
	let errors = $state<Record<string, string[]>>({});
	let hasDraft = $state(false);
	let draftTimestamp = $state<string | null>(null);
	let showDraftNotice = $state(false);

	// Initialize with default values
	let formData = $state<Partial<RegistrationFormData>>({
		status: 'active',
		level: 'SMA',
		type: 'single',
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

	// Calculate form completion percentage
	const progress = $derived(() => {
		const fields = [
			'name',
			'slug',
			'level',
			'status',
			'province',
			'city',
			'district',
			'village',
			'address',
			'postalCode',
			'adminName',
			'email',
			'password',
			'whatsapp'
		];
		let filled = 0;
		fields.forEach((field) => {
			const value = formData[field as keyof typeof formData];
			if (value && String(value).trim() !== '') filled++;
		});
		return Math.round((filled / fields.length) * 100);
	});

	// Check for completed steps
	const completedSteps = $derived(() => {
		const completed: number[] = [];

		// Check step 1
		const step1Result = identitySchema.safeParse(formData);
		if (step1Result.success) completed.push(1);

		// Check step 2
		const step2Result = locationSchema.safeParse(formData);
		if (step2Result.success) completed.push(2);

		// Check step 3
		const step3Result = adminSchema.safeParse(formData);
		if (step3Result.success) completed.push(3);

		return completed;
	});

	// Load draft on mount
	onMount(() => {
		loadDraft();
		setupKeyboardShortcuts();
	});

	function loadDraft() {
		try {
			const savedDraft = localStorage.getItem(DRAFT_KEY);
			if (savedDraft) {
				const { data, timestamp, step } = JSON.parse(savedDraft);
				hasDraft = true;
				draftTimestamp = new Date(timestamp).toLocaleString(
					i18n.language === 'id' ? 'id-ID' : 'en-US'
				);
				showDraftNotice = true;
			}
		} catch (e) {
			console.error('Failed to load draft:', e);
		}
	}

	function restoreDraft() {
		try {
			const savedDraft = localStorage.getItem(DRAFT_KEY);
			if (savedDraft) {
				const { data, step } = JSON.parse(savedDraft);
				formData = { ...formData, ...data };
				currentStep = step || 1;
				showDraftNotice = false;
			}
		} catch (e) {
			console.error('Failed to restore draft:', e);
		}
	}

	async function saveDraft() {
		try {
			localStorage.setItem(
				DRAFT_KEY,
				JSON.stringify({
					data: formData,
					step: currentStep,
					timestamp: new Date().toISOString()
				})
			);
			hasDraft = true;
			draftTimestamp = new Date().toLocaleString(i18n.language === 'id' ? 'id-ID' : 'en-US');

			// Show temporary success notification
			const notification = document.createElement('div');
			notification.className =
				'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg animate-in slide-in-from-bottom-2 z-50';
			notification.textContent = `✓ ${i18n.t('admin.register.draftSaved')}`;
			document.body.appendChild(notification);
			setTimeout(() => notification.remove(), 2000);
		} catch (e) {
			console.error('Failed to save draft:', e);
		}
	}

	function clearDraft() {
		localStorage.removeItem(DRAFT_KEY);
		hasDraft = false;
		draftTimestamp = null;
		showDraftNotice = false;
	}

	function dismissDraftNotice() {
		showDraftNotice = false;
	}

	function setupKeyboardShortcuts() {
		function handleKeydown(e: KeyboardEvent) {
			// Save draft: Ctrl+S / Cmd+S
			if ((e.ctrlKey || e.metaKey) && e.key === 's') {
				e.preventDefault();
				saveDraft();
			}

			// Next step: Ctrl+Enter
			if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && !e.shiftKey) {
				e.preventDefault();
				if (currentStep < 4) nextStep();
			}

			// Previous step: Arrow Left or Escape
			if (e.key === 'ArrowLeft' && e.altKey) {
				e.preventDefault();
				prevStep();
			}

			// Go to step: Alt+1, Alt+2, Alt+3, Alt+4
			if (e.altKey && ['1', '2', '3', '4'].includes(e.key)) {
				e.preventDefault();
				const targetStep = parseInt(e.key);
				if (targetStep <= currentStep || completedSteps().includes(targetStep - 1)) {
					gotoStep(targetStep);
				}
			}
		}

		window.addEventListener('keydown', handleKeydown);
		return () => window.removeEventListener('keydown', handleKeydown);
	}

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
			errors = result.error.flatten().fieldErrors as any;
			return false;
		}
		return true;
	}

	function nextStep() {
		if (validateStep(currentStep)) {
			currentStep++;
			// Auto-save draft when moving to next step
			saveDraft();
		}
	}

	function prevStep() {
		if (currentStep > 1) {
			currentStep--;
			errors = {};
		}
	}

	function gotoStep(step: number) {
		if (step >= 1 && step <= 4) {
			// Can go back freely, but forward only if validated
			if (step < currentStep) {
				currentStep = step;
				errors = {};
			} else if (step > currentStep) {
				// Validate all steps up to target
				for (let i = currentStep; i < step; i++) {
					if (!validateStep(i)) {
						return;
					}
				}
				currentStep = step;
			}
		}
	}
</script>

<svelte:head>
	<title>{i18n.t('admin.register.title')} | PPDB Admin</title>
	<meta name="description" content={i18n.t('admin.register.subtitle')} />
</svelte:head>

<div class="max-w-4xl mx-auto py-10 px-4">
	<!-- Page Header -->
	<div class="mb-6">
		<h1 class="text-2xl font-bold text-gray-900 dark:text-white">
			{i18n.t('admin.register.title')}
		</h1>
		<p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
			{i18n.t('admin.register.subtitle')}
		</p>
	</div>

	<!-- Draft Notice -->
	{#if showDraftNotice}
		<div
			class="mb-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg"
			transition:fade
		>
			<div class="flex items-start justify-between">
				<div class="flex items-center gap-3">
					<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
						/>
					</svg>
					<div>
						<p class="font-medium text-amber-900 dark:text-amber-100">
							{i18n.t('admin.register.draftFound')}
						</p>
						<p class="text-sm text-amber-700 dark:text-amber-300">
							{i18n.t('admin.register.draftFoundMessage', { timestamp: draftTimestamp || '' })}
						</p>
					</div>
				</div>
				<div class="flex gap-2">
					<Button variant="outline" size="sm" onclick={restoreDraft}
						>{i18n.t('admin.register.restore')}</Button
					>
					<Button variant="ghost" size="sm" onclick={dismissDraftNotice}
						>{i18n.t('admin.register.dismiss')}</Button
					>
				</div>
			</div>
		</div>
	{/if}

	<!-- Progress Bar -->
	<div class="mb-6 p-4 bg-muted/30 rounded-lg border">
		<div class="flex items-center justify-between mb-2">
			<span class="text-sm font-medium">{i18n.t('admin.register.formProgress')}</span>
			<span
				class="text-sm font-bold {progress() >= 100 ? 'text-green-600' : 'text-muted-foreground'}"
			>
				{progress()}%
			</span>
		</div>
		<Progress value={progress()} max={100} class="h-2" showLabel={false} />
		{#if hasDraft && draftTimestamp}
			<p class="mt-2 text-xs text-muted-foreground">
				{i18n.t('admin.register.lastSaved', { timestamp: draftTimestamp })}
			</p>
		{/if}
	</div>

	<!-- Main Card -->
	<Card class="overflow-hidden">
		<CardHeader class="pb-4 border-b">
			<Stepper {currentStep} totalSteps={4} {steps} />
		</CardHeader>

		<CardContent class="p-8 min-h-[400px]">
			{#if currentStep === 1}
				<div in:fade={{ duration: 150 }}>
					<StepIdentity
						bind:formData
						{errors}
						onUpdate={(data) => (formData = { ...formData, ...data })}
					/>
				</div>
			{:else if currentStep === 2}
				<div in:fade={{ duration: 150 }}>
					<StepLocation
						bind:formData
						{errors}
						onUpdate={(data) => (formData = { ...formData, ...data })}
					/>
				</div>
			{:else if currentStep === 3}
				<div in:fade={{ duration: 150 }}>
					<StepAdmin
						bind:formData
						{errors}
						onUpdate={(data) => (formData = { ...formData, ...data })}
					/>
				</div>
			{:else if currentStep === 4}
				<div in:fade={{ duration: 150 }}>
					<StepReview {formData} onEditSection={gotoStep} />
				</div>
			{/if}
		</CardContent>

		<CardFooter class="px-6 py-4 bg-muted/30 border-t flex justify-between items-center">
			<div class="flex gap-2">
				<Button variant="outline" onclick={prevStep} disabled={currentStep === 1 || isSubmitting}>
					<svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M15 19l-7-7 7-7"
						/>
					</svg>
					{i18n.t('common.back')}
				</Button>

				<Button variant="ghost" onclick={saveDraft} disabled={isSubmitting}>
					<svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
						/>
					</svg>
					{i18n.t('admin.register.saveDraft')}
				</Button>
			</div>

			{#if currentStep < 4}
				<Button onclick={nextStep}>
					{i18n.t('common.next')}
					<svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9 5l7 7-7 7"
						/>
					</svg>
				</Button>
			{:else}
				<form
					method="POST"
					action="?/create"
					use:enhance={() => {
						isSubmitting = true;
						return async ({ result, update }) => {
							await update();
							isSubmitting = false;

							if (result.type === 'success' && result.data?.success) {
								showSuccess = true;
								clearDraft();

								setTimeout(() => {
									goto('/admin/schools');
								}, 3000);
							}
						};
					}}
				>
					<!-- Hidden inputs -->
					<input type="hidden" name="name" value={formData.name} />
					<input type="hidden" name="slug" value={formData.slug} />
					<input type="hidden" name="adminEmail" value={formData.email} />
					<input type="hidden" name="adminPassword" value={formData.password} />
					<input type="hidden" name="formData" value={JSON.stringify(formData)} />

					<Button type="submit" disabled={isSubmitting}>
						{#if isSubmitting}
							<svg class="w-4 h-4 mr-2 animate-spin" viewBox="0 0 24 24">
								<circle
									class="opacity-25"
									cx="12"
									cy="12"
									r="10"
									stroke="currentColor"
									stroke-width="4"
									fill="none"
								/>
								<path
									class="opacity-75"
									fill="currentColor"
									d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
								/>
							</svg>
							{i18n.t('admin.register.creating')}
						{:else}
							<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M5 13l4 4L19 7"
								/>
							</svg>
							{i18n.t('admin.register.completeRegistration')}
						{/if}
					</Button>
				</form>
			{/if}
		</CardFooter>
	</Card>

	<!-- Keyboard Shortcuts Hint -->
	<div class="mt-4 text-center">
		<p class="text-xs text-muted-foreground">
			{i18n.t('admin.register.keyboardShortcuts')}: {i18n.t(
				'admin.register.keyboardShortcutsContent'
			)}
		</p>
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

	<!-- Success Message -->
	{#if showSuccess || form?.success}
		<Confetti />
		<div
			class="mt-4 p-4 rounded-md bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-200 border border-green-200 dark:border-red-800"
			transition:fade
		>
			<div class="flex items-center gap-2">
				<svg
					class="w-5 h-5"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
					></path>
				</svg>
				<div>
					<p class="font-medium">🎉 {i18n.t('admin.register.registrationSuccess')}</p>
					<p class="text-sm">{i18n.t('admin.register.redirecting')}</p>
				</div>
			</div>
		</div>
	{/if}
</div>
