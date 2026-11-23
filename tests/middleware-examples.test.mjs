import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

/* Pages tell readers to download runnable examples from this site, for
 * example `curl -fsSLo quickstart.ts https://docs.caveman.so/examples/...`.
 * Every such URL must be a file in public/, or the page ships a 404. */
const docs = JSON.parse(readFileSync(new URL('../docs.json', import.meta.url), 'utf8'));
const slugs = [];
const walk = (group) => group.pages.forEach((p) => (typeof p === 'string' ? slugs.push(p) : walk(p)));
for (const product of docs.navigation.products) {
  for (const tab of product.tabs ?? [{ groups: product.groups ?? [] }]) tab.groups.forEach(walk);
}
const pages = slugs.map((slug) => ({ slug, source: readFileSync(new URL(`../${slug}.mdx`, import.meta.url), 'utf8') }));
const EXAMPLE = /(?:https:\/\/docs\.caveman\.so|\]\(|["'(\s])(\/examples\/[^\s)"'`]+)/g;

test('every downloadable example a page links to exists in public/examples', () => {
  let count = 0;
  for (const { slug, source } of pages) {
    for (const m of source.matchAll(EXAMPLE)) {
      count++;
      assert.ok(existsSync(new URL(`../public${m[1]}`, import.meta.url)), `${slug}.mdx links ${m[1]}, which is not in public/`);
    }
  }
  assert.ok(count > 0, 'expected at least one example link; update this test if pages stopped linking examples');
});

test('the middleware page links both runnable quickstarts', () => {
  const page = pages.find((p) => p.slug === 'caveman/middleware');
  assert.ok(page, 'caveman/middleware is in docs.json');
  for (const file of ['quickstart.ts', 'quickstart.py']) {
    assert.ok(page.source.includes(`https://docs.caveman.so/examples/middleware/${file}`), file);
    assert.ok(readFileSync(new URL(`../public/examples/middleware/${file}`, import.meta.url), 'utf8').trim().length > 0, file);
  }
});
