import { db } from '$lib/server/db';
import { tickets, ticketMessages, type ticketStatusEnum } from '$lib/server/db/schema';
import { eq, desc, asc } from 'drizzle-orm';

/**
 * Get all tickets for admin view
 */
export async function getAllTickets() {
	return await db.query.tickets.findMany({
		with: {
			tenant: true,
			user: true
		},
		orderBy: [desc(tickets.updatedAt)]
	});
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
export async function replyToTicket(ticketId: string, senderId: string, content: string, status?: 'open' | 'in_progress' | 'resolved' | 'closed') {
	const result = await db.transaction(async (tx) => {
		// 1. Create message
		await tx.insert(ticketMessages).values({
			ticketId,
			senderId,
			content
		});

		// 2. Update ticket status & timestamp
		if (status) {
			await tx
				.update(tickets)
				.set({ 
					status: status,
					updatedAt: new Date()
				})
				.where(eq(tickets.id, ticketId));
		} else {
			// Just update timestamp
			await tx
				.update(tickets)
				.set({ updatedAt: new Date() })
				.where(eq(tickets.id, ticketId));
		}
	});

	return result;
}

/**
 * Create a new ticket (for School Admin)
 */
export async function createTicket(tenantId: string, userId: string, subject: string, content: string, priority: 'low' | 'medium' | 'high' | 'critical' = 'medium') {
	return await db.transaction(async (tx) => {
		const [newTicket] = await tx.insert(tickets).values({
			tenantId,
			userId,
			subject,
			priority
		}).returning();

		await tx.insert(ticketMessages).values({
			ticketId: newTicket.id,
			senderId: userId,
			content
		});

		return newTicket;
	});
}
