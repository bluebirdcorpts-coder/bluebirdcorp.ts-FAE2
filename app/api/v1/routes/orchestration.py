from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.db.repositories.task_repo import TaskRepository
from app.models.task import OrchestrateRequest, OrchestrateResponse, TaskRead
from app.services.orchestrator import Orchestrator

router = APIRouter(prefix="/orchestrate", tags=["Orchestration"])


@router.post("", response_model=OrchestrateResponse)
async def orchestrate(
    request: OrchestrateRequest,
    db: AsyncSession = Depends(get_db),
):
    orchestrator = Orchestrator(session=db)
    return await orchestrator.run(request)


@router.get("/tasks/{task_id}", response_model=TaskRead)
async def get_task(task_id: int, db: AsyncSession = Depends(get_db)):
    repo = TaskRepository(db)
    task = await repo.get_by_id(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task
