import { db } from '$lib/server/db';
import { applications, admissionPaths } from '$lib/server/db/schema';
import { requireAuth, requireRole } from '$lib/server/auth/authorization';
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
	const auth = requireAuth(locals);
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
		'RT',
		'RW',
		'Nama Dusun',
		'Desa/Kelurahan',
		'Kecamatan',
		'Kode Pos',
		'Jenis Tinggal',
		'Alat Transportasi',
		'Telepon',
		'HP',
		'E-mail',
		'Nama Ibu Kandung',
		'Pekerjaan Ibu',
		'Nama Ayah Kandung',
		'Pekerjaan Ayah',
		'Nama Wali',
		'Pekerjaan Wali',
		'Jalur Pendaftaran'
	];

	const rows = acceptedApps.map(app => {
		// Map app data to Dapodik columns
		// Note: Some fields might be missing in our schema or need mapping
		
		return [
			app.childFullName,
			app.childNik || '', // Should be decrypted if encrypted, but for now assuming plain or handled elsewhere
			app.childNisn || '',
			app.childPob || '',
			app.childDob ? new Date(app.childDob).toISOString().split('T')[0] : '',
			app.childGender === 'male' ? 'L' : 'P',
			app.religion || '',
			app.addressStreet || '',
			app.addressRt || '',
			app.addressRw || '',
			app.addressHamlet || '',
			app.addressVillage || '',
			app.addressDistrict || '',
			app.addressPostalCode || '',
			'Bersama Orang Tua', // Default/Placeholder
			'', // Transport
			'', // Telp
			app.parentPhone || '',
			app.parentEmail || '',
			app.motherName || '', // We have parentName, need to distinguish or add field
			'', // Mother Job
			app.fatherName || '', // We have parentName, need to distinguish or add field
			'', // Father Job
			'', // Guardian
			'', // Guardian Job
			app.admissionPath?.name || ''
		].map(escapeCsv).join(',');
	});

	const csvContent = [headers.join(','), ...rows].join('\n');

	return new Response(csvContent, {
		headers: {
			'Content-Type': 'text/csv',
			'Content-Disposition': `attachment; filename="dapodik-export-${new Date().toISOString().split('T')[0]}.csv"`
		}
	});
};
