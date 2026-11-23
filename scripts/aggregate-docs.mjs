#!/usr/bin/env node
// Aggregates docs/ + docs/nav.json from every product repository in caveman-org
// (agents, caveman-code, cloud-sdk, caveman) into a single unified docs tree + llms.txt,
// enforcing a strict public-boundary gate so zero private Cloud internals can ever leak.
import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

const docsRoot = resolve(import.meta.dirname, '..');
const orgRoot = resolve(docsRoot, '..');
const outRoot = join(docsRoot, 'generated');

const SOURCES = [
  { id: 'agents', dir: join(orgRoot, 'agents/docs') },
  { id: 'caveman-code', dir: join(orgRoot, 'caveman-code/docs') },
  { id: 'cloud-sdk', dir: join(orgRoot, 'cloud-sdk/docs') },
  { id: 'caveman', dir: join(orgRoot, 'caveman/docs') },
];

// Private internal markers that MUST NEVER appear in aggregated public documentation
const FORBIDDEN_PATTERNS = [
  /cloud\/control-api\//,
  /cloud\/gateway-managed\//,
  /cloud\/computers\//,
  /cloud\/worker\//,
  /deploy\/firecracker\//,
  /deploy\/terraform\//,
  /deploy\/helm\//,
  /docs\/WHY\.md/,
  /caveman-code-app/,
  /agent-sdk-private/,
  /Caveman-Cloud/,
  /vendor\/caveman-ai-/,
  /Garry Tan|Max Kolysh|YC-APPLICATION/i,
  /cave_code_harness_secret/i,
];

rmSync(outRoot, { recursive: true, force: true });
mkdirSync(join(outRoot, 'pages'), { recursive: true });

const aggregatedProducts = [];
const allPages = [];
const boundaryViolations = [];

for (const src of SOURCES) {
  const navPath = join(src.dir, 'nav.json');
  if (!existsSync(navPath)) throw new Error(`Missing nav.json in ${src.dir}`);
  const nav = JSON.parse(readFileSync(navPath, 'utf8'));
  const productPages = [];

  for (const group of nav.groups ?? []) {
    for (const item of group.items ?? []) {
      const filePath = join(src.dir, item.file);
      if (!existsSync(filePath)) throw new Error(`Missing doc file ${filePath} referenced by ${src.id}/docs/nav.json`);
      const text = readFileSync(filePath, 'utf8');
      for (const re of FORBIDDEN_PATTERNS) {
        if (re.test(text)) {
          boundaryViolations.push({ product: src.id, file: item.file, pattern: String(re) });
        }
      }
      const destFile = join(outRoot, 'pages', `${item.slug}.md`);
      mkdirSync(dirname(destFile), { recursive: true });
      writeFileSync(destFile, `# ${item.title}\n\n> Source: ${nav.repo}/docs/${item.file}\n\n${text}`);
      productPages.push({ ...item, sourceRepo: nav.repo, sourceFile: `docs/${item.file}`, bytes: Buffer.byteLength(text) });
      allPages.push({ product: nav.label, ...item, sourceRepo: nav.repo });
    }
  }
  aggregatedProducts.push({ ...nav, pageCount: productPages.length });
}

// Also pull sanitized OpenAPI from cloud-sdk/contracts/openapi.json
const openapiSrc = join(orgRoot, 'cloud-sdk/contracts/openapi.json');
if (!existsSync(openapiSrc)) throw new Error('Missing cloud-sdk/contracts/openapi.json');
copyFileSync(openapiSrc, join(outRoot, 'openapi.json'));

if (boundaryViolations.length > 0) {
  console.error('PUBLIC BOUNDARY GATE FAILED:', JSON.stringify(boundaryViolations, null, 2));
  process.exit(1);
}

writeFileSync(join(outRoot, 'org-nav.json'), JSON.stringify({
  generatedAt: new Date().toISOString(),
  products: aggregatedProducts,
  totalPages: allPages.length,
}, null, 2) + '\n');

// Generate unified agent-readable /llms.txt across all 4 product repos
const llmsLines = [
  '# Caveman Documentation (Unified Multi-Repo Index)',
  '',
  '> Aggregated directly from each product repository\'s docs/ folder. Zero private Cloud internals.',
  '',
  ...aggregatedProducts.flatMap((p) => [
    `## ${p.label} (${p.repo})`,
    ...allPages
      .filter((pg) => pg.product === p.label)
      .map((pg) => `- [${pg.title}](https://docs.caveman.so/${pg.slug}.md): ${pg.blurb}`),
    '',
  ]),
];
writeFileSync(join(outRoot, 'llms.txt'), llmsLines.join('\n'));

console.log(JSON.stringify({
  ok: true,
  products: aggregatedProducts.map((p) => ({ product: p.product, repo: p.repo, pages: p.pageCount })),
  totalPages: allPages.length,
  openapiBytes: readFileSync(join(outRoot, 'openapi.json')).byteLength,
  boundaryViolations: 0,
}));
