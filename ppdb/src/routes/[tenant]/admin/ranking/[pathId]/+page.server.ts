/* eslint-disable @typescript-eslint/no-explicit-any */
import { requireAuth, requireRole } from '$lib/server/auth/authorization';
import { RankingService } from '$lib/server/domain/ranking';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	const auth = requireAuth(locals);
	requireRole(auth, 'school_admin', 'super_admin');

	const pathId = params.pathId;
	if (!pathId) {
		throw error(400, 'Path ID required');
	}

	try {
		const ranking = await RankingService.getDraftRanking(pathId);
		return {
			ranking
		};
	} catch (e: any) {
		if (e.message === 'Admission path not found') {
			throw error(404, e.message);
		}
		console.error('Ranking load error:', e);
		throw error(500, 'Failed to load ranking');
	}
};
