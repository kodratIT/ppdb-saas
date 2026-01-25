import { db } from '$lib/server/db';
import { users, tenants } from '$lib/server/db/schema';
import { fetchAuditLogs } from '$lib/server/audit-logs';
import { requireAuth, requireSuperAdmin } from '$lib/server/auth/authorization';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, locals }) => {
	const auth = await requireAuth(locals);
	requireSuperAdmin(auth);

	// Parse filters from URL
	const filters = {
		search: url.searchParams.get('q') || undefined,
		action: (url.searchParams.get('action') as any) || undefined,
		entityType: (url.searchParams.get('entity') as any) || undefined,
		severity: (url.searchParams.get('severity') as any) || undefined,
		status: (url.searchParams.get('status') as any) || undefined,
		userId: url.searchParams.get('userId') || undefined,
		tenantId: url.searchParams.get('tenantId') || undefined,
		dateFrom: url.searchParams.get('from')
			? new Date(url.searchParams.get('from') as string)
			: undefined,
		dateTo: url.searchParams.get('to') ? new Date(url.searchParams.get('to') as string) : undefined,
		page: parseInt(url.searchParams.get('page') || '1'),
		limit: parseInt(url.searchParams.get('limit') || '50')
	};

	// Fetch logs and stats
	const { logs, total, stats } = await fetchAuditLogs(filters);

	// Fetch filter options
	const [allUsers, allTenants] = await Promise.all([
		db
			.select({ id: users.id, name: users.name, email: users.email })
			.from(users)
			.orderBy(users.name),
		db
			.select({ id: tenants.id, name: tenants.name })
			.from(tenants)
			.orderBy(tenants.name)
	]);

	return {
		logs,
		total,
		stats,
		filters,
		filterOptions: {
			users: allUsers,
			tenants: allTenants
		}
	};
};
