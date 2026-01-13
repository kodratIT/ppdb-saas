import { json, error } from '@sveltejs/kit';
import type { RequestEvent } from './$types';
import { requireAuth, requireRole } from '$lib/server/auth/authorization';
import { RankingService } from '$lib/server/domain/ranking';
import { z } from 'zod';

const finalizeSchema = z.object({
	quotaAccepted: z.number().int().nonnegative(),
	quotaReserved: z.number().int().nonnegative()
});

export async function POST({ request, locals, params }: RequestEvent) {
	const auth = requireAuth(locals);
	requireRole(auth, 'school_admin', 'super_admin');

	const pathId = params.pathId;
	if (!pathId) {
		throw error(400, 'Path ID required');
	}

	const body = await request.json();
	const validation = finalizeSchema.safeParse(body);

	if (!validation.success) {
		throw error(400, validation.error.message);
	}

	try {
		const result = await RankingService.finalizeRanking(
			pathId,
			{
				accepted: validation.data.quotaAccepted,
				reserved: validation.data.quotaReserved
			},
			auth.userId
		);
		return json({ success: true, result });
	} catch (e: any) {
		if (e.message === 'Admission path not found') {
			throw error(404, e.message);
		}
		console.error('Finalize ranking error:', e);
		throw error(500, 'Failed to finalize ranking');
	}
}
