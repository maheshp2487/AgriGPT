'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { ShieldCheck, Search, CheckCircle2, AlertTriangle, Building2, ExternalLink, Loader2, Sparkles, RefreshCw, Info } from 'lucide-react';

interface SchemeVerificationResult {
  success: boolean;
  scheme: string;
  status: string;
  gateway_mode: string;
  verified_at: string;
  details?: {
    beneficiary_name_masked: string;
    registration_id: string;
    state: string;
    district: string;
    ekyc_verified: boolean;
    aadhaar_seeded: boolean;
    land_records_verified: boolean;
    installment_count?: number;
    latest_installment_date?: string;
    latest_installment_status?: string;
    disbursement_amount?: number;
    rejection_reason?: string;
    additional_metadata?: Record<string, any>;
  };
  actionable_recommendations: string[];
  attribution: string;
}

const PRESET_TEST_IDS = [
  { id: 'TN-TH-1029485', label: 'Active PM-KISAN (18 Cycles)', scheme: 'PM_KISAN' },
  { id: 'TEST-PMKISAN-EKYC-PENDING', label: 'Pending eKYC (Needs Action)', scheme: 'PM_KISAN' },
  { id: 'SHC-2025-TN-9812', label: 'Soil Health Card (NPK Test)', scheme: 'SOIL_HEALTH_CARD' },
  { id: 'KCC-AP-09281', label: 'Kisan Credit Card (₹1.6 Lakh)', scheme: 'KISAN_CREDIT_CARD' },
];

