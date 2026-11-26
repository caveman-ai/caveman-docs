# caveman-docs

The public documentation site for Caveman and Caveman Cloud. Deploys to
`docs.caveman.so`.

This file is agent-neutral and is the canonical instruction set for anything
working in this repository. `CLAUDE.md` is a symlink to this file.

---

## The one rule

Everything here is world readable. **Nothing about Caveman Cloud internals goes
in this repository.** Not a file path, not a service name, not a design
document.

`node scripts/check-public.mjs` runs before every build and refuses to compile
if a page names a private capability or points at a private path. It is a
backstop, not permission to stop thinking.

---

## Where the facts come from

This repository holds no product code, so it cannot verify its own claims.
Four sibling checkouts do:

```bash
CAVEMAN_PUBLIC="${CAVEMAN_PUBLIC_REPO:-../caveman}"       # JuliusBrussee/caveman
CAVEMAN_AGENTS="${CAVEMAN_AGENTS_REPO:-../agent-sdk}"     # caveman-ai/agent-sdk
CAVEMAN_CODE="${CAVEMAN_CODE_REPO:-../caveman-code}"      # caveman-ai/caveman-code
CAVEMAN_CLOUD_SDK="${CAVEMAN_CLOUD_SDK_REPO:-../cloud-sdk}" # caveman-ai/cloud-sdk
```

| What | Where |
|---|---|
| Product docs & navigation | `docs/` and `docs/nav.json` inside each owning product repository |
| What a local command does | `$CAVEMAN_PUBLIC/packages/cli/src/index.ts` |
| How a compressor works | `$CAVEMAN_PUBLIC/engine/compressors/*.go` |
| The published numbers | `$CAVEMAN_PUBLIC/README.md`, "The Numbers" |
| Licence for a path | `$CAVEMAN_PUBLIC/LICENSING.md` |
| Agent SDK & Harness API | `$CAVEMAN_AGENTS/packages/{agent,harness,evals}/` |
| Cloud CLI & SDK API | `$CAVEMAN_CLOUD_SDK/packages/{cli,sdk-ts}/` and `$CAVEMAN_CLOUD_SDK/contracts/openapi.json` |

Check the sibling repositories' current remotes and source before using an
older monorepo path. The agent framework repository is `caveman-ai/agent-sdk`
(Apache-2.0 / MIT); the Cloud CLI and SDK repository is `caveman-ai/cloud-sdk`.

`content/external-capabilities.json` records the already-public SDK capabilities
that moved out of the central registry. The sync script merges these records
but refuses any capability the central registry now marks private. Never use
this file to override a private classification. `content/docs-sync-state.json`
records the public commits and registry versions checked in the last refresh.

Run `node scripts/aggregate-docs.mjs` to aggregate every product repository's
`docs/` folder and enforce the public-boundary gate before publishing.

---

## Structure

The content is Mintlify's format, and this site renders it unchanged:
`docs.json` is the navigation, and each page is an `.mdx` file beside it.

| Path | What it is |
|---|---|
| `docs.json` | **The navigation.** Products, tabs, groups and page order, in Mintlify's format. A page that is not listed here does not exist. |
| `<dir>/<name>.mdx` | One page. `caveman/*.mdx` is Caveman; `index.mdx`, `concepts/`, `guides/` and the other directories are Caveman Cloud. |
| `lib/content.ts` | **The content index.** `docs.json` plus the generated content. The sidebar, pager, search, sitemap, `llms.txt` and the Markdown mirror all list pages through it. |
| `scripts/build-content.mjs` | **The content build.** Runs before dev, build and type-check: reads every page, compiles it, records its headings and last commit, and writes `.generated/`. Nothing at request time reads a file. |
| `lib/mdx-plugins.mjs` | The two plugins the Mintlify dialect needs: code fence meta, and GitHub-slugged heading ids. |
| `lib/mdx.ts` | Loads a page's compiled module. |
| `lib/markdown-source.ts` | Mintlify MDX to plain Markdown, for the mirror. |
| `lib/raw-page.ts` | The Markdown mirror: each page's `.md` twin, `/index.md` and `/llms-full.txt`. |
| `lib/site.ts` | Site constants and `docMetadata(page)`. Server-only. |
| `lib/updated.ts` | Last-changed dates (from git, at build time), for the sitemap, JSON-LD and machine index. |
| `app/[...slug]/page.tsx`, `components/shell/`, `components/mdx/` | The HTML: the page route, the shell, and the Mintlify components. |
| `components/seo/doc-schema.tsx` | Per-page JSON-LD. |
| `proxy.ts` | Content negotiation. |
| `next.config.ts` | The `.md` rewrites, redirects (old URLs included) and headers. |
| `vite.config.ts`, `cloudflare.config.ts` | The vinext build and the `caveman-docs` Worker. |
| `content/capabilities.public.json` | Generated from the registry. Public capabilities plus a denylist of private ids. |
| `scripts/sync-capabilities.mjs` | Regenerates that file. |
| `scripts/check-public.mjs` | The build gate. |
| `scripts/check-site.mjs` | Checks a running site end to end. |
| `app/globals.css` | Design tokens. |

