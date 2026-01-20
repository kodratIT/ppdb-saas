import { requireAuth, requireSuperAdmin } from '$lib/server/auth/authorization';
import { getAllTickets } from '$lib/server/domain/tickets';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const auth = requireAuth(locals);
	requireSuperAdmin(auth);

	const tickets = await getAllTickets();

	return {
		tickets
	};
};
