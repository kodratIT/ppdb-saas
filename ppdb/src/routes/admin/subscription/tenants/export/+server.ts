import { getTenants } from '$lib/server/domain/admin/tenants';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	const search = url.searchParams.get('search') || '';
	const status = url.searchParams.get('status') || 'all';
	const packageId = url.searchParams.get('packageId') || 'all';

	// Fetch all matching records for export
	const { data } = await getTenants({
		page: 1,
		limit: 10000, // Reasonable limit for export
		search,
		status,
		packageId
	});

	const csvHeaders = [
		'Tenant Name',
		'Slug',
		'Package',
		'Status',
		'Billing Cycle',
		'Valid Until',
		'Student Count',
		'Created At'
	];

	const csvRows = data.map((row) => {
		return [
			`"${row.tenant.name}"`,
			row.tenant.slug,
			row.package?.name || '-',
			row.subscription?.status || 'no_subscription',
			row.subscription?.billingCycle || '-',
			row.subscription?.currentPeriodEnd
				? new Date(row.subscription.currentPeriodEnd).toISOString().split('T')[0]
				: '-',
			row.applicationCount || 0,
			new Date(row.tenant.createdAt).toISOString().split('T')[0]
		].join(',');
	});

	const csvContent = [csvHeaders.join(','), ...csvRows].join('\n');

	return new Response(csvContent, {
		headers: {
			'Content-Type': 'text/csv',
			'Content-Disposition': `attachment; filename="tenants-export-${new Date().toISOString().split('T')[0]}.csv"`
		}
	});
};
