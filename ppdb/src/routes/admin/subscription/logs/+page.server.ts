import { db } from '$lib/server/db';
import { auditLogs, users } from '$lib/server/db/schema';
import { requireAuth, requireSuperAdmin } from '$lib/server/auth/authorization';
import { desc, ilike, or, and, sql } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	const auth = requireAuth(locals);
	requireSuperAdmin(auth);

	const search = url.searchParams.get('q') || '';
	
	const filters = [
		or(
			ilike(auditLogs.action, `%subscription%`),
			ilike(auditLogs.action, `%package%`),
			ilike(auditLogs.action, `%coupon%`),
			ilike(auditLogs.action, `%invoice%`)
		)
	];

	if (search) {
		filters.push(ilike(auditLogs.target, `%${search}%`));
	}

	const logs = await db
		.select({
			log: auditLogs,
			actor: users
		})
		.from(auditLogs)
		.leftJoin(users, eq(auditLogs.actorId, users.id))
		.where(and(...filters))
		.orderBy(desc(auditLogs.createdAt))
		.limit(50);

	return {
		logs
	};
};

import { eq } from 'drizzle-orm';
