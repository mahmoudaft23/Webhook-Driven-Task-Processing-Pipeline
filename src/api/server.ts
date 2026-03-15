import dotenv from "dotenv";
import express from "express";
import { testDbConnection } from "../shared/db";

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