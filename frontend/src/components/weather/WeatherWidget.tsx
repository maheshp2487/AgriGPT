'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import {
  CloudSun,
  Wind,
  Droplets,
  Gauge,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Info,
  RefreshCw,
  MapPin,
  Compass
} from 'lucide-react';

interface WeatherCurrent {
  temperature_c: number;
  relative_humidity_pct: number;
  wind_speed_kmh: number;
  wind_gusts_kmh: number;
  precipitation_prob_pct: number;
  condition: string;
}

interface AgrometAdvisory {
  spraying_suitability: 'FAVORABLE' | 'MARGINAL' | 'UNFAVORABLE';
  delta_t_c: number;
  wind_speed_kmh: number;
  wind_gusts_kmh: number;
  rain_prob_next_6h_pct: number;
  heat_stress_alert: boolean;
  advisory_text_en: string;
  irrigation_advice_en: string;
  pollinator_warning_en: string;
  disclaimer_en: string;
}

interface WeatherResponseData {
  location: {
    state: string;
    district: string;
    latitude: number;
    longitude: number;
  };
  current: WeatherCurrent;
  agromet_advisory: AgrometAdvisory;
  source_attribution: {
    provider: string;
    license: string;
    data_type: string;
    attribution_text: string;
  };
}

const DISTRICT_COORDINATES: Record<string, { lat: number; lon: number; state: string }> = {
  'Thanjavur': { lat: 10.787, lon: 79.1378, state: 'Tamil Nadu' },
  'Madurai': { lat: 9.9252, lon: 78.1198, state: 'Tamil Nadu' },
  'Salem': { lat: 11.6643, lon: 78.146, state: 'Tamil Nadu' },
  'Coimbatore': { lat: 11.0168, lon: 76.9558, state: 'Tamil Nadu' },
  'Dharwad': { lat: 15.4589, lon: 75.0078, state: 'Karnataka' },
  'Kurnool': { lat: 15.8281, lon: 78.0373, state: 'Andhra Pradesh' },
};

