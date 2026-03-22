import type { ProcessorInput } from "./type";

import { jsonTransform } from "./jsonTransform";
import { templateNarrator } from "./templateNarrator";
import { bmiCalculator } from "./bmiCalculator";
import { healthyWeightRange } from "./healthyWeightRangeCalculator";
import { stepsCaloriesEstimator } from "./stepsCaloriesEstimator";
  function runProcessor(processorType: string,params: ProcessorInput): Record<string, unknown> {

    
     if (processorType === "templateNarrator") {
        return templateNarrator(params);
    }
     else if (processorType === "jsonTransform") {
        return jsonTransform(params);
    }
   else if (processorType === "bmiCalculator") {
        return bmiCalculator(params);
    }
    else if (processorType === "healthyWeightRangeCalculator") {
        return healthyWeightRange(params);
    }
    else if (processorType === "stepsCaloriesEstimator") {
        return stepsCaloriesEstimator(params);
    }
     else {
        throw new Error(`we don't have a processor of type ${processorType}`);
    }
  
}
function ensureObject(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Input data must be a JSON object");
  }

  return value as Record<string, unknown>;
}

export {
  runProcessor,
  ensureObject
}