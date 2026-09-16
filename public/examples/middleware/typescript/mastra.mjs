import { withCavemanMastra } from '@caveman-ai/middleware/mastra';
export async function run({ agent, messages, runtime, scope }) {
  await runtime.ready();
  const wrapped = withCavemanMastra(agent, { runtime, scope });
  return wrapped.generate(messages, { maxSteps: 4 });
}
