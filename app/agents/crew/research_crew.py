"""
4-Agent Sequential Research Pipeline
──────────────────────────────────────
[1] MarketResearchAgent  → 웹 검색 + 시장 분석
[2] IdeationAgent        → 3가지 제품 컨셉 도출
[3] ValidationAgent      → 리스크·실현가능성 검증
[4] PRDWriterAgent       → PRD(제품 요구사항 정의서) 작성
"""
import json
from typing import Any, Dict, List
from app.services.ai_engine import AIEngine
from app.agents.crew.tools import WebSearchTool
from app.core.logging import get_logger

logger = get_logger(__name__)

_PERSONA = (
    "당신은 10년 경력의 IT 서비스 상품 기획 전문가입니다. "
    "논리적이고 데이터 기반으로 사고하며, 항상 시장 검증과 사용자 가치를 최우선으로 합니다. "
    "모든 출력은 반드시 요청된 JSON 스키마를 따릅니다."
)


class ResearchCrew:
    def __init__(self, ai_engine: AIEngine, search_tool: WebSearchTool):
        self.ai = ai_engine
        self.search = search_tool

    # ── 공개 진입점 ────────────────────────────────────────────

    async def run(self, topic: str) -> Dict[str, Any]:
        logger.info("crew.start", topic=topic)

        # 1) 웹 검색 (실시간 데이터)
        sources = self._gather_sources(topic)
        search_context = self.search.format_for_prompt(sources)

        # 2) 에이전트 순차 실행
        research = await self._market_research(topic, search_context)
        ideation = await self._ideation(topic, research)
        validation = await self._validation(topic, ideation)
        prd = await self._write_prd(topic, research, ideation, validation)

        logger.info("crew.done", topic=topic)
        return {
            "research": research,
            "ideation": ideation,
            "validation": validation,
            "prd": prd,
            "sources": sources,
        }

    # ── 내부 에이전트 메서드 ───────────────────────────────────

    async def _market_research(self, topic: str, search_context: str) -> Dict[str, Any]:
        schema = (
            '{"market_overview": str, "target_customers": [str], '
            '"key_trends": [str], "market_size_estimate": str, '
            '"pain_points": [str], "opportunities": [str]}'
        )
        prompt = (
            f"주제: {topic}\n\n"
            f"## 실시간 웹 검색 결과\n{search_context}\n\n"
            f"위 자료를 바탕으로 시장 조사 보고서를 작성하세요. JSON 스키마: {schema}\n"
            f"JSON만 반환하세요."
        )
        raw = await self.ai.complete(
            system_prompt=f"{_PERSONA}\n\n역할: 시장 조사 전문가",
            messages=[{"role": "user", "content": prompt}],
        )
        return self._parse(raw, "market_research")

    async def _ideation(self, topic: str, research: Dict[str, Any]) -> Dict[str, Any]:
        schema = (
            '{"concepts": [{"name": str, "tagline": str, "description": str, '
            '"target_segment": str, "key_features": [str], "revenue_model": str}], '
            '"recommended_concept": int}'
        )
        prompt = (
            f"주제: {topic}\n\n"
            f"## 시장 조사 결과\n{json.dumps(research, ensure_ascii=False)}\n\n"
            f"시장 조사 결과를 바탕으로 3가지 차별화된 제품 컨셉을 제안하세요.\n"
            f"JSON 스키마: {schema}\n(recommended_concept은 0,1,2 중 가장 유망한 인덱스)\n"
            f"JSON만 반환하세요."
        )
        raw = await self.ai.complete(
            system_prompt=f"{_PERSONA}\n\n역할: 아이디어 기획 전문가",
            messages=[{"role": "user", "content": prompt}],
        )
        return self._parse(raw, "ideation")

    async def _validation(self, topic: str, ideation: Dict[str, Any]) -> Dict[str, Any]:
        schema = (
            '{"evaluations": [{"concept_index": int, "feasibility_score": float, '
            '"market_fit_score": float, "risks": [str], "mitigations": [str], '
            '"verdict": "go"|"pivot"|"drop"}], "final_recommendation": str}'
        )
        prompt = (
            f"주제: {topic}\n\n"
            f"## 제안된 제품 컨셉\n{json.dumps(ideation, ensure_ascii=False)}\n\n"
            f"각 컨셉의 실현 가능성, 시장 적합성, 리스크를 비판적으로 검증하세요.\n"
            f"JSON 스키마: {schema}\n(점수는 0.0~1.0)\n"
            f"JSON만 반환하세요."
        )
        raw = await self.ai.complete(
            system_prompt=f"{_PERSONA}\n\n역할: 검증 및 리스크 분석 전문가",
            messages=[{"role": "user", "content": prompt}],
        )
        return self._parse(raw, "validation")

    async def _write_prd(
        self,
        topic: str,
        research: Dict[str, Any],
        ideation: Dict[str, Any],
        validation: Dict[str, Any],
    ) -> str:
        # PRD는 마크다운 텍스트로 출력 (JSON 아님)
        rec_idx = ideation.get("recommended_concept", 0)
        concepts = ideation.get("concepts", [])
        chosen = concepts[rec_idx] if concepts else {}

        prompt = (
            f"# PRD 작성 요청\n\n"
            f"**주제**: {topic}\n\n"
            f"## 선정된 제품 컨셉\n```json\n{json.dumps(chosen, ensure_ascii=False, indent=2)}\n```\n\n"
            f"## 검증 결과 요약\n{validation.get('final_recommendation', '')}\n\n"
            f"## 시장 조사 핵심\n"
            f"- 시장 개요: {research.get('market_overview', '')}\n"
            f"- 주요 고통점: {', '.join(research.get('pain_points', []))}\n\n"
            f"---\n\n"
            f"위 내용을 바탕으로 **PRD(제품 요구사항 정의서)**를 마크다운으로 작성하세요.\n\n"
            f"필수 섹션:\n"
            f"1. 제품 개요 (Overview)\n"
            f"2. 문제 정의 (Problem Statement)\n"
            f"3. 목표 고객 (Target Users)\n"
            f"4. 핵심 기능 (Core Features) — 우선순위 포함\n"
            f"5. 비기능 요구사항 (Non-functional Requirements)\n"
            f"6. 성공 지표 (Success Metrics / KPI)\n"
            f"7. 출시 로드맵 (Roadmap) — Phase 1/2/3\n"
            f"8. 리스크 및 완화 방안 (Risks & Mitigations)\n"
        )
        prd = await self.ai.complete(
            system_prompt=f"{_PERSONA}\n\n역할: 시니어 프로덕트 매니저 (PRD 작성 전문가)",
            messages=[{"role": "user", "content": prompt}],
        )
        return prd

    # ── 유틸 ──────────────────────────────────────────────────

    def _gather_sources(self, topic: str) -> List[Dict[str, Any]]:
        queries = [
            topic,
            f"{topic} 시장 동향 2025",
            f"{topic} 경쟁사 분석",
        ]
        sources: List[Dict[str, Any]] = []
        for q in queries:
            try:
                sources.extend(self.search.search(q, max_results=4))
            except Exception as e:
                logger.warning("web_search.failed", query=q, error=str(e))
        # 중복 URL 제거
        seen: set = set()
        unique = []
        for s in sources:
            if s["url"] not in seen:
                seen.add(s["url"])
                unique.append(s)
        return unique[:12]

    def _parse(self, raw: str, stage: str) -> Dict[str, Any]:
        text = raw.strip()
        # ```json ... ``` 펜스 제거
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            logger.warning("crew.parse_error", stage=stage)
            return {"raw_output": raw, "parse_error": True}
