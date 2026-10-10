# AgriGPT — Data-Source Feasibility Assessment

**Document Version:** 1.0.0  
**Status:** Factually Verified & Grounded  
**Scope:** Official Indian Agricultural, Meteorological, and Welfare Knowledge Sources  
**Principles:** Strict Truthfulness, Zero Fabricated Endpoints, Formal Fallback Architecture  

---

## 1. Feasibility Summary & Integration Matrix

A common fallacy in agricultural AI projects is assuming that because government portals display data publicly, open developer REST APIs exist. Our technical investigation confirms:

| Domain | Primary Source | Access Feasibility | Access Method | Licensing / Legal Status | Real-World Operational Limitations | Recommended AgriGPT Strategy |
|---|---|---|---|---|---|---|
| **Mandi Prices** | AGMARKNET / MoA&FW | **High** | OGD India (`data.gov.in`) REST API | Government Open Data License (GODL) | Variable APMC reporting delays; API latency (1.5s - 4.5s); occasional OGD downtime. | Ingest via OGD API with Supabase daily caching & stale-date disclosure. |
| **Agronomy Knowledge** | ICAR & State Agri Universities (SAUs) | **Medium (Curated Ingestion)** | No public REST API; OAI-PMH for Krishikosh; HTML/PDF Packages of Practices | ICAR / SAU Copyright; requires fair use attribution or formal Samunnati MoU | No structured JSON; complex tabular pesticide dosage data locked in PDFs. | Curated batch ingestion with semantic chunking & explicit institution citations. |
| **Weather & Agromet** | India Meteorological Dept (IMD) | **Restricted / Partner Only** | IMD API Portal (`api.imd.gov.in`) | Institutional registration & static IP whitelisting required | Requires formal clearance from IMD Nodal Officer; no anonymous API keys. | Phase 1 fallback to Open-Meteo with clear label, while Samunnati applies for IMD institutional API key. |
| **Government Schemes** | myScheme / MoA&FW | **Medium (Hybrid)** | API Setu (`apisetu.gov.in`) / Gazette Ingestion | Open API Policy / Institutional Use Case approval | Individual benefit status verification requires Aadhaar eKYC. | Curated schema-driven RAG knowledge base for Phase 1; apply via API Setu for Phase 2. |
| **Crop Insurance** | PMFBY Portal | **Medium (Advisory Only)** | Public claim guides / API Setu partner APIs | Ministry of Agriculture guidelines | Direct claim filing requires licensed insurance intermediary credentials. | Provide verified 72-hour claim timeline, helpline, and required documentation guide. |

---

## 2. In-Depth Source Investigation

---

### 2.1 AGMARKNET: Daily Wholesale Mandi Prices

