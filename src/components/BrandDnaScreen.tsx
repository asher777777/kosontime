import React, { useState, useEffect, useRef } from 'react';
import {
  Wand2,
  Sliders,
  Target,
  Layers,
  Globe,
  TrendingUp,
  Sparkles,
  MessageSquare,
  Palette,
  Cloud,
  Package,
  ShieldCheck,
  RotateCcw,
  Check,
  X,
  Mic,
  MicOff,
  ChevronLeft,
  ArrowRight,
  Loader2,
  Users,
  ShieldAlert,
  Search,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useBrand } from '../context/BrandContext';
import { useTheme } from '../context/ThemeContext';
import { sound } from '../utils/audio';
import { BrandAgentChatModal, BrandAgentType } from './BrandAgentChatModal';

// Progressive Disclosure Window Identifiers
export type KosBrandWindow =
  | 'hub' // Window 1: Main Hub
  | 'ai_extractor' // Window 2: AI Extractor & Strategy
  | 'voice_personality' // Window 3: Voice, Personality & Design Tokens
  | 'ecosystem_trust' // Window 4: Ecosystem, Products & Trust Credentials
  | 'audience_research'; // Window 5: Target Audience & Market Positioning

interface TooltipModalData {
  title: string;
  guidance: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  onConfirm: () => void;
}

interface BrandDnaScreenProps {
  onNavigateHome?: () => void;
}

