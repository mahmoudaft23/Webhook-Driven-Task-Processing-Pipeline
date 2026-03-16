import { Router } from "express";
import {
  createPipelineHandler,
  listPipelinesHandler
} from "../controllers/pipelineController";

export const pipelineRoutes = Router();

pipelineRoutes.post("/api/v1/pipelines", createPipelineHandler);
pipelineRoutes.get("/api/v1/pipelines", listPipelinesHandler);