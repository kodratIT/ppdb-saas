import { db } from '$lib/server/db';
import { invoices } from '$lib/server/db/schema';
import { requireAuth, requireRole } from '$lib/server/auth/authorization';
import { eq, desc, and, type SQL } from 'drizzle-orm';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals, url }) => {
	const auth = requireAuth(locals);
	requireRole(auth, 'school_admin', 'super_admin', 'treasurer');

	const statusFilter = url.searchParams.get('status') || 'all';

	// Build where clause
	let whereClause: SQL | undefined = eq(invoices.tenantId, auth.tenantId);
	
	if (statusFilter !== 'all') {
		whereClause = and(whereClause, eq(invoices.status, statusFilter as any));
	}

	const invoicesList = await db.query.invoices.findMany({
		where: whereClause,
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

	// Generate CSV
	const headers = [
		'Invoice ID',
		'Student Name',
		'Parent Name',
		'Parent Email',
		'Amount',
		'Status',
		'Created At',
		'Expiry Date',
		'Payment Date',
		'Payment Method'
	];

	const rows = invoicesList.map((inv) => {
		const paidTransaction = inv.transactions.find((t) => t.status === 'SUCCESS');
		
		return [
			inv.externalId,
			inv.application?.childFullName || '-',
			inv.application?.parentFullName || inv.application?.user?.name || '-',
			inv.application?.parentEmail || inv.application?.user?.email || '-',
			inv.amount.toString(),
			inv.status,
			inv.createdAt.toISOString(),
			inv.expiryDate.toISOString(),
			paidTransaction ? paidTransaction.createdAt.toISOString() : '-',
			paidTransaction ? paidTransaction.paymentMethod || 'MANUAL' : '-'
		].map(field => `"${String(field).replace(/"/g, '""')}"`).join(','); // Escape quotes
	});

	const csvContent = [headers.join(','), ...rows].join('\n');

	return new Response(csvContent, {
		headers: {
			'Content-Type': 'text/csv',
			'Content-Disposition': `attachment; filename="finance-report-${new Date().toISOString().split('T')[0]}.csv"`
		}
	});
};
