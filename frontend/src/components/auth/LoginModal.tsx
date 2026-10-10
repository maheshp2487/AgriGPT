'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { X, Phone, Mail, KeyRound, Loader2, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';

export function LoginModal() {
  const { isLoginModalOpen, closeLoginModal, sendOtp, verifyOtp, loginWithEmail } = useAuth();
  const { t } = useLanguage();

  const [authMode, setAuthMode] = useState<'phone' | 'email'>('phone');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'input' | 'otp'>('input');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [devOtpNotice, setDevOtpNotice] = useState<string | null>(null);

  if (!isLoginModalOpen) return null;

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await sendOtp(phone);
      if (res.testOtp) {
        setDevOtpNotice(`Dev OTP: ${res.testOtp}`);
        setOtp(res.testOtp);
      }
      setStep('otp');
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await verifyOtp(phone, otp);
      handleReset();
    } catch (err: any) {
      setError(err.message || 'Invalid OTP code');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await loginWithEmail(email);
      handleReset();
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with email');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setError(null);
    setStep('input');
    setPhone('');
    setEmail('');
    setOtp('');
    setDevOtpNotice(null);
  };

  const handleClose = () => {
    handleReset();
    closeLoginModal();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        {/* Header with Fresh Nature Green Accent */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#2e7d32] to-[#388e3c] text-white">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-100" />
            <h2 id="login-modal-title" className="text-base font-bold">
              {step === 'otp' ? 'Verify Mobile OTP' : 'Sign In to AgriGPT'}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-lg text-emerald-100 hover:text-white hover:bg-white/15 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Method Selection Tabs */}
          {step === 'input' && (
            <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl gap-1">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('phone');
                  setError(null);
                }}
                className={`py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  authMode === 'phone'
                    ? 'bg-white text-[#2e7d32] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Mobile OTP</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('email');
                  setError(null);
                }}
                className={`py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  authMode === 'email'
                    ? 'bg-white text-[#2e7d32] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Email Address</span>
              </button>
            </div>
          )}

          <div className="text-xs text-slate-500">
            {step === 'otp' ? (
              <p>Enter the 6-digit code sent to <span className="font-semibold text-slate-800">+91 {phone}</span>.</p>
            ) : authMode === 'phone' ? (
              <p>Sign in using your 10-digit mobile number for personalized mandi rates, weather alerts, and crop recommendations.</p>
            ) : (
              <p>Sign in using your email address to access your farmer workspace and saved advisories.</p>
            )}
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
              {error}
            </div>
          )}

          {devOtpNotice && (
            <div className="p-2.5 bg-[#edf7ed] border border-[#c8e6c9] rounded-xl text-xs text-[#2e7d32] font-semibold flex items-center justify-between">
              <span>{devOtpNotice} (Auto-filled)</span>
              <CheckCircle2 className="w-4 h-4 text-[#2e7d32]" />
            </div>
          )}

          {step === 'otp' ? (
            /* OTP Verification Form */
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label htmlFor="otp-input" className="block text-xs font-bold text-slate-700 mb-1.5">
                  6-Digit OTP Code
                </label>
                <div className="relative flex items-center">
                  <input
                    id="otp-input"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    required
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-center text-lg tracking-widest font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2e7d32] focus:bg-white transition-all"
                  />
                  <KeyRound className="absolute right-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || otp.length < 4}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#2e7d32] hover:bg-[#1b5e20] text-white font-bold rounded-xl shadow-xs disabled:opacity-50 transition-colors"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify & Continue'}
              </button>

              <button
                type="button"
                onClick={() => setStep('input')}
                className="w-full text-center text-xs text-slate-500 hover:text-slate-800 font-semibold"
              >
                ← Change mobile number
              </button>
            </form>
          ) : authMode === 'phone' ? (
            /* Mobile Phone Number Form */
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label htmlFor="phone-input" className="block text-xs font-bold text-slate-700 mb-1.5">
                  Mobile Number (10 digits)
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-xs font-semibold text-slate-500">
                    +91
                  </span>
                  <input
                    id="phone-input"
                    type="tel"
                    inputMode="numeric"
                    required
                    placeholder="9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2e7d32] focus:bg-white transition-all"
                  />
                  <Phone className="absolute right-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || phone.length < 10}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#2e7d32] hover:bg-[#1b5e20] text-white font-bold rounded-xl shadow-xs disabled:opacity-50 transition-colors"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send OTP Code'}
              </button>
            </form>
          ) : (
            /* Email Address Form */
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <label htmlFor="email-input" className="block text-xs font-bold text-slate-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative flex items-center">
                  <input
                    id="email-input"
                    type="email"
                    required
                    placeholder="farmer@agrigpt.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-3.5 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2e7d32] focus:bg-white transition-all"
                  />
                  <Mail className="absolute right-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Demo quick accounts for instant testing */}
              <div className="pt-1">
                <span className="text-[11px] text-slate-400 font-medium block mb-1.5">Quick fill test email:</span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => setEmail('farmer.tamilnadu@agrigpt.in')}
                    className="text-[11px] px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-medium"
                  >
                    farmer.tamilnadu@agrigpt.in
                  </button>
                  <button
                    type="button"
                    onClick={() => setEmail('ramesh.patel@agrigpt.in')}
                    className="text-[11px] px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-medium"
                  >
                    ramesh.patel@agrigpt.in
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !email.includes('@')}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#2e7d32] hover:bg-[#1b5e20] text-white font-bold rounded-xl shadow-xs disabled:opacity-50 transition-colors"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                  <>
                    <span>Continue with Email</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
