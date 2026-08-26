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

## Adding a page

1. Add the entry to `lib/docs-nav.ts` with its `capability` and `license`.
2. Create `app/docs/<slug>/page.mdx`, starting with:
   ```mdx
   import { docMetadata } from "@/lib/site";
   export const metadata = docMetadata("<slug>");
   ```
3. Remove `soon: true` from the entry.
4. `npm run build`.

A nav entry that is not `soon` and has no `page.mdx` fails the gate, so a broken
sidebar link cannot ship.

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

Every page is also plain text, generated from the same `.mdx` source the HTML
renders from, so the two cannot drift.

| Path | What |
|---|---|
| `/llms.txt` | Index, one line per page, grouped by layer |
| `/llms-full.txt` | The whole site in one file |
| `/docs/<slug>.md` | Any page as Markdown |
| `/sitemap.xml` | Only pages that exist |

## Deploying

A standard Next.js build. Set `NEXT_PUBLIC_SITE_URL` to the deployed origin, or
canonical URLs and the sitemap point at the default `https://docs.caveman.so`.
For container hosting, add `output: "standalone"` to `next.config.ts` and serve
`node .next/standalone/server.js`. It is deliberately off so `next start` works.
