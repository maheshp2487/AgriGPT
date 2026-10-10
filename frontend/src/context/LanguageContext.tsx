'use client';

import React, { createContext, useContext, useState, useEffect, useTransition } from 'react';
import { Locale, SUPPORTED_LANGUAGES, LanguageOption } from '@/types/i18n';
import en from '@/locales/en.json';
import ta from '@/locales/ta.json';
import hi from '@/locales/hi.json';
import te from '@/locales/te.json';
import kn from '@/locales/kn.json';
import ml from '@/locales/ml.json';

const dictionaries: Record<Locale, typeof en> = {
  en,
  ta: ta as typeof en,
  hi: hi as typeof en,
  te: te as typeof en,
  kn: kn as typeof en,
  ml: ml as typeof en,
};

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (path: string, fallback?: string) => string;
  currentLanguage: LanguageOption;
  isPending: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const COOKIE_NAME = 'NEXT_LOCALE';

const VALID_LOCALES: Locale[] = ['en', 'ta', 'hi', 'te', 'kn', 'ml'];

function getCookieLocale(): Locale {
  if (typeof document === 'undefined') return 'en';
  const match = document.cookie.match(new RegExp('(^| )' + COOKIE_NAME + '=([^;]+)'));
  const val = match ? (match[2] as Locale) : null;
  if (val && VALID_LOCALES.includes(val)) {
    return val;
  }
  return 'en';
}

function setCookieLocale(locale: Locale) {
  if (typeof document === 'undefined') return;
  document.cookie = `${COOKIE_NAME}=${locale}; path=/; max-age=31536000; SameSite=Lax`;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const saved = getCookieLocale();
    if (saved) {
      setLocaleState(saved);
      if (typeof document !== 'undefined') {
        document.documentElement.lang = saved;
      }
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    startTransition(() => {
      setLocaleState(newLocale);
      setCookieLocale(newLocale);
      if (typeof document !== 'undefined') {
        document.documentElement.lang = newLocale;
      }
      try {
        localStorage.setItem('agri_preferred_locale', newLocale);
      } catch {
        // Ignore localStorage quota or private-browsing errors
      }
    });
  };

  const t = (path: string, fallback?: string): string => {
    const dict = dictionaries[locale] || dictionaries.en;
    const parts = path.split('.');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let current: any = dict;

    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        // Fallback to English dictionary if missing in target
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let enCurrent: any = dictionaries.en;
        for (const enPart of parts) {
          if (enCurrent && typeof enCurrent === 'object' && enPart in enCurrent) {
            enCurrent = enCurrent[enPart];
          } else {
            return fallback || path;
          }
        }
        return typeof enCurrent === 'string' ? enCurrent : (fallback || path);
      }
    }

    if (typeof current === 'string') {
      return current;
    }

    return fallback || path;
  };

  const currentLanguage =
    SUPPORTED_LANGUAGES.find((l) => l.code === locale) || SUPPORTED_LANGUAGES[0];

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t, currentLanguage, isPending }}>
      <div lang={locale} className={locale === 'ta' ? 'font-tamil' : locale === 'hi' ? 'font-hindi' : 'font-sans'}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
