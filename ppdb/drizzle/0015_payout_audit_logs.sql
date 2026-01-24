-- Create enum for payout audit log actions
CREATE TYPE "public"."payout_audit_action" AS ENUM('approved', 'rejected', 'processed', 'failed', 'updated');--> statement-breakpoint

-- Create payout_audit_logs table
CREATE TABLE "payout_audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"payout_id" uuid NOT NULL,
	"action" "payout_audit_action" NOT NULL,
	"previous_status" "payout_status",
	"new_status" "payout_status",
	"actor_id" uuid NOT NULL,
	"actor_name" text NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint

-- Add foreign key constraints
ALTER TABLE "payout_audit_logs" ADD CONSTRAINT "payout_audit_logs_payout_id_payouts_id_fk" FOREIGN KEY ("payout_id") REFERENCES "public"."payouts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payout_audit_logs" ADD CONSTRAINT "payout_audit_logs_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint

-- Create indexes for performance
CREATE INDEX "payout_audit_logs_payout_id_idx" ON "payout_audit_logs" USING btree ("payout_id");--> statement-breakpoint
CREATE INDEX "payout_audit_logs_actor_id_idx" ON "payout_audit_logs" USING btree ("actor_id");--> statement-breakpoint
CREATE INDEX "payout_audit_logs_action_idx" ON "payout_audit_logs" USING btree ("action");--> statement-breakpoint
CREATE INDEX "payout_audit_logs_created_at_idx" ON "payout_audit_logs" USING btree ("created_at");--> statement-breakpoint

-- Add comment for documentation
COMMENT ON TABLE "payout_audit_logs" IS 'Audit trail for all payout status changes and actions';--> statement-breakpoint
COMMENT ON COLUMN "payout_audit_logs"."metadata" IS 'Additional context in JSON format (e.g., rejection details, processing notes)';
