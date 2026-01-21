<script lang="ts">
	import Progress from '$lib/components/ui/progress.svelte';
	import Alert from '$lib/components/ui/alert.svelte';
	import ReviewCard from './review-card.svelte';
	import ReviewField from './review-field.svelte';
	import type { RegistrationFormData } from '$routes/admin/register/schema';

	interface Props {
		formData: Partial<RegistrationFormData>;
		currentStep: number;
		totalSteps: number;
		completedSections?: number[];
		onEditSection?: (section: number) => void;
	}

	let {
		formData,
		currentStep,
		totalSteps = 4,
		completedSections = [],
		onEditSection
	}: Props = $props();

	// Calculate completion percentage
	const progress = $derived(() => {
		const sections = [
			{ step: 1, fields: ['name', 'slug', 'level', 'status'] },
			{ step: 2, fields: ['province', 'city', 'district', 'village', 'address', 'postalCode'] },
			{ step: 3, fields: ['adminName', 'email', 'password', 'whatsapp'] }
		];

		let filledFields = 0;
		let totalFields = 0;

		sections.forEach((section) => {
			section.fields.forEach((field) => {
				totalFields++;
				const value = formData[field as keyof typeof formData];
				if (value && String(value).trim() !== '') {
					filledFields++;
				}
			});
		});

		return Math.round((filledFields / totalFields) * 100);
	});

	// Section info for display
	const sections = [
		{ step: 1, label: 'Identity', icon: '🏫' },
		{ step: 2, label: 'Location', icon: '📍' },
		{ step: 3, label: 'Admin Account', icon: '👤' },
		{ step: 4, label: 'Review', icon: '📋' }
	];

	function getTypeLabel(type?: string) {
		return type === 'foundation' ? 'Yayasan / Institusi' : 'Sekolah Satuan';
	}
</script>

<div class="space-y-6">
	<!-- Progress Overview -->
	<div class="p-4 bg-muted/30 rounded-lg border">
		<div class="flex items-center justify-between mb-3">
			<span class="text-sm font-medium">Form Completion</span>
			<span
				class="text-sm font-bold {progress() >= 100 ? 'text-green-600' : 'text-muted-foreground'}"
			>
				{progress()}%
			</span>
		</div>
		<Progress value={progress()} max={100} class="h-2" />

		<!-- Section Progress -->
		<div class="flex justify-between mt-4">
			{#each sections as section}
				{@const isCompleted = completedSections.includes(section.step)}
				{@const isCurrent = currentStep === section.step}
				<div class="flex flex-col items-center">
					<div
						class="w-8 h-8 rounded-full flex items-center justify-center text-sm
							{isCompleted
							? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
							: isCurrent
								? 'bg-primary/10 text-primary'
								: 'bg-muted text-muted-foreground'}"
					>
						{#if isCompleted}
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M5 13l4 4L19 7"
								/>
							</svg>
						{:else}
							{section.icon}
						{/if}
					</div>
					<span class="text-xs mt-1 text-muted-foreground">{section.label}</span>
				</div>
			{/each}
		</div>
	</div>

	<!-- Identity Section -->
	<ReviewCard title="School Identity" icon="🏫" onEdit={() => onEditSection?.(1)}>
		<div class="grid grid-cols-2 gap-4">
			<ReviewField label="Institution Type" value={getTypeLabel(formData.type)} />
			<ReviewField
				label={formData.type === 'foundation' ? 'Foundation Name' : 'School Name'}
				value={formData.name}
			/>
			<ReviewField label="NPSN" value={formData.npsn} />
			<ReviewField
				label={formData.type === 'foundation' ? 'Foundation Slug' : 'School Slug'}
				value={formData.slug}
				mono
			/>
			<ReviewField label="Level" value={formData.level} />
			<ReviewField
				label="Status"
				badge={{
					label: formData.status || 'active',
					variant: formData.status === 'active' ? 'default' : 'secondary'
				}}
			/>
		</div>
		<div class="pt-3 mt-3 border-t">
			<ReviewField
				label="Subdomain"
				value={`${formData.slug || 'your-school'}.ppdb.id`}
				highlight
			/>
		</div>
	</ReviewCard>

	<!-- Location Section -->
	<ReviewCard title="Location" icon="📍" onEdit={() => onEditSection?.(2)}>
		<div class="grid grid-cols-2 gap-4">
			<ReviewField label="Province" value={formData.province} />
			<ReviewField label="City/Regency" value={formData.city} />
			<ReviewField label="District" value={formData.district} />
			<ReviewField label="Village" value={formData.village} />
		</div>
		<div class="pt-3 mt-3 border-t space-y-3">
			<ReviewField label="Street Address" value={formData.address} />
			<ReviewField label="Postal Code" value={formData.postalCode} />
		</div>
	</ReviewCard>

	<!-- Admin Account Section -->
	<ReviewCard title="Admin Account" icon="👤" onEdit={() => onEditSection?.(3)}>
		<div class="grid grid-cols-2 gap-4">
			<ReviewField label="Admin Name" value={formData.adminName} />
			<ReviewField label="Email" value={formData.email} />
			<ReviewField label="WhatsApp" value={formData.whatsapp} />
			<ReviewField label="Password" masked />
		</div>
	</ReviewCard>

	<!-- Before Submit Notice -->
	<Alert
		variant="info"
		message="Make sure all information is correct. After submission, a new tenant will be created with the admin account. You'll be able to log in immediately after registration is complete."
	/>
</div>
