import { withCavemanOpenAITools } from '@caveman-ai/middleware/openai';
export async function run({ client, fetch, model, messages, runtime, scope }) {
  await runtime.ready();
  const loop = withCavemanOpenAITools(client, {
    runtime, scope, fetch, protocol: 'openai-chat', tools: [], functions: {},
  });
  const history = structuredClone(messages);
  for (let step = 0; step < 4; step++) {
    const response = await loop.client.chat.completions.create({ model, messages: history, tools: loop.tools });
    const message = response.choices[0].message;
    history.push(message);
    if (!message.tool_calls?.length) return response;
    for (const call of message.tool_calls) {
      if (call.type !== 'function') throw new Error('Unsupported tool call');
      const output = await loop.functions[call.function.name](JSON.parse(call.function.arguments));
      history.push({ role: 'tool', tool_call_id: call.id, content: JSON.stringify(output) });
    }
  }
  throw new Error('Tool step limit reached');
}
