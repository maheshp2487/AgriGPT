import json
import re
from pathlib import Path
from typing import Dict, List, Optional, Any

DATA_PATH = Path(__file__).parent / "data" / "government_schemes.json"

SCHEME_KEYWORDS = {
    "pmfby_crop_insurance": [
        "pmfby", "crop insurance", "fasal bima", "insurance claim", "claim insurance", "crop loss", "crop damage",
        "hailstorm", "inundation", "drought", "bima", "calamity", "loss reporting",
        "பயிர் காப்பீடு", "பயிர் சேதம்", "காப்பீட்டு இழப்பீடு", "காப்பீடு", "வறட்சி", "ஆலங்கட்டி",
        "फसल बीमा", "फसल नुकसान", "बीमा क्लेम", "बीमा", "ओलावृष्टि", "सूखा", "कटी हुई फसल", "सुखाने",
        "పంటల బీమా", "పంట నష్టం", "ఫసల్ బీమా", "బీమా", "వడగండ్లు", "కరువు",
        "ಬೆಳೆ ವಿಮೆ", "ಬೆಳೆ ನಷ್ಟ", "ವಿಮೆ ಪರಿಹಾರ", "ವಿಮೆ", "ಆಲಿಕಲ್ಲು", "ಬರ", "ಬರಗಾಲ",
        "വിള ഇൻഷുറൻസ്", "വിളനാശം", "നഷ്ടപരിഹാരം", "ഇൻഷുറൻസ്", "വരൾച്ച", "ആലിപ്പഴം"
    ],
    "pm_kisan_income_support": [
        "pm kisan", "pm-kisan", "samman nidhi", "ekyc", "kisan 2000", "installment",
        "கிசான் சம்மான்", "2000 ரூபாய்", "இகேஒய்சி",
        "किसान सम्मान", "पीएम किसान", "ई-केवाईसी", "किस्त",
        "పీఎం కిసాన్", "రైతు సాయం", "ఈకేవైసీ",
        "ಪಿಎಂ ಕಿಸಾನ್", "ಕಿಸಾನ್ ಸಮ್ಮಾನ್", "ಕಂತು",
        "പിഎം കിസാൻ", "കിസാൻ സമ്മാൻ", "ഇ-കെവൈസി"
    ],
    "soil_health_card": [
        "soil health", "soil test", "soil card", "shc", "npk",
        "மண் பரிசோதனை", "மண் வள அட்டை",
        "मृदा स्वास्थ्य", "मिट्टी परीक्षण", "सॉइल कार्ड",
        "భూసార పరీక్ష", "మట్టి పరీక్ష",
        "ಮಣ್ಣು ಪರೀಕ್ಷೆ", "ಮಣ್ಣು ಆರೋಗ್ಯ ಕಾರ್ಡ್",
        "മണ്ണ് പരിശോധന", "മണ്ണ് കാർഡ്"
    ],
    "smam_farm_mechanization": [
        "smam", "tractor subsidy", "drone subsidy", "machinery", "custom hiring",
        "டிராக்டர் மானியம்", "இயந்திர மானியம்",
        "ट्रैक्टर सब्सिडी", "कृषि यंत्र", "ड्रोन सब्सिडी",
        "ట్రాక్టర్ సబ్సిడీ", "వ్యవసాయ పరికరాలు",
        "ಟ್ರಾಕ್ಟರ್ ಸಬ್ಸಿಡಿ", "ಕೃಷಿ ಯಂತ್ರೋಪಕರಣ",
        "ട്രാക്ടർ സബ്‌സിഡി", "കാർഷിക യന്ത്രങ്ങൾ"
    ]
}


