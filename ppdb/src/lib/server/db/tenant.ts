import { db } from '.';
import { sql } from 'drizzle-orm';
import { z } from 'zod';

export async function withTenant<T>(tenantId: string, callback: (tx: typeof db) => Promise<T>): Promise<T> {
	z.string().uuid().parse(tenantId);
	return db.transaction(async (tx) => {
		await tx.execute(sql`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`);
		return callback(tx as typeof db);
	});
}
