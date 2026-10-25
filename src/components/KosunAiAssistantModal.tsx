import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Send,
  Mic,
  MicOff,
  Sparkles,
  Clock,
  Layers,
  Fingerprint,
  Moon,
  FolderOpen,
  Home,
  ArrowLeft,
  Loader2,
  CheckCircle,
  HelpCircle,
  Navigation,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useTasks } from '../context/TaskContext';
import { useBrand } from '../context/BrandContext';
import { sound } from '../utils/audio';
import { ActiveScreen } from '../types';

interface ActionLink {
  id: string;
  label: string;
  description?: string;
  targetScreen?: string;
  targetAction?: string;
  icon?: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  actionLinks?: ActionLink[];
  recommendations?: string[];
  matchedDataSummary?: string;
  timestamp: Date;
}

interface KosunAiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentScreen: ActiveScreen;
  onNavigateScreen: (screen: ActiveScreen) => void;
  onTriggerAction: (action: 'quick_capture' | 'evening_ritual' | 'install') => void;
}

const DEFAULT_RECOMMENDATIONS = [
  '🎯 מהם 3 יעדי המיקוד שלי להיום?',
  '🎨 איך לעדכן את ה-DNA של המותג?',
  '⚡ איך קולטים קושאן בקול תוך 3 שניות?',
  '🌙 כיצד מבצעים טקס ערב לסגירת יום?',
];

