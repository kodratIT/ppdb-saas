import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { auditLogs, users, tenants } from '$lib/server/db/schema';
import { eq, desc, and, like, gte, lte, sql } from 'drizzle-orm';
import { requireAuth, requireSuperAdmin } from '$lib/server/auth/authorization';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, locals }) => {
    const auth = await requireAuth(locals);
    requireSuperAdmin(auth);

    // Redirect to new system security page
    throw redirect(302, '/admin/system/security');

    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = 50;
    const offset = (page - 1) * limit;

    const action = url.searchParams.get('action') || '';
    const actorId = url.searchParams.get('actor') || '';
    const dateFrom = url.searchParams.get('from') || '';
    const dateTo = url.searchParams.get('to') || '';

    // Build filters
    const conditions = [];
    if (action) conditions.push(like(auditLogs.action, `%${action}%`));
    if (actorId) conditions.push(eq(auditLogs.actorId, actorId));
    if (dateFrom) conditions.push(gte(auditLogs.createdAt, new Date(dateFrom)));
    if (dateTo) conditions.push(lte(auditLogs.createdAt, new Date(dateTo)));

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    // Get logs
    const logs = await db
        .select({
            id: auditLogs.id,
            action: auditLogs.action,
            target: auditLogs.target,
            details: auditLogs.details,
            createdAt: auditLogs.createdAt,
            actorEmail: users.email,
            actorName: users.name,
            tenantName: tenants.name
        })
        .from(auditLogs)
        .leftJoin(users, eq(auditLogs.actorId, users.id))
        .leftJoin(tenants, eq(users.tenantId, tenants.id))
        .where(where)
        .orderBy(desc(auditLogs.createdAt))
        .limit(limit)
        .offset(offset);

    // Get total count
    const [totalCountResult] = await db
        .select({ count: sql<number>`cast(count(*) as integer)` })
        .from(auditLogs)
        .where(where);

    // Get unique actions for filter
    const uniqueActions = await db
        .selectDistinct({ action: auditLogs.action })
        .from(auditLogs)
        .orderBy(auditLogs.action);

    return {
        logs,
        actions: uniqueActions.map((a) => a.action),
        pagination: {
            total: totalCountResult.count,
            page,
            limit,
            totalPages: Math.ceil(totalCountResult.count / limit)
        }
    };
};
