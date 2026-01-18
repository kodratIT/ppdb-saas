/**
 * Location API Helper
 * Fetches Indonesian administrative regions from emsifa's API
 * API: https://emsifa.github.io/api-wilayah-indonesia/api
 */

const BASE_URL = 'https://emsifa.github.io/api-wilayah-indonesia/api';

export interface Province {
	id: string;
	name: string;
}

export interface City {
	id: string;
	id_provinsi: string;
	name: string;
}

export interface District {
	id: string;
	id_kota: string;
	name: string;
}

export interface Village {
	id: string;
	id_kecamatan: string;
	name: string;
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
		return await response.json();
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
		return await response.json();
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
		return await response.json();
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
		return await response.json();
	} catch (error) {
		console.error('Error fetching villages:', error);
		throw error;
	}
}