## URLs

A page's URL is its path in `docs.json`: `caveman/quickstart.mdx` is
`/caveman/quickstart`. Two exceptions. `x/index.mdx` is served at `/x`, so
`caveman/index.mdx` is `/caveman`. The root `index.mdx`, the Cloud
introduction, is `/cloud`, because `/` is the product chooser. `/index` and
`/caveman/index` redirect to those.

Link between pages with these paths: `[Quickstart](/caveman/quickstart)`,
`[Budget responses](/governance/budgets#handle-budget-responses-in-your-app)`.

## Adding a page

1. Create the `.mdx` file in the directory of its product and section,
   starting with:
   ```mdx
   ---
   title: "Full title: the page heading, <title> and social card"
   sidebarTitle: "Short label for the sidebar"
   description: "One or two sentences: the lede, the meta description, and the page's line in llms.txt."
   ---
   ```
   The body starts with prose, not a `#` heading. The title is the page's h1.
2. List its path, without `.mdx`, in the right group in `docs.json`. The
   group's order is the sidebar's order.
3. `npm run check:public`, then `npm run build`.

Nothing else lists pages. The sidebar, the pager, the sitemap, `llms.txt`,
`llms-index.json` and the Markdown mirror pick the page up from `docs.json`.

Order a group by the job its reader is doing, not by the architecture. A group
nested inside a group is flattened into its parent, so keep the sidebar two
levels deep and split a long group into two instead.

## Components

Pages use Mintlify's components. `components/mdx/` renders them and
`lib/markdown-source.ts` mirrors them to Markdown:

| Component | In the Markdown mirror |
|---|---|
| `<CardGroup cols={2}>`, `<Card title icon href>` | A link list, each card's text after its link |
| `<Steps>`, `<Step title>` | `**Step 1: title**`, then the step's body |
| `<AccordionGroup>`, `<Accordion title>` | `**title**`, then the body |
| `<Tabs>`, `<Tab title>` | `**title**`, then the body |
| `<CodeGroup>` | Its code fences. The word after the language names each tab: ```` ```ts TypeScript ```` |
| `<Note>`, `<Tip>`, `<Info>`, `<Warning>`, `<Check>`, `<Danger>` | A blockquote with a bold label |

Put each opening and closing tag on a line of its own and indent children by
two spaces per level, as every page does. Code fences inside a component are
indented with it: MDX has no indented code blocks, and the mirror dedents them.
A component missing from this table renders only after it is added to
`components/mdx/index.tsx`; the mirror unwraps it and keeps its text.

## Commands

```bash
npm run dev          # port 3010, vinext in workerd; reruns the content build on save
npm run lint         # content build, then tsc
npm test             # the Markdown mirror, example links, the capability sync
npm run build        # content build, gate, then the Worker build
npm run start        # the production build in workerd, port 3010
npm run deploy       # build, then deploy the Worker with the cf CLI
npm run check:public # the gate on its own
npm run content      # the content build on its own

node scripts/check-site.mjs [origin]   # every page, twin, index and redirect on a running site
node scripts/sync-capabilities.mjs "$CAVEMAN_ROOT/PRODUCTS.yaml"
```

## The build gate

`scripts/check-public.mjs` refuses the build when:

- a `docs.json` page has no `.mdx` file, has no `title` or `description`, is
  listed twice, or shares a URL with another page; or a content `.mdx` file is
  in no `docs.json` group, so it would be in no sidebar or index;
- an internal link (`](/x)`, `](/x#a)`, `href="/x"`, `](#a)`) does not resolve
  to a page, the home page, a machine index or a file in `public/`, or its
  `#anchor` is not a heading id on the target page;
- a page, `docs.json`, or the code in `app/`, `lib/` and `components/` names a
  private path or a private capability id from
  `content/capabilities.public.json`.

It fails closed: a missing manifest or an unreadable `docs.json` stops the
build. Absolute links to `docs.caveman.so` that are not a current page are
printed as warnings, since an old URL may still redirect.

---

## Design

Tokens in `app/globals.css` mirror the Cloud console's DESIGN.md (the
Linear-modelled shell and panel); dark only. Never hardcode a hex.

## Writing

Every page: what it does in one to three sentences, who should leave, code
within the first screen, real output under every command, how it works, verify
and undo, limits. Runnable examples in the product's own idiom. Numbers early,
with their source in the same sentence. Limits in one section per page and one
site-wide page, never repeated per paragraph.

No em dashes. Active voice. Sentence case headings that name a thing.

Three words with fixed meanings: `inferred` is a local offline token estimate,
`measured` is observed traffic, `verified` is a hosted comparison against a
bill. Public tools emit `inferred`. They are defined on Accounting & Evidence
(`/caveman/accounting-and-evidence`) and Savings Evidence
(`/concepts/savings-evidence`); link there, do not re-explain per page. Local
figures are never multiplied into a monthly number and never converted to
money.

