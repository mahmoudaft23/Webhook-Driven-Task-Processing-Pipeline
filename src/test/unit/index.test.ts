import { describe, expect, it } from "vitest";
import { runProcessor } from "../../shared/processors/processor";

describe("runProcessor", () => {
  const baseContext = {
    pipelineId: "pipeline-123",
    jobId: "job-456"
  };

  it("templateNarrator creates summary text", () => {
    const result = runProcessor("templateNarrator", {
      inputData: {
        customerName: "Ali",
        amount: 150,
        status: "paid"
      },
      config: {
        outputField: "summary"
      },
      context: baseContext
    });

    expect(result).toEqual({
      customerName: "Ali",
      amount: 150,
      status: "paid",
      summary: "Customer Ali has amount 150 with status paid."
    });
  });

  it("jsonTransform keeps only selected fields", () => {
    const result = runProcessor("jsonTransform", {
      inputData: {
        name: "Ali",
        email: "ali@test.com",
        age: 30
      },
      config: {
        fields: ["name", "email"]
      },
      context: baseContext
    });

    expect(result).toEqual({
      name: "Ali",
      email: "ali@test.com"
    });
  });

  it("bmiCalculator calculates bmi and category", () => {
    const result = runProcessor("bmiCalculator", {
      inputData: {
        weightKg: 70,
        heightCm: 175
      },
      config: {},
      context: baseContext
    });

    expect(result).toEqual({
      weightKg: 70,
      heightCm: 175,
      bmi: 22.86,
      category: "Normal weight"
    });
  });

  it("stepsCaloriesEstimator calculates distance and calories", () => {
    const result = runProcessor("stepsCaloriesEstimator", {
      inputData: {
        steps: 5000,
        weightKg: 70
      },
      config: {},
      context: baseContext
    });

    expect(result).toEqual({
      steps: 5000,
      weightKg: 70,
      estimatedDistanceKm: 4,
      estimatedCaloriesBurned: 175
    });
  });

  it("throws for unsupported processor type", () => {
    expect(() =>
      runProcessor("unknownProcessor", {
        inputData: {
          message: "hello"
        },
        config: {},
        context: baseContext
      })
    ).toThrow("we don't have a processor of type unknownProcessor");
  });
});