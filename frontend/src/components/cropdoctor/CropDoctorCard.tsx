'use client';

import React, { useState, useRef } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import {
  Camera,
  Upload,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  BookOpen,
  ExternalLink,
  Loader2,
  RefreshCw,
  Sprout,
  Info,
  X,
  FileImage
} from 'lucide-react';

interface DiagnosticResult {
  crop: string;
  detected_pest_disease: string;
  confidence: number;
  confidence_level: 'HIGH_CONFIDENCE' | 'MARGINAL_INDICATION' | 'INCONCLUSIVE';
  symptoms_observed: string[];
  cultural_management: string[];
  recommended_chemical?: string;
  dosage_per_hectare?: string;
  pre_harvest_interval_days?: number;
  cibrc_safety_status: string;
  citations: Array<{
    chunk_id: string;
    doc_title: string;
    institution: string;
    publication_year: number;
    source_url: string;
    section: string;
    crop: string;
  }>;
  advisory_text: string;
  mandatory_field_disclaimer: string;
}

interface CropDoctorCardProps {
  onClose?: () => void;
}

export function CropDoctorCard({ onClose }: CropDoctorCardProps) {
  const { t, locale } = useLanguage();

  const [selectedCrop, setSelectedCrop] = useState('paddy');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<DiagnosticResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const validateAndSetFile = (file: File) => {
    // 1. File Type Validation
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type) && !file.type.startsWith('image/')) {
      setError('Please upload a valid image file (JPEG, PNG, or WebP).');
      return;
    }

    // 2. File Size Validation (Max 5MB, Min 32 bytes)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image file size must be less than 5MB.');
      return;
    }
    if (file.size < 32) {
      setError('Uploaded image file appears to be empty or corrupted.');
      return;
    }

    setError(null);
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setResult(null);
  };

  const handleCameraChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndSetFile(file);
  };

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndSetFile(file);
  };

  const handleDiagnose = async () => {
    if (!imageFile) return;

    setIsAnalyzing(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', imageFile);
    formData.append('crop_hint', selectedCrop);
    formData.append('locale', locale);

    try {
      const response = await fetch('/api/crop-doctor/diagnose', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Diagnostic pipeline error');
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze crop image');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setImageFile(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
    if (cameraInputRef.current) cameraInputRef.current.value = '';
    if (galleryInputRef.current) galleryInputRef.current.value = '';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-6 space-y-5">
      {/* Header with Title & Action Controls */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center shadow-xs shrink-0">
              <Camera className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
              {t('cropdoctor.title')}
            </h2>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed max-w-xl">
            {t('cropdoctor.subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {result && (
            <button
              type="button"
              onClick={handleReset}
              className="touch-target text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{t('cropdoctor.newPhoto')}</span>
            </button>
          )}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label={t('cropdoctor.closeDoctor')}
              className="touch-target text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Methodological Transparency & Expert Consultation Disclaimer */}
      <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl text-xs text-emerald-950 flex items-start gap-2 leading-relaxed">
        <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
        <p className="text-[11px] text-emerald-900 font-medium">
          {t('cropdoctor.methodDisclaimer')}
        </p>
      </div>

      {/* Upload & Parameter Controls */}
      {!result && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Host Crop Selector */}
            <div>
              <label htmlFor="crop-select" className="block text-xs font-bold text-slate-700 mb-1.5">
                {t('cropdoctor.hostCrop')}
              </label>
              <select
                id="crop-select"
                value={selectedCrop}
                onChange={(e) => setSelectedCrop(e.target.value)}
                className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all"
              >
                <option value="paddy">Paddy (Rice / நெல் / धान)</option>
                <option value="maize">Maize (மக்காச்சோளம் / मक्का)</option>
                <option value="groundnut">Groundnut (நிலக்கடலை / मूंगफली)</option>
                <option value="cotton">Cotton (பருத்தி / कपास)</option>
                <option value="soybean">Soybean (சோயாபீன் / सोयाबीन)</option>
              </select>
            </div>

            {/* Photo Capture Controls: Camera & Gallery */}
            <div>
              <span className="block text-xs font-bold text-slate-700 mb-1.5">
                {t('cropdoctor.photoSource')}
              </span>
              <div className="grid grid-cols-2 gap-2">
                {/* Camera Capture Input (Mobile Hardware Camera) */}
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleCameraChange}
                  className="hidden"
                  id="leaf-camera-input"
                />
                <label
                  htmlFor="leaf-camera-input"
                  className="touch-target flex items-center justify-center gap-1.5 px-3 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl cursor-pointer transition-colors shadow-2xs"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span className="truncate">{t('cropdoctor.camera')}</span>
                </label>

                {/* Gallery File Input */}
                <input
                  ref={galleryInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleGalleryChange}
                  className="hidden"
                  id="leaf-gallery-input"
                />
                <label
                  htmlFor="leaf-gallery-input"
                  className="touch-target flex items-center justify-center gap-1.5 px-3 py-2.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold rounded-xl cursor-pointer transition-colors shadow-2xs"
                >
                  <Upload className="w-3.5 h-3.5 text-emerald-700" />
                  <span className="truncate">{t('cropdoctor.gallery')}</span>
                </label>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-400">
            Supported formats: JPEG, PNG, WebP (Max 5MB)
          </div>

          {/* Image Preview Card with File Details & Clear Action */}
          {previewUrl && imageFile && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-700">
                <div className="flex items-center gap-2 min-w-0">
                  <FileImage className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span className="font-semibold truncate">{imageFile.name}</span>
                  <span className="text-[11px] text-slate-400">({formatFileSize(imageFile.size)})</span>
                </div>
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs text-slate-500 hover:text-red-600 font-bold flex items-center gap-1 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>{t('cropdoctor.removePhoto')}</span>
                </button>
              </div>

              <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-900 max-h-56 flex items-center justify-center">
                <img
                  src={previewUrl}
                  alt="Selected crop leaf sample"
                  className="max-h-56 w-auto object-contain"
                />
              </div>
            </div>
          )}

          {/* Validation or API Error Banner */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Run Diagnostic Button */}
          {previewUrl && (
            <button
              type="button"
              onClick={handleDiagnose}
              disabled={isAnalyzing}
              className="touch-target w-full py-3.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t('cropdoctor.analyzing')}</span>
                </>
              ) : (
                <>
                  <Sprout className="w-4 h-4" />
                  <span>{t('cropdoctor.runDiagnosis')}</span>
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* Diagnostic Result Report (Audited & Grounded) */}
      {result && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Result Banner with Calibrated Confidence */}
          <div className="p-4 bg-emerald-50/90 border border-emerald-300 rounded-2xl space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-1.5">
              <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wide">
                Agronomic Symptom Heuristic Match
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-800 text-white">
                {result.confidence_level === 'HIGH_CONFIDENCE'
                  ? `${t('cropdoctor.highConfidence')} (${result.confidence})`
                  : `${t('cropdoctor.preliminaryIndication')} (${result.confidence})`}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-slate-900">
              {result.detected_pest_disease}
            </h3>
            <p className="text-xs text-slate-800 leading-relaxed">
              {result.advisory_text}
            </p>
          </div>

          {/* Symptoms Observed */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Observed Visual Symptoms
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-700">
              {result.symptoms_observed.map((sym, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{sym}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Cultural & Agro-Ecological Management (Do This First) */}
          <div className="space-y-2 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              1. {t('cropdoctor.culturalTitle')}
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-700">
              {result.cultural_management.map((cult, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-emerald-700 font-bold">•</span>
                  <span>{cult}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Chemical Management with Strict CIBRC Safety & PHI */}
          {result.recommended_chemical && (
            <div className="space-y-2 p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wide">
                  2. {t('cropdoctor.chemicalTitle')}
                </h4>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                  <ShieldCheck className="w-3 h-3 text-emerald-700" />
                  {t('cropdoctor.cibrcSafe')}
                </span>
              </div>
              <div className="text-xs text-slate-800 space-y-1">
                <div>
                  <strong>Recommended Active:</strong> {result.recommended_chemical}
                </div>
                <div>
                  <strong>Approved Dosage:</strong> {result.dosage_per_hectare}
                </div>
                {result.pre_harvest_interval_days && (
                  <div className="text-amber-900 font-semibold">
                    <strong>{t('cropdoctor.phi')}:</strong> {result.pre_harvest_interval_days} days wait before harvest.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Citations Drawer */}
          {result.citations.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
                <span>{t('cropdoctor.citationsTitle')}</span>
              </div>
              {result.citations.map((c) => (
                <div key={c.chunk_id} className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-800">{c.doc_title}</div>
                  <div className="text-[11px] text-slate-500">{c.institution} ({c.publication_year})</div>
                  {c.source_url && (
                    <a
                      href={c.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold hover:underline"
                    >
                      <span>View Official ICAR Source Guide</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Mandatory On-Site Disclaimer */}
          <div className="p-3 bg-slate-100 rounded-xl text-[11px] text-slate-600 flex items-start gap-2">
            <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <p>{result.mandatory_field_disclaimer}</p>
          </div>
        </div>
      )}
    </div>
  );
}
