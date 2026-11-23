from autogen_agentchat.agents import AssistantAgent
from caveman_middleware.autogen import with_caveman_agent

def build(*, model_client, tools, runtime, scope):
    return AssistantAgent(**with_caveman_agent({
        "name": "log_analyst", "model_client": model_client,
        "tools": tools, "max_tool_iterations": 4,
    }, runtime=runtime, scope=scope))
