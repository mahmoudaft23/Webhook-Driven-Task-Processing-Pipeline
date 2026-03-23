import { Request, Response } from "express";
import { createPipelineSchema,updatePipelineSchema } from "../../shared/validation/pipeline";
import {
  createPipeline,
  getPipelineBySourcePath,
  listPipelines,
  getPipelineById,
  deletePipelineById,
  updatePipelineById
} from "../../shared/repositories/pipelineRepository";
import { uuidParamSchema,sourcePathQuerySchema } from "../../shared/validation/common";

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
async function getPipelineByIdHandler(req: Request, res: Response) {
try {
    const paramsParsed = uuidParamSchema.safeParse(req.params);

    if (!paramsParsed.success) {
      return res.status(400).json({
        error: "Invalid pipeline id",
        details: paramsParsed.error.flatten()
      });
    }

    const { id } = paramsParsed.data;

    const pipeline = await getPipelineById(id);

    if (!pipeline) {
      return res.status(404).json({
        error: "Pipeline not found"
      });
    }

    return res.status(200).json(pipeline);
  } catch (error) {
    console.error("Failed to get pipeline:", error);
    return res.status(500).json({
      error: "Internal server error"
    });
}
}


async function updatePipelineByIdHandler(req: Request, res: Response) {
  try {
    const paramsParsed = uuidParamSchema.safeParse(req.params);

    if (!paramsParsed.success) {
      return res.status(400).json({
        error: "Invalid pipeline id",
        details: paramsParsed.error.flatten()
      });
    }

    const bodyParsed = updatePipelineSchema.safeParse(req.body);

    if (!bodyParsed.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: bodyParsed.error.flatten()
      });
    }

    const { id } = paramsParsed.data;

    const existing = await getPipelineById(id);

    if (!existing) {
      return res.status(404).json({
        error: "Pipeline not found"
      });
    }

    const updated = await updatePipelineById(id, bodyParsed.data);

    if (!updated) {
      return res.status(500).json({
        error: "Failed to update pipeline"
      });
    }

    return res.status(200).json(updated);
  } catch (error) {
    console.error("Failed to update pipeline:", error);
    return res.status(500).json({
      error: "Internal server error"
    });
  }
}

async function deletePipelineByIdHandler(req: Request, res: Response) {
  try {
    const paramsParsed = uuidParamSchema.safeParse(req.params);

    if (!paramsParsed.success) {
      return res.status(400).json({
        error: "Invalid pipeline id",
        details: paramsParsed.error.flatten()
      });
    }

    const { id } = paramsParsed.data;

    const existing = await getPipelineById(id);

    if (!existing) {
      return res.status(404).json({
        error: "Pipeline not found"
      });
    }

    const deleted = await deletePipelineById(id);

    return res.status(200).json({
      message: "Pipeline deleted successfully",
      pipeline: deleted
    });
  } catch (error) {
    console.error("Failed to delete pipeline:", error);
    return res.status(500).json({
      error: "Internal server error"
    });
  }
}
async function getPipelineBySourcePathHandler(req: Request, res: Response) {
  try {
    const queryParsed = sourcePathQuerySchema.safeParse(req.query);

    if (!queryParsed.success) {
      return res.status(400).json({
        error: "Invalid sourcePath",
        details: queryParsed.error.flatten()
      });
    }

    const { sourcePath } = queryParsed.data;

    const pipeline = await getPipelineBySourcePath(sourcePath);

    if (!pipeline) {
      return res.status(404).json({
        error: "Pipeline not found"
      });
    }

    return res.status(200).json(pipeline);
  } catch (error) {
    console.error("Failed to get pipeline by source path:", error);
    return res.status(500).json({
      error: "Internal server error"
    });
  }
}
export {
  createPipelineHandler,
  listPipelinesHandler,
  getPipelineByIdHandler,
  updatePipelineByIdHandler,
  getPipelineBySourcePathHandler,
  deletePipelineByIdHandler
};