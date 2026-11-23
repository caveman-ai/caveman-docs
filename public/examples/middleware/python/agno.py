from agno.agent import Agent
from caveman_middleware.agno import with_caveman_agent

def build(*, model, tools, runtime, scope):
    return Agent(**with_caveman_agent(
        {"model": model, "tools": tools}, runtime=runtime, scope=scope))
