/* eslint-disable @typescript-eslint/no-explicit-any */
import { db } from '$lib/server/db';
import { paymentProofs } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { requireAuth, requireRole } from '$lib/server/auth/authorization';
import { processVerification } from '$lib/server/domain/payment/verification';
import { fail, redirect, error } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	const auth = requireAuth(locals);
	requireRole(auth, 'school_admin', 'super_admin', 'treasurer');

	const { proofId } = params;

	const proof = (await db.query.paymentProofs.findFirst({
		where: and(eq(paymentProofs.id, proofId), eq(paymentProofs.tenantId, auth.tenantId)),
		with: {
			invoice: {
				with: {
					application: {
						with: {
							user: true,
							admissionPath: {
								with: {
									feeStructures: true
								}
							}
						}
					}
				}
			}
		}
	})) as any;

	if (!proof) {
		throw error(404, 'Proof not found');
	}

	// Try to resolve Fee Name
	// Since invoice doesn't store fee structure ID, we guess from admission path's fee structures.
	// We match by amount if possible, or just take the first one.
	// This is a "best effort" display since we didn't store the exact fee ID on the invoice.
	const feeStructures: any[] = (proof.invoice.application.admissionPath as any).feeStructures;

	const matchedFee =
		feeStructures.find((f: any) => f.amount === proof.invoice.amount) || feeStructures[0];
	const feeName = matchedFee ? matchedFee.name : 'Registration Fee';

	const application = proof.invoice.application;
	const user = application.user;

	return {
		proof: {
			id: proof.id,
			fileUrl: proof.fileUrl,
			uploadedAt: proof.uploadedAt,
			notes: proof.notes,
			status: proof.status,
			amount: proof.invoice.amount,
			feeName: feeName,
			studentName: application.childFullName,
			parentName: application.parentFullName || user.name,
			parentEmail: user.email,
			parentPhone: application.parentPhone || 'N/A'
		}
	};
};

export const actions: Actions = {
	approve: async ({ locals, params }) => {
		const auth = requireAuth(locals);
		requireRole(auth, 'school_admin', 'super_admin', 'treasurer');
		const { proofId, tenant } = params;
		const { tenantId, userId } = auth;

		try {
			await processVerification(tenantId, proofId, 'accept', userId);
		} catch (e: any) {
			return fail(500, { message: e.message });
		}

		throw redirect(303, `/${tenant}/admin/finance/verification`);
	},
	reject: async ({ request, locals, params }) => {
		const auth = requireAuth(locals);
		requireRole(auth, 'school_admin', 'super_admin', 'treasurer');
		const { proofId, tenant } = params;
		const { tenantId, userId } = auth;

		const formData = await request.formData();
		const reason = formData.get('reason') as string;

		if (!reason) return fail(400, { message: 'Reason is required' });

		try {
			await processVerification(tenantId, proofId, 'reject', userId, reason);
		} catch (e: any) {
			return fail(500, { message: e.message });
		}

		throw redirect(303, `/${tenant}/admin/finance/verification`);
	}
};
