import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

test('the Vercel guide serves the exact executable example validated in isolation', () => {
  const page = readFileSync(new URL('../app/docs/sdk/middleware/vercel-ai-sdk/page.mdx', import.meta.url), 'utf8');
  const example = readFileSync(new URL('../public/examples/vercel-ai-sdk/demo.mts', import.meta.url), 'utf8');
  const block = /^```ts\n([\s\S]*?)^```/m.exec(page)?.[1];
  assert.equal(block, example, 'Copied page code must match the downloadable, executable example.');
});
