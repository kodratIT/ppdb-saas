import { fail } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { tenants } from '$lib/server/db/schema';
import { sendOTP } from '$lib/server/whatsapp/providers/waha';
import type { Actions, PageServerLoad } from './$types';

function validatePhoneNumber(phone: string): {
	valid: boolean;
	normalized?: string;
	error?: string;
} {
	const cleaned = phone.replace(/[\s-]/g, '');

	if (cleaned.startsWith('+62')) {
		if (cleaned.length !== 13 && cleaned.length !== 14) {
			return { valid: false, error: 'Nomor telepon harus 11-12 digit setelah +62' };
		}
		return { valid: true, normalized: cleaned };
	} else if (cleaned.startsWith('62')) {
		if (cleaned.length !== 12 && cleaned.length !== 13) {
			return { valid: false, error: 'Nomor telepon harus 11-12 digit setelah 62' };
		}
		return { valid: true, normalized: `+${cleaned}` };
	} else if (cleaned.startsWith('08')) {
		if (cleaned.length !== 11 && cleaned.length !== 12) {
			return { valid: false, error: 'Nomor telepon harus 11-12 digit' };
		}
		return { valid: true, normalized: `+62${cleaned.substring(1)}` };
	}

	return { valid: false, error: 'Format nomor tidak valid. Gunakan +62, 62, atau 08' };
}

export const load: PageServerLoad = async ({ params }) => {
	const tenant = await db.query.tenants.findFirst({
		where: eq(tenants.slug, params.tenant)
	});

	if (!tenant) {
		return { error: 'School not found' };
	}

	return {
		tenantSlug: tenant.slug
	};
};

export const actions = {
	requestOTP: async ({ request, params, cookies }) => {
		const data = await request.formData();
		const phoneNumber = data.get('phone')?.toString();

		if (!phoneNumber) {
			return fail(400, { error: 'Nomor telepon wajib diisi' });
		}

		const validation = validatePhoneNumber(phoneNumber);
		if (!validation.valid) {
			return fail(400, { error: validation.error, phone: phoneNumber });
		}

		const tenant = await db.query.tenants.findFirst({
			where: eq(tenants.slug, params.tenant)
		});

		if (!tenant) {
			return fail(404, { error: 'Sekolah tidak ditemukan' });
		}

		try {
			const result = await sendOTP(validation.normalized!);

			cookies.set('otp_session_id', result.sessionId, {
				path: '/',
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				sameSite: 'lax',
				maxAge: 5 * 60
			});

			return {
				success: true,
				phone: validation.normalized
			};
		} catch (error) {
			console.error('Failed to send OTP:', error);
			return fail(500, {
				error: 'Gagal mengirim OTP. Silakan coba lagi.',
				phone: phoneNumber
			});
		}
	}
} satisfies Actions;
