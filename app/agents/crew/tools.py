from typing import Any, Dict, List, Optional
from app.core.config import get_settings
from app.core.logging import get_logger

logger = get_logger(__name__)


class WebSearchTool:
    """Tavily-based web search for real-time market intelligence."""

    def __init__(self):
        settings = get_settings()
        if not settings.tavily_api_key:
            raise ValueError("TAVILY_API_KEY is not set in .env")
        from tavily import TavilyClient
        self._client = TavilyClient(api_key=settings.tavily_api_key)

    def search(
        self,
        query: str,
        max_results: int = 6,
        search_depth: str = "advanced",
        include_domains: Optional[List[str]] = None,
    ) -> List[Dict[str, Any]]:
        params: Dict[str, Any] = {
            "query": query,
            "max_results": max_results,
            "search_depth": search_depth,
        }
        if include_domains:
            params["include_domains"] = include_domains

        response = self._client.search(**params)
        results = response.get("results", [])
        logger.info("web_search.done", query=query, results=len(results))
        return [
            {
                "title": r.get("title", ""),
                "url": r.get("url", ""),
                "content": r.get("content", ""),
                "score": r.get("score", 0.0),
            }
            for r in results
        ]

    def format_for_prompt(self, results: List[Dict[str, Any]]) -> str:
        if not results:
            return "검색 결과 없음"
        lines = []
        for i, r in enumerate(results, 1):
            lines.append(f"[{i}] {r['title']}\n출처: {r['url']}\n{r['content'][:400]}")
        return "\n\n".join(lines)
