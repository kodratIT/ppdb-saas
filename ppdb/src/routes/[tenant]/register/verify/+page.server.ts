import { fail, redirect } from '@sveltejs/kit';
import { eq, and } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { tenants, users } from '$lib/server/db/schema';
import { verifyOTP } from '$lib/server/whatsapp/providers/waha';
import { createSession } from '$lib/server/auth/session';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, params, cookies }) => {
	const phone = url.searchParams.get('phone');
	const sessionId = cookies.get('otp_session_id');

	if (!phone) {
		throw redirect(303, `/${params.tenant}/register/start`);
	}

	return {
		phone,
		sessionId,
		tenantSlug: params.tenant
	};
};

export const actions = {
	verifyOTP: async ({ request, params, cookies }) => {
		const data = await request.formData();
		const phoneNumber = data.get('phone')?.toString();
		const otp = data.get('otp')?.toString();
		const sessionId = cookies.get('otp_session_id');

		if (!phoneNumber || !otp) {
			return fail(400, { error: 'Nomor telepon dan kode OTP wajib diisi' });
		}

		if (!sessionId) {
			return fail(400, { error: 'Sesi OTP kadaluarsa. Silakan minta kode baru.' });
		}

		const tenant = await db.query.tenants.findFirst({
			where: eq(tenants.slug, params.tenant)
		});

		if (!tenant) {
			return fail(404, { error: 'Sekolah tidak ditemukan' });
		}

		try {
			const result = await verifyOTP(sessionId, otp);

			if (!result.valid || !result.phoneNumber) {
				return fail(400, {
					error: 'Kode OTP tidak valid atau sudah kadaluarsa',
					phone: phoneNumber
				});
			}

			let user = await db.query.users.findFirst({
				where: and(eq(users.email, `${result.phoneNumber}@whatsapp`), eq(users.tenantId, tenant.id))
			});

			if (!user) {
				const [newUser] = await db
					.insert(users)
					.values({
						email: `${result.phoneNumber}@whatsapp`,
						tenantId: tenant.id,
						role: 'parent',
						status: 'active',
						name: null
					})
					.returning();
				user = newUser;
			}

			const session = await createSession({
				userId: user.id,
				tenantId: tenant.id,
				authType: 'waha',
				authIdentifier: result.phoneNumber
			});

			cookies.set('session_id', session.id, {
				path: '/',
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				sameSite: 'lax',
				maxAge: 60 * 60 * 24 * 7
			});

			cookies.delete('otp_session_id', { path: '/' });

			throw redirect(303, `/${params.tenant}/register/form/step-1`);
		} catch (error) {
			if (error instanceof Response && error.status === 303) {
				throw error;
			}

			console.error('Failed to verify OTP:', error);
			return fail(500, {
				error: 'Gagal memverifikasi OTP. Silakan coba lagi.',
				phone: phoneNumber
			});
		}
	}
} satisfies Actions;
