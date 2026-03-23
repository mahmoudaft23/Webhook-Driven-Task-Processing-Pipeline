import { z } from "zod";

export const uuidParamSchema = z.object({
  id: z.uuid("Invalid UUID format")
});

export const pipelineIdParamSchema = z.object({
  pipelineId: z.uuid("Invalid pipelineId format")
});
export const sourcePathQuerySchema = z.object({
  sourcePath: z
    .string()
    .min(1, "sourcePath is required")
    .regex(
      /^\/[a-zA-Z0-9\-_\/]+$/,
      "sourcePath must start with / and contain valid URL path characters"
    )
});