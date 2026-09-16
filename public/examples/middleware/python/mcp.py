from caveman_middleware.mcp import CavemanMCPHost, bind_mcp_tool

async def project(*, client, tool, arguments, call_id, context_manifest,
                  server_id, protocol_version, runtime, scope):
    await runtime.ready()
    host = CavemanMCPHost(runtime=runtime, scope=scope,
                         server_id=server_id, protocol_version=protocol_version)
    source = bind_mcp_tool(client, tool)
    registered = host.register([source])
    original = await source.execute(arguments)
    view = await host.project_result(original, tool=tool, call_id=call_id,
        context_manifest=context_manifest, registered_tools=registered)
    return original, view, registered
