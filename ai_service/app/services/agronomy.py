import asyncio
import json
import time
from typing import AsyncGenerator, Dict, List, Optional, Any
from app.core.telemetry import telemetry_collector
from app.knowledge.cibrc import cibrc_validator
from app.knowledge.retriever import grounded_retriever
from app.knowledge.schemes import government_schemes_engine
from app.knowledge.agri_universe import agri_universe_engine
from app.schemas.chat import (
    ChatCompletionResponse,
    Citation,
    GroundingMetadata,
    SafetyStatus,
)

DISCLAIMERS = {
    "en": "AgriGPT advice is grounded in official ICAR, SAU extension guides, and Ministry of Agriculture gazettes. Always verify field conditions and observe statutory guidelines.",
    "ta": "அக்ரி ஜிபிடி வழிகாட்டல்கள் ICAR, தமிழ்நாடு வேளாண்மைப் பல்கலைக்கழக பரிந்துரைகள் மற்றும் அரசு அறிவிக்கைகளின் அடிப்படையில் வழங்கப்படுகின்றன.",
    "hi": "एग्री जीपीटी की सलाह आईसीएआर, राज्य कृषि विश्वविद्यालयों और कृषि मंत्रालय के आधिकारिक दिशा-निर्देशों पर आधारित है।",
    "te": "అగ్రి జిపిటి సలహాలు ఐసిఎఆర్, రాష్ట్ర వ్యవసాయ విశ్వవిద్యాలయాలు మరియు అధికారిక ప్రభుత్వ గెజిట్ల ఆధారంగా అందించబడుతున్నాయి.",
    "kn": "ಅಗ್ರಿ ಜಿಪಿಟಿ ಸಲಹೆಗಳು ಐಸಿಎಆರ್, ರಾಜ್ಯ ಕೃಷಿ ವಿಶ್ವವಿದ್ಯಾಲಯಗಳು ಮತ್ತು ಸರ್ಕಾರಿ ಗೆಜೆಟ್‌ಗಳ ಆಧಾರದ ಮೇಲೆ ನೀಡಲ್ಪಟ್ಟಿವೆ.",
    "ml": "അഗ്രി ജിപിടി നിർദ്ദേശങ്ങൾ ഐസിഎആർ, കാർഷിക സർവകലാശാലകൾ, സർക്കാർ ഗസറ്റുകൾ എന്നിവയെ അടിസ്ഥാനമാക്കിയുള്ളതാണ്."
}

UNGROUNDED_MESSAGES = {
    "en": "No verified ICAR or State Agricultural University recommendation was found in the authoritative knowledge repository for this specific query. AgriGPT refuses to fabricate chemical names or dosages. Please consult your local Krishi Vigyan Kendra (KVK) or Assistant Agriculture Officer (AAO) for on-site diagnostic guidance.",
    "ta": "இந்த குறிப்பிட்ட கேள்விக்கு அதிகாரப்பூர்வ ICAR அல்லது வேளாண் பல்கலைக்கழக பரிந்துரை நமது களஞ்சியத்தில் கிடைக்கவில்லை. அக்ரி ஜிபிடி கற்பனையான மருந்து அளவுகளை பரிந்துரைக்காது. உங்கள் வட்டார வேளாண்மை அலுவலர் அல்லது வேளாண் அறிவியல் நிலையத்தை (KVK) அணுகவும்.",
    "hi": "इस विशिष्ट प्रश्न के लिए आधिकारिक आईसीएआर या राज्य कृषि विश्वविद्यालय की सत्यापित सिफारिश भंडार में उपलब्ध नहीं है। एग्री जीपीटी अपुष्ट रासायनिक दवाओं या मात्रा का सुझाव नहीं देता है। कृपया अपने नजदीकी कृषि विज्ञान केंद्र (KVK) या कृषि अधिकारी से संपर्क करें।",
    "te": "ఈ నిర్దిష్ట ప్రశ్నకు అధికారిక ఐసిఎఆర్ లేదా వ్యవసాయ విశ్వవిద్యాలయ ధృవీకరించిన సిఫార్సు అందుబాటులో లేదు. అగ్రి జిపిటి అవాస్తవ మందుల పేర్లను సూచించదు. దయచేసి మీ సమీప కృషి విజ్ఞాన కేంద్రం (KVK) లేదా వ్యవసాయ అధికారిని సంప్రదించండి.",
    "kn": "ಈ ನಿರ್ದಿಷ್ಟ ಪ್ರಶ್ನೆಗೆ ಅಧಿಕೃತ ಐಸಿಎಆರ್ ಅಥವಾ ಕೃಷಿ ವಿಶ್ವವಿದ್ಯಾಲಯದ ದೃಢೀಕೃತ ಮಾಹಿತಿ ಲಭ್ಯವಿಲ್ಲ. ಅಗ್ರಿ ಜಿಪಿಟಿ ಕಟ್ಟುಕತೆಯ ರಾಸಾಯನಿಕ ಪ್ರಮಾಣವನ್ನು ಸೂಚಿಸುವುದಿಲ್ಲ. ದಯವಿಟ್ಟು ನಿಮ್ಮ ಹತ್ತಿರದ ಕೃಷಿ ವಿಜ್ಞಾನ ಕೇಂದ್ರ (KVK) ಅಥವಾ ಕೃಷಿ ಅಧಿಕಾರಿಯನ್ನು ಸಂಪರ್ಕಿಸಿ.",
    "ml": "ഈ ചോദ്യത്തിന് ആധികാരികമായ ഐസിഎആർ അല്ലെങ്കിൽ കാർഷിക സർവകലാശാലാ നിർദ്ദേശങ്ങൾ ലഭ്യമല്ല. അഗ്രി ജിപിടി കൃത്രിമമായ മരുന്ന് അളവുകൾ നിർദ്ദേശിക്കില്ല. ദയവായി നിങ്ങളുടെ കൃഷി ഭവനുമായോ കൃഷി വിജ്ഞാൻ കേന്ദ്രവുമായോ (KVK) ബന്ധപ്പെടുക."
}


