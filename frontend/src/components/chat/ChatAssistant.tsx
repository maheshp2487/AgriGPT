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
  Sprout,
  Compass,
  Settings,
  Globe,
  Bot,
  Zap,
} from 'lucide-react';
import { VoiceInputButton } from './VoiceInputButton';
import { SpeakButton } from './SpeakButton';
import { FarmerAvatar } from './FarmerAvatar';
import { CHAT_LOCALES } from '@/lib/chatLocales';

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
  onNavigateTab,
}: ChatAssistantProps) {
  const { t, locale, currentLanguage } = useLanguage();
  const locData = CHAT_LOCALES[locale] || CHAT_LOCALES.en;

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [avatarType, setAvatarType] = useState<'farmer' | 'scientist'>('farmer');

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-1',
      role: 'assistant',
      content: locData.welcomeDesc,
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
  const isAutoScrollActiveRef = useRef<boolean>(true);
  const rafIdRef = useRef<number | null>(null);
  const isFirstRenderRef = useRef<boolean>(true);

  // Automatically sync initial greeting when language changes
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].id.startsWith('welcome')) {
        return [
          {
            id: prev[0].id,
            role: 'assistant',
            content: locData.welcomeDesc,
          },
        ];
      }
      return prev;
    });
  }, [locale, locData.welcomeDesc]);

  // Listen to user scroll to detect if they intentionally scrolled up to read earlier text
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const viewportHeight = window.innerHeight;
      const fullHeight = document.documentElement.scrollHeight;
      const distanceFromBottom = fullHeight - (scrollY + viewportHeight);
      isAutoScrollActiveRef.current = distanceFromBottom <= 180;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    if (!messagesEndRef.current) return;
    messagesEndRef.current.scrollIntoView({
      behavior,
      block: 'end',
    });
  };

  const scheduleAutoScroll = () => {
    if (!isAutoScrollActiveRef.current) return;
    if (rafIdRef.current !== null) return;

    rafIdRef.current = requestAnimationFrame(() => {
      rafIdRef.current = null;
      if (!isAutoScrollActiveRef.current || !messagesEndRef.current) return;
      messagesEndRef.current.scrollIntoView({
        behavior: 'auto',
        block: 'end',
      });
    });
  };

  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      return;
    }

    const lastMsg = messages[messages.length - 1];
    if (lastMsg?.isStreaming) {
      scheduleAutoScroll();
    } else {
      scrollToBottom('smooth');
    }
  }, [messages]);

  useEffect(() => {
    if (initialQuery && initialQuery.trim()) {
      handleSend(initialQuery.trim(), initialCrop);
    }
  }, [initialQuery, initialCrop]);

  const toggleThought = (msgId: string) => {
    setExpandedThoughts((prev) => ({
      ...prev,
      [msgId]: prev[msgId] === false ? true : false,
    }));
  };

  const handleReset = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const currentLoc = CHAT_LOCALES[locale] || CHAT_LOCALES.en;
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        content: currentLoc.welcomeDesc,
      },
    ]);
    setInput('');
    setIsLoading(false);
  };

  const handleQuickMode = (mode: 'sowing' | 'mandi' | 'doctor' | 'schemes') => {
    switch (mode) {
      case 'sowing':
        handleSend(locData.sowingQuery);
        break;
      case 'mandi':
        if (onNavigateTab) {
          onNavigateTab('mandi');
        } else {
          handleSend(locData.mandiQuery);
        }
        break;
      case 'doctor':
        if (onNavigateTab) {
          onNavigateTab('doctor');
        } else {
          handleSend(locData.pestQuery);
        }
        break;
      case 'schemes':
        if (onNavigateTab) {
          onNavigateTab('schemes');
        } else {
          handleSend(locData.schemesQuery);
        }
        break;
    }
  };

  const handleSend = async (queryText?: string, cropParam?: string) => {
    const textToSend = (queryText || input).trim();
    if (!textToSend || isLoading) return;

    isAutoScrollActiveRef.current = true;
    onConversationStart?.();

    setInput('');
    const userMessageId = `user-${Date.now()}`;
    const assistantMessageId = `assistant-${Date.now()}`;

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

  return (
    <>
      <div className="flex flex-col space-y-4 max-w-4xl mx-auto w-full">
        {/* =========================================================================
            TOP BAR ABOVE CARD: AVATAR ON LEFT, REFRESH & STATUS ON RIGHT
           ========================================================================= */}
        <div className="flex items-center justify-between gap-3 px-1">
          {/* Avatar with its own interactive speech bubble & Switch */}
          <FarmerAvatar
            isSpeaking={isSpeaking}
            isListening={isListening}
            currentLang={locale}
            avatarType={avatarType}
            onToggleAvatarType={() =>
              setAvatarType((prev) => (prev === 'farmer' ? 'scientist' : 'farmer'))
            }
          />

          {/* Right Action: Clean Reset & Verified Grounding Pill */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#c8e6c9] text-[#2e7d32] text-xs font-semibold shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>ICAR & AGMARKNET Grounded</span>
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="touch-target px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center gap-1.5 shadow-2xs transition-colors border border-slate-200"
              title="Reset conversation"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>{locData.resetButton}</span>
            </button>
          </div>
        </div>

        {/* =========================================================================
            MAIN CHATBOT CARD CONTAINER (Fresh Nature UI Palette)
           ========================================================================= */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-md overflow-hidden flex flex-col">
          {/* Nature Green Header Banner Matching AgriGPT Brand */}
          <div className="bg-gradient-to-r from-[#1b4332] via-[#245e3f] to-[#1b4332] px-5 sm:px-6 py-3.5 flex items-center justify-between text-white border-b border-emerald-900/30 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse" />
              <h2 className="text-xs sm:text-sm font-bold tracking-wide text-white">
                AgriGPT • {locData.modeName}
              </h2>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-200 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden xs:inline">Official ICAR Package of Practices</span>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="p-4 sm:p-6 space-y-4 min-h-[340px] max-h-[600px] overflow-y-auto bg-gradient-to-b from-[#fbfdfb] via-white to-[#f7fbf8]">
            {messages.map((message) => {
              const isUser = message.role === 'user';
              const isWelcome = message.id.startsWith('welcome');
              const safety = message.groundingMetadata?.safety_status;

              if (isWelcome) {
                return (
                  <div key={message.id} className="flex items-start gap-3 animate-in fade-in duration-200">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[#edf7ed] border border-[#c8e6c9] text-[#2e7d32] flex items-center justify-center shrink-0 shadow-2xs mt-1">
                      <Bot className="w-5 h-5 text-[#2e7d32]" />
                    </div>
                    <div className="flex-1 bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm sm:text-base font-extrabold text-slate-900">
                          {locData.welcomeTitle}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                        {message.content}
                      </p>
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-[11px] font-medium text-slate-500">
                          {locData.groundedSource}
                        </span>
                        <SpeakButton
                          text={message.content}
                          locale={locale}
                          onPlayingChange={setIsSpeaking}
                        />
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={message.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} animate-in fade-in duration-150`}
                >
                  <div
                    className={`max-w-[94%] sm:max-w-[86%] rounded-3xl px-5 py-4 shadow-xs ${
                      isUser
                        ? 'bg-[#2e7d32] text-white rounded-tr-none'
                        : 'bg-white border border-slate-200/90 text-slate-800 rounded-tl-none'
                    }`}
                  >
                    {/* Safety Status Header */}
                    {!isUser && message.groundingMetadata && (
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

                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                          <Sparkles className="w-3 h-3 text-[#2e7d32]" />
                          <span>ICAR Grounded</span>
                        </span>
                      </div>
                    )}

                    {/* Thought Process Drawer (Clean & Collapsed by Default) */}
                    {!isUser && (message.thoughtProcess || message.isStreaming) && (
                      <div className="mb-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 overflow-hidden text-xs">
                        <button
                          type="button"
                          onClick={() => toggleThought(message.id)}
                          className="w-full px-3.5 py-2 flex items-center justify-between bg-slate-100/70 hover:bg-slate-100 text-slate-800 font-semibold transition-colors text-left"
                          aria-expanded={expandedThoughts[message.id] === true}
                        >
                          <div className="flex items-center gap-2">
                            <Brain className="w-3.5 h-3.5 text-[#2e7d32]" />
                            <span className="font-semibold text-xs text-slate-800">
                              {message.isStreaming && !message.content
                                ? 'Reasoning crop conditions & CIBRC safety guidelines...'
                                : `🧠 AI Agronomic Reasoning (${message.thoughtDuration || '1.2'}s)`}
                            </span>
                          </div>
                          {expandedThoughts[message.id] === true ? (
                            <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                          )}
                        </button>
                        {expandedThoughts[message.id] === true && (
                          <div className="p-3 text-[11px] font-mono leading-relaxed text-slate-700 whitespace-pre-line bg-slate-50/80 border-t border-slate-200/60 animate-in fade-in duration-150">
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
                    <div className="text-sm sm:text-base leading-relaxed whitespace-pre-line">
                      {message.content}
                      {message.isStreaming && (
                        <span className="inline-block w-2 h-4 ml-1 bg-[#2e7d32] animate-pulse align-middle" />
                      )}
                    </div>

                    {/* Citations Drawer */}
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
                                className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 space-y-1"
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

                    {/* Listen Audio Read-Aloud Button & 1-Click Action Chips */}
                    {!isUser && !message.isStreaming && message.content && (
                      <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                        <SpeakButton
                          text={message.content}
                          locale={locale}
                          onPlayingChange={setIsSpeaking}
                        />

                        {/* Interactive Follow-up Action Chips */}
                        <div className="flex flex-wrap items-center gap-1.5 ml-auto">
                          <button
                            type="button"
                            onClick={() => handleSend(`${message.content.slice(0, 35)}... ${locData.sowingAdvisor}?`)}
                            className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors shadow-2xs"
                          >
                            {locData.sowingAdvisor}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSend(`${message.content.slice(0, 35)}... What is the 100% Organic alternative?`)}
                            className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 transition-colors shadow-2xs"
                          >
                            🌿 100% Organic
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSend(`${message.content.slice(0, 35)}... Pre-Harvest Interval (PHI) waiting period?`)}
                            className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-200 transition-colors shadow-2xs"
                          >
                            ⏳ PHI Days
                          </button>
                        </div>
                      </div>
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
            <div ref={messagesEndRef} className="h-4 scroll-mb-28 md:scroll-mb-20 pointer-events-none" aria-hidden="true" />
          </div>

          {/* Quick Modes Chips Row */}
          <div className="px-4 sm:px-6 py-2.5 bg-slate-50 border-t border-slate-200/80 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1 mr-1">
              <Zap className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>{locData.quickModesLabel}</span>
            </span>

            <button
              type="button"
              onClick={() => handleQuickMode('sowing')}
              disabled={isLoading}
              className="touch-target px-3 py-1.5 rounded-full bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-800 text-xs font-semibold shadow-2xs transition-all active:scale-95 disabled:opacity-50"
            >
              {locData.sowingAdvisor}
            </button>

            <button
              type="button"
              onClick={() => handleQuickMode('mandi')}
              disabled={isLoading}
              className="touch-target px-3 py-1.5 rounded-full bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-800 text-xs font-semibold shadow-2xs transition-all active:scale-95 disabled:opacity-50"
            >
              {locData.mandiRates}
            </button>

            <button
              type="button"
              onClick={() => handleQuickMode('doctor')}
              disabled={isLoading}
              className="touch-target px-3 py-1.5 rounded-full bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-800 text-xs font-semibold shadow-2xs transition-all active:scale-95 disabled:opacity-50"
            >
              {locData.pestDoctor}
            </button>

            <button
              type="button"
              onClick={() => handleQuickMode('schemes')}
              disabled={isLoading}
              className="touch-target px-3 py-1.5 rounded-full bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-800 text-xs font-semibold shadow-2xs transition-all active:scale-95 disabled:opacity-50"
            >
              {locData.govtSchemes}
            </button>
          </div>

          {/* Accessible Input Form Bar */}
          <div className="p-3 sm:p-4 bg-white border-t border-slate-200/80">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="relative flex items-center gap-2 sm:gap-3"
            >
              {/* Prominent Circular Voice Mic Button */}
              <VoiceInputButton
                onTranscript={(spoken) => setInput((prev) => (prev ? `${prev} ${spoken}` : spoken))}
                onListeningChange={setIsListening}
                disabled={isLoading}
              />

              {/* Text Input Field */}
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={locData.placeholder}
                disabled={isLoading}
                className="flex-1 h-12 px-4 rounded-2xl border border-slate-300 bg-white shadow-2xs text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#2e7d32] focus:border-transparent disabled:bg-slate-50 transition-all placeholder:text-slate-400 text-slate-900"
              />

              {/* Stop / Ask Button */}
              {isLoading ? (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="touch-target h-12 px-5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm flex items-center justify-center gap-1.5 shadow-xs transition-colors shrink-0"
                  title="Stop"
                  aria-label="Stop"
                >
                  <Square className="w-4 h-4 fill-white" />
                  <span className="hidden sm:inline">Stop</span>
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="touch-target h-12 px-5 rounded-2xl bg-[#2e7d32] hover:bg-[#256629] text-white font-bold text-sm flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-40 disabled:hover:bg-[#2e7d32] transition-colors shrink-0"
                  aria-label={locData.askButton}
                >
                  <span>{locData.askButton}</span>
                  <Send className="w-4 h-4" />
                </button>
              )}
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
