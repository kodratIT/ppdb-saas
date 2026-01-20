import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { requireAuth, requireSuperAdmin } from '$lib/server/auth/authorization';
import { getTicketById, replyToTicket } from '$lib/server/domain/tickets';

export const load: PageServerLoad = async ({ locals, params }) => {
	const auth = requireAuth(locals);
	requireSuperAdmin(auth);

	const ticket = await getTicketById(params.id);

	if (!ticket) {
		throw new Error('Ticket not found');
	}

	return {
		ticket
	};
};

export const actions: Actions = {
	reply: async ({ request, locals, params }) => {
		const auth = requireAuth(locals);
		requireSuperAdmin(auth);

		const formData = await request.formData();
		const content = formData.get('content') as string;
		const status = formData.get('status') as any;

		if (!content || !content.trim()) {
			return fail(400, { error: 'Message cannot be empty' });
		}

		try {
			await replyToTicket(params.id, auth.userId, content, status);
			return { success: true };
		} catch (error) {
			console.error('Failed to reply to ticket:', error);
			return fail(500, { error: 'Failed to send reply' });
		}
	}
};
