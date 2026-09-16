# caveman-docs

The public documentation site for Caveman. Deploys to `docs.caveman.so`.

This file is agent-neutral and is the canonical instruction set for anything
working in this repository. `CLAUDE.md` is a copy of it, kept identical.

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

This repository holds no product code, so it cannot verify its own claims. Facts
come from the Caveman monorepo, which must be checked out separately.

```bash
CAVEMAN_ROOT="${CAVEMAN_REPO:-../Caveman-Cloud}"
```

| What | Where |
|---|---|
| What is public | `$CAVEMAN_ROOT/PRODUCTS.yaml` |
| Licence for a path | `$CAVEMAN_ROOT/LICENSING.md` |
| Why a thing is the way it is | `$CAVEMAN_ROOT/docs/decisions/` |
| The code that settles any argument | `$CAVEMAN_ROOT/public/**` |

Current public product code also lives in the sibling `caveman` and
`caveman-agent-sdk` repositories. Check their current remotes and source before
using an older monorepo path. The SDK repository is `caveman-ai/agent-sdk`;
its current source licence is Apache-2.0. Published older packages can differ.

`content/external-capabilities.json` records the already-public SDK capabilities
that moved out of the central registry. The sync script merges these records
but refuses any capability the central registry now marks private. Never use
this file to override a private classification. `content/docs-sync-state.json`
records the public commits and registry versions checked in the last refresh.

The authoring skill that drives all of this lives in that repository at
`.agents/skills/caveman-docs/SKILL.md`. Read it before writing a page. It works
in any agent that can read files and run commands.

---

## Structure

| Path | What it is |
|---|---|
| `lib/docs-nav.ts` | **The source of truth.** Every page, its title, blurb, layer, capability and licence. The sidebar, the pager, the sitemap and llms.txt all read it. |
| `app/docs/<slug>/page.mdx` | One page of content. No `h1`: the title comes from the nav. |
| `content/capabilities.public.json` | Generated from the registry. Public capabilities plus a denylist of private ids. |
| `scripts/sync-capabilities.mjs` | Regenerates that file. |
| `scripts/check-public.mjs` | The build gate. |
| `components/docs/` | Blocks and diagrams, registered globally in `mdx-components.tsx`. |
| `lib/raw-page.ts` | The Markdown mirror behind `<path>.md` and `/llms-full.txt`. |
| `app/globals.css` | Deck tokens plus the docs reading measure. |

## Products

`lib/docs-nav.ts` lists products. A product is one thing a reader came for: a
tab in the header, a `home` slug the tab links to, and `groups` of pages that
become the labelled sections of the sidebar while you are inside it. Tab and
sidebar are both decided from the URL, so there is no open/closed state to
drift. Start is the product with no `section`; it belongs to all of them and
owns `REFERENCE`, the group every other sidebar borrows at its foot. A product
with `soon: true` and no groups is named in the tab bar but never linked.

Adding a page means choosing which product and group owns it. Order a group by
the job its reader is doing, not by the architecture. If a group outgrows the
sidebar, split it into a second group rather than nesting a third level.

## Adding a page

1. Add the entry to `lib/docs-nav.ts` with its `capability` and `license`.
2. Create `app/docs/<slug>/page.mdx`, starting with exactly:
   ```mdx
   import { docMetadata } from "@/lib/site";
   import { DocSchema } from "@/components/seo/doc-schema";
   export const metadata = docMetadata("<slug>");

   <DocSchema slug="<slug>" />
   ```
3. Remove `soon: true` from the entry.
4. `npm run build`.

The gate refuses both directions of drift: a nav entry that is not `soon` with
no `page.mdx`, and a `page.mdx` whose entry still says `soon` or which has no
entry at all. The second is the easy one to miss, because the page builds and
is reachable while the sidebar, the sitemap and every machine index leave it
out.

## Commands

```bash
npm run dev          # port 3010
npm run lint         # tsc
npm run build        # gate, then a full static build
npm run check:public # the gate on its own

node scripts/sync-capabilities.mjs "$CAVEMAN_ROOT/PRODUCTS.yaml"
```

---

## Design

The console's design system, verbatim: one flat near-black canvas, hairline
borders, a small type scale, almost no colour. Tokens are in `app/globals.css`
and mirror `$CAVEMAN_ROOT/cloud/web/DESIGN.md`. Never hardcode a hex.

Docs add one thing the console does not have: a reading measure, because a docs
page is prose. That is `.prose-docs`, 15px at 68ch.

Ember (`--ember`) marks one thing only: which layer of the stack you are in, and
the recovery path in a diagram. It is not available for anything else.

## Writing

No em dashes. Active voice. Sentence case headings. Say what a thing cannot do.

Three words with fixed meanings, never blurred: `inferred` is a local per-run
estimate, `measured` is observed traffic, `verified` is reserved for hosted
systems that can compare against a bill. Nothing documented here emits
`verified`. Local figures are never multiplied into a monthly number and never
converted to money.

Full rules are in the authoring skill's `references/writing-rules.md`.

## For machines

This is a first-class surface, not an afterthought. Everything below is
generated from the same sources the HTML renders from, so nothing can drift.

| Path | What |
|---|---|
| `/llms.txt` | The reading index. Spec shape: H1, summary, prose, H2 link lists. Carries the measurement vocabulary. |
| `/llms-full.txt` | Every page in one file, with a contents list |
| `/llms-index.json` | The routing index: headings, anchors, licences, capabilities, word counts, last-changed dates, public surfaces |
| `/docs/<slug>.md` | Any page as Markdown, with YAML front matter |
| `/og?title=&summary=&eyebrow=` | Social card for any page |
| `/sitemap.xml` | Only pages that exist, each with a real `lastmod` |

**Content negotiation.** `middleware.ts` answers a page URL with a 303 to its
`.md` twin when `Accept` prefers `text/markdown` over `text/html` by q-value.
The decision is made on `Accept` alone, never on the user agent, because
serving different content by agent is cloaking. It redirects rather than
rewrites: Next owns `Vary` on rendered pages, so one URL cannot safely carry
two representations, and the redirect is `no-store` so the worst a cache can
do is hand HTML to a Markdown client. Do not turn this back into a rewrite.

Every doc response also carries
`Link: </docs/x.md>; rel="alternate"; type="text/markdown"`, so one HEAD is
enough to discover the twin.

**Structured data.** Each page emits `TechArticle` plus `BreadcrumbList` from
`<DocSchema slug="..." />`, a server component, so the JSON-LD is in the HTML
source for scrapers that do not run JavaScript. `/docs/counting` also emits a
`DefinedTermSet` for the measurement vocabulary, because a summariser that
flattens `inferred` into "saves money" is wrong in a way that propagates.

**Anchors.** `lib/page-index.ts` slugs headings from the Markdown source and
`mdx-components.tsx` slugs them from rendered text. The two must agree or a
published anchor points at nothing. Change one, change the other.

## Deploying

A standard Next.js build. Set `NEXT_PUBLIC_SITE_URL` to the deployed origin, or
canonical URLs and the sitemap point at the default `https://docs.caveman.so`.
For container hosting, add `output: "standalone"` to `next.config.ts` and serve
`node .next/standalone/server.js`. It is deliberately off so `next start` works.
