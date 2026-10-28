import React, { useState, useEffect, useMemo } from 'react';
import * as Icons from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import {
  KosWebAiCollectionMaster,
  KosWebAiFunctionItem,
  KosWebAiAudienceMode,
  getKosWebAiMasterCollection,
  subscribeToKosWebAiCollection,
  KOS_WEB_AI_FALLBACK,
} from '../factory/kosWebAiCollectionManager';
import {
  kosWebFunctions,
  getLivePages,
  createNewPage,
  duplicatePage,
  togglePublishPage,
  deletePage,
  savePageConfig,
  generateAiPage,
  instantiateBlueprint,
  ensureDefaultLegalPages,
  exportPageHtml,
  analyzePageSeo,
  runCoreWebVitalsAudit,
  generateMarketingAngles,
  generatePageQr,
  PageBuilderConfig,
  PageCategory,
  SeoAnalysisResult,
  CwvAuditResult,
  MarketingAngle,
} from '../../src/modols/KosWebAi';
import { sound } from '../../src/utils/audio';
import { KosunUniversalFooter } from '../components/action-portal/cognitive-portal/KosunUniversalFooter';

export type BabushkaStage = 'pages_studio' | 'ai_blueprints' | 'marketing_qr' | 'seo_speed';
export type ViewportDevice = 'desktop' | 'tablet' | 'mobile';

export interface KosWebAiPortalPageProps {
  onBackToApp?: () => void;
  initialAudience?: KosWebAiAudienceMode;
}

