from langchain.agents import create_agent
from caveman_middleware.langchain import with_caveman_agent

def run(*, model, tools, messages, runtime, scope):
    runtime.ready()
    agent = create_agent(**with_caveman_agent(
        {"model": model, "tools": tools}, runtime=runtime, scope=scope))
    return agent.invoke({"messages": messages}, {"recursion_limit": 12})
