import {
  getNextDeliverableJob,
  markJobAsDelivered,
  markJobAsDelivering,
  markJobDeliveryFailed,
  markJobDeliveryPendingRetry
} from "../repositories/DeliverableJob";
import { listSubscriptionsByPipelineId } from "../repositories/subscriptionRepository";
import { createDeliveryAttempt } from "../repositories/deliveryAttemptRepository";

const RETRY_DELAYS_MS = [
  60* 1000,
  80  * 1000,
  120  * 1000,
  160  * 1000
];

const MAX_DELIVERY_ATTEMPTS = 5;

function getNextRetryDate(attemptNumber: number): Date | null {
  const delay = RETRY_DELAYS_MS[attemptNumber - 1];

  if (!delay) {
    return null;
  }

  return new Date(Date.now() + delay);
}

export async function deliverNextJob() {
  const nextJob = await getNextDeliverableJob();

  if (!nextJob) {
    return null;
  }

  const deliveringJob = await markJobAsDelivering(nextJob.id);

  if (!deliveringJob) {
    throw new Error(`Failed to mark job ${nextJob.id} as delivering`);
  }

  const subscriptions = await listSubscriptionsByPipelineId(
    deliveringJob.pipelineId
  );

  if (subscriptions.length === 0) {
    const updated = await markJobAsDelivered(deliveringJob.id);

    if (!updated) {
      throw new Error(`Failed to mark job ${deliveringJob.id} as delivered`);
    }

    return updated;
  }

  const currentAttemptNumber = deliveringJob.deliveryAttemptsCount + 1;

  try {
    for (const subscription of subscriptions) {
  try {
    const response = await fetch(subscription.targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        jobId: deliveringJob.id,
        pipelineId: deliveringJob.pipelineId,
        data: deliveringJob.outputData
      })
    });

    const responseBody = await response.text();

    if (!response.ok) {
      await createDeliveryAttempt({
        jobId: deliveringJob.id,
        subscriptionId: subscription.id,
        attemptNumber: currentAttemptNumber,
        httpStatus: response.status,
        responseBody,
        failureMessage: `Delivery failed with status ${response.status}`
      });

      throw new Error(`Delivery failed with status ${response.status}`);
    }

    await createDeliveryAttempt({
      jobId: deliveringJob.id,
      subscriptionId: subscription.id,
      attemptNumber: currentAttemptNumber,
      httpStatus: response.status,
      responseBody
    });
  } catch (error) {
    const failureMessage =
      error instanceof Error ? error.message : "Unknown delivery error";

    const isHttpFailure =
      error instanceof Error &&
      error.message.startsWith("Delivery failed with status");

    if (!isHttpFailure) {
      await createDeliveryAttempt({
        jobId: deliveringJob.id,
        subscriptionId: subscription.id,
        attemptNumber: currentAttemptNumber,
        failureMessage
      });
    }

    throw error;
  }
}

    const updated = await markJobAsDelivered(deliveringJob.id);

    if (!updated) {
      throw new Error(`Failed to mark job ${deliveringJob.id} as delivered`);
    }

    return updated;
  } catch (error) {
    const failureReason =
      error instanceof Error ? error.message : "Unknown delivery error";

    if (currentAttemptNumber >= MAX_DELIVERY_ATTEMPTS) {
      const failedJob = await markJobDeliveryFailed(
        deliveringJob.id,
        currentAttemptNumber,
        failureReason
      );

      if (!failedJob) {
        throw new Error(`Failed to mark job ${deliveringJob.id} as failed`);
      }

      return failedJob;
    }

    const nextAttemptAt = getNextRetryDate(currentAttemptNumber);

    if (!nextAttemptAt) {
      const failedJob = await markJobDeliveryFailed(
        deliveringJob.id,
        currentAttemptNumber,
        failureReason
      );

      if (!failedJob) {
        throw new Error(`Failed to mark job ${deliveringJob.id} as failed`);
      }

      return failedJob;
    }

    const retryJob = await markJobDeliveryPendingRetry(
      deliveringJob.id,
      currentAttemptNumber,
      nextAttemptAt
    );

    if (!retryJob) {
      throw new Error(
        `Failed to schedule retry for job ${deliveringJob.id}`
      );
    }

    return retryJob;
  }
}