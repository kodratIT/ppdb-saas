<script lang="ts">
	import { onMount } from 'svelte';
	import SelectField from './select-field.svelte';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import FormField from './form-field.svelte';
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

	interface LocationData {
		province: string;
		provinceId?: string;
		city: string;
		cityId?: string;
		district: string;
		districtId?: string;
		village: string;
		villageId?: string;
		address: string;
		postalCode: string;
	}

	interface Props {
		value: LocationData;
		errors?: Record<string, string[]>;
		onChange?: (value: LocationData) => void;
		showAddress?: boolean;
		showPostalCode?: boolean;
	}

	let {
		value = $bindable({
			province: '',
			city: '',
			district: '',
			village: '',
			address: '',
			postalCode: ''
		}),
		errors = {},
		onChange,
		showAddress = true,
		showPostalCode = true
	}: Props = $props();

	// Data states
	let provinces = $state<Province[]>([]);
	let cities = $state<City[]>([]);
	let districts = $state<District[]>([]);
	let villages = $state<Village[]>([]);

	// Loading states
	let loadingProvinces = $state(false);
	let loadingCities = $state(false);
	let loadingDistricts = $state(false);
	let loadingVillages = $state(false);

	// Selected IDs (internal state for cascading)
	let selectedProvinceId = $state('');
	let selectedCityId = $state('');
	let selectedDistrictId = $state('');
	let selectedVillageId = $state('');

	// Format options for SelectField
	const provinceOptions = $derived(provinces.map((p) => ({ value: p.id, label: p.name })));
	const cityOptions = $derived(cities.map((c) => ({ value: c.id, label: c.name })));
	const districtOptions = $derived(districts.map((d) => ({ value: d.id, label: d.name })));
	const villageOptions = $derived(villages.map((v) => ({ value: v.id, label: v.name })));

	// Load provinces on mount
	onMount(async () => {
		await loadProvinces();
	});

	async function loadProvinces() {
		loadingProvinces = true;
		try {
			provinces = await fetchProvinces();
			// Restore from saved value if exists
			if (value.province) {
				const p = provinces.find((p) => p.name === value.province);
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
	}

	async function loadCities(provinceId: string, resetDependent = true) {
		if (resetDependent) {
			selectedCityId = '';
			selectedDistrictId = '';
			selectedVillageId = '';
			value.city = '';
			value.district = '';
			value.village = '';
			cities = [];
			districts = [];
			villages = [];
		}

		if (!provinceId) return;

		loadingCities = true;
		try {
			cities = await fetchCities(provinceId);
			if (value.city) {
				const c = cities.find((c) => c.name === value.city);
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
			value.district = '';
			value.village = '';
			districts = [];
			villages = [];
		}

		if (!cityId) return;

		loadingDistricts = true;
		try {
			districts = await fetchDistricts(cityId);
			if (value.district) {
				const d = districts.find((d) => d.name === value.district);
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
			value.village = '';
			villages = [];
		}

		if (!districtId) return;

		loadingVillages = true;
		try {
			villages = await fetchVillages(districtId);
			if (value.village) {
				const v = villages.find((v) => v.name === value.village);
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

	// Handlers
	async function handleProvinceChange(provinceId: string) {
		selectedProvinceId = provinceId;
		const province = provinces.find((p) => p.id === provinceId);
		if (province) {
			value.province = province.name;
			value.provinceId = provinceId;
			onChange?.(value);
		}
		await loadCities(provinceId);
	}

	async function handleCityChange(cityId: string) {
		selectedCityId = cityId;
		const city = cities.find((c) => c.id === cityId);
		if (city) {
			value.city = city.name;
			value.cityId = cityId;
			onChange?.(value);
		}
		await loadDistricts(cityId);
	}

	async function handleDistrictChange(districtId: string) {
		selectedDistrictId = districtId;
		const district = districts.find((d) => d.id === districtId);
		if (district) {
			value.district = district.name;
			value.districtId = districtId;
			onChange?.(value);
		}
		await loadVillages(districtId);
	}

	function handleVillageChange(villageId: string) {
		selectedVillageId = villageId;
		const village = villages.find((v) => v.id === villageId);
		if (village) {
			value.village = village.name;
			value.villageId = villageId;
			onChange?.(value);
		}
	}

	function handleAddressChange(e: Event) {
		const target = e.target as HTMLTextAreaElement;
		value.address = target.value;
		onChange?.(value);
	}

	function handlePostalCodeChange(e: Event) {
		const target = e.target as HTMLInputElement;
		value.postalCode = target.value;
		onChange?.(value);
	}
</script>

<div class="space-y-4">
	<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
		<!-- Province -->
		<SelectField
			label="Province"
			value={selectedProvinceId}
			options={provinceOptions}
			placeholder={loadingProvinces ? 'Loading...' : 'Select province'}
			required
			loading={loadingProvinces}
			error={errors.province}
			onValueChange={handleProvinceChange}
		/>

		<!-- City/Regency -->
		<SelectField
			label="City/Regency"
			value={selectedCityId}
			options={cityOptions}
			placeholder={!selectedProvinceId
				? 'Select province first'
				: loadingCities
					? 'Loading...'
					: 'Select city/regency'}
			required
			loading={loadingCities}
			disabled={!selectedProvinceId}
			error={errors.city}
			onValueChange={handleCityChange}
		/>

		<!-- District -->
		<SelectField
			label="District"
			value={selectedDistrictId}
			options={districtOptions}
			placeholder={!selectedCityId
				? 'Select city first'
				: loadingDistricts
					? 'Loading...'
					: 'Select district'}
			required
			loading={loadingDistricts}
			disabled={!selectedCityId}
			error={errors.district}
			onValueChange={handleDistrictChange}
		/>

		<!-- Village -->
		<SelectField
			label="Village"
			value={selectedVillageId}
			options={villageOptions}
			placeholder={!selectedDistrictId
				? 'Select district first'
				: loadingVillages
					? 'Loading...'
					: 'Select village'}
			required
			loading={loadingVillages}
			disabled={!selectedDistrictId}
			error={errors.village}
			onValueChange={handleVillageChange}
		/>
	</div>

	{#if showAddress}
		<!-- Address -->
		<FormField label="Street Address" required error={errors.address} id="address">
			<Textarea
				id="address"
				placeholder="e.g., Jl. Merdeka No. 123"
				rows={3}
				value={value.address || ''}
				oninput={handleAddressChange}
				class={errors.address ? 'border-destructive' : ''}
			/>
		</FormField>
	{/if}

	{#if showPostalCode}
		<!-- Postal Code -->
		<div class="max-w-[200px]">
			<FormField label="Postal Code" required error={errors.postalCode} id="postalCode">
				<Input
					id="postalCode"
					type="text"
					placeholder="e.g., 12345"
					maxlength={5}
					value={value.postalCode || ''}
					oninput={handlePostalCodeChange}
					class={errors.postalCode ? 'border-destructive' : ''}
				/>
			</FormField>
		</div>
	{/if}
</div>
