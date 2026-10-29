import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import ts from 'typescript';

const js = ts.transpileModule(readFileSync(new URL('../lib/markdown-source.ts', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText;
const { toMarkdown } = await import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`);

/* Lines outside code fences that start with four or more spaces after a blank
 * line: plain Markdown reads each of those as an indented code block. */
function indentedCode(markdown) {
  const hits = [];
  let fence = null;
  let previousBlank = true;
  for (const line of markdown.split('\n')) {
    const marker = /^\s*(`{3,}|~{3,})/.exec(line)?.[1];
    if (fence) {
      if (marker && marker[0] === fence[0] && marker.length >= fence.length && line.trim() === marker) fence = null;
      continue;
    }
    if (marker) fence = marker;
    else if (previousBlank && /^ {4,}\S/.test(line)) hits.push(line);
    previousBlank = line.trim() === '';
  }
  return hits;
}

test('keeps top-level code fences byte for byte, JSX-looking text included', () => {
  const code = [
    '````tsx',
    'import { Card } from "x";',
    'export const value = <Note>not a callout</Note>;',
    '<Steps>',
    '{/* not a comment either */}',
    '```',
    '````',
  ].join('\n');
  assert.equal(toMarkdown(code), code);
  assert.equal(toMarkdown('Before.\n\n' + code + '\n\nAfter.'), 'Before.\n\n' + code + '\n\nAfter.');
});

test('keeps blank lines inside code while collapsing them outside', () => {
  const code = '```text\na\n\n\n\nb\n```';
  assert.equal(toMarkdown('One.\n\n\n\n' + code), 'One.\n\n' + code);
});

test('turns a card group into a link list with each card\'s text', () => {
  const result = toMarkdown([
    '<CardGroup cols={2}>',
    '  <Card title="Quickstart" icon="rocket" href="/quickstart">',
    '    Send your first request',
    '    in minutes.',
    '  </Card>',
    '',
    '  <Card title="No link" icon="plug">',
    '    Read this.',
    '  </Card>',
    '  <Card title="Bare" href="/bare" />',
    '</CardGroup>',
  ].join('\n'));
  assert.equal(result, [
    '- [Quickstart](/quickstart): Send your first request in minutes.',
    '- **No link**: Read this.',
    '- [Bare](/bare)',
  ].join('\n'));
});

test('numbers steps and dedents fences inside them so none becomes an indented code block', () => {
  const source = [
    '<Steps>',
    '  <Step title="Install the CLI">',
    '    ```bash',
    '    npm install -g @caveman-ai/cli',
    '      indented continuation',
    '    ```',
    '',
    '    Then verify it.',
    '  </Step>',
    '  <Step title="Configure">',
    '    <CodeGroup>',
    '',
    '    ```ts TypeScript',
    '    const client = new OpenAI({',
    '      baseURL: "<gateway>",',
    '    });',
    '    ```',
    '',
    '    ```python Python',
    '    client = OpenAI()',
    '    ```',
    '',
    '    </CodeGroup>',
    '  </Step>',
    '</Steps>',
  ].join('\n');
  const result = toMarkdown(source);
  assert.equal(result, [
    '**Step 1: Install the CLI**',
    '',
    '```bash',
    'npm install -g @caveman-ai/cli',
    '  indented continuation',
    '```',
    '',
    'Then verify it.',
    '',
    '**Step 2: Configure**',
    '',
    '```ts TypeScript',
    'const client = new OpenAI({',
    '  baseURL: "<gateway>",',
    '});',
    '```',
    '',
    '```python Python',
    'client = OpenAI()',
    '```',
  ].join('\n'));
  assert.deepEqual(indentedCode(result), []);
});

test('dedents six-space nesting: a callout inside a step inside tabs', () => {
  const source = [
    '<Tabs>',
    '  <Tab title="Docker">',
    '    <Steps>',
    '      <Step title="Run it">',
    '        Start the container.',
    '',
    '        <Warning>',
    '          Bind to loopback.',
    '',
    '          ```bash',
    '          docker run -p 127.0.0.1:8787:8787 caveman',
    '          ```',
    '        </Warning>',
    '      </Step>',
    '    </Steps>',
    '  </Tab>',
    '  <Tab title="Kubernetes">',
    '    - one',
    '      - nested',
    '  </Tab>',
    '</Tabs>',
  ].join('\n');
  const result = toMarkdown(source);
  assert.equal(result, [
    '**Docker**',
    '',
    '**Step 1: Run it**',
    '',
    'Start the container.',
    '',
    '> **Warning:** Bind to loopback.',
    '>',
    '> ```bash',
    '> docker run -p 127.0.0.1:8787:8787 caveman',
    '> ```',
    '',
    '**Kubernetes**',
    '',
    '- one',
    '  - nested',
  ].join('\n'));
  assert.deepEqual(indentedCode(result), []);
});

