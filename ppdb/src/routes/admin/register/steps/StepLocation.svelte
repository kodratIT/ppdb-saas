<script lang="ts">
	import { onMount } from 'svelte';
	import {
		Input,
		Label,
		Textarea,
		Select,
		SelectContent,
		SelectItem,
		SelectTrigger
	} from '$lib/components/ui';
	import {
		fetchProvinces,
		fetchCities,
		fetchDistricts,
		fetchVillages,
		type Province,
		type City,
		type District,
		type Village
	} from '$lib/utils/location-api';
	import type { LocationFormData } from '../schema';

	interface Props {
		formData: Partial<LocationFormData>;
		errors?: Record<string, string[]>;
		onUpdate: (data: Partial<LocationFormData>) => void;
	}

	let { formData = $bindable(), errors = {}, onUpdate }: Props = $props();

	let provinces = $state<Province[]>([]);
	let cities = $state<City[]>([]);
	let districts = $state<District[]>([]);
	let villages = $state<Village[]>([]);

	let loadingProvinces = $state(false);
	let loadingCities = $state(false);
	let loadingDistricts = $state(false);
	let loadingVillages = $state(false);

	let selectedProvinceId = $state<string>('');
	let selectedCityId = $state<string>('');
	let selectedDistrictId = $state<string>('');
	let selectedVillageId = $state<string>('');

	// Load provinces on mount
	onMount(async () => {
		loadingProvinces = true;
		try {
			provinces = await fetchProvinces();
			// Try to restore IDs from names if they exist in formData (e.g. on back step)
			if (formData.province) {
				const p = provinces.find((p) => p.name === formData.province);
				if (p) {
					selectedProvinceId = p.id;
					await loadCities(p.id, false);
				}
			}
		} catch (error) {
			console.error('Failed to load provinces:', error);
		} finally {
			loadingProvinces = false;
		}
	});

	async function loadCities(provinceId: string, resetDependent = true) {
		if (resetDependent) {
			selectedCityId = '';
			selectedDistrictId = '';
			selectedVillageId = '';
			formData.city = '';
			formData.district = '';
			formData.village = '';
		}
		cities = [];
		districts = [];
		villages = [];

		if (!provinceId) return;

		loadingCities = true;
		try {
			cities = await fetchCities(provinceId);
			if (formData.city) {
				const c = cities.find((item) => item.name === formData.city);
				if (c) {
					selectedCityId = c.id;
					await loadDistricts(c.id, false);
				}
			}
		} catch (error) {
			console.error('Failed to load cities:', error);
		} finally {
			loadingCities = false;
		}
	}

	async function loadDistricts(cityId: string, resetDependent = true) {
		if (resetDependent) {
			selectedDistrictId = '';
			selectedVillageId = '';
			formData.district = '';
			formData.village = '';
		}
		districts = [];
		villages = [];

		if (!cityId) return;

		loadingDistricts = true;
		try {
			districts = await fetchDistricts(cityId);
			if (formData.district) {
				const d = districts.find((item) => item.name === formData.district);
				if (d) {
					selectedDistrictId = d.id;
					await loadVillages(d.id, false);
				}
			}
		} catch (error) {
			console.error('Failed to load districts:', error);
		} finally {
			loadingDistricts = false;
		}
	}

	async function loadVillages(districtId: string, resetDependent = true) {
		if (resetDependent) {
			selectedVillageId = '';
			formData.village = '';
		}
		villages = [];

		if (!districtId) return;

		loadingVillages = true;
		try {
			villages = await fetchVillages(districtId);
			if (formData.village) {
				const v = villages.find((item) => item.name === formData.village);
				if (v) {
					selectedVillageId = v.id;
				}
			}
		} catch (error) {
			console.error('Failed to load villages:', error);
		} finally {
			loadingVillages = false;
		}
	}

	async function handleProvinceChange(provinceId: string) {
		selectedProvinceId = provinceId;
		const province = provinces.find((p) => p.id === provinceId);
		if (province) {
			formData.province = province.name;
			onUpdate(formData);
		}
		await loadCities(provinceId);
	}

	async function handleCityChange(cityId: string) {
		selectedCityId = cityId;
		const city = cities.find((c) => c.id === cityId);
		if (city) {
			formData.city = city.name;
			onUpdate(formData);
		}
		await loadDistricts(cityId);
	}

	async function handleDistrictChange(districtId: string) {
		selectedDistrictId = districtId;
		const district = districts.find((d) => d.id === districtId);
		if (district) {
			formData.district = district.name;
			onUpdate(formData);
		}
		await loadVillages(districtId);
	}

	function handleVillageChange(villageId: string) {
		selectedVillageId = villageId;
		const village = villages.find((v) => v.id === villageId);
		if (village) {
			formData.village = village.name;
			onUpdate(formData);
		}
	}

	function handleAddressChange(e: Event) {
		const target = e.target as HTMLTextAreaElement;
		formData.address = target.value;
		onUpdate(formData);
	}

	function handlePostalCodeChange(e: Event) {
		const target = e.target as HTMLInputElement;
		formData.postalCode = target.value;
		onUpdate(formData);
	}
