import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Mic,
  MicOff,
  X,
  Sparkles,
  Loader2,
  CheckCircle2,
  TrendingUp,
  Globe,
  Wand2,
  Bot,
  Copy,
  CornerDownLeft,
} from 'lucide-react';
import { BrandDna } from '../types/brand';
import { sound } from '../utils/audio';

export type BrandAgentType = 'competitor' | 'content' | 'discovery' | 'general';

interface BrandAgentChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  agentType: BrandAgentType;
  agentTitle: string;
  agentIcon: React.ComponentType<{ className?: string; size?: number }>;
  isDark: boolean;
  brandDna: BrandDna;
  onApplyUvp?: (uvp: string) => void;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  suggestedAction?: {
    type: 'apply_uvp';
    payload: string;
  };
}

// Initial 3 Dynamic Recommendations tailored per agent type and current brand state
const GET_INITIAL_RECOMMENDATIONS = (agentType: BrandAgentType, brandDna: BrandDna): [string, string, string] => {
  const brandName = brandDna.identity.companyName || 'המותג שלנו';

  switch (agentType) {
    case 'competitor':
      return [
        'נתח 3 פערי שוק מרכזיים שהמתחרים מפספסים',
        'חדד את הצעת הערך הייחודית (UVP) מול המתחרים',
        'מהם 3 הצעדים המעשיים לתפיסת הובלה בשוק?',
      ];
    case 'content':
      return [
        'חולל 3 כותרות גיבור (Hero) ממירות לעמוד הבית',
        'נסח פסקת פתיחה חזקה שמעלימה את התנגדות המחיר',
        'הצע 3 נקודות ערך מבוססות מילות הכוח של המותג',
      ];
    case 'discovery':
      return [
        'חלץ והגדר את ייעוד העסק והחזון במשפט אחד מנצח',
        'זהה את פרסונת הלקוח האידיאלית ואת הכאב המרכזי',
        'גבש 5 מילות כוח ייחודיות לשפת המותג שלנו',
      ];
    case 'general':
    default:
      return [
        `סקור את ה-DNA של ${brandName} והצע מה לחזק`,
        'חדד את הסלוגן והצעת הערך לשפה חדה וממירה',
        'בדוק התאמה בין קול המותג לקהל היעד המרכזי',
      ];
  }
};

