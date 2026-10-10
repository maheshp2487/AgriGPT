# ADR-0003: Spraying Window Advisory Methodology & Uncertainty Handling

## Status
Accepted

## Context
Declaring that "spraying is safe" based solely on crude wind (< 10 km/h) or rainfall (< 1 mm) thresholds is agronomically reckless. Thermal inversions occur during very low wind (< 3 km/h), causing spray droplets to stay suspended and drift unpredictably. High temperatures (> 32°C) cause rapid evaporation and phytotoxicity, while specific Delta T ranges dictate droplet survival. Furthermore, weather forecasts are probabilistic estimates, not guarantees.

## Decision
1. **Multi-Variable Agronomic Advisory Matrix:**
   Spraying window calculations must incorporate comprehensive meteorological parameters approved by agronomists:
   - **Wind Speed & Gusts:** Ideal application window is 3 km/h to 15 km/h. If wind < 3 km/h, flag risk of **surface temperature inversion**. If wind > 15 km/h, flag risk of **excessive spray drift**.
   - **Delta T (Temperature & Humidity Relationship):** Calculate Delta T ($\Delta T = T_{\text{dry}} - T_{\text{wet}}$).
     - $\Delta T < 2^\circ\text{C}$: High relative humidity; droplet survival high, but risk of chemical runoff.
     - $\Delta T \in [2^\circ\text{C}, 8^\circ\text{C}]$: **Optimal spraying window**.
     - $\Delta T > 8^\circ\text{C}$: High droplet evaporation risk; fine droplets evaporate before reaching foliage.
   - **Rainfastness & Precipitation Probability:** Precipitation forecast within 3 to 6 hours flags high wash-off risk.
   - **Diurnal Timing & Pollinator Windows:** Advise against foliar insecticide spraying between 09:00 and 15:00 during flowering stages to protect honeybees and pollinators.
2. **Mandatory Uncertainty & Disclaimer Language:**
   - The UI and API must **never** state *"Spraying is safe"*.
   - Instead, the system must label the advice as an **"Estimated Weather Suitability Window"** (`FAVORABLE`, `MARGINAL`, `UNFAVORABLE`) accompanied by:
     - Clear statement: *"Based on numerical weather model forecasts. Field conditions may vary. Always inspect on-site wind direction and refer to the pesticide product label for rainfastness guidelines."*

## Consequences
- Scientifically credible advice that protects smallholders against crop injury, wasted inputs, and legal liability.
