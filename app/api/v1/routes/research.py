import asyncio
from typing import List
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.db.repositories.research_repo import ResearchRepository
from app.models.research import ResearchJobCreate, ResearchJobRead, ResearchJobSummary

router = APIRouter(prefix="/research", tags=["Research (AI Employee)"])


@router.post("", response_model=ResearchJobRead, status_code=202)
async def create_research_job(
    data: ResearchJobCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    """
    주제와 저장 대상을 받아 AI 4-에이전트 파이프라인을 실행합니다.
    - scheduled_at = null → 즉시 실행 (백그라운드)
    - scheduled_at = 미래 시간 → 스케줄러가 해당 시간에 자동 실행
    """
    repo = ResearchRepository(db)
    job = await repo.create(data)
    await db.commit()
    await db.refresh(job)

    if not data.scheduled_at:
        # 즉시 실행 — BackgroundTasks로 API 응답을 차단하지 않음
        from app.services.research_service import run_research_job
        background_tasks.add_task(run_research_job, job.id)

    return job


@router.get("", response_model=List[ResearchJobSummary])
async def list_research_jobs(
    offset: int = 0,
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
):
    repo = ResearchRepository(db)
    return await repo.list(offset=offset, limit=limit)


@router.get("/{job_id}", response_model=ResearchJobRead)
async def get_research_job(job_id: int, db: AsyncSession = Depends(get_db)):
    repo = ResearchRepository(db)
    job = await repo.get_by_id(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Research job not found")
    return job


@router.delete("/{job_id}", status_code=204)
async def delete_research_job(job_id: int, db: AsyncSession = Depends(get_db)):
    repo = ResearchRepository(db)
    job = await repo.get_by_id(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Research job not found")
    await db.delete(job)
    await db.commit()
