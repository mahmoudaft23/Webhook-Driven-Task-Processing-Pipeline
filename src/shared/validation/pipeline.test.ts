import { describe, expect, it } from "vitest";
import { createPipelineSchema } from "./pipeline";

describe("createPipelineSchema", () => {
  it("accepts valid pipeline input", () => {
    const result = createPipelineSchema.safeParse({
      name: "Test Pipeline",
      sourcePath: "/webhooks/test-pipeline",
      processorType: "enrichWithMetadata",
      processorConfig: {}
    });

    expect(result.success).toBe(true);
  });

  it("rejects invalid sourcePath", () => {
    const result = createPipelineSchema.safeParse({
      name: "Bad Pipeline",
      sourcePath: "webhooks/no-slash",
      processorType: "enrichWithMetadata",
      processorConfig: {}
    });

    expect(result.success).toBe(false);
  });

  it("rejects invalid processorType", () => {
    const result = createPipelineSchema.safeParse({
      name: "Bad Pipeline",
      sourcePath: "/webhooks/test",
      processorType: "wrongType",
      processorConfig: {}
    });

    expect(result.success).toBe(false);
  });
});