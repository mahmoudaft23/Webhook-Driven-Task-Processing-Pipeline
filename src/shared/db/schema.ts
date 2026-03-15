import {
  pgTable,
  uuid,
  text,
  jsonb,
  timestamp,
  integer,
  index,
  pgEnum
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const runStatusEnum = pgEnum("run_status", [
  "queued",
  "processing",
  "success",
  "failed"
]);

export const deliveryStatusEnum = pgEnum("delivery_status", [
  "pending",
  "delivering",
  "delivered",
  "failed"
]);

export const pipelines = pgTable("pipelines", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  sourcePath: text("source_path").notNull().unique(),
  processorType: text("processor_type").notNull(),
  processorConfig: jsonb("processor_config").notNull().default(sql`'{}'::jsonb`),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
});

export const subscriptions = pgTable(
  "subscriptions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    pipelineId: uuid("pipeline_id")
      .notNull()
      .references(() => pipelines.id, { onDelete: "cascade" }),
    targetUrl: text("target_url").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => ({
    pipelineIdIdx: index("idx_subscriptions_pipeline_id").on(table.pipelineId)
  })
);

export const jobs = pgTable(
  "jobs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    pipelineId: uuid("pipeline_id")
      .notNull()
      .references(() => pipelines.id, { onDelete: "cascade" }),
    inputData: jsonb("input_data").notNull(),
    outputData: jsonb("output_data"),
    runStatus: runStatusEnum("run_status").notNull(),
    deliveryStatus: deliveryStatusEnum("delivery_status").notNull(),
    failureReason: text("failure_reason"),
    deliveryAttemptsCount: integer("delivery_attempts_count").notNull().default(0),
    nextAttemptAt: timestamp("next_attempt_at", { withTimezone: true }),
    startedAt: timestamp("started_at", { withTimezone: true }),
    finishedAt: timestamp("finished_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => ({
    pipelineIdIdx: index("idx_jobs_pipeline_id").on(table.pipelineId),
    runStatusIdx: index("idx_jobs_run_status").on(table.runStatus),
    deliveryStatusIdx: index("idx_jobs_delivery_status").on(table.deliveryStatus),
    nextAttemptAtIdx: index("idx_jobs_next_attempt_at").on(table.nextAttemptAt)
  })
);

export const deliveryAttempts = pgTable(
  "delivery_attempts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    jobId: uuid("job_id")
      .notNull()
      .references(() => jobs.id, { onDelete: "cascade" }),
    subscriptionId: uuid("subscription_id")
      .notNull()
      .references(() => subscriptions.id, { onDelete: "cascade" }),
    attemptNumber: integer("attempt_number").notNull(),
    httpStatus: integer("http_status"),
    responseBody: text("response_body"),
    failureMessage: text("failure_message"),
    attemptedAt: timestamp("attempted_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => ({
    jobIdIdx: index("idx_delivery_attempts_job_id").on(table.jobId),
    subscriptionIdIdx: index("idx_delivery_attempts_subscription_id").on(table.subscriptionId)
  })
);