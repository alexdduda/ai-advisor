"""
Langfuse LLM observability — wraps every Claude call to record cost,
latency, token usage, and user/session context.

Gracefully disabled when LANGFUSE_PUBLIC_KEY / LANGFUSE_SECRET_KEY are
not set (local dev, CI) so nothing breaks without credentials.
"""
from __future__ import annotations

import logging
import time
from contextlib import contextmanager
from typing import Any

logger = logging.getLogger(__name__)

_langfuse = None
_enabled = False


def _get_client():
    global _langfuse, _enabled
    if _langfuse is not None:
        return _langfuse
    try:
        from ..config import settings
        if not settings.LANGFUSE_PUBLIC_KEY or not settings.LANGFUSE_SECRET_KEY:
            return None
        from langfuse import Langfuse
        _langfuse = Langfuse(
            public_key=settings.LANGFUSE_PUBLIC_KEY,
            secret_key=settings.LANGFUSE_SECRET_KEY,
            host=settings.LANGFUSE_HOST,
        )
        _enabled = True
        logger.info("Langfuse observability enabled")
    except Exception as e:
        logger.warning("Langfuse init failed, observability disabled: %s", e)
        _langfuse = None
    return _langfuse


@contextmanager
def trace_claude(
    *,
    name: str,
    user_id: str | None = None,
    session_id: str | None = None,
    metadata: dict | None = None,
    input_messages: list | None = None,
    model: str | None = None,
    max_tokens: int | None = None,
):
    """
    Context manager that wraps a Claude API call with Langfuse tracing.

    Usage:
        with trace_claude(name="chat", user_id=uid, session_id=sid,
                          input_messages=msgs, model=model) as gen:
            response = client.messages.create(...)
            gen.finish(response)
    """
    lf = _get_client()
    if lf is None:
        yield _NoopGeneration()
        return

    trace = lf.trace(
        name=name,
        user_id=str(user_id) if user_id else None,
        session_id=str(session_id) if session_id else None,
        metadata=metadata or {},
    )
    generation = trace.generation(
        name=name,
        model=model,
        input=input_messages,
        model_parameters={"max_tokens": max_tokens} if max_tokens else {},
    )
    gen_wrapper = _Generation(generation, lf)
    start = time.perf_counter()
    try:
        yield gen_wrapper
    except Exception:
        generation.end(level="ERROR")
        raise
    finally:
        if not gen_wrapper.finished:
            generation.end()
        try:
            lf.flush()
        except Exception:
            pass


class _Generation:
    def __init__(self, generation, lf):
        self._g = generation
        self._lf = lf
        self.finished = False

    def finish(self, response: Any) -> None:
        try:
            output = response.content[0].text if response.content else ""
            usage = getattr(response, "usage", None)
            self._g.end(
                output=output,
                usage={
                    "input": getattr(usage, "input_tokens", 0),
                    "output": getattr(usage, "output_tokens", 0),
                    "cache_read_input_tokens": getattr(usage, "cache_read_input_tokens", 0),
                    "cache_creation_input_tokens": getattr(usage, "cache_creation_input_tokens", 0),
                } if usage else {},
            )
        except Exception as e:
            logger.debug("Langfuse finish error: %s", e)
        self.finished = True


class _NoopGeneration:
    finished = True
    def finish(self, response: Any) -> None:
        pass
