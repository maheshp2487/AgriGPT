'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { useLanguage } from '@/context/LanguageContext';
import {
  Sparkles,
  ShieldAlert,
  ExternalLink,
  Loader2,
  Camera,
  ChevronRight,
  TrendingUp,
  CloudSunRain,
  FileText,
  Sprout,
  Droplets,
  Layers,
  ArrowRight
} from 'lucide-react';
import { ChatAssistant } from '@/components/chat/ChatAssistant';
import { LandingPage } from '@/components/landing/LandingPage';

// Optimized dynamic imports for rural low-bandwidth code splitting
const CropDoctorCard = dynamic(
  () => import('@/components/cropdoctor/CropDoctorCard').then((mod) => mod.CropDoctorCard),
  {
    loading: () => (
      <div className="h-28 rounded-3xl bg-emerald-50/50 border border-emerald-100 flex items-center justify-center animate-pulse">
        <Loader2 className="w-5 h-5 text-emerald-600 animate-spin" />
      </div>
    ),
    ssr: false,
  }
);

const MandiExplorer = dynamic(
  () => import('@/components/mandi/MandiExplorer').then((mod) => mod.MandiExplorer),
  {
    loading: () => (
      <div className="h-64 rounded-3xl bg-slate-100 flex items-center justify-center animate-pulse">
        <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
      </div>
    ),
    ssr: false,
  }
);

const WeatherWidget = dynamic(
  () => import('@/components/weather/WeatherWidget').then((mod) => mod.WeatherWidget),
  {
    loading: () => (
      <div className="h-48 rounded-3xl bg-sky-50 flex items-center justify-center animate-pulse">
        <Loader2 className="w-6 h-6 text-sky-400 animate-spin" />
      </div>
    ),
    ssr: false,
  }
);

const SchemeVerificationCard = dynamic(
  () => import('@/components/schemes/SchemeVerificationCard').then((mod) => mod.SchemeVerificationCard),
  {
    loading: () => (
      <div className="h-44 rounded-3xl bg-slate-100 flex items-center justify-center animate-pulse">
        <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
      </div>
    ),
    ssr: false,
  }
);

interface HomeFeedProps {
  activeTab: string;
  onNavigateTab: (tabId: string) => void;
  onOpenNotifications?: () => void;
  initialChatQuery?: string;
  initialChatCrop?: string;
  onClearInitialChatQuery?: () => void;
}

