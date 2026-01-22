import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { requireAuth, requireSuperAdmin } from '$lib/server/auth/authorization';
import {
	getTicketById,
	replyToTicket,
	assignTicket,
	updateTicketPriority
} from '$lib/server/domain/tickets';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals, params }) => {
	const auth = requireAuth(locals);
	requireSuperAdmin(auth);

	// Fetch ticket, staff members, and current user details in parallel
	const [ticket, staffMembers, currentUser] = await Promise.all([
		getTicketById(params.id),
		db.query.users.findMany({
			where: eq(users.role, 'super_admin'),
			columns: {
				id: true,
				name: true,
				email: true
			}
		}),
		db.query.users.findFirst({
			where: eq(users.id, auth.userId),
			columns: {
				id: true,
				name: true,
				email: true
			}
		})
	]);

	if (!ticket) {
		throw new Error('Ticket not found');
	}

	if (!currentUser) {
		throw new Error('Current user not found');
	}

	return {
		ticket,
		staffMembers,
		currentUser
	};
};

export const actions: Actions = {
	reply: async ({ request, locals, params }) => {
		const auth = requireAuth(locals);
		requireSuperAdmin(auth);

		const formData = await request.formData();
		const content = formData.get('content') as string;
		const status = formData.get('status') as any; // Optional status update
		const isInternal = formData.get('isInternal') === 'true';

		if (!content || !content.trim()) {
			return fail(400, { error: 'Message cannot be empty' });
		}

		try {
			await replyToTicket(params.id, auth.userId, content, {
				status,
				isInternal
			});
			return { success: true };
		} catch (error) {
			console.error('Failed to reply to ticket:', error);
			return fail(500, { error: 'Failed to send reply' });
		}
	},

	updateStatus: async ({ request, locals, params }) => {
		const auth = requireAuth(locals);
		requireSuperAdmin(auth);

		const formData = await request.formData();
		const status = formData.get('status') as any;

		if (!status) return fail(400, { error: 'Status required' });

		try {
			await replyToTicket(params.id, auth.userId, `Status updated to ${status}`, {
				status,
				isInternal: true
			});
			return { success: true };
		} catch (error) {
			return fail(500, { error: 'Failed to update status' });
		}
	},

	updatePriority: async ({ request, locals, params }) => {
		const auth = requireAuth(locals);
		requireSuperAdmin(auth);

		const formData = await request.formData();
		const priority = formData.get('priority') as any;

		try {
			await updateTicketPriority(params.id, priority);
			return { success: true };
		} catch (error) {
			return fail(500, { error: 'Failed to update priority' });
		}
	},

	assign: async ({ request, locals, params }) => {
		const auth = requireAuth(locals);
		requireSuperAdmin(auth);

		const formData = await request.formData();
		const assigneeId = formData.get('assigneeId') as string;

		const finalAssigneeId = assigneeId === 'unassigned' ? null : assigneeId;

		try {
			await assignTicket(params.id, finalAssigneeId);
			return { success: true };
		} catch (error) {
			return fail(500, { error: 'Failed to assign ticket' });
		}
	}
};
