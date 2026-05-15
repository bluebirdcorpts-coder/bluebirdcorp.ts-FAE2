"""
Orchestrates the full research pipeline for a given ResearchJob.
Called by both the API (immediate) and the scheduler (scheduled).
"""
from app.core.logging import get_logger
from app.db.database import get_session_factory
from app.db.repositories.research_repo import ResearchRepository

logger = get_logger(__name__)


async def run_research_job(job_id: int) -> None:
    session_factory = get_session_factory()
    async with session_factory() as session:
        repo = ResearchRepository(session)
        job = await repo.get_by_id(job_id)
        if not job:
            logger.error("research_service.job_not_found", job_id=job_id)
            return

        await repo.mark_running(job_id)
        await session.commit()

    # Run pipeline outside transaction to avoid long-held lock
    try:
        from app.services.ai_engine import AIEngine
        from app.agents.crew.tools import WebSearchTool
        from app.agents.crew.research_crew import ResearchCrew

        ai_engine = AIEngine()
        search_tool = WebSearchTool()
        crew = ResearchCrew(ai_engine=ai_engine, search_tool=search_tool)

        result = await crew.run(job.topic)

        async with session_factory() as session:
            repo = ResearchRepository(session)
            updated = await repo.mark_completed(
                job_id=job_id,
                result_research=result["research"],
                result_ideation=result["ideation"],
                result_validation=result["validation"],
                result_prd=result["prd"],
                search_sources=result["sources"],
            )
            await session.commit()

        # Export to Google Sheets if requested
        if updated and updated.save_target in ("sheets", "both"):
            await _export_to_sheets(job_id, job.topic, result)

        logger.info("research_service.completed", job_id=job_id)

    except Exception as exc:
        error_msg = str(exc)
        logger.error("research_service.failed", job_id=job_id, error=error_msg)
        async with session_factory() as session:
            repo = ResearchRepository(session)
            await repo.mark_failed(job_id, error_msg)
            await session.commit()


async def _export_to_sheets(job_id: int, topic: str, result: dict) -> None:
    try:
        from app.services.sheets_service import SheetsService

        sheets = SheetsService()
        url = await sheets.save_research(topic=topic, result=result)

        session_factory = get_session_factory()
        async with session_factory() as session:
            repo = ResearchRepository(session)
            await repo.set_sheets_result(job_id, url)
            await session.commit()

        logger.info("research_service.sheets_saved", job_id=job_id, url=url)
    except Exception as exc:
        logger.warning("research_service.sheets_failed", job_id=job_id, error=str(exc))
