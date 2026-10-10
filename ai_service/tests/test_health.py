import asyncio
from httpx import ASGITransport, AsyncClient
from app.main import app


def test_health_endpoint():
    async def _test():
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.get("/v1/health")
            assert response.status_code == 200
            data = response.json()
            assert data["status"] == "healthy"
            assert "dependencies" in data
            assert "ogd_agmarknet" in data["dependencies"]
            assert "open_meteo" in data["dependencies"]

    asyncio.run(_test())


def test_healthz_probe():
    async def _test():
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.get("/healthz")
            assert response.status_code == 200
            assert response.json()["status"] == "healthy"

    asyncio.run(_test())
