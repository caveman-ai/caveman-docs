# CLI & Daemon

> Source: caveman-ai/caveman-code/docs/cli.mdx

`@caveman-ai/code` installs the `caveman-code` binary. It drives the same `packages/runtime` daemon that Desktop bundles, so workspaces, auth, and sessions are shared.

## Install

```bash
npm install -g @caveman-ai/code
```

## Commands

| Command | Action |
|---|---|
| `caveman-code chat` | Start or attach to a coding session in the current repository |
| `caveman-code server` | Start, inspect, or stop the local runtime daemon |
| `caveman-code project` | List or register project workspaces |
| `caveman-code auth` | Check configured provider keys and Caveman Cloud sign-in |
| `caveman-code mcp` | Inspect registered MCP servers and connection status |
| `caveman-code automation` | Run a `.caveman/automations/<name>.yaml` workflow |
| `caveman-code trace` | Inspect session event logs and token usage |
| `caveman-code config` | Print or edit local runtime configuration |

## Verify and undo

```bash
caveman-code --version
npm uninstall -g @caveman-ai/code
```
