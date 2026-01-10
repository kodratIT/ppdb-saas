import { describe, it, expect, beforeAll } from 'vitest';
import { db } from '$lib/server/db';
import { sql } from 'drizzle-orm';
import { admissionPaths } from '$lib/server/db/schema';
import { seedTenants } from '../fixtures/tenants';
import { seedUsers } from '../fixtures/users';

const TENANT_A = '00000000-0000-0000-0000-000000000001';
const TENANT_B = '00000000-0000-0000-0000-000000000002';

describe('RLS tenant isolation', () => {
  beforeAll(async () => {
    // Create non-superuser role for testing RLS
    await db.execute(sql`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'app_user') THEN
          CREATE ROLE app_user;
        END IF;
      END
      $$;
    `);
    await db.execute(sql`GRANT USAGE ON SCHEMA public TO app_user`);
    await db.execute(sql`GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO app_user`);

    // Force RLS even for table owner (superuser) - though we will use app_user
    await db.execute(sql`ALTER TABLE admission_paths FORCE ROW LEVEL SECURITY`);

    // Clean up admission paths to ensure clean state
    await db.delete(admissionPaths);
    
    await seedTenants();
    await seedUsers();
    
    // Insert admission paths for Tenant A
    await db.insert(admissionPaths).values({
       name: 'Path A',
       tenantId: TENANT_A,
       quota: 100,
       status: 'open'
    });

    // Insert admission paths for Tenant B
    await db.insert(admissionPaths).values({
       name: 'Path B',
       tenantId: TENANT_B,
       quota: 50,
       status: 'open'
    });
  });

  it('only returns rows for current tenant', async () => {
    // Switch to Tenant A
    await db.transaction(async (tx) => {
      await tx.execute(sql`SET ROLE app_user`);
      await tx.execute(sql`select set_config('app.current_tenant_id', ${TENANT_A}, true)`);
      
      const rowsA = await tx.select().from(admissionPaths);
      expect(rowsA).toHaveLength(1);
      expect(rowsA[0].name).toBe('Path A');
    });

    // Switch to Tenant B
    await db.transaction(async (tx) => {
      await tx.execute(sql`SET ROLE app_user`);
      await tx.execute(sql`select set_config('app.current_tenant_id', ${TENANT_B}, true)`);
      const rowsB = await tx.select().from(admissionPaths);
      expect(rowsB).toHaveLength(1);
      expect(rowsB[0].name).toBe('Path B');
    });
  });
});
