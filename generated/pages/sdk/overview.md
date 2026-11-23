# Overview

> Source: caveman-ai/cloud-sdk/docs/index.mdx

`caveman-ai/cloud-sdk` contains every public client for Caveman Cloud: the `cvm` CLI (`@caveman-ai/cloud`), TypeScript (`@caveman-ai/sdk`), Python (`caveman-sdk`), and Go (`github.com/caveman-ai/sdk-go`) SDKs, the Router hook, and Cloud agent skills.

Building an agent locally without Cloud? Start with [Agent SDK](/docs/agent/overview).

## Install

```bash
npm install -g @caveman-ai/cloud
npm install @caveman-ai/sdk
pip install caveman-sdk
go get github.com/caveman-ai/sdk-go
```

## Auth

Human sessions use browser device login (`cvm login`), stored in the macOS Keychain or `~/.caveman/credentials` (mode `0600`). CI jobs and sandbox scripts pass a scoped API key in `CAVE_TOKEN`.
