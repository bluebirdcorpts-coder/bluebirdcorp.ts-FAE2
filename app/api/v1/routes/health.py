from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/health", tags=["Health"])


class HealthResponse(BaseModel):
    status: str
    service: str
    version: str = "1.0.0"


@router.get("", response_model=HealthResponse)
async def health_check():
    return HealthResponse(status="ok", service="Bluebird B-APO")


@router.get("/ready", response_model=HealthResponse)
async def readiness_check():
    return HealthResponse(status="ready", service="Bluebird B-APO")
