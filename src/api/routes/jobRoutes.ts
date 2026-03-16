import { Router } from "express";
import {
  getJobHandler,
  listJobsByPipelineHandler
} from "../controllers/jobController";

export const jobRoutes = Router();

jobRoutes.get("/api/v1/jobs/:id", getJobHandler);
jobRoutes.get("/api/v1/pipelines/:pipelineId/jobs", listJobsByPipelineHandler);