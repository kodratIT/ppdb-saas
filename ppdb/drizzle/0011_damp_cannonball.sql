CREATE TYPE "public"."broadcast_status" AS ENUM('pending', 'scheduled', 'sent', 'failed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."payout_status" AS ENUM('pending', 'processed', 'completed', 'failed', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."tenant_type" AS ENUM('single', 'foundation');--> statement-breakpoint
CREATE TABLE "message_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"category" text,
	"message" text NOT NULL,
	"variables" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payouts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"amount" integer NOT NULL,
	"status" "payout_status" DEFAULT 'pending' NOT NULL,
	"bank_name" text NOT NULL,
	"account_number" text NOT NULL,
	"account_name" text NOT NULL,
	"reference" text,
	"requested_by" uuid NOT NULL,
	"processed_by" uuid,
	"processed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "broadcasts" ALTER COLUMN "tenant_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "broadcasts" ALTER COLUMN "sent_count" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "broadcasts" ALTER COLUMN "failed_count" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "broadcasts" ADD COLUMN "target_type" text NOT NULL;--> statement-breakpoint
ALTER TABLE "broadcasts" ADD COLUMN "target_tenant_ids" jsonb;--> statement-breakpoint
ALTER TABLE "broadcasts" ADD COLUMN "message" text NOT NULL;--> statement-breakpoint
ALTER TABLE "broadcasts" ADD COLUMN "template_id" uuid;--> statement-breakpoint
ALTER TABLE "broadcasts" ADD COLUMN "status" "broadcast_status" DEFAULT 'sent' NOT NULL;--> statement-breakpoint
ALTER TABLE "broadcasts" ADD COLUMN "total_target" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "broadcasts" ADD COLUMN "scheduled_at" timestamp;--> statement-breakpoint
ALTER TABLE "broadcasts" ADD COLUMN "sent_at" timestamp;--> statement-breakpoint
ALTER TABLE "broadcasts" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN "type" "tenant_type" DEFAULT 'single' NOT NULL;--> statement-breakpoint
ALTER TABLE "payouts" ADD CONSTRAINT "payouts_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payouts" ADD CONSTRAINT "payouts_requested_by_users_id_fk" FOREIGN KEY ("requested_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payouts" ADD CONSTRAINT "payouts_processed_by_users_id_fk" FOREIGN KEY ("processed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "broadcasts" ADD CONSTRAINT "broadcasts_template_id_message_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."message_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "broadcasts" DROP COLUMN "target_segment";--> statement-breakpoint
ALTER TABLE "broadcasts" DROP COLUMN "message_template";