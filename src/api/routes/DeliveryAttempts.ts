import { Router } from "express";

export const deliveryAttemptRoutes = Router();

import {
  markJobAsDelivered,
  markJobDeliveryFailed,
  markJobDeliveryPendingRetry
} from "../../shared/repositories/DeliverableJob";
import { getDeliveryAttempts, listDeliveryAttempts } from "../controllers/DeliveryAttemptsController";

deliveryAttemptRoutes.get("/api/v1/jobs/:id/deliveries",getDeliveryAttempts);
deliveryAttemptRoutes.get("/api/v1/pipelines/:pipelineId/deliveries",listDeliveryAttempts);