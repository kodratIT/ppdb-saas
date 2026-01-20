CREATE TYPE "public"."proof_status" AS ENUM('PENDING', 'ACCEPTED', 'REJECTED');--> statement-breakpoint
CREATE TYPE "public"."saas_billing_cycle" AS ENUM('monthly', 'yearly');--> statement-breakpoint
CREATE TYPE "public"."saas_invoice_status" AS ENUM('pending', 'paid', 'void');--> statement-breakpoint
CREATE TYPE "public"."saas_subscription_status" AS ENUM('trial', 'active', 'past_due', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."school_level" AS ENUM('TK', 'SD', 'SMP', 'SMA', 'SMK', 'Universitas', 'Lainnya');--> statement-breakpoint
ALTER TYPE "public"."application_status" ADD VALUE 'withdrawn';--> statement-breakpoint
ALTER TYPE "public"."invoice_status" ADD VALUE 'VERIFYING';--> statement-breakpoint
ALTER TYPE "public"."invoice_status" ADD VALUE 'REJECTED';--> statement-breakpoint
CREATE TABLE "broadcasts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"sender_id" uuid NOT NULL,
	"target_segment" text NOT NULL,
	"message_template" text NOT NULL,
	"sent_count" integer NOT NULL,
	"failed_count" integer NOT NULL,
	"failed_recipients" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payment_proofs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"invoice_id" uuid NOT NULL,
	"file_url" text NOT NULL,
	"notes" text,
	"uploaded_at" timestamp DEFAULT now() NOT NULL,
	"reviewed_by" uuid,
	"reviewed_at" timestamp,
	"rejection_reason" text,
	"status" "proof_status" DEFAULT 'PENDING' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "saas_invoices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subscription_id" uuid,
	"tenant_id" uuid NOT NULL,
	"amount" integer NOT NULL,
	"status" "saas_invoice_status" DEFAULT 'pending' NOT NULL,
	"due_date" timestamp NOT NULL,
	"paid_at" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "saas_packages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"price_monthly" integer NOT NULL,
	"price_yearly" integer NOT NULL,
	"limits" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"features" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "saas_packages_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "saas_subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"package_id" uuid NOT NULL,
	"status" "saas_subscription_status" DEFAULT 'trial' NOT NULL,
	"billing_cycle" "saas_billing_cycle" DEFAULT 'monthly' NOT NULL,
	"current_period_start" timestamp NOT NULL,
	"current_period_end" timestamp NOT NULL,
	"auto_renew" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "saas_subscriptions_tenant_id_unique" UNIQUE("tenant_id")
);
--> statement-breakpoint
CREATE TABLE "units" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"name" text NOT NULL,
	"level" "school_level" NOT NULL,
	"npsn" text,
	"accreditation" text,
	"contact_email" text,
	"contact_phone" text,
	"address" text,
	"province" text,
	"city" text,
	"district" text,
	"postal_code" text,
	"config" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "selection_result_details" DROP CONSTRAINT "selection_result_details_application_id_applications_id_fk";
