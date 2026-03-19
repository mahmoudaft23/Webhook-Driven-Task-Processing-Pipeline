import { pool, testDbConnection } from "../../shared/db";

export async function setupTestDb() {
  await testDbConnection();
}

export async function cleanupTestDb() {
  await pool.query(`
    TRUNCATE TABLE
      delivery_attempts,
      jobs,
      subscriptions,
      pipelines
    RESTART IDENTITY CASCADE
  `);
}