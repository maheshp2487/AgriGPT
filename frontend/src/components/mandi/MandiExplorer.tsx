'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import {
  Search,
  Calendar,
  AlertCircle,
  RefreshCw,
  Building2,
  TrendingUp,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Info
} from 'lucide-react';
import { FpoArbitrageDashboard } from './FpoArbitrageDashboard';

interface MandiPriceRange {
  min_price: number | null;
  max_price: number | null;
  modal_price: number;
}

interface MandiRecord {
  state: string;
  district: string;
  market: string;
  commodity: string;
  variety: string;
  arrival_date: string;
  prices: MandiPriceRange;
  freshness_status: 'FRESH' | 'DELAYED' | 'STALE';
  fetched_at: string;
  source_attribution: string;
  is_stale: boolean;
  cached_fallback?: boolean;
}

const DISTRICT_OPTIONS: Record<string, string[]> = {
  'Tamil Nadu': ['Thanjavur', 'Madurai', 'Coimbatore', 'Salem', 'Erode', 'Tiruchirappalli', 'Dindigul'],
  'Karnataka': ['Dharwad', 'Belagavi', 'Mysuru', 'Ballari', 'Shimoga'],
  'Andhra Pradesh': ['Kurnool', 'Guntur', 'Anantapur', 'Chittoor'],
  'Maharashtra': ['Nashik', 'Pune', 'Nagpur', 'Amravati', 'Latur'],
};

const COMMODITY_OPTIONS = [
  'Paddy(Dhan)',
  'Groundnut',
  'Maize',
  'Cotton',
  'Soybean',
  'Turmeric',
  'Bengal Gram(Gram)(Whole)',
];