export const KosWebAiPortalPage: React.FC<KosWebAiPortalPageProps> = ({
  onBackToApp,
  initialAudience = 'guest',
}) => {
  // 1. נתוני קולקציית שרת מ-Firestore
  const [collectionData, setCollectionData] = useState<KosWebAiCollectionMaster>(KOS_WEB_AI_FALLBACK);
  const [isLiveConnected, setIsLiveConnected] = useState<boolean>(false);

  // 2. מצב קהל יעד (אורח / משתמש מנהל)
  const [audience, setAudience] = useState<KosWebAiAudienceMode>(initialAudience);

  // 3. שלב בבושקה נוכחי (ארבעת שלבי הבבושקה)
  const [stage, setStage] = useState<BabushkaStage>('pages_studio');

  // 4. עמודים פעילים
  const [pages, setPages] = useState<PageBuilderConfig[]>([]);
  const [selectedPage, setSelectedPage] = useState<PageBuilderConfig | null>(null);
  const [viewportDevice, setViewportDevice] = useState<ViewportDevice>('desktop');

  // 5. דיאלוגים ופעולות מחוברות לקוד
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isNewPageOpen, setIsNewPageOpen] = useState(false);
  const [isAiGeneratorOpen, setIsAiGeneratorOpen] = useState(false);
  const [isBlueprintsOpen, setIsBlueprintsOpen] = useState(false);
  const [isSeoModalOpen, setIsSeoModalOpen] = useState(false);
  const [isCwvModalOpen, setIsCwvModalOpen] = useState(false);
  const [isMarketingModalOpen, setIsMarketingModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);

  // מצבי ביניים וטפסים
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(null);

  // תוצאות ביצוע אמיתיות
  const [seoResult, setSeoResult] = useState<SeoAnalysisResult | null>(null);
  const [cwvResult, setCwvResult] = useState<CwvAuditResult | null>(null);
  const [marketingAngles, setMarketingAngles] = useState<MarketingAngle[]>([]);

  // טפסי עריכה ויצירה
  const [newPageTitle, setNewPageTitle] = useState('');
  const [newPageCategory, setNewPageCategory] = useState<PageCategory>('landing');
  const [newPageSlug, setNewPageSlug] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiProgress, setAiProgress] = useState(0);

  // שדות עורך חי
  const [editTitle, setEditTitle] = useState('');
  const [editSlug, setEditSlug] = useState('');
  const [editPrimaryColor, setEditPrimaryColor] = useState('#00F0FF');
  const [editHeroTitle, setEditHeroTitle] = useState('');
  const [editHeroSubtitle, setEditHeroSubtitle] = useState('');
  const [editHeroCta, setEditHeroCta] = useState('');
  const [activeSectionsMap, setActiveSectionsMap] = useState<Record<string, boolean>>({});

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  // -----------------------------------------------------------
  // טעינת עמודים וסנכרון ענן בזמן אמת
  // -----------------------------------------------------------
  const refreshPages = async () => {
    try {
      const loaded = await getLivePages('kosun');
      setPages(loaded);
      if (loaded.length > 0) {
        setSelectedPage((prev) => {
          if (!prev) return loaded[0];
          const exists = loaded.find((p) => p.pageId === prev.pageId);
          return exists || loaded[0];
        });
      }
    } catch (e) {
      console.warn('[KosWebAiPortal] Failed to refresh pages:', e);
    }
  };

  useEffect(() => {
    let unsubscribe = () => {};
    getKosWebAiMasterCollection('kosun')
      .then((data) => {
        setCollectionData(data);
        setIsLiveConnected(true);
      })
      .catch((err) => console.warn('Using local master fallback:', err));

    unsubscribe = subscribeToKosWebAiCollection((data) => {
      setCollectionData(data);
      setIsLiveConnected(true);
    });

    refreshPages();
    return () => unsubscribe();
  }, []);

  // סנכרון שדות עורך בעת שינוי עמוד נבחר
  useEffect(() => {
    if (selectedPage) {
      setEditTitle(selectedPage.pageTitle || '');
      setEditSlug(selectedPage.slug || '');
      setEditPrimaryColor(selectedPage.globalSettings?.primaryColor || '#00F0FF');
      setEditHeroTitle(selectedPage.sections?.hero?.title || '');
      setEditHeroSubtitle(selectedPage.sections?.hero?.subtitle || '');
      setEditHeroCta(selectedPage.sections?.hero?.ctaText || 'התחל עכשיו ◀');

      const secMap: Record<string, boolean> = {};
      if (selectedPage.sections) {
        Object.entries(selectedPage.sections).forEach(([k, s]: any) => {
          secMap[k] = s.visible !== false;
        });
      }
      setActiveSectionsMap(secMap);
    }
  }, [selectedPage]);

  // -----------------------------------------------------------
  // גילוי פעולות מהקולקציה שרת (Server-Driven Discovery)
  // -----------------------------------------------------------
  const availableActions = useMemo(() => {
    const raw =
      collectionData?.actions ||
      collectionData?.functions ||
      KOS_WEB_AI_FALLBACK.functions ||
      KOS_WEB_AI_FALLBACK.actions ||
      [];

    if (!Array.isArray(raw)) return [];
    return raw.filter((act) => {
      if (!act) return false;
      if (audience === 'guest') return Boolean(act.guestAvailable);
      return true; // משתמש מקבל את כל הפעולות
    });
  }, [collectionData, audience]);

  // מיון הפעולות לפי שלבי הבבושקה
  const stageActions = useMemo(() => {
    const safeActions = Array.isArray(availableActions) ? availableActions : [];
    return {
      pages_studio: safeActions.filter(
        (a) =>
          a &&
          (a.category === 'page_management' ||
            ['edit_page', 'preview_page', 'export_html_zip', 'toggle_publish', 'duplicate_page', 'delete_page'].includes(a.actionKey))
      ),
      ai_blueprints: safeActions.filter(
        (a) =>
          a &&
          (a.category === 'ai_generation' ||
            ['generate_ai_page', 'instantiate_blueprint', 'open_marketing_ideas'].includes(a.actionKey))
      ),
      marketing_qr: safeActions.filter(
        (a) =>
          a &&
          ['open_shortener', 'share_qr', 'open_marketing_ideas', 'ensure_legal_pages', 'view_legal'].includes(a.actionKey)
      ),
      seo_speed: safeActions.filter(
        (a) =>
          a &&
          (a.category === 'seo_geo' || ['open_seo_hub', 'analyze_seo', 'check_cwv_speed'].includes(a.actionKey))
      ),
    };
  }, [availableActions]);

  // -----------------------------------------------------------
  // חיבור כפתורים לקוד אמיתי (Real Code Execution)
  // -----------------------------------------------------------
  const executeAction = async (actionKey: string, payload?: any) => {
    sound.playPop();
    const targetPage = payload?.page || selectedPage || pages[0];

    switch (actionKey) {
      // 1. יצירת עמוד
      case 'create_new_page':
      case 'open_new_page':
        if (audience === 'guest') {
          showToast('במצב אורח ניתן לצפות בעמודים קיימים. עברו למצב משתמש להקמה מלאה.');
          return;
        }
        setIsNewPageOpen(true);
        break;

      // 2. עריכת עמוד חי
      case 'edit_page':
      case 'open_editor':
        if (audience === 'guest') {
          showToast('עריכת עמוד פתוחה למשתמשים ומנהלים בלבד.');
          return;
        }
        setIsEditorOpen(true);
        break;

      // 3. תצוגה מקדימה
      case 'preview_page':
        setViewportDevice('desktop');
        showToast(`מוצגת תצוגה מקדימה של העמוד: ${targetPage?.pageTitle}`);
        break;

      // 4. שכפול עמוד
      case 'duplicate_page': {
        if (!targetPage) return;
        setIsProcessing(true);
        const dup = await duplicatePage(targetPage.pageId, 'kosun');
        await refreshPages();
        if (dup) setSelectedPage(dup);
        setIsProcessing(false);
        sound.playSuccess();
        showToast(`העמוד שוכפל בהצלחה: ${dup?.pageTitle}`);
        break;
      }

      // 5. שינוי מצב פרסום (טיוטה / באוויר)
      case 'toggle_publish': {
        if (!targetPage) return;
        setIsProcessing(true);
        const nextState = await togglePublishPage(targetPage.pageId, 'kosun');
        await refreshPages();
        setIsProcessing(false);
        sound.playSuccess();
        showToast(`סטטוס העמוד עודכן: ${nextState ? 'באוויר ברשת ✓' : 'טיוטה פרטית'}`);
        break;
      }

      // 6. מחיקת עמוד
      case 'delete_page': {
        if (!targetPage) return;
        if (pages.length <= 1) {
          showToast('לא ניתן למחוק את עמוד המערכת האחרון.');
          return;
        }
        setIsProcessing(true);
        await deletePage(targetPage.pageId, 'kosun');
        await refreshPages();
        setIsProcessing(false);
        sound.playSuccess();
        showToast('העמוד נמחק בהצלחה.');
        break;
      }

      // 7. מחולל בינה מלאכותית
      case 'generate_ai_page':
      case 'open_ai_builder':
      case 'try_ai_generator':
        setIsAiGeneratorOpen(true);
        break;

      // 8. קטלוג תבניות
      case 'instantiate_blueprint':
      case 'view_blueprints':
        setIsBlueprintsOpen(true);
        break;

      // 9. ייצוא קובץ HTML מלא להורדה
      case 'export_html_zip': {
        if (!targetPage) return;
        sound.playSuccess();
        exportPageHtml(targetPage);
        showToast(`קובץ HTML מלא הופק והורד בהצלחה: ${targetPage.slug}.html`);
        break;
      }

      // 10. ניתוח SEO מקיף
      case 'analyze_seo':
      case 'open_seo_hub': {
        if (!targetPage) return;
        const res = analyzePageSeo(targetPage);
        setSeoResult(res);
        setIsSeoModalOpen(true);
        break;
      }

      // 11. בדיקת מהירות CWV
      case 'check_cwv_speed': {
        if (!targetPage) return;
        const cwv = runCoreWebVitalsAudit(targetPage);
        setCwvResult(cwv);
        setIsCwvModalOpen(true);
        break;
      }

      // 12. זוויות שיווק ו-Brand DNA
      case 'open_marketing_ideas': {
        if (!targetPage) return;
        const angles = generateMarketingAngles(targetPage);
        setMarketingAngles(angles);
        setIsMarketingModalOpen(true);
        break;
      }

      // 13. קיצור ושיתוף QR
      case 'open_shortener':
      case 'share_qr':
        setIsQrModalOpen(true);
        break;

      // 14. עמודי חובה משפטיים
      case 'ensure_legal_pages':
      case 'view_legal':
        setIsLegalModalOpen(true);
        break;

      default: {
        const fn = kosWebFunctions[actionKey];
        if (fn) {
          await fn(payload, { tenantId: 'kosun' });
          await refreshPages();
          showToast(`פעולה ${actionKey} בוצעה בהצלחה`);
        } else {
          showToast(`פעולה הופעלה: ${actionKey}`);
        }
        break;
      }
    }
  };

  // -----------------------------------------------------------
  // שמירת עריכת עמוד מונחית שרת
  // -----------------------------------------------------------
  const handleSaveEditor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPage) return;

    setIsProcessing(true);
    sound.playSuccess();

    const updatedSections = { ...(selectedPage.sections || {}) };
    if (updatedSections.hero) {
      updatedSections.hero = {
        ...updatedSections.hero,
        title: editHeroTitle,
        subtitle: editHeroSubtitle,
        ctaText: editHeroCta,
      };
    }

    Object.keys(activeSectionsMap).forEach((secKey) => {
      if (updatedSections[secKey]) {
        updatedSections[secKey].visible = activeSectionsMap[secKey];
      }
    });

    const updatedPage: PageBuilderConfig = {
      ...selectedPage,
      pageTitle: editTitle.trim() || selectedPage.pageTitle,
      slug: editSlug.trim() || selectedPage.slug,
      globalSettings: {
        ...selectedPage.globalSettings,
        primaryColor: editPrimaryColor,
      },
      sections: updatedSections,
      updatedAt: new Date().toISOString(),
    };

    await savePageConfig(updatedPage, 'kosun');
    await refreshPages();
    setSelectedPage(updatedPage);
    setIsProcessing(false);
    setIsEditorOpen(false);
    showToast('השינויים נשמרו ב-Firestore וסונכרנו לתצוגה החיה ✓');
  };

  // -----------------------------------------------------------
  // יצירת עמוד חדש מהטופס
  // -----------------------------------------------------------
  const handleCreateNewPageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPageTitle.trim()) return;

    setIsProcessing(true);
    sound.playSuccess();
    const created = await createNewPage(
      {
        title: newPageTitle.trim(),
        category: newPageCategory,
        slug: newPageSlug.trim() || undefined,
      },
      'kosun'
    );
    await refreshPages();
    setSelectedPage(created);
    setIsProcessing(false);
    setIsNewPageOpen(false);
    setNewPageTitle('');
    setNewPageSlug('');
    showToast(`עמוד חדש הוקם ונשמר ב-Firestore: ${created.pageTitle}`);
  };

  // -----------------------------------------------------------
  // הפעלת מחולל AI
  // -----------------------------------------------------------
  const handleRunAiGenerator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    setIsProcessing(true);
    setAiProgress(20);
    sound.playBeep();

    const interval = setInterval(() => {
      setAiProgress((prev) => {
        if (prev >= 85) {
          clearInterval(interval);
          return 85;
        }
        return prev + 25;
      });
    }, 280);

    try {
      const generated = await generateAiPage(
        { prompt: aiPrompt.trim(), category: 'landing', stylePreset: 'cyber_neon' },
        'kosun'
      );
      clearInterval(interval);
      setAiProgress(100);
      sound.playSuccess();
      await refreshPages();
      setSelectedPage(generated);
      setTimeout(() => {
        setIsProcessing(false);
        setIsAiGeneratorOpen(false);
        setAiPrompt('');
        setAiProgress(0);
        showToast(`עמוד בינה מלאכותית נוצר בהצלחה: ${generated.pageTitle}`);
      }, 400);
    } catch (err) {
      clearInterval(interval);
      setIsProcessing(false);
      showToast('שגיאה ביצירת עמוד AI');
    }
  };

  // -----------------------------------------------------------
  // החלת תבנית מוכנה (Blueprint)
  // -----------------------------------------------------------
  const handleApplyBlueprint = async (bpId: string) => {
    setIsProcessing(true);
    sound.playSuccess();
    const bpPage = await instantiateBlueprint(bpId, 'kosun');
    await refreshPages();
    setSelectedPage(bpPage);
    setIsProcessing(false);
    setIsBlueprintsOpen(false);
    showToast(`תבנית ${bpPage.pageTitle} הוחלה ונוצר עמוד חדש באוויר!`);
  };

  // -----------------------------------------------------------
  // סנכרון עמודי חובה משפטיים
  // -----------------------------------------------------------
  const handleSyncLegalPages = async () => {
    setIsProcessing(true);
    sound.playSuccess();
    const legals = await ensureDefaultLegalPages('kosun');
    await refreshPages();
    setIsProcessing(false);
    setIsLegalModalOpen(false);
    showToast(`סונכרנו 3 עמודי חובה: תקנון, פרטיות ונגישות (${legals.length} עודכנו) ✓`);
  };

  // שרטוט אייקון דינמי
  const renderIcon = (name: string, className: string = 'w-5 h-5') => {
    const Component = (Icons as any)[name] || Icons.HelpCircle;
    return <Component className={className} />;
  };

  // -----------------------------------------------------------
  // רינדור עמוד חי (Live View Component)
  // -----------------------------------------------------------
  const renderLivePageView = () => {
    if (!selectedPage) {
      return (
        <div className="flex flex-col items-center justify-center p-12 text-slate-400">
          <Icons.FileText className="w-12 h-12 mb-3 text-cyan-400 animate-pulse" />
          <p>טוען עמוד פעיל...</p>
        </div>
      );
    }

    const { sections, globalSettings, sectionOrder } = selectedPage;
    const primaryColor = globalSettings?.primaryColor || '#00F0FF';
    const order = sectionOrder || Object.keys(sections || {});

    return (
      <div className="space-y-12 py-6 px-4 sm:px-8 text-right font-sans" dir="rtl">
        {order.map((secId) => {
          const s = sections?.[secId];
          if (!s || s.visible === false) return null;

          // Header
          if (s.type === 'header') {
            return (
              <header
                key={secId}
                className="sticky top-2 z-20 flex items-center justify-between p-4 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-cyan-500/20 shadow-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 font-black shadow-md">
                    K
                  </div>
                  <span className="font-bold text-white text-base tracking-wide">
                    {s.logoText || globalSettings?.companyName || 'קושאן'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href="#contact"
                    className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-cyan-400 text-slate-950 hover:bg-cyan-300 transition-all shadow-md"
                  >
                    {s.ctaButtonText || 'התחל עכשיו'}
                  </a>
                </div>
              </header>
            );
          }

          // Hero
          if (s.type === 'hero') {
            return (
              <section
                key={secId}
                className="relative overflow-hidden rounded-3xl p-8 sm:p-14 text-center border border-white/10 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 shadow-2xl"
              >
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold border border-cyan-400/30 bg-cyan-500/10 text-cyan-300 mb-6">
                  <Icons.Sparkles className="w-3.5 h-3.5" />
                  <span>{s.badge || 'KOSUN 2026 • אינטראקציה שהיא נכס'}</span>
                </div>
                <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight mb-5 max-w-3xl mx-auto">
                  {s.title || 'אינטראקציה שהיא נכס'}
                </h1>
                <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed mb-8">
                  {s.subtitle || 'המערכת האוטונומית הראשונה שהופכת כל שיחה, שאלה וביקור לגורם המרה מנצח.'}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <a
                    href="#contact"
                    style={{ backgroundColor: primaryColor }}
                    className="px-7 py-3.5 rounded-xl font-bold text-slate-950 shadow-lg shadow-cyan-500/25 hover:scale-105 active:scale-95 transition-all text-sm sm:text-base"
                  >
                    {s.ctaText || 'התחל עכשיו ◀'}
                  </a>
                  <button
                    onClick={() => executeAction('share_qr')}
                    className="px-6 py-3.5 rounded-xl font-bold text-white bg-slate-800/80 hover:bg-slate-800 border border-white/10 transition-all text-sm sm:text-base flex items-center gap-2"
                  >
                    <Icons.QrCode className="w-4 h-4 text-cyan-400" />
                    <span>קוד QR ושיתוף</span>
                  </button>
                </div>
              </section>
            );
          }

          // Features
          if (s.type === 'features') {
            const feats = Array.isArray(s.features) ? s.features : [];
            return (
              <section key={secId} className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl sm:text-3xl font-black text-white">{s.title || 'יתרונות בולטים'}</h2>
                  {s.subtitle && <p className="text-sm text-slate-400 mt-2">{s.subtitle}</p>}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {feats.map((f: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl bg-slate-900/60 border border-white/5 hover:border-cyan-500/30 transition-all group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <Icons.CheckCircle className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-white text-base mb-1.5">{f.title}</h3>
                      <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
                    </div>
                  ))}
                </div>
              </section>
            );
          }

          // Stats Bento
          if (s.type === 'statsBento') {
            const stats = Array.isArray(s.stats) ? s.stats : [];
            return (
              <section key={secId} className="p-6 rounded-3xl bg-slate-900/40 border border-white/5">
                <h3 className="text-lg font-bold text-white text-center mb-6">{s.title || 'המספרים של קושאן'}</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {stats.map((st: any, idx: number) => (
                    <div
                      key={idx}
                      className="text-center p-4 rounded-2xl bg-slate-950/60 border border-cyan-500/10 shadow-sm"
                    >
                      <div className="text-2xl sm:text-3xl font-black text-cyan-400">{st.value}</div>
                      <div className="text-xs text-slate-400 mt-1 font-medium">{st.label}</div>
                    </div>
                  ))}
                </div>
              </section>
            );
          }

          // Pricing
          if (s.type === 'pricing') {
            const packs = Array.isArray(s.packages) ? s.packages : [];
            return (
              <section key={secId} className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl sm:text-3xl font-black text-white">{s.title || 'מסלולים וחבילות'}</h2>
                  {s.subtitle && <p className="text-sm text-slate-400 mt-1">{s.subtitle}</p>}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  {packs.map((p: any, idx: number) => (
                    <div
                      key={idx}
                      className={`p-6 rounded-3xl border flex flex-col justify-between transition-all ${
                        p.featured
                          ? 'bg-slate-900/90 border-cyan-500 shadow-xl shadow-cyan-500/10 scale-105'
                          : 'bg-slate-900/50 border-white/10'
                      }`}
                    >
                      <div>
                        {p.featured && (
                          <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold bg-cyan-400 text-slate-950 mb-3">
                            הכי מבוקש
                          </span>
                        )}
                        <h3 className="text-lg font-bold text-white">{p.name}</h3>
                        <div className="text-3xl font-black text-white my-3">{p.price}</div>
                        <p className="text-xs text-slate-400 leading-relaxed mb-6">{p.desc}</p>
                      </div>
                      <a
                        href="#contact"
                        className={`w-full py-3 rounded-xl font-bold text-xs text-center transition-all ${
                          p.featured
                            ? 'bg-cyan-400 text-slate-950 hover:bg-cyan-300'
                            : 'bg-slate-800 text-white hover:bg-slate-700'
                        }`}
                      >
                        בחר מסלול ◀
                      </a>
                    </div>
                  ))}
                </div>
              </section>
            );
          }

          // Testimonials
          if (s.type === 'testimonials') {
            const items = Array.isArray(s.items) ? s.items : [];
            return (
              <section key={secId} className="space-y-4">
                <h3 className="text-lg font-bold text-white text-center">{s.title || 'מה אומרים המנהלים'}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {items.map((t: any, idx: number) => (
                    <div key={idx} className="p-5 rounded-2xl bg-slate-900/50 border border-white/5">
                      <p className="text-xs text-slate-300 italic mb-4 leading-relaxed">"{t.quote}"</p>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold flex items-center justify-center">
                          {t.name?.[0] || 'A'}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white">{t.name}</div>
                          <div className="text-[10px] text-slate-400">{t.role}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          }

          // FAQ Accordion
          if (s.type === 'faq') {
            const faqs = Array.isArray(s.faqs) ? s.faqs : [];
            return (
              <section key={secId} className="space-y-3 max-w-2xl mx-auto">
                <h3 className="text-xl font-bold text-white text-center mb-4">{s.title || 'שאלות נפוצות'}</h3>
                {faqs.map((q: any, idx: number) => {
                  const isOpen = expandedFaqIndex === idx;
                  return (
                    <div
                      key={idx}
                      className="rounded-2xl bg-slate-900/60 border border-white/5 overflow-hidden transition-all"
                    >
                      <button
                        onClick={() => setExpandedFaqIndex(isOpen ? null : idx)}
                        className="w-full p-4 flex items-center justify-between text-right text-xs sm:text-sm font-bold text-white hover:text-cyan-300 transition-colors"
                      >
                        <span>{q.q}</span>
                        <Icons.ChevronDown
                          className={`w-4 h-4 text-cyan-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                        />
                      </button>
                      {isOpen && (
                        <div className="px-4 pb-4 pt-1 text-xs text-slate-300 leading-relaxed border-t border-white/5">
                          {q.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </section>
            );
          }

          // Contact Form
          if (s.type === 'contact') {
            return (
              <section
                key={secId}
                id="contact"
                className="max-w-xl mx-auto p-8 rounded-3xl bg-slate-900/80 border border-cyan-500/30 text-center shadow-2xl"
              >
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mx-auto mb-4">
                  <Icons.MessageSquare className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-black text-white">{s.title || 'יצירת קשר ישיר'}</h3>
                <p className="text-xs text-slate-400 mt-1 mb-6">
                  {s.subtitle || 'השאירו פרטים ונציג קוגניטיבי יחזור אליכם בהקדם'}
                </p>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    sound.playSuccess();
                    showToast('הפנייה נשלחה בהצלחה! ניצור עמך קשר תוך זמן קצר.');
                  }}
                  className="space-y-3 text-right"
                >
                  <input
                    type="text"
                    placeholder="שם מלא"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-400"
                  />
                  <input
                    type="tel"
                    placeholder="מספר טלפון נייד"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-400"
                  />
                  <input
                    type="email"
                    placeholder="דואר אלקטרוני (אופציונלי)"
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-400"
                  />
                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 transition-all text-xs sm:text-sm shadow-lg shadow-cyan-500/20"
                  >
                    {s.submitButtonText || 'שליחת פנייה מיידית ◀'}
                  </button>
                </form>
              </section>
            );
          }

          // Footer
          if (s.type === 'footer') {
            return (
              <footer key={secId} className="pt-8 border-t border-white/5 text-center text-xs text-slate-500 space-y-2">
                <p>{s.copyright || '© 2026 KOSUN KOSWEBAI. כל הזכויות שמורות • אינטראקציה שהיא נכס.'}</p>
                <div className="flex items-center justify-center gap-4 text-[11px] text-cyan-400">
                  <button onClick={() => executeAction('ensure_legal_pages')} className="hover:underline">
                    תקנון ותנאי שימוש
                  </button>
                  <span>•</span>
                  <button onClick={() => executeAction('ensure_legal_pages')} className="hover:underline">
                    מדיניות פרטיות
                  </button>
                  <span>•</span>
                  <button onClick={() => executeAction('ensure_legal_pages')} className="hover:underline">
                    הצהרת נגישות
                  </button>
                </div>
              </footer>
            );
          }

          return null;
        })}
      </div>
    );
  };

  // -----------------------------------------------------------
  // פריסת עמוד ראשית (Babushka Viewport Architecture)
  // -----------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#070A11] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950" dir="rtl">
      {/* ═══════════════════════════════════════════════════════ */}
      {/* מעטפת עליונה: סטטוס ענן, מצב אורח/משתמש וניווט         */}
      {/* ═══════════════════════════════════════════════════════ */}
      <header className="border-b border-white/10 bg-[#0B0F1A]/90 backdrop-blur-lg sticky top-0 z-40 px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          {/* מיתוג וכותרת */}
          <div className="flex items-center gap-3">
            {onBackToApp && (
              <button
                onClick={onBackToApp}
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
                title="חזרה"
              >
                <Icons.ArrowRight className="w-4 h-4" />
              </button>
            )}
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-slate-950 font-black text-lg shadow-lg shadow-cyan-500/20">
              K
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-white tracking-wide">KOSWEBAI</h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                  מהדורת 2026
                </span>
                <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  {isLiveConnected ? 'ענן COMONA מסונכרן' : 'מקומי'}
                </span>
              </div>
              <p className="text-xs text-slate-400">פורטל עמודים אוטונומי • אינטראקציה שהיא נכס</p>
            </div>
          </div>

          {/* מתג מצב קהל יעד (אורח vs משתמש/מנהל) */}
          <div className="flex items-center gap-3">
            <div className="bg-slate-950/80 p-1 rounded-2xl border border-white/10 flex items-center gap-1 shadow-inner">
              <button
                onClick={() => {
                  sound.playPop();
                  setAudience('guest');
                  showToast('הופעל מצב אורח: התרשמות חופשית, צפייה ואינטראקציה');
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  audience === 'guest'
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Icons.Eye className="w-3.5 h-3.5" />
                <span>מצב אורח</span>
              </button>
              <button
                onClick={() => {
                  sound.playPop();
                  setAudience('user');
                  showToast('הופעל מצב משתמש: שליטה מלאה, עריכת עמודים ושידור לענן');
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  audience === 'user'
                    ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md shadow-indigo-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Icons.UserCheck className="w-3.5 h-3.5" />
                <span>מצב משתמש (מנהל)</span>
              </button>
            </div>

            {audience === 'user' && (
              <button
                onClick={() => executeAction('create_new_page')}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-400 text-slate-950 hover:bg-cyan-300 transition-all flex items-center gap-1.5 shadow-md shadow-cyan-400/20"
              >
                <Icons.Plus className="w-3.5 h-3.5" />
                <span>עמוד חדש</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* הודעת Toast צפה */}
      {toastMessage && (
        <div className="fixed bottom-6 start-6 z-50 px-5 py-3 rounded-2xl bg-slate-900/95 border border-cyan-400 text-cyan-300 text-xs font-bold shadow-2xl flex items-center gap-2 animate-bounce">
          <Icons.CheckCircle2 className="w-4 h-4 text-cyan-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════ */}
      {/* ארבעת שלבי הבבושקה (Level 1: 4 Babushka Core Cards)     */}
      {/* ═══════════════════════════════════════════════════════ */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-8 py-6 space-y-8 flex-1">
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                <Icons.Layers className="w-6 h-6 text-cyan-400" />
                <span>ארבעת שלבי הבבושקה (Babushka Layout Engine)</span>
              </h2>
              <p className="text-xs text-slate-400">
                כל שלב חושף שכבת יכולות פנימית מונחית שרת, המחוברת ישירות לפונקציות המערכת
              </p>
            </div>
            <div className="text-xs font-semibold text-slate-400">
              {(pages || []).length} עמודים • {(pages || []).filter((p) => p && p.published).length} באוויר
            </div>
          </div>

          {/* 4 כרטיסי הבבושקה הראשיים */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* שלב 1: סטודיו עמודים */}
            <div
              onClick={() => {
                sound.playPop();
                setStage('pages_studio');
              }}
              className={`p-5 rounded-3xl border cursor-pointer transition-all ${
                stage === 'pages_studio'
                  ? 'bg-slate-900 border-cyan-400 shadow-xl shadow-cyan-500/10 ring-2 ring-cyan-500/20'
                  : 'bg-slate-950/70 border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-black">
                  א
                </div>
                <span className="text-[10px] px-2.5 py-1 rounded-full font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                  {pages.length} עמודים
                </span>
              </div>
              <h3 className="font-bold text-white text-base mb-1">סטודיו עמודים חי</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                ניהול, עריכה, שכפול, צפייה מקדימה והורדת קובץ HTML עצמאי
              </p>
              <div className="text-xs font-bold text-cyan-400 flex items-center gap-1">
                <span>{stage === 'pages_studio' ? 'שכבה פתוחה ▼' : 'פתח שכבה ◀'}</span>
              </div>
            </div>

            {/* שלב 2: מחולל בינה מלאכותית ותבניות */}
            <div
              onClick={() => {
                sound.playPop();
                setStage('ai_blueprints');
              }}
              className={`p-5 rounded-3xl border cursor-pointer transition-all ${
                stage === 'ai_blueprints'
                  ? 'bg-slate-900 border-purple-400 shadow-xl shadow-purple-500/10 ring-2 ring-purple-500/20'
                  : 'bg-slate-950/70 border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-black">
                  ב
                </div>
                <span className="text-[10px] px-2.5 py-1 rounded-full font-bold bg-purple-500/10 text-purple-300 border border-purple-500/20">
                  KosAi 2026
                </span>
              </div>
              <h3 className="font-bold text-white text-base mb-1">מחולל AI ותבניות דגל</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                הפקת עמודי נחיתה אוטונומיים מלאים והחלת תבניות Blueprints מוכחות
              </p>
              <div className="text-xs font-bold text-purple-400 flex items-center gap-1">
                <span>{stage === 'ai_blueprints' ? 'שכבה פתוחה ▼' : 'פתח שכבה ◀'}</span>
              </div>
            </div>

            {/* שלב 3: הפצה שיווק ו-QR */}
            <div
              onClick={() => {
                sound.playPop();
                setStage('marketing_qr');
              }}
              className={`p-5 rounded-3xl border cursor-pointer transition-all ${
                stage === 'marketing_qr'
                  ? 'bg-slate-900 border-emerald-400 shadow-xl shadow-emerald-500/10 ring-2 ring-emerald-500/20'
                  : 'bg-slate-950/70 border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-black">
                  ג
                </div>
                <span className="text-[10px] px-2.5 py-1 rounded-full font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                  QR & Brand DNA
                </span>
              </div>
              <h3 className="font-bold text-white text-base mb-1">הפצה שיווק ו-QR</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                הפקת קישורים מקוצרים, קוד QR חי, רעיונות שיווקיים ותשתיות משפט
              </p>
              <div className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                <span>{stage === 'marketing_qr' ? 'שכבה פתוחה ▼' : 'פתח שכבה ◀'}</span>
              </div>
            </div>

            {/* שלב 4: מנוע SEO ומהירות */}
            <div
              onClick={() => {
                sound.playPop();
                setStage('seo_speed');
              }}
              className={`p-5 rounded-3xl border cursor-pointer transition-all ${
                stage === 'seo_speed'
                  ? 'bg-slate-900 border-amber-400 shadow-xl shadow-amber-500/10 ring-2 ring-amber-500/20'
                  : 'bg-slate-950/70 border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-black">
                  ד
                </div>
                <span className="text-[10px] px-2.5 py-1 rounded-full font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  Google & CWV
                </span>
              </div>
              <h3 className="font-bold text-white text-base mb-1">מנוע SEO ומהירות CWV</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                ניתוח מטא תגיות, ביצועי LCP, CLS, INP ויצירת סכמות Schema.org
              </p>
              <div className="text-xs font-bold text-amber-400 flex items-center gap-1">
                <span>{stage === 'seo_speed' ? 'שכבה פתוחה ▼' : 'פתח שכבה ◀'}</span>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════ */}
        {/* הבבושקה הפנימית: חריצי הפעולות של השלב הנבחר           */}
        {/* ═══════════════════════════════════════════════════════ */}
        <section className="p-6 rounded-3xl bg-[#0B0F1A] border border-white/10 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">
                שכבת פעולות מונחית שרת
              </span>
              <h3 className="text-lg font-black text-white">
                {stage === 'pages_studio' && 'פעולות סטודיו לעמודים פעילים'}
                {stage === 'ai_blueprints' && 'כלי בינה מלאכותית ותבניות דגל'}
                {stage === 'marketing_qr' && 'כלי הפצה, קידום ושיתוף מהיר'}
                {stage === 'seo_speed' && 'אופטימיזציה, מטא תגיות וביצועי מהירות'}
              </h3>
            </div>

            {/* בחירת עמוד נוכחי */}
            {pages.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">עמוד נבחר:</span>
                <select
                  value={selectedPage?.pageId || ''}
                  onChange={(e) => {
                    const found = pages.find((p) => p.pageId === e.target.value);
                    if (found) setSelectedPage(found);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 border border-white/15 text-xs font-bold text-white focus:outline-none focus:border-cyan-400"
                >
                  {pages.map((p) => (
                    <option key={p.pageId} value={p.pageId}>
                      {p.pageTitle} ({p.published ? 'באוויר' : 'טיוטה'})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* גריד פעולות מחוברות לקוד אמיתי */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {(stageActions[stage] || []).map((act) => {
              const isLocked = audience === 'guest' && !act.guestAvailable;
              return (
                <div
                  key={act.id}
                  className={`p-4 rounded-2xl border flex flex-col justify-between transition-all ${
                    isLocked
                      ? 'bg-slate-950/40 border-white/5 opacity-60'
                      : 'bg-slate-900/60 border-white/10 hover:border-cyan-500/40 shadow-sm'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                        {renderIcon(act.icon, 'w-4 h-4')}
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-800 text-slate-300">
                        {act.badge}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white mb-1">{act.title}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed mb-4">{act.summary}</p>
                  </div>

                  <button
                    disabled={isLocked || isProcessing}
                    onClick={() => executeAction(act.actionKey, { page: selectedPage })}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      isLocked
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        : 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500 hover:text-slate-950'
                    }`}
                  >
                    {isLocked ? (
                      <>
                        <Icons.Lock className="w-3.5 h-3.5" />
                        <span>למשתמש בלבד</span>
                      </>
                    ) : (
                      <>
                        <span>{act.ctaText}</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════ */}
        {/* תצוגה חיה של העמוד (Live Page View Component)          */}
        {/* ═══════════════════════════════════════════════════════ */}
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0B0F1A] p-4 rounded-3xl border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-cyan-400/10 text-cyan-400 flex items-center justify-center">
                <Icons.Eye className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <span>תצוגת עמוד חיה (View Component):</span>
                  <span className="text-cyan-400 font-black">{selectedPage?.pageTitle}</span>
                </h3>
                <span className="text-[11px] text-slate-400">/{selectedPage?.slug} • רינדור מקטעים בזמן אמת</span>
              </div>
            </div>

            {/* מתג מכשירי צפייה (Desktop, Tablet, Mobile) */}
            <div className="flex items-center gap-2">
              <div className="bg-slate-950 p-1 rounded-xl border border-white/10 flex items-center gap-1">
                <button
                  onClick={() => setViewportDevice('desktop')}
                  className={`p-2 rounded-lg text-xs font-bold transition-all ${
                    viewportDevice === 'desktop' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                  title="דסקטופ מלא"
                >
                  <Icons.Monitor className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewportDevice('tablet')}
                  className={`p-2 rounded-lg text-xs font-bold transition-all ${
                    viewportDevice === 'tablet' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                  title="טאבלט 768px"
                >
                  <Icons.Tablet className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewportDevice('mobile')}
                  className={`p-2 rounded-lg text-xs font-bold transition-all ${
                    viewportDevice === 'mobile' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                  title="מובייל 9:16 (390px)"
                >
                  <Icons.Smartphone className="w-4 h-4" />
                </button>
              </div>

              {/* כפתורי פעולה מהירים לעמוד הנבחר */}
              {audience === 'user' && (
                <button
                  onClick={() => executeAction('edit_page')}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white border border-white/10 flex items-center gap-1.5 transition-all"
                >
                  <Icons.Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>ערוך עמוד</span>
                </button>
              )}

              <button
                onClick={() => executeAction('export_html_zip')}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white border border-white/10 flex items-center gap-1.5 transition-all"
                title="הורדת קובץ HTML מלא"
              >
                <Icons.Download className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">הורד HTML</span>
              </button>

              <button
                onClick={() => executeAction('share_qr')}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white border border-white/10 flex items-center gap-1.5 transition-all"
                title="הצגת ברקוד QR"
              >
                <Icons.QrCode className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">QR</span>
              </button>
            </div>
          </div>

          {/* מיכל הרינדור הרספונסיבי */}
          <div className="flex justify-center bg-slate-950/70 p-3 sm:p-6 rounded-3xl border border-white/10 overflow-x-auto min-h-[500px]">
            <div
              className={`bg-[#0A0E17] rounded-3xl border border-white/10 shadow-2xl transition-all duration-300 overflow-hidden ${
                viewportDevice === 'desktop'
                  ? 'w-full'
                  : viewportDevice === 'tablet'
                  ? 'w-[768px]'
                  : 'w-[390px] ring-8 ring-slate-800'
              }`}
            >
              {renderLivePageView()}
            </div>
          </div>
        </section>
      </main>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* מודל עריכת עמוד (Guided Server-Driven Editor)          */}
      {/* ═══════════════════════════════════════════════════════ */}
      {isEditorOpen && selectedPage && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#0B0F1A] border border-cyan-500/40 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col text-right">
            <div className="p-5 border-b border-white/10 flex items-center justify-between bg-slate-900/60">
              <div className="flex items-center gap-2">
                <Icons.Edit3 className="w-5 h-5 text-cyan-400" />
                <h3 className="font-black text-white text-base">עורך עמוד מונחה שרת: {selectedPage.pageTitle}</h3>
              </div>
              <button
                onClick={() => setIsEditorOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400"
              >
                <Icons.X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditor} className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
              {/* כרטיס 1: הגדרות בסיס */}
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 space-y-3">
                <h4 className="font-bold text-white text-sm">1. הגדרות עמוד וכתובת</h4>
                <div>
                  <label className="block text-slate-400 mb-1">כותרת העמוד הראשית</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white focus:outline-none focus:border-cyan-400 text-xs"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Slug (נתיב URL)</label>
                    <input
                      type="text"
                      value={editSlug}
                      onChange={(e) => setEditSlug(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white focus:outline-none focus:border-cyan-400 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">צבע מותג ראשי</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={editPrimaryColor}
                        onChange={(e) => setEditPrimaryColor(e.target.value)}
                        className="w-9 h-9 rounded-xl bg-transparent cursor-pointer border-0"
                      />
                      <span className="text-slate-300 font-mono text-xs">{editPrimaryColor}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* כרטיס 2: תוכן אזור Hero */}
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 space-y-3">
                <h4 className="font-bold text-white text-sm">2. כותרות אזור ראשי (Hero)</h4>
                <div>
                  <label className="block text-slate-400 mb-1">כותרת שיווקית מרכזית</label>
                  <input
                    type="text"
                    value={editHeroTitle}
                    onChange={(e) => setEditHeroTitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white focus:outline-none focus:border-cyan-400 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">תת-כותרת והסבר</label>
                  <textarea
                    rows={2}
                    value={editHeroSubtitle}
                    onChange={(e) => setEditHeroSubtitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white focus:outline-none focus:border-cyan-400 text-xs resize-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">טקסט כפתור הנעה לפעולה</label>
                  <input
                    type="text"
                    value={editHeroCta}
                    onChange={(e) => setEditHeroCta(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white focus:outline-none focus:border-cyan-400 text-xs"
                  />
                </div>
              </div>

              {/* כרטיס 3: הצגת/הסתרת מקטעים בעמוד */}
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 space-y-3">
                <h4 className="font-bold text-white text-sm">3. מקטעים פעילים בעמוד</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {Object.keys(activeSectionsMap).map((secKey) => (
                    <label
                      key={secKey}
                      className="p-3 rounded-xl bg-slate-950 border border-white/5 flex items-center justify-between cursor-pointer hover:border-cyan-500/30"
                    >
                      <span className="font-bold text-white capitalize">{secKey}</span>
                      <input
                        type="checkbox"
                        checked={activeSectionsMap[secKey]}
                        onChange={(e) =>
                          setActiveSectionsMap({ ...activeSectionsMap, [secKey]: e.target.checked })
                        }
                        className="rounded accent-cyan-400"
                      />
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700"
                >
                  ביטול
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-6 py-2.5 rounded-xl bg-cyan-400 text-slate-950 font-black hover:bg-cyan-300 flex items-center gap-2 shadow-lg shadow-cyan-400/20"
                >
                  <Icons.Save className="w-4 h-4" />
                  <span>{isProcessing ? 'שומר ב-Firestore...' : 'שמור שינויים ב-Firestore'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════ */}
      {/* מודל הקמת עמוד חדש (Create New Page)                  */}
      {/* ═══════════════════════════════════════════════════════ */}
      {isNewPageOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0B0F1A] border border-cyan-500/40 rounded-3xl shadow-2xl p-6 space-y-5 text-right">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Icons.PlusCircle className="w-5 h-5 text-cyan-400" />
                <h3 className="font-black text-white text-base">הקמת עמוד אינטראקטיבי חדש</h3>
              </div>
              <button onClick={() => setIsNewPageOpen(false)} className="text-slate-400 hover:text-white">
                <Icons.X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewPageSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">שם העמוד</label>
                <input
                  type="text"
                  placeholder="לדוגמה: שירות ייעוץ פרימיום"
                  value={newPageTitle}
                  onChange={(e) => setNewPageTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white focus:outline-none focus:border-cyan-400 text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">קטגוריה</label>
                <select
                  value={newPageCategory}
                  onChange={(e) => setNewPageCategory(e.target.value as PageCategory)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white focus:outline-none focus:border-cyan-400 text-xs"
                >
                  <option value="landing">דף נחיתה והמרה</option>
                  <option value="service_product">מוצר ושירות</option>
                  <option value="home">עמוד בית מרכזי</option>
                  <option value="legal_compliance">מסמך משפטי</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Slug באנגלית (אופציונלי)</label>
                <input
                  type="text"
                  placeholder="vip-service"
                  value={newPageSlug}
                  onChange={(e) => setNewPageSlug(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white focus:outline-none focus:border-cyan-400 text-xs font-mono"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsNewPageOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  ביטול
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-5 py-2 rounded-xl bg-cyan-400 text-slate-950 font-black hover:bg-cyan-300 shadow-md shadow-cyan-400/20"
                >
                  {isProcessing ? 'יוצר...' : 'צור עמוד ב-Firestore ◀'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════ */}
      {/* מודל מחולל בינה מלאכותית (AI Generator)                */}
      {/* ═══════════════════════════════════════════════════════ */}
      {isAiGeneratorOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#0B0F1A] border border-purple-500/40 rounded-3xl shadow-2xl p-6 space-y-5 text-right">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Icons.Sparkles className="w-5 h-5 text-purple-400" />
                <h3 className="font-black text-white text-base">מחולל עמודים אוטונומי KosAi 2026</h3>
              </div>
              <button onClick={() => setIsAiGeneratorOpen(false)} className="text-slate-400 hover:text-white">
                <Icons.X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRunAiGenerator} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-bold">תארו את מטרת העמוד או הרעיון העסקי:</label>
                <textarea
                  rows={3}
                  placeholder="לדוגמה: דף נחיתה לסוכנות שיווק דיגיטלי המתמקדת ברופאי שיניים עם דגש על שאלות ותשובות והסרת חששות"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-white/10 text-white focus:outline-none focus:border-purple-400 text-xs resize-none"
                  required
                />
              </div>

              {/* הצעות מהירות */}
              <div className="space-y-1.5">
                <span className="text-[11px] text-slate-400">הצעות מובילות לבחירה מהירה:</span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'סוכנות שיווק דיגיטלי מתקדמת',
                    'קורס ליווי והכשרה מקצועית',
                    'נכסי נדל"ן יוקרתיים להשקעה',
                    'שירות מוסך ורכבי פרימיום',
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAiPrompt(preset)}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 border border-white/5 hover:border-purple-400/40 text-slate-300 text-[11px]"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {isProcessing && (
                <div className="space-y-2 py-2">
                  <div className="flex items-center justify-between text-xs text-purple-300 font-bold">
                    <span>בונה 8 אזורי תוכן קוהרנטיים...</span>
                    <span>{aiProgress}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 transition-all duration-300"
                      style={{ width: `${aiProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAiGeneratorOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  סגור
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black hover:opacity-95 shadow-lg shadow-purple-500/25"
                >
                  {isProcessing ? 'מייצר...' : 'חולל עמוד עכשיו ◀'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════ */}
      {/* מודל תבניות דגל (Blueprints Catalog)                    */}
      {/* ═══════════════════════════════════════════════════════ */}
      {isBlueprintsOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#0B0F1A] border border-cyan-500/40 rounded-3xl shadow-2xl p-6 space-y-5 text-right max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Icons.Layers className="w-5 h-5 text-cyan-400" />
                <h3 className="font-black text-white text-base">קטלוג תבניות פרימיום (Page Blueprints)</h3>
              </div>
              <button onClick={() => setIsBlueprintsOpen(false)} className="text-slate-400 hover:text-white">
                <Icons.X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-y-auto flex-1 p-1">
              {[
                {
                  id: 'modern_business',
                  title: 'פורטל עסקי מודרני',
                  badge: 'עסקים וחברות',
                  desc: 'שער מותגי עוצמתי הכולל Bento Grid, אזור אמון וטופס המרה ישיר.',
                },
                {
                  id: 'luxury_course',
                  title: 'קורס דגל והכשרת יוקרה',
                  badge: 'לימודים ומנטורינג',
                  desc: 'דף הרשמה מלא עם חבילות מחיר, המלצות וידאו ושאלות תשובות.',
                },
                {
                  id: 'service_agency',
                  title: 'סוכנות שירותים ודיגיטל',
                  badge: 'סוכנויות',
                  desc: 'עיצוב כהה וממוקד תוצאות המדגיש מדדי ביצוע והוכחה חברתית.',
                },
                {
                  id: 'product_showcase',
                  title: 'השקת מוצר פרימיום',
                  badge: 'מוצרים',
                  desc: 'חוויית הצגה אינטראקטיבית עם הדגשת יתרונות וטיימר רכישה.',
                },
              ].map((bp) => (
                <div
                  key={bp.id}
                  className="p-5 rounded-2xl bg-slate-900/70 border border-white/10 hover:border-cyan-400/40 flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 mb-2 inline-block">
                      {bp.badge}
                    </span>
                    <h4 className="font-bold text-white text-sm mb-1">{bp.title}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed mb-4">{bp.desc}</p>
                  </div>
                  <button
                    disabled={isProcessing}
                    onClick={() => handleApplyBlueprint(bp.id)}
                    className="w-full py-2.5 rounded-xl text-xs font-bold bg-cyan-400 text-slate-950 hover:bg-cyan-300 transition-all flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <Icons.Check className="w-3.5 h-3.5" />
                    <span>החל תבנית זו עכשיו ◀</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════ */}
      {/* מודל דוח SEO ומטא (SEO Analysis)                       */}
      {/* ═══════════════════════════════════════════════════════ */}
      {isSeoModalOpen && seoResult && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-[#0B0F1A] border border-amber-500/40 rounded-3xl shadow-2xl p-6 space-y-5 text-right max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Icons.BarChart3 className="w-5 h-5 text-amber-400" />
                <h3 className="font-black text-white text-base">דוח SEO וסכמה: {selectedPage?.pageTitle}</h3>
              </div>
              <button onClick={() => setIsSeoModalOpen(false)} className="text-slate-400 hover:text-white">
                <Icons.X className="w-5 h-5" />
              </button>
            </div>

            {/* ציון SEO */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
              <div>
                <div className="text-xs text-amber-300 font-bold">ציון התאמה אורגנית למנועי חיפוש</div>
                <div className="text-2xl font-black text-white">{seoResult.score} / 100</div>
              </div>
              <div className="w-12 h-12 rounded-full bg-amber-500 text-slate-950 font-black text-lg flex items-center justify-center">
                {seoResult.score}
              </div>
            </div>

            {/* סטטוס רכיבים */}
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-900 border border-white/5 space-y-1">
                <span className="font-bold text-white">כותרת מטא (Title Tag):</span>
                <p className="text-slate-300">{seoResult.titleStatus.text}</p>
                <span className="text-[11px] text-cyan-400">{seoResult.titleStatus.note}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-white/5 space-y-1">
                <span className="font-bold text-white">תיאור מטא (Meta Description):</span>
                <p className="text-slate-300">{seoResult.descStatus.text || 'לא הוגדר עדיין'}</p>
                <span className="text-[11px] text-cyan-400">{seoResult.descStatus.note}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-white/5 space-y-1">
                <span className="font-bold text-white">מבנה כותרות H1:</span>
                <p className="text-slate-300">{seoResult.h1Status.note}</p>
              </div>
            </div>

            {/* סכמת JSON-LD מוכנה */}
            <div className="space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white">תגית Schema.org JSON-LD מוכנה להטמעה:</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(seoResult.schemaSnippet);
                    showToast('הקוד הועתק ללוח!');
                  }}
                  className="text-cyan-400 hover:underline flex items-center gap-1"
                >
                  <Icons.Copy className="w-3 h-3" />
                  <span>העתק קוד</span>
                </button>
              </div>
              <pre className="p-3 rounded-xl bg-slate-950 border border-white/10 text-[11px] text-slate-300 font-mono overflow-x-auto text-left" dir="ltr">
                {seoResult.schemaSnippet}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════ */}
      {/* מודל ביקורת מהירות (Core Web Vitals)                  */}
      {/* ═══════════════════════════════════════════════════════ */}
      {isCwvModalOpen && cwvResult && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#0B0F1A] border border-emerald-500/40 rounded-3xl shadow-2xl p-6 space-y-5 text-right">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Icons.Activity className="w-5 h-5 text-emerald-400" />
                <h3 className="font-black text-white text-base">ביצועי מהירות ו-Core Web Vitals</h3>
              </div>
              <button onClick={() => setIsCwvModalOpen(false)} className="text-slate-400 hover:text-white">
                <Icons.X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                <div className="text-xl font-black text-emerald-400">{cwvResult.lcp.value}</div>
                <div className="text-[11px] font-bold text-white mt-1">LCP (טעינה)</div>
                <div className="text-[10px] text-emerald-300">מעולה ✓</div>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                <div className="text-xl font-black text-emerald-400">{cwvResult.cls.value}</div>
                <div className="text-[11px] font-bold text-white mt-1">CLS (יציבות)</div>
                <div className="text-[10px] text-emerald-300">אפס תזוזות ✓</div>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                <div className="text-xl font-black text-emerald-400">{cwvResult.inp.value}</div>
                <div className="text-[11px] font-bold text-white mt-1">INP (תגובה)</div>
                <div className="text-[10px] text-emerald-300">תגובה מיידית ✓</div>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-white">מסקנות מהירות ואופטימיזציה:</h4>
              <ul className="space-y-1.5 text-slate-300">
                {cwvResult.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <Icons.Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════ */}
      {/* מודל זוויות שיווק (Brand DNA Marketing Hooks)         */}
      {/* ═══════════════════════════════════════════════════════ */}
      {isMarketingModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#0B0F1A] border border-amber-500/40 rounded-3xl shadow-2xl p-6 space-y-5 text-right max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Icons.Lightbulb className="w-5 h-5 text-amber-400" />
                <h3 className="font-black text-white text-base">6 זוויות שיווק נגזרות Brand DNA</h3>
              </div>
              <button onClick={() => setIsMarketingModalOpen(false)} className="text-slate-400 hover:text-white">
                <Icons.X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 overflow-y-auto flex-1 text-xs p-1">
              {marketingAngles.map((ang) => (
                <div
                  key={ang.id}
                  className="p-4 rounded-2xl bg-slate-900/80 border border-white/5 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-black text-amber-400 text-sm">{ang.angleTitle}</span>
                    <span className="text-[10px] text-slate-400 font-medium">{ang.primaryChannel}</span>
                  </div>
                  <h4 className="text-base font-bold text-white">"{ang.headlineHook}"</h4>
                  <p className="text-slate-300 text-xs">{ang.subHook}</p>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-cyan-400 font-bold">CTA מומלץ: {ang.suggestedCta}</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`${ang.headlineHook}\n${ang.subHook}`);
                        showToast('זווית השיווק הועתקה!');
                      }}
                      className="px-3 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-[11px] flex items-center gap-1"
                    >
                      <Icons.Copy className="w-3 h-3" />
                      <span>העתק טקסט</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════ */}
      {/* מודל שיתוף וקוד QR                                    */}
      {/* ═══════════════════════════════════════════════════════ */}
      {isQrModalOpen && selectedPage && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#0B0F1A] border border-cyan-500/40 rounded-3xl shadow-2xl p-6 space-y-5 text-center">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 text-right">
              <h3 className="font-black text-white text-base">קוד QR ושיתוף מהיר</h3>
              <button onClick={() => setIsQrModalOpen(false)} className="text-slate-400 hover:text-white">
                <Icons.X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 rounded-2xl bg-white inline-block shadow-xl mx-auto">
              <QRCodeSVG
                value={`https://gen-lang-client-0982749713.web.app/KOSWEB?slug=${selectedPage.slug}`}
                size={180}
              />
            </div>

            <div className="space-y-1">
              <div className="font-bold text-white text-sm">{selectedPage.pageTitle}</div>
              <div className="text-xs text-cyan-400 font-mono">
                /KOSWEB?slug={selectedPage.slug}
              </div>
            </div>

            <button
              onClick={() => {
                const url = `https://gen-lang-client-0982749713.web.app/KOSWEB?slug=${selectedPage.slug}`;
                navigator.clipboard.writeText(url);
                showToast('הקישור הועתק ללוח!');
              }}
              className="w-full py-3 rounded-xl bg-cyan-400 text-slate-950 font-black text-xs hover:bg-cyan-300 flex items-center justify-center gap-2 shadow-lg shadow-cyan-400/20"
            >
              <Icons.Copy className="w-4 h-4" />
              <span>העתק קישור ישיר לעמוד</span>
            </button>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════ */}
      {/* מודל עמודי חובה משפטיים                               */}
      {/* ═══════════════════════════════════════════════════════ */}
      {isLegalModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#0B0F1A] border border-emerald-500/40 rounded-3xl shadow-2xl p-6 space-y-5 text-right">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Icons.ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="font-black text-white text-base">תשתיות משפט, הגנת הצרכן ונגישות</h3>
              </div>
              <button onClick={() => setIsLegalModalOpen(false)} className="text-slate-400 hover:text-white">
                <Icons.X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              מערכת קושאן כוללת תבניות עמודי חובה מלאים בהתאם לדין הישראלי: חוק הגנת הצרכן, חוק הגנת הפרטיות ותקן ת"י 5568 ברמת AA.
            </p>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">1. תקנון ותנאי שימוש באתר</div>
                  <div className="text-slate-400 text-[11px]">מדיניות ביטול עסקאות והחזרים לפי חוק הגנת הצרכן</div>
                </div>
                <Icons.CheckCircle className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">2. מדיניות פרטיות ומאגרי מידע</div>
                  <div className="text-slate-400 text-[11px]">עמידה בתקנות אבטחת מידע והגנת פרטיות ישראלית</div>
                </div>
                <Icons.CheckCircle className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">3. הצהרת נגישות תקן 5568 ברמה AA</div>
                  <div className="text-slate-400 text-[11px]">התאמה מלאה לקוראי מסך וניווט מקלדת</div>
                </div>
                <Icons.CheckCircle className="w-4 h-4 text-emerald-400" />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsLegalModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs"
              >
                סגור
              </button>
              <button
                onClick={handleSyncLegalPages}
                disabled={isProcessing}
                className="px-5 py-2 rounded-xl bg-emerald-400 text-slate-950 font-black text-xs hover:bg-emerald-300 shadow-md shadow-emerald-400/20"
              >
                {isProcessing ? 'מסנכרן...' : 'סנכרן 3 עמודים ל-Firestore ◀'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* פוטר אוניברסלי KOSUN */}
      <KosunUniversalFooter />
    </div>
  );
};
