import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
for (const [language, extension, fence] of [['typescript', 'ts', 'ts'], ['python', 'py', 'python']]) {
  test(`${language} downloadable middleware source matches the rendered guide`, () => {
    const source = readFileSync(`public/examples/middleware/quickstart.${extension}`, 'utf8').trim();
    const page = readFileSync(`app/docs/sdk/middleware/${language}/page.mdx`, 'utf8');
    assert.ok(page.includes('```' + fence + '\n' + source + '\n```'));
  });
}
