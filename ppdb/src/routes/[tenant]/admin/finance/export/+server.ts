import { db } from '$lib/server/db';
import { invoices } from '$lib/server/db/schema';
import { requireAuth, requireRole } from '$lib/server/auth/authorization';
import { eq, desc } from 'drizzle-orm';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
	const auth = requireAuth(locals);
	requireRole(auth, 'school_admin', 'super_admin', 'treasurer');

	const invoicesList = await db.query.invoices.findMany({
		where: eq(invoices.tenantId, auth.tenantId),
		with: {
			application: {
				with: {
					user: true // Parent details
				}
			},
			transactions: true
		},
		orderBy: [desc(invoices.createdAt)]
	});

	// CSV Header
	const headers = [
		'Date',
		'Invoice ID',
		'Student Name',
		'Parent Name',
		'Parent Email',
		'Amount',
		'Status',
		'Payment Method',
		'Transaction ID'
	];

	// CSV Rows
	const rows = invoicesList.map((inv) => {
		const transaction = inv.transactions[0]; // Assuming one main transaction for now
		return [
			new Date(inv.createdAt).toISOString().split('T')[0], // YYYY-MM-DD
			inv.externalId,
			`"${inv.application.childFullName}"`, // Quote to handle commas
			`"${inv.application.parentFullName || inv.application.user.name}"`,
			inv.application.user.email,
			inv.amount,
			inv.status,
			transaction?.paymentMethod || '-',
			transaction?.externalId || '-'
		].join(',');
	});

	const csvContent = [headers.join(','), ...rows].join('\n');

	return new Response(csvContent, {
		headers: {
			'Content-Type': 'text/csv',
			'Content-Disposition': `attachment; filename="financial_report_${new Date().toISOString().split('T')[0]}.csv"`
		}
	});
};
