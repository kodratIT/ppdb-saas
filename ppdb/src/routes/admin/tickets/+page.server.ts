import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { requireAuth, requireSuperAdmin } from '$lib/server/auth/authorization';
import { getTickets, getTicketStats } from '$lib/server/domain/tickets';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	const auth = requireAuth(locals);
	requireSuperAdmin(auth);

	const page = parseInt(url.searchParams.get('page') || '1');
	const search = url.searchParams.get('search') || undefined;
	const statusValues = url.searchParams.getAll('status');
	const status = statusValues.length > 0 ? statusValues : undefined;
	const priority = url.searchParams.get('priority') || undefined;
	const assigneeId = url.searchParams.get('assigneeId') || undefined;

	// Parallel fetching
	const [ticketsData, stats, staffMembers] = await Promise.all([
		getTickets({
			page,
			limit: 10,
			search,
			status,
			priority,
			assigneeId
		}),
		getTicketStats(),
		db.query.users.findMany({
			where: eq(users.role, 'super_admin')
		})
	]);

	return {
		tickets: ticketsData.data,
		pagination: {
			page: ticketsData.page,
			total: ticketsData.total,
			totalPages: ticketsData.totalPages
		},
		stats,
		staffMembers
	};
};
