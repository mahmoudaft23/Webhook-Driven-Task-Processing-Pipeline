import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  return {
    mockGetNextQueuedJob: vi.fn(),
    mockMarkJobAsProcessing: vi.fn(),
    mockMarkJobAsSuccess: vi.fn(),
    mockMarkJobAsFailed: vi.fn(),
    mockGetPipelineById: vi.fn(),
    mockRunProcessor: vi.fn()
  };
});

vi.mock("../../shared/repositories/jobRepository", () => ({
  getNextQueuedJob: mocks.mockGetNextQueuedJob,
  markJobAsProcessing: mocks.mockMarkJobAsProcessing,
  markJobAsSuccess: mocks.mockMarkJobAsSuccess,
  markJobAsFailed: mocks.mockMarkJobAsFailed
}));

vi.mock("../../shared/repositories/pipelineRepository", () => ({
  getPipelineById: mocks.mockGetPipelineById
}));

vi.mock("../../shared/processors/processor", () => ({
  runProcessor: mocks.mockRunProcessor
}));

import { processNextJob } from "../../shared/services/jobProcessorService";

describe("jobProcessorService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null when there is no queued job", async () => {
    mocks.mockGetNextQueuedJob.mockResolvedValue(null);

    const result = await processNextJob();

    expect(result).toBeNull();
  });

  it("processes a queued job successfully", async () => {
    mocks.mockGetNextQueuedJob.mockResolvedValue({
      id: "job-1",
      pipelineId: "pipeline-1"
    });

    mocks.mockMarkJobAsProcessing.mockResolvedValue({
      id: "job-1",
      pipelineId: "pipeline-1",
      inputData: {
        customerName: "Ali",
        amount: 150,
        status: "paid"
      }
    });

    mocks.mockGetPipelineById.mockResolvedValue({
      id: "pipeline-1",
      processorType: "templateNarrator",
      processorConfig: {
        outputField: "summary"
      }
    });

    mocks.mockRunProcessor.mockReturnValue({
      customerName: "Ali",
      amount: 150,
      status: "paid",
      summary: "Customer Ali has amount 150 with status paid."
    });

    mocks.mockMarkJobAsSuccess.mockResolvedValue({
      id: "job-1",
      runStatus: "success"
    });

    const result = await processNextJob();

    expect(mocks.mockMarkJobAsProcessing).toHaveBeenCalledWith("job-1");
    expect(mocks.mockGetPipelineById).toHaveBeenCalledWith("pipeline-1");
    expect(mocks.mockRunProcessor).toHaveBeenCalled();
    expect(mocks.mockMarkJobAsSuccess).toHaveBeenCalledWith("job-1", {
      customerName: "Ali",
      amount: 150,
      status: "paid",
      summary: "Customer Ali has amount 150 with status paid."
    });
    expect(result?.runStatus).toBe("success");
  });

  it("marks job as failed when processor throws", async () => {
    mocks.mockGetNextQueuedJob.mockResolvedValue({
      id: "job-1",
      pipelineId: "pipeline-1"
    });

    mocks.mockMarkJobAsProcessing.mockResolvedValue({
      id: "job-1",
      pipelineId: "pipeline-1",
      inputData: {}
    });

    mocks.mockGetPipelineById.mockResolvedValue({
      id: "pipeline-1",
      processorType: "templateNarrator",
      processorConfig: {}
    });

    mocks.mockRunProcessor.mockImplementation(() => {
      throw new Error("Processor exploded");
    });

    mocks.mockMarkJobAsFailed.mockResolvedValue({
      id: "job-1",
      runStatus: "failed"
    });

    await expect(processNextJob()).rejects.toThrow("Processor exploded");

    expect(mocks.mockMarkJobAsFailed).toHaveBeenCalledWith(
      "job-1",
      "Processor exploded"
    );
  });
});