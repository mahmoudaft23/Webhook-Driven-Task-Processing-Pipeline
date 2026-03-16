import { Router } from "express";
import { ingestWebhookHandler } from "../controllers/webhookController";

export const webhookRoutes = Router();

webhookRoutes.post("/webhooks/:pipelineId", ingestWebhookHandler);