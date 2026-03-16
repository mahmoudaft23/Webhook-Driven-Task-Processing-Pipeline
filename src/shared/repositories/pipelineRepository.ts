import { eq } from "drizzle-orm";
import { db } from "../db";
import { pipelines } from "../db/schema";
import type { CreatePipelineInput } from "../validation/pipeline";

async function createPipeline(data: CreatePipelineInput) {
  const [pipeline] = await db
    .insert(pipelines)
    .values({
      name: data.name,
      sourcePath: data.sourcePath,
      processorType: data.processorType,
      processorConfig: data.processorConfig,
    })
    .returning();

  return pipeline;
}

async function getPipelineById(id: string) {
  const [pipeline] = await db
    .select()
    .from(pipelines)
    .where(eq(pipelines.id, id));

  return pipeline ?? null;
}

async function getPipelineBySourcePath(sourcePath: string) {
  const [pipeline] = await db
    .select()
    .from(pipelines)
    .where(eq(pipelines.sourcePath, sourcePath));

  return pipeline ?? null;
}

async function listPipelines() {
  return db.select().from(pipelines);
}

export {
  createPipeline,
  getPipelineById,
  getPipelineBySourcePath,
  listPipelines,
};