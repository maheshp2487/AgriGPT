# AgriGPT — Implementation Roadmap & Demonstration Strategy

**Document Version:** 1.0.0  
**Methodology:** Incremental Agile Delivery, Vertical Slicing, Test-Driven Verification  
**Collaboration Partner:** Samunnati Finance  

---

## 1. Phased Delivery Strategy

To avoid the risk of delayed integration or building ungrounded speculative features, AgriGPT will be developed across **five disciplined phases**. Each phase produces a fully functional, testable milestone that can be demonstrated directly to Samunnati leadership.

```
+-------------------------------------------------------------------------------------------------+
|                                    AgriGPT Phased Milestones                                    |
+-------------------------------------------------------------------------------------------------+
| Phase 0: Discovery & Architecture (COMPLETE)                                                    |
| └── Detailed PRD, UI/UX Design System, Architecture, Technical Specs, Data Feasibility, Tasks    |
+-------------------------------------------------------------------------------------------------+
| Phase 1: Smallest Useful Demonstration (SUD) / Vertical Slice                                   |
| └── Localized UI (EN, TA, HI) + Live AGMARKNET Mandi + Real Weather + Grounded Agronomy Chat    |
+-------------------------------------------------------------------------------------------------+
| Phase 2: Complete Multilingual Intelligence (6 Languages) & Schemes RAG                         |
| └── Telugu, Kannada, Malayalam + PM-KISAN & PMFBY modules + Hybrid pgvector/BM25 retrieval     |
+-------------------------------------------------------------------------------------------------+
| Phase 3: Samunnati FPO Enablement & Offline Voice Interfaces                                    |
| └── FPO multi-mandi comparisons + Low-bandwidth offline caching + Vernacular Voice STT/TTS      |
+-------------------------------------------------------------------------------------------------+
| Phase 4: Production Hardening, API Setu Gateway & Security Audits                               |
| └── Formal API Setu integration + DPDP compliance + Observability & OpenTelemetry Tracing       |
+-------------------------------------------------------------------------------------------------+
```

---

## 2. Phase 1: The Smallest Useful Demonstration (Vertical Slice)

### 2.1 What is the Smallest Useful Demonstration?
The Smallest Useful Demonstration is an **end-to-end working vertical slice** designed to prove the core value proposition to Samunnati executives within the first development sprint, without relying on mock data or ungrounded responses.

#### The Demonstration Flow:
1. **Language First:** Executive opens AgriGPT on a mobile browser; selects **தமிழ் (Tamil)** or **हिन्दी (Hindi)**. The entire interface, navigation, and badges seamlessly render in that language.
2. **Real-World Mandi Check:** Selects District **Thanjavur, Tamil Nadu** and Commodity **Groundnut (நிலக்கடலை)**.
   - AgriGPT displays verified wholesale prices from the Kumbakonam APMC mandi fetched live from AGMARKNET via OGD India.
   - Highlights the exact `arrival_date`, min/max/modal figures (e.g., `₹2,450/quintal`), and freshness badge (`Fresh: Reported Oct 09`).
3. **Hyperlocal Weather & Agromet Advice:**
   - Displays current temperature, humidity, and rainfall probability for Thanjavur.
   - Displays an automated agronomic spray indicator: *"🟢 Spraying Favorable: Low wind and zero rain predicted for next 18 hours."*
4. **Grounded Conversational Advisory:**
   - User types or asks: *"How to control stem borer in paddy? (நெல் தண்டு துளைப்பான் கட்டுப்படுத்துவது எப்படி?)"*
   - AgriGPT streams a scientifically grounded response in Tamil quoting official TNAU/ICAR Package of Practices, specifying both eco-friendly controls (pheromone traps) and approved chemical dosage, accompanied by an interactive **Source Citation Card**.
   - Demonstrates strict refusal to recommend banned pesticides.

### 2.2 Phase 1 Deliverables & Technical Scope
- **Frontend:**
  - Next.js 14 App Router shell with Tailwind CSS tokens and mobile-first bottom navigation.
  - Localization engine configured with English, Tamil, and Hindi translation catalogs.
  - Streaming Chat UI with Markdown rendering, trust badges, and citation drawers.
  - Interactive Mandi Price Explorer and Weather Widget.
- **AI Service:**
  - FastAPI service with health check, Pydantic V2 schemas, and CORS security.
  - AGMARKNET OGD client with caching and arrival date validation.
  - Weather service adapter (Open-Meteo with IMD formatting).
  - Grounded RAG retriever using Supabase pgvector populated with 5 major crops (Paddy, Maize, Groundnut, Cotton, Soybean).
