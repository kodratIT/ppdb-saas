import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { tenants } from '$lib/server/db/schema';
import { getBroadcastHistory, createBroadcast } from '$lib/server/domain/admin/broadcast';
import { broadcastCreateSchema } from '$lib/server/validators/admin';
import { requireAuth, requireSuperAdmin } from '$lib/server/auth/authorization';
import { fail } from '@sveltejs/kit';
import { messageTemplates } from '$lib/server/db/schema';
import { desc } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals }) => {
	const auth = await requireAuth(locals);
	requireSuperAdmin(auth);

	const allTenants = await db.select().from(tenants);

	const templates = await db
		.select()
		.from(messageTemplates)
		.orderBy(desc(messageTemplates.createdAt));

	const history = await getBroadcastHistory(10);

	return {
		tenants: allTenants,
		templates,
		history
	};
};

export const actions: Actions = {
	send: async ({ request, locals }) => {
		const auth = await requireAuth(locals);
		requireSuperAdmin(auth);

		const formData = await request.formData();
		const data = Object.fromEntries(formData);

		// Parse targetTenantIds if it's a JSON string or similar
		let targetTenantIds: string[] | undefined;
		if (data.targetTenantIds) {
			try {
				targetTenantIds = JSON.parse(data.targetTenantIds as string);
			} catch (e) {
				targetTenantIds = undefined;
			}
		}

		console.log('Sending broadcast with data:', data);

		const result = broadcastCreateSchema.safeParse({
			...data,
			targetTenantIds
		});

		if (!result.success) {
			return fail(400, { error: 'Invalid data', details: result.error.format() });
		}

		try {
			const broadcast = await createBroadcast({
				...result.data,
				senderId: auth.userId
			});

			return {
				success: true,
				broadcastId: broadcast.id,
				totalTarget: broadcast.totalTarget
			};
		} catch (error: any) {
			return fail(500, { error: error.message });
		}
	}
};
