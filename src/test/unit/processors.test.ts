import { describe, expect, it } from "vitest";
import { runProcessor } from "../../shared/processors/processor";
import type { ProcessorInput } from "../../shared/processors/type";

describe("processors", () => {
  const baseContext = {
    pipelineId: "pipeline-123",
    jobId: "job-456"
  };

  const makeInput = (
    inputData: unknown,
    config: Record<string, unknown> = {}
  ): ProcessorInput => ({
    inputData,
    config,
    context: baseContext
  });

  it("templateNarrator creates summary text", () => {
    const result = runProcessor(
      "templateNarrator",
      makeInput(
        {
          customerName: "Ali",
          amount: 150,
          status: "paid"
        },
        { outputField: "summary" }
      )
    );

    expect(result).toEqual({
      customerName: "Ali",
      amount: 150,
      status: "paid",
      summary: "Customer Ali has amount 150 with status paid."
    });
  });

  it("templateNarrator uses default values when fields are missing", () => {
    const result = runProcessor(
      "templateNarrator",
      makeInput({}, { outputField: "summary" })
    );

    expect(result).toEqual({
      summary: "Customer Unknown customer has amount unknown with status unknown."
    });
  });

  it("jsonTransform keeps only selected fields", () => {
    const result = runProcessor(
      "jsonTransform",
      makeInput(
        {
          name: "Ali",
          email: "ali@test.com",
          age: 30
        },
        { fields: ["name", "email"] }
      )
    );

    expect(result).toEqual({
      name: "Ali",
      email: "ali@test.com"
    });
  });

  it("jsonTransform returns full object when no fields are provided", () => {
    const result = runProcessor(
      "jsonTransform",
      makeInput({
        name: "Ali",
        email: "ali@test.com"
      })
    );

    expect(result).toEqual({
      name: "Ali",
      email: "ali@test.com"
    });
  });

  it("bmiCalculator calculates bmi and category", () => {
    const result = runProcessor(
      "bmiCalculator",
      makeInput({
        weightKg: 70,
        heightCm: 175
      })
    );

    expect(result).toEqual({
      weightKg: 70,
      heightCm: 175,
      bmi: 22.86,
      category: "Normal weight"
    });
  });

  it("bmiCalculator throws when weightKg is missing", () => {
    expect(() =>
      runProcessor(
        "bmiCalculator",
        makeInput({
          heightCm: 175
        })
      )
    ).toThrow('Field "weightKg" must be a number');
  });

  it("bmiCalculator throws when heightCm is missing", () => {
    expect(() =>
      runProcessor(
        "bmiCalculator",
        makeInput({
          weightKg: 70
        })
      )
    ).toThrow('Field "heightCm" must be a number');
  });

  it("healthyWeightRangeCalculator calculates healthy range", () => {
    const result = runProcessor(
      "healthyWeightRangeCalculator",
      makeInput({
        heightCm: 175
      })
    );

    expect(result).toEqual({
      heightCm: 175,
      minHealthyWeightKg: 56.66,
      maxHealthyWeightKg: 76.26
    });
  });

  it("healthyWeightRangeCalculator throws when heightCm is invalid", () => {
    expect(() =>
      runProcessor(
        "healthyWeightRangeCalculator",
        makeInput({
          heightCm: "175"
        })
      )
    ).toThrow('Field "heightCm" must be a number');
  });

  it("stepsCaloriesEstimator calculates distance and calories with weight", () => {
    const result = runProcessor(
      "stepsCaloriesEstimator",
      makeInput({
        steps: 5000,
        weightKg: 70
      })
    );

    expect(result).toEqual({
      steps: 5000,
      weightKg: 70,
      estimatedDistanceKm: 4,
      estimatedCaloriesBurned: 175
    });
  });

  it("stepsCaloriesEstimator calculates default calories without weight", () => {
    const result = runProcessor(
      "stepsCaloriesEstimator",
      makeInput({
        steps: 5000
      })
    );

    expect(result).toEqual({
      steps: 5000,
      estimatedDistanceKm: 4,
      estimatedCaloriesBurned: 200
    });
  });

  it("stepsCaloriesEstimator throws when steps is invalid", () => {
    expect(() =>
      runProcessor(
        "stepsCaloriesEstimator",
        makeInput({
          steps: "5000"
        })
      )
    ).toThrow('Field "steps" must be a number');
  });

  it("throws for unsupported processor type", () => {
    expect(() =>
      runProcessor(
        "unknownProcessor",
        makeInput({
          anything: true
        })
      )
    ).toThrow("we don't have a processor of type unknownProcessor");
  });
});