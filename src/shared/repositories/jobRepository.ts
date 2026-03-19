import { db } from "../db";
import { jobs } from "../db/schema";
import { and, asc, eq, lte } from "drizzle-orm";
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

 async function getNextQueuedJob() {
  const [job] = await db
    .select()
    .from(jobs)
    .where(
      and(
        eq(jobs.runStatus, "queued"),
        lte(jobs.createdAt, new Date())
      )
    )
    .orderBy(asc(jobs.createdAt))
    .limit(1);

  return job ?? null;
}

 async function markJobAsProcessing(id: string) {
  const [job] = await db
    .update(jobs)
    .set({
      runStatus: "processing",
      startedAt: new Date(),
      updatedAt: new Date()
    })
    .where(eq(jobs.id, id))
    .returning();

  return job ?? null;
}

 async function markJobAsSuccess(id: string, outputData: unknown) {
  const [job] = await db
    .update(jobs)
    .set({
      runStatus: "success",
      outputData,
      finishedAt: new Date(),
      updatedAt: new Date()
    })
    .where(eq(jobs.id, id))
    .returning();

  return job ?? null;
}

 async function markJobAsFailed(id: string, failureReason: string) {
  const [job] = await db
    .update(jobs)
    .set({
      runStatus: "failed",
      failureReason,
      finishedAt: new Date(),
      updatedAt: new Date()
    })
    .where(eq(jobs.id, id))
    .returning();

  return job ?? null;
  }

   async function deleteJobById(id: string) {
  const [deleted] = await db
    .delete(jobs)
    .where(eq(jobs.id, id))
    .returning();

  return deleted ?? null;
}
export {
    createJob,  
    getJobById,
    listJobsByPipelineId,
    getNextQueuedJob,
    markJobAsProcessing,
    markJobAsSuccess,
    markJobAsFailed,
    deleteJobById
};