import { drizzle } from 'drizzle-orm/node-postgres';
import { sql } from 'drizzle-orm';
import pg from 'pg';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const client = new pg.Client({
    connectionString: process.env.DATABASE_URL,
});

async function main() {
    console.log('🚀 Starting manual audit logs migration...');
    
    await client.connect();
    const db = drizzle(client);

    try {
        // 1. Create Enums (Idempotent)
        console.log('📦 Creating enums...');
        await db.execute(sql`
            DO $$ BEGIN
                CREATE TYPE "audit_action" AS ENUM('LOGIN', 'LOGOUT', 'CREATE', 'READ', 'UPDATE', 'DELETE', 'EXPORT', 'BULK_OPERATION', 'SCHEDULED_JOB', 'SYSTEM_EVENT', 'API_CALL', 'FAILED_ATTEMPT');
            EXCEPTION WHEN duplicate_object THEN null; END $$;

            DO $$ BEGIN
                CREATE TYPE "audit_entity_type" AS ENUM('USER', 'TENANT', 'APPLICATION', 'INVOICE', 'SETTING', 'PERMISSION', 'INTEGRATION', 'JOB');
            EXCEPTION WHEN duplicate_object THEN null; END $$;

            DO $$ BEGIN
                CREATE TYPE "audit_severity" AS ENUM('info', 'warning', 'error', 'critical');
            EXCEPTION WHEN duplicate_object THEN null; END $$;

            DO $$ BEGIN
                CREATE TYPE "audit_status" AS ENUM('success', 'failed', 'pending');
            EXCEPTION WHEN duplicate_object THEN null; END $$;
        `);

        // 2. Recreate Table
        console.log('🗑️  Dropping old table...');
        await db.execute(sql`DROP TABLE IF EXISTS "audit_logs" CASCADE;`);

        console.log('✨ Creating new audit_logs table...');
        await db.execute(sql`
            CREATE TABLE "audit_logs" (
                "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
                "tenant_id" uuid,
                "user_id" uuid,
                "action" "audit_action" NOT NULL,
                "entity_type" "audit_entity_type" NOT NULL,
                "entity_id" uuid NOT NULL,
                "details" jsonb,
                "ip_address" text,
                "user_agent" text,
                "severity" "audit_severity" DEFAULT 'info' NOT NULL,
                "status" "audit_status" DEFAULT 'success' NOT NULL,
                "created_at" timestamp DEFAULT now() NOT NULL,
                "indexed_at" timestamp DEFAULT now() NOT NULL,
                CONSTRAINT "audit_logs_tenant_id_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE SET NULL,
                CONSTRAINT "audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL
            );
        `);

        // 3. Create Indexes
        console.log('🔍 Creating indexes...');
        await db.execute(sql`
            CREATE INDEX IF NOT EXISTS "idx_audit_logs_tenant" ON "audit_logs" ("tenant_id");
            CREATE INDEX IF NOT EXISTS "idx_audit_logs_user" ON "audit_logs" ("user_id");
            CREATE INDEX IF NOT EXISTS "idx_audit_logs_action" ON "audit_logs" ("action");
            CREATE INDEX IF NOT EXISTS "idx_audit_logs_created" ON "audit_logs" ("created_at");
            CREATE INDEX IF NOT EXISTS "idx_audit_logs_indexed" ON "audit_logs" ("indexed_at");
            CREATE INDEX IF NOT EXISTS "idx_audit_logs_tenant_created" ON "audit_logs" ("tenant_id", "created_at");
            CREATE INDEX IF NOT EXISTS "idx_audit_logs_user_created" ON "audit_logs" ("user_id", "created_at");
        `);

        console.log('✅ Migration completed successfully!');
        await client.end();
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        await client.end();
        process.exit(1);
    }
}

main();
