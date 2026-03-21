import e, { Request, Response } from "express";
import { uuidParamSchema } from "../../shared/validation/common";
import { listDeliveryAttemptsByJobId, listDeliveryAttemptsByPipelineId } from "../../shared/repositories/deliveryAttemptRepository";
import { getJobById } from "../../shared/repositories/jobRepository";
import { getPipelineById } from "../../shared/repositories/pipelineRepository";
import { pipelineIdParamSchema } from "../../shared/validation/common";


async function getDeliveryAttempts(req: Request, res: Response) {
 try {
    const paramsParsed = uuidParamSchema.safeParse(req.params);
    if (!paramsParsed.success) {
      return res.status(400).json({
        error: "Invalid job id",
        details: paramsParsed.error.flatten()
      });
    }

    const { id } = paramsParsed.data;

    const job = await getJobById(id);
    if (!job) {
      return res.status(404).json({
        error: "Job not found"
      });
    }

    const attempts = await listDeliveryAttemptsByJobId(id);

    return res.status(200).json(attempts);
  } catch (error) {
    console.error("Failed to list delivery attempts:", error);
    return res.status(500).json({
      error: "Internal server error"
    });
  }
}

async function listDeliveryAttempts(req: Request, res: Response) {
  try {
    const paramsParsed = pipelineIdParamSchema.safeParse(req.params);
    if (!paramsParsed.success) {
      return res.status(400).json({
        error: "Invalid pipelineId",
        details: paramsParsed.error.flatten()
      });
    }

    const { pipelineId } = paramsParsed.data;

    const pipeline = await getPipelineById(pipelineId);
    if (!pipeline) {
      return res.status(404).json({
        error: "Pipeline not found"
      });
    }

    const attempts = await listDeliveryAttemptsByPipelineId(pipelineId);
 const groupedMap = new Map<
      string,
      {
        jobId: string;
        attempts: typeof attempts;
      }
    >();

    for (const attempt of attempts) {
      const existingGroup = groupedMap.get(attempt.jobId);

      if (existingGroup) {
        existingGroup.attempts.push(attempt);
      } else {
        groupedMap.set(attempt.jobId, {
          jobId: attempt.jobId,
          attempts: [attempt]
        });
      }
    }
const jobs = Array.from(groupedMap.values()).map((group) => ({
  jobId: group.jobId,
  attemptsCount: group.attempts.length,
  lastAttemptAt: group.attempts[group.attempts.length - 1]?.attemptedAt ?? null,
  attempts: group.attempts
}));
    return res.status(200).json({
      pipelineId,
      totalJobs: jobs.length,
      jobs
    });
  } catch (error) {
    console.error("Failed to list pipeline delivery attempts:", error);
    return res.status(500).json({
      error: "Internal server error"
    });
  }
}

export {
  getDeliveryAttempts,
  listDeliveryAttempts
}