export const KosunAiAssistantModal: React.FC<KosunAiAssistantModalProps> = ({
  isOpen,
  onClose,
  currentScreen,
  onNavigateScreen,
  onTriggerAction,
}) => {
  const { isDark } = useTheme();
  const { todayTasks, inbox } = useTasks();
  const { brandDna } = useBrand();

  const [inputQuery, setInputQuery] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [recommendations, setRecommendations] = useState<string[]>(DEFAULT_RECOMMENDATIONS);
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto scroll to bottom of messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  // Speech Recognition setup (STT)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'he-IL';

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInputQuery(transcript);
          setIsListening(false);
          sound.playPop();
          // Automatically submit voice query
          submitQuery(transcript);
        };

        recognition.onerror = () => {
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  const toggleVoiceListening = () => {
    if (!recognitionRef.current) {
      alert('זיהוי דיבור אינו נתמך בדפדפן זה');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      sound.playPop();
      setInputQuery('');
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const submitQuery = async (queryText: string) => {
    const text = queryText.trim();
    if (!text || loading) return;

    sound.playPop();
    const userMsg: ChatMessage = {
      id: 'usr_' + Date.now(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/vector-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: text,
          currentScreen,
          userTasks: todayTasks,
          brandDna,
          inboxCount: inbox.length,
        }),
      });

      const data = await res.json();

      const assistantMsg: ChatMessage = {
        id: 'ast_' + Date.now(),
        role: 'assistant',
        content: data.reply || 'המידע הוצג לפי המתודה:',
        actionLinks: data.actionLinks || [],
        recommendations: data.recommendations || DEFAULT_RECOMMENDATIONS,
        matchedDataSummary: data.matchedDataSummary,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
      if (Array.isArray(data.recommendations) && data.recommendations.length > 0) {
        setRecommendations(data.recommendations.slice(0, 4));
      }
      sound.playTaskComplete();
    } catch (err) {
      console.error('Error contacting vector assistant:', err);
      const fallbackMsg: ChatMessage = {
        id: 'ast_' + Date.now(),
        role: 'assistant',
        content: `מידע על פי מתודת KOSUN: עבור "${text}", תוכל לגשת ישירות לניהול הזמן, לתיק הנכסים או למרכז ה-DNA ללא הסחות דעת.`,
        actionLinks: [
          {
            id: 'NAVIGATE_TODAY',
            label: 'מעבר ל-3 משימות היום',
            description: 'פתיחת שעון המיקוד היומי',
            targetScreen: 'today',
            icon: 'Clock',
          },
          {
            id: 'NAVIGATE_BRANDING',
            label: 'מעבר למרכז ה-DNA והמיתוג',
            description: 'הגדרת ערכי המותג ובידול שיווקי',
            targetScreen: 'branding',
            icon: 'Fingerprint',
          },
        ],
        recommendations: DEFAULT_RECOMMENDATIONS,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleActionLinkClick = (action: ActionLink) => {
    sound.playTaskComplete();
    onClose();

    if (action.targetScreen) {
      onNavigateScreen(action.targetScreen as ActiveScreen);
    } else if (action.targetAction === 'quick_capture') {
      onTriggerAction('quick_capture');
    } else if (action.targetAction === 'evening_ritual') {
      onTriggerAction('evening_ritual');
    }
  };

  const getActionIcon = (iconName?: string) => {
    switch (iconName) {
      case 'Clock':
        return <Clock className="w-5 h-5 text-[#00F0FF]" />;
      case 'Fingerprint':
        return <Fingerprint className="w-5 h-5 text-[#00F0FF]" />;
      case 'FolderOpen':
        return <FolderOpen className="w-5 h-5 text-[#00F0FF]" />;
      case 'Moon':
        return <Moon className="w-5 h-5 text-[#00F0FF]" />;
      case 'Layers':
        return <Layers className="w-5 h-5 text-[#00F0FF]" />;
      case 'Home':
        return <Home className="w-5 h-5 text-[#00F0FF]" />;
      default:
        return <Navigation className="w-5 h-5 text-[#00F0FF]" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div
        className={`w-full max-w-lg h-[92vh] sm:h-[85vh] max-h-[760px] rounded-t-3xl sm:rounded-3xl border flex flex-col shadow-2xl relative animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200 overflow-hidden ${
          isDark
            ? 'bg-[#0D0E1F] border-[#1A2B4C] text-[#F0F4FF] shadow-[0_0_50px_rgba(0,0,0,0.85)]'
            : 'bg-white border-[#CBD5E1] text-[#0A0D18] shadow-2xl'
        }`}
      >
        {/* HEADER: KOSUN Animated Character + Subtitle + Close */}
        <header className="p-4 border-b border-inherit/20 flex items-center justify-between shrink-0 bg-inherit/90">
          <div className="flex items-center gap-3">
            {/* Animated Avatar with organic Head Bobbing */}
            <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-[#12162B] to-[#1A2B4C] border border-[#00F0FF]/50 p-1 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(0,240,255,0.3)]">
              <img
                src="/kosun-user.webp"
                alt="KOSUN AI"
                className="w-10 h-10 object-contain animate-kosun-head pointer-events-none select-none"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#00F0FF] border-2 border-[#070913] shadow-[0_0_6px_#00F0FF]" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black tracking-wide font-['Orbitron',sans-serif]">
                  KOSUN AI ASSISTANT
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/30">
                  חיפוש וקטורי
                </span>
              </div>
              <p className="text-xs opacity-70">
                הצגת מידע וקיום פעולות • ללא הסחות דעת
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playPop();
              onClose();
            }}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              isDark
                ? 'bg-[#12162B] border-[#1A2B4C] text-[#F0F4FF]/70 hover:text-white hover:border-[#00F0FF]'
                : 'bg-[#F1F5F9] border-[#CBD5E1] text-stone-600 hover:text-black hover:border-[#00B4D8]'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* MESSAGES & ACTION CENTER AREA */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Welcome Card if no messages yet */}
          {messages.length === 0 && (
            <div className="py-2 space-y-4">
              <div
                className={`p-4 rounded-2xl border text-center ${
                  isDark
                    ? 'bg-[#12162B]/80 border-[#1A2B4C]'
                    : 'bg-[#F8FAFC] border-[#E2E8F0]'
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-[#00F0FF]/15 border border-[#00F0FF]/30 mx-auto flex items-center justify-center mb-2">
                  <Sparkles className="w-6 h-6 text-[#00F0FF]" />
                </div>
                <h4 className="text-base font-black text-inherit">
                  כיצד אוכל לקדם את נכסיך היום?
                </h4>
                <p className="text-xs opacity-75 max-w-xs mx-auto mt-1 leading-relaxed">
                  העוזר של KOSUN מאתר נתונים מהשרת ומאפשר ביצוע פעולות ישירות לפי מתודת "חוק ה-3" ללא עומס קוגניטיבי.
                </p>
              </div>

              {/* CENTER: EXACTLY 4 DYNAMIC RECOMMENDATION BUTTONS */}
              <div className="space-y-2">
                <div className="text-xs font-bold opacity-60 px-1">
                  המלצות פעולה מהירות (לחיצה אחת לביצוע):
                </div>
                <div className="flex flex-col gap-2">
                  {recommendations.slice(0, 4).map((rec, idx) => (
                    <button
                      key={idx}
                      onClick={() => submitQuery(rec)}
                      className={`w-full min-h-[46px] p-3 rounded-2xl border text-right flex items-center justify-between group transition-all duration-200 cursor-pointer active:scale-98 ${
                        isDark
                          ? 'bg-[#12162B] border-[#1A2B4C] hover:border-[#00F0FF] hover:bg-[#161B35] text-[#F0F4FF]'
                          : 'bg-[#F8FAFC] border-[#CBD5E1] hover:border-[#00B4D8] hover:bg-white text-[#0A0D18]'
                      }`}
                    >
                      <span className="text-xs sm:text-sm font-bold text-inherit truncate">
                        {rec}
                      </span>
                      <ArrowLeft className="w-4 h-4 text-[#00F0FF] shrink-0 group-hover:-translate-x-1 transition-transform" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Chat Messages */}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.role === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`max-w-[88%] p-3.5 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-[#00F0FF] text-[#070913] font-bold rounded-bl-xs shadow-[0_0_15px_rgba(0,240,255,0.3)]'
                    : isDark
                    ? 'bg-[#12162B] border border-[#1A2B4C] text-[#F0F4FF] rounded-br-xs'
                    : 'bg-[#F1F5F9] border border-[#CBD5E1] text-[#0A0D18] rounded-br-xs'
                }`}
              >
                {msg.content}

                {/* Optional Matched Data Badge */}
                {msg.matchedDataSummary && (
                  <div className="mt-2 pt-2 border-t border-inherit/20 flex items-center gap-1.5 text-xs text-[#00F0FF]">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>{msg.matchedDataSummary}</span>
                  </div>
                )}
              </div>

              {/* ACTION LINKS: Goal-Oriented Task Navigation (Zero Distractions) */}
              {msg.actionLinks && msg.actionLinks.length > 0 && (
                <div className="w-full mt-2 space-y-1.5 pl-2">
                  <div className="text-[11px] font-bold text-[#00F0FF] px-1">
                    פעולות לביצוע מיידי:
                  </div>
                  {msg.actionLinks.map((link, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleActionLinkClick(link)}
                      className={`w-full p-3 rounded-2xl border flex items-center justify-between group transition-all cursor-pointer active:scale-98 ${
                        isDark
                          ? 'bg-gradient-to-r from-[#00F0FF]/15 via-[#12162B] to-[#12162B] border-[#00F0FF]/40 hover:border-[#00F0FF] text-[#F0F4FF]'
                          : 'bg-gradient-to-r from-[#00B4D8]/10 via-[#F8FAFC] to-white border-[#00B4D8]/40 hover:border-[#00B4D8] text-[#0A0D18]'
                      }`}
                    >
                      <div className="flex items-center gap-3 text-right">
                        <div className="w-9 h-9 rounded-xl bg-[#00F0FF]/20 border border-[#00F0FF]/40 flex items-center justify-center shrink-0">
                          {getActionIcon(link.icon)}
                        </div>
                        <div>
                          <div className="text-xs sm:text-sm font-black text-inherit">
                            {link.label}
                          </div>
                          {link.description && (
                            <div className="text-[11px] opacity-70">
                              {link.description}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-xs font-bold text-[#00F0FF] shrink-0">
                        <span>מעבר</span>
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* 4 DYNAMIC FOLLOW-UP RECOMMENDATIONS RETURNED BY SERVER */}
              {msg.recommendations && msg.recommendations.length > 0 && (
                <div className="w-full mt-3 space-y-1 pl-2">
                  <div className="text-[11px] font-bold opacity-60 px-1">
                    צעדים הבאים מומלצים:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {msg.recommendations.slice(0, 4).map((rec, rIdx) => (
                      <button
                        key={rIdx}
                        onClick={() => submitQuery(rec)}
                        className={`text-right p-2 rounded-xl border text-xs font-semibold truncate transition-all cursor-pointer hover:border-[#00F0FF] ${
                          isDark
                            ? 'bg-[#12162B]/60 border-[#1A2B4C] text-[#F0F4FF]/80 hover:text-white'
                            : 'bg-white border-[#CBD5E1] text-[#0A0D18]/80 hover:text-black'
                        }`}
                      >
                        {rec}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Loading Indicator */}
          {loading && (
            <div className="flex items-center gap-2 p-3 rounded-2xl bg-[#00F0FF]/10 border border-[#00F0FF]/30 text-xs font-bold text-[#00F0FF] animate-pulse max-w-fit">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>מאתר פעולות ומידע בשרת הוקטורי...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* FOOTER: Search Bar + Voice STT + Submit */}
        <footer className="p-3 border-t border-inherit/20 shrink-0 bg-inherit/95">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submitQuery(inputQuery);
            }}
            className="flex items-center gap-2"
          >
            {/* STT Voice Button */}
            <button
              type="button"
              onClick={toggleVoiceListening}
              className={`p-2.5 rounded-2xl border transition-all cursor-pointer active:scale-95 ${
                isListening
                  ? 'bg-rose-500 text-white border-rose-400 animate-pulse shadow-[0_0_15px_rgba(244,63,94,0.6)]'
                  : isDark
                  ? 'bg-[#12162B] border-[#1A2B4C] hover:border-[#00F0FF] text-[#00F0FF]'
                  : 'bg-[#F1F5F9] border-[#CBD5E1] hover:border-[#00B4D8] text-[#007A8A]'
              }`}
              title={isListening ? 'מקליט... לחץ לעצירה' : 'הקלטה קולית (STT)'}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            {/* Free-text input */}
            <input
              ref={inputRef}
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder={isListening ? 'מקשיב לך...' : 'שאל על פעולות, נכסים או הדרכה...'}
              className={`flex-1 min-h-[46px] px-4 rounded-2xl border text-sm font-medium focus:outline-none transition-colors ${
                isDark
                  ? 'bg-[#12162B] border-[#1A2B4C] focus:border-[#00F0FF] text-[#F0F4FF] placeholder-[#F0F4FF]/40'
                  : 'bg-[#F8FAFC] border-[#CBD5E1] focus:border-[#00B4D8] text-[#0A0D18] placeholder-stone-400'
              }`}
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={!inputQuery.trim() || loading}
              className={`p-2.5 min-w-[46px] min-h-[46px] rounded-2xl font-bold flex items-center justify-center transition-all cursor-pointer active:scale-95 ${
                inputQuery.trim() && !loading
                  ? 'bg-[#00F0FF] text-[#070913] hover:brightness-110 shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                  : 'bg-inherit/40 opacity-40 border border-inherit/30 cursor-not-allowed'
              }`}
            >
              <Send className="w-5 h-5 rotate-180" />
            </button>
          </form>
        </footer>
      </div>
    </div>
  );
};
