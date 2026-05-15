from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.product import ProductCreate, ProductORM, ProductUpdate


class ProductRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, data: ProductCreate) -> ProductORM:
        product = ProductORM(
            sku=data.sku,
            name=data.name,
            description=data.description,
            category=data.category.value,
            price=data.price,
            metadata_=data.metadata,
        )
        self.session.add(product)
        await self.session.flush()
        await self.session.refresh(product)
        return product

    async def get_by_id(self, product_id: int) -> Optional[ProductORM]:
        result = await self.session.execute(
            select(ProductORM).where(ProductORM.id == product_id)
        )
        return result.scalar_one_or_none()

    async def get_by_sku(self, sku: str) -> Optional[ProductORM]:
        result = await self.session.execute(
            select(ProductORM).where(ProductORM.sku == sku)
        )
        return result.scalar_one_or_none()

    async def list(self, offset: int = 0, limit: int = 50) -> List[ProductORM]:
        result = await self.session.execute(
            select(ProductORM).offset(offset).limit(limit)
        )
        return list(result.scalars().all())

    async def update(self, product_id: int, data: ProductUpdate) -> Optional[ProductORM]:
        product = await self.get_by_id(product_id)
        if not product:
            return None
        for field, value in data.model_dump(exclude_none=True).items():
            mapped = "metadata_" if field == "metadata" else field
            if hasattr(product, mapped):
                setattr(product, mapped, value)
        await self.session.flush()
        await self.session.refresh(product)
        return product

    async def delete(self, product_id: int) -> bool:
        product = await self.get_by_id(product_id)
        if not product:
            return False
        await self.session.delete(product)
        await self.session.flush()
        return True
