import { describe, expect, it } from "vitest";
import { createPipelineSchema, updatePipelineSchema } from "../../shared/validation/pipeline";

describe("pipeline validation", () => {
  it("accepts valid pipeline input", () => {
    const result = createPipelineSchema.safeParse({
      name: "Narrator Pipeline",
      sourcePath: "/webhooks/narrator",
      processorType: "templateNarrator",
      processorConfig: {
        outputField: "summary"
      }
    });

    expect(result.success).toBe(true);
  });

  it("rejects invalid sourcePath", () => {
    const result = createPipelineSchema.safeParse({
      name: "Bad Path",
      sourcePath: "webhooks/no-slash",
      processorType: "templateNarrator",
      processorConfig: {}
    });

    expect(result.success).toBe(false);
  });

  it("rejects invalid processorType", () => {
    const result = createPipelineSchema.safeParse({
      name: "Bad Processor",
      sourcePath: "/webhooks/bad-processor",
      processorType: "wrongType",
      processorConfig: {}
    });

    expect(result.success).toBe(false);
  });

  it("accepts valid pipeline update", () => {
    const result = updatePipelineSchema.safeParse({
      name: "Updated Pipeline",
      processorType: "bmiCalculator",
      processorConfig: {}
    });

    expect(result.success).toBe(true);
  });

  it("rejects invalid update processorType", () => {
    const result = updatePipelineSchema.safeParse({
      processorType: "invalidProcessor"
    });

    expect(result.success).toBe(false);
  });
});