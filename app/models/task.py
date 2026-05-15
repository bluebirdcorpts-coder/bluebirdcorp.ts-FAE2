from datetime import datetime
from enum import Enum
from typing import Any, Dict, Optional
from pydantic import BaseModel, Field
from sqlalchemy import JSON, DateTime, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column
from app.db.database import Base


class TaskStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class TaskType(str, Enum):
    PRODUCT_ANALYSIS = "product_analysis"
    CONTENT_GENERATION = "content_generation"
    PRICING_OPTIMIZATION = "pricing_optimization"
    COMPETITIVE_RESEARCH = "competitive_research"
    TREND_ANALYSIS = "trend_analysis"


# === SQLAlchemy ORM Model ===

class TaskORM(Base):
    __tablename__ = "tasks"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    task_type: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    status: Mapped[str] = mapped_column(String(32), default=TaskStatus.PENDING, index=True)
    payload: Mapped[Optional[Dict]] = mapped_column(JSON, nullable=True)
    result: Mapped[Optional[Dict]] = mapped_column(JSON, nullable=True)
    error: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    agent_id: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    started_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)


# === Pydantic Schemas ===

class TaskCreate(BaseModel):
    task_type: TaskType
    payload: Optional[Dict[str, Any]] = None


class TaskRead(BaseModel):
    id: int
    task_type: TaskType
    status: TaskStatus
    payload: Optional[Dict[str, Any]] = None
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    agent_id: Optional[str] = None
    created_at: datetime
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class TaskUpdate(BaseModel):
    status: Optional[TaskStatus] = None
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    agent_id: Optional[str] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None


class OrchestrateRequest(BaseModel):
    task_type: TaskType
    payload: Dict[str, Any] = Field(default_factory=dict)
    async_mode: bool = Field(default=False, description="Run asynchronously via task queue")


class OrchestrateResponse(BaseModel):
    task_id: int
    status: TaskStatus
    result: Optional[Dict[str, Any]] = None
    message: str = "Task initiated"
