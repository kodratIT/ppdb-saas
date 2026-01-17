import { db } from '$lib/server/db';
import { auditLogs, users } from '$lib/server/db/schema';
import { requireAuth, requireRole } from '$lib/server/auth/authorization';
import { eq, desc } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const auth = requireAuth(locals);
	requireRole(auth, 'school_admin', 'super_admin');

	// Fetch logs with actor details
	// Since auditLogs doesn't have direct tenantId (it's global per actor),
	// we filter by actor who belongs to this tenant or logs related to this tenant context.
	// However, current audit_logs schema: id, actorId, action, target, details, timestamp.
	// It doesn't strictly have tenantId.
	// Ideally we should filter by actors who are members of this tenant.

	// Join with users table to filter by tenantId
	const logs = await db
		.select({
			id: auditLogs.id,
			action: auditLogs.action,
			target: auditLogs.target,
			details: auditLogs.details,
			timestamp: auditLogs.createdAt,
			actorName: users.name,
			actorEmail: users.email,
			actorRole: users.role
		})
		.from(auditLogs)
		.innerJoin(users, eq(auditLogs.actorId, users.id))
		.where(eq(users.tenantId, auth.tenantId)) // Only show logs for users in this tenant
		.orderBy(desc(auditLogs.createdAt))
		.limit(100);

	return {
		logs
	};
};
