import { db } from '$lib/server/db';
import { tenants, users, broadcasts, messageTemplates } from '$lib/server/db/schema';
import { eq, and, inArray, desc, gte, lte, sql } from 'drizzle-orm';
import { sendWhatsappMessage } from '$lib/server/whatsapp/providers/waha';
import type { BroadcastRecord, BroadcastAnalytics } from '$lib/types/admin';

export async function createBroadcast(options: {
	targetType: 'all' | 'active' | 'inactive' | 'custom';
	targetTenantIds?: string[];
	message: string;
	scheduledAt?: Date | string | null;
	senderId: string;
	templateId?: string | null;
}) {
	// 1. Determine targets
	let targetTenantIds = options.targetTenantIds;

	if (options.targetType !== 'custom') {
		const statusFilter =
			options.targetType === 'all'
				? undefined
				: (options.targetType as 'active' | 'inactive');
		const targetTenants = await db
			.select({ id: tenants.id })
			.from(tenants)
			.where(statusFilter ? eq(tenants.status, statusFilter) : undefined);
		targetTenantIds = targetTenants.map((t) => t.id);
	}

	if (!targetTenantIds || targetTenantIds.length === 0) {
		throw new Error('No targets found for broadcast');
	}

	// 2. Get Admin users from those tenants
	const admins = await db
		.select({
			id: users.id,
			name: users.name,
			email: users.email,
			tenantId: users.tenantId
		})
		.from(users)
		.where(
			and(
				inArray(users.tenantId, targetTenantIds),
				inArray(users.role, ['school_admin', 'super_admin'])
			)
		);

	if (admins.length === 0) {
		throw new Error('No admin users found for the selected targets');
	}

	// 3. Create broadcast record
	const [record] = await db
		.insert(broadcasts)
		.values({
			senderId: options.senderId,
			targetType: options.targetType,
			targetTenantIds: options.targetType === 'custom' ? targetTenantIds : null,
			message: options.message,
			templateId: options.templateId,
			status: options.scheduledAt ? 'scheduled' : 'pending',
			totalTarget: admins.length,
			scheduledAt: options.scheduledAt ? new Date(options.scheduledAt) : null,
			createdAt: new Date(),
			updatedAt: new Date()
		})
		.returning();

	// 4. If not scheduled, send immediately
	if (!options.scheduledAt) {
		processBroadcast(record.id, admins);
	}

	return record;
}

/**
 * Background-ish processing of broadcast
 */
export async function processBroadcast(broadcastId: string, targets: any[]) {
	let successCount = 0;
	let failedRecipients: string[] = [];
	const [record] = await db.select().from(broadcasts).where(eq(broadcasts.id, broadcastId));

	if (!record) return;

	await db
		.update(broadcasts)
		.set({ status: 'sent', sentAt: new Date() })
		.where(eq(broadcasts.id, broadcastId));

	for (const target of targets) {
		// Extract phone from email if it's stored there (common in our WAHA setup)
		const phoneNumber = target.email.includes('@') ? target.email.split('@')[0] : target.email;

		try {
			// Substitution logic (simple)
			let finalMessage = record.message;
			finalMessage = finalMessage.replace(/\{\{admin_name\}\}/g, target.name || 'Admin');
			// We could fetch school name too if needed

			const sent = await sendWhatsappMessage(phoneNumber, finalMessage);
			if (sent) {
				successCount++;
			} else {
				failedRecipients.push(phoneNumber);
			}
		} catch (error) {
			console.error(`Failed to send broadcast to ${phoneNumber}:`, error);
			failedRecipients.push(phoneNumber);
		}

		// Update progress every 5 messages or at the end
		if (successCount % 5 === 0 || successCount === targets.length) {
			await db
				.update(broadcasts)
				.set({
					sentCount: successCount,
					failedCount: failedRecipients.length,
					failedRecipients: JSON.stringify(failedRecipients)
				})
				.where(eq(broadcasts.id, broadcastId));
		}
	}
}

export async function getBroadcastHistory(limit = 20, offset = 0) {
	const results = await db.query.broadcasts.findMany({
		with: {
			sender: true
		},
		orderBy: [desc(broadcasts.createdAt)],
		limit,
		offset
	});

	return results.map((r) => ({
		id: r.id,
		createdAt: r.createdAt,
		targetType: r.targetType,
		targetCount: r.totalTarget,
		sentCount: r.sentCount,
		failedCount: r.failedCount,
		status: r.status,
		messagePreview: r.message.substring(0, 50) + (r.message.length > 50 ? '...' : ''),
		scheduledAt: r.scheduledAt,
		sentAt: r.sentAt,
		senderName: r.sender?.name || 'Unknown'
	})) as BroadcastRecord[];
}

export async function getBroadcastAnalytics(days = 30): Promise<BroadcastAnalytics> {
	const startDate = new Date();
	startDate.setDate(startDate.getDate() - days);

	const allBroadcasts = await db
		.select()
		.from(broadcasts)
		.where(gte(broadcasts.createdAt, startDate));

	const totalBroadcasts = allBroadcasts.length;
	const totalMessagesSent = allBroadcasts.reduce((sum, b) => sum + b.sentCount, 0);
	const totalMessagesFailed = allBroadcasts.reduce((sum, b) => sum + b.failedCount, 0);
	const totalTargets = allBroadcasts.reduce((sum, b) => sum + b.totalTarget, 0);

	const dailyStatsRaw = await db
		.select({
			date: sql<string>`DATE(${broadcasts.createdAt})`,
			sent: sql<number>`SUM(${broadcasts.sentCount})`,
			failed: sql<number>`SUM(${broadcasts.failedCount})`
		})
		.from(broadcasts)
		.where(gte(broadcasts.createdAt, startDate))
		.groupBy(sql`DATE(${broadcasts.createdAt})`)
		.orderBy(sql`DATE(${broadcasts.createdAt})`);

	// Mocking top messages and targets for now, as they require more complex grouping
	const topMessages = allBroadcasts
		.sort((a, b) => b.sentCount - a.sentCount)
		.slice(0, 5)
		.map((b) => ({
			message: b.message.substring(0, 30) + '...',
			sentCount: b.sentCount
		}));

	return {
		totalBroadcasts,
		totalMessagesSent,
		totalMessagesFailed,
		successRate: totalTargets > 0 ? (totalMessagesSent / totalTargets) * 100 : 0,
		averageDeliveryTime: 1200, // Mock
		topMessages,
		dailyStats: dailyStatsRaw.map((d) => ({
			date: d.date,
			sent: Number(d.sent),
			failed: Number(d.failed)
		})),
		topTargets: [] // Group by target type or similar
	};
}

// Backward compatibility (optional, but good to have)
export async function broadcastToAdmins(options: {
	tenantIds?: string[];
	status?: 'active' | 'inactive';
	message: string;
}) {
	return createBroadcast({
		targetType: options.tenantIds ? 'custom' : (options.status || 'all') as any,
		targetTenantIds: options.tenantIds,
		message: options.message,
		senderId: '00000000-0000-0000-0000-000000000000' // Should be passed from locals
	});
}
