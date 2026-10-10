'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { Sprout, Globe, MapPin, User as UserIcon, Bell } from 'lucide-react';
import { LanguageModal } from './LanguageModal';

interface AppHeaderProps {
  onOpenNotifications?: () => void;
  unreadCount?: number;
  activeTab?: string;
  onNavigateTab?: (tabId: string) => void;
}

export function AppHeader({
  onOpenNotifications,
  unreadCount = 4,
  activeTab = 'home',
  onNavigateTab
}: AppHeaderProps) {
  const { currentLanguage, t } = useLanguage();
  const { isAuthenticated, profile, openLoginModal, openProfileDrawer } = useAuth();
  const [isLangOpen, setIsLangOpen] = useState(false);

  // Core agricultural tool tabs only (Home is accessed via AgriGPT brand logo)
  const mainNavTabs = [
    { id: 'chat', label: t('nav.chat') || 'Farm Advisor' },
    { id: 'doctor', label: t('nav.doctor') || 'Crop Doctor' },
    { id: 'mandi', label: t('nav.mandi') || 'Mandi Rates' },
    { id: 'weather', label: t('nav.weather') || 'Weather & Spray' },
    { id: 'schemes', label: t('nav.schemes') || 'Govt Schemes' },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo & Brand Identity (AgriGPT is never truncated; small rectangular line removed) */}
          <button
            type="button"
            onClick={() => onNavigateTab?.('home')}
            className="flex items-center gap-2.5 shrink-0 text-left hover:opacity-90 transition-opacity"
            aria-label="Go to AgriGPT Home"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#2e7d32] flex items-center justify-center text-white shadow-xs shrink-0">
              <Sprout className="w-5 h-5" />
            </div>
            <div className="shrink-0 flex flex-col justify-center">
              <span className="text-xl font-extrabold tracking-tight text-slate-900 whitespace-nowrap">
                AgriGPT
              </span>
              <span className="text-[10px] text-slate-500 font-medium tracking-wide whitespace-nowrap hidden sm:block">
                National Agricultural Intelligence
              </span>
            </div>
          </button>

          {/* Desktop Top Navigation Tabs (Less congestion, lighter nature green active state) */}
          {onNavigateTab && (
            <nav className="hidden lg:flex items-center gap-1.5" aria-label="Main Navigation">
              {mainNavTabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => onNavigateTab(tab.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-[#edf7ed] text-[#2e7d32] border border-[#c8e6c9] shadow-2xs font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent font-medium'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          )}

          {/* Right Controls: Notifications & Location (enabled ONLY after login), Language Switcher, Profile/Login */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Notification Bell Button (ONLY shown when authenticated) */}
            {isAuthenticated && onOpenNotifications && (
              <button
                type="button"
                onClick={onOpenNotifications}
                aria-label="View agricultural alerts"
                className="relative touch-target p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors"
              >
                <Bell className="w-4 h-4 text-slate-600" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-amber-600 text-[9px] font-bold text-white shadow-xs">
                    {unreadCount}
                  </span>
                )}
              </button>
            )}

            {/* Location Pill (ONLY shown when authenticated) */}
            {isAuthenticated && (
              <div className="hidden sm:flex items-center gap-1 text-xs font-medium text-slate-700 bg-slate-100/90 border border-slate-200 px-2.5 py-1.5 rounded-xl">
                <MapPin className="w-3.5 h-3.5 text-[#2e7d32] shrink-0" />
                <span className="truncate max-w-[120px] xl:max-w-none">
                  {profile?.district ? `${profile.district}, ${profile.state || 'IN'}` : t('header.currentLocation')}
                </span>
              </div>
            )}

            {/* First-Class Language Switcher Button (Nature Green) */}
            <button
              onClick={() => setIsLangOpen(true)}
              aria-label={t('header.selectLanguage')}
              className="touch-target px-3 py-1.5 bg-[#edf7ed] hover:bg-[#e0f2e1] text-[#2e7d32] border border-[#c8e6c9] rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <Globe className="w-4 h-4 text-[#2e7d32]" />
              <span className="font-semibold">{currentLanguage.nativeName}</span>
              <span className="text-[10px] text-slate-500 font-normal hidden md:inline">({currentLanguage.englishName})</span>
            </button>

            {/* Farmer Profile / Login Button (Nature Green) */}
            {isAuthenticated ? (
              <button
                onClick={openProfileDrawer}
                className="touch-target px-3.5 py-1.5 bg-[#2e7d32] hover:bg-[#1b5e20] text-white rounded-xl font-semibold text-xs sm:text-sm flex items-center gap-1.5 transition-colors shadow-xs"
                aria-label="View farmer profile"
              >
                <UserIcon className="w-4 h-4" />
                <span className="hidden sm:inline max-w-[100px] truncate">{profile?.fullName || 'Profile'}</span>
              </button>
            ) : (
              <button
                onClick={openLoginModal}
                className="touch-target px-4 py-1.5 bg-[#2e7d32] hover:bg-[#1b5e20] text-white rounded-xl font-semibold text-xs sm:text-sm flex items-center gap-1.5 transition-colors shadow-xs"
                aria-label="Farmer login"
              >
                <UserIcon className="w-4 h-4" />
                <span>Login</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Language Selection Modal */}
      <LanguageModal isOpen={isLangOpen} onClose={() => setIsLangOpen(false)} />
    </>
  );
}
