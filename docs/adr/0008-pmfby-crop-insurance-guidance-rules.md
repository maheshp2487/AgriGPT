# ADR-0008: PMFBY Crop Insurance Guidance: Localized vs Area-Based Perils

## Status
Accepted

## Context
Early project descriptions presented the "72-hour crop insurance loss reporting window" as a blanket rule across all crop loss situations. Under the official Operational Guidelines of the Pradhan Mantri Fasal Bima Yojana (PMFBY), treating this as a universal guarantee is legally and procedurally incorrect.

## Decision
1. **Differentiated Loss Scenario Modeling:**
   AgriGPT must categorize crop damage into the official PMFBY loss assessment tracks:
   - **Scenario A: Localized Calamities (Individual Farmer Assessment):**
     - *Perils covered:* Hailstorm, landslide, inundation, cloudburst, natural fire.
     - *Action rule:* Mandatory intimation within **72 hours** of the occurrence of calamity through the Crop Insurance App, toll-free helpline (14447), bank branch, or District Agriculture Officer.
     - *Documentation needed:* Geotagged photos of damaged crop, policy number, land record (survey number/khata).
   - **Scenario B: Post-Harvest Losses (Individual Assessment):**
     - *Perils covered:* Cyclone, cyclonic rains, unseasonal rains damaging crops kept in field in "cut-and-spread" condition for drying within a maximum period of **14 days** from harvesting.
     - *Action rule:* Mandatory intimation within **72 hours**.
   - **Scenario C: Widespread / Area-Based Perils (Area Approach):**
     - *Perils covered:* Drought, prolonged dry spells, widespread pest attack, regional flooding.
     - *Action rule:* Assessed on an **Area Approach** (Gram Panchayat or Notified Insurance Unit) via mandatory Crop Cutting Experiments (CCE) conducted by the state government.
     - *Correction:* Individual 72-hour intimations by single farmers do **not** trigger individual settlement for widespread drought. The system must inform the farmer that compensation depends on the official threshold yield vs actual yield recorded by CCEs for the notified block.
2. **Zero-Guarantee Disclaimer:**
   - AgriGPT must explicitly state:
     > *"This guidance is based on official PMFBY operational guidelines. Final claim admissibility and payouts are strictly determined by the notified insurance company and State Level Coordination Committee on Crop Insurance (SLCCCI). AgriGPT does not process or guarantee insurance settlements."*

## Consequences
- Farmers receive procedurally accurate advice tailored to their specific calamity type, preventing false expectations and missed deadlines.
