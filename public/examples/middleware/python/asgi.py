from caveman_middleware.asgi import ASGIContext, CavemanASGIMiddleware

def attach(*, app, runtime, trusted_scope):
    async def resolve_context(asgi_scope):
        # Authentication middleware must have established this trusted server state.
        if not asgi_scope.get("state", {}).get("authenticated"):
            return None
        return ASGIContext(scope=trusted_scope(asgi_scope))
    return CavemanASGIMiddleware(app, runtime=runtime,
        routes={"/v1/chat/completions": "openai-chat"},
        resolve_context=resolve_context)
