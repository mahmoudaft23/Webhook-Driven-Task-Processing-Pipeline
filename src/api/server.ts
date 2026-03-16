import dotenv from "dotenv";
import { testDbConnection } from "../shared/db";
import { app } from "./app";

dotenv.config();

const PORT = Number(process.env.API_PORT) || 3000;

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