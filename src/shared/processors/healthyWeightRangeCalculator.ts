import type { ProcessorInput } from "./type";

function ensureObject(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Input data must be a JSON object");
  }

  return value as Record<string, unknown>;
}

export function healthyWeightRange({
  inputData
}: ProcessorInput): Record<string, unknown> {
  const data = ensureObject(inputData);

  const heightCm = data.heightCm;

  if (typeof heightCm !== "number") {
    throw new Error('Field "heightCm" must be a number');
  }

  const heightM = heightCm / 100;

  const minHealthyWeightKg = Number((18.5 * heightM * heightM).toFixed(2));
  const maxHealthyWeightKg = Number((24.9 * heightM * heightM).toFixed(2));

  return {
    ...data,
    minHealthyWeightKg,
    maxHealthyWeightKg
  };
}