export function MandiExplorer() {
  const { t, locale } = useLanguage();

  const [mandiSubTab, setMandiSubTab] = useState<'single' | 'arbitrage'>('single');
  const [selectedState, setSelectedState] = useState('Tamil Nadu');
  const [selectedDistrict, setSelectedDistrict] = useState('Thanjavur');
  const [selectedCommodity, setSelectedCommodity] = useState('Paddy(Dhan)');

  const [records, setRecords] = useState<MandiRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Update district automatically when state changes
  useEffect(() => {
    const districts = DISTRICT_OPTIONS[selectedState] || [];
    if (districts.length > 0 && !districts.includes(selectedDistrict)) {
      setSelectedDistrict(districts[0]);
    }
  }, [selectedState]);

  const fetchMandiPrices = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    setHasSearched(true);

    try {
      const params = new URLSearchParams({
        state: selectedState,
        district: selectedDistrict,
        commodity: selectedCommodity,
      });

      const response = await fetch(`/api/mandi?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        // Transparent fail-closed upstream failure (zero fabricated data)
        setRecords([]);
        setErrorMessage(
          data.detail ||
            `AGMARKNET portal is currently unreachable or has no verified records for ${selectedCommodity} in ${selectedDistrict}, and no verified cache exists.`
        );
      } else {
        if (data.data && Array.isArray(data.data.records)) {
          setRecords(data.data.records);
        } else {
          setRecords([]);
        }
      }
    } catch (err: any) {
      setRecords([]);
      setErrorMessage(`Failed to reach Mandi service: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Perform initial search on mount
  useEffect(() => {
    fetchMandiPrices();
  }, []);

  const formatFetchTime = (isoString?: string) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-5">
      {/* Sub-tab Mode Switcher */}
      <div className="flex items-center gap-1.5 p-1 bg-emerald-100/70 border border-emerald-200/80 rounded-2xl w-full sm:w-fit" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={mandiSubTab === 'single'}
          onClick={() => setMandiSubTab('single')}
          className={`touch-target flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            mandiSubTab === 'single'
              ? 'bg-white text-emerald-950 shadow-xs font-black'
              : 'text-emerald-900/80 hover:text-emerald-950 font-semibold'
          }`}
        >
          {t('mandi.dailyTab')}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mandiSubTab === 'arbitrage'}
          onClick={() => setMandiSubTab('arbitrage')}
          className={`touch-target flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            mandiSubTab === 'arbitrage'
              ? 'bg-white text-emerald-950 shadow-xs font-black'
              : 'text-emerald-900/80 hover:text-emerald-950 font-semibold'
          }`}
        >
          {t('mandi.arbitrageTab')}
        </button>
      </div>

      {mandiSubTab === 'arbitrage' ? (
        <FpoArbitrageDashboard />
      ) : (
        <>
          {/* Title & Filter Control Card */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-sm space-y-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-700 shrink-0" />
                <span>{t('mandi.title')}</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                {t('mandi.subtitle')}
              </p>
            </div>

            {/* Dropdowns Grid (Intuitive State, District, Commodity Selection) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* State */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('mandi.stateLabel')}
                </label>
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-slate-300 bg-slate-50 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all font-semibold text-slate-800"
                >
                  {Object.keys(DISTRICT_OPTIONS).map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              {/* District */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('mandi.districtLabel')}
                </label>
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-slate-300 bg-slate-50 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all font-semibold text-slate-800"
                >
                  {(DISTRICT_OPTIONS[selectedState] || []).map((dt) => (
                    <option key={dt} value={dt}>
                      {dt}
                    </option>
                  ))}
                </select>
              </div>

              {/* Commodity */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('mandi.commodityLabel')}
                </label>
                <select
                  value={selectedCommodity}
                  onChange={(e) => setSelectedCommodity(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-slate-300 bg-slate-50 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all font-semibold text-slate-800"
                >
                  {COMMODITY_OPTIONS.map((comm) => (
                    <option key={comm} value={comm}>
                      {comm}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Action Trigger Button */}
            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={fetchMandiPrices}
                disabled={isLoading}
                className="touch-target w-full sm:w-auto h-11 px-6 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-colors disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{t('mandi.checking')}</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>{t('mandi.checkPrices')}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Loading Skeleton */}
          {isLoading && (
            <div className="space-y-3 animate-pulse">
              <div className="h-28 bg-slate-200 rounded-2xl" />
              <div className="h-28 bg-slate-200 rounded-2xl" />
            </div>
          )}

          {/* Upstream Unavailable Banner (Zero Fabricated Data Guarantee) */}
          {!isLoading && errorMessage && (
            <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-700 flex-shrink-0" />
                <h3 className="font-bold text-sm text-amber-900">
                  {t('mandi.unavailableTitle')}
                </h3>
              </div>
              <p className="text-xs text-amber-800 leading-relaxed">
                {errorMessage}
              </p>
              <div className="pt-2 border-t border-amber-200/60 text-[11px] text-amber-700 flex flex-wrap items-center justify-between gap-1">
                <span><strong>{t('mandi.policyNotice')}</strong></span>
                <span>Next automated sync: 18:00 IST</span>
              </div>
            </div>
          )}

          {/* Verified Price Cards with Provenance & Freshness Status */}
          {!isLoading && !errorMessage && records.length > 0 && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-1 text-xs text-slate-500 px-1">
                <span>Showing {records.length} APMC market record(s)</span>
                <span className="text-emerald-800 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Verified Open Government Data (GODL)</span>
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
                {records.map((rec, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs hover:border-emerald-300 transition-all space-y-3"
                  >
                    {/* Header: Market, Variety, Freshness & Cache Provider Status */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="font-bold text-base text-slate-900 truncate">{rec.market}</h3>
                        <p className="text-xs text-slate-500 font-medium">
                          {rec.commodity} • {rec.variety || 'FAQ'}
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-1 shrink-0">
                        {/* Freshness Badge */}
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            rec.freshness_status === 'FRESH'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : rec.freshness_status === 'DELAYED'
                              ? 'bg-amber-50 text-amber-800 border-amber-300'
                              : 'bg-rose-50 text-rose-800 border-rose-300'
                          }`}
                        >
                          {rec.freshness_status}
                        </span>

                        {/* Distinct Cached vs Live Origin Tag */}
                        {rec.cached_fallback ? (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-800 inline-flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            <span>{t('mandi.cachedTag')}</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 inline-flex items-center gap-1">
                            <ShieldCheck className="w-2.5 h-2.5 text-emerald-700" />
                            <span>{t('mandi.liveTag')}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Price Display */}
                    <div className="bg-emerald-50/60 rounded-xl p-3 border border-emerald-100 flex items-center justify-between">
                      <div>
                        <span className="text-[11px] text-emerald-900 font-bold uppercase tracking-wider block">
                          {t('mandi.modalPrice')}
                        </span>
                        <span className="text-xl font-black text-emerald-800 font-mono">
                          ₹{rec.prices.modal_price.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[11px] text-emerald-700 ml-1 font-medium">{t('mandi.unit')}</span>
                      </div>

                      <div className="text-right text-xs text-slate-600 space-y-0.5 font-mono">
                        {rec.prices.min_price && (
                          <div>{t('mandi.minPrice')}: ₹{rec.prices.min_price.toLocaleString('en-IN')}</div>
                        )}
                        {rec.prices.max_price && (
                          <div>{t('mandi.maxPrice')}: ₹{rec.prices.max_price.toLocaleString('en-IN')}</div>
                        )}
                      </div>
                    </div>

                    {/* Complete Observation, Source, & Fetch Timestamps */}
                    <div className="space-y-1 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 font-medium text-slate-700">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{t('mandi.arrivalDateLabel')}: <strong>{rec.arrival_date}</strong></span>
                        </div>
                        {rec.fetched_at && (
                          <div className="flex items-center gap-1 text-slate-500">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>{t('mandi.fetchTime')}: {formatFetchTime(rec.fetched_at)}</span>
                          </div>
                        )}
                      </div>

                      <div className="text-[10px] text-slate-400 truncate">
                        {rec.source_attribution || t('mandi.sourceAttribution')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Zero Records Empty State */}
          {!isLoading && !errorMessage && hasSearched && records.length === 0 && (
            <div className="p-8 rounded-2xl bg-white border border-slate-200 text-center space-y-2">
              <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
              <h3 className="font-bold text-slate-800 text-sm">{t('mandi.noRecords')}</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                {t('mandi.noRecordsDesc')}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
