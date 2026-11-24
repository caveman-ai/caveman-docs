# Contributing to Caveman Docs

Thank you for improving [docs.caveman.so](https://docs.caveman.so). Read
[`AGENTS.md`](AGENTS.md) before editing.

## Rules

- **Public boundary:** never reference private repositories, internal backend paths, or unpublished internal architecture.
- **Keep navigation in sync:** every page must be registered in `docs.json`.
- **Verify before opening a PR:**

```bash
npm install
npm run check:public
npm run lint
npm test
npm run build
```

Report security or privacy issues per [`SECURITY.md`](SECURITY.md).
