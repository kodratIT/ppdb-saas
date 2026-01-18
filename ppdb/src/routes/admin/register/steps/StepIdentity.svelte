<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import {
		Select,
		SelectContent,
		SelectItem,
		SelectTrigger
	} from '$lib/components/ui/select/index';
	import { RadioGroup, RadioGroupItem } from '$lib/components/ui/radio-group';
	import Alert from '$lib/components/ui/alert.svelte';
	import type { IdentityFormData } from '../schema.js';

	interface Props {
		formData: Partial<IdentityFormData>;
		errors?: Record<string, string[]>;
		onUpdate: (data: Partial<IdentityFormData>) => void;
	}

	let { formData = $bindable(), errors = {}, onUpdate }: Props = $props();

	const schoolLevels = [
		{ value: 'SD', label: 'SD (Sekolah Dasar)' },
		{ value: 'SMP', label: 'SMP (Sekolah Menengah Pertama)' },
		{ value: 'SMA', label: 'SMA (Sekolah Menengah Atas)' },
		{ value: 'SMK', label: 'SMK (Sekolah Menengah Kejuruan)' },
		{ value: 'Universitas', label: 'Universitas' },
		{ value: 'Lainnya', label: 'Lainnya' }
	];

	function getLevelLabel(value: string | undefined) {
		return schoolLevels.find((l) => l.value === value)?.label;
	}

	// Auto-generate slug from name
	function slugify(text: string): string {
		return text
			.toLowerCase()
			.trim()
			.replace(/[^\w\s-]/g, '') // Remove special characters
			.replace(/[\s_-]+/g, '-') // Replace spaces, underscores with hyphens
			.replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
	}

	let slugDebounceTimer: ReturnType<typeof setTimeout>;

	function handleNameChange(e: Event) {
		const target = e.target as HTMLInputElement;
		const name = target.value;
		formData.name = name;

		// Auto-generate slug with debounce
		clearTimeout(slugDebounceTimer);
		slugDebounceTimer = setTimeout(() => {
			if (name) {
				formData.slug = slugify(name);
				onUpdate(formData);
			}
		}, 300);

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
</script>

<div class="space-y-6">
	<div>
		<h2 class="text-xl font-semibold mb-2">School Identity 🏫</h2>
		<p class="text-sm text-muted-foreground">Enter the basic information about your school.</p>
	</div>

	<!-- Institution Type -->
	<div class="space-y-3">
		<Label>Tipe Institusi *</Label>
		<RadioGroup
			value={formData.type || 'single'}
			onValueChange={handleTypeChange}
			class="flex flex-col sm:flex-row gap-4"
		>
			<div
				class="flex items-center space-x-2 border rounded-md p-3 px-4 cursor-pointer hover:bg-accent transition-colors {formData.type ===
					'single' || !formData.type
					? 'border-primary bg-primary/5'
					: ''}"
			>
				<RadioGroupItem value="single" id="type-single" />
				<Label for="type-single" class="font-medium cursor-pointer">Sekolah Satuan</Label>
			</div>
			<div
				class="flex items-center space-x-2 border rounded-md p-3 px-4 cursor-pointer hover:bg-accent transition-colors {formData.type ===
				'foundation'
					? 'border-primary bg-primary/5'
					: ''}"
			>
				<RadioGroupItem value="foundation" id="type-foundation" />
				<Label for="type-foundation" class="font-medium cursor-pointer">Yayasan / Institusi</Label>
			</div>
		</RadioGroup>
		{#if formData.type === 'foundation'}
			<Alert
				variant="info"
				message="Anda dapat menambahkan unit sekolah (TK, SD, SMP, SMA) di bawah Yayasan ini setelah pendaftaran selesai."
			/>
		{/if}
	</div>

	<!-- School Name -->
	<div class="space-y-2">
		<Label for="name">{formData.type === 'foundation' ? 'Foundation Name' : 'School Name'} *</Label>
		<Input
			id="name"
			type="text"
			placeholder={formData.type === 'foundation'
				? 'e.g., Yayasan Pendidikan Indonesia'
				: 'e.g., SMA Negeri 1 Jakarta'}
			value={formData.name || ''}
			oninput={handleNameChange}
			class={errors.name ? 'border-destructive' : ''}
		/>
		{#if errors.name}
			<p class="text-sm text-destructive">{errors.name[0]}</p>
		{/if}
	</div>

	<!-- NPSN -->
	<div class="space-y-2">
		<Label for="npsn">
			NPSN (Nomor Pokok Sekolah Nasional)
			{#if formData.type === 'foundation'}
				<span class="text-muted-foreground font-normal">(Opsional)</span>
			{:else}
				*
			{/if}
		</Label>
		<Input
			id="npsn"
			type="text"
			placeholder="8 digit number"
			maxlength={8}
			value={formData.npsn || ''}
			oninput={handleNpsnChange}
			class={errors.npsn ? 'border-destructive' : ''}
		/>
		{#if errors.npsn}
			<p class="text-sm text-destructive">{errors.npsn[0]}</p>
		{/if}
		<p class="text-xs text-muted-foreground">
			{formData.type === 'foundation'
				? 'Masukkan NPSN jika yayasan memiliki NPSN induk, atau kosongkan jika tidak ada.'
				: "Enter your school's 8-digit NPSN number from Kemdikbud."}
		</p>
	</div>

	<!-- Slug -->
	<div class="space-y-2">
		<Label for="slug">{formData.type === 'foundation' ? 'Foundation Slug' : 'School Slug'} *</Label>
		<Input
			id="slug"
			type="text"
			placeholder={formData.type === 'foundation'
				? 'e.g., yayasan-pendidikan'
				: 'e.g., sma-negeri-1-jakarta'}
			value={formData.slug || ''}
			oninput={handleSlugChange}
			class={errors.slug ? 'border-destructive' : ''}
		/>
		{#if errors.slug}
			<p class="text-sm text-destructive">{errors.slug[0]}</p>
		{/if}
		<p class="text-xs text-muted-foreground">
			This will be your {formData.type === 'foundation' ? "foundation's" : "school's"} subdomain:
			<strong
				>{formData.slug ||
					(formData.type === 'foundation' ? 'your-foundation' : 'your-school')}.ppdb.id</strong
			>
		</p>
	</div>

	<!-- Level -->
	<div class="space-y-2">
		<Label for="level">School Level *</Label>
		<Select value={formData.level || 'SMA'} onValueChange={handleLevelChange}>
			<SelectTrigger id="level" class={errors.level ? 'border-destructive' : ''}>
				<span>{getLevelLabel(formData.level || 'SMA') || 'Select school level'}</span>
			</SelectTrigger>
			<SelectContent>
				{#each schoolLevels as level}
					<SelectItem value={level.value}>{level.label}</SelectItem>
				{/each}
			</SelectContent>
		</Select>
		{#if errors.level}
			<p class="text-sm text-destructive">{errors.level[0]}</p>
		{/if}
	</div>

	<!-- Status -->
	<div class="space-y-2">
		<Label>School Status *</Label>
		<RadioGroup value={formData.status || 'active'} onValueChange={handleStatusChange}>
			<div class="flex items-center space-x-2">
				<RadioGroupItem value="active" id="active" />
				<Label for="active" class="font-normal cursor-pointer">Active</Label>
			</div>
			<div class="flex items-center space-x-2">
				<RadioGroupItem value="inactive" id="inactive" />
				<Label for="inactive" class="font-normal cursor-pointer">Inactive</Label>
			</div>
		</RadioGroup>
		{#if errors.status}
			<p class="text-sm text-destructive">{errors.status[0]}</p>
		{/if}
	</div>
</div>
