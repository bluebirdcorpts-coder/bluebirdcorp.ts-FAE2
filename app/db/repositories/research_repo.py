from datetime import datetime
from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.research import ResearchJobCreate, ResearchJobORM, ResearchStatus


class ResearchRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, data: ResearchJobCreate) -> ResearchJobORM:
        status = ResearchStatus.SCHEDULED if data.scheduled_at else ResearchStatus.PENDING
        job = ResearchJobORM(
            topic=data.topic,
            scheduled_at=data.scheduled_at,
            save_target=data.save_target.value,
            status=status.value,
        )
        self.session.add(job)
        await self.session.flush()
        await self.session.refresh(job)
        return job

    async def get_by_id(self, job_id: int) -> Optional[ResearchJobORM]:
        result = await self.session.execute(
            select(ResearchJobORM).where(ResearchJobORM.id == job_id)
        )
        return result.scalar_one_or_none()

    async def list(self, offset: int = 0, limit: int = 50) -> List[ResearchJobORM]:
        result = await self.session.execute(
            select(ResearchJobORM)
            .order_by(ResearchJobORM.created_at.desc())
            .offset(offset)
            .limit(limit)
        )
        return list(result.scalars().all())

    async def list_pending_scheduled(self) -> List[ResearchJobORM]:
        now = datetime.utcnow()
        result = await self.session.execute(
            select(ResearchJobORM).where(
                ResearchJobORM.status == ResearchStatus.SCHEDULED.value,
                ResearchJobORM.scheduled_at <= now,
            )
        )
        return list(result.scalars().all())

    async def mark_running(self, job_id: int) -> Optional[ResearchJobORM]:
        job = await self.get_by_id(job_id)
        if not job:
            return None
        job.status = ResearchStatus.RUNNING.value
        job.started_at = datetime.utcnow()
        await self.session.flush()
        return job

    async def mark_completed(
        self,
        job_id: int,
        result_research: dict,
        result_ideation: dict,
        result_validation: dict,
        result_prd: str,
        search_sources: list,
    ) -> Optional[ResearchJobORM]:
        job = await self.get_by_id(job_id)
        if not job:
            return None
        job.status = ResearchStatus.COMPLETED.value
        job.result_research = result_research
        job.result_ideation = result_ideation
        job.result_validation = result_validation
        job.result_prd = result_prd
        job.search_sources = search_sources
        job.completed_at = datetime.utcnow()
        await self.session.flush()
        return job

    async def mark_failed(self, job_id: int, error: str) -> Optional[ResearchJobORM]:
        job = await self.get_by_id(job_id)
        if not job:
            return None
        job.status = ResearchStatus.FAILED.value
        job.error = error
        job.completed_at = datetime.utcnow()
        await self.session.flush()
        return job

    async def set_sheets_result(
        self, job_id: int, sheets_url: str
    ) -> Optional[ResearchJobORM]:
        job = await self.get_by_id(job_id)
        if not job:
            return None
        job.saved_to_sheets = True
        job.sheets_url = sheets_url
        await self.session.flush()
        return job
