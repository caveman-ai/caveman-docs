import { Agent } from '@strands-agents/sdk';
import { withCavemanStrands } from '@caveman-ai/middleware/strands';
export async function run({ model, tools, prompt, runtime, scope }) {
  await runtime.ready();
  const agent = new Agent(withCavemanStrands({ model, tools }, { runtime, scope }));
  return agent.invoke(prompt);
}
