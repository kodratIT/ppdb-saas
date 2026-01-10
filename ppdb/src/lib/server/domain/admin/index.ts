import { db } from '$lib/server/db';
import { tenants, auditLogs } from '$lib/server/db/schema';

export async function createTenant(data: { name: string; slug: string }, actorId: string) {
	const reserved = ['www', 'app', 'api', 'admin', 'super-admin'];
	if (reserved.includes(data.slug)) {
		throw new Error('Reserved slug');
	}

	const [newTenant] = await db
		.insert(tenants)
		.values({
			name: data.name,
			slug: data.slug,
			status: 'active'
		})
		.returning();

	// Create Audit Log
	await db
		.insert(auditLogs)
		.values({
			actorId,
			action: 'create_tenant',
			target: `tenant:${data.slug}`,
			details: JSON.stringify({ name: data.name, id: newTenant.id })
		})
		.returning();

	return newTenant;
}

export async function listTenants() {
	return await db.select().from(tenants);
}
