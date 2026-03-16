import { z } from "zod";

export const createSubscriptionSchema = z.object({
  targetUrl: z.url("targetUrl must be a valid URL")
});

export type CreateSubscriptionInput = z.infer<typeof createSubscriptionSchema>;