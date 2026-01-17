import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';

export async function seedUsers() {
	await db
		.insert(users)
		.values([
			{
				id: '10000000-0000-0000-0000-000000000001',
				tenantId: '00000000-0000-0000-0000-000000000001',
				email: 'admin-a@ppdb.test',
				role: 'school_admin'
			},
			{
				id: '10000000-0000-0000-0000-000000000002',
				tenantId: '00000000-0000-0000-0000-000000000002',
				email: 'admin-b@ppdb.test',
				role: 'school_admin'
			}
		])
		.onConflictDoNothing();
}
