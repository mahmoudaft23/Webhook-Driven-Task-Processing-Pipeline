import { Router } from "express";
import { app } from "../app";

export const healthRoutes = Router();

healthRoutes.get("/health", (_req, res) => {
  res.status(200).json({
    service: "api",
    status: "ok"
  });
});
healthRoutes.post("/test-receiver", async (req, res) => {
  console.log("Test receiver got payload:", req.body);

  return res.status(200).json({
    received: true
  });
});