import { bindMCPTool, CavemanMCPHost } from '@caveman-ai/middleware/mcp';
export async function project({ client, tool, args, callId, contextManifest,
  serverId, protocolVersion, runtime, scope }) {
  await runtime.ready();
  const host = new CavemanMCPHost({ runtime, scope, serverId, protocolVersion });
  const source = bindMCPTool(client, tool);
  const registeredTools = host.register([source]);
  const original = await source.execute(args);
  const view = await host.projectResult(original, { tool, callId, contextManifest, registeredTools });
  return { original, view, registeredTools };
}
