'use client';

import React from 'react';
import { X, ShieldCheck, FileText, Lock, Sprout, ExternalLink, CheckCircle2, AlertTriangle, PhoneCall } from 'lucide-react';

export type LegalTab = 'about' | 'terms' | 'privacy';

interface LegalModalProps {
  isOpen: boolean;
  activeTab: LegalTab;
  onClose: () => void;
  onTabChange: (tab: LegalTab) => void;
}

export function LegalModal({ isOpen, activeTab, onClose, onTabChange }: LegalModalProps) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 sm:px-8 py-5 border-b border-slate-200/80 bg-gradient-to-r from-[#f0f9f1] via-white to-white flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2e7d32] text-white flex items-center justify-center shadow-xs shrink-0">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <h2 id="legal-modal-title" className="text-lg font-bold text-slate-900 tracking-tight">
                AgriGPT Information & Governance
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                National Agricultural Intelligence Platform • Open Farmer Portal
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 sm:px-8 pt-3 pb-2 border-b border-slate-100 bg-slate-50/70 flex gap-2 shrink-0 overflow-x-auto">
          <button
            onClick={() => onTabChange('about')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'about'
                ? 'bg-white text-[#2e7d32] shadow-xs border border-[#c8e6c9]'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Sprout className="w-4 h-4 text-[#2e7d32]" />
            <span>About AgriGPT</span>
          </button>
          <button
            onClick={() => onTabChange('terms')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'terms'
                ? 'bg-white text-[#2e7d32] shadow-xs border border-[#c8e6c9]'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <FileText className="w-4 h-4 text-[#2e7d32]" />
            <span>Terms of Service</span>
          </button>
          <button
            onClick={() => onTabChange('privacy')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'privacy'
                ? 'bg-white text-[#2e7d32] shadow-xs border border-[#c8e6c9]'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Lock className="w-4 h-4 text-[#2e7d32]" />
            <span>Privacy Policy (DPDP Act)</span>
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-slate-700 text-xs sm:text-sm leading-relaxed">
          {activeTab === 'about' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-[#edf7ed] border border-[#c8e6c9] flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-[#2e7d32] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-900 text-sm">Empowering 140+ Million Indian Farmers</h4>
                  <p className="text-xs text-slate-600 leading-normal">
                    AgriGPT is a digital public good engineered to bridge the agricultural extension gap in India. It delivers hyper-localized, verified agronomy in native languages without commercial bias.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-base font-bold text-slate-900">1. Core Agronomic Foundations</h3>
                <p>
                  Every diagnostic recommendation and crop advisory generated by AgriGPT is strictly grounded in official <strong>Package of Practices (PoP)</strong> published by the <strong>Indian Council of Agricultural Research (ICAR)</strong>, Central Research Institutes (e.g., CRRI, CRIDA, IIHR), and State Agricultural Universities (SAUs) across all 15 agro-climatic zones of India.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-base font-bold text-slate-900">2. Safety-First Architecture & CIBRC Compliance</h3>
                <p>
                  AgriGPT implements a deterministic safety filter against statutory gazettes issued by the <strong>Central Insecticides Board & Registration Committee (CIBRC)</strong>. Any query regarding restricted or banned agrochemicals (including Endosulfan, Monocrotophos on vegetables, or Diazinon) triggers a mandatory statutory refusal, and provides safe, approved bio-pesticide or organic alternatives.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-base font-bold text-slate-900">3. Real-Time Government Data Feeds</h3>
                <ul className="space-y-2 list-disc list-inside text-slate-600">
                  <li><strong>AGMARKNET (agmarknet.gov.in)</strong>: Live daily wholesale modal prices across 2,400+ APMC mandis in 28 states.</li>
                  <li><strong>Agromet Advisory Services</strong>: Hourly temperature, humidity, wind velocity, and rainfall forecasts optimized for Delta T pesticide spraying windows.</li>
                  <li><strong>PM-KISAN & PMFBY</strong>: Crop insurance 72-hour localized disaster loss reporting support and government scheme eligibility checks.</li>
                  <li><strong>Soil Health Card Portal</strong>: 12-parameter soil fertility analysis and NPK fertilizer dosage balancing.</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="text-base font-bold text-slate-900">4. Vernacular Multilingual Inclusivity</h3>
                <p>
                  Recognizing that over 80% of smallholder farmers prefer regional communication, AgriGPT is engineered natively for 6 languages: <strong>English, தமிழ் (Tamil), हिंदी (Hindi), తెలుగు (Telugu), ಕನ್ನಡ (Kannada), and മലയാളം (Malayalam)</strong>, complete with vernacular speech-to-text and text-to-speech engines.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'terms' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold text-amber-950 text-sm">Important Advisory Disclaimer</h4>
                  <p className="text-xs text-amber-900 leading-normal">
                    AgriGPT is a decision-support intelligence platform. Field conditions, soil chemistry, and microclimates vary. Always verify chemical dosages with local Krishi Vigyan Kendra (KVK) extension officers and official CIBRC label claims.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-base font-bold text-slate-900">1. Acceptance of Terms</h3>
                <p>
                  By accessing or utilizing AgriGPT ("the Platform"), you agree to be bound by these Terms of Service. The service is provided freely for agricultural producers, farmer producer organizations (FPOs), agronomists, and extension workers across India.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-base font-bold text-slate-900">2. Advisory Nature of Agricultural Recommendations</h3>
                <p>
                  The diagnostics, weather interpretations, spray timings, and mandi price statistics provided by AgriGPT are generated using machine learning models and verified public agronomic databases. The Platform does not warrant that recommendations will yield identical outcomes across all micro-environments. Users assume full responsibility for farm management decisions.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-base font-bold text-slate-900">3. Statutory Chemical & Spray Safety Protocols</h3>
                <p>
                  Whenever chemical pesticides or fungicides are discussed, farmers must strictly observe the statutory <strong>Pre-Harvest Interval (PHI)</strong> and wear recommended personal protective equipment (PPE). AgriGPT strictly refuses to advise on substances prohibited under the Insecticides Act, 1968.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-base font-bold text-slate-900">4. Third-Party Data Attributions</h3>
                <p>
                  Mandi price feeds are published under the Government Open Data License (GODL India) via AGMARKNET and Open Government Data (data.gov.in). Weather forecasts are powered by meteorological radar and Agromet models. Actual market transactions and localized spot weather are determined by on-ground conditions.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-base font-bold text-slate-900">5. Limitation of Liability</h3>
                <p>
                  In no event shall AgriGPT, its contributors, researchers, or hosting partners be held liable for crop yield variance, adverse weather impacts, market price fluctuations, or agricultural financial outcomes resulting from platform usage.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-[#edf7ed] border border-[#c8e6c9] flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-[#2e7d32] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-900 text-sm">Digital Personal Data Protection (DPDP) Act 2023 Compliant</h4>
                  <p className="text-xs text-slate-600 leading-normal">
                    AgriGPT adheres strictly to statutory data fiduciary responsibilities enacted under the DPDP Act 2023, Republic of India. We uphold data minimization, purpose limitation, and absolute farmer consent.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-base font-bold text-slate-900">1. Data Fiduciary Identity & Collection Notice</h3>
                <p>
                  Under Section 5 of the DPDP Act 2023, AgriGPT processes minimal personal data exclusively for delivering localized farming intelligence:
                </p>
                <ul className="space-y-1.5 list-disc list-inside text-slate-600 pl-2">
                  <li><strong>Mobile Phone Number or Email</strong>: Used solely for secure OTP authentication and account recovery.</li>
                  <li><strong>Approximate District/State Location</strong>: Used to fetch relevant APMC mandi rates and local Agromet weather.</li>
                  <li><strong>Farm Profile (Optional)</strong>: Land size and primary crops grown, used to contextualize agronomy advisories.</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="text-base font-bold text-slate-900">2. Zero Non-Consensual Data Commercialization</h3>
                <p>
                  AgriGPT does not sell, trade, or monetize farmer data. We do not distribute farmer contact numbers or landholdings to aggressive third-party marketing companies, pesticide distributors, or unregulated financial brokers.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-base font-bold text-slate-900">3. Farmer Statutory Rights</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <h5 className="font-bold text-slate-900 text-xs">Section 11: Right to Access & Portability</h5>
                    <p className="text-[11px] text-slate-600 mt-1">
                      Download your entire farm profile and interaction history in structured JSON format via your profile drawer anytime.
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <h5 className="font-bold text-slate-900 text-xs">Section 12: Right to Erasure & Deletion</h5>
                    <p className="text-[11px] text-slate-600 mt-1">
                      Withdraw consent and permanently purge your phone records, farm parameters, and conversation history with 1-click.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-base font-bold text-slate-900">4. Data Retention Policy</h3>
                <p>
                  Guest interactions without account login are ephemerally held in temporary browser memory and pruned after 30 days of inactivity. Registered profiles are maintained until explicit consent withdrawal or account deletion.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-base font-bold text-slate-900">5. Grievance Redressal & Data Protection Officer</h3>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
                  <p><strong>Designated Officer:</strong> Data Protection Officer (DPO) & Grievance Redressal Officer</p>
                  <p><strong>Entity:</strong> AgriGPT Platform, Republic of India</p>
                  <p><strong>Grievance Email:</strong> <span className="font-mono text-[#2e7d32]">grievance@agrigpt.in</span></p>
                  <p><strong>Statutory Resolution Timeline:</strong> Within 30 calendar days as mandated by DPDP Act guidelines.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 sm:px-8 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-4 shrink-0">
          <div className="text-[11px] text-slate-500 hidden sm:block">
            Last updated: October 2026 • Grounded in Indian Law & ICAR Guidelines
          </div>
          <button
            onClick={onClose}
            className="touch-target px-5 py-2.5 rounded-xl bg-[#2e7d32] hover:bg-[#1b5e20] text-white font-bold text-xs sm:text-sm ml-auto shadow-xs transition-colors"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
}
