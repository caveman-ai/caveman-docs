#!/usr/bin/env node
/* ==========================================================================
 *  The publication gate. Runs before every build.
 *
 *  This site is world readable, so the check is about one thing: nothing here
 *  may describe a surface that is not public in the Caveman product registry.
 *
 *  Three refusals:
 *    1. A page declares a `capability` that is not public in
 *       content/capabilities.public.json.
 *    2. Any content names a path inside a private tree. A file path into
 *       cloud/ or db/ is a leak even when the sentence around it is harmless.
 *    3. Any content names a private-only identifier. Ambiguous words that are
 *       also plain English (gateway, proxy, worker) are exempt from the token
 *       check and are still caught by the path check.
 *
 *  Failing closed matters more than being clever here: if the manifest is
 *  missing, the build stops rather than assuming everything is public.
 * ======================================================================== */

import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const MANIFEST = join(ROOT, "content/capabilities.public.json");

if (!existsSync(MANIFEST)) {
  fail([`content/capabilities.public.json is missing. Run: node scripts/sync-capabilities.mjs <path-to>/PRODUCTS.yaml`]);
}

const manifest = JSON.parse(readFileSync(MANIFEST, "utf8"));
const publicIds = new Set(manifest.public.map((c) => c.id));

/* Private ids that are also ordinary English words. Naming one of these in a
 * sentence is not a leak; naming its path is, and rule 2 covers that. */
const AMBIGUOUS = new Set(["gateway", "proxy", "web", "worker", "database", "catalog", "metering", "deployment", "optimizer"]);
const deniedIds = manifest.privateIds.filter((id) => !AMBIGUOUS.has(id));

/* Directories that exist only in the private repository. A docs page has no
 * legitimate reason to point a reader at one. */
const PRIVATE_PATHS = [/\bcloud\/[a-z]/, /\bdb\/(schema|migrations)/, /\bdeploy\//, /\bcaveman-cloud-spec\//, /\bcloud\/web\b/];

const errors = [];

/* -- 1. every declared capability is public ------------------------------ */
const navSource = readFileSync(join(ROOT, "lib/docs-nav.ts"), "utf8");
for (const m of navSource.matchAll(/capability:\s*"([^"]+)"/g)) {
  const id = m[1];
  if (!publicIds.has(id)) {
    errors.push(`lib/docs-nav.ts declares capability "${id}", which is not public in the registry.`);
  }
}

/* -- 1b. every linked page actually exists ------------------------------- *
 * The nav is the only place that decides what is a link and what is marked
 * "soon". Without this check a typo there ships as a 404 in the sidebar, the
 * sitemap and llms.txt at once. */
for (const m of navSource.matchAll(/\{\s*title:[^}]*?slug:\s*"([^"]*)"([^}]*)\}/g)) {
  if (/soon:\s*true/.test(m[2])) continue;
  const page = join(ROOT, "app/docs", m[1], "page.mdx");
  if (!existsSync(page)) {
    errors.push(`lib/docs-nav.ts links "/docs/${m[1]}" but app/docs/${m[1]}/page.mdx does not exist.`);
  }
}

/* -- 2 and 3. scan authored content -------------------------------------- */
function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry === ".next" || entry === ".git") continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (/\.(mdx?|tsx?)$/.test(entry)) out.push(full);
  }
  return out;
}

const scanned = [...walk(join(ROOT, "app")), ...walk(join(ROOT, "lib")), ...walk(join(ROOT, "components"))].filter(
  (f) => !f.endsWith("check-public.mjs"),
);

for (const file of scanned) {
  const rel = relative(ROOT, file);
  const lines = readFileSync(file, "utf8").split("\n");
  lines.forEach((line, i) => {
    for (const re of PRIVATE_PATHS) {
      if (re.test(line)) errors.push(`${rel}:${i + 1} names a private path: ${line.trim().slice(0, 100)}`);
    }
    for (const id of deniedIds) {
      if (new RegExp(`\\b${id.replace(/[-]/g, "[-]")}\\b`).test(line)) {
        errors.push(`${rel}:${i + 1} names the private capability "${id}": ${line.trim().slice(0, 100)}`);
      }
    }
  });
}

if (errors.length) fail(errors);

console.log(`check:public — ${scanned.length} files scanned, ${publicIds.size} public capabilities, clean.`);

function fail(list) {
  console.error("\ncheck:public refused this build:\n");
  for (const e of list) console.error(`  ${e}`);
  console.error("");
  process.exit(1);
}
