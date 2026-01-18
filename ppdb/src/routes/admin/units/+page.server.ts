import { db } from '$lib/server/db';
import {
	units,
	admissionPaths,
	applications,
	schoolLevelEnum,
	tenants
} from '$lib/server/db/schema';
import { eq, and, count, ilike, or } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { requireAuth, requireRole } from '$lib/server/auth/authorization';

export const load: PageServerLoad = async ({ locals, url }) => {
	const auth = requireAuth(locals);
	requireRole(auth, 'school_admin', 'super_admin');

	const isSuperAdmin = auth.session.role === 'super_admin';

	// Filters
	const search = url.searchParams.get('search') || '';
	const level = url.searchParams.get('level') || 'all';
	const tenantId = url.searchParams.get('tenant_id') || 'all';

	const conditions = [];

	// Role-based isolation
	if (!isSuperAdmin) {
		conditions.push(eq(units.tenantId, auth.tenantId));
	} else if (tenantId !== 'all') {
		conditions.push(eq(units.tenantId, tenantId));
	}

	// Search filter
	if (search) {
		conditions.push(or(ilike(units.name, `%${search}%`), ilike(units.npsn, `%${search}%`)));
	}

	// Level filter
	if (level !== 'all') {
		conditions.push(eq(units.level, level as any));
	}

	const where = conditions.length > 0 ? and(...conditions) : undefined;

	const tenantUnits = await db.query.units.findMany({
		where,
		with: {
			tenant: true
		},
		orderBy: (units, { asc }) => [asc(units.name)]
	});

	// Fetch tenants for selection if Super Admin
	let allTenants: any[] = [];
	if (isSuperAdmin) {
		allTenants = await db.query.tenants.findMany({
			orderBy: (tenants, { asc }) => [asc(tenants.name)]
		});
	}

	return {
		units: tenantUnits,
		user: auth.session,
		tenants: allTenants,
		filters: {
			search,
			level,
			tenantId
		}
	};
};

export const actions: Actions = {
	addUnit: async ({ request, locals }) => {
		const auth = requireAuth(locals);
		requireRole(auth, 'school_admin', 'super_admin');

		const formData = await request.formData();
		const name = formData.get('name') as string;
		const level = formData.get('level') as string;
		const targetTenantId = formData.get('tenantId') as string;

		const npsn = formData.get('npsn') as string;
		const accreditation = formData.get('accreditation') as string;
		const contactPhone = formData.get('contactPhone') as string;
		const address = formData.get('address') as string;

		if (!name) {
			return fail(400, { error: 'Nama unit harus diisi' });
		}

		if (!level || !schoolLevelEnum.enumValues.includes(level as any)) {
			return fail(400, { error: 'Jenjang sekolah tidak valid' });
		}

		// Only Super Admin can specify a different tenant
		const tenantId =
			auth.session.role === 'super_admin' && targetTenantId ? targetTenantId : auth.tenantId;

		try {
			await db.insert(units).values({
				tenantId,
				name,
				level: level as any,
				npsn,
				accreditation,
				contactPhone,
				address,
				config: {}
			});

			return { success: true };
		} catch (error) {
			console.error('Failed to add unit:', error);
			return fail(500, { error: 'Gagal menambah unit' });
		}
	},

	updateUnit: async ({ request, locals }) => {
		const auth = requireAuth(locals);
		requireRole(auth, 'school_admin', 'super_admin');

		const formData = await request.formData();
		const id = formData.get('id') as string;
		const name = formData.get('name') as string;
		const level = formData.get('level') as string;
		const targetTenantId = formData.get('tenantId') as string;

		const npsn = formData.get('npsn') as string;
		const accreditation = formData.get('accreditation') as string;
		const contactPhone = formData.get('contactPhone') as string;
		const address = formData.get('address') as string;

		if (!id) {
			return fail(400, { error: 'ID unit tidak ditemukan' });
		}

		if (!name) {
			return fail(400, { error: 'Nama unit harus diisi' });
		}

		if (!level || !schoolLevelEnum.enumValues.includes(level as any)) {
			return fail(400, { error: 'Jenjang sekolah tidak valid' });
		}

		// Only Super Admin can specify a different tenant
		const tenantId =
			auth.session.role === 'super_admin' && targetTenantId ? targetTenantId : auth.tenantId;

		try {
			// Ensure unit belongs to the tenant or user is super admin
			const where =
				auth.session.role === 'super_admin'
					? eq(units.id, id)
					: and(eq(units.id, id), eq(units.tenantId, auth.tenantId));

			await db
				.update(units)
				.set({
					tenantId,
					name,
					level: level as any,
					npsn,
					accreditation,
					contactPhone,
					address,
					updatedAt: new Date()
				})
				.where(where);

			return { success: true };
		} catch (error) {
			console.error('Failed to update unit:', error);
			return fail(500, { error: 'Gagal memperbarui unit' });
		}
	},

	deleteUnit: async ({ request, locals }) => {
		const auth = requireAuth(locals);
		requireRole(auth, 'school_admin', 'super_admin');

		const formData = await request.formData();
		const id = formData.get('id') as string;

		if (!id) {
			return fail(400, { error: 'ID unit tidak ditemukan' });
		}

		try {
			// Check for associated admission paths
			const [pathCount] = await db
				.select({ val: count() })
				.from(admissionPaths)
				.where(eq(admissionPaths.unitId, id));

			// Check for associated applications
			const [appCount] = await db
				.select({ val: count() })
				.from(applications)
				.where(eq(applications.unitId, id));

			if (Number(pathCount?.val || 0) > 0 || Number(appCount?.val || 0) > 0) {
				return fail(400, {
					error: 'Tidak dapat menghapus unit yang memiliki jalur pendaftaran atau pendaftar'
				});
			}

			await db.delete(units).where(and(eq(units.id, id), eq(units.tenantId, auth.tenantId)));

			return { success: true };
		} catch (error) {
			console.error('Failed to delete unit:', error);
			return fail(500, { error: 'Gagal menghapus unit' });
		}
	}
};
