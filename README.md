# Caveman Documentation (`caveman-ai/caveman-docs`)

Public documentation site serving [docs.caveman.so](https://docs.caveman.so),
`/llms.txt`, `/llms-full.txt`, per-page `.md` mirrors, and the public OpenAPI
reference.

Product documentation lives beside the code inside each owning repository's
`docs/` folder; this repository aggregates those folders into one Mintlify-format
navigation tree (`docs.json`), compiles MDX at build time, enforces the public
boundary gate, and deploys on Cloudflare Workers via Vinext.

## Source repositories

| Product tab | Source folder |
|---|---|
| Caveman Agents | [`caveman-ai/agent-sdk/docs/`](https://github.com/caveman-ai/agent-sdk) |
| Caveman Code | [`caveman-ai/caveman-code/docs/`](https://github.com/caveman-ai/caveman-code) |
| Cloud SDK & CLI | [`caveman-ai/cloud-sdk/docs/`](https://github.com/caveman-ai/cloud-sdk) |
| Local Efficiency | [`JuliusBrussee/caveman/docs/`](https://github.com/JuliusBrussee/caveman) |
| API Reference | [`caveman-ai/cloud-sdk/contracts/openapi.json`](https://github.com/caveman-ai/cloud-sdk) |

## Run locally

Node 22+ required.

```bash
npm install
npm run dev           # compiles content and starts Vite dev server on http://localhost:3010
npm run check:public  # verifies no private paths, internal capabilities, or secrets leak
npm run lint          # content build + Next typegen + tsc --noEmit
npm test              # node --test tests/*.test.mjs
npm run build         # content + check:public + vite build
```

## Multi-repo aggregation

```bash
node scripts/aggregate-docs.mjs
```

`aggregate-docs.mjs` and `scripts/check-public.mjs` refuse to build if any page
mentions a private backend path, internal strategy memo, or secret pattern.

## Repository guide

- [`AGENTS.md`](AGENTS.md) (`CLAUDE.md` is a symlink to it): full structure, URL rules, MDX conventions, and verification steps.
- [`CONTRIBUTING.md`](CONTRIBUTING.md): how to propose documentation updates.
- [`SECURITY.md`](SECURITY.md): how to report security or accidental private-data exposure issues.
- [`LICENSE`](LICENSE): MIT.
