import { Request, Response } from "express";
import {
  uuidParamSchema,
  pipelineIdParamSchema
} from "../../shared/validation/common";
import { getPipelineById } from "../../shared/repositories/pipelineRepository";
import {
  getJobById,
  listJobsByPipelineId
} from "../../shared/repositories/jobRepository";

 async function getJobHandler(req: Request, res: Response) {
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

    return res.status(200).json(job);
  } catch (error) {
    console.error("Failed to get job:", error);
    return res.status(500).json({
      error: "Internal server error"
    });
  }
}

 async function listJobsByPipelineHandler(req: Request, res: Response) {
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

    const items = await listJobsByPipelineId(pipelineId);
    return res.status(200).json(items);
  } catch (error) {
    console.error("Failed to list jobs:", error);
    return res.status(500).json({
      error: "Internal server error"
    });
  }
}

export {
    getJobHandler,
    listJobsByPipelineHandler
}