export type ProcessorContext = {
  pipelineId: string;
  jobId: string;
};

export type ProcessorInput = {
  inputData: unknown;
  config: Record<string, unknown>;
  context: ProcessorContext;
};