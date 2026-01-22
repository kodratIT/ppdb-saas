import { db } from '$lib/server/db';
import {
	tenants,
	saasSubscriptions,
	saasPackages,
	applications,
	saasInvoices
} from '$lib/server/db/schema';
import { eq, sql, desc, or, ilike, and } from 'drizzle-orm';

export interface TenantFilter {
	page?: number;
	limit?: number;
	search?: string;
	status?: string;
	packageId?: string;
}

export async function getTenants(filters: TenantFilter = {}) {
	const page = filters.page || 1;
	const limit = filters.limit || 10;
	const offset = (page - 1) * limit;

	const whereConditions = [];

	if (filters.search) {
		whereConditions.push(
			or(ilike(tenants.name, `%${filters.search}%`), ilike(tenants.slug, `%${filters.search}%`))
		);
	}

	if (filters.status && filters.status !== 'all') {
		whereConditions.push(eq(saasSubscriptions.status, filters.status as any));
	}

	if (filters.packageId && filters.packageId !== 'all') {
		whereConditions.push(eq(saasSubscriptions.packageId, filters.packageId));
	}

	const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

	// Count total
	const [countResult] = await db
		.select({ count: sql<number>`count(*)` })
		.from(tenants)
		.leftJoin(saasSubscriptions, eq(saasSubscriptions.tenantId, tenants.id))
		.where(whereClause);

	const total = Number(countResult.count);
	const totalPages = Math.ceil(total / limit);

	// Fetch data
	const rows = await db
		.select({
			tenant: tenants,
			subscription: saasSubscriptions,
			package: saasPackages,
			applicationCount:
				sql<number>`(SELECT count(*) FROM ${applications} WHERE ${applications.tenantId} = ${tenants.id})`.mapWith(
					Number
				)
		})
		.from(tenants)
		.leftJoin(saasSubscriptions, eq(saasSubscriptions.tenantId, tenants.id))
		.leftJoin(saasPackages, eq(saasSubscriptions.packageId, saasPackages.id))
		.where(whereClause)
		.limit(limit)
		.offset(offset)
		.orderBy(desc(tenants.createdAt));

	return {
		data: rows,
		pagination: {
			page,
			limit,
			total,
			totalPages
		}
	};
}

export async function cancelSubscription(tenantId: string) {
	if (!tenantId || typeof tenantId !== 'string') {
		throw new Error('Invalid tenantId: must be a non-empty string');
	}

	return await db
		.update(saasSubscriptions)
		.set({
			status: 'cancelled',
			autoRenew: false,
			updatedAt: new Date()
		})
		.where(eq(saasSubscriptions.tenantId, tenantId));
}

export async function extendTrial(tenantId: string, days: number) {
	if (!tenantId || typeof tenantId !== 'string') {
		throw new Error('Invalid tenantId: must be a non-empty string');
	}
	if (![7, 14, 30].includes(days)) {
		throw new Error('Invalid days: must be 7, 14, or 30');
	}

	const currentSub = await db.query.saasSubscriptions.findFirst({
		where: eq(saasSubscriptions.tenantId, tenantId)
	});

	if (!currentSub) {
		throw new Error('Subscription not found for tenant');
	}

	const currentEnd = new Date(currentSub.currentPeriodEnd);
	const newEnd = new Date(currentEnd);
	newEnd.setDate(newEnd.getDate() + days);

	return await db
		.update(saasSubscriptions)
		.set({
			currentPeriodEnd: newEnd,
			updatedAt: new Date()
		})
		.where(eq(saasSubscriptions.tenantId, tenantId));
}
export async function getTenantDetails(tenantId: string) {
	const result = await db
		.select({
			tenant: tenants,
			subscription: saasSubscriptions,
			package: saasPackages,
			applicationCount:
				sql<number>`(SELECT count(*) FROM ${applications} WHERE ${applications.tenantId} = ${tenants.id})`.mapWith(
					Number
				)
		})
		.from(tenants)
		.leftJoin(saasSubscriptions, eq(saasSubscriptions.tenantId, tenants.id))
		.leftJoin(saasPackages, eq(saasSubscriptions.packageId, saasPackages.id))
		.where(eq(tenants.id, tenantId))
		.limit(1);

	if (!result.length) return null;

	const row = result[0];

	// Fetch invoices separately or join if preferred, but separate is cleaner for lists
	const invoices = await db
		.select()
		.from(saasInvoices)
		.where(eq(saasInvoices.tenantId, tenantId))
		.orderBy(desc(saasInvoices.createdAt))
		.limit(10); // Last 10 invoices

	return {
		...row,
		invoices
	};
}
