from datetime import date, datetime
from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field


class FreshnessStatus(str, Enum):
    FRESH = "FRESH"          # <= 1 day old
    DELAYED = "DELAYED"      # 2 to 4 days old
    STALE = "STALE"          # >= 5 days old


class MandiPriceRange(BaseModel):
    min: Optional[float] = Field(None, description="Minimum price in INR per Quintal")
    max: Optional[float] = Field(None, description="Maximum price in INR per Quintal")
    modal: float = Field(..., description="Modal price in INR per Quintal")
    unit: str = Field(default="INR/Quintal", description="Standard price unit")


class MandiMarketRecord(BaseModel):
    market_name: str
    variety: str = "Common"
    arrival_date: date
    arrival_quantity_tonnes: Optional[float] = None
    prices: MandiPriceRange
    freshness: FreshnessStatus
    is_stale: bool
    data_source: str = "AGMARKNET"


class MandiSourceAttribution(BaseModel):
    provider: str = "AGMARKNET / Directorate of Marketing & Inspection, MoA&FW"
    portal: str = "data.gov.in"
    licence: str = "Government Open Data License - India (GODL)"
    resource_id: str
    retrieved_at: datetime
    is_live_fetch: bool = True
    cache_status: str = "LIVE"  # "LIVE" | "CACHED_FALLBACK" | "STALE_CACHE"


class MandiDataPayload(BaseModel):
    state: str
    district: str
    commodity: str
    markets: List[MandiMarketRecord]
    source: MandiSourceAttribution


class MandiPriceResponse(BaseModel):
    success: bool
    data: MandiDataPayload
