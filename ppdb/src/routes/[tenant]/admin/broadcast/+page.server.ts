import { db } from '$lib/server/db';
import { invoices, applications, broadcasts } from '$lib/server/db/schema';
import { requireAuth, requireRole } from '$lib/server/auth/authorization';
import { eq, and, desc } from 'drizzle-orm';
import { fail, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { sendWhatsappMessage } from '$lib/server/whatsapp/providers/waha';

export const load: PageServerLoad = async ({ locals }) => {
	const auth = requireAuth(locals);
	requireRole(auth, 'school_admin', 'super_admin');

	// Get broadcast history
	const history = await db.query.broadcasts.findMany({
		where: eq(broadcasts.tenantId, auth.tenantId),
		orderBy: [desc(broadcasts.createdAt)],
		limit: 20
	});

	return {
		history
	};
};

export const actions: Actions = {
	sendBroadcast: async ({ request, locals }) => {
		const auth = requireAuth(locals);
		requireRole(auth, 'school_admin', 'super_admin');

		const formData = await request.formData();
		const targetSegment = formData.get('targetSegment') as string;
		const messageTemplate = formData.get('messageTemplate') as string;

		if (!targetSegment || !messageTemplate) {
			return fail(400, { message: 'Missing required fields' });
		}

		// 1. Determine Audience
		let recipientPhones: string[] = [];

		try {
			if (targetSegment === 'all') {
				// All parents
				// Filter users who have phone number (implied from email/auth or application)
				// For WAHA, we need phone numbers. Assuming user email is not phone.
				// We should join with applications to get phone numbers.
				const apps = await db.query.applications.findMany({
					where: eq(applications.tenantId, auth.tenantId)
				});
				recipientPhones = apps.map((a) => a.parentPhone).filter((p): p is string => !!p);
			} else if (targetSegment === 'pending_payment') {
				// Parents with UNPAID invoices
				const pendingInvoices = await db.query.invoices.findMany({
					where: and(eq(invoices.tenantId, auth.tenantId), eq(invoices.status, 'PENDING')),
					with: { application: true }
				});
				recipientPhones = pendingInvoices
					.map((i) => i.application.parentPhone)
					.filter((p): p is string => !!p);
			} else if (targetSegment === 'verified') {
				const verifiedApps = await db.query.applications.findMany({
					where: and(eq(applications.tenantId, auth.tenantId), eq(applications.status, 'verified'))
				});
				recipientPhones = verifiedApps.map((a) => a.parentPhone).filter((p): p is string => !!p);
			} else if (targetSegment === 'accepted') {
				const acceptedApps = await db.query.applications.findMany({
					where: and(eq(applications.tenantId, auth.tenantId), eq(applications.status, 'accepted'))
				});
				recipientPhones = acceptedApps.map((a) => a.parentPhone).filter((p): p is string => !!p);
			}

			// Remove duplicates
			recipientPhones = [...new Set(recipientPhones)];

			if (recipientPhones.length === 0) {
				return fail(400, { message: 'No recipients found for this segment' });
			}

			// 2. Batch Sending (Manual limit for safety)
			const BATCH_LIMIT = 50; // Conservative limit
			const batch = recipientPhones.slice(0, BATCH_LIMIT);

			let sentCount = 0;
			let failedCount = 0;
			const failedRecipients: string[] = [];

			// Parallel processing with simple Promise.all for small batch
			await Promise.all(
				batch.map(async (phone) => {
					try {
						// Simple variable replacement
						// Note: For mass broadcast, we might not personalize names if querying bulk
						// unless we fetch name alongside phone.
						// For MVP, we send generic message or handle personalization later.
						// Let's assume generic message for now to keep it fast.
						const sent = await sendWhatsappMessage(phone, messageTemplate);
						if (sent) sentCount++;
						else {
							failedCount++;
							failedRecipients.push(phone);
						}
					} catch {
						failedCount++;
						failedRecipients.push(phone);
					}
				})
			);

			// 3. Log Broadcast
			await db.insert(broadcasts).values({
				tenantId: auth.tenantId,
				senderId: auth.userId,
				targetSegment,
				messageTemplate,
				sentCount,
				failedCount,
				failedRecipients: JSON.stringify(failedRecipients)
			});

			return {
				success: true,
				message: `Broadcast sent to ${sentCount} recipients. (${failedCount} failed)`,
				remaining: Math.max(0, recipientPhones.length - BATCH_LIMIT)
			};
		} catch (error) {
			console.error('Broadcast error:', error);
			return fail(500, { message: 'Failed to process broadcast' });
		}
	}
};
