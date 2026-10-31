'use client';

import React from 'react';
import { Calendar, Droplets, ArrowUpRight, Sparkles, Clock, Sprout } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface CropItem {
  id: string;
  names: Record<string, string>;
  season: string;
  duration: string;
  profitPerAcre: string;
  profitPercent: number;
  profitStars: string;
  soil: string;
  advice: Record<string, string>;
}

const CROPS_DATA: CropItem[] = [
  {
    id: 'paddy',
    names: {
      en: 'Samba Season Paddy (Rice)',
      ta: 'சம்பா நெல் (ADT-53 / CO-51)',
      hi: 'संबा धान (चावल)',
      te: 'సాంబ వరి (Paddy)',
      kn: 'ಸಾಂಬಾ ಭತ್ತ (Paddy)',
      ml: 'സാംബ നെല്ല് (Paddy)',
      pa: 'ਸਾਂਭਾ ਝੋਨਾ (Paddy)',
      mr: 'संबा भात (चावल)',
      bn: 'সাম্বা ধান (Paddy)',
    },
    season: 'Oct - Jan (Monsoon/Rabi)',
    duration: '125 - 130 days',
    profitPerAcre: '₹38,000 - ₹44,000 / Acre',
    profitPercent: 78,
    profitStars: '★★★★☆',
    soil: 'Wetland / Clay loam',
    advice: {
      en: 'Best choice for current monsoon rains. Soak seeds in Pseudomonas (0.2%) solution for 30 minutes before sowing to stop blast disease early.',
      ta: 'தற்போதைய வடகிழக்கு பருவமழைக்கு மிகவும் ஏற்றது. விதைக்கும் முன் சூடோமோனாஸ் கரைசலில் 30 நிமிடம் விதைகளை நனைத்து வைத்தால் குலை நோய் வராது.',
      hi: 'वर्तमान मानसूनी बारिश के लिए उत्तम। बुवाई से पहले स्यूडोमोनास घोल में बीज भिगोने से झुलसा रोग नहीं लगता।',
      te: 'ప్రస్తుత వర్షాకాలానికి అత్యంత అనుకూలం. విత్తే ముందు సూడోమోనాస్ ద్రావణంలో 30 నిమిషాలు నానబెడితే అగ్గితెగులు రాదు.',
      kn: 'ಪ್ರಸ್ತುತ ಮಳೆಗಾಲಕ್ಕೆ ಅತ್ಯುತ್ತಮ. ಬಿತ್ತನೆಗೆ ಮುನ್ನ ಬೀಜಗಳನ್ನು ಸೂಡೋಮೊನಾಸ್ ದ್ರಾವಣದಲ್ಲಿ 30 ನಿಮಿಷ ನೆನೆಸಿದರೆ ಬೆಂಕಿ ರೋಗ ತಡೆಯಬಹುದು.',
      ml: 'മഴക്കാല കൃഷിക്ക് ഏറ്റവും അനുയോജ്യം. വിതയ്ക്കുന്നതിന് മുൻപ് വിത്ത് സ്യൂഡോമോണസ് ലായനിയിൽ 30 മിനിറ്റ് മുക്കിവെച്ചാൽ കുമിൾ രോഗങ്ങൾ തടയാം.',
      pa: 'ਮੌਨਸੂਨੀ ਬਾਰਿਸ਼ ਲਈ ਬਹੁਤ ਵਧੀਆ। ਬਿਜਾਈ ਤੋਂ ਪਹਿਲਾਂ ਸੂਡੋਮੋਨਾਸ ਘੋਲ ਵਿੱਚ ਬੀਜ ਭਿਓਂਣ ਨਾਲ ਝੁਲਸ ਰੋਗ ਦੀ ਰੋਕਥਾਮ ਹੁੰਦੀ ਹੈ।',
      mr: 'सध्याच्या मान्सून पावसासाठी उत्तम. पेरणीपूर्वी स्यूडोमोनास द्रावणात बियाणे भिजवल्याने करपा रोगाचा प्रादुर्भाव टळतो.',
      bn: 'বর্তমান মরসুমের জন্য উপযুক্ত। বোনার আগে সিউডোমোনাস দ্রবণে বীজ ভিজিয়ে রাখলে ব্লাস্ট রোগ প্রতিরোধ হয়।',
    },
  },
  {
    id: 'groundnut',
    names: {
      en: 'Groundnut / Peanut (TMV-13)',
      ta: 'மணிலா / வேர்க்கடலை (TMV-13)',
      hi: 'मूंगफली (तिलहन फसल)',
      te: 'వేరుశనగ (Groundnut)',
      kn: 'ಕಡಲೆಕಾಯಿ (Groundnut)',
      ml: 'നിലക്കടല (Groundnut)',
      pa: 'ਮੂੰਗਫਲੀ (Groundnut)',
      mr: 'भुईमूग (Groundnut)',
      bn: 'চীনাবাদাম (Groundnut)',
    },
    season: 'Oct - Feb (Rabi)',
    duration: '105 - 110 days',
    profitPerAcre: '₹42,000 - ₹50,000 / Acre',
    profitPercent: 85,
    profitStars: '★★★★★',
    soil: 'Red sandy loam (Light soil)',
    advice: {
      en: 'Requires very little water and yields stable profits. Apply 160 kg Gypsum per acre around day 40 to make the pods bigger and oil-rich.',
      ta: 'குறைந்த தண்ணீரில் நல்ல லாபம் தரும். 40-வது நாளில் ஏக்கருக்கு 160 கிலோ ஜிப்சம் போட்டால் மணிலா திரட்சியாகவும் அதிக எண்ணெயுடனும் வரும்.',
      hi: 'कम पानी में सबसे ज्यादा मुनाफा। बुवाई के 40 दिन बाद 160 किलो जिप्सम डालने से दाने बड़े और तेल भरपूर बनता है।',
      te: 'తక్కువ నీటితో అధిక లాభం. 40వ రోజున ఎకరాకు 160 కిలోల జిప్సం వేస్తే కాయలు లావుగా, నూనె శాతం ఎక్కువగా వస్తాయి.',
      kn: 'ಕಡಿಮೆ ನೀರಿನಲ್ಲಿ ಉತ್ತಮ ಆದಾಯ. ಬಿತ್ತನೆಯ 40 ದಿನಗಳ ನಂತರ ಎಕರೆಗೆ 160 ಕೆಜಿ ಜಿಪ್ಸಮ್ ಹಾಕಿದರೆ ಕಾಯಿ ದಪ್ಪವಾಗಿ ಎಣ್ಣೆಯಂಶ ಹೆಚ್ಚುತ್ತದೆ.',
      ml: 'കുറഞ്ഞ വെള്ളത്തിൽ നല്ല വിളവ്. 40-ാം ദിവസം ഏക്കറിന് 160 കിലോ ജിപ്സം ചേർത്താൽ കായ്കൾക്ക് വലിപ്പവും എണ്ണയുടെ അളവും കൂടും.',
      pa: 'ਘੱਟ ਪਾਣੀ ਵਿੱਚ ਵੱਧ ਮੁਨਾਫ਼ਾ। ਬਿਜਾਈ ਦੇ 40 ਦਿਨ ਬਾਅਦ ਪ੍ਰਤੀ ਏਕੜ 160 ਕਿੱਲੋ ਜਿਪਸਮ ਪਾਉਣ ਨਾਲ ਦਾਣੇ ਮੋਟੇ ਅਤੇ ਤੇਲ ਭਰਪੂਰ ਬਣਦੇ ਹਨ।',
      mr: 'कमी पाण्यात भरपूर नफा. पेरणीनंतर ४० दिवसांनी एकरी १६० किलो जिप्सम दिल्यास शेंगा पोसतात आणि तेलाचे प्रमाण वाढते.',
      bn: 'স্বল্প সেচে ভালো লাভ। বোনার ৪০ দিন পর একর প্রতি ১৬০ কেজি জিপসাম দিলে দানার আকার বড় হয় এবং তেলের মান বাড়ে।',
    },
  },
  {
    id: 'tomato',
    names: {
      en: 'Country & Hybrid Tomato',
      ta: 'நாட்டு & வீரிய தக்காளி',
      hi: 'हाइब्रिड टमाटर',
      te: 'హైబ్రిడ్ టమోటా',
      kn: 'ಹೈಬ್ರಿಡ್ ಟೊಮೆಟೊ',
      ml: 'ഹൈബ്രിഡ് തക്കാളി',
      pa: 'ਹਾਈਬ੍ਰਿਡ ਟਮਾਟਰ',
      mr: 'हायब्रिड टोमॅटो',
      bn: 'হাইব্রিড টমেটো',
    },
    season: 'Winter / Spring',
    duration: '85 - 90 days',
    profitPerAcre: '₹60,000 - ₹85,000 / Acre',
    profitPercent: 95,
    profitStars: '★★★★★',
    soil: 'Well-drained red loam',
    advice: {
      en: 'High-value cash crop ready in less than 3 months. Use drip irrigation and yellow sticky cards in the field to naturally trap whiteflies and vectors.',
      ta: '3 மாதத்திற்குள் விரைவான பண வரவு தரும். சொட்டு நீர் பாசனம் மற்றும் மஞ்சள் ஒட்டும் அட்டை வைத்தால் வெள்ளை ஈ பூச்சிகள் அழியும்.',
      hi: 'तीन महीने से भी कम समय में तैयार। ड्रिप सिंचाई और खेत में पीले चिपचिपे कार्ड लगाने से सफेद मक्खी का प्रकोप खत्म होता है।',
      te: 'మూడు నెలలలోపు మంచి రాబడి. డ్రిప్ సేద్యం మరియు పసుపు రంగు జిగురు కార్డులు వాడితే తెల్లదోమ బెడద ఉండదు.',
      kn: 'ಮೂರು ತಿಂಗಳಲ್ಲಿ ಉತ್ತಮ ವರಮಾನ. ಹನಿ ನೀರಾವರಿ ಮತ್ತು ಹಳದಿ ಜಿಗುಟು ಬಲೆಗಳನ್ನು ಬಳಸಿದರೆ ಬಿಳಿ ನೊಣ ನಿಯಂತ್ರಣ ಸಾಧ್ಯ.',
      ml: 'മൂന്ന് മാസത്തിനുള്ളിൽ മികച്ച വരുമാനം. ഡ്രിപ്പ് ഇറിഗേഷനും മഞ്ഞ കെണികളും ഉപയോഗിച്ചാൽ വെള്ളീച്ചകളെ നശിപ്പിക്കാം.',
      pa: 'ਤਿੰਨ ਮਹੀਨਿਆਂ ਤੋਂ ਘੱਟ ਸਮੇਂ ਵਿੱਚ ਤਿਆਰ ਨਕਦੀ ਫ਼ਸਲ। ਤੁਪਕਾ ਸਿੰਚਾਈ ਅਤੇ ਪੀਲੇ ਚਿਪਚਿਪੇ ਕਾਰਡ ਵਰਤ ਕੇ ਚਿੱਟੀ ਮੱਖੀ ਰੋਕੋ।',
      mr: 'तीन महिन्यांत थेट रोख नफा. ठिबक सिंचन आणि पिवळे चिकट सापळे वापरून पांढऱ्या माशीचे नैसर्गिक नियंत्रण करा.',
      bn: 'তিন মাসের মধ্যে তৈরি অর্থকরী ফসল। ড্রিপ সেচ এবং হলুদ আঠালো ফাঁদ ব্যবহার করে সাদা মাছি নিয়ন্ত্রণ করুন।',
    },
  },
  {
    id: 'blackgram',
    names: {
      en: 'Black Gram / Urad (Vamban-8)',
      ta: 'உளுந்து (வம்பன்-8)',
      hi: 'काली उड़द (दलहन)',
      te: 'మినుములు (Black Gram)',
      kn: 'ಉದ್ದು (Black Gram)',
      ml: 'ഉഴുന്ന് (Black Gram)',
      pa: 'ਕਾਲੀ ਮਾਂਹ / ਉੜਦ',
      mr: 'काळी उडीद (डाळ)',
      bn: 'কালো কলাই / মাসকলাই',
    },
    season: 'Post-Monsoon / Rice Fallow',
    duration: '70 - 75 days',
    profitPerAcre: '₹28,000 - ₹35,000 / Acre',
    profitPercent: 68,
    profitStars: '★★★★☆',
    soil: 'Loamy or rice-fallow soil',
    advice: {
      en: 'Ultra-fast pulse that enriches field soil with natural nitrogen nodules. Requires only 1 or 2 light waterings after germination.',
      ta: 'மிகக் குறுகிய கால பயிர். நிலத்தில் இயற்கை தழைச்சத்தை கூட்டும். விதைத்த பிறகு 1 அல்லது 2 முறை தண்ணீர் பாய்ச்சினாலே போதும்.',
      hi: 'बेहद कम समय की फसल। जमीन में प्राकृतिक नाइट्रोजन बढ़ाती है और केवल 1-2 बार हल्की सिंचाई चाहिए।',
      te: 'అతి తక్కువ కాల వ్యవధి గల పంట. నేలలో సహజ నత్రజని పెంచుతుంది, ఒకటి లేదా రెండు తడులు సరిపోతాయి.',
      kn: 'ಅತಿ ಕಡಿಮೆ ಅವಧಿಯ ಬೆಳೆ. ಮಣ್ಣಿಗೆ ನೈಸರ್ಗਿਕ ಸಾರಜನಕ ಒದಗಿಸುತ್ತದೆ, ಕೇವಲ 1-2 ಬಾರಿ ನೀರು ಹಾಯಿಸಿದರೆ ಸಾಕು.',
      ml: 'കുറഞ്ഞ കാലയളവിലുള്ള പയർവർഗ്ഗം. മണ്ണിൽ നൈട്രജൻ വർദ്ധിപ്പിക്കുന്നു, 1-2 നന മതിയാകും.',
      pa: 'ਬਹੁਤ ਘੱਟ ਸਮੇਂ ਵਾਲੀ ਦਾਲ। ਮਿੱਟੀ ਵਿੱਚ ਕੁਦਰਤੀ ਨਾਈਟ੍ਰੋਜਨ ਵਧਾਉਂਦੀ ਹੈ ਅਤੇ ਸਿਰਫ਼ 1-2 ਵਾਰ ਪਾਣੀ ਚਾਹੀਦਾ ਹੈ।',
      mr: 'अतिशय कमी कालावधीचे कडधान्य. जमिनीत नैसर्गिक नत्र स्थिर करते आणि फक्त १-२ हलके पाणी लागते.',
      bn: 'অতি স্বল্পমেয়াদী ডাল শস্য। মাটিতে প্রাকৃতিক নাইট্রোজেন যোগ করে এবং মাত্র ১-২ বার সেচ প্রয়োজন হয়।',
    },
  },
];

