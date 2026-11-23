import { withCavemanAnthropic } from '@caveman-ai/middleware/anthropic';
export async function run({ client, fetch, model, messages, runtime, scope }) {
  await runtime.ready();
  const wrapped = withCavemanAnthropic(client, { runtime, scope, fetch });
  return wrapped.messages.create({ model, max_tokens: 512, messages });
}
