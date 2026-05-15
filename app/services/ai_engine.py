from typing import Any, Dict, List, Optional
import anthropic
from tenacity import retry, stop_after_attempt, wait_exponential
from app.core.config import get_settings
from app.core.logging import get_logger

logger = get_logger(__name__)


class AIEngine:
    """Thin wrapper around the Anthropic client with prompt caching and retry logic."""

    def __init__(self):
        settings = get_settings()
        self._client = anthropic.AsyncAnthropic(api_key=settings.anthropic_api_key)
        self._model = settings.claude_model
        self._max_tokens = settings.claude_max_tokens

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        reraise=True,
    )
    async def complete(
        self,
        system_prompt: str,
        messages: List[Dict[str, Any]],
        *,
        cache_system: bool = True,
        temperature: float = 0.3,
        extra_headers: Optional[Dict[str, str]] = None,
    ) -> str:
        system = [
            {
                "type": "text",
                "text": system_prompt,
                # Enable prompt caching for long system prompts
                **({"cache_control": {"type": "ephemeral"}} if cache_system else {}),
            }
        ]

        response = await self._client.messages.create(
            model=self._model,
            max_tokens=self._max_tokens,
            system=system,
            messages=messages,
            extra_headers=extra_headers or {"anthropic-beta": "prompt-caching-2024-07-31"},
        )

        usage = response.usage
        logger.info(
            "ai_engine.complete",
            model=self._model,
            input_tokens=usage.input_tokens,
            output_tokens=usage.output_tokens,
            cache_read=getattr(usage, "cache_read_input_tokens", 0),
            cache_creation=getattr(usage, "cache_creation_input_tokens", 0),
        )

        return response.content[0].text

    async def embed(self, texts: List[str]) -> List[List[float]]:
        """Placeholder — ChromaDB uses its own embedding by default."""
        raise NotImplementedError(
            "Use ChromaDB's built-in embedding or set CHROMA_EMBEDDING_MODEL"
        )
