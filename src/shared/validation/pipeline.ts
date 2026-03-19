import { z } from "zod";

const createPipelineSchema = z.object({
  name: z.string().min(1, "name is required"),
  sourcePath: z
    .string()
    .min(1, "sourcePath is required")
    .regex(/^\/[a-zA-Z0-9\-_\/]+$/, "sourcePath must start with / and contain valid URL path characters"),
  processorType: z.enum([
    "jsonTransform",
    "contentProcessor",//delete this line when you add the new processor type in processor.ts
    "enrichWithMetadata",//delete this line when you add the new processor type in processor.ts
    "templateNarrator"


  ]),
  processorConfig: z.record(z.string(), z.unknown()).default({})
});
 const updatePipelineSchema = z
  .object({
    name: z.string().min(1, "name cannot be empty").optional(),
    processorConfig: z.record(z.string(), z.unknown()).optional()
  })
  .refine(
    (data) => data.name !== undefined || data.processorConfig !== undefined,
    {
      message: "At least one field must be provided"
    }
  );

 type UpdatePipelineInput = z.infer<typeof updatePipelineSchema>;
 type CreatePipelineInput = z.infer<typeof createPipelineSchema>;

export {
  createPipelineSchema,
  updatePipelineSchema,
  UpdatePipelineInput,
  CreatePipelineInput
}
