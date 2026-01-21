import { db } from '$lib/server/db';
import { auditLogs } from '$lib/server/db/schema';
import { getSystemConfigs } from '$lib/server/domain/system-config';
import { lt } from 'drizzle-orm';

/**
 * Prune audit logs older than the configured retention period
 * @returns Number of deleted logs
 */
export async function pruneAuditLogs(): Promise<number> {
	// 1. Get retention config
	const configs = await getSystemConfigs();
	const retentionDays = configs.audit_retention_days;

	// Safety check: Don't delete if retention is 0 or negative (means "keep forever")
	if (retentionDays <= 0) {
		console.log('Audit Log Pruning skipped: Retention days is 0 (Keep Forever)');
		return 0;
	}

	// 2. Calculate cutoff date
	const cutoffDate = new Date();
	cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

	console.log(`Pruning audit logs older than ${retentionDays} days (Cutoff: ${cutoffDate.toISOString()})`);

	// 3. Delete old logs
	const result = await db
		.delete(auditLogs)
		.where(lt(auditLogs.createdAt, cutoffDate))
		.returning({ id: auditLogs.id });

	console.log(`Pruned ${result.length} old audit logs.`);
	
	return result.length;
}
