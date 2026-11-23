from google import genai
from google.genai import types
from caveman_middleware.google import (
    CavemanGoogleTransport, CavemanGoogleAsyncTransport, with_caveman_google,
)

def run(*, api_key, model, contents, runtime, scope):
    runtime.ready()
    transport = CavemanGoogleTransport(runtime=runtime, scope=scope)
    async_transport = CavemanGoogleAsyncTransport(runtime=runtime.as_async(), scope=scope)
    client = genai.Client(api_key=api_key, http_options=types.HttpOptions(
        client_args={"transport": transport}, async_client_args={"transport": async_transport}))
    try:
        wrapped = with_caveman_google(client, runtime=runtime, scope=scope)
        return wrapped.models.generate_content(model=model, contents=contents)
    finally:
        client.close()
