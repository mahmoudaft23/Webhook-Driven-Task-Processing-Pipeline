import { describe, expect, it } from "vitest";
import { createSubscriptionSchema } from "./subscription";

describe("createSubscriptionSchema", () => {
  it("accepts valid targetUrl", () => {
    const result = createSubscriptionSchema.safeParse({
      targetUrl: "https://example.com/webhook"
    });

    expect(result.success).toBe(true);
  });

  it("rejects invalid targetUrl", () => {
    const result = createSubscriptionSchema.safeParse({
      targetUrl: "not-a-url"
    });

    expect(result.success).toBe(false);
  });
});