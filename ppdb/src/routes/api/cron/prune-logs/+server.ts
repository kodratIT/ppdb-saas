import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { pruneAuditLogs } from '$lib/server/services/audit-pruner';
import { env } from '$env/dynamic/private';

// GET /api/cron/prune-logs
// Protected by CRON_SECRET header to prevent unauthorized triggers
export const GET: RequestHandler = async ({ request }) => {
	const authHeader = request.headers.get('authorization');
	const cronSecret = env.CRON_SECRET;

	// 1. Verify Authorization (Simple Bearer Token or Custom Header)
	// If CRON_SECRET is not set in env, we default to deny all for security
	if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const deletedCount = await pruneAuditLogs();
		return json({ 
			success: true, 
			message: `Pruning completed. Deleted ${deletedCount} logs.`,
			deleted_count: deletedCount 
		});
	} catch (error) {
		console.error('Audit Log Pruning Failed:', error);
		return json({ error: 'Internal Server Error' }, { status: 500 });
	}
};
