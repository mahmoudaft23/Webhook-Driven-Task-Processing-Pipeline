import express from "express";
import { healthRoutes } from "./routes/healthRoutes";
import { pipelineRoutes } from "./routes/pipelineRoutes";
import { subscriptionRoutes } from "./routes/subscriptionRoutes";
import { webhookRoutes } from "./routes/webhookRoutes";
import { jobRoutes } from "./routes/jobRoutes";
import { deliveryAttemptRoutes } from "./routes/DeliveryAttempts";

export const app = express();

app.use(express.json());

app.use(healthRoutes);
app.use(pipelineRoutes);
app.use(subscriptionRoutes);
app.use(webhookRoutes);
app.use(jobRoutes);
app.use(deliveryAttemptRoutes);