interface CropPlannerProps {
  onSelectCrop: (cropName: string) => void;
}

export function CropPlanner({ onSelectCrop }: CropPlannerProps) {
  const { locale } = useLanguage();

  const getSectionTitle = () => {
    switch (locale) {
      case 'ta': return 'தற்போது என்ன பயிர் சாகுபடி செய்யலாம்?';
      case 'hi': return 'इस मौसम में कौन सी फसल उगाएं?';
      case 'te': return 'ప్రస్తుత సీజన్లో ఏ పంట సాగు చేయాలి?';
      case 'kn': return 'ಈ ಋತುವಿನಲ್ಲಿ ಯಾವ ಬೆಳೆ ಬೆಳೆಯಬೇಕು?';
      case 'ml': return 'ഈ സീസണിൽ ഏത് വിള കൃഷി ചെയ്യണം?';
      case 'pa': return 'ਇਸ ਮੌਸਮ ਵਿੱਚ ਕਿਹੜੀ ਫ਼ਸਲ ਬੀਜੀਏ?';
      case 'mr': return 'या हंगामात कोणते पीक घ्यावे?';
      case 'bn': return 'এই মরসুমে কোন ফসল চাষ করবেন?';
      default: return 'What Should You Cultivate Right Now?';
    }
  };

  const getSectionDesc = () => {
    switch (locale) {
      case 'ta': return 'தற்போதைய பருவமழை, மண் வகை மற்றும் சந்தை மண்டி தேவையின் அடிப்படையிலான ICAR பரிந்துரைகள்.';
      case 'hi': return 'वर्तमान मौसम, मिट्टी के प्रकार और बाजार मांग के आधार पर शीर्ष 4 लाभदायक फसलें।';
      case 'te': return 'ప్రస్తుత వాతావరణం, నేల రకం మరియు మార్కెట్ డిమాండ్ ఆధారంగా సిఫార్సు చేయబడిన పంటలు.';
      case 'kn': return 'ಪ್ರಸ್ತುತ ಹವಾಮಾನ, ಮಣ್ಣಿನ ಗುಣ ಮತ್ತು ಮಾರುಕಟ್ಟೆ ಬೇಡಿಕೆಗೆ ಅನುಗುಣವಾಗಿ ಉತ್ತಮ ಬೆಳೆಗಳು.';
      case 'ml': return 'കാലാവസ്ഥ, മണ്ണിന്റെ ഗുണം, വിപണി സാധ്യത എന്നിവ അടിസ്ഥാനമാക്കിയുള്ള വിളകൾ.';
      case 'pa': return 'ਮੌਜੂਦਾ ਮੌਸਮ, ਮਿੱਟੀ ਅਤੇ ਮੰਡੀ ਮੰਗ ਦੇ ਆਧਾਰ ‘ਤੇ ਸਭ ਤੋਂ ਵੱਧ ਮੁਨਾਫ਼ੇ ਵਾਲੀਆਂ ਫ਼ਸਲਾਂ।';
      case 'mr': return 'हवामान, जमिनीचा प्रकार आणि बाजारपेठेतील मागणीनुसार सर्वाधिक नफा देणारी पिके.';
      case 'bn': return 'বর্তমান আবহাওয়া, মাটির ধরন এবং বাজার চাহিদার ভিত্তিতে লাভজনক ফসলের তালিকা।';
      default: return 'Smart recommendations for the current Rabi / Samba sowing window based on ICAR Package of Practices and market demand.';
    }
  };

  return (
    <section aria-labelledby="crop-planner-heading" className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#edf7ed] border border-[#c8e6c9] text-[#2e7d32] text-xs font-bold shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-[#2e7d32]" />
            <span>Optimal Sowing Window: October - November (Rabi / Samba)</span>
          </div>

          <h2 id="crop-planner-heading" className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
            {getSectionTitle()}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
            {getSectionDesc()}
          </p>
        </div>
      </div>

      {/* 4-Crop Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {CROPS_DATA.map((crop) => {
          const cropName = crop.names[locale] || crop.names.en;
          const adviceText = crop.advice[locale] || crop.advice.en;

          return (
            <div
              key={crop.id}
              className="bg-white border border-slate-200/90 hover:border-[#2e7d32] rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-xs hover:shadow-md transition-all duration-200 group"
            >
              <div className="space-y-3">
                {/* Header Tag & Title */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-[#2e7d32] bg-[#edf7ed] px-2.5 py-0.5 rounded-md border border-[#c8e6c9] inline-block">
                      {crop.season}
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-[#2e7d32] transition-colors leading-snug">
                      {cropName}
                    </h3>
                  </div>

                  <span className="bg-amber-100 text-amber-900 border border-amber-200 font-bold text-[10px] px-2 py-0.5 rounded-md shadow-2xs inline-flex items-center gap-1 shrink-0">
                    <Sparkles className="w-3 h-3 text-amber-600" />
                    <span>Top</span>
                  </span>
                </div>

                {/* Profit Meter Card */}
                <div className="bg-gradient-to-r from-[#1b4332] to-[#2d6a4f] rounded-xl p-3.5 text-white shadow-xs space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-emerald-200 font-semibold uppercase tracking-wider">
                      Est. Profit / Acre
                    </span>
                    <span className="text-amber-300 font-black tracking-wide text-xs">
                      {crop.profitStars}
                    </span>
                  </div>

                  <div className="text-lg font-extrabold text-amber-300">
                    {crop.profitPerAcre}
                  </div>

                  {/* Profit Gauge Bar */}
                  <div className="space-y-1 pt-1">
                    <div className="w-full bg-[#0d2319] h-2 rounded-full overflow-hidden p-0.5 border border-emerald-800">
                      <div
                        className="h-full bg-gradient-to-r from-amber-400 to-emerald-300 rounded-full transition-all duration-700"
                        style={{ width: `${crop.profitPercent}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-emerald-200 font-medium">
                      <span>Profit Index:</span>
                      <span className="font-bold">{crop.profitPercent}/100</span>
                    </div>
                  </div>
                </div>

                {/* Duration & Soil Traits */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-50 border border-slate-200/80 p-2.5 rounded-xl">
                    <span className="text-slate-500 font-medium flex items-center gap-1 text-[10px]">
                      <Clock className="w-3 h-3 text-[#2e7d32]" />
                      <span>Harvest Time</span>
                    </span>
                    <span className="font-bold text-slate-800 text-xs mt-0.5 block truncate">
                      {crop.duration}
                    </span>
                  </div>

                  <div className="bg-slate-50 border border-slate-200/80 p-2.5 rounded-xl">
                    <span className="text-slate-500 font-medium flex items-center gap-1 text-[10px]">
                      <Droplets className="w-3 h-3 text-sky-600" />
                      <span>Soil</span>
                    </span>
                    <span className="font-bold text-slate-800 text-xs mt-0.5 block truncate">
                      {crop.soil}
                    </span>
                  </div>
                </div>

                {/* ICAR Agronomic Tip */}
                <div className="text-xs text-slate-700 bg-amber-50/70 border border-amber-200/70 rounded-xl p-2.5 leading-relaxed font-medium">
                  <p className="flex items-start gap-1.5 text-[11px]">
                    <span className="shrink-0 text-amber-600 font-bold">💡</span>
                    <span><strong>ICAR Tip:</strong> {adviceText}</span>
                  </p>
                </div>
              </div>

              {/* 1-Tap Ask Sowing Guide Button */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => onSelectCrop(cropName)}
                  className="touch-target w-full text-center inline-flex items-center justify-center gap-1.5 text-xs font-bold text-white bg-[#2e7d32] hover:bg-[#1b5e20] py-2.5 rounded-xl shadow-xs transition-colors"
                >
                  <Sprout className="w-3.5 h-3.5" />
                  <span>Ask Sowing Guide</span>
                  <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