Full rules are in the authoring skill's `references/writing-rules.md`.

## For machines

This is a first-class surface, not an afterthought. Everything below is
built from `docs.json` and the `.mdx` files, the same source the HTML renders
from, so nothing can drift. The route handlers run in the Worker, but they
read only what `scripts/build-content.mjs` generated: nothing reads the file
system at request time.

| Path | What |
|---|---|
| `/llms.txt` | The reading index, in the llms.txt shape: H1, summary, prose, then one H2 per product (per tab for Cloud) listing each group's pages as links to their `.md` twins. |
| `/llms-full.txt` | Every page in one file, with a contents list |
| `/llms-index.json` | The routing index: per page, its URL, Markdown URL, title, sidebar title, description, product, tab, group, source file, last change, and headings with ids. Plus the registry's public surfaces. |
| `/<path>.md` | Any page as Markdown with YAML front matter: `/caveman/quickstart.md`, `/caveman.md`, `/cloud.md` |
| `/index.md` | The home page's twin: every product, group and page. `/?mode=agent` serves it too. |
| `/og?title=&summary=&eyebrow=` | Social card for any page |
| `/sitemap.xml` | Home plus every page, each dated by the last commit to its source |
| `/robots.txt`, `/.well-known/api-catalog` | Crawler policy; the API catalog, which points at the product site |

`/<path>.md` and `/index.md` are rewrites to `app/raw/[[...slug]]/route.ts`.

**Content negotiation.** `proxy.ts` answers any page URL, `/` included,
with a 303 to its `.md` twin when `Accept` prefers `text/markdown` over
`text/html` by q-value. The decision is made on `Accept` alone, never on the
user agent, because serving different content by agent is cloaking. It
redirects rather than rewrites: Next owns `Vary` on rendered pages, so one URL
cannot safely carry two representations, and the redirect is `no-store` so the
worst a cache can do is hand HTML to a Markdown client. Do not turn this back
into a rewrite. The matcher skips Next's assets, `/raw`, `/og`, `/llms*`,
`/.well-known`, `/search-index.json`, `/favicon*`, `/brand`, `/images`,
`/examples` and anything with a file extension.

Every page response also carries
`Link: </caveman/quickstart.md>; rel="alternate"; type="text/markdown"`, so one
HEAD is enough to discover the twin.

**Structured data.** Each page renders `<DocSchema page={page} />`, a server
component emitting `TechArticle` (with the Markdown twin and the page's
sections) and `BreadcrumbList` (Docs, product, page) JSON-LD, so it is in the
HTML source for scrapers that do not run JavaScript.

**Anchors.** Heading ids come from one place: `rehypeHeadings` in
`lib/mdx-plugins.mjs`, run by the content build, using GitHub's slugger, the algorithm Mintlify used, so published `#anchors`
keep working. The rendered ids, the contents rail, the JSON-LD sections and
`llms-index.json` all read them. The gate recomputes them the same way to check
`#anchor` links. Change one, change the other.

**Old URLs.** The site before Mintlify served pages under `/docs/...`, and
caveman.so still links to some of them. `next.config.ts` redirects each to the
current page that covers the same ground, `.md` twins included, and sends the
rest of `/docs` to `/`. Do not drop entries: those URLs live on in old
sitemaps and llms.txt copies.

## Deploying

Cloudflare Workers, through [vinext](https://github.com/cloudflare/vinext),
the Next.js API on Vite. `npm run deploy` builds and deploys the
`caveman-docs` Worker with the `cf` CLI, and `docs.caveman.so` is its custom
domain. `cloudflare.config.ts` is the Worker; `vite.config.ts` is the build.

Workers have no file system and refuse to evaluate code from strings, so the
content build does that work in Node first and writes `.generated/` (ignored
by git). Pages are prerendered. The route handlers (`/raw`, `/llms*`,
`/search-index.json`, `/og`, `/.well-known/api-catalog`) run in the Worker.
Do not add `fs`, `evaluate` or `new Function` to anything that runs at request
time: it works under `next dev` and fails in production.

Before deploying, `npm run start` and point `scripts/check-site.mjs` at
`http://localhost:3010`. `npm run dev:next` and `npm run build:next` still run
plain Next.js, for comparing behaviour.

Set `NEXT_PUBLIC_SITE_URL` to the deployed origin, or canonical URLs and the
sitemap point at the default `https://docs.caveman.so`. Last-changed dates need
the git history: in a shallow clone they are left out rather than guessed.

---

## Workflow

- Work in a clean branch or worktree off `origin/master`; never commit or push
  directly to `master`.
- Use scoped conventional commits (`docs(guides): ...`, `fix(site): ...`) and
  stage explicit paths (`git commit --only -- <paths>`), never `git add -A`.
- Run `npm run content && npm run check:public && npm test && npm run lint`
  before pushing.
- Open a pull request against `master` and squash-merge once `CI` is green.
- Deploy from a clean `origin/master` checkout with `npm run deploy` only when
  asked.
