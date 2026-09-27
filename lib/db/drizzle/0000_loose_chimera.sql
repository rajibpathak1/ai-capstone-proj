CREATE TABLE "cases" (
	"id" serial PRIMARY KEY NOT NULL,
	"filename" text NOT NULL,
	"file_type" text NOT NULL,
	"status" text NOT NULL,
	"source_text" text NOT NULL,
	"source_preview" text NOT NULL,
	"structured_data" jsonb NOT NULL,
	"customer_email" text NOT NULL,
	"case_summary" text NOT NULL,
	"processing_ms" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
