# Architecture

> Source: caveman-ai/caveman-code/docs/architecture.mdx

Caveman Code is organized as a pnpm monorepo with clients under `apps/` and shared runtime packages under `packages/`.

```text
apps/desktop (Electron)  ─┐
apps/cli (caveman-code)  ─┼──► packages/runtime (daemon, worktrees, MCP, sync)
apps/web (Vite SPA)      ─┤          │
apps/mobile (Expo)       ─┘          ├──► packages/provider-caveman ──► @caveman-ai/harness (v4)
                                     ├──► packages/provider-acp / codex / cursor / pi
                                     └──► Caveman Cloud Relay (/v1/code/*)
```

`packages/provider-caveman` depends directly on the open-source `@caveman-ai/harness` package rather than vendoring private tarballs.
