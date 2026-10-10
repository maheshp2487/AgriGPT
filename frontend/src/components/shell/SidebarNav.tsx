'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Home, MessageSquare, TrendingUp, CloudSunRain, FileText, User, Camera, ShieldCheck } from 'lucide-react';

interface SidebarNavProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  onReturnToLanding?: () => void;
}

export function SidebarNav({ activeTab, onTabChange, onReturnToLanding }: SidebarNavProps) {
  const { t } = useLanguage();

  const navItems = [
    { id: 'chat', label: t('nav.chat') || 'Farm Advisor', icon: MessageSquare },
    { id: 'doctor', label: t('nav.doctor') || 'Crop Doctor', icon: Camera },
    { id: 'mandi', label: t('nav.mandi') || 'Mandi Rates', icon: TrendingUp },
    { id: 'weather', label: t('nav.weather') || 'Weather & Spray', icon: CloudSunRain },
    { id: 'schemes', label: t('nav.schemes') || 'Govt Schemes', icon: FileText },
  ];

  return (
    <aside
      aria-label="Sidebar Navigation"
      className="hidden md:flex flex-col w-64 lg:w-72 shrink-0 bg-white border-r border-slate-200/80 p-4 lg:p-5 space-y-6 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto"
    >
      {/* Primary Navigation List */}
      <div className="space-y-1.5 flex-1">
        {/* Back to Home / Overview link */}
        <button
          type="button"
          onClick={() => onTabChange('home')}
          className="w-full px-3 py-2 text-xs font-semibold text-slate-500 hover:text-[#2e7d32] hover:bg-[#edf7ed] rounded-xl flex items-center gap-2 mb-3 transition-colors group"
        >
          <Home className="w-4 h-4 text-slate-400 group-hover:text-[#2e7d32] transition-colors" />
          <span>Home / Overview</span>
        </button>

        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">
          Agricultural Modules
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`touch-target w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-3 transition-all text-left ${
                isActive
                  ? 'bg-[#edf7ed] text-[#2e7d32] border border-[#c8e6c9] font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent font-medium'
              }`}
            >
              <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-[#2e7d32]' : 'text-slate-400'}`} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Kisan Advisory Network Card */}
      <div className="mt-auto p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5">
        <div className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#2e7d32]" />
          <span>Kisan Advisory Network</span>
        </div>
        <p className="text-[11px] text-slate-500 leading-normal">
          Verified open ICAR agronomy and AGMARKNET market rates across 28 Indian states.
        </p>
      </div>
    </aside>
  );
}
