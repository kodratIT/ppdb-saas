import { fail, type RequestEvent } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { schoolProfiles } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { requireAuth, requirePermission } from '$lib/server/auth/authorization';
import { PERMISSIONS } from '$lib/server/auth/permissions';
import { env } from '$env/dynamic/private';
import { logSensitiveAction } from '$lib/server/auth/audit-logger';

export async function load({ locals }: RequestEvent) {
	const auth = await requireAuth(locals);
	requirePermission(auth, PERMISSIONS.PAYMENTS_MANAGE);

	const profile = await db.query.schoolProfiles.findFirst({
		where: eq(schoolProfiles.tenantId, auth.tenantId)
	});

	return {
		hasKey: !!env.XENDIT_SECRET_KEY,
		bankInfo: {
			bankName: profile?.bankName || '',
			bankAccountName: profile?.bankAccountName || '',
			bankAccountNumber: profile?.bankAccountNumber || ''
		}
	};
}

export const actions = {
	updateBankInfo: async ({ request, locals }: RequestEvent) => {
		const auth = await requireAuth(locals);
		requirePermission(auth, PERMISSIONS.PAYMENTS_MANAGE);

		const formData = await request.formData();
		const bankName = formData.get('bankName') as string;
		const bankAccountName = formData.get('bankAccountName') as string;
		const bankAccountNumber = formData.get('bankAccountNumber') as string;

		try {
			await db
				.update(schoolProfiles)
				.set({
					bankName,
					bankAccountName,
					bankAccountNumber,
					updatedAt: new Date()
				})
				.where(eq(schoolProfiles.tenantId, auth.tenantId));

			await logSensitiveAction(auth.userId, 'update_bank_info', auth.tenantId, {
				bankName,
				bankAccountName,
				bankAccountNumber
			});

			return { success: true };
		} catch (err) {
			console.error('Failed to update bank info:', err);
			return fail(500, { message: 'Failed to update bank information' });
		}
	}
};
