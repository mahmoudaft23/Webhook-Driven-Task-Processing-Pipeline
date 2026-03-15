CREATE TYPE "public"."delivery_status" AS ENUM('pending', 'delivering', 'delivered', 'failed');--> statement-breakpoint
CREATE TYPE "public"."run_status" AS ENUM('queued', 'processing', 'success', 'failed');--> statement-breakpoint
CREATE TABLE "delivery_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" uuid NOT NULL,
	"subscription_id" uuid NOT NULL,
	"attempt_number" integer NOT NULL,
	"http_status" integer,
	"response_body" text,
	"failure_message" text,
	"attempted_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pipeline_id" uuid NOT NULL,
	"input_data" jsonb NOT NULL,
	"output_data" jsonb,
	"run_status" "run_status" NOT NULL,
	"delivery_status" "delivery_status" NOT NULL,
	"failure_reason" text,
	"delivery_attempts_count" integer DEFAULT 0 NOT NULL,
	"next_attempt_at" timestamp with time zone,
	"started_at" timestamp with time zone,
	"finished_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pipelines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"source_path" text NOT NULL,
	"processor_type" text NOT NULL,
	"processor_config" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "pipelines_source_path_unique" UNIQUE("source_path")
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pipeline_id" uuid NOT NULL,
	"target_url" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "delivery_attempts" ADD CONSTRAINT "delivery_attempts_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "delivery_attempts" ADD CONSTRAINT "delivery_attempts_subscription_id_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_pipeline_id_pipelines_id_fk" FOREIGN KEY ("pipeline_id") REFERENCES "public"."pipelines"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_pipeline_id_pipelines_id_fk" FOREIGN KEY ("pipeline_id") REFERENCES "public"."pipelines"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_delivery_attempts_job_id" ON "delivery_attempts" USING btree ("job_id");--> statement-breakpoint
CREATE INDEX "idx_delivery_attempts_subscription_id" ON "delivery_attempts" USING btree ("subscription_id");--> statement-breakpoint
CREATE INDEX "idx_jobs_pipeline_id" ON "jobs" USING btree ("pipeline_id");--> statement-breakpoint
CREATE INDEX "idx_jobs_run_status" ON "jobs" USING btree ("run_status");--> statement-breakpoint
CREATE INDEX "idx_jobs_delivery_status" ON "jobs" USING btree ("delivery_status");--> statement-breakpoint
CREATE INDEX "idx_jobs_next_attempt_at" ON "jobs" USING btree ("next_attempt_at");--> statement-breakpoint
CREATE INDEX "idx_subscriptions_pipeline_id" ON "subscriptions" USING btree ("pipeline_id");