"""
RFID Sales Proposal Agent
━━━━━━━━━━━━━━━━━━━━━━━━
원본 코드의 버그 수정 및 B-APO 시스템 통합 버전

[수정된 버그]
1. tavily_url 오류 → tavily-python SDK 사용
2. search_results list 처리 → 포맷터 추가
3. message.content 리스트 → .content[0].text 추출
4. 구버전 모델 → claude-opus-4-7
5. 프롬프트 캐싱 적용 (시스템 프롬프트 과금 절감)
6. 다중 검색 쿼리로 리서치 품질 향상
7. 환경변수 기반 API 키 관리
"""
import json
from typing import Any, Dict, List, Optional
from app.services.ai_engine import AIEngine
from app.agents.crew.tools import WebSearchTool
from app.core.logging import get_logger

logger = get_logger(__name__)

# ── 블루버드 RFID 제품 컨텍스트 (캐싱 대상) ─────────────────
_BLUEBIRD_SYSTEM = """당신은 블루버드(Bluebird Corp) RFID 솔루션 수석 기술영업 전문가입니다.

[블루버드 회사 개요]
- 글로벌 Top 3 엔터프라이즈 모바일·RFID 전문 기업
- 핵심 강점: 타사 대비 안테나 성능 20% 우수, 2.4m 낙하 시험 통과 (MIL-STD-810G)
- 주력 제품: 산업용 핸드헬드 RFID 단말기, 고정형 RFID 리더기, Bluebird Universe IoT 플랫폼
- 검증 사례: 쿠팡 물류센터 RFID 고정형, 의료기기 추적관리, 냉장·냉동 콜드체인 환경

[핵심 기술 차별화]
- AI + RFID 융합: 오인식률 0% 도전 (AI 카메라 + RFID 결합)
- Bluebird Universe™: IoT 데이터 수집/분석 SaaS 플랫폼 (구독형)
- 금속·액체 환경 전용 RFID 태그 솔루션 보유
- 5G 연동 실시간 추적 지원

[제안서 작성 원칙]
- C-Level 임원 설득: ROI 정량화, 비즈니스 임팩트 중심
- 고객사 Pain Point를 검색 데이터로 근거화
- 3단계 도입 로드맵으로 리스크 분산
- 경쟁사 대비 블루버드 우위를 구체적 수치로 제시
- 마크다운 형식으로 가독성 높게 작성"""


