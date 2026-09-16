import assert from 'node:assert/strict';
import { createHash, randomUUID } from 'node:crypto';
import { generateText, stepCountIs, tool, jsonSchema, type ModelMessage } from 'ai';
import { MockLanguageModelV4 } from 'ai/test';
import { MiddlewareRuntime, type CallReport } from '@caveman-ai/sdk/middleware';
import { withCaveman } from '@caveman-ai/middleware/ai-sdk';

const mode = process.env.DEMO_MODE ?? 'record';
if (mode !== 'off' && mode !== 'record' && mode !== 'compress') throw new Error('Invalid DEMO_MODE');
const paid = process.env.PAID_PROVIDER === '1';
const original = Array.from({ length: 800 }, (_, i) =>
  `[INFO] worker=alpha request=${i} status=healthy latency_ms=12 café 🌍\r\n`).join('');
const reports: CallReport[] = [];
const runtime = new MiddlewareRuntime({
  endpoint: process.env.CAVEMAN_ENDPOINT ?? 'http://127.0.0.1:8787',
  token: process.env.CAVEMAN_AUTH_TOKEN,
  mode, deadlineMs: 500, retrieveDeadlineMs: 5000,
  onReport: report => { reports.push(report); console.log(JSON.stringify(report)); },
});
// Use authenticated account + conversation IDs in an application. Never share this across users.
const scope = { namespace: 'docs-demo', session_id: randomUUID(), branch_id: 'main', cache_epoch: '1' };
const messages: ModelMessage[] = [
  { role: 'user', content: 'Read the log. Recover all original pages if shortened, then summarize its status.' },
  { role: 'assistant', content: [{ type: 'tool-call', toolCallId: 'read-1', toolName: 'read_log', input: {} }] },
  { role: 'tool', content: [{ type: 'tool-result', toolCallId: 'read-1', toolName: 'read_log', output: { type: 'text', value: original } }] },
];
const before = structuredClone(messages);
let handle: string | undefined;
let recoveryCalls = 0;
const scripted = new MockLanguageModelV4({
  doGenerate: async ({ prompt }) => {
    const text = JSON.stringify(prompt);
    handle ??= text.match(/cmw_[a-f0-9]{48}/)?.[0];
    const recovered = prompt.some(m => m.role === 'tool' && m.content.some(p => p.type === 'tool-result' && p.toolName === 'caveman_retrieve'));
    const recover = handle && !recovered;
    if (recover) recoveryCalls++;
    return {
      content: recover
        ? [{ type: 'tool-call', toolCallId: 'recover-1', toolName: 'caveman_retrieve', input: JSON.stringify({ handle, limit: 262144 }) }]
        : [{ type: 'text', text: 'Deterministic fixture completed.' }],
      finishReason: { unified: recover ? 'tool-calls' : 'stop', raw: recover ? 'tool_calls' : 'stop' },
      // Synthetic fixture counts; these are not provider usage or savings.
      usage: { inputTokens: { total: 0, noCache: 0, cacheRead: 0, cacheWrite: 0 }, outputTokens: { total: 0, text: 0, reasoning: 0 } }, warnings: [],
    };
  },
});
try {
  if (mode !== 'off') { const c = await runtime.ready(); console.log('capabilities', { mode: c.mode, persistent: c.persistent, recovery: c.recovery, retention_seconds: c.retention_seconds }); }
  let model: import('@ai-sdk/provider').LanguageModelV4 = scripted;
  if (paid) {
    if (!process.env.OPENAI_API_KEY || !process.env.OPENAI_MODEL) throw new Error('Set OPENAI_API_KEY and OPENAI_MODEL for paid run');
    const { openai } = await import('@ai-sdk/openai');
    model = openai(process.env.OPENAI_MODEL);
  }
  const started = performance.now();
  const result = await generateText({
    ...withCaveman({ model, tools: { read_log: tool({ description: 'Read demo worker log.', inputSchema: jsonSchema({ type: 'object', properties: {}, additionalProperties: false }), execute: async () => original }) } }, { runtime, scope }),
    messages, stopWhen: stepCountIs(4), maxRetries: 0,
  });
  assert.deepEqual(messages, before, 'Application history must keep original bytes');
  if (!paid && mode === 'off') assert(reports.some(r => r.status === 'disabled'));
  if (!paid && mode === 'record') assert(reports.some(r => r.status === 'recorded'));
  if (!paid && mode === 'compress') {
    assert(reports.some(r => r.status === 'applied' || r.status === 'reused'), 'Expected compression; inspect reports');
    assert.equal(recoveryCalls, 1, 'Native loop must execute recovery');
    assert(handle);
    let offset: number | null = 0, restored = '';
    do {
      const page = await runtime.retrieve(scope, { handle, offset, limit: 4096 });
      assert.equal(page.kind, 'original_page');
      restored += page.text;
      offset = page.next_offset;
    } while (offset !== null);
    assert.equal(restored, original, 'All exact pages must reconstruct original');
    console.log('exact recovery SHA-256', createHash('sha256').update(restored).digest('hex'));
  }
  console.log({ text: result.text, elapsedMs: Math.round(performance.now() - started), usage: paid ? result.totalUsage : 'synthetic; not provider usage', unchangedHistory: true });
} finally { runtime.close(); }
