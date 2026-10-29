# caveman-docs

The public documentation for Caveman and Caveman Cloud, at
[docs.caveman.so](https://docs.caveman.so).

- **Caveman**: the open source skill, CLI, proxy and Engine that make AI agents
  say less and read less, on your machine.
- **Caveman Cloud**: the hosted product that shows what your agents cost
  and cuts it, with proof. Described at the level of what it does, never how it is built.

The content is Mintlify's format: `docs.json` is the navigation and each page
is an `.mdx` file beside it (`caveman/*.mdx` for Caveman, the rest for Cloud).
A Next.js app renders it; `lib/content.ts` is the index everything reads.

## Run it

```bash
npm install
npm run dev     # http://127.0.0.1:3010
```

## Build it

```bash
npm run build
```

The build runs `scripts/check-public.mjs` first. It refuses to compile if a page
listed in `docs.json` is missing, an internal link or anchor points at nothing,
or any content names a capability or path that is not public in the Caveman
product registry.

## Read it without a browser

| Path | What |
|---|---|
| `/llms.txt` | Index, one line per page, grouped by product and group |
| `/llms-full.txt` | The whole site in one file |
| `/llms-index.json` | Every page with its headings and anchors |
| `/<path>.md` | Any page as Markdown, for example `/caveman/quickstart.md` |
| `/index.md` | The home page as Markdown |

Sending `Accept: text/markdown` to any page URL redirects to its `.md` twin.
The Markdown is generated from the same `.mdx` source the page renders from, so
there is no second copy to go stale.

## Writing pages

See `AGENTS.md`. The authoring workflow is an agent-neutral skill in the Caveman
monorepo at `.agents/skills/caveman-docs/SKILL.md`.

## Licence

Documentation content is published for public use. The Caveman software it
describes is licensed separately: see
[the product model](https://docs.caveman.so/caveman/product-model).
