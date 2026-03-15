import { z } from "zod";

export const createPipelineSchema = z.object({
  name: z.string().min(1, "name is required"),
  sourcePath: z
    .string()
    .min(1, "sourcePath is required")
    .regex(/^\/[a-zA-Z0-9\-_\/]+$/, "sourcePath must start with / and contain valid URL path characters"),
  processorType: z.enum([
    "jsonTransform",
    "contentProcessor",
    "enrichWithMetadata"
  ]),
  processorConfig: z.record(z.string(), z.unknown()).default({})
});

export type CreatePipelineInput = z.infer<typeof createPipelineSchema>;