- **Data Owner:** Directorate of Marketing and Inspection (DMI), Ministry of Agriculture and Farmers Welfare (MoA&FW), Government of India.
- **Access Platform:** Open Government Data (OGD) Platform India ([data.gov.in](https://data.gov.in)).
- **Verified Resource ID:** `9ef84268-d588-465a-a308-a864a43d0070` ("Current Daily Price of Various Commodities from Various Markets (Mandi)").
- **Programmatic Access Method:**
  - RESTful HTTPS GET request with user API key.
  - Endpoint: `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070`
  - Required Query Parameters:
    - `api-key`: User registered API key.
    - `format`: `json`
    - `limit`: Integer (e.g., `50`)
    - `offset`: Integer for pagination.
    - Filters: `filters[state]=Tamil Nadu`, `filters[district]=Thanjavur`, `filters[commodity]=Groundnut`
- **Available Data Fields:**
  - `state` (e.g., "Tamil Nadu")
  - `district` (e.g., "Thanjavur")
  - `market` (e.g., "Kumbakonam")
  - `commodity` (e.g., "Groundnut")
  - `variety` (e.g., "Other", "Local")
  - `arrival_date` (e.g., "09/10/2026")
  - `min_price` (Numeric, INR/Quintal)
  - `max_price` (Numeric, INR/Quintal)
  - `modal_price` (Numeric, INR/Quintal)
- **Update Frequency:** Daily. Most mandis upload records in the afternoon/evening (2:00 PM – 8:00 PM IST) following morning auctions.
- **Licensing & Legal Status:** Government Open Data License — India (GODL). Permits commercial and non-commercial reuse with mandatory attribution.
- **Genuine Engineering Limitations:**
  1. *Variable Upload Latency:* Smaller rural APMCs often report arrivals 24 to 72 hours late.
  2. *Upstream Response Times:* OGD India queries frequently experience 2,000ms to 5,000ms latency or intermittent gateway timeouts during peak server load.
  3. *Naming Discrepancies:* Commodity names vary (e.g., "Paddy (Dhan)(Common)", "Groundnut Split", "Paddy (Basmati)").
- **AgriGPT Architectural Decision:**
  - Implement a daily pre-fetching cron job in Python (`ingestion/sync_mandi_daily.py`) that syncs high-priority district/commodity combinations into Supabase PostgreSQL table `mandi_prices_cache`.
  - The Next.js BFF queries local PostgreSQL first (<15ms response time) and falls back to live OGD queries with a 3,000ms timeout circuit breaker.
  - Always surface the exact `arrival_date` on the UI card so the farmer knows whether the price is today's or 2 days old.

---

### 2.2 ICAR: Agronomic Research & Package of Practices (POP)

- **Data Owner:** Indian Council of Agricultural Research (ICAR), Department of Agricultural Research and Education (DARE).
- **Core Portals:**
  - KRISHI (Knowledge based Resources Information Systems Hub for Innovations in Agriculture): [krishi.icar.gov.in](https://krishi.icar.gov.in/)
  - Krishikosh (Institutional Digital Repository): [krishikosh.egranth.ac.in](https://krishikosh.egranth.ac.in/)
  - Krishi Vigyan Kendra (KVK) Portal: [kvk.icar.gov.in](https://kvk.icar.gov.in/)
  - State Agricultural University Portals (e.g., TNAU Agritech Portal, UAS Dharwad Package of Practices).
- **Access Method Verification:**
  - **No Unrestricted Public REST API:** Our research confirms that the KRISHI portal and Krishikosh do **not** provide open, consumer-facing REST endpoints for ad-hoc programmatic agronomy querying.
  - Academic metadata harvesting is supported via OAI-PMH (Open Archives Initiative Protocol for Metadata Harvesting) on Krishikosh, but this yields citation metadata rather than structured crop cultivation guides.
- **Available Information Format:**
  - Detailed PDF monographs, university Package of Practices (POP) bulletins, and KVK advisory reports.
  - Contains authoritative details on: recommended seed varieties, sowing windows, seed treatment fungicides, fertilizer NPK dosages (kg/acre), water requirements, and pest/disease integrated management.
- **Licensing & Intellectual Property:**
  - Copyright rests with ICAR and individual State Agricultural Universities.
  - Documents are published for public farmer benefit and academic dissemination. Direct quotation for non-commercial educational guidance is permitted under fair dealing, provided full source and institutional attribution is preserved.
- **AgriGPT Architectural Decision:**
  - **Do NOT attempt automated scrapers that violate terms of service.**
  - Instead, construct an **approved institutional knowledge corpus** consisting of published, public-domain Package of Practices from leading universities:
    - Tamil Nadu Agricultural University (TNAU) Agritech Portal for Tamil Nadu crops.
    - Indian Agricultural Research Institute (ICAR-IARI) for Northern cereals/pulses.
    - State Agricultural Universities (ANGRAU, PJTSAU, UASB) for Southern crops.
  - Ingest PDFs using an offline parsing pipeline with Docling/Unstructured, preserving tabular dosage formulas, and index vectors in Supabase `pgvector`.
  - Every answer returned in AgriGPT explicitly links to the originating institution and publication year.

---

### 2.3 Weather & Agromet Advisory Sources

- **Primary Authority:** India Meteorological Department (IMD), Ministry of Earth Sciences (MoES).
- **IMD API Platform Status ([api.imd.gov.in](https://api.imd.gov.in/)):**
  - IMD maintains an official API Management Platform hosting 7-day city forecasts, subdivision rainfall, district nowcasts, AWS/ARG data, and agromet bulletins.
  - **CRITICAL ACCESS RESTRICTION:** IMD APIs are **not** openly accessible via public sign-up. Access is strictly granted to registered institutional stakeholders upon static public IP whitelisting and formal administrative onboarding through the IMD Nodal Officer (Scientist-E, Dr. Sankar Nath).
- **Secondary / Fallback Weather Data Source:**
  - **Open-Meteo API ([open-meteo.com](https://open-meteo.com)):**
    - High-resolution global and regional numerical weather models (ECMWF IFS, GFS, DWD ICON).
    - Data Semantics: **Numerical Model Forecasts (Simulations)**. Forecasted values carry probabilistic uncertainty and are not physical thermometer/rain-gauge sensor observations.
    - Open RESTful API with free non-commercial tier (up to 10,000 calls/day) and commercial subscription options.
    - Licensing & Commercial Terms: Creative Commons Attribution 4.0 International (CC BY 4.0). Free tier is strictly for non-commercial evaluation and prototyping (up to 10,000 calls/day). For company-facing production deployment by a commercial enterprise such as Samunnati Finance, Open-Meteo's terms legally require a paid Commercial API subscription plan (or migration to IMD enterprise platform). Production licensing is NOT resolved merely by attributing CC BY 4.0.
    - Endpoints provide: 2m temperature, relative humidity, wind speed at 10m, wind gusts, hourly precipitation probability, and weather codes.
- **AgriGPT Architectural Decision:**
  - **Dual-Adapter Weather Service:**
    1. AgriGPT defines an abstract `WeatherProvider` interface.
    2. *Development & MVP Phase:* Implements `OpenMeteoProvider` for immediate, reliable, unblocked development, explicitly labeled as a numerical model forecast with mandatory CC BY 4.0 attribution.
    3. *Production Commercial Requirement:* Samunnati must either procure a commercial Open-Meteo license or execute the pending institutional MoU with IMD.
    4. *Production Partnership Phase:* Classified as **Unverified External Dependency / Pending Samunnati Partnership**. Samunnati applies as a formal institutional entity to the IMD Nodal Officer (Dr. Sankar Nath). Once static IP whitelisting and credentials are approved, AgriGPT activates `IMDEnterpriseProvider` to access physical station readings (AWS/ARG).
  - **Spraying Window Methodology:** Evaluates multi-parameter matrix (Delta T between 2°C and 8°C, wind speed 3–15 km/h, wind gusts < 20 km/h, rainfastness wash-off risk, and pollinator activity windows). Labeled as an **Estimated Weather Suitability Window** with mandatory field-level wind direction verification disclaimer.

---

### 2.4 Government Schemes & Crop Insurance (PMFBY, PM-KISAN)

- **Authorities:** Ministry of Agriculture and Farmers Welfare (MoA&FW) & Digital India Corporation.
- **Access Gateway:** **API Setu ([apisetu.gov.in](https://apisetu.gov.in/)):**
  - The Government of India’s official Open API Gateway.
  - Hosts published APIs for Digital India initiatives, including myScheme and PMFBY.
  - **Registration Requirement:** Requires an institutional organization profile and submission of a formal "Use Case" (minimum 250 characters) demonstrating public service integration. Upon manual administrative review, API keys and tokens are issued.
- **Direct Portal Guidelines:**
  - `myscheme.gov.in` (National Scheme Discovery Platform)
  - `pmkisan.gov.in` (PM-KISAN Samman Nidhi)
  - `pmfby.gov.in` (Pradhan Mantri Fasal Bima Yojana)
- **Genuine Engineering Limitations:**
  - APIs for checking an *individual farmer’s payment or claim status* require Aadhaar-based OTP eKYC or integration with the Public Financial Management System (PFMS). This cannot be accessed in guest or anonymous mode.
- **AgriGPT Architectural Decision:**
  - *Phase 1 (Knowledge & Guidance):* Curate a verified structured database of scheme parameters (Eligibility criteria, benefit sums, required documents, cut-off dates, grievance helpline numbers).
  - *PMFBY Differentiated Loss Guidance:*
    1. **Localized Calamities (Hailstorm, Landslide, Inundation, Cloudburst, Natural Fire):** Explain mandatory individual intimation within **72 hours** via Crop Insurance App / toll-free 14447 / bank.
    2. **Post-Harvest Losses:** Explain 72-hour notice for crops damaged in cut-and-spread condition within 14 days of harvest.
    3. **Widespread Perils (Drought, Dry Spells, Widespread Pest Attack):** Clarify that these are assessed on an **Area Approach** via mandatory Crop Cutting Experiments (CCE) conducted by the state government; individual 72-hour notices do not trigger individual payouts.
    4. **Zero-Guarantee Disclaimer:** Prominently display that AgriGPT does not process or guarantee insurance settlements.
  - *Phase 2:* Samunnati applies for institutional API Setu credentials to enable direct scheme discovery hooks.

---

## 3. Explicitly Unverified / Partner-Dependent Items

To uphold our principle of absolute engineering integrity, the following capabilities are **explicitly flagged as unverified / requiring company confirmation**:

1. **Private Samunnati FPO Databases:** Whether Samunnati possesses an internal proprietary database of FPO member lists, historical procurement prices, or trade contracts that should be ingested into AgriGPT. *(Pending confirmation from Samunnati Technical Lead).*
2. **Direct IMD Institutional Onboarding:** Whether Samunnati Finance has an existing institutional MoU with IMD or needs to initiate a new application through Scientist-E. *(Documented as open decision for company).*
3. **API Setu Corporate Credentials:** Whether Samunnati holds existing enterprise registration on `apisetu.gov.in`. *(Documented as open decision for company).*
