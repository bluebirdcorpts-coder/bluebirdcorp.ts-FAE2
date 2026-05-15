from abc import ABC, abstractmethod
from typing import Any, Dict
from app.services.ai_engine import AIEngine
from app.services.vector_store import VectorStore
from app.core.logging import get_logger

logger = get_logger(__name__)

BASE_SYSTEM_PROMPT = """You are B-APO, an AI-driven Product Orchestrator developed by Bluebird Corp.
Your role is to analyze products, generate insights, and provide actionable recommendations
to help product teams make data-driven decisions.

Always respond in structured JSON format matching the requested output schema.
Be concise, specific, and evidence-based in your analysis."""


class BaseAgent(ABC):
    """Abstract base for all B-APO agents."""

    def __init__(self, ai_engine: AIEngine, vector_store: VectorStore, agent_id: str):
        self.ai_engine = ai_engine
        self.vector_store = vector_store
        self.agent_id = agent_id
        self.logger = get_logger(f"{__name__}.{self.__class__.__name__}")

    @abstractmethod
    async def run(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Execute the agent's primary task and return a result dict."""

    async def retrieve_context(self, query: str, n_results: int = 5) -> str:
        hits = self.vector_store.search_products(query, n_results=n_results)
        if not hits:
            return "No relevant product context found."
        lines = []
        for hit in hits:
            lines.append(f"[{hit['id']}] {hit['document']} (distance={hit['distance']:.3f})")
        return "\n".join(lines)

    def _build_system(self, extra: str = "") -> str:
        if extra:
            return f"{BASE_SYSTEM_PROMPT}\n\n{extra}"
        return BASE_SYSTEM_PROMPT
