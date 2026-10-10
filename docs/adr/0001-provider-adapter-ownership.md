# ADR-0001: External Provider Adapter Ownership

## Status
Accepted

## Context
In early architectural sketches, external provider calls (AGMARKNET OGD, IMD/Open-Meteo) appeared in both the Next.js BFF and the Python FastAPI AI orchestration service. This duplicate boundary caused ambiguity over where caching, rate-limiting against upstream government portals, data normalization, and circuit breaking should reside.

## Decision
1. **FastAPI is the sole owner of all external agricultural and meteorological provider adapters**:
   - Manages HTTP clients, upstream API key rotation, request retries, rate-limiting, and error transformation.
   - Normalizes heterogeneous external payloads into canonical Pydantic models.
   - Manages PostgreSQL persistent caching (`mandi_prices_cache`) and in-memory hot caches.
2. **Next.js BFF is strictly a browser-facing boundary**:
   - Performs client input validation (Zod).
   - Validates user sessions (tamper-proof signed guest cookies or Supabase JWTs).
   - Enforces client-facing IP rate-limiting.
   - Proxies requests internally to FastAPI endpoints (`/v1/mandi/...`, `/v1/weather/...`, `/v1/chat/...`).
   - Does NOT hold upstream OGD or weather credentials.
   - Does NOT make outbound calls to external government or third-party weather APIs.

## Deliberate Exceptions
None. All data plane integrations pass through FastAPI. Next.js communicates solely with FastAPI and the Supabase browser/SSR client for static assets and authentication tokens.

## Consequences
- Single point of audit and rate-limit compliance for government APIs.
- Next.js client and edge code are fully decoupled from upstream API quirks, schema shifts, and credentials.
