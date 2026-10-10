from datetime import date, datetime
from typing import Any, Dict, List, Optional
import httpx
from dateutil import parser as date_parser

from app.core.config import settings
from app.core.logging import logger
from app.db.cache import mandi_cache
from app.schemas.mandi import (
    FreshnessStatus,
    MandiDataPayload,
    MandiMarketRecord,
    MandiPriceRange,
    MandiPriceResponse,
    MandiSourceAttribution,
)


class AGMARKNETProvider:
    """
    Authoritative server-side adapter for AGMARKNET wholesale market data via OGD India.
    Resource: Current Daily Price of Various Commodities from Various Markets (Mandi)
    ID: 9ef84268-d588-465a-a308-a864a43d0070
    """

    def __init__(self, http_client: Optional[httpx.AsyncClient] = None):
        self._client = http_client

    def _get_client(self) -> httpx.AsyncClient:
        if self._client:
            return self._client
        return httpx.AsyncClient(timeout=settings.OGD_TIMEOUT_SECONDS)

    def _parse_arrival_date(self, raw_date: str) -> date:
        try:
            # Handles "09/10/2026", "2026-10-09", etc.
            return date_parser.parse(raw_date, dayfirst=True).date()
        except Exception:
            return date.today()

    def _calculate_freshness(self, arrival: date) -> tuple[FreshnessStatus, bool]:
        today = date.today()
        age_days = (today - arrival).days
        if age_days <= 1:
            return FreshnessStatus.FRESH, False
        elif 2 <= age_days <= 4:
            return FreshnessStatus.DELAYED, False
        else:
            return FreshnessStatus.STALE, True

    async def fetch_prices(
        self,
        state: str,
        district: str,
        commodity: str,
        limit: int = 20
    ) -> MandiPriceResponse:
        """
        Queries live OGD endpoint. If network fails or times out,
        falls back to composite cache. NEVER fabricates prices.
        """
        api_key = settings.OGD_API_KEY.get_secret_value()
        url = f"{settings.OGD_BASE_URL}/{settings.OGD_RESOURCE_ID}"

        params: Dict[str, Any] = {
            "format": "json",
            "limit": limit,
            "filters[state]": state,
            "filters[district]": district,
            "filters[commodity]": commodity,
        }
        if api_key:
            params["api-key"] = api_key

        live_records: List[MandiMarketRecord] = []
        is_live_success = False
        error_reason: Optional[str] = None

        client = self._get_client()
        try:
            response = await client.get(url, params=params)
            if response.status_code == 200:
                payload = response.json()
                raw_records = payload.get("records", [])

                for item in raw_records:
                    raw_arrival = item.get("arrival_date", "")
                    arrival = self._parse_arrival_date(raw_arrival)

                    modal_val = float(item.get("modal_price", 0) or 0)
                    min_val = float(item.get("min_price", 0) or 0) if item.get("min_price") else None
                    max_val = float(item.get("max_price", 0) or 0) if item.get("max_price") else None

                    market_name = item.get("market", "Unknown Regulated Market")
                    variety = item.get("variety", "Common")

                    # Write into composite cache for historical preservation
                    mandi_cache.put_record(
                        state=state,
                        district=district,
                        market=market_name,
                        commodity=commodity,
                        variety=variety,
                        arrival_date=arrival,
                        min_price=min_val,
                        max_price=max_val,
                        modal_price=modal_val,
                    )

                    freshness, is_stale = self._calculate_freshness(arrival)
                    live_records.append(
                        MandiMarketRecord(
                            market_name=market_name,
                            variety=variety,
                            arrival_date=arrival,
                            prices=MandiPriceRange(
                                min=min_val,
                                max=max_val,
                                modal=modal_val
                            ),
                            freshness=freshness,
                            is_stale=is_stale,
                            data_source="AGMARKNET_LIVE"
                        )
                    )

                is_live_success = True
            else:
                error_reason = f"Upstream OGD returned status {response.status_code}"
                logger.warning(f"AGMARKNET upstream error: {error_reason}")

        except httpx.ConnectError as exc:
            error_reason = f"Connection refused by OGD portal: {str(exc)}"
            logger.warning(f"AGMARKNET connection error: {error_reason}")
        except httpx.TimeoutException:
            error_reason = f"Upstream OGD timed out after {settings.OGD_TIMEOUT_SECONDS}s"
            logger.warning(f"AGMARKNET timeout: {error_reason}")
        except Exception as exc:
            error_reason = f"Unexpected upstream error: {str(exc)}"
            logger.error(f"AGMARKNET exception: {error_reason}")
        finally:
            if not self._client:
                await client.aclose()

        # If live call succeeded, return live records
        if is_live_success and live_records:
            return MandiPriceResponse(
                success=True,
                data=MandiDataPayload(
                    state=state,
                    district=district,
                    commodity=commodity,
                    markets=live_records,
                    source=MandiSourceAttribution(
                        resource_id=settings.OGD_RESOURCE_ID,
                        retrieved_at=datetime.now(),
                        is_live_fetch=True,
                        cache_status="LIVE"
                    )
                )
            )

        # Fallback to local composite cache
        cached = mandi_cache.get_records(state, district, commodity)
        if cached:
            logger.info(f"Serving {len(cached)} cached records for {district}/{commodity}")
            return MandiPriceResponse(
                success=True,
                data=MandiDataPayload(
                    state=state,
                    district=district,
                    commodity=commodity,
                    markets=cached,
                    source=MandiSourceAttribution(
                        resource_id=settings.OGD_RESOURCE_ID,
                        retrieved_at=datetime.now(),
                        is_live_fetch=False,
                        cache_status="CACHED_FALLBACK"
                    )
                )
            )

        # If upstream failed AND no cached records exist, raise error (Never fake data!)
        raise RuntimeError(
            f"Unable to retrieve mandi prices for '{commodity}' in '{district}', '{state}'. "
            f"Upstream AGMARKNET portal was unavailable ({error_reason}) and no verified cached records exist."
        )


agmarknet_provider = AGMARKNETProvider()
