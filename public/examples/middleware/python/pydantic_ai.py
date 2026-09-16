from pydantic_ai import Agent
from caveman_middleware.pydantic_ai import CavemanCapability

def build(*, model, runtime, scope):
    return Agent(model, capabilities=[CavemanCapability(runtime=runtime, scope=scope)])
