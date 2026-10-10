'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Loader2 } from 'lucide-react';

interface SpeakButtonProps {
  text: string;
  locale: string;
}

const BCP47_LOCALE_MAP: Record<string, string> = {
  ta: 'ta-IN',
  hi: 'hi-IN',
  te: 'te-IN',
  kn: 'kn-IN',
  ml: 'ml-IN',
  en: 'en-IN'
};

export function SpeakButton({ text, locale }: SpeakButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setIsSupported(false);
      return;
    }
  }, []);

  const handleToggleSpeak = () => {
    if (!('speechSynthesis' in window)) return;

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    window.speechSynthesis.cancel(); // Stop any ongoing speech

    // Clean markdown asterisks and URLs for cleaner spoken audio
    const cleanText = text
      .replace(/[*_#`]/g, '')
      .replace(/https?:\/\/\S+/g, '')
      .replace(/•/g, ',')
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = BCP47_LOCALE_MAP[locale] || 'en-IN';
    utterance.rate = 0.95; // Slightly slower, clear cadence for rural farmers

    // Pick matching voice if available
    const voices = window.speechSynthesis.getVoices();
    const targetLang = BCP47_LOCALE_MAP[locale] || 'en-IN';
    const matchingVoice = voices.find(v => v.lang.startsWith(targetLang.split('-')[0]));
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    utterance.onstart = () => {
      setIsPlaying(true);
    };

    utterance.onend = () => {
      setIsPlaying(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  if (!isSupported) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={handleToggleSpeak}
      aria-label={isPlaying ? 'Stop read-aloud' : 'Read aloud in your language'}
      title={isPlaying ? 'Stop read-aloud' : 'Listen to advisory'}
      className={`touch-target inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
        isPlaying
          ? 'bg-emerald-700 text-white shadow-xs animate-pulse'
          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
      }`}
    >
      {isPlaying ? (
        <>
          <VolumeX className="w-3.5 h-3.5" />
          <span>Stop</span>
        </>
      ) : (
        <>
          <Volume2 className="w-3.5 h-3.5 text-emerald-700" />
          <span>Read Aloud</span>
        </>
      )}
    </button>
  );
}
