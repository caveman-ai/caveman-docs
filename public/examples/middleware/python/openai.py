from caveman_middleware.openai import with_caveman_openai

def run(*, client, model, messages, runtime, scope):
    runtime.ready()
    wrapped = with_caveman_openai(client, runtime=runtime, scope=scope)
    return wrapped.chat.completions.create(model=model, messages=messages)
