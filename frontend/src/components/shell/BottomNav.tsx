'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Home, MessageSquare, TrendingUp, CloudSunRain, FileText } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const { t } = useLanguage();

  const navItems = [
    {
      id: 'home',
      label: t('nav.home') || 'Home',
      icon: Home,
    },
    {
      id: 'chat',
      label: t('nav.chat') || 'Advisor',
      icon: MessageSquare,
    },
    {
      id: 'mandi',
      label: t('nav.mandi') || 'Mandi',
      icon: TrendingUp,
    },
    {
      id: 'weather',
      label: t('nav.weather') || 'Weather',
      icon: CloudSunRain,
    },
    {
      id: 'schemes',
      label: t('nav.schemes') || 'Schemes',
      icon: FileText,
    },
  ];

  return (
    <nav
      aria-label="Bottom Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-lg pb-safe"
    >
      <div className="grid grid-cols-5 h-16 max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`touch-target flex flex-col items-center justify-center gap-1 transition-colors ${
                isActive
                  ? 'text-[#2e7d32] font-bold'
                  : 'text-slate-500 hover:text-slate-800 font-medium'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.2] text-[#2e7d32]' : 'stroke-[1.75]'}`} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#2e7d32] rounded-full" />
                )}
              </div>
              <span className="text-[10px] sm:text-[11px] leading-tight truncate max-w-[76px] px-0.5">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
