import { db } from '$lib/server/db';
import { tickets, ticketMessages, users, tenants } from '$lib/server/db/schema';
import { eq, desc, asc, and, or, ilike, sql, inArray, count, gte } from 'drizzle-orm';

export type TicketFilter = {
	page?: number;
	limit?: number;
	status?: string | string[];
	priority?: string;
	assigneeId?: string;
	search?: string;
};

/**
 * Get tickets with pagination and filtering
 */
export async function getTickets(filters: TicketFilter = {}) {
	const page = filters.page || 1;
	const limit = filters.limit || 10;
	const offset = (page - 1) * limit;

	const whereConditions = [];

	// Status filter
	if (filters.status && filters.status !== 'all') {
		const statuses = Array.isArray(filters.status) ? filters.status : [filters.status];
		// Cast string[] to valid enum values if needed, but Drizzle should handle string comparison for enums
		whereConditions.push(inArray(tickets.status, statuses as any));
	}

	// Priority filter
	if (filters.priority && filters.priority !== 'all') {
		whereConditions.push(eq(tickets.priority, filters.priority as any));
	}

	// Assignee filter
	if (filters.assigneeId) {
		if (filters.assigneeId === 'unassigned') {
			whereConditions.push(sql`${tickets.assignedTo} IS NULL`);
		} else {
			whereConditions.push(eq(tickets.assignedTo, filters.assigneeId));
		}
	}

	// Search (Subject or Tenant Name or ID)
	if (filters.search) {
		// Note: To search tenant name, we might need a join if using query builder purely on tickets
		// But db.query API handles simple where. For joined search, it's tricker.
		// We'll stick to subject and ID search for simplicity in findMany,
		// or use explicit join query for advanced search.
		// For now, let's search subject and ID.
		whereConditions.push(
			or(
				ilike(tickets.subject, `%${filters.search}%`),
				sql`CAST(${tickets.id} AS TEXT) ILIKE ${`%${filters.search}%`}`
			)
		);
	}

	const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

	// 1. Get Data
	const data = await db.query.tickets.findMany({
		where: whereClause,
		with: {
			tenant: true,
			user: true,
			assignee: true
		},
		orderBy: [desc(tickets.updatedAt)],
		limit,
		offset
	});

	// 2. Get Total Count
	// We need to replicate the where clause for count
	// Since we can't easily use 'tenant' in whereClause for findMany without extra config,
	// we accept that search is limited to ticket fields.

	const [totalResult] = await db.select({ count: count() }).from(tickets).where(whereClause);

	const total = totalResult.count;
	const totalPages = Math.ceil(total / limit);

	return {
		data,
		total,
		page,
		totalPages
	};
}

/**
 * Get a single ticket with messages
 */
export async function getTicketById(ticketId: string) {
	return await db.query.tickets.findFirst({
		where: eq(tickets.id, ticketId),
		with: {
			tenant: true,
			user: true,
			assignee: true,
			messages: {
				with: {
					sender: true
				},
				orderBy: [asc(ticketMessages.createdAt)]
			}
		}
	});
}

/**
 * Create a reply message
 */
export async function replyToTicket(
	ticketId: string,
	senderId: string,
	content: string,
	options: {
		status?: 'open' | 'in_progress' | 'resolved' | 'closed';
		isInternal?: boolean;
		attachments?: string[];
	} = {}
) {
	const result = await db.transaction(async (tx) => {
		// 1. Create message
		await tx.insert(ticketMessages).values({
			ticketId,
			senderId,
			content,
			isInternal: options.isInternal || false,
			attachments: options.attachments || []
		});

		// 2. Update ticket status & timestamp
		const updateData: any = { updatedAt: new Date() };
		if (options.status) {
			updateData.status = options.status;
		}

		await tx.update(tickets).set(updateData).where(eq(tickets.id, ticketId));
	});

	return result;
}

/**
 * Assign a ticket to a user (admin)
 */
export async function assignTicket(ticketId: string, assigneeId: string | null) {
	return await db
		.update(tickets)
		.set({
			assignedTo: assigneeId,
			updatedAt: new Date()
		})
		.where(eq(tickets.id, ticketId));
}

/**
 * Update ticket priority
 */
export async function updateTicketPriority(
	ticketId: string,
	priority: 'low' | 'medium' | 'high' | 'critical'
) {
	return await db
		.update(tickets)
		.set({
			priority,
			updatedAt: new Date()
		})
		.where(eq(tickets.id, ticketId));
}

/**
 * Create a new ticket (for School Admin)
 */
export async function createTicket(
	tenantId: string,
	userId: string,
	subject: string,
	content: string,
	priority: 'low' | 'medium' | 'high' | 'critical' = 'medium'
) {
	return await db.transaction(async (tx) => {
		const [newTicket] = await tx
			.insert(tickets)
			.values({
				tenantId,
				userId,
				subject,
				priority
			})
			.returning();

		await tx.insert(ticketMessages).values({
			ticketId: newTicket.id,
			senderId: userId,
			content
		});

		return newTicket;
	});
}

/**
 * Get ticket statistics
 */
export async function getTicketStats() {
	const now = new Date();
	const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

	const [total] = await db.select({ count: count() }).from(tickets);

	const [open] = await db
		.select({ count: count() })
		.from(tickets)
		.where(or(eq(tickets.status, 'open'), eq(tickets.status, 'in_progress')));

	const [resolved] = await db
		.select({ count: count() })
		.from(tickets)
		.where(or(eq(tickets.status, 'resolved'), eq(tickets.status, 'closed')));

	const [new24h] = await db
		.select({ count: count() })
		.from(tickets)
		.where(gte(tickets.createdAt, last24h));

	const priorityStats = await db
		.select({
			priority: tickets.priority,
			count: count()
		})
		.from(tickets)
		.groupBy(tickets.priority);

	// Calculate average response time
	// This is heavier: average time between ticket creation and FIRST message that is NOT from the ticket creator
	// We'll limit this calculation to tickets created in the last 30 days for performance
	const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

	const ticketsWithReplies = await db.query.tickets.findMany({
		where: gte(tickets.createdAt, last30Days),
		with: {
			messages: {
				orderBy: [asc(ticketMessages.createdAt)],
				limit: 2 // We just need the first reply
			}
		}
	});

	let totalResponseTimeMs = 0;
	let respondedTicketsCount = 0;

	for (const ticket of ticketsWithReplies) {
		const firstReply = ticket.messages.find((m) => m.senderId !== ticket.userId);
		if (firstReply) {
			totalResponseTimeMs += firstReply.createdAt.getTime() - ticket.createdAt.getTime();
			respondedTicketsCount++;
		}
	}

	let avgResponseTime = 'N/A';
	if (respondedTicketsCount > 0) {
		const avgMs = totalResponseTimeMs / respondedTicketsCount;
		const hours = Math.floor(avgMs / (1000 * 60 * 60));
		const minutes = Math.floor((avgMs % (1000 * 60 * 60)) / (1000 * 60));
		avgResponseTime = `${hours}h ${minutes}m`;
	}

	return {
		total: total.count,
		open: open.count,
		resolved: resolved.count,
		newTickets24h: new24h.count,
		priorityStats: priorityStats.reduce(
			(acc, curr) => {
				acc[curr.priority] = curr.count;
				return acc;
			},
			{} as Record<string, number>
		),
		avgResponseTime
	};
}
