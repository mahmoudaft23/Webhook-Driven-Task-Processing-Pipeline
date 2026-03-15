import dotenv from "dotenv";
import { testDbConnection } from "../shared/db";

dotenv.config();

const WORKER_POLL_INTERVAL_MS =
  Number(process.env.WORKER_POLL_INTERVAL_MS) || 5000;

async function startWorker() {
  try {
    await testDbConnection();

    console.log("Worker started");

    setInterval(() => {
      console.log("Worker polling for jobs...");
    }, WORKER_POLL_INTERVAL_MS);
  } catch (error) {
    console.error("Failed to start worker:", error);
    process.exit(1);
  }
}

startWorker();