export const BrandAgentChatModal: React.FC<BrandAgentChatModalProps> = ({
  isOpen,
  onClose,
  agentType,
  agentTitle,
  agentIcon: AgentIcon,
  isDark,
  brandDna,
  onApplyUvp,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isAiResponding, setIsAiResponding] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // 3 Dynamic Recommendations State (starts with 3, refreshed by system after every AI turn)
  const [recommendations, setRecommendations] = useState<[string, string, string]>(() =>
    GET_INITIAL_RECOMMENDATIONS(agentType, brandDna)
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize opening greeting message when modal opens
  useEffect(() => {
    if (!isOpen) return;

    const brandName = brandDna.identity.companyName || 'KOSUN';
    const initRecs = GET_INITIAL_RECOMMENDATIONS(agentType, brandDna);
    setRecommendations(initRecs);

    let initialGreeting = `שלום, אני ${agentTitle}. מחובר בזמן אמת ל-DNA של ${brandName}. כיצד נרצה לקדם את המותג עכשיו? באפשרותך לבחור באחת מ-3 ההמלצות הדינמיות למטה או להקליד/להקליט כל שאלה.`;

    if (agentType === 'competitor') {
      initialGreeting = `שלום, אני סוכן מחקר שוק ומתחרים עבור ${brandName}. סרקתי את הנתונים ומוכן לנתח פערי שוק, חולשות של מתחרים וזוויות בידול. בחר אחת מ-3 ההמלצות או שאל בחופשיות.`;
    } else if (agentType === 'content') {
      initialGreeting = `שלום, אני סוכן אסטרטגיית תוכן וכותרות עבור ${brandName}. לרשותך מחולל כותרות גיבור, הצעות ערך ממירות ופסקאות פתיחה מבוססות קול המותג.`;
    } else if (agentType === 'discovery') {
      initialGreeting = `שלום, אני סוכן גילוי וחילוץ DNA מותגי. ספר לי בקצרה על השירותים שלך או בחר המלצה כדי שנחלץ יחד זהות מותג עוצמתית.`;
    }

    setMessages([
      {
        id: `msg-init-${Date.now()}`,
        role: 'assistant',
        content: initialGreeting,
        timestamp: new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  }, [isOpen, agentType, brandDna.identity.companyName]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAiResponding]);

  // STT (Speech-To-Text) Web Speech API Setup
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'he-IL';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage((prev) => (prev ? `${prev} ${transcript}` : transcript));
        sound.playTaskComplete();
        setIsListening(false);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
    };
  }, []);

  const toggleSpeechRecognition = () => {
    sound.playPop();
    if (!recognitionRef.current) {
      // Fallback hint
      setInputMessage((prev) => (prev ? `${prev} ` : 'נתח את המתחרים המובילים שלי בשוק'));
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch {
        setIsListening(false);
      }
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const content = (textToSend || inputMessage).trim();
    if (!content || isAiResponding) return;

    sound.playPop();
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputMessage('');
    setIsAiResponding(true);

    try {
      const response = await fetch('/api/brand/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newHistory.map((m) => ({ role: m.role, content: m.content })),
          brand: brandDna,
          agentType,
        }),
      });

      if (!response.ok) throw new Error('Failed to get agent response');
      const data = await response.json();

      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: data.reply || 'הבנתי, המידע עובד ועודכן.',
        timestamp: new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
      sound.playTaskComplete();

      // Update the 3 dynamic recommendations with fresh ones from server
      if (Array.isArray(data.recommendations) && data.recommendations.length >= 3) {
        setRecommendations([
          data.recommendations[0],
          data.recommendations[1],
          data.recommendations[2],
        ]);
      }
    } catch (err) {
      console.error('Agent chat error:', err);
      const errorMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: 'עיבדתי את המידע עבור המותג שלך. כיצד נרצה להמשיך?',
        timestamp: new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsAiResponding(false);
    }
  };

  const handleRecommendationClick = (recText: string) => {
    sound.playPop();
    handleSendMessage(recText);
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    sound.playPop();
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div
        className={`w-full max-w-lg h-[92vh] max-h-[720px] rounded-3xl border flex flex-col justify-between overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200 ${
          isDark
            ? 'bg-[#0D0E1F] border-[#1A2B4C] text-[#F0F4FF] shadow-[0_0_45px_rgba(0,0,0,0.85)]'
            : 'bg-white border-[#CBD5E1] text-[#0A0D18] shadow-2xl'
        }`}
        dir="rtl"
      >
        {/* =========================================================================
            AGENT CHAT HEADER
            ========================================================================= */}
        <header
          className={`shrink-0 px-4 py-3 border-b flex items-center justify-between transition-colors ${
            isDark ? 'border-[#1A2B4C] bg-[#12162B]/80' : 'border-[#E2E8F0] bg-[#F8FAFC]'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-[#00F0FF]/15 border border-[#00F0FF]/40 text-[#00F0FF] flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(0,240,255,0.25)]">
              <AgentIcon className="w-5 h-5" />
            </div>
            <div className="min-w-0 text-right">
              <h3 className="text-sm sm:text-base font-bold truncate tracking-tight text-inherit flex items-center gap-1.5">
                <span>{agentTitle}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              </h3>
              <p className="text-[10px] font-mono text-[#00F0FF] truncate">
                AI AGENT · KOSBRAND DNA ACTIVE
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playPop();
              onClose();
            }}
            className={`p-2 rounded-xl border transition-colors cursor-pointer shrink-0 ${
              isDark
                ? 'bg-[#0D0E1F] border-[#1A2B4C] text-[#F0F4FF]/70 hover:text-white hover:border-[#00F0FF]'
                : 'bg-white border-[#CBD5E1] text-stone-600 hover:text-black hover:border-[#00B4D8]'
            }`}
            aria-label="סגור שיחה"
            title="סגור"
          >
            <X className="w-4 h-4" />
          </button>
        </header>

        {/* =========================================================================
            MESSAGES CONVERSATION AREA
            ========================================================================= */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-start' : 'items-end'} animate-in fade-in duration-150`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed relative group ${
                    isUser
                      ? 'bg-gradient-to-r from-[#00F0FF] to-[#00A3FF] text-[#070913] font-bold rounded-tl-xs shadow-[0_0_15px_rgba(0,240,255,0.25)]'
                      : isDark
                      ? 'bg-[#12162B] border border-[#1A2B4C] text-[#F0F4FF] rounded-tr-xs'
                      : 'bg-[#F1F5F9] border border-[#E2E8F0] text-[#0A0D18] rounded-tr-xs'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>

                  {/* Copy helper icon on assistant messages */}
                  {!isUser && (
                    <div className="mt-2 pt-1 border-t border-inherit/20 flex items-center justify-between text-[10px] opacity-70">
                      <span>{msg.timestamp}</span>
                      <button
                        onClick={() => handleCopyMessage(msg.id, msg.content)}
                        className="flex items-center gap-1 hover:text-[#00F0FF] transition-colors cursor-pointer"
                        title="העתק ללוח"
                      >
                        <Copy className="w-3 h-3" />
                        <span>{copiedId === msg.id ? 'הועתק!' : 'העתק'}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* AI Thinking typing indicator */}
          {isAiResponding && (
            <div className="flex items-end gap-2 animate-in fade-in duration-150">
              <div
                className={`rounded-2xl p-3 text-xs flex items-center gap-2 border ${
                  isDark
                    ? 'bg-[#12162B] border-[#1A2B4C] text-[#00F0FF]'
                    : 'bg-[#F1F5F9] border-[#CBD5E1] text-[#007A8A]'
                }`}
              >
                <Loader2 className="w-4 h-4 animate-spin text-[#00F0FF]" />
                <span className="font-semibold">הסוכן מעבד וסורק נתונים...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* =========================================================================
            BOTTOM CONTROL PANEL:
            1. 3 DYNAMIC SYSTEM RECOMMENDATIONS (שמתנהל על ידי 3 המלצות דינמיות מהמערכת)
            2. BEAUTIFUL TEXT INPUT WITH STT (ושדה טקסט יפה עם אפשרות STT)
            ========================================================================= */}
        <footer
          className={`shrink-0 p-3 sm:p-4 border-t space-y-2.5 transition-colors ${
            isDark ? 'border-[#1A2B4C] bg-[#070913]/90' : 'border-[#E2E8F0] bg-white'
          }`}
        >
          {/* THE 3 DYNAMIC SYSTEM RECOMMENDATIONS */}
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold tracking-wider text-[#00F0FF] flex items-center gap-1 px-1">
              <Sparkles className="w-3 h-3" />
              <span>3 המלצות פעולה מהמערכת:</span>
            </span>

            <div className="flex flex-col gap-1.5">
              {recommendations.map((rec, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleRecommendationClick(rec)}
                  disabled={isAiResponding}
                  className={`w-full px-3 py-1.5 rounded-xl text-right text-xs font-semibold border transition-all cursor-pointer flex items-center justify-between group active:scale-[0.99] disabled:opacity-50 ${
                    isDark
                      ? 'bg-[#12162B] border-[#1A2B4C] text-[#F0F4FF]/80 hover:text-[#00F0FF] hover:border-[#00F0FF]/50 hover:bg-[#161B35]'
                      : 'bg-[#F8FAFC] border-[#CBD5E1] text-[#0A0D18]/80 hover:text-[#007A8A] hover:border-[#00B4D8] hover:bg-white'
                  }`}
                >
                  <span className="truncate pr-1">{rec}</span>
                  <span className="text-[10px] font-mono text-[#00F0FF] opacity-60 group-hover:opacity-100 group-hover:-translate-x-1 transition-all shrink-0">
                    הפעל ↵
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* BEAUTIFUL CAPSULE INPUT FIELD WITH STT & SEND */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2 pt-1"
          >
            <div
              className={`flex-1 min-h-[46px] px-3.5 rounded-2xl border flex items-center gap-2.5 transition-all shadow-inner ${
                isDark
                  ? 'bg-[#0D0E1F] border-[#1A2B4C] focus-within:border-[#00F0FF]'
                  : 'bg-[#F8FAFC] border-[#CBD5E1] focus-within:border-[#00B4D8]'
              }`}
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="שאל את הסוכן או הזן פקודה חופשית..."
                disabled={isAiResponding}
                className={`w-full bg-transparent text-xs sm:text-sm font-semibold focus:outline-none placeholder:text-inherit placeholder:opacity-40 ${
                  isDark ? 'text-white' : 'text-[#0A0D18]'
                }`}
              />

              {/* Integrated STT Microphone Toggle */}
              <button
                type="button"
                onClick={toggleSpeechRecognition}
                className={`p-1.5 rounded-xl border transition-all cursor-pointer shrink-0 ${
                  isListening
                    ? 'bg-rose-500/20 border-rose-500 text-rose-400 animate-pulse'
                    : isDark
                    ? 'bg-[#12162B] border-[#1A2B4C] text-[#00F0FF] hover:border-[#00F0FF]/50'
                    : 'bg-white border-[#CBD5E1] text-[#007A8A] hover:border-[#00B4D8]'
                }`}
                aria-label="הפעלה קולית STT"
                title={isListening ? 'מקשיב... לחץ לסיום' : 'הקלט הודעה'}
              >
                {isListening ? (
                  <MicOff className="w-4 h-4 text-rose-400" />
                ) : (
                  <Mic className="w-4 h-4 text-[#00F0FF]" />
                )}
              </button>
            </div>

            {/* Send Button */}
            <button
              type="submit"
              disabled={!inputMessage.trim() || isAiResponding}
              className="min-h-[46px] min-w-[46px] rounded-2xl bg-gradient-to-r from-[#00F0FF] to-[#00A3FF] hover:brightness-110 disabled:opacity-30 text-[#070913] font-bold flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.35)] transition-all cursor-pointer active:scale-95 shrink-0"
              aria-label="שלח לסוכן"
              title="שלח"
            >
              <Send className="w-4 h-4 rotate-180" />
            </button>
          </form>
        </footer>
      </div>
    </div>
  );
};
