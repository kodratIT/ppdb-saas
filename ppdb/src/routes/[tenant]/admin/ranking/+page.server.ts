import { db } from '$lib/server/db';
import { admissionPaths } from '$lib/server/db/schema';
import { requireAuth, requireRole } from '$lib/server/auth/authorization';
import { eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const auth = requireAuth(locals);
	requireRole(auth, 'school_admin', 'super_admin');

	const paths = await db.query.admissionPaths.findMany({
		where: eq(admissionPaths.tenantId, auth.tenantId),
		orderBy: (paths, { desc }) => [desc(paths.createdAt)]
	});

	return {
		paths
	};
};
