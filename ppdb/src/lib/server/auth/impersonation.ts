import { db } from '$lib/server/db';
import { auditLogs, users } from '$lib/server/db/schema';
import { eq, desc, sql } from 'drizzle-orm';

export interface ImpersonationSession {
    id: string;
    impersonatorId: string;
    impersonatedId: string;
    tenantId: string;
    startedAt: Date;
    endedAt?: Date;
    ipAddress?: string;
    userAgent?: string;
}

export async function logImpersonationStart(
    impersonatorId: string,
    impersonatedId: string,
    tenantId: string,
    sessionId: string,
    ipAddress?: string,
    userAgent?: string
): Promise<void> {
    // Get impersonated user email for details
    const [impersonatedUser] = await db
        .select({ email: users.email })
        .from(users)
        .where(eq(users.id, impersonatedId))
        .limit(1);

    // Log the impersonation start
    await db.insert(auditLogs).values({
        actorId: impersonatorId,
        action: 'impersonation_start',
        target: `user:${impersonatedId}`,
        details: JSON.stringify({
            sessionId,
            tenantId,
            impersonatedEmail: impersonatedUser?.email || 'unknown',
            ipAddress,
            userAgent
        })
    });
}

export async function logImpersonationEnd(
    impersonatorId: string,
    impersonatedId: string,
    sessionId: string
): Promise<void> {
    // Log the impersonation end
    await db.insert(auditLogs).values({
        actorId: impersonatorId,
        action: 'impersonation_end',
        target: `user:${impersonatedId}`,
        details: JSON.stringify({
            sessionId
        })
    });
}

export async function getImpersonationHistory(limit = 50) {
    const logs = await db
        .select({
            id: auditLogs.id,
            action: auditLogs.action,
            target: auditLogs.target,
            details: auditLogs.details,
            createdAt: auditLogs.createdAt,
            actorEmail: users.email,
            actorName: users.name
        })
        .from(auditLogs)
        .leftJoin(users, eq(auditLogs.actorId, users.id))
        .where(sql`${auditLogs.action} LIKE 'impersonation_%'`)
        .orderBy(desc(auditLogs.createdAt))
        .limit(limit);

    return logs;
}
