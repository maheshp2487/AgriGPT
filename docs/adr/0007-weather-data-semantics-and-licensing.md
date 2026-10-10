# ADR-0007: Weather Data Semantics: Forecasts vs Observations, Licensing & Attribution

## Status
Accepted

## Context
1. The early specification did not clearly distinguish between **numerical weather prediction (NWP) model forecasts** (simulated predictions from ECMWF/GFS) and **ground-truth surface observations** (instrument readings from physical automatic weather stations - AWS).
2. Direct integration with India Meteorological Department (IMD) API platform was listed without clearly flagging that institutional static-IP whitelisting by the IMD Nodal Officer is an unresolved external dependency.

## Decision
1. **Explicit Data Semantics on UI & API:**
   - **Simulated Model Forecast:** When data originates from global numerical models (e.g., Open-Meteo IFS/ICON/GFS models), it must be explicitly labeled:
     > *"Numerical Model Forecast (Open-Meteo / ECMWF). Forecasted values carry probabilistic uncertainty."*
   - **Observed Surface Data:** When data originates from official meteorological stations or IMD bulletins, it is labeled:
     > *"Station Observation (IMD AWS). Recorded at [Station Name] on [Date & Time]."*
2. **Open-Meteo Licensing & Attribution:**
   - Open-Meteo operates under the Creative Commons Attribution 4.0 International (CC BY 4.0) license for open data.
   - agriGPT will include mandatory attribution: *"Weather forecast data provided by Open-Meteo.com"*.
   - Free non-commercial API rate limits (10,000 daily calls) are sufficient for development and demonstration. For production, Samunnati must provision a commercial API key if query volumes exceed limits.
3. **IMD Direct API Integration Classified as Unverified External Dependency:**
   - Direct IMD API integration (`api.imd.gov.in`) is formally classified as: **"Unverified External Dependency / Pending Samunnati Institutional Partnership"**.
   - No code will assume active IMD API credentials until Samunnati completes formal institutional onboarding with Dr. Sankar Nath (Scientist-E).

## Consequences
- Farmers and field officers understand whether they are looking at a computer projection or a physical thermometer/rain-gauge observation.
- Legal compliance with open-data attribution licenses.
