import type { ProcessorInput } from "./type";
import { ensureObject } from "./processor";

export function jsonTransform({
  inputData,
  config
}: ProcessorInput): Record<string, unknown> {
  const data = ensureObject(inputData);

  const selectedFields = Array.isArray(config.fields)
    ? config.fields.filter((item): item is string => typeof item === "string")
    : [];

  if (selectedFields.length === 0) {
    return data;
  }

  const transformed: Record<string, unknown> = {};

  for (const field of selectedFields) {
    if (field in data) {
      transformed[field] = data[field];
    }
  }

  return transformed;
}