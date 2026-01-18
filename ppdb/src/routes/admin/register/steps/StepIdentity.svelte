<script lang="ts">
	import { Input } from '$lib/components/ui';
	import { Label } from '$lib/components/ui';
	import * as Select from '$lib/components/ui/select';
	import { cn } from '$lib/utils';
	import type { IdentityFormData } from '../schema';

	let { data = $bindable(), errors } = $props<{
		data: IdentityFormData;
		errors: Record<string, string[] | undefined> | undefined;
	}>();

	let manuallyEditedSlug = $state(false);

	// Auto-generate slug from name if not manually edited
	$effect(() => {
		if (!manuallyEditedSlug && data.name) {
			data.slug = data.name
				.toLowerCase()
				.replace(/[^a-z0-9]+/g, '-')
				.replace(/^-+|-+$/g, '');
		}
	});

	function handleSlugInput() {
		manuallyEditedSlug = true;
		// Simple regex check simulation or debounce could go here
		// For now we rely on the schema validation passed via errors
	}

	const levels = [
		{ value: 'SD', label: 'SD' },
		{ value: 'SMP', label: 'SMP' },
		{ value: 'SMA', label: 'SMA' },
		{ value: 'SMK', label: 'SMK' }
	];

	const statuses = [
		{ value: 'negeri', label: 'Negeri' },
		{ value: 'swasta', label: 'Swasta' }
	];
</script>

<div class="grid gap-4 py-4">
	<!-- School Name -->
	<div class="grid gap-2">
		<Label for="name">Nama Sekolah</Label>
		<Input
			id="name"
			placeholder="Contoh: SMA Negeri 1 Jakarta"
			bind:value={data.name}
			class={cn(errors?.name && 'border-destructive focus-visible:ring-destructive')}
		/>
		{#if errors?.name}
			<p class="text-[0.8rem] font-medium text-destructive">{errors.name[0]}</p>
		{/if}
	</div>

	<!-- Slug -->
	<div class="grid gap-2">
		<Label for="slug">Subdomain (Slug)</Label>
		<div class="flex items-center">
			<span
				class="flex h-10 items-center rounded-l-md border border-r-0 bg-muted px-3 text-sm text-muted-foreground"
			>
				https://
			</span>
			<Input
				id="slug"
				bind:value={data.slug}
				oninput={handleSlugInput}
				class={cn(
					'rounded-none',
					errors?.slug && 'border-destructive focus-visible:ring-destructive z-10'
				)}
			/>
			<span
				class="flex h-10 items-center rounded-r-md border border-l-0 bg-muted px-3 text-sm text-muted-foreground"
			>
				.ppdb.id
			</span>
		</div>
		{#if errors?.slug}
			<p class="text-[0.8rem] font-medium text-destructive">{errors.slug[0]}</p>
		{:else if data.slug}
			<p class="text-[0.8rem] text-muted-foreground">
				Alamat sekolah: <span class="font-medium text-foreground">https://{data.slug}.ppdb.id</span>
			</p>
		{/if}
	</div>

	<!-- NPSN -->
	<div class="grid gap-2">
		<Label for="npsn">NPSN</Label>
		<Input
			id="npsn"
			placeholder="8 digit nomor pokok sekolah nasional"
			bind:value={data.npsn}
			maxlength={8}
			class={cn(errors?.npsn && 'border-destructive focus-visible:ring-destructive')}
		/>
		{#if errors?.npsn}
			<p class="text-[0.8rem] font-medium text-destructive">{errors.npsn[0]}</p>
		{/if}
	</div>

	<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
		<!-- Level -->
		<div class="grid gap-2">
			<Label for="level">Jenjang</Label>
			<Select.Root bind:value={data.level}>
				<Select.Trigger
					id="level"
					class={cn(errors?.level && 'border-destructive focus:ring-destructive')}
				>
					<Select.Value placeholder="Pilih jenjang" />
				</Select.Trigger>
				<Select.Content>
					{#each levels as level}
						<Select.Item value={level.value}>{level.label}</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
			{#if errors?.level}
				<p class="text-[0.8rem] font-medium text-destructive">{errors.level[0]}</p>
			{/if}
		</div>

		<!-- Status -->
		<div class="grid gap-2">
			<Label for="status">Status</Label>
			<Select.Root bind:value={data.status}>
				<Select.Trigger
					id="status"
					class={cn(errors?.status && 'border-destructive focus:ring-destructive')}
				>
					<Select.Value placeholder="Pilih status" />
				</Select.Trigger>
				<Select.Content>
					{#each statuses as status}
						<Select.Item value={status.value}>{status.label}</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
			{#if errors?.status}
				<p class="text-[0.8rem] font-medium text-destructive">{errors.status[0]}</p>
			{/if}
		</div>
	</div>
</div>
