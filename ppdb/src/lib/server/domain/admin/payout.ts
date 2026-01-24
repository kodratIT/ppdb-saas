import { db } from '$lib/server/db';
import { payouts, tenants, users } from '$lib/server/db/schema';
import { eq, desc, sql, and, gte, lte, or, like, count } from 'drizzle-orm';

// Dynamic import for payoutAuditLogs - table might not exist yet
let payoutAuditLogs: any;
try {
	payoutAuditLogs = require('$lib/server/db/schema').payoutAuditLogs;
} catch (e) {
	// Table doesn't exist yet, will be available after migration
}

export interface PayoutStatsParams {
	tenantId?: string;
	dateFrom?: Date;
	dateTo?: Date;
}

export interface PayoutsStats {
	totalPayouts: number;
	pendingAmount: number;
	completedAmount: number;
	pendingCount: number;
	completedCount: number;
	operationalStatus: 'connected' | 'disconnected';
	trend?: {
		totalPayouts: number;
		pendingAmount: number;
		completedAmount: number;
	};
}

export interface FilterParams {
	status?: string;
	dateFrom?: string;
	dateTo?: string;
	search?: string;
	page?: number;
	limit?: number;
	sortBy?: 'createdAt' | 'amount' | 'status';
	sortOrder?: 'asc' | 'desc';
}

export interface PaginatedPayouts {
	payouts: Array<{
		id: string;
		tenantName: string;
		amount: number;
		status: string;
		bankName: string;
		accountNumber: string;
		accountName: string;
		reference: string | null;
		requestedByName: string | null;
		createdAt: Date;
		processedAt: Date | null;
	}>;
	pagination: {
		page: number;
		total: number;
		totalPages: number;
	};
}

export interface PayoutDetails extends Record<string, any> {
	id: string;
	tenantName: string;
	amount: number;
	status: string;
	bankName: string;
	accountNumber: string;
	accountName: string;
	reference: string | null;
	requestedByName: string | null;
	requesterEmail: string | null;
	createdAt: Date;
	processedAt: Date | null;
	processedByName: string | null;
	notes: string | null;
	auditLogs: Array<{
		id: string;
		action: string;
		previousStatus: string | null;
		newStatus: string;
		actorName: string;
		notes: string | null;
		createdAt: Date;
	}>;
}

export async function listPayouts() {
	return await db
		.select({
			id: payouts.id,
			amount: payouts.amount,
			status: payouts.status,
			bankName: payouts.bankName,
			accountNumber: payouts.accountNumber,
			accountName: payouts.accountName,
			reference: payouts.reference,
			tenantName: tenants.name,
			requestedByName: users.name,
			createdAt: payouts.createdAt,
			processedAt: payouts.processedAt
		})
		.from(payouts)
		.innerJoin(tenants, eq(payouts.tenantId, tenants.id))
		.innerJoin(users, eq(payouts.requestedBy, users.id))
		.orderBy(desc(payouts.createdAt));
}

export async function getPayoutsStats(params: PayoutStatsParams = {}): Promise<PayoutsStats> {
	const now = new Date();
	const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
	const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
	const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

	// Total count
	const [totalResult] = await db
		.select({ count: count() })
		.from(payouts)
		.where(params.dateFrom ? gte(payouts.createdAt, params.dateFrom) : undefined);

	const totalPayouts = totalResult?.count || 0;

	// Pending amount
	const [pendingResult] = await db
		.select({ total: sql<number>`COALESCE(SUM(${payouts.amount}), 0)` })
		.from(payouts)
		.where(eq(payouts.status, 'pending'));

	const pendingAmount = Number(pendingResult?.total) || 0;

	// Pending count
	const [pendingCountResult] = await db
		.select({ count: count() })
		.from(payouts)
		.where(eq(payouts.status, 'pending'));

	const pendingCount = pendingCountResult?.count || 0;

	// Completed this month
	const [completedResult] = await db
		.select({ total: sql<number>`COALESCE(SUM(${payouts.amount}), 0)` })
		.from(payouts)
		.where(and(eq(payouts.status, 'completed'), gte(payouts.processedAt, startOfMonth)));

	const completedAmount = Number(completedResult?.total) || 0;

	// Completed count this month
	const [completedCountResult] = await db
		.select({ count: count() })
		.from(payouts)
		.where(and(eq(payouts.status, 'completed'), gte(payouts.processedAt, startOfMonth)));

	const completedCount = completedCountResult?.count || 0;

	// Trends (compare with last month)
	const [lastMonthResult] = await db
		.select({ total: sql<number>`COALESCE(SUM(${payouts.amount}), 0)` })
		.from(payouts)
		.where(
			and(
				eq(payouts.status, 'completed'),
				gte(payouts.processedAt, startOfLastMonth),
				lte(payouts.processedAt, endOfLastMonth)
			)
		);

	const lastMonthAmount = Number(lastMonthResult?.total) || 0;
	const completedTrend =
		lastMonthAmount > 0 ? ((completedAmount - lastMonthAmount) / lastMonthAmount) * 100 : 0;

	// For simplicity, mock other trends
	return {
		totalPayouts,
		pendingAmount,
		completedAmount,
		pendingCount,
		completedCount,
		operationalStatus: 'connected', // TODO: Implement actual bridge status check
		trend: {
			totalPayouts: 0, // TODO: Calculate actual trend
			pendingAmount: 0,
			completedAmount: Math.round(completedTrend)
		}
	};
}

