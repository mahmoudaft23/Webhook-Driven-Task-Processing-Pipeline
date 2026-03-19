import type { ProcessorInput } from "./type";
import { ensureObject } from "./processor";

export function contentProcessor({
  inputData,
  config
}: ProcessorInput): Record<string, unknown> {
  const data = ensureObject(inputData);

  const field = typeof config.field === "string" ? config.field : "message";
  const operation =
    typeof config.operation === "string" ? config.operation : "uppercase";

  const value = data[field];

  if (typeof value !== "string") {
    throw new Error(`Field "${field}" must be a string`);
  }

  let processedValue = value;

  if (operation === "uppercase") {
    processedValue = value.toUpperCase();
  } else if (operation === "lowercase") {
    processedValue = value.toLowerCase();
  } else if (operation === "trim") {
    processedValue = value.trim();
  } else {
    throw new Error(`Unsupported contentProcessor operation: ${operation}`);
  }

  return {
    ...data,
    [field]: processedValue
  };
}