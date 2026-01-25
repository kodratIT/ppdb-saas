-- Create audit log enums
CREATE TYPE "audit_action" AS ENUM('LOGIN', 'LOGOUT', 'CREATE', 'READ', 'UPDATE', 'DELETE', 'EXPORT', 'BULK_OPERATION', 'SCHEDULED_JOB', 'SYSTEM_EVENT', 'API_CALL', 'FAILED_ATTEMPT');
CREATE TYPE "audit_entity_type" AS ENUM('USER', 'TENANT', 'APPLICATION', 'INVOICE', 'SETTING', 'PERMISSION', 'INTEGRATION', 'JOB');
CREATE TYPE "audit_severity" AS ENUM('info', 'warning', 'error', 'critical');
CREATE TYPE "audit_status" AS ENUM('success', 'failed', 'pending');

-- Drop old audit_logs table
DROP TABLE IF EXISTS "audit_logs";

-- Create new audit_logs table with enhanced schema
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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "idx_audit_logs_tenant" ON "audit_logs" ("tenant_id");
CREATE INDEX IF NOT EXISTS "idx_audit_logs_user" ON "audit_logs" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_audit_logs_action" ON "audit_logs" ("action");
CREATE INDEX IF NOT EXISTS "idx_audit_logs_created" ON "audit_logs" ("created_at");
CREATE INDEX IF NOT EXISTS "idx_audit_logs_indexed" ON "audit_logs" ("indexed_at");
CREATE INDEX IF NOT EXISTS "idx_audit_logs_tenant_created" ON "audit_logs" ("tenant_id", "created_at");
CREATE INDEX IF NOT EXISTS "idx_audit_logs_user_created" ON "audit_logs" ("user_id", "created_at");