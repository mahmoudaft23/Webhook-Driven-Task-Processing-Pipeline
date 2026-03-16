import { Router } from "express";
import {
  createSubscriptionHandler,
  listSubscriptionsHandler,
  deleteSubscriptionHandler
} from "../controllers/subscriptionController";

export const subscriptionRoutes = Router();

subscriptionRoutes.post(
  "/api/v1/pipelines/:pipelineId/subscriptions",
  createSubscriptionHandler
);

subscriptionRoutes.get(
  "/api/v1/pipelines/:pipelineId/subscriptions",
  listSubscriptionsHandler
);

subscriptionRoutes.delete(
  "/api/v1/subscriptions/:id",
  deleteSubscriptionHandler
);