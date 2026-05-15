import json
from typing import Any, Dict
from app.agents.base_agent import BaseAgent


_ANALYSIS_SCHEMAS = {
    "product_analysis": (
        '{"summary": str, "strengths": [str], "weaknesses": [str], '
        '"opportunities": [str], "recommendations": [str], "confidence_score": float}'
    ),
    "pricing_optimization": (
        '{"current_price_assessment": str, "suggested_price_range": {"min": float, "max": float}, '
        '"pricing_strategy": str, "rationale": str, "confidence_score": float}'
    ),
    "competitive_research": (
        '{"market_position": str, "key_competitors": [str], "differentiators": [str], '
        '"threats": [str], "strategic_moves": [str], "confidence_score": float}'
    ),
    "trend_analysis": (
        '{"current_trends": [str], "emerging_trends": [str], "declining_trends": [str], '
        '"impact_assessment": str, "recommended_actions": [str], "confidence_score": float}'
    ),
}

_DEFAULT_SCHEMA = (
    '{"summary": str, "insights": [str], "recommendations": [str], "confidence_score": float}'
)


class AnalysisAgent(BaseAgent):
    """Performs structured product analysis across multiple dimensions."""

    async def run(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        analysis_type = payload.get("analysis_type", "product_analysis")
        product_name = payload.get("product_name", "Unknown Product")
        product_data = payload.get("product_data", {})
        context_query = payload.get("context_query", product_name)

        schema = _ANALYSIS_SCHEMAS.get(analysis_type, _DEFAULT_SCHEMA)
        context = await self.retrieve_context(context_query)

        system_extra = (
            f"You are specialized in {analysis_type.replace('_', ' ')}.\n"
            f"Return JSON matching exactly: {schema}"
        )

        messages = [
            {
                "role": "user",
                "content": (
                    f"Perform {analysis_type.replace('_', ' ')} for:\n"
                    f"Product: {product_name}\n"
                    f"Data: {json.dumps(product_data, ensure_ascii=False)}\n\n"
                    f"Relevant context from knowledge base:\n{context}\n\n"
                    f"Return valid JSON only."
                ),
            }
        ]

        raw = await self.ai_engine.complete(
            system_prompt=self._build_system(system_extra),
            messages=messages,
        )

        self.logger.info(
            "analysis_agent.complete",
            agent_id=self.agent_id,
            analysis_type=analysis_type,
            product=product_name,
        )

        try:
            result = json.loads(raw)
            result["analysis_type"] = analysis_type
            return result
        except json.JSONDecodeError:
            return {"raw_output": raw, "analysis_type": analysis_type, "parse_error": True}
