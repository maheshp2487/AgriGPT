'use client';

import React, { useState, useEffect } from 'react';
import { useAuth, FarmerProfile } from '@/context/AuthContext';
import { X, User, MapPin, Sprout, Building, LogOut, Check, Loader2 } from 'lucide-react';

const CROPS_OPTIONS = [
  { id: 'paddy', label: 'Paddy (Rice / நெல் / धान)' },
  { id: 'maize', label: 'Maize (Corn / மக்காச்சோளம் / मक्का)' },
  { id: 'groundnut', label: 'Groundnut (நிலக்கடலை / मूंगफली)' },
  { id: 'cotton', label: 'Cotton (பருத்தி / कपास)' },
  { id: 'soybean', label: 'Soybean (சோயாபீன் / सोयाबीन)' }
];

export function ProfileDrawer() {
  const { profile, user, isProfileDrawerOpen, closeProfileDrawer, updateProfile, logout } = useAuth();

  const [fullName, setFullName] = useState('');
  const [state, setState] = useState('Tamil Nadu');
  const [district, setDistrict] = useState('Thanjavur');
  const [landArea, setLandArea] = useState('2.5');
  const [selectedCrops, setSelectedCrops] = useState<string[]>(['paddy']);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName || '');
      setState(profile.state || 'Tamil Nadu');
      setDistrict(profile.district || 'Thanjavur');
      setLandArea(profile.landAreaAcres ? String(profile.landAreaAcres) : '2.5');
      setSelectedCrops(profile.cropsGrown || ['paddy']);
    }
  }, [profile]);

  if (!isProfileDrawerOpen) return null;

  const toggleCrop = (cropId: string) => {
    setSelectedCrops(prev =>
      prev.includes(cropId) ? prev.filter(c => c !== cropId) : [...prev, cropId]
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);
    try {
      await updateProfile({
        fullName,
        state,
        district,
        landAreaAcres: parseFloat(landArea) || 2.5,
        cropsGrown: selectedCrops
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch {
      // Handle error
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-drawer-title"
      className="fixed inset-0 z-50 flex justify-end bg-emerald-950/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="w-full max-w-md h-full bg-white shadow-2xl flex flex-col overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-emerald-800 text-white shrink-0">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-emerald-200" />
            <h2 id="profile-drawer-title" className="text-base font-bold">
              Farmer Profile & Landholding
            </h2>
          </div>
          <button
            onClick={closeProfileDrawer}
            className="p-1 rounded-lg text-emerald-100 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close profile drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSave} className="p-6 space-y-6 flex-1">
          {/* User Status Card */}
          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-800">Verified Member</span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-700 text-white uppercase">
                {user?.role || 'Farmer'}
              </span>
            </div>
            <div className="text-sm font-bold text-slate-900">
              {user?.phoneNumber || '+91 98401 23456'}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <Building className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <span>{profile?.fpoName || 'Thanjavur Farmers Cooperative'}</span>
            </div>
          </div>

          {savedSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Profile updated successfully!</span>
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label htmlFor="farmer-name" className="block text-xs font-bold text-slate-700 mb-1">
                Full Name
              </label>
              <input
                id="farmer-name"
                type="text"
                placeholder="e.g. Murugan R"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="farmer-state" className="block text-xs font-bold text-slate-700 mb-1">
                  State
                </label>
                <input
                  id="farmer-state"
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all"
                />
              </div>
              <div>
                <label htmlFor="farmer-district" className="block text-xs font-bold text-slate-700 mb-1">
                  District
                </label>
                <input
                  id="farmer-district"
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor="land-area" className="block text-xs font-bold text-slate-700 mb-1">
                Landholding Size (Acres)
              </label>
              <input
                id="land-area"
                type="number"
                step="0.1"
                min="0.1"
                max="500"
                value={landArea}
                onChange={(e) => setLandArea(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Crops Cultivated
              </label>
              <div className="space-y-2">
                {CROPS_OPTIONS.map((c) => {
                  const isChecked = selectedCrops.includes(c.id);
                  return (
                    <button
                      type="button"
                      key={c.id}
                      onClick={() => toggleCrop(c.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl border text-left text-xs font-semibold transition-all ${
                        isChecked
                          ? 'border-emerald-600 bg-emerald-50/70 text-emerald-900'
                          : 'border-slate-200 bg-slate-50/60 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span>{c.label}</span>
                      {isChecked && <Check className="w-4 h-4 text-emerald-700 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-200 space-y-3">
            <button
              type="submit"
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-md transition-colors"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Profile Changes'}
            </button>

            <button
              type="button"
              onClick={async () => {
                await logout();
                closeProfileDrawer();
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 font-semibold rounded-xl text-xs transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </div>

          {/* DPDP Act 2023 Statutory Privacy Controls */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">DPDP Act 2023 Privacy Rights</span>
              <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">Section 11 & 12</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Under India’s Digital Personal Data Protection Act, you have the right to access your stored records or withdraw consent and erase your profile.
            </p>
            <div className="flex gap-2 pt-1">
              <a
                href="/api/auth/export-data"
                download="agrigpt_farmer_data.json"
                className="flex-1 py-2 px-3 text-center bg-white border border-slate-200 hover:border-emerald-500 text-slate-700 hover:text-emerald-800 rounded-lg text-xs font-semibold shadow-xs transition-colors"
              >
                Export My Data
              </a>
              <button
                type="button"
                onClick={async () => {
                  if (confirm("Are you sure you want to permanently erase your profile and withdraw consent under DPDP Act 2023?")) {
                    await fetch("/api/auth/delete-account", { method: "DELETE" });
                    await logout();
                    closeProfileDrawer();
                  }
                }}
                className="flex-1 py-2 px-3 bg-red-50 border border-red-200 hover:bg-red-100 text-red-700 rounded-lg text-xs font-semibold shadow-xs transition-colors"
              >
                Erase Account
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
