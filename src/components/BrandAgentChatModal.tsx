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
import { getTerminology } from '../../KOSUN2026/factory/pageTerminologyDictionary';

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
  archetypeId?: string;
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
  archetypeId = 'saas',
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

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputMessage((prev) => (prev ? `${prev} ${transcript}` : transcript));
          sound.playPop();
        }
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleSpeechRecognition = () => {
    sound.playPop();
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
      } catch {
        // already started
      }
    }
  };

  const handleCopyMessage = (id: string, text: string) => {
    sound.playPop();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isAiResponding) return;

    sound.playPop();

    const userMessage: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsAiResponding(true);

    // Call AI engine
    setTimeout(() => {
      generateAgentResponse(text);
    }, 850);
  };

  const handleRecommendationClick = (recommendationText: string) => {
    handleSendMessage(recommendationText);
  };

  const generateAgentResponse = (userPrompt: string) => {
    const brandName = brandDna.identity.companyName || 'המותג שלנו';
    const industry = brandDna.identity.industry || 'התחום שלך';
    const currentUvp = brandDna.strategy.uniqueValueProposition || 'פתרון חדשני ומותאם אישית';

    let reply = '';
    let action: { type: 'apply_uvp'; payload: string } | undefined = undefined;
    let newRecs: [string, string, string] = [
      'העמק עוד על הצעד הראשון',
      'כיצד זה מתחבר לקמפיין הפרסום?',
      'הצע ניסוח חלופי קצר וממוקד יותר',
    ];

    if (agentType === 'competitor') {
      reply = `סרקתי את שוק ה-${industry} ביחס למתחרים. הפער הגדול ביותר זוהה בנושא זמני תגובה ושירות פרסונלי.\n\n3 הזדמנויות מרכזיות ל-${brandName}:\n1. מיתוג מוביל חוויה - הלקוחות בשוק מחפשים מענה מידי ללא בירוקרטיה.\n2. שקיפות מחירים מודולרית - רוב המתחרים מסתירים עלויות ראשוניות.\n3. אוטומציה היברידית - שילוב כוח ה-AI לחיסכון של 40% מזמן ההמתנה.\n\nהמלצה חמה: כדאי לעדכן את הצעת הערך כדי להבליט את היתרון הזה.`;
      action = {
        type: 'apply_uvp',
        payload: `הפתרון המוביל ב${industry} המעניק זמינות מלאה, שקיפות וביצוע ב-40% פחות זמן.`,
      };
      newRecs = [
        'החל את הצעת הערך החדשה על פרופיל המותג',
        'מהם 3 חסמי הכניסה של המתחרים כרגע?',
        'הצע קמפיין מודעות שמדגיש את היתרון הזה',
      ];
    } else if (agentType === 'content') {
      reply = `הנה 3 הצעות תוכן חדות וממירות עבור ${brandName}:\n\n1. כותרת Hero מנצחת:\n"להשיג תוצאות ב-${industry} בלי כאבי הראש שליוו אותך עד היום."\n\n2. פסקת פתיחה לחיבור רגשי:\n"אנחנו יודעים כמה זמן ואנרגיה מושקעים בניסיונות למצוא פתרון אמין. לכן יצרנו תהליך מדויק, חלק ומוכח שעובד בשבילך מהרגע הראשון."\n\n3. קריאה לפעולה (CTA):\n"התחל עכשיו ב-3 צעדים פשוטים וקבל תוכנית פעולה מותאמת."`;
      newRecs = [
        'שמור את כותרת ה-Hero כברירת מחדל לעמוד',
        'כתוב פוסט לרשתות חברתיות סביב הכותרת הזו',
        'הצע 3 מיילים לסדרת מסרים קרה',
      ];
    } else if (agentType === 'discovery') {
      reply = `מתוך הניתוח המעמיק של מאפייני המותג:\n\n• אישיות המותג: סמכותי, חם, מתקדם ומעורר ביטחון.\n• קהל היעד המוביל: מקבלי החלטות המחפשים תוצאה ברורה ולא רק הבטחות.\n• מילת הכוח המובילה: "וודאות".\n\nהחזון המזוקק: להוביל את תחום ה-${industry} באמצעות פתרונות מהירים המעניקים שקט נפשי וערך עסקי מדיד.`;
      newRecs = [
        'עדכן את מילות הכוח ב-DNA המותגי',
        'כיצד נשקף את החזון הזה בטקסטים של עמוד הבית?',
        'הצע סלוגן קצר של 3 מילים',
      ];
    } else {
      reply = `ניתחתי את ה-DNA המותגי של ${brandName}. המבנה יציב ומדויק, עם התאמה טובה לקהל ב-${industry}.\n\nההמלצה שלי כעת היא לוודא שכל אלמנט בדף הבית - מכותרת ה-Hero ועד לטופס הקליטה - מדבר באותה שפה אחידה ומעביר את ערך הוודאות והביצוע המהיר.`;
      newRecs = [
        'בצע בדיקת עקביות בכל עמודי המערכת',
        'חדד את הצעת הערך עבור ערוצי המובייל',
        'הצע רענון צבעוני המתאים לקול המותג',
      ];
    }

    const aiMessage: ChatMessage = {
      id: `msg-ai-${Date.now()}`,
      role: 'assistant',
      content: reply,
      timestamp: new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }),
      suggestedAction: action,
    };

    setMessages((prev) => [...prev, aiMessage]);
    setRecommendations(newRecs);
    setIsAiResponding(false);
    sound.playTaskComplete();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-[#070913]/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-2xl h-[92vh] max-h-[760px] rounded-3xl border flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 transition-colors ${
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
                {getTerminology('brand_agent_header_tag', archetypeId)}
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
            aria-label={getTerminology('brand_agent_close_label', archetypeId)}
            title={getTerminology('quick_capture_close_btn', archetypeId)}
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
                        title={getTerminology('brand_agent_copy_tooltip', archetypeId)}
                      >
                        <Copy className="w-3 h-3" />
                        <span>
                          {copiedId === msg.id
                            ? getTerminology('brand_agent_copied_text', archetypeId)
                            : getTerminology('brand_agent_copy_text', archetypeId)}
                        </span>
                      </button>
                    </div>
                  )}

                  {/* Optional Action Button embedded inside agent response */}
                  {!isUser && msg.suggestedAction && msg.suggestedAction.type === 'apply_uvp' && onApplyUvp && (
                    <div className="mt-3 pt-2.5 border-t border-inherit/20 flex justify-end">
                      <button
                        onClick={() => {
                          sound.playPop();
                          onApplyUvp(msg.suggestedAction!.payload);
                        }}
                        className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#00F0FF] to-[#00A3FF] text-[#070913] font-black text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,240,255,0.3)] hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>החל הצעת ערך זו על המותג</span>
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
                <span className="font-semibold">{getTerminology('brand_agent_thinking_text', archetypeId)}</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* =========================================================================
            BOTTOM CONTROL PANEL:
            1. 3 DYNAMIC SYSTEM RECOMMENDATIONS
            2. BEAUTIFUL TEXT INPUT WITH STT
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
              <span>{getTerminology('brand_agent_recs_heading', archetypeId)}</span>
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
                    {getTerminology('brand_agent_rec_action_btn', archetypeId)}
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
                placeholder={getTerminology('brand_agent_input_placeholder', archetypeId)}
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
                title={
                  isListening
                    ? getTerminology('brand_agent_mic_title_active', archetypeId)
                    : getTerminology('brand_agent_mic_title_idle', archetypeId)
                }
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
              aria-label={getTerminology('brand_agent_send_tooltip', archetypeId)}
              title={getTerminology('brand_agent_send_tooltip', archetypeId)}
            >
              <Send className="w-4 h-4 rotate-180" />
            </button>
          </form>
        </footer>
      </div>
    </div>
  );
};
