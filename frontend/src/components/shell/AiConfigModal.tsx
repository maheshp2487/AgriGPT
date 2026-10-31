'use client';

import React, { useState, useEffect } from 'react';
import { X, Cpu, Key, ShieldCheck, Check, Sparkles, Globe2, Radio, Server, CheckCircle2 } from 'lucide-react';

interface AiConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export type AiProvider = 'icar-local' | 'bhashini' | 'groq' | 'gemini';

export interface AiConfigSettings {
  activeProvider: AiProvider;
  bhashiniUserId?: string;
  bhashiniApiKey?: string;
  bhashiniPipelineId?: string;
  groqApiKey?: string;
  geminiApiKey?: string;
}

const STORAGE_KEY = 'agri_ai_config';

export function getStoredAiConfig(): AiConfigSettings {
  if (typeof window === 'undefined') {
    return { activeProvider: 'icar-local' };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return { activeProvider: 'icar-local' };
}

export function saveStoredAiConfig(cfg: AiConfigSettings) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
  } catch {
    // ignore
  }
}

export function AiConfigModal({ isOpen, onClose }: AiConfigModalProps) {
  const [provider, setProvider] = useState<AiProvider>('icar-local');
  const [bhashiniUserId, setBhashiniUserId] = useState('');
  const [bhashiniApiKey, setBhashiniApiKey] = useState('');
  const [bhashiniPipelineId, setBhashiniPipelineId] = useState('');
  const [groqApiKey, setGroqApiKey] = useState('');
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const stored = getStoredAiConfig();
      setProvider(stored.activeProvider || 'icar-local');
      setBhashiniUserId(stored.bhashiniUserId || '');
      setBhashiniApiKey(stored.bhashiniApiKey || '');
      setBhashiniPipelineId(stored.bhashiniPipelineId || '');
      setGroqApiKey(stored.groqApiKey || '');
      setGeminiApiKey(stored.geminiApiKey || '');
      setSavedSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newConfig: AiConfigSettings = {
      activeProvider: provider,
      bhashiniUserId,
      bhashiniApiKey,
      bhashiniPipelineId,
      groqApiKey,
      geminiApiKey,
    };
    saveStoredAiConfig(newConfig);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1b4332] via-[#2d6a4f] to-[#1b4332] p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shadow-xs">
              <Cpu className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold tracking-tight">
                AI Engine & Model Configuration
              </h3>
              <p className="text-xs text-emerald-200">
                Switch seamlessly between ICAR RAG, Bhashini ULCA, Groq, or Gemini
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSave} className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs sm:text-sm">
          <div>
            <label className="font-bold text-slate-900 block mb-2.5 text-xs uppercase tracking-wider">
              Active Intelligence Provider:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option 1: Built-In ICAR Grounded Engine */}
              <div
                onClick={() => setProvider('icar-local')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  provider === 'icar-local'
                    ? 'border-[#2e7d32] bg-[#edf7ed] ring-2 ring-[#c8e6c9]'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5 text-xs sm:text-sm">
                    🌾 ICAR Agronomic Engine
                  </span>
                  {provider === 'icar-local' && <Check className="w-4 h-4 text-[#2e7d32]" />}
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Default production engine. Zero configuration required. Grounded on official ICAR & SAU Package of Practices with CIBRC safety filters.
                </p>
              </div>

              {/* Option 2: Bhashini NLTM (MeitY) */}
              <div
                onClick={() => setProvider('bhashini')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  provider === 'bhashini'
                    ? 'border-[#2e7d32] bg-[#edf7ed] ring-2 ring-[#c8e6c9]'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5 text-xs sm:text-sm">
                    🇮🇳 Bhashini (MeitY ULCA)
                  </span>
                  {provider === 'bhashini' && <Check className="w-4 h-4 text-[#2e7d32]" />}
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Government of India National Language Translation Mission. Native ASR, NMT, and TTS models for Indian languages.
                </p>
              </div>

              {/* Option 3: Groq LLaMA 3.3 70B */}
              <div
                onClick={() => setProvider('groq')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  provider === 'groq'
                    ? 'border-[#2e7d32] bg-[#edf7ed] ring-2 ring-[#c8e6c9]'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5 text-xs sm:text-sm">
                    ⚡ Groq (LLaMA 3.3 70B)
                  </span>
                  {provider === 'groq' && <Check className="w-4 h-4 text-[#2e7d32]" />}
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Ultra-fast sub-second LPU inference. Streams responses at 500+ tokens/second for real-time field conversation.
                </p>
              </div>

              {/* Option 4: Google Gemini 1.5 Flash */}
              <div
                onClick={() => setProvider('gemini')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  provider === 'gemini'
                    ? 'border-[#2e7d32] bg-[#edf7ed] ring-2 ring-[#c8e6c9]'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5 text-xs sm:text-sm">
                    ✨ Google Gemini 1.5
                  </span>
                  {provider === 'gemini' && <Check className="w-4 h-4 text-[#2e7d32]" />}
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Multimodal reasoning supporting visual leaf pest diagnosis and native Indic language understanding.
                </p>
              </div>
            </div>
          </div>

          {/* Conditional Credentials Input */}
          {provider === 'bhashini' && (
            <div className="bg-[#edf7ed] border border-[#c8e6c9] rounded-2xl p-4 space-y-3">
              <span className="font-bold text-emerald-950 block text-xs">
                Enter your Bhashini ULCA API Credentials:
              </span>
              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">User ID</label>
                <input
                  type="text"
                  value={bhashiniUserId}
                  onChange={(e) => setBhashiniUserId(e.target.value)}
                  placeholder="e.g. bhashini_user_id"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-[#2e7d32]"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">API Key</label>
                <input
                  type="password"
                  value={bhashiniApiKey}
                  onChange={(e) => setBhashiniApiKey(e.target.value)}
                  placeholder="e.g. ulca_api_key_xxx"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-[#2e7d32]"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">Pipeline ID (Optional)</label>
                <input
                  type="text"
                  value={bhashiniPipelineId}
                  onChange={(e) => setBhashiniPipelineId(e.target.value)}
                  placeholder="Default: Standard Indic Translation Pipeline"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-[#2e7d32]"
                />
              </div>
            </div>
          )}

          {provider === 'groq' && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-2">
              <label className="font-bold text-amber-950 block text-xs">
                Enter Groq API Key (gsk_...):
              </label>
              <input
                type="password"
                value={groqApiKey}
                onChange={(e) => setGroqApiKey(e.target.value)}
                placeholder="gsk_xxxxxxxxxxxxxxxxxxxx"
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-[#2e7d32]"
              />
              <p className="text-[11px] text-slate-500">
                Free API key available at{' '}
                <a href="https://console.groq.com" target="_blank" rel="noreferrer" className="text-[#2e7d32] underline font-semibold">
                  console.groq.com
                </a>
              </p>
            </div>
          )}

          {provider === 'gemini' && (
            <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 space-y-2">
              <label className="font-bold text-sky-950 block text-xs">
                Enter Google Gemini API Key:
              </label>
              <input
                type="password"
                value={geminiApiKey}
                onChange={(e) => setGeminiApiKey(e.target.value)}
                placeholder="AIzaSyxxxxxxxxxxxxxxxxx"
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-[#2e7d32]"
              />
              <p className="text-[11px] text-slate-500">
                Get a free API key from{' '}
                <a href="https://aistudio.google.com" target="_blank" rel="noreferrer" className="text-[#2e7d32] underline font-semibold">
                  Google AI Studio
                </a>
              </p>
            </div>
          )}

          {/* Modal Footer */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <span className="text-[11px] text-slate-500 font-medium">
              {savedSuccess ? '✓ Settings saved successfully!' : 'Default is zero-config ICAR engine'}
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-[#2e7d32] hover:bg-[#1b5e20] text-white px-5 py-2 rounded-xl text-xs font-bold transition-colors shadow-xs"
              >
                Save Settings
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

