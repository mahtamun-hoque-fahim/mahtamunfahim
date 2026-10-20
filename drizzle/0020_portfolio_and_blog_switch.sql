CREATE TABLE "portfolio_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"client" text DEFAULT '' NOT NULL,
	"summary" text DEFAULT '' NOT NULL,
	"body" text DEFAULT '' NOT NULL,
	"website_url" text,
	"cover_url" text,
	"images" text[] DEFAULT '{}'::text[] NOT NULL,
	"size" text DEFAULT 'normal' NOT NULL,
	"published" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "portfolio_items_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "blog_enabled" boolean DEFAULT false NOT NULL;--> statement-breakpoint
CREATE INDEX "portfolio_items_sort_idx" ON "portfolio_items" USING btree ("sort_order");