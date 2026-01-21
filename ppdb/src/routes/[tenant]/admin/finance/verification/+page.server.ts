import { db } from '$lib/server/db';
import { paymentProofs } from '$lib/server/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { requireAuth, requireRole } from '$lib/server/auth/authorization';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const auth = requireAuth(locals);
	requireRole(auth, 'school_admin', 'treasurer');

	const proofs = await db.query.paymentProofs.findMany({
		where: and(eq(paymentProofs.tenantId, auth.tenantId), eq(paymentProofs.status, 'PENDING')),
		with: {
			invoice: {
				with: {
					application: {
						with: {
							user: true
						}
					}
				}
			}
		},
		orderBy: [desc(paymentProofs.uploadedAt)]
	});

	return {
		proofs: proofs.map((proof) => ({
			id: proof.id,
			uploadedAt: proof.uploadedAt,
			amount: proof.invoice.amount,
			studentName: proof.invoice.application.childFullName,
			parentName: proof.invoice.application.parentFullName || proof.invoice.application.user.name,
			fileUrl: proof.fileUrl,
			invoiceId: proof.invoiceId,
			notes: proof.notes
		}))
	};
};
