#!/usr/bin/env node
/* ==========================================================================
 *  Check a running site end to end: every page, its Markdown twin, the
 *  machine indexes and the redirects. Run against `npm run dev`, `npm start`
 *  or a deployment:
 *
 *    node scripts/check-site.mjs                      # http://127.0.0.1:3010
 *    node scripts/check-site.mjs https://docs.caveman.so
 *
 *  Reads the page list from /llms-index.json, so it covers whatever docs.json
 *  lists, and compares each Markdown twin's code with the local source.
 * ======================================================================== */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const origin = new URL(process.argv[2] ?? 'http://127.0.0.1:3010');

async function get(path, init) {
  const response = await fetch(new URL(path, origin), init);
  assert.equal(response.status, 200, `${path}: HTTP ${response.status}`);
  return { text: await response.text(), headers: response.headers };
}

const index = JSON.parse((await get('/llms-index.json')).text);
const [llms, full, sitemap] = (await Promise.all(['/llms.txt', '/llms-full.txt', '/sitemap.xml'].map((p) => get(p)))).map((r) => r.text);
assert.equal(new Set(index.pages.map((p) => p.url)).size, index.pages.length, 'Duplicate page URLs in llms-index.json');

const home = await get('/');
assert.match(home.text, /<h1\b/, 'Home page has no h1');
const homeTwin = await get('/index.md');
assert.match(homeTwin.text, /^---\n/, '/index.md has no front matter');
for (const page of index.pages) assert.ok(homeTwin.text.includes(page.markdown), `/index.md does not list ${page.markdown}`);
console.log('PASS /, /index.md');

/* Top-level fences, the ones the mirror must copy byte for byte. */
const fences = (source) => source.match(/^(`{3,})[^\n]*\n[\s\S]*?^\1\s*$/gm) ?? [];

async function check(page) {
  const path = new URL(page.url).pathname;
  const { text: html } = await get(path);
  const { text: md, headers } = await get(`${path}.md`);

  assert.equal((html.match(/<h1\b/g) ?? []).length, 1, `${path}: expected one h1`);
  assert.ok(html.includes(`rel="canonical" href="${page.url}"`), `${path}: canonical is not ${page.url}`);
  assert.ok(html.includes(page.markdown), `${path}: the Markdown twin is not announced`);
  assert.match(html, /"@type":"TechArticle"/, `${path}: no TechArticle`);
  assert.match(html, /"@type":"BreadcrumbList"/, `${path}: no BreadcrumbList`);
  for (const heading of page.headings) {
    assert.ok(html.includes(`id="${heading.id}"`), `${path}: no rendered anchor #${heading.id}`);
  }

  assert.match(headers.get('content-type') ?? '', /text\/markdown/, `${path}.md: not text/markdown`);
  assert.match(md, /^---\n/, `${path}.md: no front matter`);
  assert.ok(md.includes(`canonical: ${page.url}`), `${path}.md: wrong canonical`);
  const source = readFileSync(new URL(`../${page.source}`, import.meta.url), 'utf8');
  for (const block of fences(source)) assert.ok(md.includes(block), `${path}.md: a code block differs from ${page.source}`);

  assert.ok(sitemap.includes(`<loc>${page.url}</loc>`), `${path}: missing from sitemap.xml`);
  assert.ok(llms.includes(`(${page.markdown})`), `${path}: missing from llms.txt`);
  assert.ok(full.includes(`canonical: ${page.url}`), `${path}: missing from llms-full.txt`);

  const negotiated = await fetch(new URL(path, origin), { headers: { Accept: 'text/markdown' }, redirect: 'manual' });
  assert.equal(negotiated.status, 303, `${path}: Accept: text/markdown did not 303`);
  assert.ok(negotiated.headers.get('location')?.endsWith(`${path}.md`), `${path}: 303 does not point at the twin`);
  assert.match(negotiated.headers.get('cache-control') ?? '', /no-store/, `${path}: 303 is cacheable`);
  return page.headings.length;
}

let anchors = 0;
const queue = [...index.pages];
await Promise.all(
  Array.from({ length: 4 }, async () => {
    for (let page = queue.shift(); page; page = queue.shift()) {
      // Await first, then add: `anchors += await x` reads the total before the
      // await, so concurrent workers would overwrite each other's counts.
      const checked = await check(page);
      anchors += checked;
    }
  }),
);
console.log(`PASS ${index.pages.length} pages: HTML, Markdown twin, 303 negotiation, structured data, ${anchors} anchors, indexes.`);

/* Old URLs that caveman.so and the Mintlify site published. */
const REDIRECTS = [
  ['/index', '/cloud'],
  ['/caveman/index', '/caveman'],
  ['/docs', '/'],
  ['/docs/skill', '/caveman/skills'],
  ['/docs/proxy/recoverable', '/caveman/context-recovery'],
  ['/docs/skill.md', '/caveman/skills.md'],
  ['/docs/agent-sdk/run', '/'],
];
for (const [from, to] of REDIRECTS) {
  const response = await fetch(new URL(from, origin), { redirect: 'manual' });
  assert.equal(response.status, 308, `${from}: expected a permanent redirect, got ${response.status}`);
  assert.equal(new URL(response.headers.get('location') ?? '', origin).pathname, to, `${from}: redirects to the wrong place`);
}
console.log(`PASS ${REDIRECTS.length} legacy redirects.`);
