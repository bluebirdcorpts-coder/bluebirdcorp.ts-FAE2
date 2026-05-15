import asyncio
from app.workers.celery_app import celery_app
from app.core.logging import get_logger

logger = get_logger(__name__)


@celery_app.task(bind=True, name="dispatch_task", max_retries=3)
def dispatch_task(self, task_id: int, task_type: str, payload: dict):
    """Celery task that wraps async agent execution."""
    try:
        asyncio.run(_run_async(task_id, task_type, payload))
    except Exception as exc:
        logger.error("worker.task_failed", task_id=task_id, error=str(exc))
        raise self.retry(exc=exc, countdown=2 ** self.request.retries)


async def _run_async(task_id: int, task_type: str, payload: dict):
    from sqlalchemy.ext.asyncio import AsyncSession
    from app.db.database import get_session_factory
    from app.db.repositories.task_repo import TaskRepository
    from app.models.task import TaskType, OrchestrateRequest
    from app.services.orchestrator import Orchestrator

    session_factory = get_session_factory()
    async with session_factory() as session:
        repo = TaskRepository(session)
        task = await repo.get_by_id(task_id)
        if not task:
            logger.error("worker.task_not_found", task_id=task_id)
            return

        orchestrator = Orchestrator(session=session)
        request = OrchestrateRequest(
            task_type=TaskType(task_type),
            payload=payload,
            async_mode=False,
        )
        await orchestrator._execute(task_type, payload, f"worker-{task_id}")
        await session.commit()
