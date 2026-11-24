#!/usr/bin/env node
/* ==========================================================================
 *  The publication gate. Runs before every build.
 *
 *  The source is `docs.json` (Mintlify navigation) plus the `.mdx` files
 *  beside it. This script refuses a build when:
 *
 *    1. A page listed in docs.json has no `.mdx` file, has no `title` or
 *       `description` in its front matter, is listed twice, or shares a URL
 *       with another page. Or a content `.mdx` file is in no docs.json group,
 *       so it would be in no sidebar, sitemap or index.
 *    2. An internal link in content points at nothing: `](/x)`, `](/x#a)`,
 *       `href="/x"` and same-page `](#a)` must resolve to a page, the home
 *       page, a machine index, or a real file under public/, and an anchor
 *       must be a heading id on the target page.
 *    3. Any content names a path inside a private tree. A file path into
 *       cloud/ or db/ is a leak even when the sentence around it is harmless.
 *    4. Any content names a private-only identifier. Ambiguous words that are
 *       also plain English (gateway, proxy, worker) are exempt from the token
 *       check and are still caught by the path check.
 *
 *  Failing closed matters more than being clever here: if the manifest or
 *  docs.json is missing or unreadable, the build stops rather than assuming
 *  everything is fine.
 * ======================================================================== */

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { compile } from "@mdx-js/mdx";
import GithubSlugger from "github-slugger";
import remarkGfm from "remark-gfm";
import { visit } from "unist-util-visit";
import { parse as parseYaml } from "yaml";

const ROOT = process.cwd();
const SITE_URL = "https://docs.caveman.so";
const errors = [];
const warnings = [];

/* -- the private-name manifest ------------------------------------------- */
const MANIFEST = join(ROOT, "content/capabilities.public.json");
if (!existsSync(MANIFEST)) {
  fail([`content/capabilities.public.json is missing. Run: node scripts/sync-capabilities.mjs <path-to>/PRODUCTS.yaml`]);
}
const manifest = JSON.parse(readFileSync(MANIFEST, "utf8"));
if (!Array.isArray(manifest.privateIds)) fail(["content/capabilities.public.json has no privateIds list."]);

/* Private ids that are also ordinary English words. Naming one of these in a
 * sentence is not a leak; naming its path is, and rule 3 covers that. */
const AMBIGUOUS = new Set(["gateway", "proxy", "web", "worker", "database", "catalog", "metering", "deployment", "optimizer", "identity"]);
const deniedIds = manifest.privateIds.filter((id) => !AMBIGUOUS.has(id));

/* Directories that exist only in the private repository. A docs page has no
 * legitimate reason to point a reader at one. `cloud/` preceded by a hyphen
 * is the public CLI config directory, `~/.caveman-cloud/`, not the private
 * tree.
 *
 * `deploy/` is the exception that needs care: JuliusBrussee/caveman has a
 * public `deploy/` too, and the self-hosting page names its files. Those
 * files, the `.env` a reader creates beside them, and the bare directory
 * name pass. Any other path under `deploy/` is the private tree's. Add a file
 * here only after checking it exists in the public repository. */
const PUBLIC_DEPLOY_FILES = ["docker-compose.yml", "kubernetes.yaml", "kubernetes-ha.yaml", "aws-ecs-task-definition.json", ".env"];
const PRIVATE_DEPLOY = new RegExp(
  String.raw`\bdeploy\/(?!(?:${PUBLIC_DEPLOY_FILES.map((f) => f.replace(/[.]/g, "\\.")).join("|")})(?![\w.\/-])|[^\w.\/-]|$)`,
);
const PRIVATE_PATHS = [
  /(?<![\w-])cloud\/[a-z]/,
  /\bdb\/(schema|migrations)/,
  PRIVATE_DEPLOY,
  /\bcaveman-cloud-spec\//,
  /(?<![\w-])cloud\/web\b/,
  /\b(?:Caveman-Cloud|caveman-code-app|agent-sdk-private|caveman-model-research|caveman-site|caveman-v5-staging)\b/,
  /\/Users\/(?:julb|julius)\b/,
  /\bfounder\s+(?:ruling|call)\b/i,
];

/* -- 1. docs.json and the pages it lists ---------------------------------- */
const DOCS_JSON = join(ROOT, "docs.json");
if (!existsSync(DOCS_JSON)) fail(["docs.json is missing."]);
let docs;
try {
  docs = JSON.parse(readFileSync(DOCS_JSON, "utf8"));
} catch (error) {
  fail([`docs.json is not valid JSON: ${error.message}`]);
}
const products = docs?.navigation?.products;
if (!Array.isArray(products) || products.length === 0) fail(["docs.json has no navigation.products."]);

/** Must match hrefForSlug in lib/content.ts. */
function hrefForSlug(slug) {
  if (slug === "index") return "/cloud";
  return "/" + slug.replace(/(^|\/)index$/, "");
}

