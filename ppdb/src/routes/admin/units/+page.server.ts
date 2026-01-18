import { db } from '$lib/server/db';
import { units, admissionPaths, applications, schoolLevelEnum } from '$lib/server/db/schema';
import { eq, and, count } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { requireAuth, requireRole } from '$lib/server/auth/authorization';

export const load: PageServerLoad = async ({ locals }) => {
	const auth = requireAuth(locals);
	requireRole(auth, 'school_admin', 'super_admin');

	const isSuperAdmin = auth.session.role === 'super_admin';

	const tenantUnits = await db.query.units.findMany({
		where: isSuperAdmin ? undefined : eq(units.tenantId, auth.tenantId),
		with: {
			tenant: true
		},
		orderBy: (units, { asc }) => [asc(units.name)]
	});

	return {
		units: tenantUnits,
		user: auth.session
	};
};

export const actions: Actions = {
	addUnit: async ({ request, locals }) => {
		const auth = requireAuth(locals);
		requireRole(auth, 'school_admin', 'super_admin');

		const formData = await request.formData();
		const name = formData.get('name') as string;
		const level = formData.get('level') as string;

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

		try {
			await db.insert(units).values({
				tenantId: auth.tenantId,
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
