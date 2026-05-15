from fastapi import APIRouter
from app.api.v1.routes import health, products, orchestration, research, rfid

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(health.router)
api_router.include_router(products.router)
api_router.include_router(orchestration.router)
api_router.include_router(research.router)
api_router.include_router(rfid.router)
