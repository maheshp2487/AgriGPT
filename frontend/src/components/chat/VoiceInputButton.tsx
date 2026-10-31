'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Mic, MicOff, AlertCircle } from 'lucide-react';

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
  const { locale } = useLanguage();
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  const notifyListening = (listening: boolean) => {
    setIsListening(listening);
    onListeningChange?.(listening);
  };

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = BCP47_LOCALE_MAP[locale] || 'en-IN';

      recognition.onstart = () => {
        notifyListening(true);
      };

      recognition.onresult = (event: any) => {
        if (event.results && event.results[0] && event.results[0][0]) {
          const text = event.results[0][0].transcript;
          if (text) {
            onTranscript(text);
          }
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
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
  }, [locale, onTranscript]);

  const toggleListening = () => {
    if (!recognitionRef.current || disabled) return;

    if (isListening) {
      recognitionRef.current.stop();
      notifyListening(false);
    } else {
      try {
        recognitionRef.current.lang = BCP47_LOCALE_MAP[locale] || 'en-IN';
        recognitionRef.current.start();
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
    <button
      type="button"
      onClick={toggleListening}
      disabled={disabled}
      aria-label={isListening ? 'Stop listening' : 'Start voice input in your language'}
      title={isListening ? 'Stop listening' : 'Tap to speak'}
      className={`touch-target relative p-2.5 rounded-full transition-all flex items-center justify-center cursor-pointer ${
        isListening
          ? 'bg-rose-600 text-white shadow-md animate-pulse ring-4 ring-rose-200'
          : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
    </button>
  );
}
