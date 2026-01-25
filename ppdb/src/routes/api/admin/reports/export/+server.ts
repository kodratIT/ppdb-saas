import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireAuth, requireSuperAdmin } from '$lib/server/auth/authorization';
import { getDashboardStats } from '$lib/server/domain/admin';
import { generateCSV } from '$lib/server/reports/export-csv';
import { generateExcel } from '$lib/server/reports/export-excel';
import { generatePDF } from '$lib/server/reports/export-pdf';

export const GET: RequestHandler = async ({ locals, url }) => {
	const auth = await requireAuth(locals);
	requireSuperAdmin(auth);

	const from = url.searchParams.get('from');
	const to = url.searchParams.get('to');
	const format = url.searchParams.get('format') || 'csv';

	const stats = await getDashboardStats({
		from: from ? new Date(from) : undefined,
		to: to ? new Date(to) : undefined
	});

	let data: Uint8Array;
	let contentType: string;
	let filename: string;

	switch (format) {
		case 'excel':
			data = generateExcel(stats);
			contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
			filename = `report-excel-${new Date().toISOString().split('T')[0]}.xlsx`;
			break;
		case 'pdf':
			data = generatePDF(stats);
			contentType = 'application/pdf';
			filename = `report-pdf-${new Date().toISOString().split('T')[0]}.pdf`;
			break;
		case 'csv':
		default:
			data = new TextEncoder().encode(generateCSV(stats));
			contentType = 'text/csv';
			filename = `report-${new Date().toISOString().split('T')[0]}.csv`;
			break;
	}

	return new Response(data as any, {
		headers: {
			'Content-Type': contentType,
			'Content-Disposition': `attachment; filename="${filename}"`
		}
	});
};
