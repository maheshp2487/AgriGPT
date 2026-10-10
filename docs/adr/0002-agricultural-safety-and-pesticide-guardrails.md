# ADR-0002: Agricultural Safety, Versioned Restriction Data & Fail-Closed Guardrails

## Status
Accepted

## Context
Relying merely on a pesticide-name regular expression (regex) is unsafe for a real-world farmer platform. Furthermore, an architectural conflict existed between "aborting streaming whenever a banned pesticide name appears" and "automated evaluation tests requiring explicit, educational refusals."

## Decision
1. **Authoritative, Versioned Restriction Dataset:**
   - Agricultural safety will be backed by a structured, versioned dataset (`cibrc_restrictions_v{YYYYMM}.json`) sourced from the Central Insecticides Board & Registration Committee (CIBRC), Ministry of Agriculture and Farmers Welfare.
   - Entries include: Active Ingredient, Registration Status (Banned, Restricted, Approved), Notified Banned Date / Supreme Court Order, Approved Target Crops, Maximum Approved Dosages, and Required Waiting Periods (Pre-Harvest Intervals).
2. **Crop-Specific Source Validation:**
   - A chemical approved for one crop (e.g., Chlorantraniliprole on cotton) cannot be recommended for leafy vegetables or pulses unless specifically validated against official ICAR/CIBRC registrations for that `(crop, target_pest)` tuple.
3. **Refusal vs. Generation Suppression (Resolving the Conflict):**
   - **User Asking About a Banned Substance:** When a user asks a question mentioning a banned chemical (e.g., *"Can I spray Endosulfan for bollworm?"*), the system does NOT crash or abort. It explicitly detects the substance, references the CIBRC restriction registry, and issues an **authoritative educational refusal**:
     > *"Endosulfan is strictly banned by the Supreme Court of India and CIBRC due to severe health and environmental hazards. It cannot be used. For bollworm control, official ICAR-approved alternatives include..."*
   - **Model Hallucinating an Unapproved Recommendation:** If the model generation attempts to prescribe a banned chemical or an unapproved crop-chemical combination, the output interceptor suppresses the unsafe recommendation, logs a safety violation alert, and replaces the dangerous section with a safe fallback.
4. **Fail-Closed Behavior for High-Risk Advice:**
   - If an agronomic query lacks a verified, high-confidence source chunk linking the specific crop and pest to an approved package of practices, the system **fails closed**: it withholds chemical spray prescriptions entirely and provides only non-chemical agronomic/cultural practices, directing the farmer to the nearest Krishi Vigyan Kendra (KVK).
5. **Multilingual Safety Test Suite:**
   - Safety tests must assert correct behavior across all supported languages (e.g., Tamil, Hindi, Telugu) using vernacular aliases (e.g., *பூச்சிக்கொல்லி*, *कीटनाशक*).

## Consequences
- Guaranteed compliance with Indian agricultural regulations.
- Eliminates risk of silent system failures while educating farmers on hazardous substances.
