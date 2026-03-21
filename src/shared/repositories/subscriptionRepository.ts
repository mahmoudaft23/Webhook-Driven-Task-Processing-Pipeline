import { eq } from "drizzle-orm";
import { db } from "../db";
import { subscriptions } from "../db/schema";
import type { SubscriptionInput } from "../validation/subscription";

async function createSubscription(
  pipelineId: string,
  data: SubscriptionInput
) {
  const [subscription] = await db
    .insert(subscriptions)
    .values({
      pipelineId,
      targetUrl: data.targetUrl,
    })
    .returning();

  return subscription;
}

async function listSubscriptionsByPipelineId(pipelineId: string) {
  return db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.pipelineId, pipelineId));
}

async function getSubscriptionById(id: string) {
  const [subscription] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.id, id));

  return subscription ?? null;
}

async function deleteSubscriptionById(id: string) {
  const [deleted] = await db
    .delete(subscriptions)
    .where(eq(subscriptions.id, id))
    .returning();

  return deleted ?? null;
}
 async function updateSubscriptionById(
  id: string,
  data: SubscriptionInput
) {
  const [updated] = await db
    .update(subscriptions)
    .set({
      targetUrl: data.targetUrl
    })
    .where(eq(subscriptions.id, id))
    .returning();

  return updated ?? null;
}
export {
  createSubscription,
  listSubscriptionsByPipelineId,
  getSubscriptionById,
  deleteSubscriptionById,
  updateSubscriptionById
};