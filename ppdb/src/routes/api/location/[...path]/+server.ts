import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const WILAYAH_ID_BASE = 'https://wilayah.id/api';

export const GET: RequestHandler = async ({ params, fetch }) => {
	const path = params.path;

	try {
		const response = await fetch(`${WILAYAH_ID_BASE}/${path}`);

		if (!response.ok) {
			return json({ error: 'Failed to fetch from wilayah.id' }, { status: response.status });
		}

		const data = await response.json();
		return json(data);
	} catch (error) {
		console.error('Proxy error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
