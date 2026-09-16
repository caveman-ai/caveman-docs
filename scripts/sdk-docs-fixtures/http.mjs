// Deterministic HTTP fixture for published documentation examples. No live traffic.
import assert from 'node:assert/strict';
const originalFetch = globalThis.fetch;
const seen = [];
globalThis.fetch = async (input, init) => {
  const request = input instanceof Request ? input : new Request(input, init);
  const url = new URL(request.url);
  assert.equal(url.origin, 'https://sdk.fixture.invalid');
  const body = request.method === 'GET' ? {} : await request.json();
  assert.ok(request.headers.get('authorization') === 'Bearer fixture-key' || request.headers.get('x-cave-api-key') === 'fixture-key');
  seen.push(url.pathname);
  let data;
  switch (url.pathname) {
    case '/sdk/v1/compress':
      assert.equal(typeof body.input, 'string');
      data = { output: 'compressed fixture', tokens_before: 100, tokens_after: 25, token_count_basis: 'fixture', content_type: body.content_type, ratio: 0.75, recovery_handle: 'fixture-handle' }; break;
    case '/sdk/v1/tool-search':
      assert.equal(body.tools[0].name, 'lookup_status');
      assert.equal(body.max_tools, 1);
      assert.equal(body.tools[0].handler, undefined);
      data = { tools: [body.tools[0]], session_id: 'fixture-session', sent_schema_tokens: 20, full_schema_tokens: 100, deferred_count: 0, token_basis: 'fixture', method: 'fixture' }; break;
    case '/sdk/v1/context/pack':
      assert.equal(body.options.max_tokens, 4096);
      data = { items: body.items.slice(0, 2), deferred_ids: ['older'], tokens_used: 30, tokens_before: 50, tokens_saved: 20, deferred_count: 1 }; break;
    case '/sdk/v1/checkpoints':
      assert.equal(body.messages[0].content, 'Remember incident INC-42.');
      data = { source_ref: 'fixture-checkpoint' }; break;
    case '/sdk/v1/checkpoints/fixture-checkpoint/expand':
      assert.equal(request.method, 'GET');
      data = { source_ref: 'fixture-checkpoint', messages: [{ role: 'user', content: 'Remember incident INC-42.' }] }; break;
    case '/sdk/v1/artifacts':
      assert.equal(body.value.incident, 'INC-42');
      data = { stored: true, artifact_id: 'fixture-artifact' }; break;
    case '/sdk/v1/events':
      assert.equal(body.name, 'lookup_status');
      assert.ok(request.headers.get('x-cave-trace-id'));
      data = { ok: true }; break;
    case '/v1/traces':
      assert.ok(body.resourceSpans[0].scopeSpans[0].spans.length);
      data = { ok: true }; break;
    case '/sdk/v1/runtime-policy':
      data = {}; break; // An invalid bundle must preserve a safe baseline.
    case '/openai/v1/responses':
    case '/openai/v1/chat/completions':
    case '/anthropic/v1/messages':
      assert.equal(typeof body.model, 'string');
      if (body.tools) {
        assert.equal(body.tools[0].parameters.type, 'object');
        assert.equal(request.headers.get('x-cave-tool-session'), 'fixture-session');
      }
      if (body.stream) return new Response('data: {"type":"response.completed"}\n\n', { headers: { 'content-type': 'text/event-stream' } });
      data = { id: 'fixture-response', output: [], usage: { input_tokens: 10, output_tokens: 5 } }; break;
    default: throw new Error(`Unexpected documentation request: ${request.method} ${url.pathname}`);
  }
  return Response.json(data);
};
process.on('beforeExit', () => {
  globalThis.fetch = originalFetch;
  console.error(`fixture requests: ${seen.length}`);
});
