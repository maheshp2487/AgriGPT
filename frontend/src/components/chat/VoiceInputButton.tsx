'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Mic, MicOff, Volume2 } from 'lucide-react';

interface VoiceInputButtonProps {
  onTranscript: (text: string) => void;
  onListeningChange?: (isListening: boolean) => void;
  disabled?: boolean;
}

const BCP47_LOCALE_MAP: Record<string, string> = {
  ta: 'ta-IN',
  hi: 'hi-IN',
  te: 'te-IN',
  kn: 'kn-IN',
  ml: 'ml-IN',
  pa: 'pa-IN',
  mr: 'mr-IN',
  bn: 'bn-IN',
  en: 'en-IN',
};

export function VoiceInputButton({
  onTranscript,
  onListeningChange,
  disabled = false,
}: VoiceInputButtonProps) {
  const { locale, currentLanguage } = useLanguage();
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  // Keep a stable ref to onTranscript so re-renders don't destroy active speech recognition!
  const onTranscriptRef = useRef(onTranscript);
  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);

  const onListeningChangeRef = useRef(onListeningChange);
  useEffect(() => {
    onListeningChangeRef.current = onListeningChange;
  }, [onListeningChange]);

  const notifyListening = (listening: boolean) => {
    setIsListening(listening);
    onListeningChangeRef.current?.(listening);
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = BCP47_LOCALE_MAP[locale] || 'en-IN';

      recognition.onstart = () => {
        notifyListening(true);
      };

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const item = event.results[i];
          if (item.isFinal) {
            finalTranscript += item[0].transcript;
          }
        }
        if (finalTranscript.trim()) {
          onTranscriptRef.current(finalTranscript.trim());
        }
      };

      recognition.onerror = (event: any) => {
        // 'no-speech' is normal when user takes a pause, don't show scary error
        if (event.error !== 'no-speech' && event.error !== 'aborted') {
          console.warn('Speech recognition status:', event.error);
        }
        if (event.error === 'not-allowed') {
          alert('Microphone access was denied. Please allow microphone permissions in your browser settings to speak in your language.');
        }
        notifyListening(false);
      };

      recognition.onend = () => {
        notifyListening(false);
      };

      recognitionRef.current = recognition;
    } catch (err) {
      console.warn('Failed to initialize speech recognition:', err);
      setIsSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
    };
  }, [locale]); // ONLY re-initialize when the selected language changes!

  const toggleListening = () => {
    if (!recognitionRef.current || disabled) return;

    if (isListening) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      notifyListening(false);
    } else {
      try {
        recognitionRef.current.lang = BCP47_LOCALE_MAP[locale] || 'en-IN';
        recognitionRef.current.start();
        notifyListening(true);
      } catch (err) {
        console.warn('Failed to start speech recognition:', err);
        notifyListening(false);
      }
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <div className="relative flex items-center">
      {/* Pulsing Voice Waves Aura when Active */}
      {isListening && (
        <span className="absolute -inset-1.5 rounded-2xl bg-rose-500/30 animate-ping pointer-events-none" />
      )}

      <button
        type="button"
        onClick={toggleListening}
        disabled={disabled}
        aria-label={isListening ? 'Stop listening' : `Tap to speak in ${currentLanguage.nativeName}`}
        title={isListening ? 'Listening... Tap to stop' : `Tap to speak in ${currentLanguage.nativeName}`}
        className={`touch-target relative w-11 h-11 sm:w-12 sm:h-12 rounded-2xl transition-all flex items-center justify-center cursor-pointer shadow-sm ${
          isListening
            ? 'bg-rose-600 text-white shadow-rose-600/30 ring-4 ring-rose-200 animate-pulse'
            : 'bg-[#2e7d32] hover:bg-[#256629] text-white active:scale-95'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {isListening ? (
          <MicOff className="w-5 h-5 text-white" />
        ) : (
          <Mic className="w-5 h-5 text-white" />
        )}
      </button>
    </div>
  );
}
