import { and, asc, eq } from "drizzle-orm";
import { db } from "../db";
import { jobs } from "../db/schema";

export async function getNextDeliverableJob() {
  const [job] = await db
    .select()
    .from(jobs)
    .where(
      and(
        eq(jobs.runStatus, "success"),
        eq(jobs.deliveryStatus, "pending")
      )
    )
    .orderBy(asc(jobs.createdAt))
    .limit(1);

  return job ?? null;
}

export async function markJobAsDelivering(id: string) {
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

export async function markJobAsDelivered(id: string) {
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

export async function markJobDeliveryFailed(id: string, failureReason: string) {
  const [job] = await db
    .update(jobs)
    .set({
      deliveryStatus: "failed",
      failureReason,
      updatedAt: new Date()
    })
    .where(eq(jobs.id, id))
    .returning();

  return job ?? null;
}