const listed = [];
function readGroup(group, where) {
  if (!Array.isArray(group?.pages)) {
    errors.push(`docs.json: group "${group?.group ?? "?"}" in ${where} has no pages array.`);
    return;
  }
  for (const entry of group.pages) {
    if (typeof entry === "string") listed.push({ slug: entry, where: `${where} / ${group.group}` });
    else readGroup(entry, `${where} / ${group.group}`);
  }
}
for (const product of products) {
  const tabs = product.tabs ?? [{ tab: null, groups: product.groups ?? [] }];
  for (const tab of tabs) {
    const where = tab.tab ? `${product.product} / ${tab.tab}` : product.product;
    for (const group of tab.groups ?? []) readGroup(group, where);
  }
}

const pages = new Map(); // slug -> { slug, href, file, body, bodyStart }
const byHref = new Map();
for (const { slug, where } of listed) {
  const file = `${slug}.mdx`;
  if (pages.has(slug)) {
    errors.push(`docs.json lists "${slug}" twice (again in ${where}).`);
    continue;
  }
  if (!existsSync(join(ROOT, file))) {
    errors.push(`docs.json lists "${slug}" (${where}) but ${file} does not exist.`);
    continue;
  }
  const source = readFileSync(join(ROOT, file), "utf8");
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(source);
  let data = {};
  try {
    data = (match ? parseYaml(match[1] ?? "") : {}) ?? {};
  } catch (error) {
    errors.push(`${file}: front matter is not valid YAML: ${error.message}`);
  }
  if (!data.title) errors.push(`${file}: front matter has no title.`);
  if (!data.description) errors.push(`${file}: front matter has no description.`);
  const href = hrefForSlug(slug);
  if (byHref.has(href)) errors.push(`${file} and ${byHref.get(href)}.mdx both resolve to ${href}.`);
  byHref.set(href, slug);
  const bodyStart = match ? match[0].split("\n").length - 1 : 0;
  pages.set(slug, { slug, href, file, source, body: match ? source.slice(match[0].length) : source, bodyStart });
}

/* A content file with no docs.json entry builds into nothing and is listed
 * nowhere. Everything outside the site's own code is content. */
const NOT_CONTENT = new Set(["node_modules", ".next", ".git", ".vercel", "app", "components", "lib", "public", "scripts", "tests", "snippets"]);
function walkContent(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    if (dir === ROOT && NOT_CONTENT.has(entry)) continue;
    if (entry.startsWith(".")) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walkContent(full));
    else if (entry.endsWith(".mdx")) out.push(relative(ROOT, full));
  }
  return out;
}
const contentFiles = walkContent(ROOT).sort();
for (const file of contentFiles) {
  if (!pages.has(file.replace(/\.mdx$/, ""))) {
    errors.push(`${file} is in no docs.json group, so it appears in no sidebar, sitemap or index.`);
  }
}

/* -- 2. internal links and anchors --------------------------------------- */

/* Heading ids exactly as lib/mdx.ts assigns them: GitHub's slugger over the
 * text of every h1 to h6 in document order, after remark-gfm. Keep in step. */
function rehypeHeadingIds({ ids }) {
  return (tree) => {
    const slugger = new GithubSlugger();
    const textOf = (node) => (node.type === "text" ? (node.value ?? "") : (node.children ?? []).map(textOf).join(""));
    visit(tree, "element", (node) => {
      if (!/^h[1-6]$/.test(node.tagName ?? "")) return;
      ids.add(slugger.slug(textOf(node).trim()));
    });
  };
}

const anchors = new Map(); // slug -> Set of heading ids
await Promise.all(
  [...pages.values()].map(async (page) => {
    const ids = new Set();
    try {
      await compile(page.body, { remarkPlugins: [remarkGfm], rehypePlugins: [[rehypeHeadingIds, { ids }]] });
      anchors.set(page.slug, ids);
    } catch (error) {
      errors.push(`${page.file}: does not compile as MDX: ${error.message}`);
    }
  }),
);

/* Served by the site itself rather than by a page or a file in public/. */
const ROUTES = new Set(["/llms.txt", "/llms-full.txt", "/llms-index.json", "/sitemap.xml", "/robots.txt", "/search-index.json", "/og", "/index.md"]);

function resolvePath(raw) {
  let path = raw.split("?")[0] ?? "";
  if (path.length > 1) path = path.replace(/\/$/, "");
  if (path === "/index") return { page: byHref.get("/cloud") };
  path = path.replace(/\/index$/, "") || "/";
  if (path === "/") return { home: true };
  const twin = path.endsWith(".md") && byHref.has(path.slice(0, -3));
  const page = byHref.get(twin ? path.slice(0, -3) : path);
  if (page) return { page };
  if (ROUTES.has(path)) return { route: true };
  const file = join(ROOT, "public", decodeURIComponent(path));
  if (existsSync(file) && statSync(file).isFile()) return { file: true };
  return null;
}