export const BrandDnaScreen: React.FC<BrandDnaScreenProps> = ({ onNavigateHome }) => {
  const {
    brandDna,
    completenessScore,
    isSaving,
    updateVoice,
    updateAudience,
    updateEcosystem,
    updateDesignTokens,
    updateTrust,
    saveBrandDna,
    resetToDefaults,
  } = useBrand();

  const { isDark } = useTheme();

  // Active Window Navigation (Progressive Disclosure)
  const [currentWindow, setCurrentWindow] = useState<KosBrandWindow>('hub');

  // Universal Navigation Helper State
  const [searchCommand, setSearchCommand] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Status Toast State
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  // Floating Contextual Guidance Tooltip Modal (Constraint 5: exactly 2 buttons ✓ and X)
  const [activeTooltip, setActiveTooltip] = useState<TooltipModalData | null>(null);

  // Dedicated AI Agent Chat Modal State (Driven by 3 dynamic recommendations + STT)
  const [agentChatModal, setAgentChatModal] = useState<{
    isOpen: boolean;
    type: BrandAgentType;
    title: string;
    icon: React.ComponentType<{ className?: string; size?: number }>;
  }>({
    isOpen: false,
    type: 'general',
    title: 'סוכן מותג AI',
    icon: Wand2,
  });

  // Interactive Sub-Panels (Within Window 3 & 4)
  const [voiceSliderPanelOpen, setVoiceSliderPanelOpen] = useState(false);
  const [wordsManagerOpen, setWordsManagerOpen] = useState(false);
  const [newWordInput, setNewWordInput] = useState('');
  const [resetModalOpen, setResetModalOpen] = useState(false);

  // STT (Speech-To-Text) Web Speech API Setup for Top Universal Search
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
        setSearchCommand(transcript);
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
      setSearchCommand((prev) => (prev ? '' : 'סוכן מחקר שוק'));
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

  const showStatus = (message: string) => {
    setStatusNotice(message);
    setTimeout(() => setStatusNotice(null), 3000);
  };

  // Open the Interactive AI Agent Chat Modal
  const openAgentChat = (
    type: BrandAgentType,
    title: string,
    icon: React.ComponentType<{ className?: string; size?: number }>
  ) => {
    sound.playPop();
    setAgentChatModal({
      isOpen: true,
      type,
      title,
      icon,
    });
  };

  // Instant Cloud Sync (Constraint 6: saveNow)
  const handleSaveNow = async () => {
    sound.playPop();
    const ok = await saveBrandDna();
    if (ok) {
      sound.playTaskComplete();
      showStatus('הנתונים סונכרנו בהצלחה לענן!');
    } else {
      showStatus('שגיאה בסנכרון. נסה שוב.');
    }
  };

  // System Reset Confirmation
  const handleConfirmReset = async () => {
    sound.playPop();
    await resetToDefaults();
    setResetModalOpen(false);
    sound.playTaskComplete();
    showStatus('נתוני ה-DNA אופסו להגדרות ברירת המחדל.');
  };

  // Tooltip Opener Helper (Constraint 5)
  const openTooltip = (
    title: string,
    guidance: string,
    icon: React.ComponentType<{ className?: string; size?: number }>,
    onConfirm: () => void
  ) => {
    sound.playPop();
    setActiveTooltip({ title, guidance, icon, onConfirm });
  };

  return (
    <div
      className={`h-[calc(100vh-62px)] max-h-[calc(100vh-62px)] w-full max-w-xl mx-auto flex flex-col justify-between p-2.5 sm:p-4 select-none overflow-hidden transition-colors duration-200 font-sans ${
        isDark ? 'bg-[#070913] text-[#F0F4FF]' : 'bg-[#F4F6FB] text-[#0A0D18]'
      }`}
      dir="rtl"
    >
      {/* =========================================================================
          TOP UNIVERSAL NAVIGATION HELPER (Constraint 3)
          Integrated free-text search/command input + Speech-To-Text (STT) mic toggle
          ========================================================================= */}
      <header className="shrink-0 mb-2 space-y-1.5">
        <div className="flex items-center gap-2">
          {/* Back button when not in Hub */}
          {currentWindow !== 'hub' ? (
            <button
              onClick={() => {
                sound.playPop();
                setCurrentWindow('hub');
              }}
              className={`min-h-[44px] min-w-[44px] rounded-2xl flex items-center justify-center border transition-all cursor-pointer active:scale-95 shrink-0 ${
                isDark
                  ? 'bg-[#0D0E1F] border-[#1A2B4C] text-[#00F0FF] hover:border-[#00F0FF]'
                  : 'bg-white border-[#CBD5E1] text-[#007A8A] hover:border-[#00B4D8]'
              }`}
              aria-label="חזרה ללוח ראשי"
              title="חזרה ללוח ראשי"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            onNavigateHome && (
              <button
                onClick={() => {
                  sound.playPop();
                  onNavigateHome();
                }}
                className={`min-h-[44px] min-w-[44px] rounded-2xl flex items-center justify-center border transition-all cursor-pointer active:scale-95 shrink-0 ${
                  isDark
                    ? 'bg-[#0D0E1F] border-[#1A2B4C] text-[#00F0FF] hover:border-[#00F0FF]'
                    : 'bg-white border-[#CBD5E1] text-[#007A8A] hover:border-[#00B4D8]'
                }`}
                aria-label="ראשי"
                title="ראשי"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            )
          )}

          {/* Integrated Search / Command Input */}
          <div
            className={`flex-1 min-h-[44px] px-3.5 rounded-2xl border flex items-center gap-2.5 transition-all ${
              isDark
                ? 'bg-[#0D0E1F] border-[#1A2B4C] focus-within:border-[#00F0FF] shadow-inner'
                : 'bg-white border-[#CBD5E1] focus-within:border-[#00B4D8] shadow-xs'
            }`}
          >
            <Search className="w-4 h-4 text-[#00F0FF] shrink-0" />
            <input
              type="text"
              value={searchCommand}
              onChange={(e) => setSearchCommand(e.target.value)}
              placeholder="פקודה או חיפוש רכיב מותג..."
              className={`w-full bg-transparent text-xs sm:text-sm font-semibold focus:outline-none placeholder:text-inherit placeholder:opacity-40 ${
                isDark ? 'text-white' : 'text-[#0A0D18]'
              }`}
            />
            {searchCommand && (
              <button
                onClick={() => setSearchCommand('')}
                className="text-inherit opacity-40 hover:opacity-100 p-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Speech-To-Text (STT) Toggle Microphone */}
          <button
            onClick={toggleSpeechRecognition}
            className={`min-h-[44px] min-w-[44px] rounded-2xl flex items-center justify-center border transition-all cursor-pointer active:scale-95 shrink-0 ${
              isListening
                ? 'bg-rose-500/20 border-rose-500 text-rose-400 animate-pulse shadow-[0_0_15px_rgba(244,63,94,0.5)]'
                : isDark
                ? 'bg-[#0D0E1F] border-[#1A2B4C] text-[#00F0FF] hover:border-[#00F0FF]/50'
                : 'bg-white border-[#CBD5E1] text-[#007A8A] hover:border-[#00B4D8]'
            }`}
            aria-label="הפעלה קולית (STT)"
            title={isListening ? 'מקשיב... לחץ לעצירה' : 'הפעל זיהוי קולי'}
          >
            {isListening ? <MicOff className="w-5 h-5 text-rose-400" /> : <Mic className="w-5 h-5" />}
          </button>
        </div>

        {/* Real-time Status / Loading Toast */}
        {statusNotice && (
          <div className="px-3 py-1.5 rounded-xl bg-[#00F0FF]/15 border border-[#00F0FF]/40 text-[#00F0FF] text-xs font-bold flex items-center justify-center gap-1.5 animate-in fade-in">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{statusNotice}</span>
          </div>
        )}
      </header>

      {/* =========================================================================
          WINDOW 1: MAIN HUB (Constraint 6: Main Hub)
          - DNA Completeness Gauge (dynamic circular progress ring 0-100%)
          - Exactly 4 Full-Width Horizontal Row Buttons
          ========================================================================= */}
      {currentWindow === 'hub' && (
        <div className="flex-1 flex flex-col justify-between py-1 overflow-hidden animate-in fade-in duration-150">
          {/* Minimalist Data Presentation: DNA Completeness Circular Progress Ring */}
          <div className="shrink-0 flex flex-col items-center justify-center py-2">
            <div className="relative flex items-center justify-center">
              {/* Dopamine Pulsing Glow during AI/Save loading states */}
              <div
                className={`absolute w-24 h-24 rounded-full blur-xl transition-opacity duration-500 ${
                  isSaving
                    ? 'opacity-80 animate-pulse bg-[#00F0FF]/40'
                    : 'opacity-20 bg-[#00F0FF]/25'
                }`}
              />

              <DnaCircularGauge
                score={completenessScore}
                isAiLoading={isSaving}
                isDark={isDark}
              />
            </div>

            <div className="mt-1 text-center">
              <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-[#00F0FF]">
                KOSBRAND · BRAND DNA
              </span>
              <p
                className={`text-xs font-bold truncate max-w-[280px] mx-auto ${
                  isDark ? 'text-white/80' : 'text-[#0A0D18]/80'
                }`}
              >
                {brandDna.identity.companyName || 'זהות מותג בפיתוח'}
              </p>
            </div>
          </div>

          {/* EXACTLY 4 FULL-WIDTH HORIZONTAL ROW BUTTONS (Constraint 1 & 6) */}
          <div className="flex-1 flex flex-col justify-center gap-2.5 max-h-[320px]">
            {/* Button 1: [Wand Icon] AI Brand Discovery & Web Scraper */}
            <RowActionButton
              icon={Wand2}
              title="חילוץ ואשף AI למותג"
              badge="Web & Scraper"
              isDark={isDark}
              onIconClick={() =>
                openTooltip(
                  'חילוץ ואשף AI למותג',
                  'סורק אתרי אינטרנט ומחלץ אוטומטית שפת מותג, סלוגן ומיצוב עסקי.',
                  Wand2,
                  () => setCurrentWindow('ai_extractor')
                )
              }
              onClick={() => {
                sound.playPop();
                setCurrentWindow('ai_extractor');
              }}
            />

            {/* Button 2: [Sliders Icon] Brand Voice, Personality & Design Tokens */}
            <RowActionButton
              icon={Sliders}
              title="קול מותג, אישיות וטוקנים"
              badge="4 סליידרים + צבע"
              isDark={isDark}
              onIconClick={() =>
                openTooltip(
                  'קול מותג, אישיות וטוקנים',
                  'כיוונון 4 סליידרים של שפת המותג, מילות כוח, פלטת צבעי סייבר וסנכרון ענן.',
                  Sliders,
                  () => setCurrentWindow('voice_personality')
                )
              }
              onClick={() => {
                sound.playPop();
                setCurrentWindow('voice_personality');
              }}
            />

            {/* Button 3: [Target Icon] Target Audience, Personas & Market Research Agent */}
            <RowActionButton
              icon={Target}
              title="קהל יעד, פרסונות ומחקר שוק"
              badge="בידול ו-UVP"
              isDark={isDark}
              onIconClick={() =>
                openTooltip(
                  'קהל יעד, פרסונות ומחקר שוק',
                  'הגדרת הצעת ערך ייחודית, ניתוח כאבי לקוח ומענה מוחץ להתנגדויות.',
                  Target,
                  () => setCurrentWindow('audience_research')
                )
              }
              onClick={() => {
                sound.playPop();
                setCurrentWindow('audience_research');
              }}
            />

            {/* Button 4: [Layers Icon] Ecosystem, Products & Trust Credentials */}
            <RowActionButton
              icon={Layers}
              title="אקוסיסטם, מוצרים ואמינות"
              badge="שירותים וסליקה"
              isDark={isDark}
              onIconClick={() =>
                openTooltip(
                  'אקוסיסטם, מוצרים ואמינות',
                  'מיפוי שירותי ליבה, חבילות מחיר, פרטי ח.פ ומדיניות החזרים ברורה.',
                  Layers,
                  () => setCurrentWindow('ecosystem_trust')
                )
              }
              onClick={() => {
                sound.playPop();
                setCurrentWindow('ecosystem_trust');
              }}
            />
          </div>
        </div>
      )}

      {/* =========================================================================
          WINDOW 2: AI EXTRACTOR & STRATEGY (Constraint 6: Window 2)
          4 Full-Width Row Buttons:
          1. URL / Social Media Scraper
          2. Discovery Wizard (Opens Agent Chat)
          3. Competitor Research Agent (Opens Agent Chat)
          4. Content Strategy Generator (Opens Agent Chat)
          ========================================================================= */}
      {currentWindow === 'ai_extractor' && (
        <div className="flex-1 flex flex-col justify-between py-1 overflow-hidden animate-in fade-in duration-150">
          <SubWindowHeader
            title="חילוץ ואסטרטגיה AI"
            badge="02 · EXTRACTOR"
            isDark={isDark}
          />

          <div className="flex-1 flex flex-col justify-center gap-2.5 max-h-[360px]">
            {/* Row 1: URL / Social Media Scraper */}
            <RowActionButton
              icon={Globe}
              title="סוכן חילוץ מכתובת אתר / רשת"
              badge="Web Extractor Agent"
              isDark={isDark}
              onIconClick={() =>
                openTooltip(
                  'חילוץ מאתר / רשת',
                  'פותח סוכן חכם שמנתח כתובת אתר ומחלץ זהות מותג ממירה בדיאלוג צ\'אט.',
                  Globe,
                  () =>
                    openAgentChat(
                      'discovery',
                      'סוכן חילוץ וסריקת אתרים AI',
                      Globe
                    )
                )
              }
              onClick={() =>
                openAgentChat(
                  'discovery',
                  'סוכן חילוץ וסריקת אתרים AI',
                  Globe
                )
              }
            />

            {/* Row 2: Discovery Wizard (Opens Chat Agent with 3 Recommendations) */}
            <RowActionButton
              icon={Wand2}
              title="סוכן אשף גילוי מותג מהיר"
              badge="3 המלצות + STT"
              isDark={isDark}
              onIconClick={() =>
                openTooltip(
                  'סוכן אשף גילוי מהיר',
                  'פותח חלון צ\'אט ייעודי עם 3 המלצות דינמיות וזיהוי קולי לגיבוש שפת המותג.',
                  Wand2,
                  () =>
                    openAgentChat(
                      'discovery',
                      'סוכן גילוי וחילוץ DNA מותגי',
                      Wand2
                    )
                )
              }
              onClick={() =>
                openAgentChat(
                  'discovery',
                  'סוכן גילוי וחילוץ DNA מותגי',
                  Wand2
                )
              }
            />

            {/* Row 3: Competitor Research Agent (Opens Chat Agent with 3 Recommendations) */}
            <RowActionButton
              icon={TrendingUp}
              title="סוכן מחקר שוק ומתחרים"
              badge="סוכן צ'אט פעיל"
              isDark={isDark}
              onIconClick={() =>
                openTooltip(
                  'סוכן מחקר שוק',
                  'פותח צ\'אט ממוקד עם 3 המלצות לניתוח מתחרים, פערי שוק וזוויות בידול.',
                  TrendingUp,
                  () =>
                    openAgentChat(
                      'competitor',
                      'סוכן מחקר שוק ומתחרים AI',
                      TrendingUp
                    )
                )
              }
              onClick={() =>
                openAgentChat(
                  'competitor',
                  'סוכן מחקר שוק ומתחרים AI',
                  TrendingUp
                )
              }
            />

            {/* Row 4: Content Strategy Generator (Opens Chat Agent with 3 Recommendations) */}
            <RowActionButton
              icon={Sparkles}
              title="סוכן אסטרטגיית תוכן וכותרות"
              badge="מחולל Hero & CTA"
              isDark={isDark}
              onIconClick={() =>
                openTooltip(
                  'סוכן אסטרטגיית תוכן',
                  'פותח צ\'אט אינטראקטיבי לייצור כותרות גיבור והצעות שירות מבוססות קול המותג.',
                  Sparkles,
                  () =>
                    openAgentChat(
                      'content',
                      'סוכן אסטרטגיית תוכן וכותרות',
                      Sparkles
                    )
                )
              }
              onClick={() =>
                openAgentChat(
                  'content',
                  'סוכן אסטרטגיית תוכן וכותרות',
                  Sparkles
                )
              }
            />
          </div>
        </div>
      )}

      {/* =========================================================================
          WINDOW 3: VOICE & PERSONALITY (Constraint 6: Window 3)
          4 Full-Width Row Buttons / Panels:
          1. Interactive Sliders (Formality, Warmth, Luxury, Energy)
          2. Power / Forbidden Words Manager
          3. Visual Theme Presets & Color Tokens
          4. Instant Cloud Sync (saveNow)
          ========================================================================= */}
      {currentWindow === 'voice_personality' && (
        <div className="flex-1 flex flex-col justify-between py-1 overflow-hidden animate-in fade-in duration-150">
          <SubWindowHeader
            title="קול, אישיות וטוקנים"
            badge="03 · VOICE & DESIGN"
            isDark={isDark}
          />

          <div className="flex-1 flex flex-col justify-center gap-2.5 max-h-[360px]">
            {/* Row 1: Interactive Sliders */}
            <RowActionButton
              icon={Sliders}
              title="4 סליידרים לשפת מותג"
              badge={`פורמליות ${brandDna.voice.personality.formality}/5`}
              isDark={isDark}
              onIconClick={() =>
                openTooltip(
                  'סליידרים של שפת מותג',
                  'הגדר פורמליות, חמימות, יוקרה ואנרגיה של קול המותג.',
                  Sliders,
                  () => setVoiceSliderPanelOpen(true)
                )
              }
              onClick={() => {
                sound.playPop();
                setVoiceSliderPanelOpen(true);
              }}
            />

            {/* Row 2: Power & Forbidden Words */}
            <RowActionButton
              icon={MessageSquare}
              title="מילות כוח ומילים אסורות"
              badge={`${brandDna.voice.powerWords.length} מילות כוח`}
              isDark={isDark}
              onIconClick={() =>
                openTooltip(
                  'מילות כוח ומילים אסורות',
                  'ניהול מילים שמחזקות את המותג ומילים שאסור להשתמש בהן בפרסומים.',
                  MessageSquare,
                  () => setWordsManagerOpen(true)
                )
              }
              onClick={() => {
                sound.playPop();
                setWordsManagerOpen(true);
              }}
            />

            {/* Row 3: Visual Theme Presets & Color Tokens */}
            <RowActionButton
              icon={Palette}
              title="פלטת צבעי KOSUN וטוקנים"
              badge={brandDna.designTokens.primaryColor}
              isDark={isDark}
              onIconClick={() =>
                openTooltip(
                  'פלטת צבעי KOSUN',
                  'החלף בין ערכות סייבר: Cyber Cyan, Deep Cobalt, Obsidian Gold ו-Neon Indigo.',
                  Palette,
                  () => {
                    const nextColor =
                      brandDna.designTokens.primaryColor === '#00F0FF'
                        ? '#38BDF8'
                        : brandDna.designTokens.primaryColor === '#38BDF8'
                        ? '#A855F7'
                        : '#00F0FF';
                    updateDesignTokens({ primaryColor: nextColor });
                    showStatus(`גוון מותג עודכן ל-${nextColor}`);
                  }
                )
              }
              onClick={() => {
                sound.playPop();
                const nextColor =
                  brandDna.designTokens.primaryColor === '#00F0FF'
                    ? '#38BDF8'
                    : brandDna.designTokens.primaryColor === '#38BDF8'
                    ? '#A855F7'
                    : '#00F0FF';
                updateDesignTokens({ primaryColor: nextColor });
                showStatus(`ערכת צבעים עודכנה ל-${nextColor}`);
              }}
            />

            {/* Row 4: Instant Cloud Sync (saveNow) */}
            <RowActionButton
              icon={isSaving ? Loader2 : Cloud}
              title="סנכרון מיידי לענן (saveNow)"
              badge={isSaving ? 'מסנכרן...' : 'ענן מאובטח'}
              isDark={isDark}
              onIconClick={() =>
                openTooltip(
                  'סנכרון מיידי לענן',
                  'שומר ומסנכרן את כל פרטי ה-DNA למסד הנתונים בענן לגיבוי מלא.',
                  Cloud,
                  handleSaveNow
                )
              }
              onClick={handleSaveNow}
            />
          </div>
        </div>
      )}

      {/* =========================================================================
          WINDOW 4: ECOSYSTEM & TRUST (Constraint 6: Window 4)
          4 Full-Width Row Buttons:
          1. Core Services & Slug Mapper
          2. Flagship Products & FAQ Builder
          3. Trust & Security Credentials
          4. System Reset with Modal Confirmation
          ========================================================================= */}
      {currentWindow === 'ecosystem_trust' && (
        <div className="flex-1 flex flex-col justify-between py-1 overflow-hidden animate-in fade-in duration-150">
          <SubWindowHeader
            title="אקוסיסטם, מוצרים ואמינות"
            badge="04 · ECOSYSTEM"
            isDark={isDark}
          />

          <div className="flex-1 flex flex-col justify-center gap-2.5 max-h-[360px]">
            {/* Row 1: Core Services & Slug Mapper */}
            <RowActionButton
              icon={Layers}
              title="שירותי ליבה ומיפוי נתיבים"
              badge={`${brandDna.ecosystem.services.length} שירותים`}
              isDark={isDark}
              onIconClick={() =>
                openTooltip(
                  'שירותי ליבה ומיפוי נתיבים',
                  'רשימת השירותים המובילים של העסק הממופים לנתיבי פעולה ברורים.',
                  Layers,
                  () => {
                    const promptName = window.prompt(
                      'הזן שם שירות ליבה חדש:',
                      'ליווי אסטרטגי פרימיום'
                    );
                    if (promptName?.trim()) {
                      updateEcosystem({
                        services: [...brandDna.ecosystem.services, promptName.trim()],
                      });
                      sound.playTaskComplete();
                      showStatus('שירות חדש נוסף לאקוסיסטם!');
                    }
                  }
                )
              }
              onClick={() => {
                sound.playPop();
                const promptName = window.prompt(
                  'הזן שם שירות ליבה חדש:',
                  'ליווי אסטרטגי פרימיום'
                );
                if (promptName?.trim()) {
                  updateEcosystem({
                    services: [...brandDna.ecosystem.services, promptName.trim()],
                  });
                  sound.playTaskComplete();
                  showStatus('שירות חדש נוסף לאקוסיסטם!');
                }
              }}
            />

            {/* Row 2: Flagship Products & FAQ Builder */}
            <RowActionButton
              icon={Package}
              title="חבילות דגל ופירוט תמחור"
              badge={`${brandDna.ecosystem.businessPackages.length} חבילות`}
              isDark={isDark}
              onIconClick={() =>
                openTooltip(
                  'חבילות דגל ותמחור',
                  'הגדרת חבילות שירות במחיר קבוע וסגירת התנגדויות במעמד המכירה.',
                  Package,
                  () => {
                    showStatus('חבילות הדגל מוגדרות ומוכנות להצגה.');
                  }
                )
              }
              onClick={() => {
                sound.playPop();
                showStatus('חבילות הדגל מוגדרות ומוכנות להצגה.');
              }}
            />

            {/* Row 3: Trust & Security Credentials */}
            <RowActionButton
              icon={ShieldCheck}
              title="אישורי אמינות, ח.פ וואטסאפ"
              badge={brandDna.trust.legalEntityId ? 'מאומת' : 'הגדר'}
              isDark={isDark}
              onIconClick={() =>
                openTooltip(
                  'אישורי אמינות ואבטחה',
                  'הזנת מספר ח.פ / עוסק, וואטסאפ לתמיכה מהירה ומדיניות החזרים.',
                  ShieldCheck,
                  () => {
                    const newEntity = window.prompt(
                      'הזן מספר ח.פ / ע.מ:',
                      brandDna.trust.legalEntityId || '516000000'
                    );
                    if (newEntity !== null) {
                      updateTrust({ legalEntityId: newEntity });
                      sound.playTaskComplete();
                      showStatus('פרטי ישות משפטית עודכנו.');
                    }
                  }
                )
              }
              onClick={() => {
                sound.playPop();
                const newEntity = window.prompt(
                  'הזן מספר ח.פ / ע.מ:',
                  brandDna.trust.legalEntityId || '516000000'
                );
                if (newEntity !== null) {
                  updateTrust({ legalEntityId: newEntity });
                  sound.playTaskComplete();
                  showStatus('פרטי ישות משפטית עודכנו.');
                }
              }}
            />

            {/* Row 4: System Reset with Modal Confirmation */}
            <RowActionButton
              icon={RotateCcw}
              title="איפוס מותג להגדרות יצרן"
              badge="Reset"
              variant="danger"
              isDark={isDark}
              onIconClick={() =>
                openTooltip(
                  'איפוס מותג להגדרות יצרן',
                  'מאפס את כל נתוני ה-DNA להגדרות ברירת המחדל הראשוניות של KOSUN.',
                  RotateCcw,
                  () => setResetModalOpen(true)
                )
              }
              onClick={() => {
                sound.playPop();
                setResetModalOpen(true);
              }}
            />
          </div>
        </div>
      )}

      {/* =========================================================================
          WINDOW 5: TARGET AUDIENCE & MARKET RESEARCH (from Hub Button 3)
          4 Full-Width Row Buttons:
          1. Main UVP
          2. Customer Personas & Pain Points
          3. Common Objections & Rebuttals
          4. Market Gap Analyzer (Opens Agent Chat with 3 Recommendations)
          ========================================================================= */}
      {currentWindow === 'audience_research' && (
        <div className="flex-1 flex flex-col justify-between py-1 overflow-hidden animate-in fade-in duration-150">
          <SubWindowHeader
            title="קהל יעד, בידול ו-UVP"
            badge="05 · AUDIENCE"
            isDark={isDark}
          />

          <div className="flex-1 flex flex-col justify-center gap-2.5 max-h-[360px]">
            {/* Row 1: Main UVP */}
            <RowActionButton
              icon={Target}
              title="הצעת ערך ייחודית (UVP)"
              badge="מיצוב מנצח"
              isDark={isDark}
              onIconClick={() =>
                openTooltip(
                  'הצעת ערך ייחודית',
                  'המשפט האחד שמסביר מדוע לקוחות בוחרים בך ולא באף מתחרה אחר.',
                  Target,
                  () => {
                    const newUvp = window.prompt(
                      'ערוך את ה-UVP הראשי:',
                      brandDna.audience.mainUvp || 'הפיכת אינטראקציות לנכסים מניבים'
                    );
                    if (newUvp?.trim()) {
                      updateAudience({ mainUvp: newUvp.trim() });
                      sound.playTaskComplete();
                      showStatus('ה-UVP עודכן בהצלחה!');
                    }
                  }
                )
              }
              onClick={() => {
                sound.playPop();
                const newUvp = window.prompt(
                  'ערוך את ה-UVP הראשי:',
                  brandDna.audience.mainUvp || 'הפיכת אינטראקציות לנכסים מניבים'
                );
                if (newUvp?.trim()) {
                  updateAudience({ mainUvp: newUvp.trim() });
                  sound.playTaskComplete();
                  showStatus('ה-UVP עודכן בהצלחה!');
                }
              }}
            />

            {/* Row 2: Customer Personas */}
            <RowActionButton
              icon={Users}
              title="פרסונות לקוח וכאבים עיקריים"
              badge={`${brandDna.audience.personas.length} פרסונות`}
              isDark={isDark}
              onIconClick={() =>
                openTooltip(
                  'פרסונות לקוח וכאבים',
                  'הגדרת הפרופיל של הלקוח האידיאלי, נקודות הכאב ויעדי החלום שלו.',
                  Users,
                  () => {
                    showStatus('הפרסונות מוגדרות ומכוילות.');
                  }
                )
              }
              onClick={() => {
                sound.playPop();
                showStatus('הפרסונות מוגדרות ומכוילות.');
              }}
            />

            {/* Row 3: Common Objections & Rebuttals */}
            <RowActionButton
              icon={ShieldAlert}
              title="התנגדויות נפוצות ומענה מוחץ"
              badge={`${brandDna.audience.commonObjections.length} מענים`}
              isDark={isDark}
              onIconClick={() =>
                openTooltip(
                  'התנגדויות נפוצות ומענה',
                  'ארסנל תשובות מוחצות להתלבטויות של לקוחות לפני רכישה.',
                  ShieldAlert,
                  () => {
                    showStatus('ארסנל המענה להתנגדויות פעיל.');
                  }
                )
              }
              onClick={() => {
                sound.playPop();
                showStatus('ארסנל המענה להתנגדויות פעיל.');
              }}
            />

            {/* Row 4: Market Gap & Positioning Analyzer (Opens Agent Chat Modal) */}
            <RowActionButton
              icon={TrendingUp}
              title="סוכן ניתוח בידול ופער שוק"
              badge="3 המלצות AI"
              isDark={isDark}
              onIconClick={() =>
                openTooltip(
                  'זווית בידול ופער שוק',
                  'פותח שיחת צ\'אט עם סוכן בידול מבוסס 3 המלצות המשך מהמערכת.',
                  TrendingUp,
                  () =>
                    openAgentChat(
                      'competitor',
                      'סוכן ניתוח בידול ופער שוק',
                      TrendingUp
                    )
                )
              }
              onClick={() =>
                openAgentChat(
                  'competitor',
                  'סוכן ניתוח בידול ופער שוק',
                  TrendingUp
                )
              }
            />
          </div>
        </div>
      )}

      {/* =========================================================================
          FEATURE GUIDANCE TOOLTIP MODAL (Constraint 5)
          Clicking any feature icon opens a floating modal tooltip with concise
          contextual guidance. The bottom must feature EXACTLY TWO ICONS:
          - Checkmark (✓) to Continue/Confirm
          - 'X' to Cancel/Dismiss
          ========================================================================= */}
      {activeTooltip && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div
            className={`w-full max-w-sm rounded-3xl border p-5 shadow-2xl relative animate-in zoom-in-95 duration-150 flex flex-col justify-between ${
              isDark
                ? 'bg-[#0D0E1F] border-[#00F0FF]/50 text-[#F0F4FF] shadow-[0_0_35px_rgba(0,240,255,0.25)]'
                : 'bg-white border-[#00B4D8] text-[#0A0D18] shadow-xl'
            }`}
          >
            {/* Modal Header with Icon */}
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-2xl bg-[#00F0FF]/15 border border-[#00F0FF]/40 text-[#00F0FF] flex items-center justify-center shrink-0">
                <activeTooltip.icon className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold tracking-wide truncate">
                {activeTooltip.title}
              </h3>
            </div>

            {/* Concise W3C COGA Compliant Contextual Guidance */}
            <p
              className={`text-xs sm:text-sm leading-relaxed mb-6 font-medium ${
                isDark ? 'text-[#F0F4FF]/80' : 'text-[#0A0D18]/80'
              }`}
            >
              {activeTooltip.guidance}
            </p>

            {/* BOTTOM ROW: EXACTLY TWO ICONS (✓ to Confirm, X to Dismiss) */}
            <div className="flex items-center justify-between pt-3 border-t border-inherit/20 gap-4">
              {/* Dismiss Button ('X') */}
              <button
                type="button"
                onClick={() => {
                  sound.playPop();
                  setActiveTooltip(null);
                }}
                className={`flex-1 min-h-[48px] rounded-2xl border flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer active:scale-95 ${
                  isDark
                    ? 'bg-[#12162B] border-[#1A2B4C] text-[#F0F4FF]/70 hover:text-white hover:border-[#F0F4FF]/30'
                    : 'bg-[#F1F5F9] border-[#CBD5E1] text-[#0A0D18]/70 hover:text-black'
                }`}
                aria-label="ביטול"
                title="ביטול"
              >
                <X className="w-5 h-5" />
                <span>ביטול</span>
              </button>

              {/* Confirm / Continue Button (Checkmark ✓) */}
              <button
                type="button"
                onClick={() => {
                  const fn = activeTooltip.onConfirm;
                  setActiveTooltip(null);
                  fn();
                }}
                className="flex-1 min-h-[48px] rounded-2xl bg-gradient-to-r from-[#00F0FF] to-[#00A3FF] text-[#070913] font-black text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all cursor-pointer active:scale-95 hover:brightness-110"
                aria-label="אישור והמשך"
                title="אישור והמשך"
              >
                <Check className="w-5 h-5 stroke-[3]" />
                <span>המשך</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          DEDICATED AGENT CHAT MODAL (3 DYNAMIC RECOMMENDATIONS + STT)
          ========================================================================= */}
      <BrandAgentChatModal
        isOpen={agentChatModal.isOpen}
        onClose={() => setAgentChatModal((prev) => ({ ...prev, isOpen: false }))}
        agentType={agentChatModal.type}
        agentTitle={agentChatModal.title}
        agentIcon={agentChatModal.icon}
        isDark={isDark}
        brandDna={brandDna}
        onApplyUvp={(newUvp) => {
          updateAudience({ mainUvp: newUvp });
          sound.playTaskComplete();
          showStatus('ה-UVP עודכן ישירות ל-Brand DNA!');
        }}
      />

      {/* =========================================================================
          INTERACTIVE SUB-PANELS (ZERO-SCROLL MODALS)
          ========================================================================= */}

      {/* 4 Interactive Sliders Compact Panel */}
      {voiceSliderPanelOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className={`w-full max-w-sm rounded-3xl border p-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 ${
              isDark
                ? 'bg-[#0D0E1F] border-[#1A2B4C] text-[#F0F4FF]'
                : 'bg-white border-[#CBD5E1] text-[#0A0D18]'
            }`}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#00F0FF]">4 סליידרים של שפת מותג</h3>
              <button
                onClick={() => setVoiceSliderPanelOpen(false)}
                className="p-1.5 text-inherit opacity-50 hover:opacity-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {[
                {
                  key: 'formality',
                  label: 'פורמליות / רשמיות',
                  val: brandDna.voice.personality.formality,
                },
                {
                  key: 'warmth',
                  label: 'חמימות ואנושיות',
                  val: brandDna.voice.personality.warmth,
                },
                {
                  key: 'luxury',
                  label: 'יוקרה ועלית',
                  val: brandDna.voice.personality.luxury,
                },
                {
                  key: 'energy',
                  label: 'אנרגיה ותעוזה',
                  val: brandDna.voice.personality.energy,
                },
              ].map(({ key, label, val }) => (
                <div key={key} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span>{label}</span>
                    <span className="font-mono text-[#00F0FF]">{val} / 5</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={val}
                    onChange={(e) => {
                      const num = parseInt(e.target.value, 10);
                      updateVoice({
                        personality: {
                          ...brandDna.voice.personality,
                          [key]: num,
                        },
                      });
                    }}
                    className="w-full accent-[#00F0FF] h-2 bg-[#1A2B4C] rounded-lg cursor-pointer"
                  />
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                sound.playTaskComplete();
                setVoiceSliderPanelOpen(false);
                showStatus('סליידרים נשמרו.');
              }}
              className="w-full py-2.5 rounded-xl bg-[#00F0FF] text-[#070913] text-xs font-bold cursor-pointer"
            >
              שמור והחל
            </button>
          </div>
        </div>
      )}

      {/* Power Words Manager Modal */}
      {wordsManagerOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className={`w-full max-w-sm rounded-3xl border p-5 shadow-2xl space-y-3 animate-in zoom-in-95 duration-150 ${
              isDark
                ? 'bg-[#0D0E1F] border-[#1A2B4C] text-[#F0F4FF]'
                : 'bg-white border-[#CBD5E1] text-[#0A0D18]'
            }`}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#00F0FF]">מילות כוח (Power Words)</h3>
              <button
                onClick={() => setWordsManagerOpen(false)}
                className="p-1.5 text-inherit opacity-50 hover:opacity-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newWordInput}
                onChange={(e) => setNewWordInput(e.target.value)}
                placeholder="הוסף מילת כוח..."
                className={`flex-1 px-3 py-2 rounded-xl text-xs font-semibold border ${
                  isDark
                    ? 'bg-[#12162B] border-[#1A2B4C] text-white focus:outline-none focus:border-[#00F0FF]'
                    : 'bg-stone-50 border-[#CBD5E1] text-black focus:outline-none focus:border-[#00B4D8]'
                }`}
              />
              <button
                onClick={() => {
                  if (newWordInput.trim() && !brandDna.voice.powerWords.includes(newWordInput.trim())) {
                    updateVoice({ powerWords: [...brandDna.voice.powerWords, newWordInput.trim()] });
                    setNewWordInput('');
                    sound.playPop();
                  }
                }}
                className="px-4 py-2 rounded-xl bg-[#00F0FF] text-[#070913] font-bold text-xs cursor-pointer"
              >
                הוסף
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pt-1">
              {brandDna.voice.powerWords.map((word, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-full bg-[#1A2B4C] text-xs font-semibold text-[#F0F4FF] flex items-center gap-1.5"
                >
                  <span>{word}</span>
                  <button
                    onClick={() => {
                      updateVoice({
                        powerWords: brandDna.voice.powerWords.filter((_, i) => i !== idx),
                      });
                      sound.playPop();
                    }}
                    className="text-white/40 hover:text-rose-400 cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <button
              onClick={() => setWordsManagerOpen(false)}
              className="w-full py-2.5 rounded-xl bg-[#00F0FF] text-[#070913] text-xs font-bold cursor-pointer mt-2"
            >
              סגור
            </button>
          </div>
        </div>
      )}

      {/* System Reset Confirmation Modal (Constraint 6: Reset with Modal Confirmation) */}
      {resetModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className={`w-full max-w-sm rounded-3xl border p-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 ${
              isDark
                ? 'bg-[#0D0E1F] border-rose-500/50 text-[#F0F4FF]'
                : 'bg-white border-rose-400 text-[#0A0D18]'
            }`}
          >
            <div className="flex items-center gap-3 text-rose-500">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold">איפוס מותג להגדרות יצרן</h3>
            </div>
            <p className="text-xs leading-relaxed opacity-80">
              פעולה זו תאפס את כל ערכי ה-Brand DNA להגדרות ברירת המחדל של KOSUN. האם להמשיך?
            </p>
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                onClick={() => setResetModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-inherit/30 text-xs font-bold cursor-pointer"
              >
                ביטול
              </button>
              <button
                onClick={handleConfirmReset}
                className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold cursor-pointer shadow-md"
              >
                אפס עכשיו
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// =========================================================================
// HELPER COMPONENTS
// =========================================================================

interface DnaCircularGaugeProps {
  score: number;
  isAiLoading: boolean;
  isDark: boolean;
}

const DnaCircularGauge: React.FC<DnaCircularGaugeProps> = ({ score, isAiLoading, isDark }) => {
  const size = 96;
  const stroke = 7;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="rotate-[-90deg]">
        {/* Background track circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={isDark ? '#1A2B4C' : '#E2E8F0'}
          strokeWidth={stroke}
          fill="transparent"
        />

        {/* Foreground progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={score >= 80 ? '#00F0FF' : score >= 50 ? '#00B4D8' : '#F59E0B'}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-700 ease-out"
        />
      </svg>

      {/* Central Metric Value */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
        <span
          className={`font-['Orbitron',sans-serif] text-xl font-black tracking-tight ${
            isDark ? 'text-white' : 'text-[#0A0D18]'
          }`}
        >
          {score}%
        </span>
        <span className="text-[8px] font-mono font-bold tracking-wider text-[#00F0FF] uppercase">
          {isAiLoading ? 'מעבד...' : 'שלמות'}
        </span>
      </div>
    </div>
  );
};

interface RowActionButtonProps {
  icon: React.ComponentType<{ className?: string; size?: number }>;
  title: string;
  badge?: string;
  isDark: boolean;
  variant?: 'default' | 'danger';
  onIconClick: () => void;
  onClick: () => void;
}

const RowActionButton: React.FC<RowActionButtonProps> = ({
  icon: Icon,
  title,
  badge,
  isDark,
  variant = 'default',
  onIconClick,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`group w-full min-h-[58px] sm:min-h-[66px] px-3.5 sm:px-4 py-2.5 rounded-2xl border flex items-center justify-between gap-3 transition-all cursor-pointer active:scale-[0.985] ${
        variant === 'danger'
          ? isDark
            ? 'bg-[#1A121A] border-rose-500/30 hover:border-rose-500/60 text-rose-300'
            : 'bg-rose-50/60 border-rose-200 hover:border-rose-400 text-rose-700'
          : isDark
          ? 'bg-[#0D0E1F] border-[#1A2B4C] hover:border-[#00F0FF]/50 hover:bg-[#12162B] shadow-inner text-[#F0F4FF]'
          : 'bg-white border-[#CBD5E1] hover:border-[#00B4D8] hover:bg-[#F8FAFC] shadow-xs text-[#0A0D18]'
      }`}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Feature Vector Icon with Tooltip Trigger */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onIconClick();
          }}
          className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 transition-transform active:scale-90 group-hover:scale-105 cursor-pointer ${
            variant === 'danger'
              ? 'bg-rose-500/15 border-rose-500/30 text-rose-400'
              : 'bg-[#00F0FF]/15 border-[#00F0FF]/35 text-[#00F0FF]'
          }`}
          aria-label={`מידע והסבר על ${title}`}
          title="לחץ למידע ואישור"
        >
          <Icon className="w-5 h-5" />
        </button>

        {/* Title & Subtitle Badge */}
        <div className="flex flex-col min-w-0 text-right">
          <span className="text-xs sm:text-sm font-bold truncate leading-tight group-hover:text-[#00F0FF] transition-colors">
            {title}
          </span>
          {badge && (
            <span
              className={`text-[10px] font-mono mt-0.5 truncate ${
                isDark ? 'text-[#F0F4FF]/50' : 'text-[#0A0D18]/50'
              }`}
            >
              {badge}
            </span>
          )}
        </div>
      </div>

      {/* Navigation Trigger Chevron */}
      <ChevronLeft className="w-5 h-5 text-[#00F0FF] shrink-0 group-hover:-translate-x-1 transition-transform" />
    </div>
  );
};

interface SubWindowHeaderProps {
  title: string;
  badge: string;
  isDark: boolean;
}

const SubWindowHeader: React.FC<SubWindowHeaderProps> = ({ title, badge, isDark }) => {
  return (
    <div className="flex items-center justify-between px-1 py-1 shrink-0">
      <h2
        className={`text-sm sm:text-base font-bold tracking-tight truncate ${
          isDark ? 'text-white' : 'text-[#0A0D18]'
        }`}
      >
        {title}
      </h2>
      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#00F0FF]/15 border border-[#00F0FF]/30 text-[#00F0FF]">
        {badge}
      </span>
    </div>
  );
};