test('accordions become bold titles over their body', () => {
  const result = toMarkdown([
    '<AccordionGroup>',
    '  <Accordion title="Does Caveman add latency?">',
    '    No.',
    '',
    '    See [How it works](/concepts/how-it-works).',
    '  </Accordion>',
    '  <Accordion title="What if it is down?">',
    '    Requests pass through.',
    '  </Accordion>',
    '</AccordionGroup>',
  ].join('\n'));
  assert.equal(result, [
    '**Does Caveman add latency?**',
    '',
    'No.',
    '',
    'See [How it works](/concepts/how-it-works).',
    '',
    '**What if it is down?**',
    '',
    'Requests pass through.',
  ].join('\n'));
});

test('every callout is a blockquote with a bold label', () => {
  for (const name of ['Note', 'Tip', 'Info', 'Warning', 'Check', 'Danger']) {
    assert.equal(toMarkdown(`<${name}>\n  Keep the key secret.\n</${name}>`), `> **${name}:** Keep the key secret.`);
    assert.equal(toMarkdown(`<${name}>One line.</${name}>`), `> **${name}:** One line.`);
  }
  assert.equal(
    toMarkdown('<Note>\n  - first\n  - second\n</Note>'),
    '> **Note**\n>\n> - first\n> - second',
  );
});

test('removes JSX comments, single and multi-line, but not inside code', () => {
  const result = toMarkdown([
    'Kept. {/* inline note */}',
    '{/* whole line */}',
    '{/*',
    '  spanning',
    '*/}',
    '```js',
    '{/* code */}',
    '```',
  ].join('\n'));
  assert.equal(result, 'Kept.\n```js\n{/* code */}\n```');
});

test('drops top-level ESM but keeps prose, tables and unknown components\' text', () => {
  const result = toMarkdown([
    'import Snippet from "/snippets/x.mdx";',
    'export const meta = {',
    '  a: 1,',
    '};',
    '',
    '| Header | `<Cave key>` |',
    '| --- | --- |',
    '',
    '<Frame caption="Diagram">',
    '  The request path.',
    '</Frame>',
    '',
    '<Expandable title="Fields">',
    '  `id`: the key.',
    '</Expandable>',
  ].join('\n'));
  assert.equal(result, [
    '| Header | `<Cave key>` |',
    '| --- | --- |',
    '',
    'The request path.',
    '',
    '**Fields**',
    '',
    '`id`: the key.',
  ].join('\n'));
});

test('every page in docs.json converts with no component tags or indented code left over', () => {
  const docs = JSON.parse(readFileSync(new URL('../docs.json', import.meta.url), 'utf8'));
  const slugs = [];
  const walk = (group) => group.pages.forEach((p) => (typeof p === 'string' ? slugs.push(p) : walk(p)));
  for (const product of docs.navigation.products) {
    for (const tab of product.tabs ?? [{ groups: product.groups ?? [] }]) tab.groups.forEach(walk);
  }
  assert.ok(slugs.length > 0);
  for (const slug of slugs) {
    const source = readFileSync(new URL(`../${slug}.mdx`, import.meta.url), 'utf8').replace(/^---\n[\s\S]*?\n---\n?/, '');
    const markdown = toMarkdown(source);
    const outside = markdown.replace(/^(\s*(?:> )?)(`{3,}|~{3,})[^\n]*\n[\s\S]*?^\s*(?:> )?\2\s*$/gm, '');
    assert.doesNotMatch(outside, /^\s*<\/?(?:Card|CardGroup|Steps?|Accordion|AccordionGroup|Tabs?|CodeGroup|Note|Tip|Info|Warning|Check|Danger)\b/m, slug);
    assert.deepEqual(indentedCode(markdown), [], slug);
    // Top-level fences survive byte for byte.
    for (const block of source.match(/^(`{3,})[^\n]*\n[\s\S]*?^\1\s*$/gm) ?? []) {
      assert.ok(markdown.includes(block), `${slug}: a top-level code fence changed`);
    }
  }
});
