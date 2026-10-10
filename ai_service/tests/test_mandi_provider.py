import asyncio
from datetime import date, timedelta
import pytest
import httpx
from app.providers.agmarknet import AGMARKNETProvider
from app.db.cache import mandi_cache
from app.schemas.mandi import FreshnessStatus


MOCK_OGD_RESPONSE = {
    "records": [
        {
            "state": "Tamil Nadu",
            "district": "Thanjavur",
            "market": "Kumbakonam",
            "commodity": "Groundnut",
            "variety": "Local",
            "arrival_date": "10/10/2026",
            "min_price": "2200",
            "max_price": "2600",
            "modal_price": "2450"
        },
        {
            "state": "Tamil Nadu",
            "district": "Thanjavur",
            "market": "Thanjavur",
            "commodity": "Groundnut",
            "variety": "Bold",
            "arrival_date": "09/10/2026",
            "min_price": "2300",
            "max_price": "2700",
            "modal_price": "2500"
        }
    ]
}


def test_mandi_provider_live_success():
    async def _test():
        mandi_cache.clear()

        def handler(request: httpx.Request) -> httpx.Response:
            return httpx.Response(200, json=MOCK_OGD_RESPONSE)

        transport = httpx.MockTransport(handler)
        async with httpx.AsyncClient(transport=transport) as mock_client:
            provider = AGMARKNETProvider(http_client=mock_client)
            result = await provider.fetch_prices("Tamil Nadu", "Thanjavur", "Groundnut")

            assert result.success is True
            assert result.data.district == "Thanjavur"
            assert len(result.data.markets) == 2
            assert result.data.markets[0].market_name == "Kumbakonam"
            assert result.data.markets[0].prices.modal == 2450.0
            assert result.data.markets[0].prices.unit == "INR/Quintal"
            assert result.data.source.is_live_fetch is True
            assert result.data.source.cache_status == "LIVE"

    asyncio.run(_test())


def test_mandi_composite_cache_and_freshness():
    mandi_cache.clear()
    today = date.today()

    # Record 1: Fresh (today)
    mandi_cache.put_record(
        state="Tamil Nadu",
        district="Thanjavur",
        market="Kumbakonam",
        commodity="Groundnut",
        variety="Local",
        arrival_date=today,
        min_price=2200,
        max_price=2600,
        modal_price=2450
    )

    # Record 2: Delayed (3 days ago)
    delayed_date = today - timedelta(days=3)
    mandi_cache.put_record(
        state="Tamil Nadu",
        district="Thanjavur",
        market="Papanasam",
        commodity="Groundnut",
        variety="Local",
        arrival_date=delayed_date,
        min_price=2100,
        max_price=2500,
        modal_price=2350
    )

    # Record 3: Stale (6 days ago)
    stale_date = today - timedelta(days=6)
    mandi_cache.put_record(
        state="Tamil Nadu",
        district="Thanjavur",
        market="Orathanadu",
        commodity="Groundnut",
        variety="Local",
        arrival_date=stale_date,
        min_price=2000,
        max_price=2400,
        modal_price=2200
    )

    cached_records = mandi_cache.get_records("Tamil Nadu", "Thanjavur", "Groundnut")
    assert len(cached_records) == 3

    # Check freshness states
    fresh_rec = next(r for r in cached_records if r.market_name == "Kumbakonam")
    assert fresh_rec.freshness == FreshnessStatus.FRESH
    assert fresh_rec.is_stale is False

    delayed_rec = next(r for r in cached_records if r.market_name == "Papanasam")
    assert delayed_rec.freshness == FreshnessStatus.DELAYED
    assert delayed_rec.is_stale is False

    stale_rec = next(r for r in cached_records if r.market_name == "Orathanadu")
    assert stale_rec.freshness == FreshnessStatus.STALE
    assert stale_rec.is_stale is True


def test_mandi_provider_connection_error_with_cached_fallback():
    async def _test():
        mandi_cache.clear()
        # Populate cache
        mandi_cache.put_record(
            state="Tamil Nadu",
            district="Thanjavur",
            market="Kumbakonam",
            commodity="Groundnut",
            variety="Local",
            arrival_date=date.today() - timedelta(days=2),
            min_price=2200,
            max_price=2600,
            modal_price=2450
        )

        def failing_handler(request: httpx.Request) -> httpx.Response:
            raise httpx.ConnectError("Connection refused by api.data.gov.in")

        transport = httpx.MockTransport(failing_handler)
        async with httpx.AsyncClient(transport=transport) as mock_client:
            provider = AGMARKNETProvider(http_client=mock_client)
            result = await provider.fetch_prices("Tamil Nadu", "Thanjavur", "Groundnut")

            assert result.success is True
            assert result.data.source.is_live_fetch is False
            assert result.data.source.cache_status == "CACHED_FALLBACK"
            assert len(result.data.markets) == 1
            assert result.data.markets[0].market_name == "Kumbakonam"

    asyncio.run(_test())


def test_mandi_provider_fails_closed_when_no_cache_exists():
    async def _test():
        mandi_cache.clear()

        def failing_handler(request: httpx.Request) -> httpx.Response:
            raise httpx.ConnectError("Connection refused")

        transport = httpx.MockTransport(failing_handler)
        async with httpx.AsyncClient(transport=transport) as mock_client:
            provider = AGMARKNETProvider(http_client=mock_client)
            with pytest.raises(RuntimeError) as exc_info:
                await provider.fetch_prices("Tamil Nadu", "Thanjavur", "Cotton")
            assert "no verified cached records exist" in str(exc_info.value)

    asyncio.run(_test())
