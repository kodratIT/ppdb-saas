import { db } from '$lib/server/db';
import { tenants } from '$lib/server/db/schema';

export async function seedTenants() {
  await db.insert(tenants).values([
    { id: '00000000-0000-0000-0000-000000000001', name: 'Tenant A', slug: 'tenant-a' },
    { id: '00000000-0000-0000-0000-000000000002', name: 'Tenant B', slug: 'tenant-b' }
  ]).onConflictDoNothing();
}
