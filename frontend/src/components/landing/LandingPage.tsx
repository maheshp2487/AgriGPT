'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import {
  Sprout,
  Send,
  Mic,
  Camera,
  TrendingUp,
  CloudSunRain,
  FileText,
  Layers,
  Sparkles,
  ShieldCheck,
  PhoneCall,
  CheckCircle2,
  ArrowRight,
  HelpCircle,
  Clock,
  ExternalLink,
  MessageSquare,
  Compass,
  Search
} from 'lucide-react';

interface LandingPageProps {
  onNavigateTab: (tabId: string) => void;
  onAskQuery: (query: string, crop?: string) => void;
  onOpenCropDoctor: () => void;
  onOpenNotifications: () => void;
}

export function LandingPage({
  onNavigateTab,
  onAskQuery,
  onOpenCropDoctor,
  onOpenNotifications
}: LandingPageProps) {
  const { t, locale } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [landingCrop, setLandingCrop] = useState('paddy');
  const [landingStage, setLandingStage] = useState('vegetative');
  const [landingIssue, setLandingIssue] = useState('pest');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onAskQuery(searchQuery.trim());
    } else {
      onNavigateTab('chat');
    }
  };

  // Quick farmer prompt pills matching the Agri Universe
  const promptPills = [
    {
      label: locale === 'ta' ? 'தக்காளி இலைச்சுருட்டு மருந்து' : locale === 'hi' ? 'टमाटर पत्ती मरोड़ का उपचार' : 'Tomato leaf curl remedy',
      query: locale === 'ta' ? 'தக்காளி இலைச்சுருட்டு நோய் மற்றும் காய்ப்புழு கட்டுப்பாடு என்ன?' : locale === 'hi' ? 'टमाटर में पत्ती मरोड़ रोग का उपचार क्या है?' : 'What is the treatment for tomato leaf curl disease?',
      crop: 'tomato'
    },
    {
      label: locale === 'ta' ? 'இன்றைய நெல் மண்டி விலை' : locale === 'hi' ? 'आज का गेहूं व धान मंडी भाव' : 'Today’s Mandi rate for Wheat & Paddy',
      query: locale === 'ta' ? 'இன்றைய நெல் மற்றும் மக்காச்சோளம் மண்டி விலை நிலவரம் என்ன?' : locale === 'hi' ? 'आज का गेहूं और धान का मंडी थोक भाव क्या है?' : 'What are today’s mandi wholesale prices for wheat and paddy?',
      crop: 'paddy'
    },
    {
      label: locale === 'ta' ? 'நாளை மருந்து தெளிக்கலாமா?' : locale === 'hi' ? 'कल दवा छिड़काव का सही समय' : 'Can I spray pesticide tomorrow?',
      query: locale === 'ta' ? 'நாளை காலை பூச்சிக்கொல்லி மருந்து தெளிக்க வானிலை சாதகமாக உள்ளதா?' : locale === 'hi' ? 'क्या कल सुबह कीटनाशक छिड़काव के लिए मौसम अनुकूल है?' : 'Is tomorrow morning favorable for pesticide spraying in my district?'
    },
    {
      label: locale === 'ta' ? 'பி.எம் கிசான் ₹2,000 தவணை' : locale === 'hi' ? 'पीएम-किसान ₹2,000 किस्त स्थिति' : 'PM-KISAN ₹2,000 installment date',
      query: locale === 'ta' ? 'பி.எம் கிசான் 19-வது தவணை பணம் எப்போது வரும்? e-KYC செய்வது எப்படி?' : locale === 'hi' ? 'पीएम-किसान की 19वीं किस्त कब आएगी और e-KYC कैसे करें?' : 'When will the 19th PM-KISAN installment be released and how to complete e-KYC?'
    },
    {
      label: locale === 'ta' ? 'இயற்கை ஜீவாமிர்தம் தயாரிப்பு' : locale === 'hi' ? 'प्राकृतिक जीवामृत बनाने की विधि' : 'Jeevamrutha fertilizer recipe',
      query: locale === 'ta' ? 'திரவ ஜீவாமிர்தம் தயாரிக்கும் முறை மற்றும் பயன்பாடு என்ன?' : locale === 'hi' ? 'प्राकृतिक खेती के लिए जीवामृत बनाने की विधि क्या है?' : 'How to prepare Jeevamrutha organic biofertilizer step by step?'
    }
  ];

  const getCrops = () => {
    switch (locale) {
      case 'ta':
        return [
          { id: 'paddy', name: 'நெல் (Paddy)', icon: '🌾' },
          { id: 'tomato', name: 'தக்காளி (Tomato)', icon: '🍅' },
          { id: 'cotton', name: 'பருத்தி (Cotton)', icon: '☁️' },
          { id: 'maize', name: 'மக்காச்சோளம் (Maize)', icon: '🌽' },
          { id: 'chilli', name: 'மிளகாய் (Chilli)', icon: '🌶️' },
          { id: 'groundnut', name: 'நிலக்கடலை (Groundnut)', icon: '🥜' },
        ];
      case 'hi':
        return [
          { id: 'paddy', name: 'धान (Paddy)', icon: '🌾' },
          { id: 'wheat', name: 'गेहूं (Wheat)', icon: '🌾' },
          { id: 'tomato', name: 'टमाटर (Tomato)', icon: '🍅' },
          { id: 'cotton', name: 'कपास (Cotton)', icon: '☁️' },
          { id: 'maize', name: 'मक्का (Maize)', icon: '🌽' },
          { id: 'chilli', name: 'मिर्च (Chilli)', icon: '🌶️' },
        ];
      default:
        return [
          { id: 'paddy', name: 'Paddy / Rice', icon: '🌾' },
          { id: 'tomato', name: 'Tomato', icon: '🍅' },
          { id: 'cotton', name: 'Cotton', icon: '☁️' },
          { id: 'wheat', name: 'Wheat', icon: '🌾' },
          { id: 'maize', name: 'Maize / Corn', icon: '🌽' },
          { id: 'chilli', name: 'Chilli', icon: '🌶️' },
        ];
    }
  };

  const getStages = () => {
    switch (locale) {
      case 'ta':
        return [
          { id: 'seedling', name: 'நாற்று / முளைப்பு (0-25 நாள்)', icon: '🌱' },
          { id: 'vegetative', name: 'வளர்ச்சி / தூர்கட்டும் நிலை (25-50 நாள்)', icon: '🌿' },
          { id: 'flowering', name: 'பூக்கும் / காய் நிலை (50-80 நாள்)', icon: '🌸' },
          { id: 'harvest', name: 'முதிர்ச்சி / அறுவடை நிலை', icon: '🌾' },
        ];
      case 'hi':
        return [
          { id: 'seedling', name: 'अंकुरण / नर्सरी (0-25 दिन)', icon: '🌱' },
          { id: 'vegetative', name: 'वानस्पतिक वृद्धि / कल्ले (25-50 दिन)', icon: '🌿' },
          { id: 'flowering', name: 'फूल व फल अवस्था (50-80 दिन)', icon: '🌸' },
          { id: 'harvest', name: 'परिपक्वता व कटाई अवस्था', icon: '🌾' },
        ];
      default:
        return [
          { id: 'seedling', name: 'Seedling / Nursery (0-25 days)', icon: '🌱' },
          { id: 'vegetative', name: 'Vegetative Growth (25-50 days)', icon: '🌿' },
          { id: 'flowering', name: 'Flowering & Fruiting (50-80 days)', icon: '🌸' },
          { id: 'harvest', name: 'Maturation & Harvest', icon: '🌾' },
        ];
    }
  };

  const getIssues = () => {
    switch (locale) {
      case 'ta':
        return [
          { id: 'pest', name: 'பூச்சி / புழு தாக்குதல்', icon: '🐛' },
          { id: 'disease', name: 'இலை மஞ்சள் / புள்ளி நோய்', icon: '🍂' },
          { id: 'fertilizer', name: 'NPK உர அளவு & சத்து மேலாண்மை', icon: '💧' },
          { id: 'spray', name: 'மருந்து தெளிக்கும் வானிலை & காற்று', icon: '🌦️' },
          { id: 'mandi', name: 'இன்றைய மண்டி மொத்த விற்பனை விலை', icon: '💰' },
        ];
      case 'hi':
        return [
          { id: 'pest', name: 'कीट / सुंडी / तना छेदक प्रकोप', icon: '🐛' },
          { id: 'disease', name: 'पत्ती पीली पड़ना / फफूंद व झुलसा', icon: '🍂' },
          { id: 'fertilizer', name: 'संतुलित NPK खाद व पोषक तत्व', icon: '💧' },
          { id: 'spray', name: 'कीटनाशक छिड़काव मौसम जांच', icon: '🌦️' },
          { id: 'mandi', name: 'आज का थोक मंडी भाव', icon: '💰' },
        ];
      default:
        return [
          { id: 'pest', name: 'Insect Pest or Borer Attack', icon: '🐛' },
          { id: 'disease', name: 'Leaf Spots, Blight or Yellowing', icon: '🍂' },
          { id: 'fertilizer', name: 'NPK Fertilizer & Soil Nutrition', icon: '💧' },
          { id: 'spray', name: 'Safe Spray Weather & Rain Window', icon: '🌦️' },
          { id: 'mandi', name: 'Today’s Mandi Market Price', icon: '💰' },
        ];
    }
  };

  const handleLaunchGuidedWizard = () => {
    const crops = getCrops();
    const stages = getStages();
    const issues = getIssues();

    const selectedCropObj = crops.find((c) => c.id === landingCrop) || crops[0];
    const selectedStageObj = stages.find((s) => s.id === landingStage) || stages[0];
    const selectedIssueObj = issues.find((i) => i.id === landingIssue) || issues[0];

    let queryText = '';
    if (locale === 'ta') {
      queryText = `${selectedCropObj.name} பயிரில் ${selectedStageObj.name}யில் ${selectedIssueObj.name} உள்ளது. அதிகாரப்பூர்வ ICAR பரிந்துரை, அனுமதிக்கப்பட்ட மருந்து அளவு மற்றும் இயற்கை வழிமுறை என்ன?`;
    } else if (locale === 'hi') {
      queryText = `${selectedCropObj.name} फसल में ${selectedStageObj.name} में ${selectedIssueObj.name} की समस्या है। आधिकारिक ICAR पैकेज ऑफ प्रैक्टिसेज, अनुमोदित कीटनाशक मात्रा और जैविक उपचार क्या है?`;
    } else {
      queryText = `For ${selectedCropObj.name} at ${selectedStageObj.name}, facing ${selectedIssueObj.name}. What is the recommended ICAR package of practices, approved safe chemical dosage with PHI, and organic alternatives?`;
    }

    onAskQuery(queryText, landingCrop);
  };

  const services = [
    {
      id: 'doctor',
      title: t('landing.serviceDoctorTitle'),
      desc: t('landing.serviceDoctorDesc'),
      actionText: t('landing.serviceDoctorAction'),
      icon: Camera,
      badge: 'ICAR Heuristics',
      onClick: onOpenCropDoctor
    },
    {
      id: 'mandi',
      title: t('landing.serviceMandiTitle'),
      desc: t('landing.serviceMandiDesc'),
      actionText: t('landing.serviceMandiAction'),
      icon: TrendingUp,
      badge: 'agmarknet.gov.in',
      onClick: () => onNavigateTab('mandi')
    },
    {
      id: 'weather',
      title: t('landing.serviceWeatherTitle'),
      desc: t('landing.serviceWeatherDesc'),
      actionText: t('landing.serviceWeatherAction'),
      icon: CloudSunRain,
      badge: 'Delta T & Rain Radar',
      onClick: () => onNavigateTab('weather')
    },
    {
      id: 'schemes',
      title: t('landing.serviceSchemesTitle'),
      desc: t('landing.serviceSchemesDesc'),
      actionText: t('landing.serviceSchemesAction'),
      icon: FileText,
      badge: 'PM-KISAN & PMFBY',
      onClick: () => onNavigateTab('schemes')
    },
    {
      id: 'soil',
      title: t('landing.serviceSoilTitle'),
      desc: t('landing.serviceSoilDesc'),
      actionText: t('landing.serviceSoilAction'),
      icon: Layers,
      badge: '12 SHC Parameters',
      onClick: () => onAskQuery('How to balance NPK fertilizer ratio based on Soil Health Card?', 'soil')
    },
    {
      id: 'organic',
      title: t('landing.serviceOrganicTitle'),
      desc: t('landing.serviceOrganicDesc'),
      actionText: t('landing.serviceOrganicAction'),
      icon: Sprout,
      badge: 'NCONF Certified Guides',
      onClick: () => onAskQuery('Step-by-step preparation of Jeevamrutha and Panchagavya organic inputs')
    }
  ];

  return (
    <div className="space-y-12 sm:space-y-16 animate-in fade-in duration-200">
      {/* =========================================================================
          SECTION 1: HERO SECTION WITH LIGHT, FRESH NATURE-GREEN CORPORATE AESTHETICS
         ========================================================================= */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#f2f9f3] via-[#fafdfa] to-white border border-[#c8e6c9]/70 shadow-xs p-6 sm:p-10 lg:p-14 space-y-8">
        {/* Live Agricultural Ticker Bar */}
        <div className="flex items-center justify-between gap-3 px-3.5 py-2 rounded-xl bg-white/90 backdrop-blur-xs border border-[#c8e6c9] text-xs shadow-2xs">
          <div className="flex items-center gap-2 font-bold text-[#2e7d32] shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2e7d32] animate-pulse" />
            <span className="uppercase tracking-wider text-[11px] font-bold">{t('landing.tickerTitle')}</span>
          </div>
          <div className="overflow-hidden whitespace-nowrap text-[11px] sm:text-xs text-slate-600 flex-1">
            <div className="inline-block animate-marquee space-x-6">
              <span>{t('landing.ticker1')}</span>
              <span>•</span>
              <span>{t('landing.ticker2')}</span>
              <span>•</span>
              <span>{t('landing.ticker3')}</span>
              <span>•</span>
              <span>{t('landing.ticker4')}</span>
            </div>
          </div>
          <button
            onClick={onOpenNotifications}
            className="text-[11px] font-bold text-[#2e7d32] hover:text-[#1b5e20] shrink-0 hover:underline px-1.5"
          >
            View Alerts →
          </button>
        </div>

        {/* Hero Headline & Value Proposition */}
        <div className="space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#edf7ed] border border-[#c8e6c9] text-[#2e7d32] text-xs font-bold">
            <ShieldCheck className="w-3.5 h-3.5 text-[#2e7d32]" />
            <span>{t('landing.heroTag')}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
            {t('landing.heroTitle')}
          </h1>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal max-w-2xl">
            {t('landing.heroSubtitle')}
          </p>
        </div>

        {/* Prominent Farmer Instant Ask Search Bar */}
        <div className="max-w-2xl space-y-4">
          <form
            onSubmit={handleSearchSubmit}
            className="bg-white rounded-2xl p-2 sm:p-2.5 shadow-md flex items-center gap-2 border border-slate-200 focus-within:border-[#2e7d32] focus-within:ring-2 focus-within:ring-[#edf7ed] transition-all"
          >
            <div className="pl-2 text-slate-400">
              <Search className="w-5 h-5 text-slate-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('landing.askPlaceholder')}
              className="flex-1 bg-transparent px-2 py-2 text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm font-medium focus:outline-none min-w-0"
            />

            <div className="flex items-center gap-1.5 shrink-0">
              {/* Photo Scan Quick Button */}
              <button
                type="button"
                onClick={onOpenCropDoctor}
                title="Scan crop leaf photo for disease"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-100 hover:bg-[#edf7ed] text-[#2e7d32] flex items-center justify-center transition-colors border border-slate-200"
              >
                <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-[#2e7d32]" />
              </button>

              {/* Submit / Ask Button */}
              <button
                type="submit"
                className="touch-target px-4 sm:px-5 py-2.5 bg-[#2e7d32] hover:bg-[#1b5e20] text-white font-bold text-xs sm:text-sm rounded-xl flex items-center gap-2 transition-all shadow-xs active:scale-95"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span className="hidden sm:inline">{t('landing.askButton')}</span>
                <span className="sm:hidden">Ask</span>
              </button>
            </div>
          </form>

          {/* Quick Farmer Question Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-[11px] font-bold text-[#2e7d32] shrink-0">
              Popular:
            </span>
            {promptPills.map((pill, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onAskQuery(pill.query, pill.crop)}
                className="touch-target flex-shrink-0 text-xs px-3.5 py-1.5 rounded-full bg-white hover:bg-[#edf7ed] text-slate-700 hover:text-[#2e7d32] border border-slate-200 hover:border-[#c8e6c9] font-medium transition-colors shadow-2xs"
              >
                {pill.label}
              </button>
            ))}
          </div>

          {/* Hero Call to Action Buttons */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigateTab('chat')}
              className="touch-target px-6 py-3.5 bg-[#2e7d32] hover:bg-[#1b5e20] text-white font-bold text-sm rounded-xl flex items-center gap-2 shadow-sm transition-all hover:scale-[1.02] active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Start Farm Advisory (Free) →</span>
            </button>

            <button
              type="button"
              onClick={onOpenCropDoctor}
              className="touch-target px-5 py-3.5 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm rounded-xl border border-slate-300 flex items-center gap-2 shadow-2xs transition-all hover:scale-[1.02] active:scale-95"
            >
              <Camera className="w-4 h-4 text-[#2e7d32]" />
              <span>Crop Doctor (Leaf Scanner)</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigateTab('mandi')}
              className="touch-target px-5 py-3.5 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm rounded-xl border border-slate-300 flex items-center gap-2 shadow-2xs transition-all hover:scale-[1.02] active:scale-95"
            >
              <TrendingUp className="w-4 h-4 text-[#2e7d32]" />
              <span>Mandi APMC Rates</span>
            </button>
          </div>
        </div>

        {/* Live Trust Metrics Bar */}
        <div className="pt-6 border-t border-slate-200/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-3 bg-white/70 rounded-xl border border-slate-200/60 space-y-0.5">
            <div className="text-xl font-extrabold text-[#2e7d32]">2,400+</div>
            <div className="text-[11px] font-medium text-slate-600">APMC Mandis Connected</div>
          </div>
          <div className="p-3 bg-white/70 rounded-xl border border-slate-200/60 space-y-0.5">
            <div className="text-xl font-extrabold text-[#2e7d32]">50+ Crops</div>
            <div className="text-[11px] font-medium text-slate-600">ICAR Grounded Agronomy</div>
          </div>
          <div className="p-3 bg-white/70 rounded-xl border border-slate-200/60 space-y-0.5">
            <div className="text-xl font-extrabold text-[#2e7d32]">6 Languages</div>
            <div className="text-[11px] font-medium text-slate-600">Full Vernacular Support</div>
          </div>
          <div className="p-3 bg-white/70 rounded-xl border border-slate-200/60 space-y-0.5">
            <div className="text-xl font-extrabold text-[#2e7d32]">100% Safe</div>
            <div className="text-[11px] font-medium text-slate-600">CIBRC Statutory Guardrails</div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: EMBEDDED FARMER PROBLEM SOLVER (3-STEP GUIDED WORKFLOW)
         ========================================================================= */}
      <section className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-xs space-y-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2e7d32] bg-[#edf7ed] px-3 py-1 rounded-full border border-[#c8e6c9]">
            <Compass className="w-3.5 h-3.5 text-[#2e7d32]" />
            <span>Interactive Field Diagnostic</span>
          </div>
          <h2 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {locale === 'ta' ? 'உடனடி பயிர் பிரச்சனை தீர்வு (3 எளிய படிகள்)' : locale === 'hi' ? 'त्वरित किसान समस्या समाधान (3 आसान चरण)' : 'Instant Field Problem Solver (3 Steps)'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
            {locale === 'ta' ? 'பயிர், அதன் வளர்ச்சி பருவம் மற்றும் பிரச்சனையைத் தேர்ந்தெடுத்து 1-க்ளிக்கில் அதிகாரப்பூர்வ ICAR தீர்வு பெறுங்கள்' : locale === 'hi' ? 'अपनी फसल, वृद्धि अवस्था और समस्या चुनकर 1-क्लिक में आधिकारिक कृषि सलाह पाएं' : 'Select your crop, current growth phase, and observed issue to generate targeted ICAR guidance with safe CIBRC chemical dosages.'}
          </p>
        </div>

        <div className="space-y-6">
          {/* Step 1: Crop */}
          <div>
            <span className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
              Step 1: {locale === 'ta' ? 'பயிரைத் தேர்வு செய்க' : locale === 'hi' ? 'फसल का चयन करें' : 'Choose Your Crop'}
            </span>
            <div className="flex flex-wrap gap-2">
              {getCrops().map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setLandingCrop(c.id)}
                  className={`touch-target px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all ${
                    landingCrop === c.id
                      ? 'bg-[#2e7d32] text-white shadow-xs font-bold'
                      : 'bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700'
                  }`}
                >
                  <span className="text-base">{c.icon}</span>
                  <span>{c.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Growth Stage */}
          <div>
            <span className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
              Step 2: {locale === 'ta' ? 'வளர்ச்சி நிலை' : locale === 'hi' ? 'वर्तमान फसल अवस्था' : 'Current Growth Stage'}
            </span>
            <div className="flex flex-wrap gap-2">
              {getStages().map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setLandingStage(s.id)}
                  className={`touch-target px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all ${
                    landingStage === s.id
                      ? 'bg-[#2e7d32] text-white shadow-xs font-bold'
                      : 'bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700'
                  }`}
                >
                  <span className="text-base">{s.icon}</span>
                  <span>{s.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Step 3: Issue */}
          <div>
            <span className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
              Step 3: {locale === 'ta' ? 'நீங்கள் காணும் பிரச்சனை' : locale === 'hi' ? 'खेत में देखी गई समस्या' : 'What Problem Are You Facing?'}
            </span>
            <div className="flex flex-wrap gap-2">
              {getIssues().map((i) => (
                <button
                  key={i.id}
                  type="button"
                  onClick={() => setLandingIssue(i.id)}
                  className={`touch-target px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all ${
                    landingIssue === i.id
                      ? 'bg-[#2e7d32] text-white shadow-xs font-bold'
                      : 'bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700'
                  }`}
                >
                  <span className="text-base">{i.icon}</span>
                  <span>{i.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Run Action */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleLaunchGuidedWizard}
              className="touch-target px-7 py-3.5 rounded-xl bg-[#2e7d32] hover:bg-[#1b5e20] text-white font-bold text-sm flex items-center gap-2 shadow-xs transition-colors"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{locale === 'ta' ? 'அதிகாரப்பூர்வ ICAR ஆலோசனை பெறுக →' : locale === 'hi' ? 'आधिकारिक कृषि परामर्श प्राप्त करें →' : 'Get Verified ICAR Guidance →'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: STEP-BY-STEP USER GUIDE FOR FARMERS
         ========================================================================= */}
      <section className="space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2e7d32] bg-[#edf7ed] px-3 py-1 rounded-full border border-[#c8e6c9]">
            <HelpCircle className="w-3.5 h-3.5 text-[#2e7d32]" />
            <span>Farmer User Guide</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {t('landing.howItWorksTitle')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {t('landing.howItWorksSubtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-sm transition-shadow space-y-4">
            <div className="w-10 h-10 rounded-xl bg-[#edf7ed] text-[#2e7d32] font-extrabold text-base flex items-center justify-center border border-[#c8e6c9] shadow-2xs">
              01
            </div>
            <div className="space-y-2">
              <h3 className="text-base font-bold text-slate-900">
                {t('landing.step1Title')}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {t('landing.step1Desc')}
              </p>
            </div>
            <div className="pt-2 text-xs font-semibold text-[#2e7d32]">
              Supports Tamil, Hindi, Telugu, Kannada, Malayalam, English
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-sm transition-shadow space-y-4">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 font-extrabold text-base flex items-center justify-center border border-amber-200 shadow-2xs">
              02
            </div>
            <div className="space-y-2">
              <h3 className="text-base font-bold text-slate-900">
                {t('landing.step2Title')}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {t('landing.step2Desc')}
              </p>
            </div>
            <div className="pt-2 text-xs font-semibold text-amber-800">
              Grounded in ICAR Institutes & AGMARKNET Data
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-sm transition-shadow space-y-4">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-800 font-extrabold text-base flex items-center justify-center border border-sky-200 shadow-2xs">
              03
            </div>
            <div className="space-y-2">
              <h3 className="text-base font-bold text-slate-900">
                {t('landing.step3Title')}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {t('landing.step3Desc')}
              </p>
            </div>
            <div className="pt-2 text-xs font-semibold text-sky-800">
              Weather Spray Windows & 72h PMFBY Loss Claims
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: ESSENTIAL FARMING SERVICES GRID
         ========================================================================= */}
      <section className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1.5">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {t('landing.servicesTitle')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl">
              {t('landing.servicesSubtitle')}
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('chat')}
            className="text-xs font-bold text-[#2e7d32] hover:text-[#1b5e20] hover:underline flex items-center gap-1.5 self-start sm:self-auto"
          >
            <span>Open Farm Chat Assistant</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 hover:border-[#c8e6c9] shadow-xs hover:shadow-sm transition-all flex flex-col justify-between space-y-5 group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="w-12 h-12 rounded-xl bg-[#edf7ed] text-[#2e7d32] flex items-center justify-center border border-[#c8e6c9]">
                      <Icon className="w-6 h-6 text-[#2e7d32]" />
                    </div>
                    <span className="text-[10px] font-bold text-[#2e7d32] bg-[#edf7ed] px-2.5 py-0.5 rounded-full border border-[#c8e6c9]">
                      {item.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-[#2e7d32] transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed mt-1.5">
                      {item.desc}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={item.onClick}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#2e7d32] hover:bg-[#1b5e20] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  <span>{item.actionText}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: NATIONAL FARMER HELPLINES DIRECTORY (LIGHT NATURE GREEN THEME)
         ========================================================================= */}
      <section className="bg-gradient-to-br from-[#edf7ed] via-white to-[#f4faf5] rounded-3xl p-6 sm:p-10 text-slate-900 space-y-6 shadow-xs border border-[#c8e6c9]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <h3 className="text-lg sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <PhoneCall className="w-5 h-5 text-[#2e7d32]" />
              <span>{t('landing.helplineTitle')}</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-600">
              {t('landing.helplineSubtitle')}
            </p>
          </div>
          <div className="text-xs font-bold text-[#2e7d32] bg-white px-3 py-1.5 rounded-full border border-[#c8e6c9] shadow-2xs self-start sm:self-auto">
            100% Free Government Service
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <a
            href="tel:18001801551"
            className="p-5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-[#c8e6c9] transition-all flex items-center justify-between gap-4 shadow-2xs group"
          >
            <div className="space-y-1">
              <div className="text-xs font-bold text-[#2e7d32]">
                {t('landing.kisanCallCentre')}
              </div>
              <div className="text-xl sm:text-2xl font-extrabold text-slate-900 font-mono tracking-tight group-hover:text-[#2e7d32] transition-colors">
                1800-180-1551
              </div>
              <div className="text-[11px] text-slate-500">
                {t('landing.kisanCallDesc')}
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#edf7ed] text-[#2e7d32] flex items-center justify-center shrink-0 border border-[#c8e6c9]">
              <PhoneCall className="w-5 h-5" />
            </div>
          </a>

          <a
            href="tel:14447"
            className="p-5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-amber-200 transition-all flex items-center justify-between gap-4 shadow-2xs group"
          >
            <div className="space-y-1">
              <div className="text-xs font-bold text-amber-800">
                {t('landing.pmfbyCall')}
              </div>
              <div className="text-xl sm:text-2xl font-extrabold text-slate-900 font-mono tracking-tight group-hover:text-amber-700 transition-colors">
                14447
              </div>
              <div className="text-[11px] text-slate-500">
                {t('landing.pmfbyCallDesc')}
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200">
              <PhoneCall className="w-5 h-5" />
            </div>
          </a>
        </div>
      </section>
    </div>
  );
}
