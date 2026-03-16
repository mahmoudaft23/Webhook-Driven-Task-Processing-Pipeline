import { db } from "../db";
import { jobs } from "../db/schema";
import { asc ,eq} from "drizzle-orm";
 async function createJob(pipelineId: string, inputData: unknown) {
  const [job] = await db
    .insert(jobs)
    .values({
      pipelineId,
      inputData,
      runStatus: "queued",
      deliveryStatus: "pending"
    })
    .returning();
if (!job) {
    throw new Error("Failed to create job");
  }
  return job;
}

 async function getJobById(id: string) {
  const [job] = await db
    .select()
    .from(jobs)
    .where((eq(jobs.id, id)));

  return job ?? null;
}

 async function listJobsByPipelineId(pipelineId: string) {
  return db
    .select()
    .from(jobs)
    .where((eq(jobs.pipelineId, pipelineId)));
}

export {
    createJob,  
    getJobById,
    listJobsByPipelineId
};