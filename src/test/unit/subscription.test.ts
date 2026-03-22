import { describe, expect, it } from "vitest";
import { SubscriptionSchema } from "../../shared/validation/subscription";

describe("SubscriptionSchema", () => {
  it("accepts valid targetUrl", () => {
    const result = SubscriptionSchema.safeParse({
      targetUrl: "https://example.com/webhook"
    });

    expect(result.success).toBe(true);
  });

  it("rejects invalid targetUrl", () => {
    const result = SubscriptionSchema.safeParse({
      targetUrl: "not-a-url"
    });

    expect(result.success).toBe(false);
  });
  it("accepts valid subscription update", () => {
    const result = SubscriptionSchema.safeParse({
      targetUrl: "https://example.com/new-webhook"
    });

    expect(result.success).toBe(true);
  });
});