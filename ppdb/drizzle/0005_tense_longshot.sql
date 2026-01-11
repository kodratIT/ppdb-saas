CREATE TYPE "public"."application_status" AS ENUM('draft', 'submitted', 'under_review', 'verified', 'accepted', 'rejected', 'waitlisted');--> statement-breakpoint
CREATE TABLE "applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"admission_path_id" uuid NOT NULL,
	"status" "application_status" DEFAULT 'draft' NOT NULL,
	"child_full_name" text,
	"child_nickname" text,
	"child_dob" timestamp,
	"child_gender" text,
	"parent_full_name" text,
	"parent_phone" text,
	"parent_email" text,
	"address" text,
	"city" text,
	"province" text,
	"postal_code" text,
	"documents" text,
	"current_step" integer DEFAULT 1 NOT NULL,
	"completed_steps" text,
	"submitted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_admission_path_id_admission_paths_id_fk" FOREIGN KEY ("admission_path_id") REFERENCES "public"."admission_paths"("id") ON DELETE no action ON UPDATE no action;