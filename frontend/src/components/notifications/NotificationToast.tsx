'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import {
  Bell,
  X,
  Sparkles,
  TrendingUp,
  CloudSunRain,
  ChevronRight
} from 'lucide-react';

interface NotificationToastProps {
  onOpenNotifications: () => void;
  onSelectAction: (query: string, crop?: string, tab?: string) => void;
}

export function NotificationToast({ onOpenNotifications, onSelectAction }: NotificationToastProps) {
  const { t } = useLanguage();
  const [isVisible, setIsVisible] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);

  const toasts = [
    {
      id: 'toast-weather',
      icon: CloudSunRain,
      iconColor: 'text-sky-600 bg-sky-100',
      badge: 'Weather Advisory',
      badgeColor: 'bg-sky-700 text-sky-100',
      title: 'Rain Forecast Alert',
      message: 'Favorable spray window tomorrow 07:00 - 10:30 AM before expected showers.',
      query: 'Is tomorrow morning favorable for foliar spraying in my district?',
      tab: 'weather',
    },
    {
      id: 'toast-mandi',
      icon: TrendingUp,
      iconColor: 'text-amber-600 bg-amber-100',
      badge: 'Mandi Price Spike',
      badgeColor: 'bg-amber-700 text-amber-100',
      title: 'Vegetable Market Trend',
      message: 'Tomato wholesale rates jumped +12% at nearby APMC markets.',
      query: 'What are today’s modal rates for tomato and vegetables?',
      crop: 'tomato',
      tab: 'mandi',
    },
  ];

  // Rotate between toasts every 12 seconds if not dismissed
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % toasts.length);
    }, 12000);
    return () => clearInterval(timer);
  }, [toasts.length]);

  if (!isVisible) return null;

  const activeToast = toasts[currentIdx];
  const Icon = activeToast.icon;

  return (
    <div className="fixed bottom-20 md:bottom-6 right-3 sm:right-6 z-30 max-w-sm w-[calc(100vw-1.5rem)] sm:w-auto animate-in slide-in-from-bottom-5 duration-300">
      <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-950 text-white rounded-2xl p-4 shadow-xl border border-emerald-500/40 backdrop-blur-md space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${activeToast.iconColor}`}>
              <Icon className="w-4 h-4" />
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${activeToast.badgeColor}`}>
              {activeToast.badge}
            </span>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="w-6 h-6 rounded-full hover:bg-emerald-700/80 text-emerald-200 hover:text-white flex items-center justify-center transition-colors"
            aria-label="Dismiss notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div>
          <h4 className="text-xs sm:text-sm font-bold text-white tracking-tight">
            {activeToast.title}
          </h4>
          <p className="text-[11px] text-emerald-100/90 leading-relaxed mt-0.5">
            {activeToast.message}
          </p>
        </div>

        <div className="pt-1 flex items-center justify-between gap-2 border-t border-emerald-700/60 text-xs">
          <button
            onClick={() => onSelectAction(activeToast.query, activeToast.crop, activeToast.tab)}
            className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-emerald-950 font-bold rounded-lg text-[11px] flex items-center gap-1 transition-colors shadow-2xs"
          >
            <Sparkles className="w-3 h-3 text-emerald-700" />
            <span>Check Now</span>
          </button>

          <button
            onClick={onOpenNotifications}
            className="text-[11px] text-emerald-300 hover:text-white font-medium flex items-center gap-0.5 hover:underline"
          >
            <span>All Alerts</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
