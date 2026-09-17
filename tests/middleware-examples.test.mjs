import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
// The TypeScript quickstart is embedded in the middleware overview; Python has
// its own page. Both must carry the downloadable file byte for byte.
for (const [language, extension, fence, slug] of [
  ['typescript', 'ts', 'ts', 'sdk/middleware'],
  ['python', 'py', 'python', 'sdk/middleware/python'],
]) {
  test(`${language} downloadable middleware source matches the rendered guide`, () => {
    const source = readFileSync(`public/examples/middleware/quickstart.${extension}`, 'utf8').trim();
    const page = readFileSync(`app/docs/${slug}/page.mdx`, 'utf8');
    assert.ok(page.includes('```' + fence + '\n' + source + '\n```'));
  });
}
