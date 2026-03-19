import type { ProcessorInput } from "./type";
import { ensureObject } from "./processor";

export function enrichWithMetadata({
  inputData,
  context
}: ProcessorInput): Record<string, unknown> {
  const data = ensureObject(inputData);

  return {
    ...data,
    metadata: {
      pipelineId: context.pipelineId,
      jobId: context.jobId,
      processedAt: new Date().toISOString()
    }
  };
}