import type { ProcessorInput } from "./type";

function ensureObject(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Input data must be a JSON object");
  }

  return value as Record<string, unknown>;
}

export function bmiCalculator({
  inputData
}: ProcessorInput): Record<string, unknown> {
  const data = ensureObject(inputData);

  const weightKg = data.weightKg;
  const heightCm = data.heightCm;

  if (typeof weightKg !== "number") {
    throw new Error('Field "weightKg" must be a number');
  }

  if (typeof heightCm !== "number") {
    throw new Error('Field "heightCm" must be a number');
  }

  const heightM = heightCm / 100;
  const bmi = Number((weightKg / (heightM * heightM)).toFixed(2));

  let category = "";

  if (bmi < 18.5) {
    category = "Underweight";
  } else if (bmi < 25) {
    category = "Normal weight";
  } else if (bmi < 30) {
    category = "Overweight";
  } else {
    category = "Obese";
  }

  return {
    ...data,
    bmi,
    category
  };
}