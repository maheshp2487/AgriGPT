# ADR-0005: Mandi Cache Schema, Composite Uniqueness & Freshness Classification

## Status
Accepted

## Context
The preliminary cache schema used a flawed single primary key string `cache_key VARCHAR(192) PRIMARY KEY` based solely on `state_district_commodity`. This design was defective because:
1. It overwrote different APMC markets within the same district (e.g., Kumbakonam Regulated Market overwritten by Thanjavur Market).
2. It collapsed distinct commodity varieties (e.g., "Paddy (Common)" vs "Paddy (Basmati)").
3. It failed to preserve historical observation dates (`arrival_date`) when fresh fetches occurred.

## Decision
1. **Normalized Table Schema with Composite Unique Key:**
   The `mandi_prices_cache` table is structured with explicit columns and a composite uniqueness constraint:
   ```sql
   CREATE TABLE mandi_prices_cache (
       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
       state VARCHAR(64) NOT NULL,
       district VARCHAR(64) NOT NULL,
       market VARCHAR(128) NOT NULL,
       commodity VARCHAR(128) NOT NULL,
       variety VARCHAR(128) NOT NULL DEFAULT 'Common',
       arrival_date DATE NOT NULL,
       min_price NUMERIC(10, 2),
       max_price NUMERIC(10, 2),
       modal_price NUMERIC(10, 2) NOT NULL,
       fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
       raw_source_payload JSONB DEFAULT '{}',
       CONSTRAINT uq_mandi_record UNIQUE (state, district, market, commodity, variety, arrival_date)
   );
   ```
2. **Explicit Separation of Dates:**
   - `arrival_date`: The official transaction/arrival date reported by the APMC mandi.
   - `fetched_at`: The system timestamp when AgriGPT synced the record from OGD.
3. **Dynamic Freshness Status Calculation:**
   The API evaluates data freshness relative to the query date:
   - `FRESH` (Green badge): `arrival_date` is today or yesterday ($\le 1$ day old).
   - `DELAYED` (Amber badge): `arrival_date` is 2 to 4 days old (e.g., weekend or reporting lag).
   - `STALE` (Red warning): `arrival_date` is $\ge 5$ days old. The UI renders an explicit advisory: *"Market reporting delayed. Last recorded price was on [Date]. Do not rely on this figure for immediate spot sales without local market verification."*

## Consequences
- Preserves accurate multi-market and multi-variety pricing records.
- Farmers are never deceived into believing delayed reports are live prices.
