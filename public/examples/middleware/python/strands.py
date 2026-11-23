from strands import Agent
from caveman_middleware.strands import with_caveman_agent

def build(*, model, tools, runtime, scope):
    return Agent(**with_caveman_agent(
        {"model": model, "tools": tools}, runtime=runtime, scope=scope))
