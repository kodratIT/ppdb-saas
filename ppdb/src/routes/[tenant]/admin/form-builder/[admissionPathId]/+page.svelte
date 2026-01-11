<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button';
	import { Loader2, Save, Eye, ChevronRight, Check } from 'lucide-svelte';
	import FieldPalette from '$lib/components/admin/form-builder/FieldPalette.svelte';
	import FormCanvas from '$lib/components/admin/form-builder/FormCanvas.svelte';
	import FieldConfigModal from '$lib/components/admin/form-builder/FieldConfigModal.svelte';

	let { data } = $props();

	// Svelte 5 Runes
	let admissionPathId = $derived(page.params.admissionPathId);
	let tenant = $derived(page.params.tenant);
	let currentStep = $state(1);
	let fields = $state<any[]>([]);
	let isLoading = $state(true);
	let isSaving = $state(false);
	let showSuccess = $state(false);

	// Modal state
	let isModalOpen = $state(false);
	let editingField = $state<any>(null);

	async function loadFields() {
		isLoading = true;
		try {
			const res = await fetch(`/api/admin/form-builder/${admissionPathId}?step=${currentStep}`);
			if (res.ok) {
				const data = await res.json();
				// Ensure each field has an id for dndzone
				fields = data.map((f: any) => ({
					...f,
					id: f.id || Math.random().toString(36).substring(2, 11)
				}));
			} else {
				console.error('Failed to load fields');
			}
		} catch (e) {
			console.error('Error loading fields:', e);
		} finally {
			isLoading = false;
		}
	}

	async function saveChanges() {
		isSaving = true;
		try {
			const res = await fetch(`/api/admin/form-builder/${admissionPathId}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ fields, step: currentStep })
			});

			if (res.ok) {
				showSuccess = true;
				setTimeout(() => (showSuccess = false), 3000);
				await loadFields(); // Reload to get proper IDs from DB
			} else {
				const err = await res.json();
				console.error('Failed to save changes:', err);
			}
		} catch (e) {
			console.error('Error saving changes:', e);
		} finally {
			isSaving = false;
		}
	}

	function openEdit(field: any) {
		editingField = field;
		isModalOpen = true;
	}

	function handleFieldUpdate() {
		// Field in 'fields' array is already updated due to $bindable
		// But we can trigger extra logic here if needed
		fields = [...fields];
	}

	onMount(loadFields);

	// Effect to reload when step changes
	$effect(() => {
		if (currentStep) {
			loadFields();
		}
	});
</script>

<div class="flex h-screen flex-col overflow-hidden bg-slate-50/50">
	<!-- Header -->
	<header class="flex h-16 items-center justify-between border-b bg-white px-6 shadow-sm z-10">
		<div class="flex items-center gap-4">
			<a
				href="/{tenant}/admin/admission-paths"
				class="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
			>
				Admission Paths
			</a>
			<ChevronRight class="size-4 text-slate-300" />
			<h1 class="text-lg font-bold text-slate-900">Form Builder</h1>
		</div>
		<div class="flex items-center gap-3">
			<Button variant="outline" size="sm" class="gap-2 border-slate-200">
				<Eye class="size-4" />
				Preview
			</Button>
			<Button
				size="sm"
				class="gap-2 shadow-md transition-all active:scale-95"
				onclick={saveChanges}
				disabled={isSaving}
			>
				{#if isSaving}
					<Loader2 class="size-4 animate-spin" />
					Saving...
				{:else if showSuccess}
					<Check class="size-4" />
					Saved!
				{:else}
					<Save class="size-4" />
					Save Changes
				{/if}
			</Button>
		</div>
	</header>

	<main class="flex flex-1 overflow-hidden">
		<!-- Sidebar Palette -->
		<FieldPalette />

		<!-- Editor Area -->
		<div class="flex flex-1 flex-col overflow-hidden">
			<!-- Step Switcher -->
			<div class="border-b bg-white/50 px-8 py-4 backdrop-blur-sm">
				<div class="flex items-center justify-between">
					<nav class="flex items-center gap-1 rounded-xl bg-slate-200/50 p-1 w-fit">
						{#each [1, 2, 3, 4] as step}
							<button
								class="flex h-9 items-center justify-center rounded-lg px-6 text-sm font-semibold transition-all
								{currentStep === step
									? 'bg-white text-primary shadow-sm ring-1 ring-slate-200'
									: 'text-slate-500 hover:text-slate-900 hover:bg-white/50'}"
								onclick={() => (currentStep = step)}
							>
								Step {step}
							</button>
						{/each}
					</nav>
					<div class="text-xs font-medium text-slate-400">
						Editing registration flow for step {currentStep}
					</div>
				</div>
			</div>

			<!-- Canvas Area -->
			<div class="flex-1 overflow-y-auto p-8 custom-scrollbar">
				<div class="mx-auto max-w-4xl">
					{#if isLoading}
						<div
							class="flex h-[400px] items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white shadow-inner"
						>
							<div class="flex flex-col items-center gap-3">
								<Loader2 class="size-10 animate-spin text-primary/30" />
								<p class="text-sm font-medium text-slate-400">Syncing with server...</p>
							</div>
						</div>
					{:else}
						<div class="mb-6 flex items-center justify-between">
							<div>
								<h3 class="text-xl font-bold text-slate-900">Registration Step {currentStep}</h3>
								<p class="text-sm text-slate-500">
									Add and arrange fields for the applicant to fill out.
								</p>
							</div>
						</div>

						<FormCanvas bind:fields onedit={openEdit} />
					{/if}
				</div>
			</div>
		</div>
	</main>
</div>

<FieldConfigModal bind:open={isModalOpen} bind:field={editingField} onsave={handleFieldUpdate} />

<style>
	.custom-scrollbar::-webkit-scrollbar {
		width: 6px;
	}
	.custom-scrollbar::-webkit-scrollbar-track {
		background: transparent;
	}
	.custom-scrollbar::-webkit-scrollbar-thumb {
		background: #e2e8f0;
		border-radius: 10px;
	}
	.custom-scrollbar::-webkit-scrollbar-thumb:hover {
		background: #cbd5e1;
	}
</style>
