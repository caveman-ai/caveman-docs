import { randomUUID } from "node:crypto";
import { createOpenAI } from "@ai-sdk/openai";
import { jsonSchema, stepCountIs, streamText, tool } from "ai";
import { createMiddlewareRuntime } from "@caveman-ai/sdk/middleware";
import { withCaveman } from "@caveman-ai/middleware/ai-sdk";

const mode = process.env.CAVE_MODE ?? "record";
if (mode !== "off" && mode !== "record" && mode !== "compress") {
  throw new Error("CAVE_MODE must be off, record, or compress");
}
if (!process.env.OPENAI_API_KEY || !process.env.CAVE_MODEL) {
  throw new Error("Set OPENAI_API_KEY and CAVE_MODEL before running");
}
const runtime = createMiddlewareRuntime({
  endpoint: process.env.CAVE_RUNTIME_URL ?? "http://127.0.0.1:8787",
  mode,
  deadlineMs: 2000,
  onReport: report => console.error("Caveman:", JSON.stringify(report)),
});
const openai = createOpenAI({ baseURL: process.env.OPENAI_BASE_URL });
const deploymentLog = Array.from({ length: 400 }, (_, i) =>
  `2026-09-16T10:00:00Z INFO worker=${i} health check passed`,
).join("\n") + "\n2026-09-16T10:01:00Z ERROR deployment failed: missing DATABASE_URL";
const scope = {
  namespace: "vercel-ai-sdk-demo",
  session_id: randomUUID(),
  branch_id: "main",
  cache_epoch: "0",
};

try {
  if (mode !== "off") await runtime.ready();
  const options = {
    model: openai.chat(process.env.CAVE_MODEL),
    prompt: "Read the deployment log. Explain the failure in one sentence. Recover the original if needed.",
    tools: {
      readDeploymentLog: tool({
        description: "Read the deployment log.",
        inputSchema: jsonSchema<Record<string, never>>({
          type: "object", properties: {}, additionalProperties: false,
        }),
        execute: async () => deploymentLog,
      }),
    },
    stopWhen: stepCountIs(5),
  };
  const result = streamText(withCaveman(options, { runtime, scope }));
  for await (const chunk of result.textStream) process.stdout.write(chunk);
  process.stdout.write("\n");
  // The native tool result remains the original, even if its outbound copy shrinks.
  const source = (await result.steps).flatMap(step => step.toolResults)
    .find(part => part.toolName === "readDeploymentLog");
  if (!source || source.output !== deploymentLog) {
    throw new Error("The example did not preserve its original tool result");
  }
  console.error("Original tool result preserved.");
  console.error("Provider usage:", JSON.stringify(await result.totalUsage));
} finally {
  runtime.close(); // The stream and any recovery calls have finished.
}
