import { db } from '$lib/server/db';
import { applications, admissionPaths } from '$lib/server/db/schema';
import { requireAuth, requireRole } from '$lib/server/auth/authorization';
import { processCustomFieldsForDisplay } from '$lib/server/utils/custom-fields';
import { eq, and } from 'drizzle-orm';
import type { RequestHandler } from './$types';

// Helper to sanitize CSV fields
function escapeCsv(field: any): string {
	if (field === null || field === undefined) return '';
	const stringField = String(field);
	if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
		return `"${stringField.replace(/"/g, '""')}"`;
	}
	return stringField;
}

export const GET: RequestHandler = async ({ locals }) => {
	const auth = await requireAuth(locals);
	requireRole(auth, 'school_admin', 'super_admin');

	// Fetch accepted applications
	const acceptedApps = await db.query.applications.findMany({
		where: and(
			eq(applications.tenantId, auth.tenantId),
			eq(applications.status, 'accepted')
		),
		with: {
			admissionPath: true
		}
	});

	// Define Dapodik Standard Columns (Simplified Mapping)
	// Ref: Dapodik PD import format usually includes:
	// Nama, NISN, NIK, Tempat Lahir, Tanggal Lahir, JK, Nama Ibu Kandung, Alamat, RT, RW, Desa, Kec, Kode Pos, Agama
	
	const headers = [
		'Nama Peserta Didik',
		'NIK',
		'NISN',
		'Tempat Lahir',
		'Tanggal Lahir (YYYY-MM-DD)',
		'Jenis Kelamin (L/P)',
		'Agama',
		'Alamat Jalan',
		'Kota/Kab',
		'Provinsi',
		'Kode Pos',
		'Telepon',
		'HP',
		'E-mail',
		'Nama Orang Tua/Wali',
		'Jalur Pendaftaran'
	];

	// Process rows asynchronously to handle decryption
	const rows = await Promise.all(acceptedApps.map(async (app) => {
		// Decrypt custom fields
		let customValues: Record<string, any> = {};
		if (app.customFieldValues) {
			const rawValues = JSON.parse(app.customFieldValues);
			customValues = await processCustomFieldsForDisplay(
				auth.tenantId,
				app.admissionPathId,
				rawValues
			);
		}

		// Helper to get custom field value by key (case-insensitive try)
		const getCustom = (key: string) => {
			// Direct match
			if (customValues[key]) return customValues[key];
			// Case insensitive match
			const foundKey = Object.keys(customValues).find(k => k.toLowerCase() === key.toLowerCase());
			return foundKey ? customValues[foundKey] : '';
		};

		return [
			app.childFullName,
			getCustom('nik') || getCustom('child_nik') || '',
			getCustom('nisn') || getCustom('child_nisn') || '',
			getCustom('pob') || getCustom('birth_place') || '',
			app.childDob ? new Date(app.childDob).toISOString().split('T')[0] : '',
			app.childGender === 'male' ? 'L' : 'P',
			getCustom('religion') || getCustom('agama') || '',
			app.address || '', // Schema has 'address'
			app.city || '',    // Schema has 'city'
			app.province || '', // Schema has 'province'
			app.postalCode || '', // Schema has 'postalCode'
			'', // Telp
			app.parentPhone || '',
			app.parentEmail || '',
			app.parentFullName || '',
			app.admissionPath?.name || ''
		].map(escapeCsv).join(',');
	}));

	const csvContent = [headers.join(','), ...rows].join('\n');

	return new Response(csvContent, {
		headers: {
			'Content-Type': 'text/csv',
			'Content-Disposition': `attachment; filename="dapodik-export-${new Date().toISOString().split('T')[0]}.csv"`
		}
	});
};
