import { z } from "zod";

export const SubscriptionSchema = z.object({
  targetUrl: z.url("targetUrl must be a valid URL")
});

export type SubscriptionInput = z.infer<typeof  SubscriptionSchema>;