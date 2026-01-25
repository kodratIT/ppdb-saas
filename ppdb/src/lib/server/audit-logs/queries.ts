import { db } from '$lib/server/db';
import { auditLogs, users, tenants } from '$lib/server/db/schema';
import { desc, and, or, ilike, gte, lte, eq, sql, count } from 'drizzle-orm';
import type { AuditLogFilters } from './types';

export interface AuditLogWithRelations {
	id: string;
	tenantId: string | null;
	userId: string | null;
	action: string;
	entityType: string;
	entityId: string;
	details: Record<string, any> | null;
	ipAddress: string | null;
	userAgent: string | null;
	severity: string;
	status: string;
	createdAt: Date;
	indexedAt: Date;
	user?: { id: string; name: string | null; email: string; role: string } | null;
	tenant?: { id: string; name: string } | null;
}

export interface AuditLogStats {
	total: number;
	today: number;
	thisWeek: number;
	thisMonth: number;
	byAction: Record<string, number>;
	bySeverity: Record<string, number>;
	byStatus: Record<string, number>;
}

/**
 * Fetch audit logs with pagination and filters
 */
export async function fetchAuditLogs(filters: AuditLogFilters): Promise<{
	logs: AuditLogWithRelations[];
	total: number;
	stats: AuditLogStats;
}> {
	const page = filters.page || 1;
	const limit = filters.limit || 50;
	const offset = (page - 1) * limit;

	// Build conditions
	const conditions = [];

	if (filters.search) {
		conditions.push(
			or(
				ilike(auditLogs.entityId, `%${filters.search}%`),
				sql`${auditLogs.details}->>'before' ILIKE ${`%${filters.search}%`}`,
				sql`${auditLogs.details}->>'after' ILIKE ${`%${filters.search}%`}`
			)
		);
	}

	if (filters.action) {
		conditions.push(eq(auditLogs.action, filters.action));
	}

	if (filters.entityType) {
		conditions.push(eq(auditLogs.entityType, filters.entityType));
	}

	if (filters.severity) {
		conditions.push(eq(auditLogs.severity, filters.severity));
	}

	if (filters.status) {
		conditions.push(eq(auditLogs.status, filters.status));
	}

	if (filters.userId) {
		conditions.push(eq(auditLogs.userId, filters.userId));
	}

	if (filters.tenantId) {
		conditions.push(eq(auditLogs.tenantId, filters.tenantId));
	}

	if (filters.dateFrom) {
		conditions.push(gte(auditLogs.createdAt, filters.dateFrom));
	}

	if (filters.dateTo) {
		conditions.push(lte(auditLogs.createdAt, filters.dateTo));
	}

	const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

	// Fetch logs with relations
	const logsResult = await db
		.select({
			log: auditLogs,
			user: {
				id: users.id,
				name: users.name,
				email: users.email,
				role: users.role
			},
			tenant: {
				id: tenants.id,
				name: tenants.name
			}
		})
		.from(auditLogs)
		.leftJoin(users, eq(auditLogs.userId, users.id))
		.leftJoin(tenants, eq(auditLogs.tenantId, tenants.id))
		.where(whereClause)
		.orderBy(desc(auditLogs.createdAt))
		.limit(limit)
		.offset(offset);

	const logs = logsResult.map((row) => ({
		...row.log,
		user: row.user,
		tenant: row.tenant
	})) as AuditLogWithRelations[];

	// Get total count
	const totalResult = await db
		.select({ count: count() })
		.from(auditLogs)
		.where(whereClause);

	const total = totalResult[0]?.count || 0;

	// Get stats
	const stats = await getAuditLogStats(filters);

	return { logs, total, stats };
}

/**
 * Get audit log statistics
 */
async function getAuditLogStats(filters: AuditLogFilters): Promise<AuditLogStats> {
	const now = new Date();
	const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
	const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

	// Total count
	const [totalResult] = await db.select({ count: count() }).from(auditLogs);

	// Today count
	const [todayResult] = await db
		.select({ count: count() })
		.from(auditLogs)
		.where(gte(auditLogs.createdAt, today));

	// This week count
	const [weekResult] = await db
		.select({ count: count() })
		.from(auditLogs)
		.where(gte(auditLogs.createdAt, thisWeek));

	// This month count
	const [monthResult] = await db
		.select({ count: count() })
		.from(auditLogs)
		.where(gte(auditLogs.createdAt, thisMonth));

	// By action
	const actionResults = await db
		.select({
			action: auditLogs.action,
			count: count()
		})
		.from(auditLogs)
		.groupBy(auditLogs.action);

	const byAction = actionResults.reduce((acc, row) => {
		acc[row.action] = row.count;
		return acc;
	}, {} as Record<string, number>);

	// By severity
	const severityResults = await db
		.select({
			severity: auditLogs.severity,
			count: count()
		})
		.from(auditLogs)
		.groupBy(auditLogs.severity);

	const bySeverity = severityResults.reduce((acc, row) => {
		acc[row.severity] = row.count;
		return acc;
	}, {} as Record<string, number>);

	// By status
	const statusResults = await db
		.select({
			status: auditLogs.status,
			count: count()
		})
		.from(auditLogs)
		.groupBy(auditLogs.status);

	const byStatus = statusResults.reduce((acc, row) => {
		acc[row.status] = row.count;
		return acc;
	}, {} as Record<string, number>);

	return {
		total: totalResult.count || 0,
		today: todayResult.count || 0,
		thisWeek: weekResult.count || 0,
		thisMonth: monthResult.count || 0,
		byAction,
		bySeverity,
		byStatus
	};
}

/**
 * Get a single audit log by ID
 */
export async function getAuditLogById(id: string): Promise<AuditLogWithRelations | null> {
	const result = await db
		.select({
			log: auditLogs,
			user: {
				id: users.id,
				name: users.name,
				email: users.email,
				role: users.role
			},
			tenant: {
				id: tenants.id,
				name: tenants.name
			}
		})
		.from(auditLogs)
		.leftJoin(users, eq(auditLogs.userId, users.id))
		.leftJoin(tenants, eq(auditLogs.tenantId, tenants.id))
		.where(eq(auditLogs.id, id))
		.limit(1);

	if (!result[0]) return null;

	return {
		...result[0].log,
		user: result[0].user,
		tenant: result[0].tenant
	} as AuditLogWithRelations;
}
