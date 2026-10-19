CREATE TABLE "testimonials" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"role" text DEFAULT '' NOT NULL,
	"business" text DEFAULT '' NOT NULL,
	"quote" text NOT NULL,
	"website_url" text,
	"thumbnail_url" text,
	"size" text DEFAULT 'normal' NOT NULL,
	"published" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "testimonials_sort_idx" ON "testimonials" USING btree ("sort_order");