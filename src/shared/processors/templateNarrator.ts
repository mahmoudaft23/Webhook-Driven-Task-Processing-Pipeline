import type { ProcessorInput } from "./type";

function ensureObject(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Input data must be a JSON object");
  }

  return value as Record<string, unknown>;
}

export function templateNarrator({
  inputData,
  config
}: ProcessorInput): Record<string, unknown> {
  const data = ensureObject(inputData);

  const outputField =
    typeof config.outputField === "string" ? config.outputField : "summary";

  const customerName =
    typeof data.customerName === "string" ? data.customerName : "Unknown customer";

  const amount =
    typeof data.amount === "string" || typeof data.amount === "number"
      ? data.amount
      : "unknown";

  const status =
    typeof data.status === "string" ? data.status : "unknown";

  return {
    ...data,
    [outputField]: `Customer ${customerName} has amount ${amount} with status ${status}.`
  };
}