class RFIDProposalAgent:
    """
    고객사 맞춤형 RFID 솔루션 제안서 자동 생성 에이전트.
    Tavily 실시간 웹 검색 → Claude AI 제안서 생성 파이프라인.
    """

    def __init__(self, ai_engine: AIEngine, search_tool: WebSearchTool):
        self.ai = ai_engine
        self.search = search_tool

    async def generate(
        self,
        company_name: str,
        industry: str,
        stakeholder: str = "임원(C-Level)",
        environment: Optional[str] = None,  # "금속", "냉장", "물류" 등
        extra_context: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        RFID 제안서 생성 메인 메서드.

        Args:
            company_name: 고객사명 (예: "쿠팡물류")
            industry: 산업군 (예: "콜드체인 신선식품 배송")
            stakeholder: 대상 의사결정자 (예: "물류 CTO")
            environment: 도입 환경 (예: "금속/액체 혼재 창고")
            extra_context: 추가 알려진 정보

        Returns:
            {proposal, search_sources, company, industry, stakeholder}
        """
        logger.info("rfid_agent.start", company=company_name, industry=industry)

        # ── Step 1: 다중 쿼리 웹 검색 ─────────────────────────
        sources = self._search_company_context(company_name, industry)
        context_text = self._format_search_results(sources)
        logger.info("rfid_agent.search_done", sources=len(sources))

        # ── Step 2: Claude AI 제안서 생성 ─────────────────────
        proposal_md = await self._generate_proposal(
            company_name=company_name,
            industry=industry,
            stakeholder=stakeholder,
            environment=environment or "일반 창고/공장",
            extra_context=extra_context or "",
            search_context=context_text,
        )

        logger.info("rfid_agent.done", company=company_name)
        return {
            "company": company_name,
            "industry": industry,
            "stakeholder": stakeholder,
            "environment": environment,
            "proposal": proposal_md,
            "search_sources": sources[:8],
        }

    # ── 내부 메서드 ─────────────────────────────────────────

    def _search_company_context(
        self, company_name: str, industry: str
    ) -> List[Dict[str, Any]]:
        """3가지 각도로 검색하여 풍부한 컨텍스트 수집."""
        queries = [
            f"{company_name} {industry} 물류 재고 관리 문제점 이슈",   # 고객 Pain Point
            f"{industry} RFID 도입 사례 효과 ROI 국내",                # 업계 도입 사례
            f"{company_name} 디지털 전환 스마트팩토리 현황 2024 2025",  # 기업 현황
        ]
        all_results: List[Dict[str, Any]] = []
        seen_urls: set = set()

        for query in queries:
            try:
                results = self.search.search(query, max_results=5)
                for r in results:
                    if r["url"] not in seen_urls:
                        seen_urls.add(r["url"])
                        all_results.append(r)
            except Exception as e:
                logger.warning("rfid_agent.search_failed", query=query, error=str(e))

        return all_results[:12]

    def _format_search_results(self, sources: List[Dict[str, Any]]) -> str:
        """검색 결과를 Claude에게 전달할 텍스트로 포맷."""
        if not sources:
            return "실시간 검색 결과 없음 — 업계 일반 지식 기반으로 작성"
        lines = []
        for i, s in enumerate(sources, 1):
            lines.append(
                f"[{i}] {s.get('title', '제목 없음')}\n"
                f"출처: {s.get('url', '')}\n"
                f"{s.get('content', '')[:500]}"
            )
        return "\n\n---\n\n".join(lines)

    async def _generate_proposal(
        self,
        company_name: str,
        industry: str,
        stakeholder: str,
        environment: str,
        extra_context: str,
        search_context: str,
    ) -> str:
        """Claude AI로 맞춤형 RFID 제안서 마크다운 생성."""
        user_prompt = f"""## 고객사 현황 (실시간 웹 검색 데이터)

{search_context}

{'## 추가 제공 정보\\n' + extra_context if extra_context else ''}

---

## 제안서 작성 요청

**고객사**: {company_name}
**산업군**: {industry}
**도입 환경**: {environment}
**대상**: {stakeholder}

위 검색 데이터를 근거로 {company_name}의 {stakeholder}을(를) 설득하는
**블루버드 RFID 솔루션 맞춤형 제안서**를 마크다운으로 작성하세요.

### 필수 섹션 (순서 준수):

1. **Executive Summary** (3줄 핵심 요약)
2. **고객사 현황 분석** — 검색 데이터 기반 Pain Point 3가지 (수치/사례 포함)
3. **블루버드 추천 솔루션 구성**
   - 하드웨어: 단말기 모델 + 고정형 리더기 (환경: {environment} 고려)
   - 소프트웨어: Bluebird Universe™ 플랫폼 활용 방안
   - RFID 태그: 금속/액체/냉장 여부 반영한 태그 사양
4. **정량적 도입 효과 (ROI)**
   - 재고 정확도 향상 (% 수치 제시)
   - 작업 효율 개선 (인력/시간 절감)
   - 예상 투자 회수 기간 (payback period)
5. **3단계 도입 로드맵**
   - Phase 1 (1~3개월): 파일럿
   - Phase 2 (4~6개월): 본격 도입
   - Phase 3 (7~12개월): 고도화
6. **블루버드 선택 이유** — 경쟁사 대비 차별화 포인트
7. **리스크 및 완화 방안** (표 형식)
8. **Next Step** — 다음 미팅 어젠다 및 액션 아이템"""

        return await self.ai.complete(
            system_prompt=_BLUEBIRD_SYSTEM,
            messages=[{"role": "user", "content": user_prompt}],
            cache_system=True,   # 블루버드 시스템 프롬프트 캐싱으로 비용 절감
            temperature=0.3,
        )
