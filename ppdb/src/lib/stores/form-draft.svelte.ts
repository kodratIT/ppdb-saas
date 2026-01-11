import { SvelteDate } from 'svelte/reactivity';

export type SyncStatus = 'idle' | 'saving' | 'error' | 'conflict';

export interface RegistrationData {
	childFullName: string;
	childNickname: string;
	childDob: string | null;
	childGender: string | null;
	parentFullName: string;
	parentPhone: string;
	parentEmail: string;
	address: string;
	city: string;
	province: string;
	postalCode: string;
	customFieldValues: Record<string, any>;
	currentStep: number;
	completedSteps: number[];
}

export function createFormDraft(initialData: Partial<any> = {}) {
	// Helper to parse JSON fields safely
	const parseJson = (val: any, fallback: any) => {
		if (typeof val === 'string') {
			try {
				return JSON.parse(val);
			} catch (e) {
				return fallback;
			}
		}
		return val || fallback;
	};

	let data = $state<RegistrationData>({
		childFullName: initialData.childFullName || '',
		childNickname: initialData.childNickname || '',
		childDob: initialData.childDob || null,
		childGender: initialData.childGender || null,
		parentFullName: initialData.parentFullName || '',
		parentPhone: initialData.parentPhone || '',
		parentEmail: initialData.parentEmail || '',
		address: initialData.address || '',
		city: initialData.city || '',
		province: initialData.province || '',
		postalCode: initialData.postalCode || '',
		customFieldValues: parseJson(initialData.customFieldValues, {}),
		currentStep: initialData.currentStep || 1,
		completedSteps: parseJson(initialData.completedSteps, [])
	});

	let version = $state(initialData.version || 1);
	let syncStatus = $state<SyncStatus>('idle');

	return {
		get data() {
			return data;
		},
		get version() {
			return version;
		},
		get syncStatus() {
			return syncStatus;
		},
		update(newData: Partial<RegistrationData>) {
			Object.assign(data, newData);
		},
		setSyncStatus(status: SyncStatus) {
			syncStatus = status;
		},
		setVersion(newVersion: number) {
			version = newVersion;
		},
		/**
		 * Update a specific custom field value
		 */
		updateCustomField(key: string, value: any) {
			data.customFieldValues[key] = value;
		}
	};
}
