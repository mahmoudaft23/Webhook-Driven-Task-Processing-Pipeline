import request from "supertest";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { app } from "./app";
import { cleanupTestDb, setupTestDb } from "../test/testDb";

describe("API integration tests TC-01 to TC-16", () => {
  beforeAll(async () => {
    await setupTestDb();
  });

  beforeEach(async () => {
    await cleanupTestDb();
  });

  it("TC-01: GET /health returns 200", async () => {
    const res = await request(app).get("/health");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      service: "api",
      status: "ok"
    });
  });

  it("TC-02: creates pipeline successfully", async () => {
    const res = await request(app).post("/api/v1/pipelines").send({
      name: "Metadata Pipeline",
      sourcePath: "/webhooks/metadata-pipeline",
      processorType: "enrichWithMetadata",
      processorConfig: {}
    });

    expect(res.status).toBe(201);
    expect(res.body.id).toBeTypeOf("string");
    expect(res.body.name).toBe("Metadata Pipeline");
  });

  it("TC-03: rejects duplicate sourcePath", async () => {
    await request(app).post("/api/v1/pipelines").send({
      name: "One",
      sourcePath: "/webhooks/dup",
      processorType: "enrichWithMetadata",
      processorConfig: {}
    });

    const res = await request(app).post("/api/v1/pipelines").send({
      name: "Two",
      sourcePath: "/webhooks/dup",
      processorType: "enrichWithMetadata",
      processorConfig: {}
    });

    expect(res.status).toBe(409);
  });

  it("TC-04: rejects invalid processorType", async () => {
    const res = await request(app).post("/api/v1/pipelines").send({
      name: "Bad",
      sourcePath: "/webhooks/bad",
      processorType: "wrongType",
      processorConfig: {}
    });

    expect(res.status).toBe(400);
  });

  it("TC-05: rejects invalid sourcePath", async () => {
    const res = await request(app).post("/api/v1/pipelines").send({
      name: "Bad Path",
      sourcePath: "webhooks/no-slash",
      processorType: "enrichWithMetadata",
      processorConfig: {}
    });

    expect(res.status).toBe(400);
  });

  it("TC-06: lists pipelines", async () => {
    await request(app).post("/api/v1/pipelines").send({
      name: "List Me",
      sourcePath: "/webhooks/list-me",
      processorType: "enrichWithMetadata",
      processorConfig: {}
    });

    const res = await request(app).get("/api/v1/pipelines");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(1);
  });

  it("TC-07: creates subscription successfully", async () => {
    const pipelineRes = await request(app).post("/api/v1/pipelines").send({
      name: "Pipeline",
      sourcePath: "/webhooks/sub-pipeline",
      processorType: "enrichWithMetadata",
      processorConfig: {}
    });

    const pipelineId = pipelineRes.body.id;

    const res = await request(app)
      .post(`/api/v1/pipelines/${pipelineId}/subscriptions`)
      .send({
        targetUrl: "https://example.com/webhook"
      });

    expect(res.status).toBe(201);
    expect(res.body.id).toBeTypeOf("string");
    expect(res.body.pipelineId).toBe(pipelineId);
  });

  it("TC-08: rejects invalid pipelineId for subscription create", async () => {
    const res = await request(app)
      .post("/api/v1/pipelines/NOT_UUID/subscriptions")
      .send({
        targetUrl: "https://example.com/webhook"
      });

    expect(res.status).toBe(400);
  });

  it("TC-09: returns 404 when pipeline not found for subscription create", async () => {
    const res = await request(app)
      .post("/api/v1/pipelines/11111111-1111-1111-1111-111111111111/subscriptions")
      .send({
        targetUrl: "https://example.com/webhook"
      });

    expect(res.status).toBe(404);
  });

  it("TC-10: lists subscriptions by pipeline", async () => {
    const pipelineRes = await request(app).post("/api/v1/pipelines").send({
      name: "Pipeline",
      sourcePath: "/webhooks/list-subscriptions",
      processorType: "enrichWithMetadata",
      processorConfig: {}
    });

    const pipelineId = pipelineRes.body.id;

    await request(app)
      .post(`/api/v1/pipelines/${pipelineId}/subscriptions`)
      .send({
        targetUrl: "https://example.com/webhook"
      });

    const res = await request(app).get(
      `/api/v1/pipelines/${pipelineId}/subscriptions`
    );

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(1);
  });

  it("TC-11: deletes subscription successfully", async () => {
    const pipelineRes = await request(app).post("/api/v1/pipelines").send({
      name: "Pipeline",
      sourcePath: "/webhooks/delete-subscription",
      processorType: "enrichWithMetadata",
      processorConfig: {}
    });

    const pipelineId = pipelineRes.body.id;

    const subRes = await request(app)
      .post(`/api/v1/pipelines/${pipelineId}/subscriptions`)
      .send({
        targetUrl: "https://example.com/webhook"
      });

    const subscriptionId = subRes.body.id;

    const res = await request(app).delete(
      `/api/v1/subscriptions/${subscriptionId}`
    );

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Subscription deleted successfully");
  });

  it("TC-12: rejects invalid subscription id", async () => {
    const res = await request(app).delete("/api/v1/subscriptions/NOT_UUID");

    expect(res.status).toBe(400);
  });

  it("TC-13: rejects invalid pipelineId on webhook ingestion", async () => {
    const res = await request(app)
      .post("/webhooks/NOT_UUID")
      .send({ name: "Ali" });

    expect(res.status).toBe(400);
  });

  it("TC-14: returns 404 when webhook pipeline not found", async () => {
    const res = await request(app)
      .post("/webhooks/550e8400-e29b-41d4-a716-446655440000")
      .send({ name: "Ali" });

    expect(res.status).toBe(404);
  });

  it("TC-15: accepts webhook and creates queued job", async () => {
    const pipelineRes = await request(app).post("/api/v1/pipelines").send({
      name: "Webhook Pipeline",
      sourcePath: "/webhooks/accept-me",
      processorType: "enrichWithMetadata",
      processorConfig: {}
    });

    const pipelineId = pipelineRes.body.id;

    const res = await request(app)
      .post(`/webhooks/${pipelineId}`)
      .send({
        name: "Ali",
        message: "hello webhook"
      });

    expect(res.status).toBe(202);
    expect(res.body.jobId).toBeTypeOf("string");
    expect(res.body.status).toBe("queued");
  });

  it("TC-16: gets job by id", async () => {
    const pipelineRes = await request(app).post("/api/v1/pipelines").send({
      name: "Job Pipeline",
      sourcePath: "/webhooks/job-pipeline",
      processorType: "enrichWithMetadata",
      processorConfig: {}
    });

    const pipelineId = pipelineRes.body.id;

    const webhookRes = await request(app)
      .post(`/webhooks/${pipelineId}`)
      .send({
        name: "Ali",
        message: "hello job"
      });

    const jobId = webhookRes.body.jobId;

    const res = await request(app).get(`/api/v1/jobs/${jobId}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(jobId);
    expect(res.body.runStatus).toBe("queued");
  });
});