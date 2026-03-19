import type { ProcessorInput } from "./type";
import { enrichWithMetadata } from "./enrichWithMetadata";
import { contentProcessor } from "./contentProcessor";
import { jsonTransform } from "./jsonTransform";
import { templateNarrator } from "./templateNarrator";

 function runProcessor(processorType: string,params: ProcessorInput): Record<string, unknown> {

     if (processorType === "enrichWithMetadata") {
        return enrichWithMetadata(params);
    }
    else if (processorType === "templateNarrator") {
        return templateNarrator(params);
    }
     else if (processorType === "contentProcessor") {
        return contentProcessor(params);
    }
     else if (processorType === "jsonTransform") {
        return jsonTransform(params);
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