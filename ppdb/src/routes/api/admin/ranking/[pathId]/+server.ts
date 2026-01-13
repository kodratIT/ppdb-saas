import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { getDraftRanking } from '$lib/server/ranking/ranking-service';

export const GET: RequestHandler = async ({ params }) => {
	const { pathId } = params as { pathId: string };

	if (!pathId) {
		return json({ error: 'Path ID is required' }, { status: 400 });
	}

	try {
		const candidates = await getDraftRanking(pathId);

		if (candidates.length === 0) {
			return json({ error: 'Admission path not found or no candidates' }, { status: 404 });
		}

		return json({
			admissionPathId: pathId,
			candidates
		});
	} catch (error) {
		console.error('Error fetching draft ranking:', error);
		return json({ error: 'Failed to fetch ranking' }, { status: 500 });
	}
};