--> statement-breakpoint
ALTER TABLE "applications" ALTER COLUMN "completed_steps" SET DEFAULT '[]';--> statement-breakpoint
ALTER TABLE "applications" ALTER COLUMN "completed_steps" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "payment_transactions" ALTER COLUMN "status" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "payment_transactions" ALTER COLUMN "paid_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "payment_transactions" ALTER COLUMN "paid_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "selection_results" ALTER COLUMN "finalized_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "selection_results" ALTER COLUMN "finalized_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "selection_results" ALTER COLUMN "quota_accepted" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "selection_results" ALTER COLUMN "quota_reserved" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "selection_results" ALTER COLUMN "total_candidates" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "sessions" ALTER COLUMN "auth_type" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "admission_paths" ADD COLUMN "unit_id" uuid;--> statement-breakpoint
ALTER TABLE "application_documents" ADD COLUMN "custom_field_id" uuid;--> statement-breakpoint
ALTER TABLE "application_documents" ADD COLUMN "file_url" text NOT NULL;--> statement-breakpoint
ALTER TABLE "application_documents" ADD COLUMN "original_name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "application_documents" ADD COLUMN "size" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "application_documents" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "applications" ADD COLUMN "unit_id" uuid;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "unit_id" uuid;--> statement-breakpoint
ALTER TABLE "payment_transactions" ADD COLUMN "tenant_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "payment_transactions" ADD COLUMN "external_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "payment_transactions" ADD COLUMN "raw_response" text;--> statement-breakpoint
ALTER TABLE "school_profiles" ADD COLUMN "npsn" text;--> statement-breakpoint
ALTER TABLE "school_profiles" ADD COLUMN "school_level" text;--> statement-breakpoint
ALTER TABLE "school_profiles" ADD COLUMN "accreditation" text;--> statement-breakpoint
ALTER TABLE "school_profiles" ADD COLUMN "website" text;--> statement-breakpoint
ALTER TABLE "school_profiles" ADD COLUMN "province" text;--> statement-breakpoint
ALTER TABLE "school_profiles" ADD COLUMN "city" text;--> statement-breakpoint
ALTER TABLE "school_profiles" ADD COLUMN "district" text;--> statement-breakpoint
ALTER TABLE "school_profiles" ADD COLUMN "postal_code" text;--> statement-breakpoint
ALTER TABLE "school_profiles" ADD COLUMN "bank_name" text;--> statement-breakpoint
ALTER TABLE "school_profiles" ADD COLUMN "bank_account_name" text;--> statement-breakpoint
ALTER TABLE "school_profiles" ADD COLUMN "bank_account_number" text;--> statement-breakpoint
ALTER TABLE "school_profiles" ADD COLUMN "landing_page_config" jsonb;--> statement-breakpoint
ALTER TABLE "selection_result_details" ADD COLUMN "total_score" numeric NOT NULL;--> statement-breakpoint
ALTER TABLE "selection_results" ADD COLUMN "batch_id" text DEFAULT 'BATCH-1' NOT NULL;--> statement-breakpoint
ALTER TABLE "selection_results" ADD COLUMN "published_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "firebase_uid" text;--> statement-breakpoint
ALTER TABLE "broadcasts" ADD CONSTRAINT "broadcasts_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "broadcasts" ADD CONSTRAINT "broadcasts_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_proofs" ADD CONSTRAINT "payment_proofs_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_proofs" ADD CONSTRAINT "payment_proofs_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_proofs" ADD CONSTRAINT "payment_proofs_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saas_invoices" ADD CONSTRAINT "saas_invoices_subscription_id_saas_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."saas_subscriptions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saas_invoices" ADD CONSTRAINT "saas_invoices_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saas_subscriptions" ADD CONSTRAINT "saas_subscriptions_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saas_subscriptions" ADD CONSTRAINT "saas_subscriptions_package_id_saas_packages_id_fk" FOREIGN KEY ("package_id") REFERENCES "public"."saas_packages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "units" ADD CONSTRAINT "units_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admission_paths" ADD CONSTRAINT "admission_paths_unit_id_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."units"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_unit_id_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."units"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_unit_id_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."units"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "selection_result_details" ADD CONSTRAINT "selection_result_details_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "users_firebase_uid_unique" ON "users" USING btree ("firebase_uid");--> statement-breakpoint
ALTER TABLE "application_documents" DROP COLUMN "file_name";--> statement-breakpoint
ALTER TABLE "application_documents" DROP COLUMN "file_size";--> statement-breakpoint
ALTER TABLE "application_documents" DROP COLUMN "thumbnail_url";--> statement-breakpoint
ALTER TABLE "application_documents" DROP COLUMN "uploaded_at";--> statement-breakpoint
ALTER TABLE "applications" DROP COLUMN "documents";--> statement-breakpoint
ALTER TABLE "payment_transactions" DROP COLUMN "external_reference";--> statement-breakpoint
ALTER TABLE "selection_results" DROP COLUMN "cutoff_score_accepted";--> statement-breakpoint
ALTER TABLE "selection_results" DROP COLUMN "cutoff_score_reserved";--> statement-breakpoint
ALTER TABLE "selection_results" DROP COLUMN "updated_at";--> statement-breakpoint
ALTER TABLE "tenants" DROP COLUMN "xendit_secret_key";