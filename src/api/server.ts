import dotenv from "dotenv";
import express from "express";
import { testDbConnection } from "../shared/db";
import { createPipelineSchema } from "../shared/validation/pipeline";
import {
  createPipeline,
  getPipelineBySourcePath,
  listPipelines
} from "../shared/repositories/pipelineRepository";
import { createSubscriptionSchema } from "../shared/validation/subscription";
import {
  createSubscription,
  listSubscriptionsByPipelineId,
  getSubscriptionById,
  deleteSubscriptionById
} from "../shared/repositories/subscriptionRepository";
import { getPipelineById } from "../shared/repositories/pipelineRepository";
dotenv.config();

const app = express();
const PORT = Number(process.env.API_PORT) || 3000;

app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({
    service: "api",
    status: "ok"
  });
});

app.post("/api/v1/pipelines", async (req, res) => {
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
});

app.get("/api/v1/pipelines", async (_req, res) => {
  try {
    const items = await listPipelines();
    return res.status(200).json(items);
  } catch (error) {
    console.error("Failed to list pipelines:", error);
    return res.status(500).json({
      error: "Internal server error"
    });
  }
});
app.post("/api/v1/pipelines/:pipelineId/subscriptions", async (req, res) => {
  try {
    const { pipelineId } = req.params;

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
});

app.get("/api/v1/pipelines/:pipelineId/subscriptions", async (req, res) => {
  try {
    const { pipelineId } = req.params;

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
});

app.delete("/api/v1/subscriptions/:id", async (req, res) => {
  try {
    const { id } = req.params;

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
});
async function startServer() {
  try {
    await testDbConnection();

    app.listen(PORT, () => {
      console.log(`API server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start API server:", error);
    process.exit(1);
  }
}

startServer();