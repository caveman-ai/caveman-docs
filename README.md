# caveman-docs

The public documentation for Caveman, at [docs.caveman.so](https://docs.caveman.so).

Covers the open layers of the stack: the agent skill, the compression engine,
and cavemem. Caveman Cloud is described at the level of what it is for, never
how it works.

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
names a capability that is not public in the Caveman product registry, points at
a path inside a private tree, or links to a page that does not exist.

## Read it without a browser

| Path | What |
|---|---|
| `/llms.txt` | Index, one line per page, grouped by layer |
| `/llms-full.txt` | The whole site in one file |
| `/docs/<slug>.md` | Any page as Markdown |

The Markdown is generated from the same `.mdx` source the page renders from, so
there is no second copy to go stale.

## Writing pages

See `AGENTS.md`. The authoring workflow is an agent-neutral skill in the Caveman
monorepo at `.agents/skills/caveman-docs/SKILL.md`.

## Licence

Documentation content is published for public use. The Caveman software it
describes is licensed separately: see [Licensing](https://docs.caveman.so/docs/licensing).
