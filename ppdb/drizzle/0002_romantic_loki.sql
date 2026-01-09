CREATE TYPE "public"."admission_path_status" AS ENUM('draft', 'open', 'closed', 'archived');--> statement-breakpoint
CREATE TABLE "admission_paths" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"quota" integer NOT NULL,
	"filled_slots" integer DEFAULT 0 NOT NULL,
	"status" "admission_path_status" DEFAULT 'draft' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "admission_paths" ADD CONSTRAINT "admission_paths_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;

-- Enable RLS on admission_paths table
ALTER TABLE "admission_paths" ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Tenant Isolation for admission_paths
-- Users can only see/modify admission paths for their own tenant
CREATE POLICY "tenant_isolation_admission_paths" ON "admission_paths"
  USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);

-- Add check constraint: filled_slots cannot exceed quota
ALTER TABLE "admission_paths" ADD CONSTRAINT "admission_paths_filled_slots_check" 
  CHECK (filled_slots >= 0 AND filled_slots <= quota);