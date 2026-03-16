import { Request, Response } from "express";
import { createPipelineSchema } from "../../shared/validation/pipeline";
import {
  createPipeline,
  getPipelineBySourcePath,
  listPipelines
} from "../../shared/repositories/pipelineRepository";

 async function createPipelineHandler(req: Request, res: Response) {
  try {
    const parsed = createPipelineSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: parsed.error.flatten()
      });
    }

    const existing = await getPipelineBySourcePath(parsed.data.sourcePath);

    if (existing) {
      return res.status(409).json({
        error: "Pipeline with this sourcePath already exists"
      });
    }

    const pipeline = await createPipeline(parsed.data);

    return res.status(201).json(pipeline);
  } catch (error) {
    console.error("Failed to create pipeline:", error);
    return res.status(500).json({
      error: "Internal server error"
    });
  }
}

 async function listPipelinesHandler(_req: Request, res: Response) {
  try {
    const items = await listPipelines();
    return res.status(200).json(items);
  } catch (error) {
    console.error("Failed to list pipelines:", error);
    return res.status(500).json({
      error: "Internal server error"
    });
  }
}

export {
  createPipelineHandler,
  listPipelinesHandler,
};