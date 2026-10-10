'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import {
  Send,
  Square,
  RotateCcw,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  BookOpen,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Info,
  Loader2,
  Brain,
  Sliders,
  CheckCircle2,
  Sprout,
  Compass,
  Layers,
  HelpCircle,
  ChevronRight,
  Sparkle
} from 'lucide-react';
import { VoiceInputButton } from './VoiceInputButton';
import { SpeakButton } from './SpeakButton';

interface Citation {
  chunk_id: string;
  doc_title: string;
  institution: string;
  publication_year: number;
  source_url: string;
  section: string;
  crop: string;
}

interface GroundingMetadata {
  is_grounded: boolean;
  retrieval_confidence: number;
  safety_status: 'SAFE' | 'STATUTORY_REFUSAL' | 'FAIL_CLOSED_UNGROUNDED';
  cibrc_checked: boolean;
  cibrc_restricted_substances_detected: string[];
  statutory_gazette_reference?: string | null;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
  groundingMetadata?: GroundingMetadata;
  fieldDisclaimer?: string;
  isStreaming?: boolean;
  error?: boolean;
  thoughtProcess?: string;
  thoughtDuration?: number;
}

interface ChatAssistantProps {
  onConversationStart?: () => void;
  initialQuery?: string;
  initialCrop?: string;
  onNavigateTab?: (tabId: string) => void;
}

