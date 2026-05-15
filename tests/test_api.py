import pytest
from httpx import AsyncClient, ASGITransport
from main import app


@pytest.fixture
async def client():
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        yield ac


@pytest.mark.asyncio
async def test_health(client):
    response = await client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


@pytest.mark.asyncio
async def test_readiness(client):
    response = await client.get("/api/v1/health/ready")
    assert response.status_code == 200
    assert response.json()["status"] == "ready"


@pytest.mark.asyncio
async def test_create_product(client):
    payload = {
        "sku": "TEST-001",
        "name": "Test Product",
        "description": "A test product for unit tests",
        "category": "software",
        "price": 99.99,
    }
    response = await client.post("/api/v1/products", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["sku"] == "TEST-001"
    assert data["status"] == "draft"


@pytest.mark.asyncio
async def test_get_product_not_found(client):
    response = await client.get("/api/v1/products/99999")
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_list_products(client):
    response = await client.get("/api/v1/products")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