</script>

<div class="space-y-6">
	<div>
		<h2 class="text-xl font-semibold mb-2">Location Details 📍</h2>
		<p class="text-sm text-muted-foreground">Provide the complete address of your school.</p>
	</div>

	<!-- Province -->
	<div class="space-y-2">
		<Label for="province">Province *</Label>
		<Select
			type="single"
			value={selectedProvinceId}
			onValueChange={handleProvinceChange}
			disabled={loadingProvinces}
		>
			<SelectTrigger id="province" class={errors.province ? 'border-destructive' : ''}>
				{loadingProvinces
					? 'Loading...'
					: provinces.find((p) => p.id === selectedProvinceId)?.name || 'Select province'}
			</SelectTrigger>
			<SelectContent>
				{#each provinces as province (province.id)}
					<SelectItem value={province.id}>{province.name}</SelectItem>
				{/each}
			</SelectContent>
		</Select>
		{#if errors.province}
			<p class="text-sm text-destructive">{errors.province[0]}</p>
		{/if}
	</div>

	<!-- City/Regency -->
	<div class="space-y-2">
		<Label for="city">City/Regency *</Label>
		<Select
			type="single"
			value={selectedCityId}
			onValueChange={handleCityChange}
			disabled={!selectedProvinceId || loadingCities}
		>
			<SelectTrigger id="city" class={errors.city ? 'border-destructive' : ''}>
				{loadingCities
					? 'Loading...'
					: selectedProvinceId
						? cities.find((c) => c.id === selectedCityId)?.name || 'Select city/regency'
						: 'Select province first'}
			</SelectTrigger>
			<SelectContent>
				{#each cities as city (city.id)}
					<SelectItem value={city.id}>{city.name}</SelectItem>
				{/each}
			</SelectContent>
		</Select>
		{#if errors.city}
			<p class="text-sm text-destructive">{errors.city[0]}</p>
		{/if}
	</div>

	<!-- District -->
	<div class="space-y-2">
		<Label for="district">District *</Label>
		<Select
			type="single"
			value={selectedDistrictId}
			onValueChange={handleDistrictChange}
			disabled={!selectedCityId || loadingDistricts}
		>
			<SelectTrigger id="district" class={errors.district ? 'border-destructive' : ''}>
				{loadingDistricts
					? 'Loading...'
					: selectedCityId
						? districts.find((d) => d.id === selectedDistrictId)?.name || 'Select district'
						: 'Select city first'}
			</SelectTrigger>
			<SelectContent>
				{#each districts as district (district.id)}
					<SelectItem value={district.id}>{district.name}</SelectItem>
				{/each}
			</SelectContent>
		</Select>
		{#if errors.district}
			<p class="text-sm text-destructive">{errors.district[0]}</p>
		{/if}
	</div>

	<!-- Village -->
	<div class="space-y-2">
		<Label for="village">Village *</Label>
		<Select
			type="single"
			value={selectedVillageId}
			onValueChange={handleVillageChange}
			disabled={!selectedDistrictId || loadingVillages}
		>
			<SelectTrigger id="village" class={errors.village ? 'border-destructive' : ''}>
				{loadingVillages
					? 'Loading...'
					: selectedDistrictId
						? villages.find((v) => v.id === selectedVillageId)?.name || 'Select village'
						: 'Select district first'}
			</SelectTrigger>
			<SelectContent>
				{#each villages as village (village.id)}
					<SelectItem value={village.id}>{village.name}</SelectItem>
				{/each}
			</SelectContent>
		</Select>
		{#if errors.village}
			<p class="text-sm text-destructive">{errors.village[0]}</p>
		{/if}
	</div>

	<!-- Address -->
	<div class="space-y-2">
		<Label for="address">Street Address *</Label>
		<Textarea
			id="address"
			placeholder="e.g., Jl. Merdeka No. 123"
			rows={3}
			value={formData.address || ''}
			oninput={handleAddressChange}
			class={errors.address ? 'border-destructive' : ''}
		/>
		{#if errors.address}
			<p class="text-sm text-destructive">{errors.address[0]}</p>
		{/if}
	</div>

	<!-- Postal Code -->
	<div class="space-y-2">
		<Label for="postalCode">Postal Code *</Label>
		<Input
			id="postalCode"
			type="text"
			placeholder="e.g., 12345"
			maxlength={5}
			value={formData.postalCode || ''}
			oninput={handlePostalCodeChange}
			class={errors.postalCode ? 'border-destructive' : ''}
		/>
		{#if errors.postalCode}
			<p class="text-sm text-destructive">{errors.postalCode[0]}</p>
		{/if}
	</div>
</div>
