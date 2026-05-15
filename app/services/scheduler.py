"""
APScheduler-based job scheduler integrated with FastAPI lifespan.
Polls every 60 seconds for due research jobs and executes them.
"""
import asyncio
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
from app.core.logging import get_logger

logger = get_logger(__name__)

_scheduler: AsyncIOScheduler | None = None


def get_scheduler() -> AsyncIOScheduler:
    global _scheduler
    if _scheduler is None:
        _scheduler = AsyncIOScheduler(timezone="UTC")
    return _scheduler


async def _poll_and_run_due_jobs() -> None:
    """Check for scheduled research jobs that are due and execute them."""
    from app.db.database import get_session_factory
    from app.db.repositories.research_repo import ResearchRepository
    from app.services.research_service import run_research_job

    session_factory = get_session_factory()
    async with session_factory() as session:
        repo = ResearchRepository(session)
        due_jobs = await repo.list_pending_scheduled()
        if due_jobs:
            logger.info("scheduler.due_jobs", count=len(due_jobs))
        for job in due_jobs:
            asyncio.create_task(run_research_job(job.id))


def start_scheduler() -> None:
    scheduler = get_scheduler()
    scheduler.add_job(
        _poll_and_run_due_jobs,
        trigger=IntervalTrigger(seconds=60),
        id="poll_research_jobs",
        replace_existing=True,
        coalesce=True,
        max_instances=1,
    )
    scheduler.start()
    logger.info("scheduler.started")


def stop_scheduler() -> None:
    scheduler = get_scheduler()
    if scheduler.running:
        scheduler.shutdown(wait=False)
        logger.info("scheduler.stopped")
