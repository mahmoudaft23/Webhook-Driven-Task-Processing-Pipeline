import {
  getNextDeliverableJob,
  markJobAsDelivered,
  markJobAsDelivering,
  markJobDeliveryFailed
} from "../repositories/DeliverableJob";
import { listSubscriptionsByPipelineId } from "../repositories/subscriptionRepository";

export async function deliverNextJob() {
  const nextJob = await getNextDeliverableJob();

  if (!nextJob) {
    return null;
  }

  const deliveringJob = await markJobAsDelivering(nextJob.id);

  if (!deliveringJob) {
    throw new Error(`Failed to mark job ${nextJob.id} as delivering`);
  }

  const subscriptions = await listSubscriptionsByPipelineId(deliveringJob.pipelineId);

  if (subscriptions.length === 0) {
    const updated = await markJobAsDelivered(deliveringJob.id);

    if (!updated) {
      throw new Error(`Failed to mark job ${deliveringJob.id} as delivered`);
    }

    return updated;
  }

  try {
    for (const subscription of subscriptions) {
      const response = await fetch(subscription.targetUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          jobId: deliveringJob.id,
          pipelineId: deliveringJob.pipelineId,
          created_at: deliveringJob.createdAt,
          input_data: deliveringJob.inputData,
          data: deliveringJob.outputData
        })
      });

      if (!response.ok) {
        throw new Error(`Delivery failed with status ${response.status}`);
      }
    }
    console.log(`Successfully delivered job ${deliveringJob.id} to all subscriptions`);
    const updated = await markJobAsDelivered(deliveringJob.id);

    if (!updated) {
      throw new Error(`Failed to mark job ${deliveringJob.id} as delivered`);
    }

    return updated;



    
  } catch (error) {
    const failureReason =
      error instanceof Error ? error.message : "Unknown delivery error";

    const updated = await markJobDeliveryFailed(
      deliveringJob.id,
      failureReason
    );

    if (!updated) {
      throw new Error(`Failed to mark job ${deliveringJob.id} as failed`);
    }

    return updated;
  }
}