'use client';

import React, { useEffect, useState } from 'react';
import { WifiOff, CheckCircle2 } from 'lucide-react';

export function ServiceWorkerRegister() {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [justCameOnline, setJustCameOnline] = useState<boolean>(false);

  useEffect(() => {
    // 1. Register Service Worker if supported
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((reg) => {
            console.log('AgriGPT PWA Service Worker registered:', reg.scope);
          })
          .catch((err) => {
            console.warn('Service Worker registration skipped:', err);
          });
      });
    }

    // 2. Network connectivity listeners
    const handleOnline = () => {
      setIsOnline(true);
      setJustCameOnline(true);
      setTimeout(() => setJustCameOnline(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && !justCameOnline) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-20 md:bottom-4 left-1/2 -translate-x-1/2 z-50 max-w-sm w-[90%] pointer-events-none"
    >
      {!isOnline ? (
        <div className="bg-emerald-950/95 text-white px-4 py-2.5 rounded-2xl shadow-xl border border-emerald-700/80 flex items-center gap-3 backdrop-blur-md animate-in slide-in-from-bottom-2 duration-200">
          <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
          <div className="text-xs">
            <span className="font-bold">Offline Connectivity</span> — Displaying cached mandi prices and weather advisory.
          </div>
        </div>
      ) : (
        <div className="bg-emerald-900/95 text-white px-4 py-2 rounded-2xl shadow-xl border border-emerald-700 flex items-center gap-2.5 backdrop-blur-md animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <div className="text-xs font-semibold">
            Back online — Live sync restored.
          </div>
        </div>
      )}
    </div>
  );
}
