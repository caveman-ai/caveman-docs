# Desktop App

> Source: caveman-ai/caveman-code/docs/desktop.mdx

Caveman Code Desktop is an Electron app for macOS, Linux, and Windows that bundles the local runtime and manages parallel coding threads across git worktrees.

## Connect providers

Open **Settings > Models & keys** to attach API keys (Anthropic, OpenAI, external tools) or detect supported local CLI sign-ins already on your machine. You can switch between the Caveman engine, Claude Agent, Codex, and ACP agents per thread.

## Workspaces and worktrees

Each thread can run in your repository root or in an isolated git worktree so multiple agents edit separate branches concurrently without stepping on each other. Every turn creates a hidden-ref checkpoint you can roll back to.

## Approval modes

| Mode | Behaviour |
|---|---|
| `approval-required` | Stops before shell commands and file edits for explicit approval |
| `auto-accept-edits` | Applies file edits automatically; asks before external actions |
| `full-access` | Executes tools without pausing for approval |
