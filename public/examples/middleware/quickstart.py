import copy
import hashlib
import json
import os
import re
import time
import uuid
from caveman_cloud.middleware import MiddlewareRuntime, Scope
from caveman_middleware.langchain import with_caveman_agent
from langchain.agents import create_agent
from langchain_core.language_models.chat_models import BaseChatModel
from langchain_core.messages import AIMessage, HumanMessage, ToolMessage
from langchain_core.outputs import ChatGeneration, ChatResult
from langchain_core.tools import tool

mode = os.getenv("DEMO_MODE", "record")
if mode not in ("off", "record", "compress"):
    raise ValueError("Invalid DEMO_MODE")
paid = os.getenv("PAID_PROVIDER") == "1"
original = "".join(f"[INFO] worker=alpha request={i} status=healthy latency_ms=12 café 🌍\r\n" for i in range(800))
reports = []

def on_report(report):
    from dataclasses import asdict
    reports.append(report)
    print(json.dumps(asdict(report)))

runtime = MiddlewareRuntime(endpoint=os.getenv("CAVEMAN_ENDPOINT", "http://127.0.0.1:8787"),
    token=os.getenv("CAVEMAN_AUTH_TOKEN"), mode=mode, deadline_ms=500,
    retrieve_deadline_ms=5000, on_report=on_report)
# In an application, derive namespace/session from authenticated account/conversation IDs.
scope = Scope("docs-demo", str(uuid.uuid4()), "main", "1")

@tool
def read_log() -> str:
    """Read the demo worker log."""
    return original

history = [HumanMessage("Read log; recover all original pages if shortened, then summarize status."),
    AIMessage("", tool_calls=[{"id": "read-1", "name": "read_log", "args": {}}]),
    ToolMessage(original, tool_call_id="read-1", name="read_log")]
for i, message in enumerate(history):
    message.id = f"history-{i}"
before = copy.deepcopy(history)

class ScriptedModel(BaseChatModel):
    handle: str | None = None
    recovery_calls: int = 0

    @property
    def _llm_type(self):
        return "deterministic-caveman-docs-fixture"

    def bind_tools(self, tools, **kwargs):
        return self

    def _generate(self, messages, stop=None, run_manager=None, **kwargs):
        match = re.search(r"cmw_[a-f0-9]{48}", str(messages))
        if match:
            self.handle = match.group(0)
        recovered = any(isinstance(m, ToolMessage) and m.name == "caveman_retrieve" for m in messages)
        if self.handle and not recovered:
            self.recovery_calls += 1
            output = AIMessage("", tool_calls=[{"id": "recover-1", "name": "caveman_retrieve", "args": {"handle": self.handle, "limit": 262144}}])
        else:
            output = AIMessage("Deterministic fixture completed.")
        return ChatResult(generations=[ChatGeneration(message=output)])

try:
    if mode != "off":
        caps = runtime.ready()
        print("capabilities", {key: caps[key] for key in ("mode", "persistent", "recovery", "retention_seconds")})
    model = ScriptedModel()
    if paid:
        if not os.getenv("OPENAI_API_KEY") or not os.getenv("OPENAI_MODEL"):
            raise ValueError("Set OPENAI_API_KEY and OPENAI_MODEL for paid run")
        from langchain_openai import ChatOpenAI
        model = ChatOpenAI(model=os.environ["OPENAI_MODEL"], max_retries=0)
    agent = create_agent(**with_caveman_agent({"model": model, "tools": [read_log]}, runtime=runtime, scope=scope))
    started = time.perf_counter()
    result = agent.invoke({"messages": history}, {"recursion_limit": 12})
    assert history == before, "Application history must retain original bytes"
    if not paid and mode == "off":
        assert any(r.status == "disabled" for r in reports)
    if not paid and mode == "record":
        assert any(r.status == "recorded" for r in reports)
    if not paid and mode == "compress":
        assert any(r.status in ("applied", "reused") for r in reports), "Expected compression; inspect reports"
        assert model.recovery_calls == 1, "Native loop must execute recovery"
        offset, restored = 0, ""
        while offset is not None:
            page = runtime.retrieve(scope, handle=model.handle, offset=offset, limit=4096)
            assert page["kind"] == "original_page"
            restored += page["text"]
            offset = page["next_offset"]
        assert restored == original
        print("exact recovery SHA-256", hashlib.sha256(restored.encode()).hexdigest())
    print({"text": result["messages"][-1].content, "elapsed_ms": round((time.perf_counter()-started)*1000),
        "usage": [m.usage_metadata for m in result["messages"] if isinstance(m, AIMessage)] if paid else "fixture; not provider usage",
        "unchanged_history": True})
finally:
    runtime.close()
