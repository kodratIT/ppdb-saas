export interface FeatureDefinition {
	key: string;
	label: string;
	type: 'boolean' | 'number';
	suffix?: string;
	description?: string;
}

export interface FeatureDictionary {
	limits: FeatureDefinition[];
	features: FeatureDefinition[];
}

export const FEATURE_DICT: FeatureDictionary = {
	limits: [
		{
			key: 'max_students',
			label: 'Maksimal Siswa',
			type: 'number',
			suffix: 'siswa',
			description: 'Jumlah maksimal pendaftar yang dapat ditampung.'
		},
		{
			key: 'max_users',
			label: 'Maksimal Staff/User',
			type: 'number',
			suffix: 'user',
			description: 'Jumlah akun pengelola sekolah.'
		},
		{
			key: 'max_storage',
			label: 'Kapasitas Penyimpanan',
			type: 'number',
			suffix: 'GB',
			description: 'Total penyimpanan untuk dokumen dan file.'
		},
		{
			key: 'max_admission_paths',
			label: 'Maksimal Jalur Masuk',
			type: 'number',
			suffix: 'jalur',
			description: 'Jumlah jalur pendaftaran yang bisa dibuka.'
		}
	],
	features: [
		{
			key: 'whatsapp_integration',
			label: 'Integrasi WhatsApp',
			type: 'boolean',
			description: 'Pengiriman notifikasi via WA.'
		},
		{
			key: 'custom_domain',
			label: 'Custom Domain Support',
			type: 'boolean',
			description: 'Gunakan domain sekolah sendiri.'
		},
		{
			key: 'white_label',
			label: 'White Labeling',
			type: 'boolean',
			description: 'Hapus branding PPDB SaaS.'
		},
		{
			key: 'api_access',
			label: 'Akses API',
			type: 'boolean',
			description: 'Integrasi data dengan sistem luar.'
		},
		{
			key: 'priority_support',
			label: 'Dukungan Prioritas',
			type: 'boolean',
			description: 'Respon dukungan teknis lebih cepat.'
		},
		{
			key: 'advanced_reports',
			label: 'Laporan Lanjutan',
			type: 'boolean',
			description: 'Statistik dan analytics mendalam.'
		}
	]
};

export function getFeatureLabel(key: string): string {
	const allFeatures = [...FEATURE_DICT.limits, ...FEATURE_DICT.features];
	const feature = allFeatures.find((f) => f.key === key);
	if (feature) return feature.label;

	// Fallback to capitalizing key
	return key
		.replace(/_/g, ' ')
		.split(' ')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');
}

export function isStandardFeature(key: string): boolean {
	const allFeatures = [...FEATURE_DICT.limits, ...FEATURE_DICT.features];
	return allFeatures.some((f) => f.key === key);
}
