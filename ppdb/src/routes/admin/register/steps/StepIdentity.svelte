<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { FormField, SelectField, SlugInput, RadioCardGroup } from '$lib/components/ui/form';
	import { RadioGroup, RadioGroupItem } from '$lib/components/ui/radio-group';
	import { Label } from '$lib/components/ui/label';
	import Alert from '$lib/components/ui/alert.svelte';
	import type { IdentityFormData } from '../schema';
	import { i18n } from '$lib/i18n/index.svelte';

	interface Props {
		formData: Partial<IdentityFormData>;
		errors?: Record<string, string[]>;
		onUpdate: (data: Partial<IdentityFormData>) => void;
	}

	let { formData = $bindable(), errors = {}, onUpdate }: Props = $props();

	const schoolLevels = $derived([
		{ value: 'TK', label: i18n.t('admin.register.tk' as any) || 'TK (Taman Kanak-Kanak)' },
		{ value: 'SD', label: i18n.t('admin.register.sd' as any) || 'SD (Sekolah Dasar)' },
		{
			value: 'SMP',
			label: i18n.t('admin.register.smp' as any) || 'SMP (Sekolah Menengah Pertama)'
		},
		{ value: 'SMA', label: i18n.t('admin.register.sma' as any) || 'SMA (Sekolah Menengah Atas)' },
		{
			value: 'SMK',
			label: i18n.t('admin.register.smk' as any) || 'SMK (Sekolah Menengah Kejuruan)'
		},
		{ value: 'Universitas', label: i18n.t('admin.register.universitas' as any) || 'Universitas' },
		{ value: 'Lainnya', label: i18n.t('admin.register.lainnya' as any) || 'Lainnya' }
	]);

	const institutionTypes = $derived([
		{
			value: 'single',
			label: i18n.t('admin.register.singleSchool'),
			description: i18n.t('admin.register.singleDescription' as any) || 'Single school registration'
		},
		{
			value: 'foundation',
			label: i18n.t('admin.register.foundation'),
			description:
				i18n.t('admin.register.foundationDescription' as any) ||
				'Foundation with multiple school units'
		}
	]);

	function handleNameChange(e: Event) {
		const target = e.target as HTMLInputElement;
		formData.name = target.value;
		onUpdate(formData);
	}

	function handleSlugChange(e: Event) {
		const target = e.target as HTMLInputElement;
		formData.slug = target.value;
		onUpdate(formData);
	}

	function handleNpsnChange(e: Event) {
		const target = e.target as HTMLInputElement;
		formData.npsn = target.value;
		onUpdate(formData);
	}

	function handleLevelChange(value: string) {
		formData.level = value as IdentityFormData['level'];
		onUpdate(formData);
	}

	function handleStatusChange(value: string) {
		formData.status = value as IdentityFormData['status'];
		onUpdate(formData);
	}

	function handleTypeChange(value: string) {
		formData.type = value as IdentityFormData['type'];
		onUpdate(formData);
	}

	// Slug availability check using the API
	async function checkSlugAvailability(slug: string): Promise<boolean> {
		if (!slug || slug.length < 3) return true; // Skip check for short slugs

		try {
			const response = await fetch(
				`/admin/api/check-duplicate?field=slug&value=${encodeURIComponent(slug)}`
			);
			if (!response.ok) {
				console.error('Slug check failed:', response.statusText);
				return true; // Assume available on error
			}
			const data = (await response.json()) as { available: boolean };
			return data.available;
		} catch (error) {
			console.error('Slug check error:', error);
			return true; // Assume available on error
		}
	}
</script>

<div class="space-y-8">
	<div>
		<h2 class="text-xl font-semibold mb-2">{i18n.t('admin.register.stepIdentity')} 🏫</h2>
		<p class="text-sm text-muted-foreground">{i18n.t('admin.register.enterBasicInfo')}</p>
	</div>

	<!-- Institution Type -->
	<RadioCardGroup
		label={i18n.t('admin.register.institutionType')}
		value={formData.type || 'single'}
		options={institutionTypes}
		required
		error={errors.type}
		onValueChange={handleTypeChange}
	/>

	{#if formData.type === 'foundation'}
		<Alert variant="info" message={i18n.t('admin.register.foundationNote')} />
	{/if}

	<!-- School Name -->
	<FormField
		label={formData.type === 'foundation'
			? i18n.t('admin.register.foundationName')
			: i18n.t('admin.register.schoolName')}
		required
		error={errors.name}
		id="name"
	>
		<Input
			id="name"
			type="text"
			placeholder={formData.type === 'foundation'
				? `e.g., ${i18n.t('admin.register.foundationName')}`
				: `e.g., ${i18n.t('admin.register.schoolName')}`}
			value={formData.name || ''}
			oninput={handleNameChange}
			class={errors.name ? 'border-destructive' : ''}
		/>
	</FormField>

	<!-- NPSN -->
	<FormField
		label={i18n.t('admin.register.npsn')}
		required={formData.type !== 'foundation'}
		error={errors.npsn}
		helpText={formData.type === 'foundation'
			? i18n.t('admin.register.foundationNpsnHelper')
			: i18n.t('admin.register.npsnHelper')}
		id="npsn"
	>
		<Input
			id="npsn"
			type="text"
			placeholder="8 digit number"
			maxlength={8}
			value={formData.npsn || ''}
			oninput={handleNpsnChange}
			class={errors.npsn ? 'border-destructive' : ''}
		/>
	</FormField>

	<!-- Slug -->
	<SlugInput
		label={formData.type === 'foundation'
			? i18n.t('admin.register.foundationSlug')
			: i18n.t('admin.register.slug')}
		value={formData.slug || ''}
		sourceValue={formData.name || ''}
		type={formData.type === 'foundation' ? 'foundation' : 'school'}
		required
		error={errors.slug}
		onCheck={checkSlugAvailability}
		oninput={handleSlugChange}
	/>

	<!-- Level -->
	<SelectField
		label={formData.type === 'foundation'
			? i18n.t('admin.register.firstUnitLevel')
			: i18n.t('admin.register.level')}
		value={formData.level || 'SMA'}
		options={schoolLevels}
		placeholder={i18n.t('admin.register.selectLevel')}
		required
		error={errors.level}
		helpText={formData.type === 'foundation' ? i18n.t('admin.register.foundationNote') : undefined}
		onValueChange={handleLevelChange}
	/>

	<!-- Status -->
	<div class="space-y-3">
		<Label class="flex items-center gap-1">
			{i18n.t('admin.register.status')}
			<span class="text-destructive">*</span>
		</Label>
		<RadioGroup value={formData.status || 'active'} onValueChange={handleStatusChange}>
			<div class="flex items-center space-x-4">
				<div class="flex items-center space-x-2">
					<RadioGroupItem value="active" id="active" />
					<Label for="active" class="font-normal cursor-pointer"
						>{i18n.t('admin.register.active')}</Label
					>
				</div>
				<div class="flex items-center space-x-2">
					<RadioGroupItem value="inactive" id="inactive" />
					<Label for="inactive" class="font-normal cursor-pointer"
						>{i18n.t('admin.register.inactive')}</Label
					>
				</div>
			</div>
		</RadioGroup>
		{#if errors.status}
			<p class="text-sm text-destructive">{errors.status[0]}</p>
		{/if}
	</div>
</div>
