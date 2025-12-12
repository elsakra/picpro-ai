import { NextRequest, NextResponse } from "next/server";
import { 
  updateOrderStatus, 
  updateGenerationJob,
  getJobByPredictionId,
  getOrder,
  saveGeneratedHeadshot,
  getGeneratedHeadshots,
  areAllJobsComplete,
} from "@/lib/db";
import { uploadFromUrl, generateHeadshotKey } from "@/lib/storage";
import { sendHeadshotsReadyEmail } from "@/lib/email";
import { generateHeadshots, HEADSHOT_STYLES, HeadshotStyle } from "@/lib/replicate";

// Replicate webhook payload types
interface ReplicateWebhook {
  id: string;
  status: "starting" | "processing" | "succeeded" | "failed" | "canceled";
  output?: string | string[] | Record<string, unknown>;
  error?: string;
  logs?: string;
  input?: Record<string, unknown>;
  metrics?: {
    predict_time?: number;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ReplicateWebhook;
    
    console.log("Replicate webhook received:", {
      id: body.id,
      status: body.status,
      hasOutput: !!body.output,
    });

    const predictionId = body.id;
    const status = body.status;

    if (status === "succeeded") {
      const output = body.output;
      
      // Check if this is a training job (output has weights)
      if (typeof output === "object" && output !== null && "weights" in output) {
        await handleTrainingComplete(predictionId, output as { weights: string; version?: string });
      } 
      // Check if this is a generation job (output is array of image URLs)
      else if (Array.isArray(output)) {
        await handleGenerationComplete(predictionId, output as string[]);
      }
    } else if (status === "failed") {
      console.error("Replicate job failed:", predictionId, body.error);
      
      // Update generation job status if this is a generation job
      await updateGenerationJob(predictionId, "failed", body.error);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Replicate webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

async function handleTrainingComplete(
  predictionId: string, 
  output: { weights: string; version?: string }
) {
  console.log("Training completed:", predictionId);
  console.log("Model weights URL:", output.weights);

  // Find the order with this training job
  // Note: In production, you'd store the prediction ID when creating the training job
  // For now, we'll need to find it via the training_job_id field

  // Update order with model URL and start generation
  // This would require storing a mapping of prediction ID to order ID
  // For a robust implementation, store this when creating the training job

  // For now, log the completion
  console.log("Training complete - model ready for generation");
  console.log("Weights URL:", output.weights);
  
  // TODO: Look up order by training_job_id and:
  // 1. Update order with model_url
  // 2. Start generation jobs for all styles
  // 3. Update status to "generating"
}

async function handleGenerationComplete(
  predictionId: string, 
  imageUrls: string[]
) {
  console.log("Generation completed:", predictionId, "Images:", imageUrls.length);

  // Find the generation job
  const job = await getJobByPredictionId(predictionId);
  if (!job) {
    console.warn("Generation job not found for prediction:", predictionId);
    return;
  }

  const orderId = job.order_id;
  const style = job.style;

  // Upload images to our storage
  const savedHeadshots = [];
  for (let i = 0; i < imageUrls.length; i++) {
    try {
      const key = generateHeadshotKey(orderId, style, i);
      const url = await uploadFromUrl(imageUrls[i], key);
      
      const headshot = await saveGeneratedHeadshot(
        orderId,
        style,
        key,
        url,
        predictionId
      );
      savedHeadshots.push(headshot);
    } catch (error) {
      console.error(`Failed to save headshot ${i}:`, error);
    }
  }

  // Update job status
  await updateGenerationJob(predictionId, "completed");

  // Check if all jobs are complete
  const allComplete = await areAllJobsComplete(orderId);
  
  if (allComplete) {
    // Update order status
    await updateOrderStatus(orderId, "completed");

    // Get order details and send email
    const order = await getOrder(orderId);
    if (order) {
      const allHeadshots = await getGeneratedHeadshots(orderId);
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
      
      await sendHeadshotsReadyEmail(
        order.email,
        `${baseUrl}/dashboard?order=${orderId}`,
        allHeadshots.length
      );

      console.log("Order complete, email sent:", orderId);
    }
  }
}

// Health check
export async function GET() {
  return NextResponse.json({ 
    status: "ok", 
    service: "replicate-webhook",
    timestamp: new Date().toISOString(),
  });
}
