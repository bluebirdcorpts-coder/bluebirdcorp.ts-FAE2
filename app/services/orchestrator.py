import uuid
from typing import Any, Dict
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.logging import get_logger
from app.db.repositories.task_repo import TaskRepository
from app.models.task import OrchestrateRequest, OrchestrateResponse, TaskCreate, TaskStatus

logger = get_logger(__name__)


class Orchestrator:
    """Central coordinator that routes tasks to the appropriate agent."""

    def __init__(self, session: AsyncSession):
        self._task_repo = TaskRepository(session)

    async def run(self, request: OrchestrateRequest) -> OrchestrateResponse:
        task = await self._task_repo.create(
            TaskCreate(task_type=request.task_type, payload=request.payload)
        )
        agent_id = f"agent-{uuid.uuid4().hex[:8]}"

        logger.info(
            "orchestrator.run",
            task_id=task.id,
            task_type=request.task_type,
            agent_id=agent_id,
            async_mode=request.async_mode,
        )

        if request.async_mode:
            # Enqueue to Celery — task runs in worker process
            from app.workers.tasks import dispatch_task
            dispatch_task.delay(task.id, request.task_type.value, request.payload)
            return OrchestrateResponse(
                task_id=task.id,
                status=TaskStatus.PENDING,
                message="Task queued for async processing",
            )

        # Synchronous execution
        await self._task_repo.mark_running(task.id, agent_id)
        try:
            result = await self._execute(request.task_type.value, request.payload, agent_id)
            await self._task_repo.mark_completed(task.id, result)
            return OrchestrateResponse(
                task_id=task.id,
                status=TaskStatus.COMPLETED,
                result=result,
                message="Task completed successfully",
            )
        except Exception as exc:
            error_msg = str(exc)
            logger.error("orchestrator.failed", task_id=task.id, error=error_msg)
            await self._task_repo.mark_failed(task.id, error_msg)
            return OrchestrateResponse(
                task_id=task.id,
                status=TaskStatus.FAILED,
                message=f"Task failed: {error_msg}",
            )

    async def _execute(self, task_type: str, payload: Dict[str, Any], agent_id: str) -> Dict[str, Any]:
        from app.agents.product_agent import ProductAgent
        from app.agents.analysis_agent import AnalysisAgent
        from app.services.ai_engine import AIEngine
        from app.services.vector_store import VectorStore

        ai_engine = AIEngine()
        vector_store = VectorStore()

        agent_map = {
            "product_analysis": AnalysisAgent,
            "content_generation": ProductAgent,
            "pricing_optimization": AnalysisAgent,
            "competitive_research": AnalysisAgent,
            "trend_analysis": AnalysisAgent,
        }

        agent_cls = agent_map.get(task_type)
        if not agent_cls:
            raise ValueError(f"Unknown task type: {task_type}")

        agent = agent_cls(ai_engine=ai_engine, vector_store=vector_store, agent_id=agent_id)
        return await agent.run(payload)
