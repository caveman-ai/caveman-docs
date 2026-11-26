# Overview

> Source: caveman-ai/caveman-code/docs/index.mdx

Caveman Code is a coding agent client for Desktop, CLI, Web, and Mobile. It runs the open-source [Caveman Harness](/docs/agent/harness) alongside first-class connectors for Claude Agent, Codex, Pi, OpenCode, and ACP agents, all on one structured transcript.

Building a custom non-interactive agent in TypeScript? Use [Agent SDK](/docs/agent/overview).

## Install the CLI

```bash
npm install -g @caveman-ai/code
caveman-code --help
```

```text
caveman-code 1.0.0 — Caveman Code CLI (shared runtime with Desktop)

Usage: caveman-code <command> [options]

Commands:
  chat         Start or attach to an interactive coding session
  server       Manage the local Caveman Code daemon
  project      List or open workspaces
  auth         Inspect or connect model providers & Caveman Cloud
  mcp          Inspect configured MCP servers
  automation   Run or inspect .caveman/automations workflows
  trace        Inspect session traces and usage
  config       Read or update Caveman Code configuration
```

## Key properties

- **Structured transcripts for every engine.** Tool calls, diffs, approvals, and subagents render as typed events rather than raw terminal scrapes.
- **One daemon across Desktop and CLI.** Workspaces, git worktrees, and session journals are shared locally.
- **Local first, Cloud optional.** Chats stay on your machine unless you sync them or launch a Cloud computer.
