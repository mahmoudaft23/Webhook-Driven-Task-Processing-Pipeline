import { Router } from "express";
import {
  deleteJobHandler,
  getJobHandler,
  listJobsByPipelineHandler
} from "../controllers/jobController";

export const jobRoutes = Router();

jobRoutes.get("/api/v1/jobs/:id", getJobHandler);
jobRoutes.get("/api/v1/pipelines/:pipelineId/jobs", listJobsByPipelineHandler);
jobRoutes.delete("/api/v1/jobs/:id", deleteJobHandler);