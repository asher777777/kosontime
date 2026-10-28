import React, { useState, useEffect } from 'react';
import * as Icons from 'lucide-react';
import { ArchetypeProvider, useArchetype } from '../theme/ArchetypeEngine';
import { ArchetypeId } from '../theme/types';
// 🔥 ייבוא הקומפוננטות האמיתיות והחיוֹת של המערכת (לא דמו!)
import { HeroSection } from '../../src/modols/KosWebAi/sections/hero/HeroSection';
import { HeroEditor } from '../../src/modols/KosWebAi/sections/hero/HeroEditor';
import { HeroSectionConfig } from '../../src/modols/KosWebAi/types/sectionConfigs';
import { pageBuilderFirestore } from '../../src/modols/KosWebAi/services/pageBuilderFirestore';
import { PageBuilderConfig } from '../../src/modols/KosWebAi/types/pageBuilder.types';
import { eventBus } from '@/core/bridge/EventBus';
import { SmartFormRunner } from '../../src/modols/KosForms/components/runner/SmartFormRunner';
import { SMART_FORM_TEMPLATES } from '../../src/modols/KosForms/config/formTemplates';

interface ThemeLabScreenProps {
  onBackToApp?: () => void;
}

const RealLiveHeroLab: React.FC<ThemeLabScreenProps> = ({ onBackToApp }) => {
  const { activeArchetype, activeId, setArchetypeById } = useArchetype();
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'mobile'>('mobile'); // Mobile-first כברירת מחדל!
  const [isRealEditorOpen, setIsRealEditorOpen] = useState(false);
  const [hostFormModalId, setHostFormModalId] = useState<string | null>(null);
  const [livePages, setLivePages] = useState<PageBuilderConfig[]>([]);

  // האזנה לאירועי EventBus לפתיחת מודאל טפסים חכמים מכל אזור בעמוד
  useEffect(() => {
    const unsub = eventBus.subscribe('smart_form:open', (data) => {
      setHostFormModalId(data.formId || 'template_lead_capture');
    });
    return () => unsub();
  }, []);
  const [selectedPageId, setSelectedPageId] = useState<string>('live_hero_showcase');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // 1. קונפיגורציית Hero נקייה מונעת ארכיטיפ
  const [realHeroConfig, setRealHeroConfig] = useState<HeroSectionConfig>({
    id: 'hero_live_1',
    type: 'hero',
    title: '', // ריק = נמשך חי מטוקני הארכיטיפ של קושאן
    subtitle: '',
    description: '',
    layout: 'centered', // תצוגת ברירת מחדל: רקע תמונה מאחור 100%, שכבת רקע כותרת תיאור ו-CTA ממורכז
    mediaType: 'image',
    buttonsVisible: true,
    primaryButton: {
      text: '', // ריק = נמשך חי מטוקני הקופי של הארכיטיפ
      url: '#contact',
    },
    secondaryButton: {
      text: '', // ריק = נמשך חי מטוקני הקופי של הארכיטיפ
      url: '#learn-more',
    },
    announcementBadge: {
      text: '', // ריק = נמשך חי
      url: '#announcement',
    },
    imageSrc: '', // ריק = נמשך חי מ-KosCloudStore לפי הארכיטיפ
    videoBgUrl: '', // ריק = נמשך חי מ-KosCloudStore
    ctaActionType: 'smart_form_modal', // ברירת מחדל: פתיחת מודאל טופס חכם מ-KosForms!
    ctaFormId: 'template_lead_capture',
  });

  // 2. טעינת עמודים אמיתיים מ-Firestore
  useEffect(() => {
    async function loadPages() {
      try {
        const pages = await pageBuilderFirestore.getAllPages(null, 'kosun');
        if (pages && pages.length > 0) {
          setLivePages(pages);
          for (const p of pages) {
            const heroSec = Object.values(p.sections || {}).find((s) => s.type === 'hero');
            if (heroSec && heroSec.data) {
              setRealHeroConfig(heroSec.data as HeroSectionConfig);
              setSelectedPageId(p.pageId);
              break;
            }
          }
        }
      } catch (err) {
        console.warn('[RealLiveHeroLab] Firestore load:', err);
      }
    }
    loadPages();
  }, []);

  const handleSelectPage = (pageId: string) => {
    setSelectedPageId(pageId);
    const target = livePages.find((p) => p.pageId === pageId);
    if (target) {
      const heroSec = Object.values(target.sections || {}).find((s) => s.type === 'hero');
      if (heroSec && heroSec.data) {
        setRealHeroConfig(heroSec.data as HeroSectionConfig);
      }
    }
  };

  // שמירת השינויים ישירות ב-Firestore
  const handleSaveToFirestore = async () => {
    setIsSaving(true);
    try {
      let targetPage = livePages.find((p) => p.pageId === selectedPageId);
      if (!targetPage) {
        targetPage = {
          pageId: 'archetype_live_hero_demo',
          pageTitle: 'הדגמת שער ארכיטיפ חי 2026',
          slug: 'live-hero',
          isPublished: true,
          sectionOrder: ['hero_sec_1'],
          sections: {
            hero_sec_1: {
              id: 'hero_sec_1',
              type: 'hero',
              name: 'אזור שער חי',
              visible: true,
              data: realHeroConfig,
            },
          },
          globalSettings: {
            theme: {
              archetypeId: activeId,
            },
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as any;
      } else {
        const heroKey = Object.keys(targetPage.sections || {}).find(
          (k) => targetPage?.sections[k]?.type === 'hero'
        ) || 'hero_sec_1';

        targetPage.sections = {
          ...targetPage.sections,
          [heroKey]: {
            id: heroKey,
            type: 'hero',
            name: 'אזור שער חי',
            visible: true,
            data: realHeroConfig,
          },
        };
        targetPage.globalSettings = {
          ...targetPage.globalSettings,
          theme: { archetypeId: activeId },
        };
      }

      await pageBuilderFirestore.savePage(targetPage, null, 'kosun');
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      console.error('[RealLiveHeroLab] Save failed:', e);
      alert('שגיאה בשמירה ל-Firestore: ' + (e as any).message);
    } finally {
      setIsSaving(false);
    }
  };

  const availableArchetypes: { id: ArchetypeId; label: string; icon: React.FC<{ size?: number; className?: string }> }[] = [
    { id: 'wellness', label: 'Wellness • בריאות', icon: Icons.Sparkles },
    { id: 'lawyer', label: 'Lawyer • משפטים', icon: Icons.Briefcase },
    { id: 'feminine', label: 'Feminine • אלגנטיות', icon: Icons.Heart },
    { id: 'masculine', label: 'Masculine • כוח', icon: Icons.Shield },
    { id: 'kosun_portal', label: 'KOSUN • קושאן', icon: Icons.Zap },
  ];

  return (
    <div className="min-h-screen w-full bg-zinc-950 text-white font-sans flex flex-col selection:bg-cyan-500/30" dir="rtl">
      {/* 🧭 סרגל עליון אינטראקטיבי */}
      <header className="sticky top-0 z-40 bg-zinc-900/95 backdrop-blur-xl border-b border-zinc-800 p-3 sm:px-6 shadow-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {onBackToApp && (
            <button
              type="button"
              onClick={onBackToApp}
              className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
              title="חזרה"
            >
              <Icons.ArrowRight size={18} />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full animate-ping" style={{ backgroundColor: activeArchetype.style.primaryColor }} />
              <h1 className="text-sm sm:text-base font-extrabold tracking-wide">
                מעבדת שער חיה (Hero Mobile-First 2026)
              </h1>
            </div>
            <p className="text-[11px] text-zinc-400">
              ללא צבעי CSS קשיחים • הזרמה מ-KosCloudStore • תמיכה בוידאו וזרימת CTA
            </p>
          </div>
        </div>

        {/* בורר ארכיטיפים חי המשפיע מיידית על HeroSection האמיתי */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 max-w-full">
          {availableArchetypes.map((arch) => {
            const Icon = arch.icon;
            const isSelected = activeId === arch.id;
            return (
              <button
                key={arch.id}
                type="button"
                onClick={() => setArchetypeById(arch.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer active:scale-95 ${
                  isSelected
                    ? 'bg-white text-zinc-950 shadow-md ring-2'
                    : 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700'
                }`}
                style={{
                  ringColor: isSelected ? activeArchetype.style.primaryColor : undefined,
                }}
              >
                <Icon size={14} />
                <span>{arch.label}</span>
              </button>
            );
          })}
        </div>

        {/* פעולות: שמירה בענן, פתיחת עורך חי, בורר מכשיר */}
        <div className="flex items-center gap-2">
          {/* בורר דסקטופ / מובייל */}
          <div className="flex items-center bg-zinc-800 rounded-xl p-1 border border-zinc-700/60">
            <button
              type="button"
              onClick={() => setDeviceMode('mobile')}
              className={`p-1.5 rounded-lg text-xs transition-colors flex items-center gap-1 ${
                deviceMode === 'mobile' ? 'bg-cyan-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
              }`}
              title="מובייל פירסט 9:16 (מומלץ)"
            >
              <Icons.Smartphone size={15} />
              <span className="text-[10px]">Mobile</span>
            </button>
            <button
              type="button"
              onClick={() => setDeviceMode('desktop')}
              className={`p-1.5 rounded-lg text-xs transition-colors flex items-center gap-1 ${
                deviceMode === 'desktop' ? 'bg-cyan-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
              }`}
              title="תצוגת מסך רחב"
            >
              <Icons.Monitor size={15} />
              <span className="text-[10px]">Desktop</span>
            </button>
          </div>

          {/* כפתור עורך אמיתי */}
          <button
            type="button"
            onClick={() => setIsRealEditorOpen(true)}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-zinc-800 hover:bg-zinc-700 text-white flex items-center gap-1.5 border border-zinc-700 cursor-pointer"
          >
            <Icons.Sliders size={14} />
            <span>עורך שער</span>
          </button>

          {/* כפתור שמירה ב-Firestore */}
          <button
            type="button"
            onClick={handleSaveToFirestore}
            disabled={isSaving}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold text-black flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer ${
              saveSuccess ? 'bg-emerald-400 text-black' : ''
            }`}
            style={{ backgroundColor: !saveSuccess ? activeArchetype.style.primaryColor : undefined }}
          >
            {isSaving ? (
              <Icons.Loader2 size={14} className="animate-spin" />
            ) : saveSuccess ? (
              <Icons.Check size={14} />
            ) : (
              <Icons.CloudUpload size={14} />
            )}
            <span>{saveSuccess ? 'נשמר בענן!' : 'שמור ל-Firestore'}</span>
          </button>
        </div>
      </header>

      {/* 📐 סרגל בחירת תצוגות מבניות, מדיה וזרימת CTA */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* א. תצוגה מבנית */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-zinc-400 font-bold">תצוגה:</span>

          <button
            type="button"
            onClick={() => setRealHeroConfig((prev) => ({ ...prev, layout: 'centered' }))}
            className={`px-2.5 py-1 rounded-xl font-bold flex items-center gap-1 transition-all cursor-pointer ${
              realHeroConfig.layout === 'centered'
                ? 'bg-cyan-500 text-black shadow-md'
                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
            }`}
          >
            <Icons.Image size={13} />
            <span>רקע מלא + מרכוז</span>
          </button>

          <button
            type="button"
            onClick={() => setRealHeroConfig((prev) => ({ ...prev, layout: 'split' }))}
            className={`px-2.5 py-1 rounded-xl font-bold flex items-center gap-1 transition-all cursor-pointer ${
              realHeroConfig.layout === 'split'
                ? 'bg-cyan-500 text-black shadow-md'
                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
            }`}
          >
            <Icons.Columns size={13} />
            <span>פרוס 100% מפוצל</span>
          </button>

          <button
            type="button"
            onClick={() => setRealHeroConfig((prev) => ({ ...prev, layout: 'bento-hero' }))}
            className={`px-2.5 py-1 rounded-xl font-bold flex items-center gap-1 transition-all cursor-pointer ${
              realHeroConfig.layout === 'bento-hero'
                ? 'bg-cyan-500 text-black shadow-md'
                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
            }`}
          >
            <Icons.LayoutTemplate size={13} />
            <span>בנטו שער</span>
          </button>
        </div>

        {/* ב. סוג מדיה מ-KosCloudStore: תמונה או וידאו רקע */}
        <div className="flex items-center gap-1.5 bg-zinc-800/80 p-1 rounded-xl border border-zinc-700/80">
          <span className="text-zinc-400 text-[11px] font-semibold ms-1">מדיה:</span>
          <button
            type="button"
            onClick={() => setRealHeroConfig((prev) => ({ ...prev, mediaType: 'image', videoBgUrl: '' }))}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all ${
              realHeroConfig.mediaType !== 'video' ? 'bg-cyan-500 text-black font-bold shadow-sm' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Icons.Image size={13} />
            <span>תמונת רקע</span>
          </button>
          <button
            type="button"
            onClick={() => setRealHeroConfig((prev) => ({ ...prev, mediaType: 'video' }))}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all ${
              realHeroConfig.mediaType === 'video' ? 'bg-cyan-500 text-black font-bold shadow-sm' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Icons.Video size={13} />
            <span>וידאו רקע 🎥</span>
          </button>
        </div>

        {/* ג. זרימת כפתור הנעה לפעולה (CTA Action Flow) */}
        <div className="flex items-center gap-1.5 bg-zinc-800/80 p-1 rounded-xl border border-zinc-700/80">
          <span className="text-[11px] text-zinc-400 ms-1 font-semibold">זרימת CTA:</span>
          <button
            type="button"
            onClick={() => setRealHeroConfig((prev) => ({ ...prev, ctaActionType: 'smart_form_modal' }))}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-all ${
              realHeroConfig.ctaActionType === 'smart_form_modal' ? 'bg-emerald-500 text-black font-bold shadow-sm' : 'text-zinc-400 hover:text-white'
            }`}
            title="פתיחת פופאפ מודאל עם טופס חכם מ-KosForms"
          >
            <Icons.FormInput size={12} />
            <span>טופס חכם (KosForms)</span>
          </button>
          <button
            type="button"
            onClick={() => setRealHeroConfig((prev) => ({ ...prev, ctaActionType: 'whatsapp' }))}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-all ${
              realHeroConfig.ctaActionType === 'whatsapp' ? 'bg-emerald-500 text-black font-bold shadow-sm' : 'text-zinc-400 hover:text-white'
            }`}
            title="פתיחת שיחת WhatsApp ישירה"
          >
            <Icons.MessageCircle size={12} />
            <span>WhatsApp ישיר</span>
          </button>
          <button
            type="button"
            onClick={() => setRealHeroConfig((prev) => ({ ...prev, ctaActionType: 'internal_page' }))}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-all ${
              realHeroConfig.ctaActionType === 'internal_page' ? 'bg-emerald-500 text-black font-bold shadow-sm' : 'text-zinc-400 hover:text-white'
            }`}
            title="גלילה או ניווט פנימי בעמוד"
          >
            <Icons.Link2 size={12} />
            <span>ניווט פנימי</span>
          </button>
        </div>
      </div>

      {/* 🖼️ שטח התצוגה המריץ את HeroSection האמיתי - מובייל פירסט */}
      <main className="flex-1 flex flex-col items-center justify-start p-2 sm:p-6 overflow-y-auto">
        <div
          className={`w-full transition-all duration-300 ${
            deviceMode === 'mobile'
              ? 'max-w-[420px] rounded-[2.5rem] border-4 border-zinc-800 shadow-2xl overflow-hidden my-4 bg-black min-h-[750px] relative'
              : 'max-w-6xl rounded-2xl border border-zinc-800/60 shadow-xl overflow-hidden'
          }`}
        >
          {/* מסגרת מובייל עליונה (Notch/Dynamic Island לדמות סמארטפון אמיתי) */}
          {deviceMode === 'mobile' && (
            <div className="w-full h-6 bg-black flex items-center justify-center pt-2">
              <div className="w-24 h-4 bg-zinc-900 rounded-full" />
            </div>
          )}

          {/* 🔥 הקומפוננטה המקורית של הפרויקט - HeroSection.tsx הנקייה */}
          <HeroSection config={realHeroConfig} />
        </div>
      </main>

      {/* פופאפ HeroEditor האמיתי של המערכת */}
      {isRealEditorOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-4xl max-h-[90vh] bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950">
              <div className="flex items-center gap-2">
                <Icons.Sliders size={18} className="text-cyan-400" />
                <h3 className="font-bold text-sm">העורך המקורי של המערכת: HeroEditor.tsx</h3>
              </div>
              <button
                onClick={() => setIsRealEditorOpen(false)}
                className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white"
              >
                <Icons.X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <HeroEditor
                config={realHeroConfig}
                onChange={(updated) => {
                  setRealHeroConfig(updated);
                }}
              />
            </div>
            <div className="p-3 border-t border-zinc-800 bg-zinc-950 flex justify-end">
              <button
                onClick={() => setIsRealEditorOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 text-black hover:bg-cyan-400"
              >
                אישור וסגירה
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🎯 מודאל טופס חכם מנוהל ברמת ה-Host של העמוד (נפתח לפי שידור מאירועי EventBus) */}
      {hostFormModalId && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-300"
          dir="rtl"
        >
          <div
            className="w-full max-w-md max-h-[92vh] border rounded-3xl shadow-2xl overflow-hidden flex flex-col relative"
            style={{
              backgroundColor: activeArchetype.style.cardBg,
              borderColor: `${activeArchetype.style.primaryColor}50`,
              boxShadow: `0 20px 50px -10px ${activeArchetype.style.primaryColor}33`,
            }}
          >
            <button
              type="button"
              onClick={() => setHostFormModalId(null)}
              className="absolute top-4 start-4 z-30 p-2 rounded-full border border-white/20 bg-black/40 hover:bg-black/60 text-white transition-colors"
            >
              <Icons.X size={16} />
            </button>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 pt-12">
              <SmartFormRunner
                form={
                  SMART_FORM_TEMPLATES.find((t) => t.id === hostFormModalId) ||
                  SMART_FORM_TEMPLATES[0]
                }
                submitButtonBgColor={activeArchetype.style.primaryColor}
                submitButtonTextColor="#FFFFFF"
                submitButtonShape="rounded"
                onComplete={(answers, submissionId) => {
                  console.log('[ThemeLab Host Modal Submitted]', answers, submissionId);
                  setTimeout(() => {
                    setHostFormModalId(null);
                  }, 2000);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const ThemeLabScreen: React.FC<ThemeLabScreenProps> = (props) => {
  return (
    <ArchetypeProvider initialArchetypeId="wellness">
      <RealLiveHeroLab {...props} />
    </ArchetypeProvider>
  );
};