- **Persistence:**
  - Supabase PostgreSQL schema with `mandi_prices_cache` and `agronomy_knowledge_chunks`.

### 2.3 Phase 1 Definition of Done (DoD)
- [ ] Automated Playwright tests pass for language switching across English, Tamil, and Hindi without layout break down to 320px viewport width.
- [ ] AGMARKNET live data query completes within < 1,000ms from cache, and < 3,500ms on cache miss.
- [ ] RAG responses on the 5 benchmark crops contain 100% verified citations from official ICAR/TNAU packages.
- [ ] Zero API keys or secrets visible in browser network requests or bundle analyzers.
- [ ] Vitest component unit test coverage >= 80% on core UI primitives.

---

## 3. Phase 2: Full Multilingual Support (6 Languages) & Schemes Engine

### 3.1 Objective
Expand localization across all six mandatory languages (**Telugu, Kannada, Malayalam** alongside EN, TA, HI) and introduce the Government Schemes & Crop Insurance intelligence engine.

### 3.2 Deliverables & Technical Scope
- Complete translation catalogs and typography hardening for Telugu, Kannada, and Malayalam.
- Ingestion of PM-KISAN, PMFBY, Soil Health Card, and state subsidy schemes into Supabase pgvector.
- Implementation of the **PMFBY 72-Hour Loss Reporting Guidance Workflow**.
- Hybrid search engine combining PostgreSQL `tsvector` (BM25) and `pgvector` HNSW index with Reciprocal Rank Fusion (RRF).
- Benchmark suite of 100 agricultural questions across all 6 languages evaluated for factual fidelity.

### 3.3 Phase 2 Definition of Done (DoD)
- [ ] All 6 languages achieve 100% string coverage across navigation, forms, and errors (zero untranslated English fallbacks).
- [ ] Scheme eligibility questions return correct official criteria and required documentation checklists.
- [ ] Multilingual benchmark evaluation achieves 0% hallucinations on government scheme names or payment amounts.

---

## 4. Phase 3: Samunnati FPO Network, Offline Caching & Audio

### 4.1 Objective
Empower Samunnati’s network of 30,000+ FPOs with aggregation tools, low-bandwidth resilience for remote farms, and voice-assisted interactions.

### 4.2 Deliverables & Technical Scope
- **FPO Aggregator View:** Multi-mandi comparative dashboard allowing FPO managers to compare modal prices across 3 neighboring districts with transport cost trade-offs.
- **Service Worker Caching:** PWA configuration caching the application shell and the farmer’s last viewed mandi/weather data for offline field usage.
- **Voice Input / Output (Speech):** Integration of Web Speech API and Indic speech models (Bhashini / Whisper) for voice querying and read-aloud TTS.
- **Farmer Profile Personalization:** Optional Phone OTP login with Supabase Auth to persist farmer district and crop preferences.

### 4.3 Phase 3 Definition of Done (DoD)
- [ ] Application shell and cached prices load within < 500ms when device network is simulated as Offline / 2G.
- [ ] FPO multi-mandi table allows filtering and exporting current price summaries.
- [ ] Voice query flow successfully transcribes spoken Tamil and Hindi test audio clips.

---

## 5. Phase 4: Production Hardening, Compliance & Scalability

### 5.1 Objective
Prepare AgriGPT for institutional rollout across Samunnati’s national network with rigorous compliance, security auditing, and enterprise integrations.

### 5.2 Deliverables & Technical Scope
- **API Setu Official Adapter:** Onboard formal API Setu credentials for authenticated government scheme eligibility checks.
- **Enterprise Security Audit:** Penetration testing, strict Content Security Policy (CSP), rate limiting, and compliance verification with India’s Digital Personal Data Protection (DPDP) Act 2023.
- **End-to-End Observability:** Distributed tracing with OpenTelemetry, structured logging with correlation IDs, and LLM telemetry with LangSmith/Phoenix.
- **Performance Hardening:** Core Web Vitals optimization achieving Largest Contentful Paint (LCP) < 2.5s on mobile 3G.

### 5.3 Phase 4 Definition of Done (DoD)
- [ ] Zero critical or high severity vulnerabilities in automated SAST/DAST scans.
- [ ] 99.9% uptime SLA on Next.js BFF routes and Python AI service under synthetic load tests.
- [ ] Complete operational runbook and disaster recovery procedures documented and verified.
