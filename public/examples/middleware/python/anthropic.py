from caveman_middleware.anthropic import with_caveman_anthropic

def run(*, client, model, messages, runtime, scope):
    runtime.ready()
    wrapped = with_caveman_anthropic(client, runtime=runtime, scope=scope)
    return wrapped.messages.create(model=model, max_tokens=512, messages=messages)
