import request from "supertest";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { app } from "../../api/app";
import { cleanupTestDb, setupTestDb } from "../helper/testDb";

describe("API integration tests ", () => {
  beforeAll(async () => {
    await setupTestDb();
  });

  beforeEach(async () => {
    await cleanupTestDb();
  });

  it("TC-00: GET /health returns 200", async () => {
    const res = await request(app).get("/health");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      service: "api",
      status: "ok"
    });
  });

  it("TC-01: creates pipeline successfully", async () => {
    const res = await request(app).post("/api/v1/pipelines").send({
      name: "Narrator Pipeline",
      sourcePath: "/webhooks/narrator-pipeline",
      processorType: "templateNarrator",
      processorConfig: {
        outputField: "summary"
      }
    });

    expect(res.status).toBe(201);
    expect(res.body.id).toBeTypeOf("string");
    expect(res.body.name).toBe("Narrator Pipeline");
    expect(res.body.processorType).toBe("templateNarrator");
  });

  it("TC-02: rejects duplicate sourcePath", async () => {
    await request(app).post("/api/v1/pipelines").send({
      name: "One",
      sourcePath: "/webhooks/dup",
      processorType: "templateNarrator",
      processorConfig: {
        outputField: "summary"
      }
    });

    const res = await request(app).post("/api/v1/pipelines").send({
      name: "Two",
      sourcePath: "/webhooks/dup",
      processorType: "templateNarrator",
      processorConfig: {
        outputField: "summary"
      }
    });

    expect(res.status).toBe(409);
  });

  it("TC-03: rejects invalid processorType", async () => {
    const res = await request(app).post("/api/v1/pipelines").send({
      name: "Bad Processor",
      sourcePath: "/webhooks/bad-processor",
      processorType: "wrongType",
      processorConfig: {}
    });

    expect(res.status).toBe(400);
  });

  it("TC-04: rejects invalid sourcePath", async () => {
    const res = await request(app).post("/api/v1/pipelines").send({
      name: "Bad Path",
      sourcePath: "webhooks/no-slash",
      processorType: "templateNarrator",
      processorConfig: {
        outputField: "summary"
      }
    });

    expect(res.status).toBe(400);
  });

  it("TC-05: lists pipelines", async () => {
    await request(app).post("/api/v1/pipelines").send({
      name: "List Me",
      sourcePath: "/webhooks/list-me",
      processorType: "templateNarrator",
      processorConfig: {
        outputField: "summary"
      }
    });

    const res = await request(app).get("/api/v1/pipelines");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(1);
  });

  it("TC-06: gets pipeline by id", async () => {
    const created = await request(app).post("/api/v1/pipelines").send({
      name: "Get Me",
      sourcePath: "/webhooks/get-me",
      processorType: "jsonTransform",
      processorConfig: {
        fields: ["name"]
      }
    });

    const res = await request(app).get(`/api/v1/pipelines/${created.body.id}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(created.body.id);
    expect(res.body.name).toBe("Get Me");
  });

  it("TC-07: rejects invalid pipeline id on get by id", async () => {
    const res = await request(app).get("/api/v1/pipelines/NOT_UUID");

    expect(res.status).toBe(400);
  });

  it("TC-08: returns 404 when pipeline not found on get by id", async () => {
    const res = await request(app).get(
      "/api/v1/pipelines/550e8400-e29b-41d4-a716-446655440000"
    );

    expect(res.status).toBe(404);
  });

  it("TC-09: updates pipeline successfully", async () => {
    const created = await request(app).post("/api/v1/pipelines").send({
      name: "Old Name",
      sourcePath: "/webhooks/update-me",
      processorType: "jsonTransform",
      processorConfig: {
        fields: ["name"]
      }
    });

    const res = await request(app)
      .patch(`/api/v1/pipelines/${created.body.id}`)
      .send({
        name: "New Name"
      });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe("New Name");
  });

  it("TC-10: rejects invalid pipeline id on update", async () => {
    const res = await request(app).patch("/api/v1/pipelines/NOT_UUID").send({
      name: "Nope"
    });

    expect(res.status).toBe(400);
  });

  it("TC-11: returns 404 when pipeline not found on update", async () => {
    const res = await request(app)
      .patch("/api/v1/pipelines/550e8400-e29b-41d4-a716-446655440000")
      .send({
        name: "Nope"
      });

    expect(res.status).toBe(404);
  });

  it("TC-12: deletes pipeline successfully", async () => {
    const created = await request(app).post("/api/v1/pipelines").send({
      name: "Delete Me",
      sourcePath: "/webhooks/delete-me",
      processorType: "jsonTransform",
      processorConfig: {
        fields: ["name"]
      }
    });

    const res = await request(app).delete(`/api/v1/pipelines/${created.body.id}`);

    expect(res.status).toBe(200);
  });

  it("TC-13: rejects invalid pipeline id on delete", async () => {
    const res = await request(app).delete("/api/v1/pipelines/NOT_UUID");

    expect(res.status).toBe(400);
  });

  it("TC-14: returns 404 when pipeline not found on delete", async () => {
    const res = await request(app).delete(
      "/api/v1/pipelines/550e8400-e29b-41d4-a716-446655440000"
    );

    expect(res.status).toBe(404);
  });

  it("TC-15: creates subscription successfully", async () => {
    const pipelineRes = await request(app).post("/api/v1/pipelines").send({
      name: "Pipeline",
      sourcePath: "/webhooks/sub-pipeline",
      processorType: "templateNarrator",
      processorConfig: {
        outputField: "summary"
      }
    });

    const res = await request(app)
      .post(`/api/v1/pipelines/${pipelineRes.body.id}/subscriptions`)
      .send({
        targetUrl: "https://example.com/webhook"
      });

    expect(res.status).toBe(201);
    expect(res.body.id).toBeTypeOf("string");
    expect(res.body.pipelineId).toBe(pipelineRes.body.id);
    expect(res.body.targetUrl).toBe("https://example.com/webhook");
  });

  it("TC-16: rejects invalid pipelineId for subscription create", async () => {
    const res = await request(app)
      .post("/api/v1/pipelines/NOT_UUID/subscriptions")
      .send({
        targetUrl: "https://example.com/webhook"
      });

    expect(res.status).toBe(400);
  });

  it("TC-17: returns 404 when pipeline not found for subscription create", async () => {
    const res = await request(app)
      .post("/api/v1/pipelines/550e8400-e29b-41d4-a716-446655440000/subscriptions")
      .send({
        targetUrl: "https://example.com/webhook"
      });

    expect(res.status).toBe(404);
  });

  it("TC-18: lists subscriptions by pipeline", async () => {
    const pipelineRes = await request(app).post("/api/v1/pipelines").send({
      name: "Pipeline",
      sourcePath: "/webhooks/list-subscriptions",
      processorType: "templateNarrator",
      processorConfig: {
        outputField: "summary"
      }
    });

    await request(app)
      .post(`/api/v1/pipelines/${pipelineRes.body.id}/subscriptions`)
      .send({
        targetUrl: "https://example.com/webhook"
      });

    const res = await request(app).get(
      `/api/v1/pipelines/${pipelineRes.body.id}/subscriptions`
    );

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(1);
  });

  it("TC-19: rejects invalid pipelineId for listing subscriptions", async () => {
    const res = await request(app).get(
      "/api/v1/pipelines/NOT_UUID/subscriptions"
    );

    expect(res.status).toBe(400);
  });

  it("TC-20: updates subscription successfully", async () => {
    const pipelineRes = await request(app).post("/api/v1/pipelines").send({
      name: "Pipeline",
      sourcePath: "/webhooks/update-subscription",
      processorType: "templateNarrator",
      processorConfig: {
        outputField: "summary"
      }
    });

    const subRes = await request(app)
      .post(`/api/v1/pipelines/${pipelineRes.body.id}/subscriptions`)
      .send({
        targetUrl: "https://example.com/webhook"
      });

    const res = await request(app)
      .patch(`/api/v1/subscriptions/${subRes.body.id}`)
      .send({
        targetUrl: "https://example.com/new-webhook"
      });

    expect(res.status).toBe(200);
    expect(res.body.targetUrl).toBe("https://example.com/new-webhook");
  });

  it("TC-21: rejects invalid subscription id on update", async () => {
    const res = await request(app)
      .patch("/api/v1/subscriptions/NOT_UUID")
      .send({
        targetUrl: "https://example.com/new-webhook"
      });

    expect(res.status).toBe(400);
  });

  it("TC-22: deletes subscription successfully", async () => {
    const pipelineRes = await request(app).post("/api/v1/pipelines").send({
      name: "Pipeline",
      sourcePath: "/webhooks/delete-subscription",
      processorType: "templateNarrator",
      processorConfig: {
        outputField: "summary"
      }
    });

    const subRes = await request(app)
      .post(`/api/v1/pipelines/${pipelineRes.body.id}/subscriptions`)
      .send({
        targetUrl: "https://example.com/webhook"
      });

    const res = await request(app).delete(
      `/api/v1/subscriptions/${subRes.body.id}`
    );

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Subscription deleted successfully");
  });

  it("TC-23: accepts webhook and creates queued job", async () => {
    const pipelineRes = await request(app).post("/api/v1/pipelines").send({
      name: "Webhook Pipeline",
      sourcePath: "/webhooks/accept-me",
      processorType: "templateNarrator",
      processorConfig: {
        outputField: "summary"
      }
    });

    const res = await request(app)
      .post(`/webhooks/${pipelineRes.body.id}`)
      .send({
        customerName: "Ali",
        amount: 150,
        status: "paid"
      });

    expect(res.status).toBe(202);
    expect(res.body.jobId).toBeTypeOf("string");
    expect(res.body.status).toBe("queued");
  });

  it("TC-24: rejects invalid pipelineId on webhook ingestion", async () => {
    const res = await request(app)
      .post("/webhooks/NOT_UUID")
      .send({
        customerName: "Ali",
        amount: 150,
        status: "paid"
      });

    expect(res.status).toBe(400);
  });

  it("TC-25: gets job by id", async () => {
    const pipelineRes = await request(app).post("/api/v1/pipelines").send({
      name: "Job Pipeline",
      sourcePath: "/webhooks/job-pipeline",
      processorType: "templateNarrator",
      processorConfig: {
        outputField: "summary"
      }
    });

    const webhookRes = await request(app)
      .post(`/webhooks/${pipelineRes.body.id}`)
      .send({
        customerName: "Ali",
        amount: 200,
        status: "paid"
      });

    const res = await request(app).get(`/api/v1/jobs/${webhookRes.body.jobId}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(webhookRes.body.jobId);
  });

  it("TC-26: gets pipeline delivery attempts", async () => {
    const pipelineRes = await request(app).post("/api/v1/pipelines").send({
      name: "Pipeline Deliveries",
      sourcePath: "/webhooks/pipeline-deliveries",
      processorType: "templateNarrator",
      processorConfig: {
        outputField: "summary"
      }
    });

    const res = await request(app).get(
      `/api/v1/pipelines/${pipelineRes.body.id}/deliveries`
    );

    expect(res.status).toBe(200);
  });
});