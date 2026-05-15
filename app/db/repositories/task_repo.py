from datetime import datetime
from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.task import TaskCreate, TaskORM, TaskStatus, TaskUpdate


class TaskRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, data: TaskCreate) -> TaskORM:
        task = TaskORM(
            task_type=data.task_type.value,
            payload=data.payload,
        )
        self.session.add(task)
        await self.session.flush()
        await self.session.refresh(task)
        return task

    async def get_by_id(self, task_id: int) -> Optional[TaskORM]:
        result = await self.session.execute(
            select(TaskORM).where(TaskORM.id == task_id)
        )
        return result.scalar_one_or_none()

    async def list_by_status(self, status: TaskStatus, limit: int = 100) -> List[TaskORM]:
        result = await self.session.execute(
            select(TaskORM)
            .where(TaskORM.status == status.value)
            .order_by(TaskORM.created_at.asc())
            .limit(limit)
        )
        return list(result.scalars().all())

    async def update(self, task_id: int, data: TaskUpdate) -> Optional[TaskORM]:
        task = await self.get_by_id(task_id)
        if not task:
            return None
        for field, value in data.model_dump(exclude_none=True).items():
            if hasattr(task, field):
                setattr(task, field, value)
        await self.session.flush()
        await self.session.refresh(task)
        return task

    async def mark_running(self, task_id: int, agent_id: str) -> Optional[TaskORM]:
        return await self.update(
            task_id,
            TaskUpdate(
                status=TaskStatus.RUNNING,
                agent_id=agent_id,
                started_at=datetime.utcnow(),
            ),
        )

    async def mark_completed(self, task_id: int, result: dict) -> Optional[TaskORM]:
        return await self.update(
            task_id,
            TaskUpdate(
                status=TaskStatus.COMPLETED,
                result=result,
                completed_at=datetime.utcnow(),
            ),
        )

    async def mark_failed(self, task_id: int, error: str) -> Optional[TaskORM]:
        return await self.update(
            task_id,
            TaskUpdate(
                status=TaskStatus.FAILED,
                error=error,
                completed_at=datetime.utcnow(),
            ),
        )
