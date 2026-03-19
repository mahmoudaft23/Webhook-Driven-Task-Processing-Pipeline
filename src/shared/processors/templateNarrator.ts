import type { ProcessorInput } from "./type";
import { ensureObject } from "./processor";


export function templateNarrator({
  inputData,
  config
}: ProcessorInput): Record<string, unknown> {
  const data = ensureObject(inputData);

  const outputField =
    typeof config.outputField === "string" ? config.outputField : "summary";

  const fields = Array.isArray(config.fields)
    ? config.fields.filter((item): item is string => typeof item === "string")
    : [];

  if (fields.length === 0) {
    return {
      ...data,
      [outputField]: "No summary available."
    };
  }

  const parts: string[] = [];

  for (const field of fields) {
    if (field in data) {
      parts.push(`${field}: ${String(data[field])}`);
    }
  }

  return {
    ...data,
    [outputField]:
      parts.length > 0 ? parts.join(", ") : "No summary available."
  };
}