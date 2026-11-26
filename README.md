# Caveman Documentation

The source of [docs.caveman.so](https://docs.caveman.so). Pages are Mintlify-format MDX with navigation in `docs.json`, and Vinext compiles the site into a Cloudflare Worker. Every page also has a Markdown twin at its `.md` URL. `/llms.txt` lists those URLs, and `/llms-full.txt` serves every page in one file.

## Preview a change

Use Node.js 24, the version CI runs. From this repo:

```bash
npm ci
npm run dev
```

Open [localhost:3010](http://localhost:3010). The dev server builds from the pages already checked in, so you don't need any other repo to start. Edit the page's `.mdx` file, and update `docs.json` when you add, move or remove a page. The content rebuilds as you save.

To see what an agent gets, request the Markdown twin: append `.md` to the route, or ask for `text/markdown` and the HTML URL redirects there.

```bash
curl -sSL -H 'Accept: text/markdown' http://localhost:3010/caveman/quickstart
```

## Refresh pages from product repos

Product docs live next to their code, in each product repo's `docs/` folder with a `docs/nav.json` manifest. Edit them there, then import. The importer looks for sibling checkouts under fixed folder names, and one of them differs from its repo name: the Agent SDK has to sit at `../agents`.

```bash
git clone https://github.com/caveman-ai/agent-sdk ../agents
git clone https://github.com/caveman-ai/caveman-code ../caveman-code
git clone https://github.com/caveman-ai/cloud-sdk ../cloud-sdk
git clone https://github.com/JuliusBrussee/caveman ../caveman
node scripts/aggregate-docs.mjs
```

| Sibling folder | Files read |
|---|---|
| `../agents` | `docs/nav.json` and the pages it lists |
| `../caveman-code` | `docs/nav.json` and the pages it lists |
| `../cloud-sdk` | `docs/nav.json`, its pages and `contracts/openapi.json` |
| `../caveman` | `docs/nav.json` and the pages it lists |

One catch today: the default branch of `JuliusBrussee/caveman` has no `docs/nav.json` yet, so an import from four fresh default-branch clones stops on that repo. Run it only when all four manifests are in place. For an edit to this site alone, skip the import and work on the checked-in MDX.

The importer wipes `generated/` before it reads anything, so never hand-edit files there. It writes page copies, indexes and the OpenAPI contract, and it exits on a missing file or on text that fails its public-boundary check. It does not touch `docs.json`; when site navigation changes, update that yourself.

## Check and deploy

```bash
npm run content
npm run check:public
npm test
npm run lint
npm run build
```

`check:public` is the publication gate. It fails on a `docs.json` page without its `.mdx` file (or the reverse), on an internal link or anchor that points at nothing, and on any reference to a private path or identifier. `npm run build` runs it again, so a leak can't ship by skipping the step. To test the built site, run `npm run start` and then `node scripts/check-site.mjs` in a second terminal; it checks the served HTML, the Markdown twins and the agent indexes.

With Cloudflare access, deploy from a clean checkout of the default branch with `npm run deploy`. It builds the site and deploys the Worker defined in [cloudflare.config.ts](cloudflare.config.ts).

[Contributing](CONTRIBUTING.md) · [MDX and URL conventions](AGENTS.md) · [MIT](LICENSE)
