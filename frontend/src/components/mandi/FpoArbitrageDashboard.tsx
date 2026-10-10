'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import {
  TrendingUp,
  Truck,
  Scale,
  Award,
  AlertCircle,
  Building,
  ArrowRight,
  Info,
  DollarSign
} from 'lucide-react';

interface MarketOption {
  id: string;
  name: string;
  district: string;
  distanceKm: number;
  baseModalPrice: number; // ₹/quintal
  marketType: 'Local Sub-Yard' | 'APMC Yard' | 'Terminal Market';
}

const REGIONAL_MARKETS: Record<string, MarketOption[]> = {
  'Tamil Nadu': [
    {
      id: 'm1',
      name: 'Thanjavur Regulated Market',
      district: 'Thanjavur',
      distanceKm: 12,
      baseModalPrice: 2280,
      marketType: 'Local Sub-Yard'
    },
    {
      id: 'm2',
      name: 'Kumbakonam APMC Yard',
      district: 'Thanjavur',
      distanceKm: 42,
      baseModalPrice: 2360,
      marketType: 'APMC Yard'
    },
    {
      id: 'm3',
      name: 'Tiruchirappalli Gandhi Market',
      district: 'Tiruchirappalli',
      distanceKm: 65,
      baseModalPrice: 2430,
      marketType: 'Terminal Market'
    },
    {
      id: 'm4',
      name: 'Madurai Central Grain Market',
      district: 'Madurai',
      distanceKm: 155,
      baseModalPrice: 2510,
      marketType: 'Terminal Market'
    }
  ],
  'Karnataka': [
    {
      id: 'k1',
      name: 'Dharwad APMC Sub-Yard',
      district: 'Dharwad',
      distanceKm: 15,
      baseModalPrice: 2320,
      marketType: 'Local Sub-Yard'
    },
    {
      id: 'k2',
      name: 'Hubballi Main APMC Yard',
      district: 'Dharwad',
      distanceKm: 28,
      baseModalPrice: 2410,
      marketType: 'APMC Yard'
    },
    {
      id: 'k3',
      name: 'Belagavi Central Market',
      district: 'Belagavi',
      distanceKm: 78,
      baseModalPrice: 2490,
      marketType: 'Terminal Market'
    }
  ]
};

