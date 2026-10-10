# ADR-0006: Cryptographic Guest Session Handling, RLS Isolation & PII Redaction

## Status
Accepted

## Context
1. Allowing guest browsing is essential for low-barrier farmer adoption, but unauthenticated sessions must not allow session spoofing or reading another farmer's conversations.
2. Earlier drafts referenced "DPDP compliance achieved," which is inaccurate for an unbuilt system.
3. System logging must not ingest sensitive farmer PII (phone numbers, GPS coordinates, names).

## Decision
1. **Cryptographically Signed Guest Sessions:**
   - On first visit, Next.js middleware generates a UUID v4 session ID and issues a signed, HTTP-only, SameSite=Lax cookie:
     `agri_session = <uuid>.<hmac_sha256(uuid, SESSION_SECRET)>`
   - Any client-tampered session ID fails signature verification and is regenerated.
   - When Next.js BFF calls FastAPI, it passes the verified session ID in an internal header: `X-Verified-Session-ID: <uuid>`, secured via internal service secret `SERVICE_SHARED_SECRET`.
2. **PostgreSQL Row Level Security (RLS) Policy Architecture:**
   - Conversations and messages are partitioned by either `user_id` (authenticated Supabase user) or `session_id` (guest).
   - In Supabase PostgreSQL, RLS uses app settings or Supabase claims:
     ```sql
     CREATE POLICY "Guest and User conversation isolation"
     ON conversations FOR ALL
     USING (
         (auth.uid() IS NOT NULL AND user_id = auth.uid()) OR
         (auth.uid() IS NULL AND session_id = current_setting('request.jwt.claim.session_id', true))
     );
     ```
3. **Target Compliance Definition (DPDP Act 2023):**
   - Architectural documentation will state: *"Target privacy requirements to be evaluated and implemented under India's Digital Personal Data Protection (DPDP) Act 2023."*
   - Requirements to be assessed and implemented include: explicit notice for registered farmers, right of withdrawal, retention caps on ephemeral chat logs, and zero non-consensual sharing.
4. **PII-Safe Logging Strategy:**
   - Next.js (Pino) and FastAPI (structlog) implement custom log serializers that redact:
     - 10-digit Indian phone numbers matching `\b[6-9]\d{9}\b`.
     - 12-digit Aadhaar patterns `\b\d{4}\s?\d{4}\s?\d{4}\b`.
     - Exact latitude/longitude coordinates (truncated to 1 decimal place $\sim 11\text{ km}$ or replaced by district name).
     - Farmer personal names in logging arguments.

## Consequences
- Protects guest users from data leakage and session hijacking.
- Establishes honest, verifiable regulatory compliance targets.
