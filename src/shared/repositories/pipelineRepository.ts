import { eq } from "drizzle-orm";
import { db } from "../db";
import { pipelines } from "../db/schema";
import type { CreatePipelineInput ,UpdatePipelineInput} from "../validation/pipeline";

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


 async function updatePipelineById(
  id: string,
  data: UpdatePipelineInput
) {
  const updateData: Partial<{
    name: string;
    processorConfig: Record<string, unknown>;
    updatedAt: Date;
  }> = {
    updatedAt: new Date()
  };

  if (data.name !== undefined) {
    updateData.name = data.name;
  }

  if (data.processorConfig !== undefined) {
    updateData.processorConfig = data.processorConfig;
  }

  const [pipeline] = await db
    .update(pipelines)
    .set(updateData)
    .where(eq(pipelines.id, id))
    .returning();

  return pipeline ?? null;
}

 async function deletePipelineById(id: string) {
  const [deleted] = await db
    .delete(pipelines)
    .where(eq(pipelines.id, id))
    .returning();

  return deleted ?? null;
}
export {
  createPipeline,
  getPipelineById,
  getPipelineBySourcePath,
  listPipelines,
  updatePipelineById,
  deletePipelineById
};