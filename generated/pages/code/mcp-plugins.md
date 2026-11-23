# MCP & Plugins

> Source: caveman-ai/caveman-code/docs/mcp-plugins.mdx

Caveman Code loads MCP servers and workspace plugins under strict environment isolation so untrusted repositories cannot exfiltrate host credentials.

## MCP configuration

Stdio MCP servers run with `inheritEnv: false`, receiving only the minimal system allowlist plus the environment variables you explicitly declare for that server.

## Plugins and skills

Workspace plugins declare skills and markdown slash commands. Skill descriptions sit in the stable cached prompt prefix; full skill bodies load lazily only when activated.
