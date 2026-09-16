#!/usr/bin/env node
// Run against a dev or production server: node scripts/check-adoption-pages.mjs URL
import assert from 'node:assert/strict';

const origin = new URL(process.argv[2] ?? 'http://127.0.0.1:3010');
async function get(path) {
  const response = await fetch(new URL(path, origin));
  assert.equal(response.status, 200, path);
  return response.text();
}
const home = await get('/');
const coding = home.indexOf('Optimize your coding agent');
const app = home.indexOf('Optimize your existing app');
const build = home.indexOf('Build a new agent');
assert.ok(coding > 0 && coding < app && app < build, 'Entry paths must prioritize existing agents.');
const index = JSON.parse(await get('/llms-index.json'));
assert.equal(new Set(index.pages.map(page => page.slug)).size, index.pages.length, 'Duplicate navigation slugs');
const machineSurfaces = await Promise.all(['/llms.txt', '/llms-full.txt', '/sitemap.xml'].map(get));
for (const slug of ['quickstart', 'integrations', 'sdk/middleware/vercel-ai-sdk']) {
  const path = `/docs/${slug}`;
  const html = await get(path);
  const markdown = await get(`${path}.md`);
  assert.match(html, /<h1\b/);
  assert.match(html, /TechArticle/);
  assert.match(html, /BreadcrumbList/);
  assert.match(markdown, /^---\n/);
  assert.ok(index.pages.some(page => page.slug === slug), `Missing index: ${slug}`);
  for (const surface of machineSurfaces) assert.ok(surface.includes(path), `Missing machine link: ${slug}`);
  const entry = index.pages.find(page => page.slug === slug);
  for (const heading of entry.headings) {
    assert.ok(html.includes(`id="${heading.anchor}"`), `Missing rendered anchor: ${slug}#${heading.anchor}`);
  }
  const negotiated = await fetch(new URL(path, origin), {
    headers: { Accept: 'text/markdown' }, redirect: 'manual',
  });
  assert.equal(negotiated.status, 303, `Markdown negotiation: ${slug}`);
  assert.ok(negotiated.headers.get('location').endsWith(`${path}.md`));
  assert.match(negotiated.headers.get('cache-control'), /no-store/);
  console.log(`PASS ${path}: HTML, Markdown, 303 negotiation, structured data, anchors, and indexes.`);
}
const markdown = await get('/docs/sdk/middleware/vercel-ai-sdk.md');
const example = await get('/examples/vercel-ai-sdk/demo.mts');
assert.equal(/^```ts\n([\s\S]*?)^```/m.exec(markdown)?.[1], example,
  'Markdown must preserve the exact downloadable example.');
for (const file of ['package.json', 'package-lock.json', 'verify.mjs']) {
  await get(`/examples/vercel-ai-sdk/${file}`);
}
console.log('PASS downloadable example matches Markdown; all example files reachable.');
