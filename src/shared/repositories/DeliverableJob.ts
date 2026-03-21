import { and, asc, eq } from "drizzle-orm";
import { db } from "../db";
import { jobs } from "../db/schema";

 async function getNextDeliverableJob() {
  const candidates = await db
    .select()
    .from(jobs)
    .where(
      and(
        eq(jobs.runStatus, "success"),
        eq(jobs.deliveryStatus, "pending")
      )
    )
    .orderBy(asc(jobs.createdAt))
    .limit(20);

  const now = new Date();

  const freshJob = candidates.find((job) => !job.nextAttemptAt);
  if (freshJob) {
    return freshJob;
  }

  const retryJob =
    candidates.find((job) => job.nextAttemptAt && job.nextAttemptAt <= now) ?? null;

  return retryJob;
}

 async function markJobAsDelivering(id: string) {
  const [job] = await db
    .update(jobs)
    .set({
      deliveryStatus: "delivering",
      updatedAt: new Date()
    })
    .where(eq(jobs.id, id))
    .returning();

  return job ?? null;
}
async function markJobDeliveryPendingRetry(
  id: string,
  deliveryAttemptsCount: number,
  nextAttemptAt: Date
) {
  const [job] = await db
    .update(jobs)
    .set({
      deliveryStatus: "pending",
      deliveryAttemptsCount,
      nextAttemptAt,
      updatedAt: new Date()
    })
    .where(eq(jobs.id, id))
    .returning();

  return job ?? null;
}


 async function markJobAsDelivered(id: string) {
  const [job] = await db
    .update(jobs)
    .set({
      deliveryStatus: "delivered",
      updatedAt: new Date()
    })
    .where(eq(jobs.id, id))
    .returning();

  return job ?? null;
}

 async function markJobDeliveryFailed(
  id: string,
  deliveryAttemptsCount: number,
  failureReason: string
) {
  const [job] = await db
    .update(jobs)
    .set({
      deliveryStatus: "failed",
      deliveryAttemptsCount,
      failureReason,
      updatedAt: new Date()
    })
    .where(eq(jobs.id, id))
    .returning();

  return job ?? null;
}

export{
getNextDeliverableJob,
markJobAsDelivering,
markJobAsDelivered,
markJobDeliveryFailed,
markJobDeliveryPendingRetry
}