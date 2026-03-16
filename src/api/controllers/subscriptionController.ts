import { Request, Response } from "express";
import {
  uuidParamSchema,
  pipelineIdParamSchema
} from "../../shared/validation/common";
import { createSubscriptionSchema } from "../../shared/validation/subscription";
import {
  createSubscription,
  listSubscriptionsByPipelineId,
  getSubscriptionById,
  deleteSubscriptionById
} from "../../shared/repositories/subscriptionRepository";
import { getPipelineById } from "../../shared/repositories/pipelineRepository";

 async function createSubscriptionHandler(req: Request, res: Response) {
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

    const parsed = createSubscriptionSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: parsed.error.flatten()
      });
    }

    const subscription = await createSubscription(pipelineId, parsed.data);

    return res.status(201).json(subscription);
  } catch (error) {
    console.error("Failed to create subscription:", error);
    return res.status(500).json({
      error: "Internal server error"
    });
  }
}

 async function listSubscriptionsHandler(req: Request, res: Response) {
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

    const items = await listSubscriptionsByPipelineId(pipelineId);
    return res.status(200).json(items);
  } catch (error) {
    console.error("Failed to list subscriptions:", error);
    return res.status(500).json({
      error: "Internal server error"
    });
  }
}

 async function deleteSubscriptionHandler(req: Request, res: Response) {
  try {
    const paramsParsed = uuidParamSchema.safeParse(req.params);
    if (!paramsParsed.success) {
      return res.status(400).json({
        error: "Invalid subscription id",
        details: paramsParsed.error.flatten()
      });
    }

    const { id } = paramsParsed.data;

    const existing = await getSubscriptionById(id);
    if (!existing) {
      return res.status(404).json({
        error: "Subscription not found"
      });
    }

    const deleted = await deleteSubscriptionById(id);

    return res.status(200).json({
      message: "Subscription deleted successfully",
      subscription: deleted
    });
  } catch (error) {
    console.error("Failed to delete subscription:", error);
    return res.status(500).json({
      error: "Internal server error"
    });
  }
}

export {
  createSubscriptionHandler,
  listSubscriptionsHandler,
  deleteSubscriptionHandler
};