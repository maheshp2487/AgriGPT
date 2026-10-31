'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Loader2 } from 'lucide-react';

interface SpeakButtonProps {
  text: string;
  locale: string;
  onPlayingChange?: (isPlaying: boolean) => void;
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

const TTS_LANG_MAP: Record<string, string> = {
  ta: 'ta',
  hi: 'hi',
  te: 'te',
  kn: 'kn',
  ml: 'ml',
  pa: 'pa',
  mr: 'mr',
  bn: 'bn',
  en: 'en',
};

export function SpeakButton({ text, locale, onPlayingChange }: SpeakButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const notifyPlaying = (playing: boolean) => {
    setIsPlaying(playing);
    onPlayingChange?.(playing);
  };

  const stopAllAudio = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    notifyPlaying(false);
    setIsLoading(false);
  };

  const handleToggleSpeak = async () => {
    if (isPlaying || isLoading) {
      stopAllAudio();
      return;
    }

    stopAllAudio();

    // Clean markdown asterisks and URLs for cleaner spoken audio
    const cleanText = text
      .replace(/[*_#`~]/g, '')
      .replace(/https?:\/\/\S+/g, '')
      .replace(/[•●■]/g, ', ')
      .trim();

    if (!cleanText) return;

    const shortSnippet = cleanText.slice(0, 180);
    const langCode = TTS_LANG_MAP[locale] || 'en';

    // Strategy 1: Attempt native SpeechSynthesis if available
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const voices = window.speechSynthesis.getVoices();
      const targetPrefix = BCP47_LOCALE_MAP[locale]?.split('-')[0] || 'en';
      const hasNativeVoice = voices.some((v) => v.lang.startsWith(targetPrefix));

      if (hasNativeVoice) {
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = BCP47_LOCALE_MAP[locale] || 'en-IN';
        utterance.rate = 0.95;
        const matchingVoice = voices.find((v) => v.lang.startsWith(targetPrefix));
        if (matchingVoice) utterance.voice = matchingVoice;

        utterance.onstart = () => notifyPlaying(true);
        utterance.onend = () => notifyPlaying(false);
        utterance.onerror = () => notifyPlaying(false);

        window.speechSynthesis.speak(utterance);
        return;
      }
    }

    // Strategy 2: High-definition Server-side TTS Audio Proxy (/api/tts)
    setIsLoading(true);
    try {
      const audioUrl = `/api/tts?q=${encodeURIComponent(shortSnippet)}&tl=${encodeURIComponent(langCode)}`;
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onplay = () => {
        setIsLoading(false);
        notifyPlaying(true);
      };
      audio.onended = () => {
        notifyPlaying(false);
      };
      audio.onerror = () => {
        setIsLoading(false);
        notifyPlaying(false);
      };

      await audio.play();
    } catch {
      setIsLoading(false);
      notifyPlaying(false);
    }
  };

  useEffect(() => {
    return () => {
      stopAllAudio();
    };
  }, []);

  return (
    <button
      type="button"
      onClick={handleToggleSpeak}
      aria-label={isPlaying ? 'Stop read-aloud' : 'Read aloud in your language'}
      title={isPlaying ? 'Stop read-aloud' : 'Listen to advisory'}
      className={`touch-target inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
        isPlaying
          ? 'bg-emerald-700 text-white shadow-xs animate-pulse'
          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
      }`}
    >
      {isLoading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : isPlaying ? (
        <VolumeX className="w-3.5 h-3.5 text-white" />
      ) : (
        <Volume2 className="w-3.5 h-3.5 text-emerald-700" />
      )}
      <span>{isLoading ? 'Loading...' : isPlaying ? 'Stop' : 'Listen'}</span>
    </button>
  );
}
