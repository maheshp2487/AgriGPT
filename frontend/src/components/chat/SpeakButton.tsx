'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Loader2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface SpeakButtonProps {
  text: string;
  locale: string;
  onPlayingChange?: (isPlaying: boolean) => void;
  variant?: 'pill' | 'compact';
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

const LISTEN_LABELS: Record<string, { listen: string; stop: string }> = {
  ta: { listen: 'ஆடியோ கேட்க', stop: 'நிறுத்த' },
  hi: { listen: 'ऑडियो सुनें', stop: 'रोकें' },
  te: { listen: 'ఆడియో వినండి', stop: 'ఆపండి' },
  kn: { listen: 'ಆಡಿಯೋ ಕೇಳಿ', stop: 'ನಿಲ್ಲಿಸಿ' },
  ml: { listen: 'ശബ്ദം കേൾക്കൂ', stop: 'നിർത്തൂ' },
  pa: { listen: 'ਆਡੀਓ ਸੁਣੋ', stop: 'ਰੋਕੋ' },
  mr: { listen: 'ऑडिओ ऐका', stop: 'थांबवा' },
  bn: { listen: 'অডিও শুনুন', stop: 'বন্ধ করুন' },
  en: { listen: 'Listen Audio', stop: 'Stop Audio' },
};

export function SpeakButton({
  text,
  locale,
  onPlayingChange,
  variant = 'pill',
}: SpeakButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const resumeIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const notifyPlaying = (playing: boolean) => {
    setIsPlaying(playing);
    onPlayingChange?.(playing);
    if (!playing && resumeIntervalRef.current) {
      clearInterval(resumeIntervalRef.current);
      resumeIntervalRef.current = null;
    }
  };

  const stopAudio = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // ignore
      }
    }
    notifyPlaying(false);
    setIsLoading(false);
  };

  useEffect(() => {
    // Pre-warm browser voices table
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      const handleVoices = () => {
        window.speechSynthesis.getVoices();
      };
      window.speechSynthesis.onvoiceschanged = handleVoices;
      return () => {
        window.speechSynthesis.onvoiceschanged = null;
        stopAudio();
      };
    }
  }, []);

  const handleToggleSpeak = () => {
    if (isPlaying || isLoading) {
      stopAudio();
      return;
    }

    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported on this browser.');
      return;
    }

    stopAudio();

    // Clean markdown asterisks, hashes, backticks, bullet characters and URLs for natural speech
    const cleanText = text
      .replace(/[*_#`~]/g, '')
      .replace(/https?:\/\/\S+/g, '')
      .replace(/[•●■▶→]/g, ', ')
      .replace(/\n+/g, '. ')
      .trim();

    if (!cleanText) return;

    try {
      setIsLoading(true);

      const targetBcp47 = BCP47_LOCALE_MAP[locale] || 'en-IN';
      const targetPrefix = targetBcp47.split('-')[0];

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = targetBcp47;
      utterance.rate = 0.92; // Natural advisory pace for farmers
      utterance.pitch = 1.0;

      // Select regional voice if available
      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        const exactVoice = voices.find((v) => v.lang.replace('_', '-').toLowerCase() === targetBcp47.toLowerCase());
        const prefixVoice = voices.find((v) => v.lang.toLowerCase().startsWith(targetPrefix));
        if (exactVoice) {
          utterance.voice = exactVoice;
        } else if (prefixVoice) {
          utterance.voice = prefixVoice;
        }
      }

      utterance.onstart = () => {
        setIsLoading(false);
        notifyPlaying(true);
      };

      utterance.onend = () => {
        notifyPlaying(false);
      };

      utterance.onerror = (e) => {
        // 'interrupted' is normal when user hits stop
        if (e.error !== 'interrupted' && e.error !== 'canceled') {
          console.warn('SpeechSynthesis error:', e.error);
        }
        notifyPlaying(false);
      };

      // Chrome long-speech workaround: Chrome pauses speech after 14 seconds unless resume is called
      if (resumeIntervalRef.current) clearInterval(resumeIntervalRef.current);
      resumeIntervalRef.current = setInterval(() => {
        if (window.speechSynthesis.speaking) {
          window.speechSynthesis.pause();
          window.speechSynthesis.resume();
        } else {
          if (resumeIntervalRef.current) clearInterval(resumeIntervalRef.current);
        }
      }, 10000);

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('Failed to start SpeechSynthesis:', err);
      notifyPlaying(false);
      setIsLoading(false);
    }
  };

  const labels = LISTEN_LABELS[locale] || LISTEN_LABELS.en;

  return (
    <button
      type="button"
      onClick={handleToggleSpeak}
      aria-label={isPlaying ? labels.stop : labels.listen}
      title={isPlaying ? labels.stop : labels.listen}
      className={`touch-target inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer shadow-xs active:scale-95 ${
        isPlaying
          ? 'bg-emerald-700 text-white shadow-emerald-700/20 ring-2 ring-emerald-400/50 animate-pulse'
          : 'bg-[#edf7ed] hover:bg-[#e0f2e1] text-[#2e7d32] border border-[#c8e6c9]'
      }`}
    >
      {isLoading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#2e7d32]" />
      ) : isPlaying ? (
        <div className="flex items-end gap-0.5 h-3">
          <span className="w-0.5 bg-white rounded-full animate-pulse h-2" />
          <span className="w-0.5 bg-white rounded-full animate-pulse h-3" />
          <span className="w-0.5 bg-white rounded-full animate-pulse h-2.5" />
        </div>
      ) : (
        <Volume2 className="w-3.5 h-3.5 text-[#2e7d32]" />
      )}
      <span>{isLoading ? '...' : isPlaying ? labels.stop : labels.listen}</span>
    </button>
  );
}
