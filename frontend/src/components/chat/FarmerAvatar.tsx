'use client';

import React, { useState, useEffect } from 'react';
import { Volume2, Sparkles, Smile, User, Bot, RefreshCw } from 'lucide-react';

interface FarmerAvatarProps {
  isSpeaking: boolean;
  isListening: boolean;
  currentLang: string;
  avatarType?: 'farmer' | 'scientist';
  onToggleAvatarType?: () => void;
}

export function FarmerAvatar({
  isSpeaking,
  isListening,
  currentLang,
  avatarType = 'farmer',
  onToggleAvatarType
}: FarmerAvatarProps) {
  const [mouthOpen, setMouthOpen] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);

  // Synchronous mouth movement when speaking
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSpeaking) {
      interval = setInterval(() => {
        setMouthOpen((prev) => !prev);
      }, 180);
    } else {
      setMouthOpen(false);
    }
    return () => clearInterval(interval);
  }, [isSpeaking]);

  // Periodic eye blink (every 4s for 200ms)
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 200);
    }, 4000);
    return () => clearInterval(blinkInterval);
  }, []);

  const getGreeting = () => {
    switch (currentLang) {
      case 'ta':
        return 'வணக்கம் விவசாய நண்பரே! என்ன பயிர் ஆலோசனை வேண்டும்?';
      case 'hi':
        return 'नमस्ते किसान मित्र! आज आपकी क्या सहायता करूँ?';
      case 'te':
        return 'నమస్తే రైతు మిత్రమా! మీకు ఎలాంటి పంట సలహా కావాలి?';
      case 'kn':
        return 'ನಮಸ್ಕಾರ ರೈತ ಮಿತ್ರರೇ! ನಿಮಗೆ ಯಾವ ಬೆಳೆ ಮಾಹಿತಿ ಬೇಕು?';
      case 'ml':
        return 'നമസ്കാരം കർഷക സുഹൃത്തേ! എന്ത് കാർഷിക സഹായമാണ് വേണ്ടത്?';
      case 'pa':
        return 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ ਕਿਸਾਨ ਵੀਰੋ! ਅੱਜ ਤੁਹਾਨੂੰ ਕਿਹੜੀ ਖੇਤੀ ਸਲਾਹ ਚਾਹੀਦੀ ਹੈ?';
      case 'mr':
        return 'नमस्कार शेतकरी मित्रा! आज शेतीबद्दल काय माहिती हवी आहे?';
      case 'bn':
        return 'নমস্কার কৃষক বন্ধু! আজ আপনার কী কৃষি পরামর্শ প্রয়োজন?';
      default:
        return 'Hello Farmer Friend! Ask me anything about crops, mandis, or weather.';
    }
  };

  const getStatusText = () => {
    if (isSpeaking) {
      switch (currentLang) {
        case 'ta': return 'வழிகாட்டல் ஆடியோவில் பேசப்படுகிறது...';
        case 'hi': return 'सलाह आवाज में सुनाई जा रही है...';
        case 'te': return 'సలహా ఆడియోలో వినబడుతోంది...';
        case 'kn': return 'ಸಲಹೆಯನ್ನು ಧ್ವನಿಯಲ್ಲಿ ಹೇಳಲಾಗುತ್ತಿದೆ...';
        case 'ml': return 'നിർദ്ദേശം ശബ്ദത്തിൽ കേൾപ്പിക്കുന്നു...';
        case 'pa': return 'ਸਲਾਹ ਆਵਾਜ਼ ਵਿੱਚ ਸੁਣਾਈ ਜਾ ਰਹੀ ਹੈ...';
        case 'mr': return 'सल्ला आवाजात ऐकवला जात आहे...';
        case 'bn': return 'পরামর্শ অডিওতে শোনানো হচ্ছে...';
        default: return 'Speaking agronomic advice aloud...';
      }
    }
    if (isListening) {
      switch (currentLang) {
        case 'ta': return 'நான் கேட்கிறேன்... பேசுங்கள்!';
        case 'hi': return 'मैं सुन रहा हूँ... बोलिए!';
        case 'te': return 'నేను వింటున్నాను... మాట్లాడండి!';
        case 'kn': return 'ನಾನು ಕೇಳುತ್ತಿದ್ದೇನೆ... ಮಾತನಾಡಿ!';
        case 'ml': return 'ഞാൻ കേൾക്കുന്നു... സംസാരിക്കൂ!';
        case 'pa': return 'ਮੈਂ ਸੁਣ ਰਿਹਾ ਹਾਂ... ਬੋਲੋ!';
        case 'mr': return 'मी ऐकत आहे... बोला!';
        case 'bn': return 'আমি শুনছি... বলুন!';
        default: return 'Listening to your voice... Speak now!';
      }
    }
    return getGreeting();
  };

  return (
    <div className="relative flex items-center gap-3">
      {/* Animated SVG Indian Villager / Farmer Avatar */}
      <div
        onClick={onToggleAvatarType}
        title="Tap to toggle between Kisan Mitra (Farmer) & Agronomist"
        className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 group cursor-pointer transition-transform hover:scale-105"
      >
        {/* Glow Ring on Voice Activity */}
        <div
          className={`absolute -inset-1 rounded-full blur-md transition-all duration-300 ${
            isSpeaking
              ? 'bg-gradient-to-r from-emerald-400 via-amber-400 to-green-500 opacity-90 animate-pulse'
              : isListening
              ? 'bg-rose-500 opacity-80 animate-ping'
              : 'bg-emerald-600/20 opacity-30 group-hover:opacity-60'
          }`}
        />

        {/* Avatar SVG Container */}
        <div className="relative w-full h-full rounded-full bg-gradient-to-br from-amber-100 via-emerald-100 to-amber-200 border-2 border-emerald-600 shadow-md flex items-center justify-center overflow-hidden">
          {avatarType === 'farmer' ? (
            /* Traditional Indian Farmer (Turban, Gamcha, Tilak, Mustache) */
            <svg viewBox="0 0 100 100" className="w-full h-full" aria-hidden="true">
              {/* Sky/Sun background */}
              <circle cx="50" cy="50" r="48" fill="#fef9c3" />
              <path d="M10 80 Q50 65 90 80 L90 100 L10 100 Z" fill="#15803d" />

              {/* Farmer Body & White Kurta */}
              <path d="M25 100 Q50 78 75 100 Z" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
              {/* Traditional Saffron Angavastram / Gamcha */}
              <path d="M30 85 Q50 95 70 85 Q65 100 35 100 Z" fill="#f59e0b" />

              {/* Neck & Face */}
              <rect x="44" y="62" width="12" height="15" rx="3" fill="#d97706" opacity="0.4" />
              <ellipse cx="50" cy="52" rx="20" ry="22" fill="#fcd34d" />

              {/* Saffron Turban / Pagdi / Thundu */}
              <path d="M26 42 Q50 16 74 42 Q80 30 65 20 Q50 12 35 20 Q20 30 26 42 Z" fill="#ea580c" />
              <path d="M32 32 Q50 24 68 32 Q74 26 60 18 Q50 14 40 18 Z" fill="#f97316" />
              {/* Turban gold jewel/badge */}
              <circle cx="50" cy="24" r="3" fill="#fbbf24" />

              {/* Eyebrows */}
              <path d="M36 44 Q41 42 45 44" stroke="#78350f" strokeWidth="2" strokeLinecap="round" fill="none" />
              <path d="M55 44 Q59 42 64 44" stroke="#78350f" strokeWidth="2" strokeLinecap="round" fill="none" />

              {/* Eyes with Animated Blinking */}
              {isBlinking ? (
                <>
                  <path d="M37 49 Q41 52 45 49" stroke="#78350f" strokeWidth="2" strokeLinecap="round" fill="none" />
                  <path d="M55 49 Q59 52 63 49" stroke="#78350f" strokeWidth="2" strokeLinecap="round" fill="none" />
                </>
              ) : (
                <>
                  <circle cx="41" cy="48" r="3" fill="#78350f" />
                  <circle cx="59" cy="48" r="3" fill="#78350f" />
                  <circle cx="42" cy="47" r="1" fill="#ffffff" />
                  <circle cx="60" cy="47" r="1" fill="#ffffff" />
                </>
              )}

              {/* Auspicious Tilak on Forehead */}
              <path d="M49 34 L51 34 L50 40 Z" fill="#dc2626" />

              {/* Nose */}
              <path d="M50 49 Q52 54 49 56" stroke="#b45309" strokeWidth="1.5" strokeLinecap="round" fill="none" />

              {/* Traditional Indian Mustache */}
              <path d="M38 58 Q46 56 50 60 Q54 56 62 58 Q56 64 50 61 Q44 64 38 58 Z" fill="#78350f" />

              {/* Animated Mouth (Moves synchronously when audio plays) */}
              {mouthOpen ? (
                <ellipse cx="50" cy="65" rx="5" ry="4" fill="#991b1b" />
              ) : (
                <path d="M46 64 Q50 67 54 64" stroke="#78350f" strokeWidth="2" strokeLinecap="round" fill="none" />
              )}

              {/* Friendly Cheerful Blush */}
              <ellipse cx="34" cy="55" rx="4" ry="2.5" fill="#f87171" opacity="0.4" />
              <ellipse cx="66" cy="55" rx="4" ry="2.5" fill="#f87171" opacity="0.4" />
            </svg>
          ) : (
            /* Agronomist / Scientific Officer (Dr. Priya) */
            <svg viewBox="0 0 100 100" className="w-full h-full" aria-hidden="true">
              <circle cx="50" cy="50" r="48" fill="#dcfce7" />
              {/* Lab Coat / Professional attire */}
              <path d="M26 100 Q50 78 74 100 Z" fill="#0284c7" />
              <path d="M38 100 L50 82 L62 100 Z" fill="#ffffff" />
              {/* Face */}
              <ellipse cx="50" cy="52" rx="19" ry="21" fill="#fed7aa" />
              {/* Hair */}
              <path d="M28 42 Q50 20 72 42 Q78 68 70 75 Q68 50 65 42 Q50 32 35 42 Q32 50 30 75 Z" fill="#3b0764" />
              {isBlinking ? (
                <path d="M38 50 Q42 53 46 50 M54 50 Q58 53 62 50" stroke="#3b0764" strokeWidth="2" fill="none" />
              ) : (
                <>
                  <circle cx="42" cy="49" r="3" fill="#3b0764" />
                  <circle cx="58" cy="49" r="3" fill="#3b0764" />
                </>
              )}
              {mouthOpen ? (
                <ellipse cx="50" cy="62" rx="4" ry="3" fill="#be123c" />
              ) : (
                <path d="M46 61 Q50 64 54 61" stroke="#be123c" strokeWidth="2" fill="none" />
              )}
            </svg>
          )}

          {/* Voice Wave Indicator overlay when speaking */}
          {isSpeaking && (
            <div className="absolute bottom-1 bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full text-[9px] font-black flex items-center gap-1 shadow-sm animate-bounce">
              <Volume2 className="w-3 h-3 text-slate-950" />
              <span>Speaking</span>
            </div>
          )}
        </div>
      </div>

      {/* Dynamic Speech Bubble from Avatar */}
      <div className="flex-1 bg-white/95 backdrop-blur-md border border-emerald-300/80 rounded-2xl p-2.5 sm:p-3 shadow-xs relative max-w-lg transition-all">
        {/* Pointer Triangle */}
        <div className="absolute top-1/2 -left-2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-r-[8px] border-r-white border-b-[6px] border-b-transparent hidden sm:block" />

        <div className="flex items-center justify-between gap-2 mb-0.5">
          <div className="flex items-center gap-1.5 text-xs font-black text-emerald-950">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>{avatarType === 'farmer' ? 'Kisan Mitra (किसान साथी)' : 'Krishi Officer (कृषि वैज्ञानिक)'}</span>
          </div>
          {onToggleAvatarType && (
            <button
              type="button"
              onClick={onToggleAvatarType}
              className="text-[10px] text-emerald-700 font-bold hover:underline flex items-center gap-0.5"
            >
              <RefreshCw className="w-2.5 h-2.5" />
              <span>Switch</span>
            </button>
          )}
        </div>
        <p className="text-xs text-slate-700 font-semibold leading-snug">
          {getStatusText()}
        </p>
      </div>
    </div>
  );
}