export async function getPayoutsWithFilters(params: FilterParams = {}): Promise<PaginatedPayouts> {
	const page = params.page || 1;
	const limit = params.limit || 10;
	const offset = (page - 1) * limit;

	// Build conditions
	const conditions = [];

	if (params.status && params.status !== 'all') {
		conditions.push(eq(payouts.status, params.status as any));
	}

	if (params.dateFrom) {
		conditions.push(gte(payouts.createdAt, new Date(params.dateFrom)));
	}

	if (params.dateTo) {
		const toDate = new Date(params.dateTo);
		toDate.setHours(23, 59, 59, 999);
		conditions.push(lte(payouts.createdAt, toDate));
	}

	if (params.search) {
		const searchTerm = `%${params.search}%`;
		conditions.push(
			or(
				like(tenants.name, searchTerm),
				like(payouts.accountNumber, searchTerm)
			)
		);
	}

	const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

	// Get total count
	const [countResult] = await db
		.select({ count: count() })
		.from(payouts)
		.innerJoin(tenants, eq(payouts.tenantId, tenants.id))
		.where(whereClause);

	const total = countResult?.count || 0;
	const totalPages = Math.ceil(total / limit);

	// Build order by
	let orderBy;
	const sortColumn = params.sortBy === 'amount' ? payouts.amount : payouts.createdAt;
	orderBy = params.sortOrder === 'asc' ? sortColumn : desc(sortColumn);

	// Get payouts
	const payoutsData = await db
		.select({
			id: payouts.id,
			tenantName: tenants.name,
			amount: payouts.amount,
			status: payouts.status,
			bankName: payouts.bankName,
			accountNumber: payouts.accountNumber,
			accountName: payouts.accountName,
			reference: payouts.reference,
			requestedByName: users.name,
			createdAt: payouts.createdAt,
			processedAt: payouts.processedAt
		})
		.from(payouts)
		.innerJoin(tenants, eq(payouts.tenantId, tenants.id))
		.innerJoin(users, eq(payouts.requestedBy, users.id))
		.where(whereClause)
		.orderBy(orderBy)
		.limit(limit)
		.offset(offset);

	return {
		payouts: payoutsData,
		pagination: {
			page,
			total,
			totalPages
		}
	};
}

export async function getPayoutDetails(id: string): Promise<PayoutDetails | null> {
	const [payout] = await db
		.select({
			id: payouts.id,
			tenantName: tenants.name,
			amount: payouts.amount,
			status: payouts.status,
			bankName: payouts.bankName,
			accountNumber: payouts.accountNumber,
			accountName: payouts.accountName,
			reference: payouts.reference,
			requestedByName: users.name,
			requesterEmail: users.email,
			createdAt: payouts.createdAt,
			processedAt: payouts.processedAt,
			notes: payouts.reference
		})
		.from(payouts)
		.innerJoin(tenants, eq(payouts.tenantId, tenants.id))
		.innerJoin(users, eq(payouts.requestedBy, users.id))
		.where(eq(payouts.id, id))
		.limit(1);

	if (!payout) return null;

	// Get processor info
	let processedByName = null;
	if (payout.processedAt && payout.processedAt) {
		const [processor] = await db
			.select({ name: users.name })
			.from(users)
			.where(eq(users.id, sql`SELECT processed_by FROM payouts WHERE id = ${id}`))
			.limit(1);
		processedByName = processor?.name || null;
	}

	// Get audit logs - check if table exists first
	let auditLogs: any[] = [];
	try {
		auditLogs = await db
			.select({
				id: payoutAuditLogs.id,
				action: payoutAuditLogs.action,
				previousStatus: payoutAuditLogs.previousStatus,
				newStatus: payoutAuditLogs.newStatus,
				actorName: payoutAuditLogs.actorName,
				notes: payoutAuditLogs.notes,
				createdAt: payoutAuditLogs.createdAt
			})
			.from(payoutAuditLogs)
			.where(eq(payoutAuditLogs.payoutId, id))
			.orderBy(desc(payoutAuditLogs.createdAt));
	} catch (e) {
		// Table might not exist yet
		console.warn('payout_audit_logs table not available yet', e);
	}

	return {
		...payout,
		processedByName,
		auditLogs
	};
}

