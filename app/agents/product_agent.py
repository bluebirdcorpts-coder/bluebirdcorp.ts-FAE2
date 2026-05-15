import json
from typing import Any, Dict
from app.agents.base_agent import BaseAgent


class ProductAgent(BaseAgent):
    """Generates product descriptions, marketing copy, and content."""

    SYSTEM_EXTRA = """You are specialized in product content generation.
Produce compelling, SEO-friendly product descriptions and marketing content.
Output JSON: {"title": str, "short_description": str, "long_description": str, "tags": [str], "seo_keywords": [str]}"""

    async def run(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        product_name = payload.get("product_name", "Unknown Product")
        category = payload.get("category", "general")
        features = payload.get("features", [])
        tone = payload.get("tone", "professional")

        context = await self.retrieve_context(f"{product_name} {category}")

        messages = [
            {
                "role": "user",
                "content": (
                    f"Generate product content for:\n"
                    f"- Name: {product_name}\n"
                    f"- Category: {category}\n"
                    f"- Key features: {', '.join(features) if features else 'N/A'}\n"
                    f"- Tone: {tone}\n\n"
                    f"Similar products context:\n{context}\n\n"
                    f"Return valid JSON only."
                ),
            }
        ]

        raw = await self.ai_engine.complete(
            system_prompt=self._build_system(self.SYSTEM_EXTRA),
            messages=messages,
        )

        self.logger.info("product_agent.complete", agent_id=self.agent_id, product=product_name)

        try:
            return json.loads(raw)
        except json.JSONDecodeError:
            return {"raw_output": raw, "parse_error": True}