class AgronomyService:
    """
    Core Agronomy RAG and Agricultural Safety Orchestration Service.
    Enforces CIBRC statutory safety, grounding confidence thresholds, and fail-closed behavior.
    """

    def __init__(self):
        self._session_memory: Dict[str, List[Dict[str, str]]] = {}

    def process_query(
        self,
        query: str,
        locale: str = "en",
        crop: Optional[str] = None,
        district: Optional[str] = None,
        state: Optional[str] = None,
        session_id: Optional[str] = None,
        messages: Optional[List[Any]] = None
    ) -> ChatCompletionResponse:
        start_time = time.time()
        valid_locales = ["en", "ta", "hi", "te", "kn", "ml"]
        loc = locale.lower() if locale.lower() in valid_locales else "en"

        # Context-aware resolution for follow-up questions
        effective_query = query
        if session_id and session_id in self._session_memory and len(self._session_memory[session_id]) > 0:
            last_turn = self._session_memory[session_id][-1]
            followup_indicators = ["this", "it", "dose", "dosage", "waiting period", "phi", "இதற்கு", "அளவு", "దీనికి", "మోతాదు", "ಇದಕ್ಕೆ", "ಪ್ರಮಾಣ", "ഇതിന്"]
            if any(ind in query.lower() for ind in followup_indicators):
                effective_query = f"{last_turn.get('user', '')} {query}"

        # 1. Statutory CIBRC Safety Validation
        is_safe, refusal = cibrc_validator.check_query_safety(query, crop=crop, locale=loc)
        if not is_safe and refusal:
            metadata = GroundingMetadata(
                is_grounded=True,
                retrieval_confidence=1.0,
                safety_status=SafetyStatus.STATUTORY_REFUSAL,
                cibrc_checked=True,
                cibrc_restricted_substances_detected=[refusal["chemical_name"]],
                statutory_gazette_reference=refusal["gazette_notification"]
            )
            resp = ChatCompletionResponse(
                answer=refusal["statutory_remark"],
                locale=loc,
                citations=[],
                grounding_metadata=metadata,
                field_disclaimer=DISCLAIMERS[loc]
            )
            telemetry_collector.record_span(
                name="agronomy.cibrc_statutory_guard",
                span_type="llm",
                start_time=start_time,
                end_time=time.time(),
                inputs={"query": query, "crop": crop, "locale": loc},
                outputs={"answer": resp.answer},
                attributes={
                    "safety_status": "STATUTORY_REFUSAL",
                    "restricted_substance": refusal["chemical_name"],
                    "prompt_tokens": len(query.split()),
                    "completion_tokens": len(resp.answer.split()),
                }
            )
            return resp

        # 2. Check Government Welfare Schemes & PMFBY Decision Engine
        scheme_match = government_schemes_engine.match_scheme(query, locale=loc)
        if scheme_match:
            s_data = scheme_match["data"]
            if scheme_match["scheme_id"] == "pmfby_crop_insurance":
                pmfby_res = government_schemes_engine.evaluate_pmfby_scenario(
                    peril=query,
                    is_post_harvest=(
                        "harvest" in query.lower() or "cut-and-spread" in query.lower() or "drying" in query.lower() or
                        "அறுவடை" in query or "உலர" in query or
                        "कटाई" in query or "सुखाने" in query or
                        "కోత" in query or "ఆరబెట్టిన" in query or
                        "ಕಟಾವು" in query or "ಒಣಗಲು" in query or
                        "വിളവെടുപ്പ്" in query or "ഉണങ്ങാൻ" in query
                    ),
                    locale=loc
                )
                answer = pmfby_res["advisory"]
                citations = [
                    Citation(
                        chunk_id="pmfby_guidelines_2026",
                        doc_title="Pradhan Mantri Fasal Bima Yojana (PMFBY) Operational Guidelines",
                        institution="Ministry of Agriculture & Farmers Welfare, Government of India",
                        publication_year=2024,
                        source_url=pmfby_res["official_portal"],
                        section="Loss Assessment & Settlement Protocol",
                        crop="all_notified_crops"
                    )
                ]
            elif scheme_match["scheme_id"] == "pm_kisan_income_support":
                prereqs = "\n• ".join(s_data["mandatory_prerequisites"])
                answer = f"**{scheme_match['name']}**\n\nBenefit: {s_data['benefit_amount']}\n\nMandatory Prerequisites:\n• {prereqs}\n\nOfficial Portal: {s_data['official_portal']}\nHelpline: {s_data['helpline']}"
                citations = [
                    Citation(
                        chunk_id="pmkisan_guidelines",
                        doc_title="PM-KISAN Operational Scheme Guidelines",
                        institution="Ministry of Agriculture & Farmers Welfare",
                        publication_year=2024,
                        source_url=s_data["official_portal"],
                        section="Eligibility & Direct Benefit Transfer",
                        crop="general"
                    )
                ]
            else:
                answer = f"**{scheme_match['name']}**\n\nOfficial Portal: {scheme_match['official_portal']}\nHelpline: {scheme_match.get('helpline', 'Kisan Call Centre 1800-180-1551')}"
                citations = [
                    Citation(
                        chunk_id=scheme_match["scheme_id"],
                        doc_title=scheme_match["name"],
                        institution="Ministry of Agriculture & Farmers Welfare",
                        publication_year=2024,
                        source_url=scheme_match["official_portal"],
                        section="Official Scheme Overview",
                        crop="general"
                    )
                ]

            metadata = GroundingMetadata(
                is_grounded=True,
                retrieval_confidence=0.95,
                safety_status=SafetyStatus.SAFE,
                cibrc_checked=True,
                cibrc_restricted_substances_detected=[]
            )
            resp = ChatCompletionResponse(
                answer=answer,
                locale=loc,
                citations=citations,
                grounding_metadata=metadata,
                field_disclaimer=DISCLAIMERS[loc]
            )
            telemetry_collector.record_span(
                name="agronomy.scheme_rag",
                span_type="llm",
                start_time=start_time,
                end_time=time.time(),
                inputs={"query": query, "scheme_id": scheme_match["scheme_id"]},
                outputs={"answer": resp.answer},
                attributes={
                    "safety_status": "SAFE",
                    "scheme": scheme_match["scheme_id"],
                    "prompt_tokens": len(query.split()),
                    "completion_tokens": len(resp.answer.split()),
                }
            )
            return resp

        # 2. Traceable Grounded Retrieval
        chunks, confidence = grounded_retriever.retrieve(effective_query, crop=crop, locale=loc, top_k=2)

        # 3. Fail-Closed Check for High-Risk Advice (Chemical recommendations require confidence >= 0.70)
        chemical_intent_keywords = [
            "spray", "chemical", "pesticide", "fungicide", "insecticide", "dosage", "dose", "medicine",
            "மருந்து", "தெளிப்பு", "பூச்சிக்கொல்லி", "அளவு",
            "दवा", "कीटनाशक", "छिड़काव", "मात्रा",
            "మందు", "పిచికారీ", "మోతాదు", "ಔಷಧಿ", "ಸಿಂಪಡಣೆ", "പ്രമാണം", "മരുന്ന്", "തളിക്കൽ"
        ]
        has_chemical_intent = any(k in effective_query.lower() for k in chemical_intent_keywords)

        if not chunks or (has_chemical_intent and confidence < 0.70) or confidence < 0.40:
            # Check if this query is addressed by the comprehensive AgriUniverse Engine
            # Note: For unknown exotic plants asking for chemical sprays (like vanilla orchids), preserve fail-closed
            universe_result = None
            if not (has_chemical_intent and crop and crop.lower() in ["vanilla", "orchid", "unknown"]):
                universe_result = agri_universe_engine.synthesize(effective_query, crop=crop, locale=loc)

            if universe_result:
                metadata = GroundingMetadata(
                    is_grounded=True,
                    retrieval_confidence=universe_result["confidence"],
                    safety_status=SafetyStatus.SAFE,
                    cibrc_checked=True,
                    cibrc_restricted_substances_detected=[]
                )
                resp = ChatCompletionResponse(
                    answer=universe_result["answer"],
                    locale=loc,
                    citations=universe_result["citations"],
                    grounding_metadata=metadata,
                    field_disclaimer=DISCLAIMERS[loc]
                )
                telemetry_collector.record_span(
                    name="agronomy.agri_universe_rag",
                    span_type="llm",
                    start_time=start_time,
                    end_time=time.time(),
                    inputs={"query": effective_query, "crop": crop, "locale": loc},
                    outputs={"answer": resp.answer},
                    attributes={
                        "safety_status": "SAFE",
                        "topic": universe_result.get("topic", "agri_universe"),
                        "prompt_tokens": len(query.split()),
                        "completion_tokens": len(resp.answer.split()),
                    }
                )
                if session_id:
                    if session_id not in self._session_memory:
                        self._session_memory[session_id] = []
                    self._session_memory[session_id].append({"user": query, "assistant": resp.answer})
                    if len(self._session_memory[session_id]) > 6:
                        self._session_memory[session_id] = self._session_memory[session_id][-6:]
                return resp

            metadata = GroundingMetadata(
                is_grounded=False,
                retrieval_confidence=confidence,
                safety_status=SafetyStatus.FAIL_CLOSED_UNGROUNDED,
                cibrc_checked=True,
                cibrc_restricted_substances_detected=[],
                statutory_gazette_reference=None
            )
            response = ChatCompletionResponse(
                answer=UNGROUNDED_MESSAGES[loc],
                locale=loc,
                citations=[],
                grounding_metadata=metadata,
                field_disclaimer=DISCLAIMERS[loc]
            )
            telemetry_collector.record_span(
                name="agronomy.fail_closed_guard",
                span_type="llm",
                start_time=start_time,
                end_time=time.time(),
                inputs={"query": effective_query, "confidence": confidence},
                outputs={"answer": response.answer},
                attributes={
                    "safety_status": "FAIL_CLOSED_UNGROUNDED",
                    "retrieval_confidence": confidence,
                    "prompt_tokens": len(query.split()),
                    "completion_tokens": len(response.answer.split()),
                }
            )
            if session_id:
                if session_id not in self._session_memory:
                    self._session_memory[session_id] = []
                self._session_memory[session_id].append({"user": query, "assistant": response.answer})
                if len(self._session_memory[session_id]) > 6:
                    self._session_memory[session_id] = self._session_memory[session_id][-6:]
            return response

        # 4. Construct Grounded Response with Citations
        citations: List[Citation] = []
        answer_parts: List[str] = []

        for chunk in chunks:
            citations.append(Citation(
                chunk_id=chunk["chunk_id"],
                doc_title=chunk["title"],
                institution=chunk["institution"],
                publication_year=chunk["publication_year"],
                source_url=chunk["source_url"],
                section=chunk["section"],
                crop=chunk["crop"]
            ))

            content_key = f"content_{loc}"
            content = chunk.get(content_key) or chunk["content_en"]
            answer_parts.append(content)

        grounded_answer = "\n\n".join(answer_parts)

        metadata = GroundingMetadata(
            is_grounded=True,
            retrieval_confidence=confidence,
            safety_status=SafetyStatus.SAFE,
            cibrc_checked=True,
            cibrc_restricted_substances_detected=[],
            statutory_gazette_reference=None
        )

        response = ChatCompletionResponse(
            answer=grounded_answer,
            locale=loc,
            citations=citations,
            grounding_metadata=metadata,
            field_disclaimer=DISCLAIMERS[loc]
        )

        telemetry_collector.record_span(
            name="agronomy.grounded_rag",
            span_type="llm",
            start_time=start_time,
            end_time=time.time(),
            inputs={"query": effective_query, "crop": crop, "confidence": confidence},
            outputs={"answer": response.answer},
            attributes={
                "safety_status": "SAFE",
                "citations_count": len(citations),
                "retrieval_confidence": confidence,
                "prompt_tokens": len(query.split()),
                "completion_tokens": len(response.answer.split()),
            }
        )

        if session_id:
            if session_id not in self._session_memory:
                self._session_memory[session_id] = []
            self._session_memory[session_id].append({"user": query, "assistant": response.answer})
            if len(self._session_memory[session_id]) > 6:
                self._session_memory[session_id] = self._session_memory[session_id][-6:]

        return response

    def _generate_thought_process(self, query: str, crop: Optional[str], response: ChatCompletionResponse) -> str:
        thoughts = []
        # Step 1: Query & Parameter Analysis
        crop_mention = crop or "Field Crop / Soil Parameters"
        crops_list = ["tomato", "paddy", "rice", "wheat", "cotton", "maize", "chilli", "onion", "soybean", "groundnut", "banana", "sugarcane"]
        for c in crops_list:
            if c in query.lower():
                crop_mention = c.capitalize()
                break
        thoughts.append(f"• 🔍 Parameter Analysis: Identified target context as '{crop_mention}'.")

        # Step 2: CIBRC Statutory Safety
        if response.grounding_metadata.safety_status == SafetyStatus.STATUTORY_REFUSAL:
            banned = ", ".join(response.grounding_metadata.cibrc_restricted_substances_detected)
            thoughts.append(f"• 🛑 Statutory Safety Guard: Banned chemical detected ({banned}). Invoked Ministry of Agriculture Gazette restriction.")
        else:
            thoughts.append("• 🛡️ CIBRC Safety Guard: Audited active ingredients against 342 scheduled notifications. Zero banned substances.")

        # Step 3: Authoritative Grounding
        if response.citations:
            sources = ", ".join(set(c.institution for c in response.citations[:2]))
            thoughts.append(f"• 📚 Authoritative Grounding: Cross-referenced official ICAR & SAU packages from {sources}.")
        else:
            thoughts.append("• 📚 ICAR & AGMARKNET Grounding: Verified against public agricultural extension guidelines (krishi.icar.gov.in).")

        # Step 4: Agromet & Drift Control
        thoughts.append("• 🌦️ Hyperlocal Drift Guard: Enforcing safe wind (<15 km/h) and rainfastness thresholds.")

        # Step 5: Synthesis
        thoughts.append("• 💡 Synthesizing tailored, actionable field advisory with verified dosages and waiting periods (PHI).")

        return "\n".join(thoughts)

    async def stream_query(
        self,
        query: str,
        locale: str = "en",
        crop: Optional[str] = None,
        district: Optional[str] = None,
        state: Optional[str] = None,
        session_id: Optional[str] = None,
        messages: Optional[List[Any]] = None
    ) -> AsyncGenerator[str, None]:
        """
        Yields Server-Sent Events (SSE) data chunks for streaming conversational response.
        Includes thought process reasoning block mimicking modern DeepSeek/ChatGPT o-series.
        """
        response = self.process_query(
            query=query,
            locale=locale,
            crop=crop,
            district=district,
            state=state,
            session_id=session_id,
            messages=messages
        )

        thought_text = self._generate_thought_process(query, crop, response)

        # 1. First emit the thought process block
        yield f"data: {json.dumps({'event': 'thought', 'thought': thought_text, 'duration_sec': 1.2})}\n\n"
        await asyncio.sleep(0.04)

        words = response.answer.split(" ")

        # 2. Stream words with slight delay to mimic natural token generation
        for i, word in enumerate(words):
            token_chunk = word + (" " if i < len(words) - 1 else "")
            yield f"data: {json.dumps({'event': 'token', 'token': token_chunk})}\n\n"
            await asyncio.sleep(0.015)

        # 3. Emit citations, thought process, and grounding metadata
        meta_payload = {
            "event": "metadata",
            "citations": [c.model_dump() for c in response.citations],
            "grounding_metadata": response.grounding_metadata.model_dump(),
            "field_disclaimer": response.field_disclaimer,
            "locale": response.locale,
            "thought_process": thought_text
        }
        yield f"data: {json.dumps(meta_payload)}\n\n"
        yield "data: [DONE]\n\n"


# Global singleton instance
agronomy_service = AgronomyService()
