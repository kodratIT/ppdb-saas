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
	let lastSavedData = JSON.stringify(data);

	async function save() {
		if (syncStatus === 'saving') return;

		const currentDataJson = JSON.stringify(data);
		if (currentDataJson === lastSavedData) return;

		syncStatus = 'saving';
		try {
			const response = await fetch(`/api/applications/${initialData.id}/draft`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					customFieldValues: data.customFieldValues,
					currentStep: data.currentStep,
					version: version
				})
			});

			if (response.ok) {
				const result = await response.json();
				version = result.version;
				lastSavedData = currentDataJson;
				syncStatus = 'idle';
			} else if (response.status === 409) {
				syncStatus = 'conflict';
			} else {
				syncStatus = 'error';
			}
		} catch (e) {
			console.error('Auto-save error:', e);
			syncStatus = 'error';
		}
	}

	// Auto-save logic with debounce
	$effect(() => {
		// Track all relevant data changes
		const _trigger = JSON.stringify(data);

		const timer = setTimeout(() => {
			save();
		}, 2000);

		return () => clearTimeout(timer);
	});

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
