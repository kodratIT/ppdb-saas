CREATE TYPE "public"."announcement_content_type" AS ENUM('html', 'markdown');--> statement-breakpoint
CREATE TYPE "public"."announcement_priority" AS ENUM('low', 'normal', 'high', 'urgent');--> statement-breakpoint
CREATE TYPE "public"."announcement_status" AS ENUM('draft', 'scheduled', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."announcement_target_type" AS ENUM('all', 'active', 'inactive', 'custom');--> statement-breakpoint
CREATE TABLE "announcement_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"category" text,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"content_type" "announcement_content_type" DEFAULT 'html' NOT NULL,
	"priority" "announcement_priority" DEFAULT 'normal' NOT NULL,
	"usage_count" integer DEFAULT 0 NOT NULL,
	"created_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "announcement_views" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"announcement_id" uuid NOT NULL,
	"tenant_id" uuid NOT NULL,
	"viewed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "announcements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"content_type" "announcement_content_type" DEFAULT 'html' NOT NULL,
	"status" "announcement_status" DEFAULT 'draft' NOT NULL,
	"target_type" "announcement_target_type" DEFAULT 'all' NOT NULL,
	"target_tenant_ids" jsonb DEFAULT '[]'::jsonb,
	"published_at" timestamp,
	"scheduled_at" timestamp,
	"expires_at" timestamp,
	"view_count" integer DEFAULT 0 NOT NULL,
	"click_count" integer DEFAULT 0 NOT NULL,
	"priority" "announcement_priority" DEFAULT 'normal' NOT NULL,
	"category" text,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"created_by" uuid,
	"updated_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "announcement_templates" ADD CONSTRAINT "announcement_templates_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "announcement_views" ADD CONSTRAINT "announcement_views_announcement_id_announcements_id_fk" FOREIGN KEY ("announcement_id") REFERENCES "public"."announcements"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "announcement_views" ADD CONSTRAINT "announcement_views_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "announcement_views_announcement_idx" ON "announcement_views" USING btree ("announcement_id");--> statement-breakpoint
CREATE INDEX "announcement_views_tenant_idx" ON "announcement_views" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "announcements_status_idx" ON "announcements" USING btree ("status");--> statement-breakpoint
CREATE INDEX "announcements_priority_idx" ON "announcements" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "announcements_created_at_idx" ON "announcements" USING btree ("created_at");