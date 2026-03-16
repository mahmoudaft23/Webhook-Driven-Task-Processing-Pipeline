import { z } from "zod";

export const uuidParamSchema = z.object({
  id: z.uuid("Invalid UUID format")
});

export const pipelineIdParamSchema = z.object({
  pipelineId: z.uuid("Invalid pipelineId format")
});