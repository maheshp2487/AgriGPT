'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import {
  Bell,
  X,
  CloudSunRain,
  TrendingUp,
  FileText,
  Bug,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Sparkles,
  PhoneCall
} from 'lucide-react';

export interface NotificationItem {
  id: string;
  category: 'weather' | 'mandi' | 'schemes' | 'pest';
  titleKey: string;
  descKey: string;
  timestamp: string;
  isRead: boolean;
  actionQuery?: string;
  actionCrop?: string;
  actionTab?: string;
}

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction?: (query: string, crop?: string, tab?: string) => void;
}

export function NotificationModal({ isOpen, onClose, onSelectAction }: NotificationModalProps) {
  const { t } = useLanguage();
  const [filter, setFilter] = useState<'all' | 'weather' | 'mandi' | 'schemes' | 'pest'>('all');
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif-1',
      category: 'weather',
      titleKey: 'notifications.weatherAlertTitle',
      descKey: 'notifications.weatherAlertDesc',
      timestamp: '15 mins ago',
      isRead: false,
      actionQuery: 'Is today suitable for pesticide spraying in my district?',
      actionTab: 'weather',
    },
    {
      id: 'notif-2',
      category: 'mandi',
      titleKey: 'notifications.mandiAlertTitle',
      descKey: 'notifications.mandiAlertDesc',
      timestamp: '1 hour ago',
      isRead: false,
      actionQuery: 'What are the current tomato wholesale mandi prices and arrivals?',
      actionCrop: 'tomato',
      actionTab: 'mandi',
    },
    {
      id: 'notif-3',
      category: 'schemes',
      titleKey: 'notifications.schemeAlertTitle',
      descKey: 'notifications.schemeAlertDesc',
      timestamp: '3 hours ago',
      isRead: false,
      actionQuery: 'How to check PM-KISAN installment status and Aadhaar e-KYC?',
      actionTab: 'schemes',
    },
    {
      id: 'notif-4',
      category: 'pest',
      titleKey: 'notifications.pestAlertTitle',
      descKey: 'notifications.pestAlertDesc',
      timestamp: '5 hours ago',
      isRead: false,
      actionQuery: 'Fall Armyworm identification and control measures in maize',
      actionCrop: 'maize',
      actionTab: 'doctor',
    },
  ]);

  if (!isOpen) return null;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const handleAction = (item: NotificationItem) => {
    markAsRead(item.id);
    onClose();
    if (onSelectAction && item.actionQuery) {
      onSelectAction(item.actionQuery, item.actionCrop, item.actionTab);
    }
  };

  const filtered = filter === 'all'
    ? notifications
    : notifications.filter((n) => n.category === filter);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getCategoryIcon = (cat: NotificationItem['category']) => {
    switch (cat) {
      case 'weather':
        return <CloudSunRain className="w-5 h-5 text-sky-600" />;
      case 'mandi':
        return <TrendingUp className="w-5 h-5 text-amber-600" />;
      case 'schemes':
        return <FileText className="w-5 h-5 text-emerald-600" />;
      case 'pest':
        return <Bug className="w-5 h-5 text-rose-600" />;
    }
  };

  const getCategoryColor = (cat: NotificationItem['category']) => {
    switch (cat) {
      case 'weather':
        return 'bg-sky-50 border-sky-200 text-sky-900';
      case 'mandi':
        return 'bg-amber-50 border-amber-200 text-amber-900';
      case 'schemes':
        return 'bg-emerald-50 border-emerald-200 text-emerald-900';
      case 'pest':
        return 'bg-rose-50 border-rose-200 text-rose-900';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-emerald-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-emerald-100 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="notif-dialog-title"
      >
        {/* Header with Lush Green Theme */}
        <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-900 p-5 text-white flex items-center justify-between border-b border-emerald-700">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-700/80 border border-emerald-500/50 flex items-center justify-center text-emerald-100 shadow-inner">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 id="notif-dialog-title" className="text-base sm:text-lg font-black tracking-tight flex items-center gap-2">
                <span>{t('notifications.title')}</span>
                {unreadCount > 0 && (
                  <span className="text-[11px] font-bold bg-amber-400 text-amber-950 px-2 py-0.5 rounded-full">
                    {unreadCount} {t('notifications.unreadBadge')}
                  </span>
                )}
              </h2>
              <p className="text-[11px] text-emerald-200 font-medium">
                Real-time crop, weather, market & scheme updates
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-emerald-800/80 hover:bg-emerald-700 text-emerald-100 flex items-center justify-center transition-colors"
            aria-label={t('common.close')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Filter Tabs */}
        <div className="p-3 bg-emerald-50/50 border-b border-emerald-100 flex items-center justify-between gap-2 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-1.5 text-xs font-bold">
            {(['all', 'weather', 'mandi', 'schemes', 'pest'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3 py-1.5 rounded-xl capitalize transition-colors ${
                  filter === tab
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'bg-white text-emerald-900 hover:bg-emerald-100 border border-emerald-200'
                }`}
              >
                {tab === 'all' ? 'All Alerts' : tab}
              </button>
            ))}
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 shrink-0 hover:underline px-2"
            >
              {t('notifications.markAllRead')}
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div className="p-4 space-y-3 overflow-y-auto flex-1 divide-y divide-emerald-50">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-300" />
              <p className="text-sm font-semibold text-slate-600">No unread alerts for this category</p>
              <p className="text-xs text-slate-400">All your farm conditions are normal right now.</p>
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                className={`pt-3 first:pt-0 p-3.5 rounded-2xl border transition-all ${
                  item.isRead
                    ? 'bg-white border-slate-200/80 text-slate-600'
                    : 'bg-emerald-50/40 border-emerald-200/90 shadow-2xs'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${getCategoryColor(item.category)}`}>
                    {getCategoryIcon(item.category)}
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                        {t(item.titleKey)}
                      </h3>
                      <span className="text-[10px] text-slate-400 font-medium shrink-0">
                        {item.timestamp}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {t(item.descKey)}
                    </p>

                    <div className="pt-2 flex items-center justify-between gap-2">
                      {item.actionQuery && (
                        <button
                          type="button"
                          onClick={() => handleAction(item)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
                          <span>{t('notifications.viewAction')}</span>
                        </button>
                      )}

                      {!item.isRead && (
                        <button
                          type="button"
                          onClick={() => markAsRead(item.id)}
                          className="text-[11px] font-semibold text-slate-400 hover:text-slate-600 px-2 py-1"
                        >
                          {t('notifications.dismiss')}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Helpline Fast-Action */}
        <div className="p-3 bg-emerald-950 text-emerald-200 text-xs flex items-center justify-between border-t border-emerald-900">
          <div className="flex items-center gap-2">
            <PhoneCall className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold">Kisan Call Centre Toll-Free:</span>
            <a href="tel:18001801551" className="text-white font-mono font-bold hover:underline">
              1800-180-1551
            </a>
          </div>
          <span className="text-[10px] text-emerald-400 font-medium">Free 24/7 Advisory</span>
        </div>
      </div>
    </div>
  );
}
