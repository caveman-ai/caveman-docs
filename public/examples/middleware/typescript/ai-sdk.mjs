import { generateText, stepCountIs } from 'ai';
import { withCaveman } from '@caveman-ai/middleware/ai-sdk';
export async function run({ model, tools, messages, runtime, scope }) {
  await runtime.ready();
  return generateText({
    ...withCaveman({ model, tools }, { runtime, scope }),
    messages, stopWhen: stepCountIs(4), maxRetries: 0,
  });
}
