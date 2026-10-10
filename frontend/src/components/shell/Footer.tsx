'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import {
  Sprout,
  Phone,
  ShieldCheck,
  FileText,
  Lock,
  Info,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { LegalModal, LegalTab } from './LegalModal';

interface FooterProps {
  onNavigateTab?: (tabId: string) => void;
}

export function Footer({ onNavigateTab }: FooterProps) {
  const { t } = useLanguage();
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [legalActiveTab, setLegalActiveTab] = useState<LegalTab>('about');

  const openLegal = (tab: LegalTab) => {
    setLegalActiveTab(tab);
    setLegalModalOpen(true);
  };

  const handleModuleClick = (tabId: string) => {
    if (onNavigateTab) {
      onNavigateTab(tabId);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <>
      <footer className="w-full bg-gradient-to-b from-[#edf7ed] via-[#f7fbf8] to-[#edf7ed] text-slate-700 border-t-2 border-[#c8e6c9] text-xs mt-12 pb-24 md:pb-8 shadow-xs">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6">
          {/* Top Row: Brand Identity & Compact Helpline Pills */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 pb-6 border-b border-slate-200/90">
            {/* Brand Logo & Concise Mission Tagline */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#2e7d32] text-white flex items-center justify-center shrink-0 shadow-xs">
                <Sprout className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-extrabold text-slate-900 tracking-tight">AgriGPT</span>
                  <span className="text-[10px] font-bold text-[#2e7d32] bg-white px-2 py-0.5 rounded-full border border-[#c8e6c9] shadow-2xs">
                    ICAR & AGMARKNET Grounded
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  National Agricultural Intelligence Platform for Indian Farmers
                </p>
              </div>
            </div>

            {/* Compact Toll-Free Helpline Pills */}
            <div className="flex flex-wrap items-center gap-2.5">
              <a
                href="tel:18001801551"
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-[#c8e6c9] text-slate-800 flex items-center gap-2 transition-colors text-xs font-semibold shadow-2xs"
                title="Kisan Call Centre (22 Indian Languages)"
              >
                <Phone className="w-3.5 h-3.5 text-[#2e7d32] shrink-0" />
                <span>Kisan Helpline: <strong className="text-[#2e7d32] font-mono font-bold">1800-180-1551</strong></span>
              </a>

              <a
                href="tel:14447"
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-[#c8e6c9] text-slate-800 flex items-center gap-2 transition-colors text-xs font-semibold shadow-2xs"
                title="PMFBY 72h Crop Loss Reporting"
              >
                <Phone className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>PMFBY 72h: <strong className="text-amber-800 font-mono font-bold">14447</strong></span>
              </a>
            </div>
          </div>

          {/* Middle Row: Agricultural Modules & Legal / Trust Links */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
            {/* Quick Module Shortcuts (No "AI" word) */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-slate-600 font-semibold">
              <button
                type="button"
                onClick={() => handleModuleClick('chat')}
                className="hover:text-[#2e7d32] transition-colors"
              >
                Farm Advisor
              </button>
              <span className="text-slate-300">•</span>
              <button
                type="button"
                onClick={() => handleModuleClick('doctor')}
                className="hover:text-[#2e7d32] transition-colors"
              >
                Crop Doctor
              </button>
              <span className="text-slate-300">•</span>
              <button
                type="button"
                onClick={() => handleModuleClick('mandi')}
                className="hover:text-[#2e7d32] transition-colors"
              >
                Mandi Rates
              </button>
              <span className="text-slate-300">•</span>
              <button
                type="button"
                onClick={() => handleModuleClick('weather')}
                className="hover:text-[#2e7d32] transition-colors"
              >
                Weather & Spray
              </button>
              <span className="text-slate-300">•</span>
              <button
                type="button"
                onClick={() => handleModuleClick('schemes')}
                className="hover:text-[#2e7d32] transition-colors"
              >
                Govt Schemes
              </button>
            </div>

            {/* Legal & Governance Modals */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-slate-700 font-bold">
              <button
                type="button"
                onClick={() => openLegal('about')}
                className="hover:text-[#2e7d32] transition-colors"
              >
                About AgriGPT
              </button>
              <span className="text-slate-300">•</span>
              <button
                type="button"
                onClick={() => openLegal('terms')}
                className="hover:text-[#2e7d32] transition-colors"
              >
                Terms of Service
              </button>
              <span className="text-slate-300">•</span>
              <button
                type="button"
                onClick={() => openLegal('privacy')}
                className="hover:text-[#2e7d32] transition-colors"
              >
                Privacy Policy
              </button>
              <span className="text-slate-300">•</span>
              <span className="text-[10px] text-[#2e7d32] bg-white px-2 py-0.5 rounded-full border border-[#c8e6c9] font-bold shadow-2xs">
                DPDP Act 2023
              </span>
            </div>
          </div>

          {/* Bottom Row: Copyright & Disclaimers */}
          <div className="pt-4 border-t border-slate-200/90 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500">
            <div>
              © 2026 AgriGPT Platform • Digital Public Good for Indian Agriculture. All rights reserved.
            </div>
            <div className="flex items-center gap-3 font-medium">
              <span>CIBRC Statutory Safe</span>
              <span>•</span>
              <span>GODL India Licensed</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Comprehensive Legal, About & Privacy Modal */}
      <LegalModal
        isOpen={legalModalOpen}
        activeTab={legalActiveTab}
        onClose={() => setLegalModalOpen(false)}
        onTabChange={(tab) => setLegalActiveTab(tab)}
      />
    </>
  );
}
