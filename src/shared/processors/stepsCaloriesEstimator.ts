import type { ProcessorInput } from "./type";

function ensureObject(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Input data must be a JSON object");
  }

  return value as Record<string, unknown>;
}

export function stepsCaloriesEstimator({
  inputData
}: ProcessorInput): Record<string, unknown> {
  const data = ensureObject(inputData);

  const steps = data.steps;
  const weightKg = data.weightKg;

  if (typeof steps !== "number") {
    throw new Error('Field "steps" must be a number');
  }

  const estimatedDistanceKm = Number((steps * 0.0008).toFixed(2));

  let estimatedCaloriesBurned = Number((steps * 0.04).toFixed(2));

  if (typeof weightKg === "number") {
    estimatedCaloriesBurned = Number((steps * (weightKg * 0.0005)).toFixed(2));
  }

  return {
    ...data,
    estimatedDistanceKm,
    estimatedCaloriesBurned
  };
}