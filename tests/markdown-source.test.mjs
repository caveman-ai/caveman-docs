import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import ts from 'typescript';

const js = ts.transpileModule(readFileSync(new URL('../lib/markdown-source.ts', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText;
const { toMarkdown } = await import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`);

test('preserves runnable imports, exports, JSX and nested fences inside code', () => {
  const code = '````tsx\nimport { agent } from "sdk";\nexport const value = <div>hello</div>;\n```\n````';
  assert.equal(toMarkdown('import { docMetadata } from "site";\n<DocSchema slug="x" />\n\n' + code), code);
});

test('keeps diagram meaning, note titles and card destinations without JSX', () => {
  const result = toMarkdown('<figure className="border">\n<div>Client → server → provider</div>\n<figcaption>Server owns credentials.</figcaption>\n</figure>\n<Note title="Scope expires">\nKeep originals.\n</Note>\n<Card href="/docs/agent-sdk" title="Agent SDK">\nRun an agent.\n</Card>');
  assert.match(result, /Client → server → provider/);
  assert.match(result, /Server owns credentials/);
  assert.match(result, /\*\*Scope expires\*\*/);
  assert.match(result, /\[Agent SDK\]\(\/docs\/agent-sdk\)/);
  assert.doesNotMatch(result, /<\/?(?:div|figure|figcaption|Note|Card)/);
});

test('converts facts and named diagrams to useful plain text', () => {
  const result = toMarkdown('<Facts rows={[\n  ["Package", <code key="p">@caveman-ai/agent</code>],\n]} />\n<OpenCoreBoundary />');
  assert.match(result, /Package: `@caveman-ai\/agent`/);
  assert.match(result, /Apache-2.0/);
});
