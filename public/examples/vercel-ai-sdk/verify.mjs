import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

// Real Caveman runtime, deterministic local provider. No provider key or spend.
const endpoint = process.env.CAVE_RUNTIME_URL ?? 'http://127.0.0.1:8787';
assert.ok(['127.0.0.1', 'localhost', '[::1]'].includes(new URL(endpoint).hostname),
  'The local check requires a loopback Caveman runtime.');
const original = Array.from({ length: 400 }, (_, i) =>
  `2026-09-16T10:00:00Z INFO worker=${i} health check passed`,
).join('\n') + '\n2026-09-16T10:01:00Z ERROR deployment failed: missing DATABASE_URL';
const answer = 'Deployment failed because DATABASE_URL was missing.';
let mode, observed, recovered;
const server = createServer(async (req, res) => {
  try {
    assert.equal(req.url, '/v1/chat/completions');
    let raw = ''; for await (const chunk of req) raw += chunk;
    const body = JSON.parse(raw);
    const results = body.messages.filter(message => message.role === 'tool');
    let delta, finish;
    if (results.length === 0) {
      delta = { tool_calls: [{ index: 0, id: 'read-log', type: 'function',
        function: { name: 'readDeploymentLog', arguments: '{}' } }] };
      finish = 'tool_calls';
    } else if (results.at(-1).tool_call_id === 'read-log') {
      observed = results.at(-1).content;
      const handle = observed.match(/cmw_[a-f0-9]{48}/)?.[0];
      if (mode === 'compress') {
        assert.ok(handle, 'No recovery marker: check runtime mode, readiness, and Caveman reports.');
        assert.ok(observed.length < original.length, 'Outbound tool result did not shrink.');
        delta = { tool_calls: [{ index: 0, id: 'recover-log', type: 'function',
          function: { name: 'caveman_retrieve', arguments: JSON.stringify({ handle, limit: 262144 }) } }] };
        finish = 'tool_calls';
      } else {
        assert.equal(observed, original, `${mode} changed outbound tool text`);
        delta = { content: answer }; finish = 'stop';
      }
    } else {
      const recovery = JSON.parse(results.at(-1).content);
      assert.equal(recovery.text, original);
      assert.equal(recovery.complete, true);
      recovered = true;
      delta = { content: answer }; finish = 'stop';
    }
    res.writeHead(200, { 'Content-Type': 'text/event-stream' });
    const chunk = value => res.write(`data: ${JSON.stringify({ id: 'local-fixture',
      object: 'chat.completion.chunk', created: 0, model: 'fixture', ...value })}\n\n`);
    chunk({ choices: [{ index: 0, delta: { role: 'assistant', ...delta }, finish_reason: null }] });
    chunk({ choices: [{ index: 0, delta: {}, finish_reason: finish }] });
    res.end('data: [DONE]\n\n');
  } catch (error) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: { message: error.message, type: 'fixture_failure' } }));
  }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
try {
  for (mode of ['off', 'record', 'compress']) {
    observed = undefined; recovered = false;
    const child = spawn(process.execPath, ['--experimental-strip-types', 'demo.mts'], {
      cwd: fileURLToPath(new URL('.', import.meta.url)),
      env: { ...process.env, OPENAI_API_KEY: 'local-fixture-only', CAVE_MODEL: 'fixture',
        OPENAI_BASE_URL: `http://127.0.0.1:${server.address().port}/v1`,
        CAVE_RUNTIME_URL: endpoint, CAVE_MODE: mode },
    });
    let stdout = '', stderr = '';
    child.stdout.on('data', chunk => { stdout += chunk; });
    child.stderr.on('data', chunk => { stderr += chunk; });
    const timeout = setTimeout(() => child.kill('SIGTERM'), 30000);
    const code = await new Promise((resolve, reject) => {
      child.on('error', reject); child.on('close', resolve);
    });
    clearTimeout(timeout);
    assert.equal(code, 0, stderr);
    assert.equal(stdout.trim(), answer, stderr);
    assert.match(stderr, /Original tool result preserved/);
    const status = mode === 'off' ? 'disabled' : mode === 'record' ? 'recorded' : 'applied';
    assert.ok(stderr.includes(`"status":"${status}"`), stderr);
    if (mode === 'compress') assert.ok(recovered, 'Native tool loop did not recover the original.');
    console.log(`PASS ${mode}: ${status}; original tool result preserved; streaming completed${recovered ? '; exact recovery passed' : ''}.`);
  }
  console.log('Local mechanism proof only. Provider responses are fixtures; no live model quality or billing claim.');
} finally {
  server.closeAllConnections();
  await new Promise(resolve => server.close(resolve));
}