class GovernmentSchemesEngine:
    """
    Knowledge Engine for Central & State Government Welfare Schemes,
    including the PMFBY Differentiated Loss Assessment Decision Engine.
    """

    def __init__(self, data_path: Optional[Path] = None):
        path = data_path or DATA_PATH
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
        self.schemes: List[Dict[str, Any]] = data.get("schemes", [])
        self._by_id = {s["scheme_id"]: s for s in self.schemes}

    def evaluate_pmfby_scenario(
        self,
        peril: str,
        hours_elapsed: Optional[int] = None,
        is_post_harvest: bool = False,
        locale: str = "en"
    ) -> Dict[str, Any]:
        """
        Decision engine enforcing ADR-0008: Differentiated guidance for
        Localized Calamity (72h), Post-Harvest (14 days), and Widespread Area Perils (CCE).
        """
        norm_peril = peril.lower().strip()
        loc = locale.lower() if locale in ["ta", "hi", "te", "kn", "ml"] else "en"

        localized_perils = ["hail", "hailstorm", "landslide", "inundation", "cloudburst", "natural fire", "ஆலங்கட்டி", "மழை வெள்ளம்", "ओलावृष्टि", "जलभराव", "వడగండ్లు", "నీటమునుగుట", "ಆಲಿಕಲ್ಲು", "ആലിപ്പഴം"]
        widespread_perils = ["drought", "dry spell", "regional flood", "widespread flood", "pest epidemic", "வறட்சி", "सूखा", "కరువు", "ಬರ", "വരൾച്ച"]

        is_localized = any(lp in norm_peril for lp in localized_perils)
        is_widespread = any(wp in norm_peril for wp in widespread_perils)

        pmfby_data = self._by_id.get("pmfby_crop_insurance", {})

        if is_widespread:
            msg = {
                "en": "Under PMFBY operational guidelines, widespread perils (Drought, Regional Floods, Pest Epidemics) are assessed on the AREA APPROACH at the Notified Insurance Unit (Gram Panchayat / Block) level via State Crop Cutting Experiments (CCE). Individual 72-hour loss intimations are NOT required. Compensation is automatically calculated and transferred directly to Aadhaar-linked bank accounts if actual yield falls below threshold yield.",
                "ta": "PMFBY வழிகாட்டுதல்களின்படி, வறட்சி மற்றும் பெருவெள்ளம் போன்ற பரவலான இழப்புகள் கிராம ஊராட்சி அளவில் பயிர் அறுவடை பரிசோதனைகள் (CCE) மூலம் 'பகுதி அணுகுமுறை' (Area Approach) அடிப்படையில் கணக்கிடப்படுகின்றன. இதற்கு தனிநபர் 72 மணி நேர அறிவிப்பு தேவையில்லை. இழப்பீடு நேரடியாக வங்கி கணக்கில் வரவு வைக்கப்படும்.",
                "hi": "पीएमएफबीवाई दिशा-निर्देशों के अनुसार व्यापक आपदाओं (सूखा, बाढ़) का आकलन ग्राम पंचायत स्तर पर 'क्षेत्रीय दृष्टिकोण' (Area Approach) व फसल कटाई प्रयोगों (CCE) द्वारा किया जाता है। इसके लिए व्यक्तिगत 72 घंटे की पूर्व सूचना आवश्यक नहीं है।",
                "te": "పీఎంఎఫ్‌బీవై మార్గదర్శకాల ప్రకారం, కరువు లేదా విస్తృత వరదల నష్టం గ్రామ పంచాయతీ స్థాయిలో 'ఏరియా విధానం' (Area Approach) మరియు పంట కోత ప్రయోగాల (CCE) ద్వారా నిర్ణయించబడుతుంది. వ్యక్తిగత 72 గంటల దరఖాస్తు అవసరం లేదు.",
                "kn": "ಪಿಎಂಎಫ್‌ಬಿವೈ ನಿಯಮಗಳ ಪ್ರಕಾರ, ಬರ ಅಥವಾ ಪ್ರವಾಹದಂತಹ ವ್ಯಾಪಕ ನಷ್ಟಗಳನ್ನು ಗ್ರಾಮ ಪಂಚಾಯತ್ ಮಟ್ಟದಲ್ಲಿ ಬೆಳೆ ಕಟಾವು ಪ್ರಯೋಗಗಳ (CCE) ಮೂಲಕ ಅಂದಾಜಿಸಲಾಗುತ್ತದೆ. ವೈಯಕ್ತಿಕ 72 ಗಂಟೆಗಳ ಅರ್ಜಿ ಅಗತ್ಯವಿಲ್ಲ.",
                "ml": "പിഎംഎഫ്‌ബിവൈ മാർഗ്ഗനിർദ്ദേശങ്ങൾ പ്രകാരം വരൾച്ച, പ്രളയം എന്നിവ പഞ്ചായത്ത് തലത്തിൽ ക്രോപ്പ് കട്ടിംഗ് പരീക്ഷണങ്ങൾ (CCE) വഴിയാണ് കണക്കാക്കുന്നത്. ഇതിനായി വ്യക്തിഗത 72 മണിക്കൂർ അറിയിപ്പ് ആവശ്യമില്ല."
            }
            return {
                "peril_category": "WIDESPREAD_PERIL_AREA_APPROACH",
                "requires_72h_notice": False,
                "advisory": msg.get(loc, msg["en"]),
                "official_portal": pmfby_data.get("official_portal", "https://pmfby.gov.in"),
                "helpline": pmfby_data.get("helpline", "14447")
            }

        if is_post_harvest:
            msg = {
                "en": "PMFBY covers post-harvest losses strictly for crops kept in 'cut-and-spread' condition in the field for drying, up to a maximum of 14 days from harvesting. Loss must be reported within 72 hours via the Crop Insurance App or Toll-Free 14447 with geotagged photos.",
                "ta": "அறுவடைக்கு பிந்தைய இழப்பு என்பது வயலில் உலர்த்துவதற்காக வைக்கப்பட்ட பயிர்களுக்கு மட்டுமே அறுவடை செய்த 14 நாட்களுக்குள் பொருந்தும். இழப்பு ஏற்பட்ட 72 மணி நேரத்திற்குள் 'Crop Insurance' ஆப் அல்லது 14447 மூலமாக தகவல் தெரிவிக்க வேண்டும்.",
                "hi": "फसल कटाई के बाद खेत में सुखाने के लिए रखी गई फसल (अधिकतम 14 दिन) के नुकसान की सूचना 72 घंटे के भीतर क्रॉप इंश्योरेंस ऐप या टोल-फ्री 14447 पर देना अनिवार्य है।",
                "te": "పంట కోత తర్వాత పొలంలో ఆరబెట్టిన పంటకు (గరిష్టంగా 14 రోజులు) నష్టం జరిగితే 72 గంటల్లోపు క్రాప్ ఇన్సూరెన్స్ యాప్ లేదా 14447 ద్వారా నివేదించాలి.",
                "kn": "ಕಟಾವಿನ ನಂತರ ಹೊಲದಲ್ಲಿ ಒಣಗಲು ಇಟ್ಟ ಬೆಳೆಗೆ (ಗರಿಷ್ಠ 14 ದಿನಗಳು) ನಷ್ಟವಾದರೆ 72 ಗಂಟೆಗಳ ಒಳಗೆ ಕ್ರಾಪ್ ಇನ್ಶೂರೆನ್ಸ್ ಆ್ಯಪ್ ಅಥವಾ 14447 ಮೂಲಕ ವರದಿ ಮಾಡಬೇಕು.",
                "ml": "വിളവെടുപ്പിന് ശേഷം ഉണങ്ങാൻ ഇട്ടിരിക്കുന്ന വിളകൾക്ക് (പരമാവധി 14 ദിവസം) നഷ്ടം സംഭവിച്ചാൽ 72 മണിക്കൂറിനകം ക്രോപ്പ് ഇൻഷുറൻസ് ആപ്പ് അല്ലെങ്കിൽ 14447 വഴി അറിയിക്കണം."
            }
            return {
                "peril_category": "POST_HARVEST_LOSS_72H",
                "requires_72h_notice": True,
                "advisory": msg.get(loc, msg["en"]),
                "official_portal": pmfby_data.get("official_portal", "https://pmfby.gov.in"),
                "helpline": pmfby_data.get("helpline", "14447")
            }

        # Default Localized Calamity
        hrs = hours_elapsed if hours_elapsed is not None else 24
        if hrs <= 72:
            msg = {
                "en": f"LOCALIZED CALAMITY ALERT ({hrs}h elapsed): You are within the MANDATORY 72-HOUR NOTICE WINDOW. Immediately submit loss details via the 'Crop Insurance App' (available on Google Play) or call Toll-Free 14447. Have ready: 1) Geotagged damage photo, 2) Survey/Khasra number, 3) Bank passbook copy, 4) Sowing certificate.",
                "ta": f"உள்ளூர் பயிர் சேத எச்சரிக்கை ({hrs} மணி நேரம் முடிந்தது): நீங்கள் கட்டாய 72 மணி நேர அறிவிப்பு காலத்திற்குள் உள்ளீர்கள். உடனே 'Crop Insurance' ஆப் அல்லது கட்டணமில்லா 14447 என்ற எண்ணில் தகவல் தெரிவிக்கவும். தேவையானவை: 1) புகைப்படம், 2) சர்வே எண், 3) வங்கி கணக்கு புத்தகம்.",
                "hi": f"स्थानीय फसल क्षति सूचना ({hrs} घंटे बीते): आप अनिवार्य 72 घंटे की समय सीमा के भीतर हैं। तुरंत 'Crop Insurance' ऐप या टोल-फ्री 14447 पर सूचना दर्ज करें। आवश्यक दस्तावेज: 1) जियोटैग फोटो, 2) खसरा/सर्वे नंबर, 3) बैंक पासबुक।",
                "te": f"స్థానిక పంట నష్టం హెచ్చరిక ({hrs} గంటలు): మీరు 72 గంటల సమయ పరిమితిలో ఉన్నారు. వెంటనే 'Crop Insurance' యాప్ లేదా టోల్-ఫ్రీ 14447 ద్వారా సమాచారం ఇవ్వండి. అవసరమైనవి: 1) ఫోటో, 2) సర్వే నంబర్, 3) బ్యాంక్ పాస్‌బుక్.",
                "kn": f"ಸ್ಥಳೀಯ ಬೆಳೆ ಹಾನಿ ಎಚ್ಚರಿಕೆ ({hrs} ಗಂಟೆಗಳು): ನೀವು 72 ಗಂಟೆಗಳ ಕಾಲಮಿತಿಯಲ್ಲಿದ್ದೀರಿ. ತಕ್ಷಣವೇ 'Crop Insurance' ಆ್ಯಪ್ ಅಥವಾ 14447 ಮೂಲಕ ವರದಿ ಮಾಡಿ. ಅಗತ್ಯ ದಾಖಲೆಗಳು: 1) ಫೋಟೋ, 2) ಸರ್ವೆ ನಂಬರ್, 3) ಬ್ಯಾಂಕ್ ಪಾಸ್‌ಬುಕ್.",
                "ml": f"പ്രാദേശിക വിളനാശ അറിയിപ്പ് ({hrs} മണിക്കൂർ): നിങ്ങൾ 72 മണിക്കൂർ സമയപരിധിക്കുള്ളിലാണ്. ഉടൻ തന്നെ 'Crop Insurance' ആപ്പ് അല്ലെങ്കിൽ 14447 വഴി വിവരങ്ങൾ നൽകുക. ആവശ്യമായവ: 1) ഫോട്ടോ, 2) സർവേ നമ്പർ, 3) ബാങ്ക് പാസ്ബുക്ക്."
            }
            return {
                "peril_category": "LOCALIZED_CALAMITY_ACTIVE_WINDOW",
                "requires_72h_notice": True,
                "advisory": msg.get(loc, msg["en"]),
                "official_portal": pmfby_data.get("official_portal", "https://pmfby.gov.in"),
                "helpline": pmfby_data.get("helpline", "14447"),
                "required_documents": [
                    "Geotagged damage photo taken from field",
                    "Revenue Survey / Khasra number",
                    "Bank passbook with IFSC code",
                    "Aadhaar card copy"
                ]
            }
        else:
            msg = {
                "en": f"NOTICE: {hrs} hours have elapsed since damage. The standard individual notice window under PMFBY is 72 hours. Immediately visit your Block Assistant Agriculture Officer (AAO) or Bank Branch with survey records to submit a special written condonation request for joint inspection.",
                "ta": f"கவனத்திற்கு: சேதம் ஏற்பட்டு {hrs} மணி நேரம் கடந்துவிட்டது. வழக்கமான அறிவிப்பு அவகாசம் 72 மணி நேரம் மட்டுமே. உடனடியாக உங்கள் வட்டார வேளாண் அலுவலரை அணுகி சிறப்பு ஆய்வு கோரிக்கை மனுவை சமர்ப்பிக்கவும்.",
                "hi": f"सूचना: नुकसान के बाद {hrs} घंटे बीत चुके हैं। पीएमएफबीवाई की सामान्य समय-सीमा 72 घंटे है। कृपया तुरंत अपने ब्लॉक कृषि अधिकारी से संपर्क कर विशेष निरीक्षण हेतु आवेदन दें।",
                "te": f"గమనిక: నష్టం జరిగి {hrs} గంటలు గడిచాయి. సాధారణ పరిమితి 72 గంటలు మాత్రమే. వెంటనే మీ మండల వ్యవసాయ అధికారిని సంప్రదించి దరఖాస్తు చేసుకోండి.",
                "kn": f"ಸೂಚನೆ: ನಷ್ಟವಾಗಿ {hrs} ಗಂಟೆಗಳು ಕಳೆದಿವೆ. ಸಾಮಾನ್ಯ ಗಡುವು 72 ಗಂಟೆಗಳು. ತಕ್ಷಣವೇ ನಿಮ್ಮ ತಾಲೂಕು ಕೃಷಿ ಅಧಿಕಾರಿಯನ್ನು ಭೇಟಿ ಮಾಡಿ ಲಿಖಿತ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ.",
                "ml": f"ശ്രദ്ധിക്കുക: {hrs} മണിക്കൂർ കഴിഞ്ഞിരിക്കുന്നു. സാധാരണ സമയപരിധി 72 മണിക്കൂറാണ്. ഉടൻ തന്നെ കൃഷി ഓഫീസറെ കണ്ട് പ്രത്യേക പരിശോധനയ്ക്കായി അപേക്ഷിക്കുക."
            }
            return {
                "peril_category": "LOCALIZED_CALAMITY_EXPIRED_WINDOW",
                "requires_72h_notice": True,
                "advisory": msg.get(loc, msg["en"]),
                "official_portal": pmfby_data.get("official_portal", "https://pmfby.gov.in"),
                "helpline": pmfby_data.get("helpline", "14447")
            }

    def match_scheme(self, query: str, locale: str = "en") -> Optional[Dict[str, Any]]:
        """
        Matches user query against known government schemes in any of the 6 languages.
        """
        norm_query = query.lower()
        loc = locale.lower() if locale in ["ta", "hi", "te", "kn", "ml"] else "en"

        matched_id = None
        for s_id, keywords in SCHEME_KEYWORDS.items():
            for k in keywords:
                if k == "बीमा":
                    # Distinct word check: "बीमारी" (disease) is NOT "बीमा" (insurance)
                    if "बीमारी" in norm_query and "फसल" not in norm_query and "क्लेम" not in norm_query:
                        continue
                    if re.search(r"(?:\b|\W|^)बीमा(?:\b|\W|$)", norm_query):
                        matched_id = s_id
                        break
                elif len(k.split()) == 1 and len(k) <= 4:
                    if re.search(r"(?:\b|\W|^)" + re.escape(k) + r"(?:\b|\W|$)", norm_query):
                        matched_id = s_id
                        break
                else:
                    if k in norm_query:
                        matched_id = s_id
                        break
            if matched_id:
                break

        if not matched_id:
            return None

        scheme = self._by_id.get(matched_id)
        if not scheme:
            return None

        # Localized name
        name_key = f"name_{loc}"
        localized_name = scheme.get(name_key, scheme.get("name_en", ""))

        return {
            "scheme_id": scheme["scheme_id"],
            "name": localized_name,
            "official_portal": scheme.get("official_portal", ""),
            "helpline": scheme.get("helpline", ""),
            "data": scheme
        }


# Global singleton instance
government_schemes_engine = GovernmentSchemesEngine()
