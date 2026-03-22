import { beforeEach, describe, expect, it, vi } from "vitest";
import { deliverNextJob } from "../../shared/services/deliveryService";
import {
  getNextDeliverableJob,
  markJobAsDelivering,
  markJobAsDelivered,
  markJobDeliveryFailed,
  markJobDeliveryPendingRetry
} from "../../shared/repositories/DeliverableJob";
import { listSubscriptionsByPipelineId } from "../../shared/repositories/subscriptionRepository";
import { createDeliveryAttempt } from "../../shared/repositories/deliveryAttemptRepository";

vi.mock("../../shared/repositories/DeliverableJob", () => ({
  getNextDeliverableJob: vi.fn(),
  markJobAsDelivering: vi.fn(),
  markJobAsDelivered: vi.fn(),
  markJobDeliveryFailed: vi.fn(),
  markJobDeliveryPendingRetry: vi.fn()
}));

vi.mock("../../shared/repositories/subscriptionRepository", () => ({
  listSubscriptionsByPipelineId: vi.fn()
}));

vi.mock("../../shared/repositories/deliveryAttemptRepository", () => ({
  createDeliveryAttempt: vi.fn()
}));


describe("deliveryService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("fetch", vi.fn());
  });

  it("returns null when there is no deliverable job", async () => {
    vi.mocked(getNextDeliverableJob).mockResolvedValue(null);

    const result = await deliverNextJob();

    expect(result).toBeNull();
  });

  it("marks job as delivered when there are no subscriptions", async () => {
    vi.mocked(getNextDeliverableJob).mockResolvedValue({
      id: "job-1"
    } as any);

    vi.mocked(markJobAsDelivering).mockResolvedValue({
      id: "job-1",
      pipelineId: "pipeline-1",
      deliveryAttemptsCount: 0
    } as any);

    vi.mocked(listSubscriptionsByPipelineId).mockResolvedValue([]);
    vi.mocked(markJobAsDelivered).mockResolvedValue({
      id: "job-1",
      deliveryStatus: "delivered"
    } as any);

    const result = await deliverNextJob();

    expect(markJobAsDelivered).toHaveBeenCalledWith("job-1");
    expect(result?.deliveryStatus).toBe("delivered");
  });

  it("delivers successfully and stores delivery attempt", async () => {
    vi.mocked(getNextDeliverableJob).mockResolvedValue({
      id: "job-1"
    } as any);

    vi.mocked(markJobAsDelivering).mockResolvedValue({
      id: "job-1",
      pipelineId: "pipeline-1",
      outputData: { ok: true },
      deliveryAttemptsCount: 0
    } as any);

    vi.mocked(listSubscriptionsByPipelineId).mockResolvedValue([
      {
        id: "sub-1",
        targetUrl: "https://example.com/hook"
      }
    ] as any);

    vi.mocked(markJobAsDelivered).mockResolvedValue({
      id: "job-1",
      deliveryStatus: "delivered"
    } as any);

    vi.mocked(fetch as any).mockResolvedValue({
      ok: true,
      status: 200,
      text: vi.fn().mockResolvedValue('{"received":true}')
    });

    const result = await deliverNextJob();

    expect(createDeliveryAttempt).toHaveBeenCalled();
    expect(markJobAsDelivered).toHaveBeenCalledWith("job-1");
    expect(result?.deliveryStatus).toBe("delivered");
  });

  it("schedules retry when delivery fails before max attempts", async () => {
    vi.mocked(getNextDeliverableJob).mockResolvedValue({
      id: "job-1"
    } as any);

    vi.mocked(markJobAsDelivering).mockResolvedValue({
      id: "job-1",
      pipelineId: "pipeline-1",
      outputData: { ok: true },
      deliveryAttemptsCount: 0
    } as any);

    vi.mocked(listSubscriptionsByPipelineId).mockResolvedValue([
      {
        id: "sub-1",
        targetUrl: "https://example.com/hook"
      }
    ] as any);

    vi.mocked(fetch as any).mockResolvedValue({
      ok: false,
      status: 404,
      text: vi.fn().mockResolvedValue("Not Found")
    });

    vi.mocked(markJobDeliveryPendingRetry).mockResolvedValue({
      id: "job-1",
      deliveryStatus: "pending",
      deliveryAttemptsCount: 1
    } as any);

    const result = await deliverNextJob();

    expect(createDeliveryAttempt).toHaveBeenCalled();
    expect(markJobDeliveryPendingRetry).toHaveBeenCalled();
    expect(result?.deliveryStatus).toBe("pending");
  });

  it("marks job as failed after max delivery attempts", async () => {
    vi.mocked(getNextDeliverableJob).mockResolvedValue({
      id: "job-1"
    } as any);

    vi.mocked(markJobAsDelivering).mockResolvedValue({
      id: "job-1",
      pipelineId: "pipeline-1",
      outputData: { ok: true },
      deliveryAttemptsCount: 4
    } as any);

    vi.mocked(listSubscriptionsByPipelineId).mockResolvedValue([
      {
        id: "sub-1",
        targetUrl: "https://example.com/hook"
      }
    ] as any);

    vi.mocked(fetch as any).mockResolvedValue({
      ok: false,
      status: 500,
      text: vi.fn().mockResolvedValue("Server Error")
    });

    vi.mocked(markJobDeliveryFailed).mockResolvedValue({
      id: "job-1",
      deliveryStatus: "failed",
      deliveryAttemptsCount: 5
    } as any);

    const result = await deliverNextJob();

    expect(markJobDeliveryFailed).toHaveBeenCalled();
    expect(result?.deliveryStatus).toBe("failed");
  });
});