"""Deterministic transport fixture; never sends provider or service traffic."""
import io
import json
from urllib.parse import urlsplit

calls = []

def urlopen(request, *, timeout):
    url = urlsplit(request.full_url)
    assert url.netloc == 'sdk.fixture.invalid'
    headers = {k.lower(): v for k, v in request.header_items()}
    assert headers.get('authorization') == 'Bearer fixture-key' or headers.get('x-cave-api-key') == 'fixture-key'
    body = json.loads(request.data) if request.data else {}
    calls.append(url.path)
    if url.path == '/sdk/v1/compress':
        assert timeout == 300
        data = dict(output='compressed fixture', tokens_before=100, tokens_after=25, token_count_basis='fixture', content_type=body.get('content_type'), recovery_handle='fixture-handle')
    elif url.path == '/sdk/v1/tool-search':
        assert body['tools'][0]['name'] == 'lookup_status'
        assert body['max_tools'] == 1
        data = dict(tools=[body['tools'][0]], session_id='fixture-session', sent_schema_tokens=20, full_schema_tokens=100, deferred_count=0, token_basis='fixture', method='fixture')
    elif url.path == '/sdk/v1/context/pack':
        assert body['options']['max_tokens'] == 4096
        data = dict(items=body['items'][:2], deferred_ids=['older'], tokens_used=30, tokens_before=50, tokens_saved=20, deferred_count=1)
    elif url.path == '/sdk/v1/checkpoints':
        assert body['messages'][0]['content'] == 'Remember incident INC-42.'
        data = dict(source_ref='fixture-checkpoint')
    elif url.path == '/sdk/v1/checkpoints/fixture-checkpoint/expand':
        data = dict(source_ref='fixture-checkpoint', messages=[dict(role='user', content='Remember incident INC-42.')])
    elif url.path == '/sdk/v1/artifacts':
        assert body['value']['incident'] == 'INC-42'
        data = dict(stored=True, artifact_id='fixture-artifact')
    elif url.path == '/sdk/v1/events':
        assert body['name'] == 'lookup_status'
        assert headers['x-cave-trace-id']
        data = dict(ok=True)
    elif url.path == '/v1/traces':
        assert body['resourceSpans'][0]['scopeSpans'][0]['spans']
        data = dict(ok=True)
    elif url.path == '/sdk/v1/runtime-policy':
        data = {}
    elif url.path in ('/openai/v1/responses', '/openai/v1/chat/completions', '/anthropic/v1/messages'):
        assert timeout == 300
        assert body['model'] == 'fixture-model'
        if 'tools' in body:
            assert body['tools'][0]['parameters']['type'] == 'object'
            assert headers['x-cave-tool-session'] == 'fixture-session'
        data = dict(id='fixture-response', output=[], usage=dict(input_tokens=10, output_tokens=5))
    else:
        raise AssertionError(f'Unexpected documentation request: {url.path}')
    return io.BytesIO(json.dumps(data).encode())
