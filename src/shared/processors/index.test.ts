import { describe, expect, it } from "vitest";
import { runProcessor } from "./processor.js";

describe("runProcessor", () => {
  it("enrichWithMetadata adds metadata", () => {
    const result = runProcessor("enrichWithMetadata", {
      inputData: {
        name: "Ali",
        message: "hello"
      },
      config: {},
      context: {
        pipelineId: "pipeline-1",
        jobId: "job-1"
      }
    }) as Record<string, unknown>;

    expect(result.name).toBe("Ali");
    expect(result.message).toBe("hello");

    const metadata = result.metadata as Record<string, unknown>;
    expect(metadata.pipelineId).toBe("pipeline-1");
    expect(metadata.jobId).toBe("job-1");
    expect(typeof metadata.processedAt).toBe("string");
  });

  it("contentProcessor uppercases the selected field", () => {
    const result = runProcessor("contentProcessor", {
      inputData: {
        message: "hello world"
      },
      config: {
        field: "message",
        operation: "uppercase"
      },
      context: {
        pipelineId: "pipeline-1",
        jobId: "job-1"
      }
    }) as Record<string, unknown>;

    expect(result.message).toBe("HELLO WORLD");
  });

  it("jsonTransform keeps only selected fields", () => {
    const result = runProcessor("jsonTransform", {
      inputData: {
        name: "Ali",
        email: "ali@test.com",
        age: 30
      },
      config: {
        fields: ["name", "email"]
      },
      context: {
        pipelineId: "pipeline-1",
        jobId: "job-1"
      }
    }) as Record<string, unknown>;

    expect(result).toEqual({
      name: "Ali",
      email: "ali@test.com"
    });
  });

  it("contentProcessor throws if field is not string", () => {
    expect(() =>
      runProcessor("contentProcessor", {
        inputData: {
          message: 123
        },
        config: {
          field: "message",
          operation: "uppercase"
        },
        context: {
          pipelineId: "pipeline-1",
          jobId: "job-1"
        }
      })
    ).toThrow();
  });
});