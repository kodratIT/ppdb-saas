import { getVerificationQueue } from '$lib/server/domain/verification';
import { db } from '$lib/server/db';
import { units } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.session) {
		throw redirect(302, '/auth/login');
	}

	// Check permissions (verifier, school_admin)
	const allowedRoles = ['verifier', 'school_admin'];
	if (!locals.session.role || !allowedRoles.includes(locals.session.role)) {
		throw error(403, 'Unauthorized access to verification');
	}

	const tenantId = locals.tenantId;
	if (!tenantId) throw error(400, 'Tenant context missing');

	const selectedUnitId = url.searchParams.get('unit_id') || 'all';

	const [queue, tenantUnits] = await Promise.all([
		getVerificationQueue(tenantId as string, selectedUnitId),
		db.query.units.findMany({
			where: eq(units.tenantId, tenantId as string),
			orderBy: (units, { asc }) => [asc(units.name)]
		})
	]);

	return {
		queue,
		units: tenantUnits,
		selectedUnitId
	};
};