export function FpoArbitrageDashboard() {
  const { t } = useLanguage();

  const [state, setState] = useState('Tamil Nadu');
  const [commodity, setCommodity] = useState('Paddy(Dhan)');
  const [lotQuantityQuintals, setLotQuantityQuintals] = useState<number>(50); // 50 quintals lot
  const [freightRatePerKmQuintal, setFreightRatePerKmQuintal] = useState<number>(1.5); // ₹1.5 per km per quintal

  const markets = REGIONAL_MARKETS[state] || REGIONAL_MARKETS['Tamil Nadu'];

  // Calculate net realization for each market
  const analyzedMarkets = markets.map(m => {
    const transportCostPerQuintal = Math.round(m.distanceKm * freightRatePerKmQuintal);
    const netPricePerQuintal = m.baseModalPrice - transportCostPerQuintal;
    const grossTotal = m.baseModalPrice * lotQuantityQuintals;
    const transportTotal = transportCostPerQuintal * lotQuantityQuintals;
    const netTotal = netPricePerQuintal * lotQuantityQuintals;

    return {
      ...m,
      transportCostPerQuintal,
      netPricePerQuintal,
      grossTotal,
      transportTotal,
      netTotal
    };
  });

  // Find optimal market with highest net total
  const optimalMarket = [...analyzedMarkets].sort((a, b) => b.netTotal - a.netTotal)[0];
  const baselineMarket = analyzedMarkets[0];
  const netAdvantage = optimalMarket.netTotal - baselineMarket.netTotal;

  return (
    <div className="space-y-6">
      {/* Header & Concept */}
      <div className="bg-gradient-to-r from-emerald-900 to-emerald-800 text-white rounded-2xl p-5 shadow-sm space-y-2">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-800/80 border border-emerald-500/30 text-emerald-200 text-xs font-semibold">
          <Scale className="w-3.5 h-3.5 text-emerald-300" />
          <span>National APMC Market Comparison</span>
        </div>
        <h2 className="text-lg sm:text-xl font-bold tracking-tight">
          Compare Mandi Prices & Transport Costs
        </h2>
        <p className="text-xs sm:text-sm text-emerald-100 max-w-2xl leading-relaxed">
          Compare real-time net price realization across regional mandis after deducting distance-based haulage costs. Never let high headline prices deceive you when long-distance freight eats into your margins.
        </p>
      </div>

      {/* Lot Parameters Control Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label htmlFor="lot-commodity" className="block text-xs font-bold text-slate-700 mb-1.5">
            Commodity
          </label>
          <select
            id="lot-commodity"
            value={commodity}
            onChange={(e) => setCommodity(e.target.value)}
            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
          >
            <option value="Paddy(Dhan)">Paddy (Rice / நெல்)</option>
            <option value="Maize">Maize (மக்காச்சோளம்)</option>
            <option value="Groundnut">Groundnut (நிலக்கடலை)</option>
            <option value="Cotton">Cotton (பருத்தி)</option>
            <option value="Soybean">Soybean (சோயாபீன்)</option>
          </select>
        </div>

        <div>
          <label htmlFor="lot-quantity" className="block text-xs font-bold text-slate-700 mb-1.5">
            Lot Size (Quintals)
          </label>
          <div className="relative flex items-center">
            <input
              id="lot-quantity"
              type="number"
              min={5}
              max={1000}
              step={5}
              value={lotQuantityQuintals}
              onChange={(e) => setLotQuantityQuintals(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
            <span className="absolute right-3 text-xs font-semibold text-slate-400">qtl</span>
          </div>
        </div>

        <div>
          <label htmlFor="freight-rate" className="block text-xs font-bold text-slate-700 mb-1.5">
            Haulage Rate (₹/km/qtl)
          </label>
          <div className="relative flex items-center">
            <input
              id="freight-rate"
              type="number"
              min={0.5}
              max={10}
              step={0.1}
              value={freightRatePerKmQuintal}
              onChange={(e) => setFreightRatePerKmQuintal(Math.max(0.1, parseFloat(e.target.value) || 0.1))}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
            <span className="absolute right-3 text-xs font-semibold text-slate-400">₹/km/qtl</span>
          </div>
        </div>
      </div>

      {/* Best Recommendation Highlight Banner */}
      {optimalMarket && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Award className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                <span>Optimal Realization Destination</span>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-700 text-white">
                  Max Net Lot Profit
                </span>
              </div>
              <div className="text-sm font-extrabold text-slate-900">
                {optimalMarket.name} ({optimalMarket.distanceKm} km)
              </div>
              <div className="text-xs text-slate-600">
                Net realized price: <strong className="text-emerald-800">₹{optimalMarket.netPricePerQuintal}/qtl</strong> after ₹{optimalMarket.transportCostPerQuintal}/qtl transport.
              </div>
            </div>
          </div>

          {netAdvantage > 0 ? (
            <div className="sm:text-right shrink-0 bg-white/80 border border-emerald-200 rounded-xl px-3 py-2">
              <div className="text-[11px] font-bold text-slate-500 uppercase">Extra Net Profit</div>
              <div className="text-sm font-black text-emerald-700">+₹{netAdvantage.toLocaleString('en-IN')}</div>
              <div className="text-[10px] text-slate-500">vs nearest local market</div>
            </div>
          ) : (
            <div className="text-xs text-slate-600 bg-white/80 border border-emerald-200 rounded-xl px-3 py-2">
              Nearest local mandi offers the highest net margin.
            </div>
          )}
        </div>
      )}

      {/* Comparative Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {analyzedMarkets.map((m) => {
          const isOptimal = m.id === optimalMarket?.id;
          const isBaseline = m.id === baselineMarket?.id;

          return (
            <div
              key={m.id}
              className={`rounded-2xl border p-4 sm:p-5 transition-all relative ${
                isOptimal
                  ? 'border-emerald-600 bg-white shadow-md ring-2 ring-emerald-600/20'
                  : 'border-slate-200 bg-white shadow-xs hover:border-slate-300'
              }`}
            >
              {isOptimal && (
                <div className="absolute top-3.5 right-3.5">
                  <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-700 text-white">
                    <Award className="w-3 h-3 text-amber-300" />
                    Recommended
                  </span>
                </div>
              )}

              <div className="space-y-3">
                {/* Market Title & Distance */}
                <div>
                  <div className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                    <Building className="w-3.5 h-3.5 text-slate-400" />
                    <span>{m.marketType} • {m.district}</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-0.5">
                    {m.name}
                  </h3>
                  <div className="flex items-center gap-1 text-xs text-slate-600 mt-1">
                    <Truck className="w-3.5 h-3.5 text-slate-500" />
                    <span>{m.distanceKm} km from farm gate</span>
                  </div>
                </div>

                {/* Pricing Metrics */}
                <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                  <div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase">Headline Modal</div>
                    <div className="text-xs font-bold text-slate-800 mt-0.5">₹{m.baseModalPrice}</div>
                    <div className="text-[10px] text-slate-400">/quintal</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-red-600 uppercase">Transport</div>
                    <div className="text-xs font-bold text-red-700 mt-0.5">-₹{m.transportCostPerQuintal}</div>
                    <div className="text-[10px] text-slate-400">/quintal</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-emerald-800 uppercase">Net Realized</div>
                    <div className="text-xs font-black text-emerald-700 mt-0.5">₹{m.netPricePerQuintal}</div>
                    <div className="text-[10px] text-slate-400">/quintal</div>
                  </div>
                </div>

                {/* Net Lot Realization */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <div className="text-slate-500 font-medium">Net Return ({lotQuantityQuintals} qtl lot):</div>
                    <div className="text-base font-extrabold text-slate-900">
                      ₹{m.netTotal.toLocaleString('en-IN')}
                    </div>
                  </div>

                  {!isBaseline && (
                    <div className="text-right">
                      <div className="text-[10px] font-semibold text-slate-500">Vs Local Mandi</div>
                      <div
                        className={`text-xs font-bold ${
                          m.netTotal >= baselineMarket.netTotal
                            ? 'text-emerald-700'
                            : 'text-red-600'
                        }`}
                      >
                        {m.netTotal >= baselineMarket.netTotal ? '+' : ''}
                        ₹{(m.netTotal - baselineMarket.netTotal).toLocaleString('en-IN')}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Farmers Collective Aggregation Benefit Card */}
      <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 leading-relaxed">
          <strong className="font-bold">Farmers Collective Aggregation Benefit:</strong> When smallholders pool 200+ quintals through an affiliated village collective or FPO, freight haulage rates drop by 25–35% through consolidated truckloads, increasing net realization by up to ₹40–60/quintal. Contact your local cooperative manager to coordinate harvest collection dates.
        </div>
      </div>
    </div>
  );
}
