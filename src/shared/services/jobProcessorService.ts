import { getPipelineById } from "../repositories/pipelineRepository";
import {
  getNextQueuedJob,
  markJobAsFailed,
  markJobAsProcessing,
  markJobAsSuccess
} from "../repositories/jobRepository";
import { runProcessor } from "../processors/processor";

export async function processNextJob() {
  const nextJob = await getNextQueuedJob();

  if (!nextJob) {
    return null;
  }

  const processingJob = await markJobAsProcessing(nextJob.id);

  if (!processingJob) {
    throw new Error(`Failed to mark job ${nextJob.id} as processing`);
  }

  try {
    const pipeline = await getPipelineById(processingJob.pipelineId);

    if (!pipeline) {
      throw new Error(`Pipeline ${processingJob.pipelineId} not found`);
    }

    const outputData = runProcessor(pipeline.processorType, {
      inputData: processingJob.inputData,
      config: (pipeline.processorConfig ?? {}) as Record<string, unknown>,
      context: {
        pipelineId: pipeline.id,
        jobId: processingJob.id
      }
    });

    const updatedJob = await markJobAsSuccess(processingJob.id, outputData);

    if (!updatedJob) {
      throw new Error(`Failed to mark job ${processingJob.id} as success`);
    }

    return updatedJob;
  } catch (error) {
    const failureReason =
      error instanceof Error ? error.message : "Unknown processing error";

    await markJobAsFailed(processingJob.id, failureReason);

    throw error;
  }
}