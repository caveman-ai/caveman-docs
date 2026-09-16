from caveman_middleware.llama_index import CavemanFunctionAgent

def build(*, llm, tools, runtime, scope):
    return CavemanFunctionAgent(
        llm=llm, tools=tools, runtime=runtime, scope=scope,
        system_prompt="Use tool evidence; recover original content when needed.")