export function SchemeVerificationCard() {
  const { profile } = useAuth();
  const { t } = useLanguage();
  const [scheme, setScheme] = useState('PM_KISAN');
  const [beneficiaryId, setBeneficiaryId] = useState('TN-TH-1029485');
  const [state, setState] = useState(profile?.state || 'Tamil Nadu');
  const [district, setDistrict] = useState(profile?.district || 'Thanjavur');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SchemeVerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/schemes/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scheme,
          beneficiary_id: beneficiaryId,
          state,
          district,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || data.title || 'Verification request failed');
      }
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Unable to connect to API Setu gateway.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ELIGIBLE_AND_ACTIVE':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
            Active & Eligible
          </span>
        );
      case 'PENDING_EKYC':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
            Action Required: eKYC Pending
          </span>
        );
      case 'PENDING_LAND_SEEDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
            Land Record Seeding Pending
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 bg-gradient-to-r from-emerald-800 to-teal-900 text-white">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-xl backdrop-blur-xs">
              <ShieldCheck className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-tight">API Setu Scheme Eligibility Gateway</h3>
              <p className="text-[11px] text-emerald-100/90 font-medium">
                National Data Exchange • Direct Benefit Transfer Verification
              </p>
            </div>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 text-[10px] font-bold uppercase tracking-wider shrink-0">
            Official Gateway
          </span>
        </div>
      </div>

      <div className="p-4 sm:p-5 space-y-4">
        {/* Sandbox Demonstration Notice (Strict Trust Transparency) */}
        <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-950 flex items-start gap-2 leading-relaxed">
          <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <p className="text-[11px] text-amber-900 font-medium">
            {t('schemes.sandboxNotice')}
          </p>
        </div>

        {/* Quick Presets with Sandbox Badge */}
        <div>
          <div className="flex items-center gap-1.5 mb-2 text-xs font-bold text-slate-700">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>{t('schemes.sandboxBadge')}:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {PRESET_TEST_IDS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  setScheme(preset.scheme);
                  setBeneficiaryId(preset.id);
                }}
                className={`touch-target text-xs px-3 py-1.5 rounded-xl border font-bold transition-all ${
                  beneficiaryId === preset.id
                    ? 'bg-emerald-50 border-emerald-600 text-emerald-950 shadow-2xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleVerify} className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Target Scheme</label>
            <select
              value={scheme}
              onChange={(e) => setScheme(e.target.value)}
              className="w-full h-11 text-xs font-semibold p-2.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden text-slate-800"
            >
              <option value="PM_KISAN">PM-KISAN (₹6,000 DBT)</option>
              <option value="SOIL_HEALTH_CARD">Soil Health Card</option>
              <option value="KISAN_CREDIT_CARD">Kisan Credit Card (KCC)</option>
              <option value="PMFBY">PMFBY Crop Insurance</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Beneficiary ID / Sample No</label>
            <input
              type="text"
              value={beneficiaryId}
              onChange={(e) => setBeneficiaryId(e.target.value)}
              placeholder="e.g. TN-TH-1029485"
              className="w-full h-11 text-xs font-semibold p-2.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden text-slate-800"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">State & District</label>
            <div className="flex gap-1.5">
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="State"
                className="w-1/2 h-11 text-xs font-semibold p-2.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden text-slate-800"
                required
              />
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="District"
                className="w-1/2 h-11 text-xs font-semibold p-2.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden text-slate-800"
                required
              />
            </div>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={loading}
              className="touch-target w-full h-11 flex items-center justify-center gap-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition-colors disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Querying Setu...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Verify Status</span>
                </>
              )}
            </button>
          </div>
        </form>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs font-medium flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Verification Result Card */}
        {result && (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 animate-in fade-in duration-200">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                {getStatusBadge(result.status)}
                <span className="text-[11px] font-semibold text-slate-600">
                  Mode: <strong className="text-slate-800">{result.gateway_mode}</strong>
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-medium">
                Verified: {new Date(result.verified_at).toLocaleDateString()}
              </span>
            </div>

            {result.details && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-white p-3 rounded-xl border border-slate-200/70 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 block uppercase">Farmer Name</span>
                  <span className="font-bold text-slate-900">{result.details.beneficiary_name_masked}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 block uppercase">Registration ID</span>
                  <span className="font-semibold text-slate-800">{result.details.registration_id}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 block uppercase">Mandatory Verifications</span>
                  <div className="flex items-center gap-2 pt-0.5 text-[11px]">
                    <span className={result.details.ekyc_verified ? 'text-emerald-700 font-bold' : 'text-amber-700 font-bold'}>
                      eKYC {result.details.ekyc_verified ? '✓' : '✗'}
                    </span>
                    <span>•</span>
                    <span className={result.details.aadhaar_seeded ? 'text-emerald-700 font-bold' : 'text-amber-700 font-bold'}>
                      Aadhaar {result.details.aadhaar_seeded ? '✓' : '✗'}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 block uppercase">
                    {result.scheme === 'PM_KISAN' ? 'DBT Installments' : 'Disbursement'}
                  </span>
                  <span className="font-bold text-emerald-800">
                    {result.details.installment_count
                      ? `${result.details.installment_count} Credited (₹${result.details.disbursement_amount || 2000})`
                      : result.details.disbursement_amount
                      ? `₹${result.details.disbursement_amount.toLocaleString('en-IN')}`
                      : 'Active'}
                  </span>
                </div>
              </div>
            )}

            {/* Scheme Metadata (e.g. Soil Nutrient Analysis) */}
            {result.details?.additional_metadata && Object.keys(result.details.additional_metadata).length > 0 && (
              <div className="bg-white p-3 rounded-xl border border-slate-200/70 text-xs">
                <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">Official Test Parameters</span>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {Object.entries(result.details.additional_metadata).map(([key, value]) => (
                    <div key={key} className="p-2 bg-slate-50 rounded-lg">
                      <span className="text-[10px] font-bold text-slate-500 capitalize block">{key.replace(/_/g, ' ')}</span>
                      <span className="font-semibold text-slate-800 text-[11px]">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actionable Recommendations */}
            {result.actionable_recommendations.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-800 block">Next Steps & Recommendations:</span>
                <ul className="space-y-1">
                  {result.actionable_recommendations.map((rec, i) => (
                    <li key={i} className="text-xs text-slate-700 flex items-start gap-1.5">
                      <span className="text-emerald-600 font-bold">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Statutory Attribution */}
            <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[10px] text-slate-500">
              <span>{result.attribution}</span>
              <a
                href="https://apisetu.gov.in"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-emerald-800 font-semibold hover:underline"
              >
                <span>apisetu.gov.in</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
