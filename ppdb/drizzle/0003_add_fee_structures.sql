CREATE TYPE "public"."payment_timing" AS ENUM('registration', 'acceptance', 'enrollment', 'custom');--> statement-breakpoint
CREATE TYPE "public"."fee_status" AS ENUM('active', 'inactive');--> statement-breakpoint
CREATE TABLE "fee_structures" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"admission_path_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"amount" integer NOT NULL,
	"currency" text DEFAULT 'IDR' NOT NULL,
	"payment_timing" "payment_timing" DEFAULT 'registration' NOT NULL,
	"due_date_offset_days" integer DEFAULT 0 NOT NULL,
	"penalty_amount" integer,
	"penalty_grace_days" integer,
	"status" "fee_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint
ALTER TABLE "fee_structures" ADD CONSTRAINT "fee_structures_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint

-- Enable Row Level Security on fee_structures table
ALTER TABLE fee_structures ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for fee_structures
-- Only allow access to fees belonging to the current tenant
CREATE POLICY fee_structures_tenant_isolation ON fee_structures
  USING (tenant_id = current_setting('app.current_tenant_id', TRUE)::uuid);

-- Allow INSERT for tenant's own data
CREATE POLICY fee_structures_insert_policy ON fee_structures
  FOR INSERT
  WITH CHECK (tenant_id = current_setting('app.current_tenant_id', TRUE)::uuid);

-- Allow UPDATE for tenant's own data
CREATE POLICY fee_structures_update_policy ON fee_structures
  FOR UPDATE
  USING (tenant_id = current_setting('app.current_tenant_id', TRUE)::uuid)
  WITH CHECK (tenant_id = current_setting('app.current_tenant_id', TRUE)::uuid);

-- Allow DELETE for tenant's own data
CREATE POLICY fee_structures_delete_policy ON fee_structures
  FOR DELETE
  USING (tenant_id = current_setting('app.current_tenant_id', TRUE)::uuid);
