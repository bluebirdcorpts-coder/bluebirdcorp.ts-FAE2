from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field
from sqlalchemy import Boolean, DateTime, Integer, String, Text, JSON
from sqlalchemy.orm import Mapped, mapped_column
from app.db.database import Base


class ResearchStatus(str, Enum):
    PENDING = "pending"
    SCHEDULED = "scheduled"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


class SaveTarget(str, Enum):
    DB = "db"
    SHEETS = "sheets"
    BOTH = "both"


# === ORM ===

class ResearchJobORM(Base):
    __tablename__ = "research_jobs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    topic: Mapped[str] = mapped_column(String(512), nullable=False, index=True)
    status: Mapped[str] = mapped_column(String(32), default=ResearchStatus.PENDING, index=True)
    save_target: Mapped[str] = mapped_column(String(16), default=SaveTarget.BOTH)

    # Agent outputs
    result_research: Mapped[Optional[Dict]] = mapped_column(JSON, nullable=True)
    result_ideation: Mapped[Optional[Dict]] = mapped_column(JSON, nullable=True)
    result_validation: Mapped[Optional[Dict]] = mapped_column(JSON, nullable=True)
    result_prd: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Web search sources
    search_sources: Mapped[Optional[List]] = mapped_column(JSON, nullable=True)

    # Export
    saved_to_sheets: Mapped[bool] = mapped_column(Boolean, default=False)
    sheets_url: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)

    error: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    scheduled_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    started_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)


# === Pydantic Schemas ===

class ResearchJobCreate(BaseModel):
    topic: str = Field(..., min_length=2, max_length=512, description="조사할 주제")
    scheduled_at: Optional[datetime] = Field(
        None, description="예약 실행 시간 (null이면 즉시 실행)"
    )
    save_target: SaveTarget = Field(
        default=SaveTarget.BOTH,
        description="저장 대상: db | sheets | both"
    )


class ResearchJobRead(BaseModel):
    id: int
    topic: str
    status: ResearchStatus
    save_target: SaveTarget
    result_research: Optional[Dict[str, Any]] = None
    result_ideation: Optional[Dict[str, Any]] = None
    result_validation: Optional[Dict[str, Any]] = None
    result_prd: Optional[str] = None
    search_sources: Optional[List[Dict[str, Any]]] = None
    saved_to_sheets: bool = False
    sheets_url: Optional[str] = None
    error: Optional[str] = None
    scheduled_at: Optional[datetime] = None
    created_at: datetime
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class ResearchJobSummary(BaseModel):
    id: int
    topic: str
    status: ResearchStatus
    saved_to_sheets: bool
    sheets_url: Optional[str] = None
    created_at: datetime
    completed_at: Optional[datetime] = None

    model_config = {"from_attributes": True}