export async function updatePayoutStatus(
	id: string,
	status: 'completed' | 'failed' | 'rejected' | 'processed',
	actorId: string,
	actorName: string,
	notes?: string,
	reference?: string
) {
	const [currentPayout] = await db
		.select({ status: payouts.status })
		.from(payouts)
		.where(eq(payouts.id, id))
		.limit(1);

	if (!currentPayout) {
		throw new Error('Payout not found');
	}

	const [updated] = await db
		.update(payouts)
		.set({
			status,
			processedBy: actorId,
			processedAt: new Date(),
			updatedAt: new Date(),
			...(reference && { reference })
		})
		.where(eq(payouts.id, id))
		.returning();

	// Create audit log
	await createPayoutAuditLog({
		payoutId: id,
		action: status === 'completed' ? 'approved' : status === 'rejected' ? 'rejected' : 'processed',
		previousStatus: currentPayout.status,
		newStatus: status,
		actorId,
		actorName,
		notes,
		metadata: reference ? { reference } : undefined
	});

	return updated;
}

export async function bulkUpdatePayoutStatus(
	ids: string[],
	status: 'completed' | 'rejected',
	actorId: string,
	actorName: string,
	notes?: string
) {
	const results = {
		success: 0,
		failed: 0,
		errors: [] as string[]
	};

	for (const id of ids) {
		try {
			await updatePayoutStatus(id, status, actorId, actorName, notes);
			results.success++;
		} catch (error) {
			results.failed++;
			results.errors.push(`${id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
		}
	}

	return results;
}

export async function createPayoutAuditLog(data: {
	payoutId: string;
	action: string;
	previousStatus?: string;
	newStatus: string;
	actorId: string;
	actorName: string;
	notes?: string;
	metadata?: Record<string, any>;
}) {
	try {
		const [log] = await db
			.insert(payoutAuditLogs)
			.values({
				payoutId: data.payoutId,
				action: data.action as any,
				previousStatus: data.previousStatus as any,
				newStatus: data.newStatus as any,
				actorId: data.actorId,
				actorName: data.actorName,
				notes: data.notes,
				metadata: data.metadata ? JSON.stringify(data.metadata) : null
			})
			.returning();
		return log;
	} catch (e) {
		// Table might not exist yet
		console.warn('Failed to create audit log:', e);
		return null;
	}
}

export async function exportPayouts(params: FilterParams = {}, format: 'csv' | 'json' = 'csv') {
	const { payouts: payoutsData } = await getPayoutsWithFilters({ ...params, limit: 10000 });

	if (format === 'json') {
		return JSON.stringify(payoutsData, null, 2);
	}

	// CSV format
	const headers = ['ID', 'Tenant', 'Amount', 'Status', 'Bank', 'Account Number', 'Account Name', 'Requested By', 'Created At', 'Processed At'];
	const rows = payoutsData.map((p) => [
		p.id,
		p.tenantName,
		p.amount.toString(),
		p.status,
		p.bankName,
		p.accountNumber,
		p.accountName,
		p.requestedByName || '',
		p.createdAt.toISOString(),
		p.processedAt?.toISOString() || ''
	]);

	const csvContent = [
		headers.join(','),
		...rows.map((row) => row.map((cell) => `"${cell}"`).join(','))
	].join('\n');

	return csvContent;
}

export async function processPayout(
	payoutId: string,
	status: 'completed' | 'failed' | 'rejected',
	reference: string,
	adminId: string
) {
	const [updated] = await db
		.update(payouts)
		.set({
			status,
			reference,
			processedBy: adminId,
			processedAt: new Date(),
			updatedAt: new Date()
		})
		.where(eq(payouts.id, payoutId))
		.returning();

	return updated;
}
