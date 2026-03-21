import { eq } from "drizzle-orm";
import { db } from "../db";
import { deliveryAttempts,jobs } from "../db/schema";

type CreateDeliveryAttemptInput = {
  jobId: string;
  subscriptionId: string;
  attemptNumber: number;
  httpStatus?: number;
  responseBody?: string;
  failureMessage?: string;
};

export async function createDeliveryAttempt(data: CreateDeliveryAttemptInput) {
  const [attempt] = await db
    .insert(deliveryAttempts)
    .values({
      jobId: data.jobId,
      subscriptionId: data.subscriptionId,
      attemptNumber: data.attemptNumber,
      httpStatus: data.httpStatus,
      responseBody: data.responseBody,
      failureMessage: data.failureMessage
    })
    .returning();

  if (!attempt) {
    throw new Error("Failed to create delivery attempt");
  }

  return attempt;
}

export async function listDeliveryAttemptsByJobId(jobId: string) {
  return db
    .select()
    .from(deliveryAttempts)
    .where(eq(deliveryAttempts.jobId, jobId));
}

export async function listDeliveryAttemptsByPipelineId(pipelineId: string) {
  return db
    .select({
      id: deliveryAttempts.id,
      jobId: deliveryAttempts.jobId,
      subscriptionId: deliveryAttempts.subscriptionId,
      attemptNumber: deliveryAttempts.attemptNumber,
      httpStatus: deliveryAttempts.httpStatus,
      responseBody: deliveryAttempts.responseBody,
      failureMessage: deliveryAttempts.failureMessage,
      attemptedAt: deliveryAttempts.attemptedAt
    })
    .from(deliveryAttempts)
    .innerJoin(jobs, eq(deliveryAttempts.jobId, jobs.id))
    .where(eq(jobs.pipelineId, pipelineId));
}