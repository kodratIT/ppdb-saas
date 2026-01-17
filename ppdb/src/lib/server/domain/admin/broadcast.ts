import { db } from '$lib/server/db';
import { tenants, users } from '$lib/server/db/schema';
import { eq, and, inArray } from 'drizzle-orm';
import { sendWhatsappMessage } from '$lib/server/whatsapp/providers/waha';

export async function broadcastToAdmins(options: {
	tenantIds?: string[];
	status?: 'active' | 'inactive';
	message: string;
}) {
	// 1. Get targets
	let targetTenantIds = options.tenantIds;

	if (!targetTenantIds) {
		const targetTenants = await db
			.select({ id: tenants.id })
			.from(tenants)
			.where(options.status ? eq(tenants.status, options.status) : undefined);
		targetTenantIds = targetTenants.map((t) => t.id);
	}

	if (targetTenantIds.length === 0) return { success: true, count: 0 };

	// 2. Get Admin users from those tenants
	const admins = await db
		.select({
			id: users.id,
			name: users.name,
			email: users.email // We use email field for phone number in some contexts, or we should use a dedicated field
		})
		.from(users)
		.where(
			and(
				inArray(users.tenantId, targetTenantIds),
				inArray(users.role, ['school_admin', 'super_admin'])
			)
		);

	// 3. Send messages (Parallel with concurrency limit would be better, but simple loop for now)
	let successCount = 0;
	for (const admin of admins) {
		// Extract phone from email if it's stored there (common in our WAHA setup)
		const phoneNumber = admin.email.includes('@') ? admin.email.split('@')[0] : admin.email;

		const sent = await sendWhatsappMessage(phoneNumber, options.message);
		if (sent) successCount++;
	}

	return {
		success: true,
		totalAdmins: admins.length,
		sentCount: successCount
	};
}
