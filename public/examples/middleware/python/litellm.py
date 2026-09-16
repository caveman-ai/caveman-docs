from caveman_middleware.litellm import CavemanLiteLLM

def run(*, model, messages, runtime, scope):
    runtime.ready()
    client = CavemanLiteLLM(runtime=runtime)
    try:
        return client.completion(scope=scope, model=model, messages=messages)
    finally:
        client.close()
