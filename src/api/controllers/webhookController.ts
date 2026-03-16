import { Request, Response } from "express";
import { pipelineIdParamSchema } from "../../shared/validation/common";
import { getPipelineById } from "../../shared/repositories/pipelineRepository";
import { createJob } from "../../shared/repositories/jobRepository";

export async function ingestWebhookHandler(req: Request, res: Response) {
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

    const job = await createJob(pipelineId, req.body);

    return res.status(202).json({
      message: "Webhook accepted for processing",
      jobId: job.id,
      status: job.runStatus,
      statusUrl: `/api/v1/jobs/${job.id}`
    });
  } catch (error) {
    console.error("Failed to ingest webhook:", error);
    return res.status(500).json({
      error: "Internal server error"
    });
  }
}

