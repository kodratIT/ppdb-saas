/**
 * Location API Helper
 * Proxies Indonesian administrative regions through our own server
 * to avoid CORS issues with wilayah.id.
 */

const BASE_URL = '/api/location';

export interface Province {
	id: string;
	name: string;
}

export interface City {
	id: string;
	name: string;
}

export interface District {
	id: string;
	name: string;
}

export interface Village {
	id: string;
	name: string;
}

interface ApiResponse {
	data: Array<{ code: string; name: string }>;
	meta: any;
}

/**
 * Fetch all provinces
 */
export async function fetchProvinces(): Promise<Province[]> {
	try {
		const response = await fetch(`${BASE_URL}/provinces.json`);
		if (!response.ok) {
			throw new Error('Failed to fetch provinces');
		}
		const result = (await response.json()) as ApiResponse;
		return result.data.map((item) => ({
			id: item.code,
			name: item.name
		}));
	} catch (error) {
		console.error('Error fetching provinces:', error);
		throw error;
	}
}

/**
 * Fetch cities/regencies by province ID
 */
export async function fetchCities(provinceId: string): Promise<City[]> {
	try {
		const response = await fetch(`${BASE_URL}/regencies/${provinceId}.json`);
		if (!response.ok) {
			throw new Error('Failed to fetch cities');
		}
		const result = (await response.json()) as ApiResponse;
		return result.data.map((item) => ({
			id: item.code,
			name: item.name
		}));
	} catch (error) {
		console.error('Error fetching cities:', error);
		throw error;
	}
}

/**
 * Fetch districts by city/regency ID
 */
export async function fetchDistricts(cityId: string): Promise<District[]> {
	try {
		const response = await fetch(`${BASE_URL}/districts/${cityId}.json`);
		if (!response.ok) {
			throw new Error('Failed to fetch districts');
		}
		const result = (await response.json()) as ApiResponse;
		return result.data.map((item) => ({
			id: item.code,
			name: item.name
		}));
	} catch (error) {
		console.error('Error fetching districts:', error);
		throw error;
	}
}

/**
 * Fetch villages by district ID
 */
export async function fetchVillages(districtId: string): Promise<Village[]> {
	try {
		const response = await fetch(`${BASE_URL}/villages/${districtId}.json`);
		if (!response.ok) {
			throw new Error('Failed to fetch villages');
		}
		const result = (await response.json()) as ApiResponse;
		return result.data.map((item) => ({
			id: item.code,
			name: item.name
		}));
	} catch (error) {
		console.error('Error fetching villages:', error);
		throw error;
	}
}