function checkLink(page, line, target, label) {
  const hashAt = target.indexOf("#");
  const path = hashAt === -1 ? target : target.slice(0, hashAt);
  const hash = hashAt === -1 ? "" : decodeURIComponent(target.slice(hashAt + 1));
  const where = `${page.file}:${line}`;
  const resolved = path ? resolvePath(path) : { page: page.slug };
  if (!resolved) return `${where} links ${label} ${target}, which is not a page or a file in public/.`;
  if (hash && resolved.page) {
    const ids = anchors.get(resolved.page);
    if (ids && !ids.has(hash)) {
      return `${where} links ${label} ${target}, but ${resolved.page}.mdx has no heading with id "${hash}".`;
    }
  }
  return null;
}

let linkCount = 0;
let anchorCount = 0;
const LINK_PATTERNS = [
  /\]\((\/[^)\s]*|#[^)\s]+)(?:\s+"[^"]*")?\)/g, // [text](/x), [text](/x#a), [text](#a)
  /\bhref=(?:"|'|\{["'])(\/[^"'}]*|#[^"'}]+)/g, // href="/x", href='/x', href={"/x"}
  /^\s*\[[^\]]+\]:\s+(\/\S*|#\S+)/g, // [ref]: /x
];
const SELF = new RegExp(`${SITE_URL.replace(/[.]/g, "\\.")}(/[^\\s)"'\`>]*)`, "g");

for (const page of pages.values()) {
  const lines = page.source.split("\n");
  let fence = null;
  for (let i = page.bodyStart; i < lines.length; i++) {
    const line = lines[i] ?? "";
    const marker = /^\s*(`{3,}|~{3,})/.exec(line)?.[1];
    if (fence) {
      if (marker && marker[0] === fence[0] && marker.length >= fence.length && line.trim() === marker) fence = null;
      continue;
    }
    if (marker) {
      fence = marker;
      continue;
    }
    const prose = line.replace(/(`+)[\s\S]*?\1/g, "");
    for (const pattern of LINK_PATTERNS) {
      for (const m of prose.matchAll(pattern)) {
        const target = m[1] ?? "";
        linkCount++;
        if (target.includes("#")) anchorCount++;
        const problem = checkLink(page, i + 1, target, "to");
        if (problem) errors.push(problem);
      }
    }
    /* Absolute links to this site are not refused, since an old URL may still
     * redirect, but one that is not a current page is worth a look. */
    for (const m of prose.matchAll(SELF)) {
      const target = m[1] ?? "/";
      const path = target.split("#")[0] ?? "/";
      if (!resolvePath(path || "/")) {
        warnings.push(`${page.file}:${i + 1} links ${SITE_URL}${target}, which is not a current page or file (it may redirect).`);
      }
    }
  }
}

/* -- 3 and 4. private paths and private names ----------------------------- */
function walkCode(dir) {
  const out = [];
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry === ".next" || entry === ".git") continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walkCode(full));
    else if (/\.(mdx?|tsx?)$/.test(entry)) out.push(relative(ROOT, full));
  }
  return out;
}
const scanned = [
  ...contentFiles,
  "docs.json",
  ...walkCode(join(ROOT, "app")),
  ...walkCode(join(ROOT, "lib")),
  ...walkCode(join(ROOT, "components")),
];
const deniedPatterns = deniedIds.map((id) => ({
  id,
  /* A hyphen on either side means the id is inside a longer public name,
   * such as the `x-cave-agent` request header or `create-caveman-agent`. */
  re: new RegExp(`(?<![\\w-])${id.replace(/[-]/g, "[-]")}(?![\\w-])`),
}));
for (const file of scanned) {
  readFileSync(join(ROOT, file), "utf8")
    .split("\n")
    .forEach((line, i) => {
      if (PRIVATE_PATHS.some((re) => re.test(line))) {
        errors.push(`${file}:${i + 1} names a private path: ${line.trim().slice(0, 100)}`);
      }
      for (const { id, re } of deniedPatterns) {
        if (re.test(line)) errors.push(`${file}:${i + 1} names the private capability "${id}": ${line.trim().slice(0, 100)}`);
      }
    });
}

for (const warning of warnings) console.warn(`check:public warning: ${warning}`);
if (errors.length) fail(errors);

console.log(
  `check:public — ${pages.size} pages, ${linkCount} internal links (${anchorCount} with anchors) resolved, ` +
    `${scanned.length} files scanned for private names, clean.`,
);

function fail(list) {
  console.error("\ncheck:public refused this build:\n");
  for (const e of list) console.error(`  ${e}`);
  console.error("");
  process.exit(1);
}
