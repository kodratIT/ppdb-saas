CREATE TYPE "public"."saas_coupon_type" AS ENUM('percentage', 'fixed_amount');--> statement-breakpoint
CREATE TABLE "saas_coupons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"type" "saas_coupon_type" DEFAULT 'percentage' NOT NULL,
	"value" integer NOT NULL,
	"max_redemptions" integer,
	"redemptions_count" integer DEFAULT 0,
	"expires_at" timestamp,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "saas_coupons_code_unique" UNIQUE("code")
);
