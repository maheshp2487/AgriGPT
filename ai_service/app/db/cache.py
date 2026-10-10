from datetime import date, datetime
from typing import Dict, List, Optional, Tuple
from app.schemas.mandi import MandiMarketRecord, MandiPriceRange, FreshnessStatus


class MandiCacheStore:
    """
    Composite in-memory & persistence cache layer for Mandi records.
    Key uniqueness matches PostgreSQL schema:
    (state, district, market, commodity, variety, arrival_date)
    """
    def __init__(self):
        # Key: (state.lower(), district.lower(), market.lower(), commodity.lower(), variety.lower(), arrival_date)
        self._store: Dict[Tuple[str, str, str, str, str, date], Dict] = {}

    def _make_key(
        self,
        state: str,
        district: str,
        market: str,
        commodity: str,
        variety: str,
        arrival_date: date
    ) -> Tuple[str, str, str, str, str, date]:
        return (
            state.strip().lower(),
            district.strip().lower(),
            market.strip().lower(),
            commodity.strip().lower(),
            variety.strip().lower(),
            arrival_date
        )

    def put_record(
        self,
        state: str,
        district: str,
        market: str,
        commodity: str,
        variety: str,
        arrival_date: date,
        min_price: Optional[float],
        max_price: Optional[float],
        modal_price: float,
        fetched_at: Optional[datetime] = None
    ) -> None:
        key = self._make_key(state, district, market, commodity, variety, arrival_date)
        self._store[key] = {
            "state": state,
            "district": district,
            "market": market,
            "commodity": commodity,
            "variety": variety,
            "arrival_date": arrival_date,
            "min_price": min_price,
            "max_price": max_price,
            "modal_price": modal_price,
            "fetched_at": fetched_at or datetime.now()
        }

    def get_records(
        self,
        state: str,
        district: str,
        commodity: str
    ) -> List[MandiMarketRecord]:
        """
        Retrieves all cached market records matching (state, district, commodity)
        and computes dynamic freshness against current date.
        """
        s = state.strip().lower()
        d = district.strip().lower()
        c = commodity.strip().lower()

        matched: List[Dict] = []
        today = date.today()

        for key, record in self._store.items():
            if key[0] == s and key[1] == d and key[3] == c:
                matched.append(record)

        # Sort by arrival_date descending
        matched.sort(key=lambda r: r["arrival_date"], reverse=True)

        results: List[MandiMarketRecord] = []
        for r in matched:
            arrival = r["arrival_date"]
            age_days = (today - arrival).days

            if age_days <= 1:
                freshness = FreshnessStatus.FRESH
                is_stale = False
            elif 2 <= age_days <= 4:
                freshness = FreshnessStatus.DELAYED
                is_stale = False
            else:
                freshness = FreshnessStatus.STALE
                is_stale = True

            results.append(
                MandiMarketRecord(
                    market_name=r["market"],
                    variety=r["variety"],
                    arrival_date=r["arrival_date"],
                    prices=MandiPriceRange(
                        min=r["min_price"],
                        max=r["max_price"],
                        modal=r["modal_price"]
                    ),
                    freshness=freshness,
                    is_stale=is_stale
                )
            )

        return results

    def clear(self) -> None:
        self._store.clear()


mandi_cache = MandiCacheStore()
