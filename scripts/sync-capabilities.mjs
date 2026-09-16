#!/usr/bin/env node
/* ==========================================================================
 *  Regenerate content/capabilities.public.json from the Caveman product
 *  registry and the explicit moved-public capability map. This generated file
 *  carries public capability details only. Private details are dropped here,
 *  at generation time; private ids remain only as the publication denylist.
 *
 *    node scripts/sync-capabilities.mjs ../Caveman-Cloud/PRODUCTS.yaml
 *
 *  Run it from the docs-generation skill whenever the registry changes.
 * ======================================================================== */

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const src = process.argv[2] ?? "../Caveman-Cloud/PRODUCTS.yaml";
const out = resolve(process.cwd(), "content/capabilities.public.json");

/* PRODUCTS.yaml is kept in a deliberately simple shape (one `key: value` per
 * line, inline flow for lists) so it can be read without a YAML dependency.
 * See the parser contract in the file's own header comment. */
function parseBlocks(text, heading) {
  const lines = text.split("\n");
  const start = lines.findIndex((l) => l.trimEnd() === `${heading}:`);
  if (start === -1) throw new Error(`PRODUCTS.yaml has no "${heading}:" section`);

  const blocks = [];
  let current = null;
  for (const raw of lines.slice(start + 1)) {
    const line = raw.replace(/\s+$/, "");
    if (!line || line.trim().startsWith("#")) continue;
    // A new top-level section (column 0, not a list item) ends this one.
    if (/^\S/.test(line)) break;

    const item = line.match(/^\s*-\s+(\w[\w-]*):\s*(.*)$/);
    if (item) {
      current = {};
      blocks.push(current);
      current[item[1]] = unquote(item[2]);
      continue;
    }
    const field = line.match(/^\s+(\w[\w-]*):\s*(.*)$/);
    if (field && current) current[field[1]] = unquote(field[2]);
  }
  return blocks;
}

function unquote(v) {
  const t = v.trim();
  if (t.startsWith("[") && t.endsWith("]")) {
    return t
      .slice(1, -1)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  if ((t.startsWith("'") && t.endsWith("'")) || (t.startsWith('"') && t.endsWith('"'))) return t.slice(1, -1);
  return t;
}

const yaml = readFileSync(resolve(process.cwd(), src), "utf8");
const capabilities = parseBlocks(yaml, "capabilities");

const publicCaps = capabilities
  .filter((c) => c.id && c.visibility === "public")
  .map((c) => ({
    id: c.id,
    name: c.name ?? c.id,
    path: c.path ?? "",
    language: c.language ?? "",
    license: c.license ?? "",
    status: c.status ?? "",
  }))
  .sort((a, b) => a.id.localeCompare(b.id));

// Private ids are recorded as a denylist so the build gate can refuse a page
// that names one. The list is ids only: no paths, no notes, no descriptions.
const privateIds = capabilities
  .filter((c) => c.id && c.visibility !== "public")
  .map((c) => c.id)
  .sort();

const external = JSON.parse(readFileSync(resolve(process.cwd(), "content/external-capabilities.json"), "utf8")).public;
for (const cap of external) {
  if (privateIds.includes(cap.id)) throw new Error(`External capability ${cap.id} is private in the registry`);
  const index = publicCaps.findIndex((item) => item.id === cap.id);
  if (index >= 0) publicCaps[index] = cap;
  else publicCaps.push(cap);
}
publicCaps.sort((a, b) => a.id.localeCompare(b.id));

writeFileSync(
  out,
  JSON.stringify({ generatedFrom: "PRODUCTS.yaml", public: publicCaps, privateIds }, null, 2) + "\n",
);

console.log(`capabilities.public.json: ${publicCaps.length} public, ${privateIds.length} private ids denied`);
