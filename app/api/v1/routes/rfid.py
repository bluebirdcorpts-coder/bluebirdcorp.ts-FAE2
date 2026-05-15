from typing import Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from app.agents.rfid_agent import RFIDProposalAgent
from app.services.ai_engine import AIEngine
from app.agents.crew.tools import WebSearchTool

router = APIRouter(prefix="/rfid", tags=["RFID Proposal"])


class RFIDProposalRequest(BaseModel):
    company_name: str = Field(..., min_length=1, max_length=100, description="고객사명")
    industry: str = Field(..., min_length=1, max_length=100, description="산업군")
    stakeholder: str = Field(default="임원(C-Level)", description="대상 의사결정자")
    environment: Optional[str] = Field(None, description="도입 환경 (금속/냉장/물류 등)")
    extra_context: Optional[str] = Field(None, description="추가 고객사 정보")


class RFIDProposalResponse(BaseModel):
    company: str
    industry: str
    stakeholder: str
    environment: Optional[str]
    proposal: str
    search_sources: list


@router.post("/proposal", response_model=RFIDProposalResponse)
async def generate_rfid_proposal(request: RFIDProposalRequest):
    """
    고객사 맞춤형 RFID 솔루션 제안서 생성.
    Tavily 실시간 웹 검색 + Claude AI 제안서 작성.
    """
    try:
        ai_engine = AIEngine()
        search_tool = WebSearchTool()
        agent = RFIDProposalAgent(ai_engine=ai_engine, search_tool=search_tool)

        result = await agent.generate(
            company_name=request.company_name,
            industry=request.industry,
            stakeholder=request.stakeholder,
            environment=request.environment,
            extra_context=request.extra_context,
        )
        return RFIDProposalResponse(**result)

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"제안서 생성 실패: {str(e)}")
