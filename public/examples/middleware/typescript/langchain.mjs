import { createAgent } from 'langchain';
import { withCavemanAgent } from '@caveman-ai/middleware/langchain';
export async function run({ model, tools, messages, runtime, scope }) {
  await runtime.ready();
  const agent = createAgent(withCavemanAgent({ model, tools }, { runtime, scope }));
  return agent.invoke({ messages }, { recursionLimit: 12 });
}