export function ChatAssistant({
  onConversationStart,
  initialQuery,
  initialCrop,
  onNavigateTab
}: ChatAssistantProps) {
  const { t, locale } = useLanguage();

  const getWelcomeContent = () => {
    switch (locale) {
      case 'ta':
        return 'வணக்கம்! நான் அக்ரி ஜிபிடி (AgriGPT). பயிர் சாகுபடி, உரம், பூச்சி மேலாண்மை, மண்டி விலை மற்றும் வானிலை குறித்த நம்பகமான வழிகாட்டல்களைப் பெற என்னிடம் கேட்கலாம்.';
      case 'hi':
        return 'नमस्ते! मैं एग्री जीपीटी (AgriGPT) हूँ। फसल उत्पादन, खाद, कीट प्रबंधन, मंडी भाव और मौसम के बारे में आधिकारिक जानकारी के लिए मुझसे पूछें।';
      case 'te':
        return 'నమస్తే! నేను అగ్రి జిపిటి (AgriGPT). పంట సాగు, ఎరువులు, తెగుళ్ల నివారణ, మార్కెట్ ధరలు మరియు వాతావరణం గురించి అధికారిక సమాచారం కోసం నన్ను అడగండి.';
      case 'kn':
        return 'ನಮಸ್ಕಾರ! ನಾನು ಅಗ್ರಿ ಜಿಪಿಟಿ (AgriGPT). ಬೆಳೆ ನಿರ್ವಹಣೆ, ಗೊಬ್ಬರ, ಕೀಟ ನಿಯಂತ್ರಣ, ಮಾರುಕಟ್ಟೆ ದರ ಮತ್ತು ಹವಾಮಾನದ ಕುರಿತು ಅಧಿಕೃತ ಮಾಹಿತಿಗಾಗಿ ನನ್ನನ್ನು ಕೇಳಿ.';
      case 'ml':
        return 'നമസ്കാരം! ഞാൻ അഗ്രി ജിപിടി (AgriGPT). വിള പരിപാലനം, വളം, കീടനിയന്ത്രണം, വിപണി വില, കാലാവസ്ഥ എന്നിവയെക്കുറിച്ചുള്ള ഔദ്യോഗിക വിവരങ്ങൾക്ക് എന്നോട് ചോദിക്കാം.';
      default:
        return 'Welcome! I am AgriGPT, your multilingual agricultural advisor grounded in official ICAR & SAU Package of Practices. Ask me about crop protection, mandi prices, or weather suitability.';
    }
  };

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-1',
      role: 'assistant',
      content: getWelcomeContent(),
    },
  ]);

  const [showWizard, setShowWizard] = useState(false);
  const [wizardCrop, setWizardCrop] = useState('paddy');
  const [wizardStage, setWizardStage] = useState('vegetative');
  const [wizardIssue, setWizardIssue] = useState('pest');

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [expandedCitations, setExpandedCitations] = useState<Record<string, boolean>>({});
  const [expandedThoughts, setExpandedThoughts] = useState<Record<string, boolean>>({});
  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const toggleThought = (msgId: string) => {
    setExpandedThoughts((prev) => ({
      ...prev,
      [msgId]: prev[msgId] === false ? true : false,
    }));
  };

  // Dynamic vernacular prompt pills across all 6 Indic languages covering the Agri Universe
  const getPromptPills = () => {
    switch (locale) {
      case 'ta':
        return [
          { label: 'நெல் தண்டு துளைப்பான்', query: 'நெல் தண்டு துளைப்பான் மேலாண்மை என்ன?', crop: 'paddy' },
          { label: 'தக்காளி இலைச்சுருட்டு & காய்ப்புழு', query: 'தக்காளி இலைச்சுருட்டு நோய் மற்றும் காய்ப்புழு கட்டுப்பாடு என்ன?', crop: 'tomato' },
          { label: 'மண் பரிசோதனை & NPK உரம்', query: 'மண் பரிசோதனை மற்றும் NPK உரம் இடும் முறை என்ன?' },
          { label: 'சொட்டு நீர் பாசன நன்மைகள்', query: 'சொட்டு நீர் பாசனத்தின் நன்மைகள் மற்றும் அரசு மானியம் என்ன?' },
          { label: 'எண்டோசல்பான் பாதுகாப்பு?', query: 'நெல் பயிரில் எண்டோசல்பான் மருந்து அளவு என்ன?', crop: 'paddy' },
          { label: 'இயற்கை ஜீவாமிர்தம் தயாரிப்பு', query: 'திரவ ஜீவாமிர்தம் தயாரிக்கும் முறை என்ன?' },
        ];
      case 'hi':
        return [
          { label: 'धान का तना छेदक', query: 'धान के तना छेदक का प्रबंधन कैसे करें?', crop: 'paddy' },
          { label: 'टमाटर पत्ती मरोड़ व फल छेदक', query: 'टमाटर में पत्ती मरोड़ और फल छेदक कीट का उपचार क्या है?', crop: 'tomato' },
          { label: 'मृदा स्वास्थ्य कार्ड व NPK', query: 'मृदा स्वास्थ्य कार्ड के 12 मानक और संतुलित खाद प्रयोग क्या है?' },
          { label: 'ड्रिप सिंचाई व सब्सिडी', query: 'ड्रिप सिंचाई के क्या फायदे हैं और सरकारी सब्सिडी कैसे मिलती है?' },
          { label: 'एंडोसल्फान सुरक्षा?', query: 'धान के लिए एंडोसल्फान की मात्रा क्या है?', crop: 'paddy' },
          { label: 'प्राकृतिक जीवामृत निर्माण', query: 'प्राकृतिक खेती के लिए जीवामृत बनाने की विधि क्या है?' },
        ];
      case 'te':
        return [
          { label: 'వరి కాండం తొలుచు పురుగు', query: 'వరి కాండం తొలుచు పురుగు నివారణ పద్ధతులు ఏమిటి?', crop: 'paddy' },
          { label: 'టమోటా ఆకుముడత నివారణ', query: 'టమోటాలో ఆకుముడత తెగులు మరియు కాయతొలుచు పురుగు నివారణ?', crop: 'tomato' },
          { label: 'నేల ఆరోగ్యం & ఎరువులు', query: 'నేల ఆరోగ్య కార్డు మరియు శాస్త్రీయ ఎరువుల యాజమాన్యం ఏమిటి?' },
          { label: 'డ్రిప్ ఇరిగేషన్ రాయితీ', query: 'బిందు సేద్యం (డ్రిప్) ప్రయోజనాలు మరియు ప్రభుత్వ సబ్సిడీ ఏమిటి?' },
          { label: 'ఎండోసల్ఫాన్ భద్రత?', query: 'వరి పంటకు ఎండోసల్ఫాన్ మోతాదు ఎంత?', crop: 'paddy' },
        ];
      case 'kn':
        return [
          { label: 'ಭತ್ತದ ಕಾಂಡ ಕೊರೆಯುವ ಹುಳು', query: 'ಭತ್ತದ ಕಾಂಡ ಕೊರೆಯುವ ಹುಳುವಿನ ನಿರ್ವಹಣೆ ಹೇಗೆ?', crop: 'paddy' },
          { label: 'ಟೊಮೆಟೊ ಎಲೆ ಮುದುರು ರೋಗ', query: 'ಟೊಮೆಟೊ ಎಲೆ ಮುದುರು ರೋಗ ಮತ್ತು ಹಣ್ಣು ಕೊರೆಯುವ ಹುಳು ನಿಯಂತ್ರಣ?', crop: 'tomato' },
          { label: 'ಮಣ್ಣಿನ ಆರೋಗ್ಯ & NPK', query: 'ಮಣ್ಣಿನ ಆರೋಗ್ಯ ಕಾರ್ಡ್ ಮತ್ತು ಸಮತೋಲಿತ ಗೊಬ್ಬರ ನಿರ್ವಹಣೆ?' },
          { label: 'ಹನಿ ನೀರಾವರಿ ಸಬ್ಸಿಡಿ', query: 'ಹನಿ ನೀರಾವರಿ ಪದ್ಧತಿ ಮತ್ತು ಸರ್ಕಾರದ ಸಹಾಯಧನ ವಿವರ?' },
          { label: 'ಎಂಡೋಸಲ್ಫಾನ್ ಸುರಕ್ಷತೆ?', query: 'ಭತ್ತಕ್ಕೆ ಎಂಡೋಸಲ್ಫಾನ್ ಪ್ರಮಾಣ ಎಷ್ಟು?', crop: 'paddy' },
        ];
      case 'ml':
        return [
          { label: 'നെല്ല് തണ്ടുതുരപ്പൻ പുഴു', query: 'നെല്ലിലെ തണ്ടുതുരപ്പൻ പുഴുവിനെ എങ്ങനെ നിയന്ത്രിക്കാം?', crop: 'paddy' },
          { label: 'തക്കാളി ഇലച്ചുരുൾ രോഗം', query: 'തക്കാളിയിലെ ഇലച്ചുരുൾ രോഗവും കായതുരപ്പൻ പുഴുവും?', crop: 'tomato' },
          { label: 'മണ്ണ് പരിശോധന & വളം', query: 'മണ്ണ് പരിശോധനയും ശാസ്ത്രീയ വളപ്രയോഗവും എങ്ങനെ?' },
          { label: 'തുള്ളിനന സബ്‌സിഡി', query: 'തുള്ളിനന സമ്പ്രദായത്തിന്റെ ഗുണങ്ങളും സബ്‌സിഡിയും?' },
          { label: 'എൻഡോസൾഫാൻ സുരക്ഷ?', query: 'നെല്ലിൽ എൻഡോസൾഫാൻ ഉപയോഗിക്കാമോ?', crop: 'paddy' },
        ];
      default:
        return [
          { label: 'Paddy stem borer control', query: 'How to manage yellow stem borer in paddy?', crop: 'paddy' },
          { label: 'Tomato leaf curl & borer', query: 'How to manage tomato leaf curl virus and fruit borer?', crop: 'tomato' },
          { label: 'Soil Health & NPK Balance', query: 'What are the 12 Soil Health Card parameters and balanced NPK ratios?' },
          { label: 'Drip Irrigation & Subsidy', query: 'What are the benefits of drip irrigation and how to get PMKSY subsidy?' },
          { label: 'Is Endosulfan safe?', query: 'What is the dosage of Endosulfan for paddy?', crop: 'paddy' },
          { label: 'Organic Jeevamrutha Recipe', query: 'How to prepare liquid Jeevamrutha for natural farming?' },
        ];
    }
  };

  const getCropsList = () => {
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
      case 'te':
        return [
          { id: 'paddy', name: 'వరి (Paddy)', icon: '🌾' },
          { id: 'cotton', name: 'పత్తి (Cotton)', icon: '☁️' },
          { id: 'chilli', name: 'మిరప (Chilli)', icon: '🌶️' },
          { id: 'tomato', name: 'టమోటా (Tomato)', icon: '🍅' },
          { id: 'maize', name: 'మొక్కజొన్న (Maize)', icon: '🌽' },
        ];
      case 'kn':
        return [
          { id: 'paddy', name: 'ಭತ್ತ (Paddy)', icon: '🌾' },
          { id: 'cotton', name: 'ಹತ್ತಿ (Cotton)', icon: '☁️' },
          { id: 'tomato', name: 'ಟೊಮೆಟೊ (Tomato)', icon: '🍅' },
          { id: 'maize', name: 'ಮೆಕ್ಕೆಜೋಳ (Maize)', icon: '🌽' },
          { id: 'chilli', name: 'ಮೆಣಸಿನಕಾಯಿ (Chilli)', icon: '🌶️' },
        ];
      case 'ml':
        return [
          { id: 'paddy', name: 'നെല്ല് (Paddy)', icon: '🌾' },
          { id: 'banana', name: 'വാഴ (Banana)', icon: '🍌' },
          { id: 'pepper', name: 'കുരുമുളക് (Pepper)', icon: '🌿' },
          { id: 'rubber', name: 'റബ്ബർ (Rubber)', icon: '🌳' },
          { id: 'tomato', name: 'തക്കാളി (Tomato)', icon: '🍅' },
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

  const getStagesList = () => {
    switch (locale) {
      case 'ta':
        return [
          { id: 'seedling', name: 'நாற்று / முளைப்பு நிலை (0-25 நாள்)', icon: '🌱' },
          { id: 'vegetative', name: 'வளர்ச்சி / தூர்கட்டும் நிலை (25-50 நாள்)', icon: '🌿' },
          { id: 'flowering', name: 'பூக்கும் / காய் பிடிக்கும் நிலை (50-80 நாள்)', icon: '🌸' },
          { id: 'harvest', name: 'முதிர்ச்சி / அறுவடை நிலை', icon: '🌾' },
        ];
      case 'hi':
        return [
          { id: 'seedling', name: 'अंकुरण / नर्सरी अवस्था (0-25 दिन)', icon: '🌱' },
          { id: 'vegetative', name: 'वानस्पतिक वृद्धि / कल्ले (25-50 दिन)', icon: '🌿' },
          { id: 'flowering', name: 'फूल व फल बनने की अवस्था (50-80 दिन)', icon: '🌸' },
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

  const getIssuesList = () => {
    switch (locale) {
      case 'ta':
        return [
          { id: 'pest', name: 'பூச்சி / புழு தாக்குதல்', icon: '🐛' },
          { id: 'disease', name: 'இலை மஞ்சள் / புள்ளி / வாடல் நோய்', icon: '🍂' },
          { id: 'fertilizer', name: 'NPK உர அளவு & சத்து குறைபாடு', icon: '💧' },
          { id: 'spray', name: 'மருந்து தெளிக்கும் வானிலை & காற்று', icon: '🌦️' },
          { id: 'mandi', name: 'இன்றைய மண்டி மொத்த விற்பனை விலை', icon: '💰' },
        ];
      case 'hi':
        return [
          { id: 'pest', name: 'कीट / सुंडी / तना छेदक प्रकोप', icon: '🐛' },
          { id: 'disease', name: 'पत्ती पीली पड़ना / फफूंद व झुलसा', icon: '🍂' },
          { id: 'fertilizer', name: 'संतुलित NPK खाद व पोषण', icon: '💧' },
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

  const handleRunGuidedWizard = () => {
    const crops = getCropsList();
    const stages = getStagesList();
    const issues = getIssuesList();

    const selectedCropObj = crops.find((c) => c.id === wizardCrop) || crops[0];
    const selectedStageObj = stages.find((s) => s.id === wizardStage) || stages[0];
    const selectedIssueObj = issues.find((i) => i.id === wizardIssue) || issues[0];

    let queryText = '';
    if (locale === 'ta') {
      queryText = `${selectedCropObj.name} பயிரில் ${selectedStageObj.name}யில் ${selectedIssueObj.name} உள்ளது. அதிகாரப்பூர்வ ICAR பரிந்துரை, அனுமதிக்கப்பட்ட மருந்து அளவு மற்றும் இயற்கை வழிமுறை என்ன?`;
    } else if (locale === 'hi') {
      queryText = `${selectedCropObj.name} फसल में ${selectedStageObj.name} में ${selectedIssueObj.name} की समस्या है। आधिकारिक ICAR पैकेज ऑफ प्रैक्टिसेज, अनुमोदित कीटनाशक मात्रा और जैविक उपचार क्या है?`;
    } else {
      queryText = `For ${selectedCropObj.name} at ${selectedStageObj.name}, facing ${selectedIssueObj.name}. What is the recommended ICAR package of practices, approved safe chemical dosage with PHI, and organic alternatives?`;
    }

    setShowWizard(false);
    handleSend(queryText, wizardCrop);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (initialQuery && initialQuery.trim()) {
      handleSend(initialQuery.trim(), initialCrop);
    }
  }, [initialQuery, initialCrop]);

  const handleSend = async (queryText?: string, cropParam?: string) => {
    const textToSend = (queryText || input).trim();
    if (!textToSend || isLoading) return;

    // Trigger conversation start callback to collapse welcome banner
    onConversationStart?.();

    setInput('');
    const userMessageId = `user-${Date.now()}`;
    const assistantMessageId = `assistant-${Date.now()}`;

    // Add User message
    const newMessages: Message[] = [
      ...messages,
      { id: userMessageId, role: 'user', content: textToSend },
      {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        isStreaming: true,
      },
    ];
    setMessages(newMessages);
    setIsLoading(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    // Set robust 25-second connection timeout
    timeoutRef.current = setTimeout(() => {
      controller.abort();
    }, 25000);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: textToSend,
          locale,
          crop: cropParam,
          stream: true,
        }),
        signal: controller.signal,
      });

      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Server error (${response.status})`);
      }

      if (!response.body) {
        throw new Error('Response stream body unavailable.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let accumulatedText = '';
      let citations: Citation[] = [];
      let groundingMetadata: GroundingMetadata | undefined;
      let fieldDisclaimer = '';
      let thoughtProcess = '';
      let thoughtDuration = 1.2;

      let buffer = '';
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data: ')) continue;
          const payloadStr = trimmed.replace('data: ', '').trim();
          if (payloadStr === '[DONE]') continue;

          try {
            const data = JSON.parse(payloadStr);
            if (data.event === 'thought') {
              thoughtProcess = data.thought || '';
              thoughtDuration = data.duration_sec || 1.2;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMessageId
                    ? { ...m, thoughtProcess, thoughtDuration }
                    : m
                )
              );
            } else if (data.event === 'token') {
              accumulatedText += data.token;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMessageId
                    ? { ...m, content: accumulatedText, isStreaming: true }
                    : m
                )
              );
            } else if (data.event === 'metadata') {
              citations = data.citations || [];
              groundingMetadata = data.grounding_metadata;
              fieldDisclaimer = data.field_disclaimer || '';
              if (data.thought_process && !thoughtProcess) {
                thoughtProcess = data.thought_process;
              }
            }
          } catch {
            // Ignored partial frame
          }
        }
      }

      // Finalize completed message
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMessageId
            ? {
                ...m,
                content: accumulatedText,
                citations,
                groundingMetadata,
                fieldDisclaimer,
                thoughtProcess,
                thoughtDuration,
                isStreaming: false,
              }
            : m
        )
      );
    } catch (err: any) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      if (err.name === 'AbortError') {
        const wasTimedOut = !abortControllerRef.current;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMessageId
              ? {
                  ...m,
                  content: wasTimedOut
                    ? t('chat.timeoutError')
                    : m.content
                    ? `${m.content} [Cancelled by user]`
                    : 'Query was cancelled.',
                  isStreaming: false,
                  error: wasTimedOut,
                }
              : m
          )
        );
      } else {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMessageId
              ? {
                  ...m,
                  content: `${t('chat.failedResponse')} ${err.message || ''}`,
                  isStreaming: false,
                  error: true,
                }
              : m
          )
        );
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const handleRetry = (userQuery: string) => {
    handleSend(userQuery);
  };

  const toggleCitation = (msgId: string) => {
    setExpandedCitations((prev) => ({
      ...prev,
      [msgId]: !prev[msgId],
    }));
  };

  const promptPills = getPromptPills();

  return (
    <div className="flex flex-col space-y-4">
      {/* Interactive Guided Field Diagnostic Wizard Button / Drawer */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#edf7ed] text-[#2e7d32] flex items-center justify-center font-bold">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                {locale === 'ta' ? 'விவசாயி வழிகாட்டி (3-படி தீர்வு)' : locale === 'hi' ? 'किसान समस्या समाधान (3-चरणीय निदान)' : 'Farmer Problem Solver (3-Step Guided Wizard)'}
              </h3>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                {locale === 'ta' ? 'பயிர், நிலை மற்றும் பிரச்சனையைத் தேர்ந்தெடுத்து உடனடி வழிகாட்டல் பெறவும்' : locale === 'hi' ? 'फसल, अवस्था और लक्षण चुनकर तुरंत आधिकारिक सलाह प्राप्त करें' : 'Select your crop, stage, and field problem for instant ICAR guidance'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowWizard(!showWizard)}
            className="touch-target px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1 transition-colors"
          >
            <span>{showWizard ? 'Hide Wizard' : 'Open Wizard'}</span>
            {showWizard ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Wizard Controls Drawer */}
        {showWizard && (
          <div className="pt-2 border-t border-slate-100 space-y-4 animate-in fade-in duration-150">
            {/* Step 1: Crop */}
            <div>
              <span className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                1. {locale === 'ta' ? 'பயிரைத் தேர்வு செய்க' : locale === 'hi' ? 'फसल चुनें' : 'Choose Your Crop'}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {getCropsList().map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setWizardCrop(c.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      wizardCrop === c.id
                        ? 'bg-[#2e7d32] text-white shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700'
                    }`}
                  >
                    <span>{c.icon}</span>
                    <span>{c.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Growth Stage */}
            <div>
              <span className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                2. {locale === 'ta' ? 'வளர்ச்சி நிலை' : locale === 'hi' ? 'विकास अवस्था' : 'Current Growth Stage'}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {getStagesList().map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setWizardStage(s.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      wizardStage === s.id
                        ? 'bg-[#2e7d32] text-white shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700'
                    }`}
                  >
                    <span>{s.icon}</span>
                    <span>{s.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 3: Issue */}
            <div>
              <span className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                3. {locale === 'ta' ? 'எதிர்கொள்ளும் பிரச்சனை' : locale === 'hi' ? 'मुख्य समस्या' : 'What is the Problem?'}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {getIssuesList().map((i) => (
                  <button
                    key={i.id}
                    type="button"
                    onClick={() => setWizardIssue(i.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      wizardIssue === i.id
                        ? 'bg-[#2e7d32] text-white shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700'
                    }`}
                  >
                    <span>{i.icon}</span>
                    <span>{i.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Trigger Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleRunGuidedWizard}
                disabled={isLoading}
                className="touch-target w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#2e7d32] hover:bg-[#1b5e20] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-colors disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>{locale === 'ta' ? 'அதிகாரப்பூர்வ ஆலோசனை பெறுக →' : locale === 'hi' ? 'आधिकारिक कृषि परामर्श प्राप्त करें →' : 'Get Verified ICAR Guidance →'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Quick Suggested Prompts Horizontal Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none" aria-label="Suggested Queries">
        {promptPills.map((pill, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSend(pill.query, pill.crop)}
            disabled={isLoading}
            className="touch-target flex-shrink-0 text-xs px-3.5 py-1.5 rounded-full bg-white border border-slate-200 hover:border-[#2e7d32] text-slate-700 hover:text-[#2e7d32] font-medium transition-colors disabled:opacity-50 shadow-xs"
          >
            {pill.label}
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div className="space-y-4 min-h-[300px] pb-6">
        {messages.map((message) => {
          const isUser = message.role === 'user';
          const safety = message.groundingMetadata?.safety_status;
          const isWelcomeGreeting = message.id === 'welcome-1';

          return (
            <div
              key={message.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[96%] sm:max-w-[88%] rounded-2xl px-5 py-4 shadow-xs ${
                  isUser
                    ? 'bg-[#2e7d32] text-white rounded-tr-none'
                    : 'bg-white border border-slate-200/90 text-slate-800 rounded-tl-none'
                }`}
              >
                {/* Assistant Trust Header Badge (Only for retrieved answers, not welcome greeting) */}
                {!isUser && !isWelcomeGreeting && message.groundingMetadata && (
                  <div className="mb-3 pb-2.5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                    {safety === 'SAFE' && message.citations && message.citations.length > 0 && (
                      <span className="inline-flex items-center gap-1 font-semibold text-[#2e7d32] bg-[#edf7ed] px-2.5 py-0.5 rounded-md border border-[#c8e6c9]">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#2e7d32]" />
                        <span>{t('chat.groundedBadge')}</span>
                      </span>
                    )}

                    {safety === 'STATUTORY_REFUSAL' && (
                      <span className="inline-flex items-center gap-1 font-semibold text-amber-900 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200">
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
                        <span>{t('chat.statutoryRefusal')}</span>
                      </span>
                    )}

                    {safety === 'FAIL_CLOSED_UNGROUNDED' && (
                      <span className="inline-flex items-center gap-1 font-semibold text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-300">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                        <span>{t('chat.ungroundedRefusal')}</span>
                      </span>
                    )}

                    {/* Grounding Source Label */}
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                      <Sparkles className="w-3 h-3 text-[#2e7d32]" />
                      <span>ICAR Grounded</span>
                    </span>
                  </div>
                )}

                {/* Thought Process (DeepSeek R1 / ChatGPT o-series reasoning display) */}
                {!isUser && !isWelcomeGreeting && (message.thoughtProcess || message.isStreaming) && (
                  <div className="mb-3.5 rounded-xl bg-slate-50 border border-slate-200/80 overflow-hidden text-xs">
                    <button
                      type="button"
                      onClick={() => toggleThought(message.id)}
                      className="w-full px-3.5 py-2.5 flex items-center justify-between bg-slate-100/70 hover:bg-slate-100 text-slate-800 font-semibold transition-colors text-left"
                      aria-expanded={expandedThoughts[message.id] !== false}
                    >
                      <div className="flex items-center gap-2">
                        <Brain className="w-3.5 h-3.5 text-[#2e7d32]" />
                        <span className="font-semibold text-xs text-slate-800">
                          {message.isStreaming && !message.content ? 'Reasoning crop conditions & CIBRC safety guidelines...' : `🧠 Thought Process (${message.thoughtDuration || '1.2'}s reasoning)`}
                        </span>
                      </div>
                      {expandedThoughts[message.id] === false ? (
                        <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                      ) : (
                        <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
                      )}
                    </button>
                    {expandedThoughts[message.id] !== false && (
                      <div className="p-3.5 text-[11px] font-mono leading-relaxed text-slate-700 whitespace-pre-line bg-slate-50/80 border-t border-slate-200/60">
                        {message.thoughtProcess || (
                          <div className="flex items-center gap-2 text-slate-600 animate-pulse">
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#2e7d32]" />
                            <span>Auditing 342 CIBRC registered substances & cross-referencing ICAR agronomy...</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Message Content */}
                <div className="text-sm sm:text-base leading-relaxed whitespace-pre-line text-slate-800">
                  {message.content}
                  {message.isStreaming && (
                    <span className="inline-block w-2 h-4 ml-1 bg-[#2e7d32] animate-pulse align-middle" />
                  )}
                </div>

                {/* Statutory Gazette Alert */}
                {message.groundingMetadata?.statutory_gazette_reference && (
                  <div className="mt-3.5 p-3 rounded-xl bg-amber-50/90 border border-amber-200 text-xs text-amber-950 flex items-start gap-2">
                    <Info className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Statutory Authority Notice:</p>
                      <p className="text-[11px] text-amber-900 mt-0.5 leading-normal">
                        {message.groundingMetadata.statutory_gazette_reference}
                      </p>
                    </div>
                  </div>
                )}

                {/* Expandable Citations Drawer */}
                {!isUser && message.citations && message.citations.length > 0 && (
                  <div className="mt-3.5 pt-2.5 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => toggleCitation(message.id)}
                      className="touch-target inline-flex items-center gap-1.5 text-xs font-semibold text-[#2e7d32] hover:text-[#1b5e20] transition-colors"
                      aria-expanded={expandedCitations[message.id]}
                    >
                      <BookOpen className="w-3.5 h-3.5 text-[#2e7d32]" />
                      <span>
                        {message.citations.length} {t('chat.citations')}
                        {message.citations.length > 1 ? 's' : ''}
                      </span>
                      {expandedCitations[message.id] ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {expandedCitations[message.id] && (
                      <div className="mt-2 space-y-2">
                        {message.citations.map((cite, cIdx) => (
                          <div
                            key={cIdx}
                            className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 space-y-1"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="font-semibold text-slate-900">{cite.institution}</span>
                              <span className="text-[10px] bg-slate-200/80 text-slate-700 px-1.5 py-0.5 rounded font-mono font-medium">
                                {cite.publication_year}
                              </span>
                            </div>
                            <p className="text-slate-600 font-medium italic">{cite.doc_title}</p>
                            <p className="text-slate-700 text-[11px]">
                              <strong>Section:</strong> {cite.section}
                            </p>
                            {cite.source_url && (
                              <a
                                href={cite.source_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] text-[#2e7d32] hover:underline font-semibold pt-0.5"
                              >
                                <span>{t('chat.officialLink')}</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Read Aloud TTS Playback */}
                {!isUser && !message.isStreaming && message.content && (
                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                    <SpeakButton text={message.content} locale={locale} />
                  </div>
                )}

                {/* Farmer Quick Actions */}
                {!isUser && !isWelcomeGreeting && !message.isStreaming && (
                  <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex flex-wrap items-center gap-1.5 text-xs">
                    {onNavigateTab && (
                      <>
                        <button
                          type="button"
                          onClick={() => onNavigateTab('mandi')}
                          className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 text-[11px] font-semibold flex items-center gap-1 transition-colors"
                        >
                          <span>🌾 Today's Mandi Rate</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onNavigateTab('weather')}
                          className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 text-[11px] font-semibold flex items-center gap-1 transition-colors"
                        >
                          <span>🌦️ Spray Weather</span>
                        </button>
                      </>
                    )}
                    <a
                      href="tel:18001801551"
                      className="px-2.5 py-1 rounded-lg bg-[#2e7d32] text-white hover:bg-[#1b5e20] text-[11px] font-semibold flex items-center gap-1 transition-colors ml-auto"
                    >
                      <span>📞 Kisan Helpline</span>
                    </a>
                  </div>
                )}

                {/* Interactive Field Situation Clarification Chips */}
                {!isUser && !isWelcomeGreeting && !message.isStreaming && message.content && (
                  <div className="mt-3.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                      <span className="flex items-center gap-1.5">
                        <Sliders className="w-3.5 h-3.5 text-[#2e7d32]" />
                        <span>Refine for your field conditions:</span>
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium">1-Click</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleSend(`${message.content.slice(0, 45)}... What is the specific dosage and care for Seedling stage (15-30 days)?`)}
                        className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 text-[11px] font-medium transition-colors"
                      >
                        🌱 Seedling Stage
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSend(`${message.content.slice(0, 45)}... What is the specific dosage and spray schedule for Vegetative growth stage?`)}
                        className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 text-[11px] font-medium transition-colors"
                      >
                        🌿 Vegetative Stage
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSend(`${message.content.slice(0, 45)}... How to apply this through Drip Fertigation system?`)}
                        className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 text-[11px] font-medium transition-colors"
                      >
                        💧 Drip Fertigation
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSend(`${message.content.slice(0, 45)}... What is the 100% Organic natural farming alternative (Jeevamrutha/Neem)?`)}
                        className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 text-[11px] font-medium transition-colors"
                      >
                        🌿 100% Organic Option
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSend(`${message.content.slice(0, 45)}... What is the Pre-Harvest Waiting Period (PHI) before safe picking?`)}
                        className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 text-[11px] font-medium transition-colors"
                      >
                        ⏳ Waiting Period (PHI)
                      </button>
                    </div>
                  </div>
                )}

                {/* Field Disclaimer */}
                {!isUser && message.fieldDisclaimer && !message.isStreaming && (
                  <p className="mt-2 text-[10px] text-slate-400 italic">
                    {message.fieldDisclaimer}
                  </p>
                )}

                {/* Error & Retry Button */}
                {message.error && (
                  <div className="mt-2.5 pt-2 border-t border-red-100 flex items-center justify-between">
                    <span className="text-xs text-red-600 font-medium">{t('chat.failedResponse')}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
                        if (lastUserMsg) handleRetry(lastUserMsg.content);
                      }}
                      className="touch-target inline-flex items-center gap-1 text-xs text-[#2e7d32] font-semibold hover:underline"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{t('chat.retry')}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Accessible Sticky Input Form Bar */}
      <div className="sticky bottom-16 md:bottom-2 z-20 bg-[#F8FAF7]/95 backdrop-blur-md pt-2 pb-2 border-t border-slate-200/60">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('chat.placeholder')}
            disabled={isLoading}
            className="flex-1 h-12 px-4 rounded-xl border border-slate-300 bg-white shadow-xs text-sm focus:outline-none focus:ring-2 focus:ring-[#2e7d32] focus:border-transparent disabled:bg-slate-50 transition-all placeholder:text-slate-400 text-slate-800"
          />

          {/* Vernacular Speech-to-Text Button */}
          <VoiceInputButton
            onTranscript={(spoken) => setInput((prev) => (prev ? `${prev} ${spoken}` : spoken))}
            disabled={isLoading}
          />

          {isLoading ? (
            <button
              type="button"
              onClick={handleCancel}
              className="touch-target h-12 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm flex items-center justify-center gap-1.5 shadow-xs transition-colors"
              title={t('chat.stop')}
              aria-label={t('chat.stop')}
            >
              <Square className="w-4 h-4 fill-white" />
              <span className="hidden sm:inline">{t('chat.stop')}</span>
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim()}
              className="touch-target h-12 px-4 rounded-xl bg-[#2e7d32] hover:bg-[#1b5e20] text-white font-semibold text-sm flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-40 disabled:hover:bg-[#2e7d32] transition-colors"
              aria-label={t('chat.send')}
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">{t('chat.send')}</span>
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
