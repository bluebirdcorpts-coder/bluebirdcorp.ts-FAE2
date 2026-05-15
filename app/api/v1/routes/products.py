from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.db.repositories.product_repo import ProductRepository
from app.models.product import ProductCreate, ProductRead, ProductUpdate
from app.services.vector_store import VectorStore

router = APIRouter(prefix="/products", tags=["Products"])


def get_vector_store() -> VectorStore:
    return VectorStore()


@router.post("", response_model=ProductRead, status_code=status.HTTP_201_CREATED)
async def create_product(
    data: ProductCreate,
    db: AsyncSession = Depends(get_db),
    vs: VectorStore = Depends(get_vector_store),
):
    repo = ProductRepository(db)
    existing = await repo.get_by_sku(data.sku)
    if existing:
        raise HTTPException(status_code=400, detail=f"SKU '{data.sku}' already exists")

    product = await repo.create(data)
    vs.index_product(
        product_id=product.id,
        name=product.name,
        description=product.description or "",
        metadata={"category": product.category, "status": product.status},
    )
    return product


@router.get("", response_model=List[ProductRead])
async def list_products(
    offset: int = 0,
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
):
    repo = ProductRepository(db)
    return await repo.list(offset=offset, limit=limit)


@router.get("/{product_id}", response_model=ProductRead)
async def get_product(product_id: int, db: AsyncSession = Depends(get_db)):
    repo = ProductRepository(db)
    product = await repo.get_by_id(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.patch("/{product_id}", response_model=ProductRead)
async def update_product(
    product_id: int,
    data: ProductUpdate,
    db: AsyncSession = Depends(get_db),
    vs: VectorStore = Depends(get_vector_store),
):
    repo = ProductRepository(db)
    product = await repo.update(product_id, data)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    vs.index_product(
        product_id=product.id,
        name=product.name,
        description=product.description or "",
        metadata={"category": product.category, "status": product.status},
    )
    return product


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(
    product_id: int,
    db: AsyncSession = Depends(get_db),
    vs: VectorStore = Depends(get_vector_store),
):
    repo = ProductRepository(db)
    deleted = await repo.delete(product_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Product not found")
    vs.delete([f"product:{product_id}"])