export function HomeFeed({
  activeTab,
  onNavigateTab,
  onOpenNotifications,
  initialChatQuery,
  initialChatCrop,
  onClearInitialChatQuery
}: HomeFeedProps) {
  const { t, locale } = useLanguage();
  const [conversationStarted, setConversationStarted] = useState(false);
  const [isCropDoctorOpen, setIsCropDoctorOpen] = useState(false);

  const handleAskFromLanding = (query: string, crop?: string) => {
    onNavigateTab('chat');
  };

  return (
    <div className="space-y-6 pb-6">
      {/* =========================================================================
          TAB 0: BEAUTIFUL, DEDICATED AGRICULTURAL LANDING PAGE
         ========================================================================= */}
      {(activeTab === 'home' || activeTab === 'landing') && (
        <LandingPage
          onNavigateTab={onNavigateTab}
          onAskQuery={(q, crop) => {
            onNavigateTab('chat');
          }}
          onOpenCropDoctor={() => onNavigateTab('doctor')}
          onOpenNotifications={() => onOpenNotifications?.()}
        />
      )}

      {/* =========================================================================
          TAB 1: CONVERSATIONAL ASSISTANT & ADVISOR FEED
         ========================================================================= */}
      {activeTab === 'chat' && (
        <section aria-labelledby="chat-section-title" className="space-y-4 animate-in fade-in duration-150">
          {/* Context Banner for Chat */}
          {!conversationStarted ? (
            <div className="bg-gradient-to-r from-[#edf7ed] via-[#f7fbf8] to-white text-slate-900 rounded-2xl p-6 sm:p-7 shadow-xs border border-[#c8e6c9] relative overflow-hidden transition-all">
              <div className="relative z-10 space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#c8e6c9] text-[#2e7d32] text-xs font-bold shadow-2xs">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>National Agricultural Advisor • ICAR & AGMARKNET Grounded</span>
                </div>

                <h1 id="chat-section-title" className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight leading-tight text-slate-900">
                  {t('chat.welcomeTitle')}
                </h1>

                <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
                  Ask anything across the agriculture universe: crop best practices, daily mandi prices (<span className="underline font-mono text-[#2e7d32]">agmarknet.gov.in</span>), weather & rainfall outlook, soil nutrient balancing (<span className="underline font-mono text-[#2e7d32]">krishi.icar.gov.in</span>), PMFBY crop insurance, or government welfare schemes.
                </p>
              </div>
            </div>
          ) : (
            /* Slim context chip when conversation is active to prioritize messages */
            <div className="flex items-center justify-between px-4 py-2.5 bg-[#edf7ed]/60 border border-[#c8e6c9] rounded-xl text-xs text-slate-800">
              <div className="flex items-center gap-2 font-semibold text-slate-900">
                <Sparkles className="w-3.5 h-3.5 text-[#2e7d32]" />
                <span>AgriGPT Advisory • Grounded in ICAR (krishi.icar.gov.in) & AGMARKNET</span>
              </div>
              <span className="text-[11px] text-[#2e7d32] font-mono font-semibold bg-white px-2 py-0.5 rounded-md border border-[#c8e6c9]">Active Session</span>
            </div>
          )}

          {/* Dedicated Crop Doctor Launcher Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs flex items-center justify-between gap-3 hover:border-slate-300 transition-colors">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-[#e8f5e9] text-[#1b4332] flex items-center justify-center shrink-0">
                <Camera className="w-5 h-5 text-[#1b4332]" />
              </div>
              <div className="min-w-0">
                <h2 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                  {t('cropdoctor.launcherBanner')}
                </h2>
                <p className="text-[11px] text-slate-500 truncate hidden xs:block">
                  {t('cropdoctor.launcherSubtitle')}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('doctor')}
              className="touch-target px-3.5 py-2 bg-[#1b4332] hover:bg-[#143527] text-white rounded-xl text-xs font-semibold flex items-center gap-1 shrink-0 transition-colors shadow-xs"
              aria-label={t('cropdoctor.openDoctor')}
            >
              <span>{t('cropdoctor.openDoctor')}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Live Streaming Conversational Component */}
          <ChatAssistant
            onConversationStart={() => setConversationStarted(true)}
            initialQuery={initialChatQuery}
            initialCrop={initialChatCrop}
            onNavigateTab={onNavigateTab}
          />
        </section>
      )}

      {/* =========================================================================
          TAB 2: DEDICATED CROP DOCTOR PHOTO DIAGNOSIS VIEW
         ========================================================================= */}
      {activeTab === 'doctor' && (
        <section aria-label="Crop Doctor Leaf Diagnosis" className="space-y-4 animate-in fade-in duration-150">
          <CropDoctorCard onClose={() => onNavigateTab('chat')} />
        </section>
      )}

      {/* =========================================================================
          TAB 3: MANDI INTELLIGENCE FEED
         ========================================================================= */}
      {activeTab === 'mandi' && (
        <section aria-labelledby="mandi-section-title" className="space-y-4 animate-in fade-in duration-150">
          <MandiExplorer />
        </section>
      )}

      {/* =========================================================================
          TAB 4: WEATHER & SPRAYING SUITABILITY
         ========================================================================= */}
      {activeTab === 'weather' && (
        <section aria-labelledby="weather-section-title" className="space-y-4 animate-in fade-in duration-150">
          <WeatherWidget />
        </section>
      )}

      {/* =========================================================================
          TAB 5: GOVERNMENT SCHEMES & INSURANCE
         ========================================================================= */}
      {activeTab === 'schemes' && (
        <section aria-labelledby="schemes-section-title" className="space-y-4 animate-in fade-in duration-150">
          <div>
            <h2 id="schemes-section-title" className="text-lg sm:text-xl font-bold text-slate-900">
              {t('schemes.title')}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">{t('schemes.subtitle')}</p>
          </div>

          {/* API Setu Scheme Eligibility Verification Gateway */}
          <SchemeVerificationCard />

          {/* PMFBY Differentiated Loss Card */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-4 sm:p-5 space-y-4">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                {t('schemes.pmfbyTitle')}
              </h3>
            </div>

            <div className="space-y-3">
              {/* Scenario 1: Localized Calamity */}
              <div className="p-3.5 bg-amber-50/60 border border-amber-200 rounded-2xl space-y-1">
                <div className="text-xs font-bold text-amber-900">
                  {t('schemes.pmfbyLocalizedBadge')}
                </div>
                <p className="text-xs text-amber-800 leading-relaxed">
                  {t('schemes.pmfbyNotice')}
                </p>
                <div className="text-[11px] text-slate-600 font-semibold pt-1">
                  Required: Geotagged damage photo, survey number, bank passbook.
                </div>
              </div>

              {/* Scenario 2: Widespread Perils */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                <div className="text-xs font-bold text-slate-900">
                  {t('schemes.pmfbyAreaBadge')}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {t('schemes.pmfbyAreaNotice')}
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
              <span className="text-[11px]">{t('schemes.disclaimer')}</span>
              <a
                href="https://pmfby.gov.in"
                target="_blank"
                rel="noreferrer"
                className="font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 text-[11px]"
              >
                <span>pmfby.gov.in</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
