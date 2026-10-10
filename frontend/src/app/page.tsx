'use client';

import React, { useState } from 'react';
import { AppHeader } from '@/components/shell/AppHeader';
import { BottomNav } from '@/components/shell/BottomNav';
import { SidebarNav } from '@/components/shell/SidebarNav';
import { Footer } from '@/components/shell/Footer';
import { HomeFeed } from '@/components/home/HomeFeed';
import { LandingPage } from '@/components/landing/LandingPage';
import { NotificationModal } from '@/components/notifications/NotificationModal';
import { NotificationToast } from '@/components/notifications/NotificationToast';
import { MessageSquare, Sparkles } from 'lucide-react';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [isNotifModalOpen, setIsNotifModalOpen] = useState<boolean>(false);
  const [initialChatQuery, setInitialChatQuery] = useState<string>('');
  const [initialChatCrop, setInitialChatCrop] = useState<string | undefined>(undefined);

  const handleActionFromAlert = (query: string, crop?: string, tab?: string) => {
    if (tab && tab !== 'chat') {
      setActiveTab(tab);
      return;
    }
    setInitialChatQuery(query);
    setInitialChatCrop(crop);
    setActiveTab('chat');
  };

  const handleOpenTool = (tabId: string) => {
    setActiveTab(tabId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAskFromLanding = (query: string, crop?: string) => {
    setInitialChatQuery(query);
    setInitialChatCrop(crop);
    setActiveTab('chat');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAF7] relative">
      {/* Global Application Header with Direct Nav Tabs, Location, and Prominent Language Selector */}
      <AppHeader
        onOpenNotifications={() => setIsNotifModalOpen(true)}
        unreadCount={4}
        activeTab={activeTab}
        onNavigateTab={handleOpenTool}
      />

      {/* View 1: Full-Width Dedicated Landing & Overview Showcase */}
      {activeTab === 'home' ? (
        <div className="flex-1 flex flex-col w-full animate-in fade-in duration-200">
          <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            <LandingPage
              onNavigateTab={handleOpenTool}
              onAskQuery={handleAskFromLanding}
              onOpenCropDoctor={() => handleOpenTool('doctor')}
              onOpenNotifications={() => setIsNotifModalOpen(true)}
            />
          </main>
          <Footer onNavigateTab={handleOpenTool} />
        </div>
      ) : (
        /* View 2: Farmer Intelligence Workspace with Dedicated Sidebar */
        <div className="flex-1 flex w-full animate-in fade-in duration-200">
          {/* Desktop / Tablet Sidebar Navigation */}
          <SidebarNav
            activeTab={activeTab}
            onTabChange={handleOpenTool}
          />

          {/* Main Content Workspace Viewport */}
          <div className="flex-1 flex flex-col min-w-0">
            <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 w-full">
              <div className="w-full max-w-5xl xl:max-w-6xl mx-auto space-y-6">
                <HomeFeed
                  activeTab={activeTab}
                  onNavigateTab={handleOpenTool}
                  onOpenNotifications={() => setIsNotifModalOpen(true)}
                  initialChatQuery={initialChatQuery}
                  initialChatCrop={initialChatCrop}
                  onClearInitialChatQuery={() => {
                    setInitialChatQuery('');
                    setInitialChatCrop(undefined);
                  }}
                />
              </div>
            </main>
            <Footer onNavigateTab={handleOpenTool} />
          </div>
        </div>
      )}

      {/* Floating Action Button: Quick Farmer Assistant */}
      {activeTab !== 'chat' && (
        <aside aria-label="Quick Farm Assistant" className="fixed bottom-20 md:bottom-6 right-4 sm:right-8 z-30">
          <button
            type="button"
            onClick={() => handleOpenTool('chat')}
            className="touch-target px-4 py-2.5 rounded-full bg-[#2e7d32] hover:bg-[#1b5e20] text-white font-semibold text-xs sm:text-sm flex items-center gap-2.5 shadow-lg border border-[#388e3c] transition-all hover:scale-105 active:scale-95 animate-float"
            aria-label="Open AgriGPT Advisor"
          >
            <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            </div>
            <span>Ask AgriGPT</span>
            <span className="hidden sm:inline-block px-1.5 py-0.5 rounded-full bg-black/20 text-[10px] text-emerald-200 font-mono">
              24/7
            </span>
          </button>
        </aside>
      )}

      {/* Mobile-First Thumb Navigation Bar */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={handleOpenTool}
      />

      {/* Agricultural Alerts Pop-up Modal */}
      <NotificationModal
        isOpen={isNotifModalOpen}
        onClose={() => setIsNotifModalOpen(false)}
        onSelectAction={handleActionFromAlert}
      />

      {/* Floating Real-time Agricultural Notification Toast Stack */}
      <NotificationToast
        onOpenNotifications={() => setIsNotifModalOpen(true)}
        onSelectAction={handleActionFromAlert}
      />
    </div>
  );
}
