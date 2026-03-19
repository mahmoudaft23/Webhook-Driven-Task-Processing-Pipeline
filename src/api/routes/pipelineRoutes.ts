import { Router } from "express";
import {
  createPipelineHandler,
  listPipelinesHandler,
  getPipelineByIdHandler,
  updatePipelineByIdHandler,
  deletePipelineByIdHandler
} from "../controllers/pipelineController";

export const pipelineRoutes = Router();

pipelineRoutes.post("/api/v1/pipelines", createPipelineHandler);
pipelineRoutes.get("/api/v1/pipelines", listPipelinesHandler);
pipelineRoutes.get("/api/v1/pipelines/:id", getPipelineByIdHandler);
pipelineRoutes.patch("/api/v1/pipelines/:id", updatePipelineByIdHandler);
pipelineRoutes.delete("/api/v1/pipelines/:id", deletePipelineByIdHandler);
