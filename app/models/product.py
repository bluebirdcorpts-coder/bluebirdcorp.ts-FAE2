from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field
from sqlalchemy import JSON, DateTime, Float, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column
from app.db.database import Base


class ProductStatus(str, Enum):
    DRAFT = "draft"
    ACTIVE = "active"
    ARCHIVED = "archived"
    UNDER_REVIEW = "under_review"


class ProductCategory(str, Enum):
    HARDWARE = "hardware"
    SOFTWARE = "software"
    SERVICE = "service"
    BUNDLE = "bundle"


# === SQLAlchemy ORM Model ===

class ProductORM(Base):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    sku: Mapped[str] = mapped_column(String(64), unique=True, index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    category: Mapped[str] = mapped_column(String(32), nullable=False)
    status: Mapped[str] = mapped_column(String(32), default=ProductStatus.DRAFT)
    price: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    metadata_: Mapped[Optional[Dict]] = mapped_column("metadata", JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )


# === Pydantic Schemas ===

class ProductBase(BaseModel):
    sku: str = Field(..., min_length=1, max_length=64)
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    category: ProductCategory
    price: Optional[float] = Field(None, ge=0)
    metadata: Optional[Dict[str, Any]] = None


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    category: Optional[ProductCategory] = None
    status: Optional[ProductStatus] = None
    price: Optional[float] = Field(None, ge=0)
    metadata: Optional[Dict[str, Any]] = None


class ProductRead(ProductBase):
    id: int
    status: ProductStatus
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ProductAnalysisRequest(BaseModel):
    product_id: int
    analysis_type: str = Field(
        default="comprehensive",
        description="Type: comprehensive | pricing | competitive | trend"
    )
    context: Optional[Dict[str, Any]] = None


class ProductAnalysisResult(BaseModel):
    product_id: int
    analysis_type: str
    summary: str
    insights: List[str]
    recommendations: List[str]
    confidence_score: float = Field(ge=0.0, le=1.0)
    raw_output: Optional[str] = None
