import { json, error } from '@sveltejs/kit';
import type { RequestEvent } from './$types';
import { requireAuth, requireRole } from '$lib/server/auth/authorization';
import { RankingService } from '$lib/server/domain/ranking';

export async function GET({ locals, params }: RequestEvent) {
	const auth = requireAuth(locals);
	requireRole(auth, 'school_admin', 'super_admin');

	const pathId = params.pathId;
	if (!pathId) {
		throw error(400, 'Path ID required');
	}

	try {
		const ranking = await RankingService.getDraftRanking(pathId);
		return json(ranking);
	} catch (e: any) {
		if (e.message === 'Admission path not found') {
			throw error(404, e.message);
		}
		console.error('Ranking error:', e);
		throw error(500, 'Failed to fetch ranking');
	}
}
