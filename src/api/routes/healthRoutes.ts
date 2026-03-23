import { Router } from "express";
import { app } from "../app";

export const healthRoutes = Router();

healthRoutes.get("/health", (_req, res) => {
  res.status(200).json({
    service: "api",
    status: "ok"
  });
});
