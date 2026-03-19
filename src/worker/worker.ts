import dotenv from "dotenv";
import { testDbConnection } from "../shared/db";
import { processNextJob } from "../shared/services/jobProcessorService";
import { deliverNextJob } from "../shared/services/deliveryService";

dotenv.config();




let isProcessing = false;
let isDelivering = false;

async function pollProcessingJobs() {
  if (isProcessing) return;
  isProcessing = true;

  try {
    const processed = await processNextJob();

    if (processed) {
      console.log(
        `process: processed job ${processed.id} with status ${processed.runStatus}`
      );
    } else {
      console.log("process: no queued jobs found");
    }
  } catch (error) {
    console.error("process: failed", error);
  } finally {
    isProcessing = false;
  }
}

async function pollDeliveryJobs() {
  if (isDelivering) return;
  isDelivering = true;

  try {
    const delivered = await deliverNextJob();

    if (delivered) {
      console.log(
        `deliver: delivery handled for job ${delivered.id} with delivery status ${delivered.deliveryStatus}`
      );
    } else {
      console.log("deliver: no jobs ready for delivery");
    }
  } catch (error) {
    console.error("deliver: failed", error);
  } finally {
    isDelivering = false;
  }
}

async function startWorker() {
  try {
    await testDbConnection();

    console.log("Worker server started");
     await pollProcessingJobs();
    await pollDeliveryJobs();

     setInterval(() => {
      void pollProcessingJobs();
    }, 2000); // Poll every 2 seconds for processing jobs

    setInterval(() => {
      void pollDeliveryJobs();
    }, 2000); // Poll every 2 seconds for delivery jobs
  } catch (error) {
    console.error("Failed to start worker:", error);
    process.exit(1);
  }
}

startWorker();