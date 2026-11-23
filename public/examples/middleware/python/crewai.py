from crewai import Agent
from caveman_middleware.crewai import with_caveman_agent

def build(*, llm, tools, runtime, scope):
    return Agent(**with_caveman_agent({
        "role": "Log analyst", "goal": "Summarize tool evidence accurately",
        "backstory": "You inspect logs and recover original evidence when needed.",
        "llm": llm, "tools": tools, "max_iter": 4,
    }, runtime=runtime, scope=scope))
