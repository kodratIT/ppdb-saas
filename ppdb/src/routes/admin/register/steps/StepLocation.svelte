<script lang="ts">
	import { LocationCascade } from '$lib/components/ui/form';
	import type { LocationFormData } from '../schema';
	import { i18n } from '$lib/i18n/index.svelte';

	interface Props {
		formData: Partial<LocationFormData>;
		errors?: Record<string, string[]>;
		onUpdate: (data: Partial<LocationFormData>) => void;
	}

	let { formData = $bindable(), errors = {}, onUpdate }: Props = $props();

	// Create location data object for LocationCascade
	let locationData = $state({
		province: formData.province || '',
		city: formData.city || '',
		district: formData.district || '',
		village: formData.village || '',
		address: formData.address || '',
		postalCode: formData.postalCode || ''
	});

	// Sync locationData changes back to formData
	function handleLocationChange(data: typeof locationData) {
		locationData = data;
		formData.province = data.province;
		formData.city = data.city;
		formData.district = data.district;
		formData.village = data.village;
		formData.address = data.address;
		formData.postalCode = data.postalCode;
		onUpdate(formData);
	}

	// Watch formData changes from parent
	$effect(() => {
		locationData = {
			province: formData.province || '',
			city: formData.city || '',
			district: formData.district || '',
			village: formData.village || '',
			address: formData.address || '',
			postalCode: formData.postalCode || ''
		};
	});
</script>

<div class="space-y-8">
	<div>
		<h2 class="text-xl font-semibold mb-2">{i18n.t('admin.register.stepLocation')} 📍</h2>
		<p class="text-sm text-muted-foreground">{i18n.t('admin.register.provideAddress')}</p>
	</div>

	<LocationCascade
		bind:value={locationData}
		{errors}
		onChange={handleLocationChange}
		showAddress={true}
		showPostalCode={true}
	/>
</div>