export function WeatherWidget() {
  const { t, locale } = useLanguage();
  const [selectedDistrict, setSelectedDistrict] = useState('Thanjavur');
  const [weatherData, setWeatherData] = useState<WeatherResponseData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchWeather = async (districtName: string) => {
    setIsLoading(true);
    setErrorMessage(null);

    const coord = DISTRICT_COORDINATES[districtName];
    if (!coord) return;

    try {
      const params = new URLSearchParams({
        district: districtName,
        state: coord.state,
        lat: coord.lat.toString(),
        lon: coord.lon.toString(),
      });

      const response = await fetch(`/api/weather?${params.toString()}`);
      const json = await response.json();

      if (!response.ok) {
        setErrorMessage(json.detail || 'Weather service unavailable');
      } else {
        setWeatherData(json.data);
      }
    } catch (err: any) {
      setErrorMessage(`Failed to load weather: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather(selectedDistrict);
  }, [selectedDistrict]);

  const current = weatherData?.current;
  const advisory = weatherData?.agromet_advisory;
  const attribution = weatherData?.source_attribution;
  const coord = DISTRICT_COORDINATES[selectedDistrict];

  return (
    <div className="space-y-4">
      {/* Location Selector Bar */}
      <div className="bg-white rounded-2xl p-4 border border-emerald-100/90 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-emerald-700 shrink-0" />
          <div>
            <h2 className="text-base font-bold text-slate-900 leading-tight">
              {t('weather.title')}
            </h2>
            <p className="text-[11px] text-slate-500 font-medium">
              {coord ? `${selectedDistrict}, ${coord.state} (${coord.lat}°N, ${coord.lon}°E)` : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="flex-1 sm:w-48 h-10 px-3 rounded-xl border border-emerald-200 bg-emerald-50/40 text-xs sm:text-sm font-semibold text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all"
          >
            {Object.keys(DISTRICT_COORDINATES).map((d) => (
              <option key={d} value={d}>
                {d} ({DISTRICT_COORDINATES[d].state})
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => fetchWeather(selectedDistrict)}
            disabled={isLoading}
            className="touch-target h-10 w-10 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 flex items-center justify-center transition-colors disabled:opacity-50 shrink-0"
            title={t('weather.refreshWeather')}
            aria-label={t('weather.refreshWeather')}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="space-y-3 animate-pulse">
          <div className="h-44 bg-slate-200 rounded-2xl" />
          <div className="h-32 bg-slate-200 rounded-2xl" />
        </div>
      )}

      {errorMessage && !isLoading && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm font-medium">
          {errorMessage}
        </div>
      )}

      {current && advisory && !isLoading && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            {/* Left Card: Pure Lush Agricultural Green Weather Forecast Card (Zero dark blue) */}
            <div className="lg:col-span-7 bg-gradient-to-br from-emerald-800 via-emerald-700 to-green-800 text-white rounded-3xl p-5 sm:p-7 shadow-lg border border-emerald-500/50 relative overflow-hidden flex flex-col justify-between space-y-5">
              {/* Radial glow */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none" />

              <div className="relative z-10 flex items-start justify-between gap-3">
                <div className="space-y-1.5">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-900/80 border border-emerald-400/50 text-[10px] font-bold uppercase tracking-wider text-emerald-100">
                    <Compass className="w-3.5 h-3.5 text-emerald-300" />
                    <span>{t('weather.nwpModelLabel')}</span>
                  </div>
                  <div className="flex items-baseline gap-3 mt-2">
                    <span className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-white">
                      {Math.round(current.temperature_c)}°C
                    </span>
                    <span className="text-emerald-100 font-bold text-base sm:text-lg">
                      {current.condition}
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-100/90 leading-relaxed max-w-sm">
                    {t('weather.nwpDisclaimer')}
                  </p>
                </div>

                <div className="w-16 h-16 rounded-2xl bg-emerald-900/50 border border-emerald-400/30 flex items-center justify-center shrink-0 shadow-inner">
                  <CloudSun className="w-10 h-10 text-amber-300 animate-pulse" />
                </div>
              </div>

              {/* Metrics Grid in Rich Emerald theme */}
              <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-emerald-600/60 text-xs">
                <div className="p-2.5 rounded-xl bg-emerald-900/50 border border-emerald-500/30 space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-200 text-[11px] font-semibold">
                    <Droplets className="w-3.5 h-3.5 text-sky-300" />
                    <span>{t('weather.humidity')}</span>
                  </div>
                  <div className="font-bold font-mono text-sm sm:text-base text-white">{current.relative_humidity_pct}%</div>
                </div>

                <div className="p-2.5 rounded-xl bg-emerald-900/50 border border-emerald-500/30 space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-200 text-[11px] font-semibold">
                    <Wind className="w-3.5 h-3.5 text-emerald-300" />
                    <span>{t('weather.wind')}</span>
                  </div>
                  <div className="font-bold font-mono text-sm sm:text-base text-white">{current.wind_speed_kmh} km/h</div>
                </div>

                <div className="p-2.5 rounded-xl bg-emerald-900/50 border border-emerald-500/30 space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-200 text-[11px] font-semibold">
                    <Gauge className="w-3.5 h-3.5 text-amber-300" />
                    <span>{t('weather.windGusts')}</span>
                  </div>
                  <div className="font-bold font-mono text-sm sm:text-base text-white">{current.wind_gusts_kmh} km/h</div>
                </div>

                <div className="p-2.5 rounded-xl bg-emerald-900/50 border border-emerald-500/30 space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-200 text-[11px] font-semibold">
                    <CloudSun className="w-3.5 h-3.5 text-teal-300" />
                    <span>{t('weather.rainProb')}</span>
                  </div>
                  <div className="font-bold font-mono text-sm sm:text-base text-white">{advisory.rain_prob_next_6h_pct}%</div>
                </div>
              </div>
            </div>

            {/* Right Card: Agromet Spraying Advisory Card */}
            <div
              className={`lg:col-span-5 rounded-3xl p-5 sm:p-6 border-2 shadow-sm flex flex-col justify-between space-y-4 ${
                advisory.spraying_suitability === 'FAVORABLE'
                  ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
                  : advisory.spraying_suitability === 'MARGINAL'
                  ? 'bg-amber-50/90 border-amber-300 text-amber-950'
                  : 'bg-rose-50/90 border-rose-200 text-rose-950'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {advisory.spraying_suitability === 'FAVORABLE' && (
                      <CheckCircle2 className="w-6 h-6 text-emerald-700 shrink-0" />
                    )}
                    {advisory.spraying_suitability === 'MARGINAL' && (
                      <AlertTriangle className="w-6 h-6 text-amber-700 shrink-0" />
                    )}
                    {advisory.spraying_suitability === 'UNFAVORABLE' && (
                      <XCircle className="w-6 h-6 text-rose-700 shrink-0" />
                    )}
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">
                        Spray Window Advisory
                      </span>
                      <h3 className="font-black text-base sm:text-lg leading-tight">
                        {advisory.spraying_suitability}
                      </h3>
                    </div>
                  </div>

                  <span className="text-xs font-mono font-bold bg-white/90 px-2.5 py-1 rounded-xl border border-black/10 shadow-2xs">
                    {t('weather.deltaT')}: {advisory.delta_t_c}°C
                  </span>
                </div>

                <p className="text-xs sm:text-sm leading-relaxed text-slate-800">
                  {advisory.advisory_text_en}
                </p>

                {/* Practical Agronomic Field Guidance */}
                <div className="space-y-2 pt-2 border-t border-black/10 text-xs text-slate-800">
                  <p className="leading-relaxed">
                    <strong className="text-emerald-900 font-bold">💧 Irrigation Advice:</strong> {advisory.irrigation_advice_en}
                  </p>
                  <p className="leading-relaxed text-amber-950">
                    <strong className="text-amber-900 font-bold">🐝 Pollinator Protection:</strong> {advisory.pollinator_warning_en}
                  </p>
                </div>
              </div>

              {/* Mandatory Weather Model Disclaimer */}
              <div className="pt-2 border-t border-black/10 text-[11px] text-slate-500 italic flex items-start gap-1.5">
                <Info className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                <span>{advisory.disclaimer_en || t('weather.disclaimer')}</span>
              </div>
            </div>
          </div>

          {/* Legal Attribution (Open-Meteo CC BY 4.0) */}
          {attribution && (
            <div className="text-[11px] text-slate-400 text-right px-1">
              <span>{attribution.attribution_text}</span> • <span>{attribution.license}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
