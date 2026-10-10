'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { SUPPORTED_LANGUAGES, Locale } from '@/types/i18n';
import { X, Check } from 'lucide-react';

interface LanguageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LanguageModal({ isOpen, onClose }: LanguageModalProps) {
  const { locale, setLocale, t } = useLanguage();

  if (!isOpen) return null;

  const handleSelect = (code: Locale) => {
    setLocale(code);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="language-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/70 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
          <div>
            <h2 id="language-modal-title" className="text-lg font-bold text-slate-900">
              {t('common.switchLang')}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select your preferred language / உங்கள் மொழியைத் தேர்ந்தெடுக்கவும்
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label={t('common.close')}
            className="touch-target p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Language Grid */}
        <div className="p-4 space-y-2.5">
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isSelected = locale === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => handleSelect(lang.code)}
                className={`touch-target w-full px-4 py-3.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-semibold ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <span className="text-2xl" aria-hidden="true">
                    {lang.flag}
                  </span>
                  <div>
                    <div className="text-base font-bold text-slate-900">{lang.nativeName}</div>
                    <div className="text-xs text-slate-500">{lang.englishName} ({lang.script})</div>
                  </div>
                </div>
                {isSelected && (
                  <div className="flex items-center gap-1 text-emerald-700 text-xs font-bold bg-emerald-100/80 px-2.5 py-1 rounded-full">
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>{t('common.active')}</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer Note */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-500">
            More regional languages (Telugu, Kannada, Malayalam) coming in Phase 2.
          </p>
        </div>
      </div>
    </div>
  );
}
