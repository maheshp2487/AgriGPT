'use client';

import React, { useState } from 'react';
import { X, Layers, Cpu, Database, CheckCircle2, ArrowRight, ShieldCheck, ExternalLink, Zap, Sprout, Activity } from 'lucide-react';

interface ArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ArchitectureModal({ isOpen, onClose }: ArchitectureModalProps) {
  const [activeTab, setActiveTab] = useState<'diagram' | 'sources' | 'mission'>('diagram');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#1b4332] via-[#2d6a4f] to-[#1b4332] p-5 sm:p-6 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shadow-xs">
              <Layers className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-xl font-bold tracking-tight">
                  AgriGPT System Architecture & Blueprint
                </h3>
                <span className="bg-emerald-800 text-emerald-100 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-600">
                  v2.0 Production
                </span>
              </div>
              <p className="text-xs text-emerald-200 mt-0.5">
                End-to-End Multilingual AI Platform for 14 Crore Indian Farmers • Grounded in ICAR & AGMARKNET
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

        {/* Tab Switcher */}
        <div className="bg-slate-100 border-b border-slate-200 px-6 py-2.5 flex flex-wrap gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('diagram')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              activeTab === 'diagram'
                ? 'bg-[#2e7d32] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            1. 3-Tier System Architecture
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('sources')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              activeTab === 'sources'
                ? 'bg-[#2e7d32] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            2. Sovereign Data Grounding (ICAR & AGMARKNET)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('mission')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              activeTab === 'mission'
                ? 'bg-[#2e7d32] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            3. National Mission & FPO Impact
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-xs sm:text-sm">
          {activeTab === 'diagram' && (
            <div className="space-y-4">
              {/* Layer 1: Client Experience */}
              <div className="border border-[#c8e6c9] bg-[#edf7ed]/50 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#2e7d32] bg-[#edf7ed] px-2.5 py-0.5 rounded-md border border-[#c8e6c9]">
                    Layer 1: Multilingual Farmer Experience (Frontend)
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500">Next.js 16 • React 19 • PWA</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                    <strong className="block text-slate-900 mb-1">🎤 Vernacular Voice (STT)</strong>
                    <p className="text-slate-600 leading-relaxed">
                      Web Speech API with BCP-47 tags across 9 Indian languages (ta-IN, hi-IN, te-IN, kn-IN, ml-IN, pa-IN, mr-IN, bn-IN, en-IN).
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                    <strong className="block text-slate-900 mb-1">🔊 Read-Aloud Voice (TTS)</strong>
                    <p className="text-slate-600 leading-relaxed">
                      Server-side streaming audio proxy (`/api/tts`) with rate-limiting and browser synthesis fallback.
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                    <strong className="block text-slate-900 mb-1">👨‍🌾 Animated SVG Farmer Avatar</strong>
                    <p className="text-slate-600 leading-relaxed">
                      Pure SVG Kisan Mitra with synchronous mouth movement, periodic eye blinks, and Krishi Officer toggle.
                    </p>
                  </div>
                </div>
              </div>

              {/* Layer 2: AI Core & Statutory Safety Gateway */}
              <div className="border border-amber-200 bg-amber-50/50 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-md border border-amber-200">
                    Layer 2: Agronomic AI Core & Safety Gateway (FastAPI BFF)
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500">FastAPI • ChromaDB • Python 3.11</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                    <strong className="block text-slate-900 mb-1">🛡️ CIBRC Chemical Guardrail</strong>
                    <p className="text-slate-600 leading-relaxed">
                      Statutory audit of 342 registered agrochemicals. Refuses banned substances (e.g. Endosulfan, Monocrotophos) per Gazette of India.
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                    <strong className="block text-slate-900 mb-1">🔒 Anti-Hallucination Policy</strong>
                    <p className="text-slate-600 leading-relaxed">
                      Fail-closed verification: If no authoritative ICAR chunk matches the query, AgriGPT refuses to fabricate answers and directs to KVK.
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                    <strong className="block text-slate-900 mb-1">📜 DPDP Act 2023 Compliance</strong>
                    <p className="text-slate-600 leading-relaxed">
                      Zero personally identifiable information logged. Ephermal in-memory sessions with explicit purpose limitation.
                    </p>
                  </div>
                </div>
              </div>

              {/* Layer 3: Sovereign Data & Real-Time Open APIs */}
              <div className="border border-sky-200 bg-sky-50/50 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-sky-900 bg-sky-100 px-2.5 py-0.5 rounded-md border border-sky-200">
                    Layer 3: Sovereign Government Data & Real-Time APIs
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500">Live OGD • agmarknet.gov.in</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                    <strong className="block text-slate-900 mb-1">🌾 AGMARKNET Mandi OGD</strong>
                    <p className="text-slate-600 leading-relaxed">
                      Live daily APMC modal, min, and max wholesale prices from 2,400+ markets across India.
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                    <strong className="block text-slate-900 mb-1">🌦️ Open-Meteo NWP Forecast</strong>
                    <p className="text-slate-600 leading-relaxed">
                      Numerical weather prediction with wet bulb, Delta T, and 24h safe pesticide spraying windows.
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                    <strong className="block text-slate-900 mb-1">🏛️ API Setu & PM-KISAN</strong>
                    <p className="text-slate-600 leading-relaxed">
                      Procedural guide and sandbox verification for PM-KISAN DBT installments and PMFBY 72h crop insurance loss claims.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sources' && (
            <div className="space-y-4">
              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🌾</span>
                    <h4 className="font-bold text-slate-900">AGMARKNET Open Government Data (OGD)</h4>
                  </div>
                  <a
                    href="https://agmarknet.gov.in"
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-bold text-[#2e7d32] hover:underline flex items-center gap-1"
                  >
                    <span>agmarknet.gov.in</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Real-time wholesale prices provided under the Government Open Data License (GODL India). AgriGPT strictly never synthesizes or hallucinates mandi rates. If upstream AGMARKNET reports are delayed, the system displays a clear timestamped notice.
                </p>
              </div>

              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🏛️</span>
                    <h4 className="font-bold text-slate-900">ICAR & SAU Package of Practices (PoP)</h4>
                  </div>
                  <a
                    href="https://krishi.icar.gov.in"
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-bold text-[#2e7d32] hover:underline flex items-center gap-1"
                  >
                    <span>krishi.icar.gov.in</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Indian Council of Agricultural Research (ICAR) verified database of Package of Practices. AgriGPT pulls authoritative crop varieties (ADT-53, CO-51, TMV-13, Vamban-8), sowing depths, organic biofungicides, and ETL pest management thresholds.
                </p>
              </div>

              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🌦️</span>
                    <h4 className="font-bold text-slate-900">Open-Meteo & IMD Agromet Weather</h4>
                  </div>
                  <a
                    href="https://open-meteo.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-bold text-[#2e7d32] hover:underline flex items-center gap-1"
                  >
                    <span>open-meteo.com</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Hyperlocal hourly weather forecasts calculated for precise farm coordinates. Includes Delta T agrochemical spraying index (Delta T 2-8°C optimal) to maximize droplet retention and prevent droplet evaporation or drift.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'mission' && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-amber-50 to-emerald-50 border border-amber-200 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-amber-900 font-bold">
                  <Zap className="w-5 h-5 text-amber-600" />
                  <span>How AgriGPT Transforms Indian Agriculture</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  AgriGPT bridges the digital divide for smallholder and marginal farmers by transforming complex gazettes, research bulletins, and commodity markets into actionable voice intelligence.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs mt-3">
                  <div className="bg-white p-3 rounded-xl border border-amber-200 space-y-1">
                    <strong className="block text-slate-900">1. FPO Collective Bargaining</strong>
                    <p className="text-slate-600 leading-relaxed">
                      Empowers Farmer Producer Organizations (FPOs) with multi-mandi arbitrage comparisons and transport cost modeling.
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-amber-200 space-y-1">
                    <strong className="block text-slate-900">2. Real-Time Price Discovery</strong>
                    <p className="text-slate-600 leading-relaxed">
                      Removes exploitative middlemen by showing daily AGMARKNET modal rates and market arrival trends.
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-amber-200 space-y-1">
                    <strong className="block text-slate-900">3. Crop Loss 72h Escalation</strong>
                    <p className="text-slate-600 leading-relaxed">
                      Guides farmers to file localized PMFBY insurance claims within the strict 72-hour statutory window.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 px-6 flex justify-between items-center shrink-0">
          <span className="text-xs text-slate-500 font-medium">
            AgriGPT National Agricultural Intelligence Platform • <em>हर किसान का सच्चा डिजिटल साथी</em>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="bg-[#2e7d32] hover:bg-[#1b5e20] text-white px-5 py-2 rounded-xl text-xs font-bold transition-colors shadow-xs"
          >
            Close Blueprint
          </button>
        </div>
      </div>
    </div>
  );
}

