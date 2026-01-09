import { describe, it, expect } from 'vitest';
import { db } from '../../src/lib/server/db';
import { tenants, users } from '../../src/lib/server/db/schema';
import { withTenant } from '../../src/lib/server/db/tenant';
import { eq } from 'drizzle-orm';

describe.skip('RLS Security Verification', () => {
	it('should enforce tenant isolation', async () => {
		const [tenantA] = await db.insert(tenants).values({
			name: 'Tenant A',
			slug: 'tenant-a'
		}).returning();

		const [tenantB] = await db.insert(tenants).values({
			name: 'Tenant B',
			slug: 'tenant-b'
		}).returning();

		const [userA] = await db.insert(users).values({
			email: 'user.a@example.com',
			tenantId: tenantA.id
		}).returning();

		const [userB] = await db.insert(users).values({
			email: 'user.b@example.com',
			tenantId: tenantB.id
		}).returning();

		await withTenant(tenantA.id, async (tx) => {
			const results = await tx.select().from(users);
			expect(results).toHaveLength(1);
			expect(results[0].id).toBe(userA.id);
		});

		await withTenant(tenantB.id, async (tx) => {
			const results = await tx.select().from(users);
			expect(results).toHaveLength(1);
			expect(results[0].id).toBe(userB.id);
		});
	});

	it('should allow same email in different tenants', async () => {
		const [tenantA] = await db.insert(tenants).values({
			name: 'Tenant A2',
			slug: 'tenant-a2'
		}).returning();

		const [tenantB] = await db.insert(tenants).values({
			name: 'Tenant B2',
			slug: 'tenant-b2'
		}).returning();

		await db.insert(users).values({
			email: 'common@example.com',
			tenantId: tenantA.id
		});

		await expect(
			db.insert(users).values({
				email: 'common@example.com',
				tenantId: tenantB.id
			})
		).resolves.not.toThrow();
	});

	it('should prevent same email in same tenant', async () => {
		const [tenantC] = await db.insert(tenants).values({
			name: 'Tenant C2',
			slug: 'tenant-c2'
		}).returning();

		await db.insert(users).values({
			email: 'unique@example.com',
			tenantId: tenantC.id
		});

		await expect(
			db.insert(users).values({
				email: 'unique@example.com',
				tenantId: tenantC.id
			})
		).rejects.toThrow();
	});
});
