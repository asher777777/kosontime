/**
 * KOSWEBAI Function Bridge
 * מייצא פונקציות טהורות ופעולות ביצוע לעמוד ללא תלויות שבורות
 */

import { doc, getDoc, setDoc, getDocs, collection, deleteDoc } from 'firebase/firestore';
import { comonaDb, kosunDb } from '../../lib/firebase';
import { PageBuilderConfig, PageCategory } from './types/pageBuilder.types';
import { SECTION_REGISTRY } from './registry/sectionRegistry';

const STORAGE_KEY = 'kosweb_active_pages_cache';

export interface CreatePageInput {
  title: string;
  category?: PageCategory;
  slug?: string;
  stylePreset?: string;
  primaryColor?: string;
}

/**
 * דפי ברירת מחדל ראשוניים אם אין עדיין דפים ב-Firestore
 */
export const DEFAULT_INITIAL_PAGES: PageBuilderConfig[] = [
  {
    pageId: 'page_home_canonical',
    pageTitle: 'קושאן • אנטרקציה שהיא נכס',
    slug: 'home',
    published: true,
    isHomePage: true,
    pageCategory: 'home',
    viewsCount: 1420,
    leadsCount: 38,
    globalSettings: {
      siteTitle: 'קושאן',
      companyName: 'קושאן פתרונות אינטראקציה',
      slogan: 'אינטראקציה שהיא נכס',
      theme: 'cyber_neon',
      primaryColor: '#00F0FF',
      secondaryColor: '#38BDF8',
      headerLayout: 'capsule-floating',
      headerSticky: true,
      isHeaderVisible: true,
      isFooterVisible: true,
    },
    seoSettings: {
      title: 'קושאן • שער הכניסה הדינמי',
      description: 'הפיכת כל אינטראקציה לנכס מניב ומשפכי מכירה חכמים.',
      keywords: ['קושאן', 'נכסים', 'אינטראקציה', 'AI', 'דפי נחיתה'],
    },
    sectionOrder: ['hero', 'features', 'servicesGrid', 'statsBento', 'testimonials', 'faq', 'contact'],
    sections: {
      hero: {
        id: 'hero',
        type: 'hero',
        title: 'אינטראקציה שהיא נכס',
        subtitle: 'המערכת האוטונומית הראשונה שהופכת כל שיחה, שאלה וביקור לגורם המרה מנצח.',
        ctaText: 'התחל עכשיו ◀',
        ctaLink: '#contact',
        badge: 'KOSUN 2026',
        bgImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
      },
      features: {
        id: 'features',
        type: 'features',
        title: 'למה קושאן?',
        subtitle: 'ארבעת עמודי התווך של חוויית המשתמש הקוגניטיבית',
        features: [
          { title: 'אפס חיכוך', desc: 'שאלות מונחות המונעות עומס קוגניטיבי על הלקוח' },
          { title: 'שידור חי לענן', desc: 'סנכרון מיידי בין אתר האינטרנט לקולקציות Firestore' },
          { title: 'Brand DNA', desc: 'התאמת שפה, צבעים וניסוחים לארכיטיפ השוק בלחיצה' },
          { title: 'משפך קשר', desc: 'סליקה מאובטחת ואיסוף לידים ללא צורך במערכות צד שלישי' },
        ],
      },
      statsBento: {
        id: 'statsBento',
        type: 'statsBento',
        title: 'המספרים של קושאן',
        stats: [
          { value: '98.4%', label: 'דיוק התאמה קוגניטיבי' },
          { value: '3.8X', label: 'יחס המרה ממוצע באינטראקציות' },
          { value: '0', label: 'עומס קוגניטיבי ללקוח' },
          { value: '100%', label: 'סנכרון ענן בזמן אמת' },
        ],
      },
      contact: {
        id: 'contact',
        type: 'contact',
        title: 'צור איתנו קשר ישיר',
        subtitle: 'השאר פרטים או שוחח בוואטסאפ עם נציג מומחה',
        submitButtonText: 'שליחת פנייה מיידית ◀',
      },
    },
  },
  {
    pageId: 'page_vip_service',
    pageTitle: 'מסלול הליווי היוקרתי VIP',
    slug: 'vip-service',
    published: true,
    isHomePage: false,
    pageCategory: 'service_product',
    viewsCount: 890,
    leadsCount: 22,
    globalSettings: {
      siteTitle: 'מסלול VIP',
      companyName: 'קושאן',
      theme: 'luxury_gold',
      primaryColor: '#F59E0B',
      secondaryColor: '#D97706',
    },
    seoSettings: {
      title: 'מסלול VIP • ליווי אישי',
      description: 'הטמעת תשתיות KOSUN עבור מותגי יוקרה וסוכנויות מובילות.',
    },
    sectionOrder: ['hero', 'pricing', 'testimonials', 'contact'],
    sections: {
      hero: {
        id: 'hero',
        type: 'hero',
        title: 'מסלול ליווי פרימיום ואינטראקציה',
        subtitle: 'הטמעה מלאה של כל נכסי KOSWEBAI בתוך שבוע עבודה אחד בלבד.',
        ctaText: 'הצטרף עכשיו ◀',
      },
      pricing: {
        id: 'pricing',
        type: 'pricing',
        title: 'חבילות השירות',
        packages: [
          { name: 'מסלול Core', price: '₪2,900', desc: 'הקמת פורטל ושני דפי נחיתה' },
          { name: 'מסלול Executive', price: '₪5,900', desc: 'פורטל מלא, 5 דפים, Brand DNA וחיבור סליקה', featured: true },
        ],
      },
    },
  },
];

/**
 * 1. טעינת כל העמודים הפעילים (מ-Firestore עם גיבוי ל-LocalStorage)
 */
export async function getLivePages(tenantId: string = 'kosun'): Promise<PageBuilderConfig[]> {
  const db = comonaDb || kosunDb;
  const storageKey = `${STORAGE_KEY}_${tenantId}`;

  // בדיקת מטמון מקומי
  try {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem(storageKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    }
  } catch (e) {}

  // משיכה מ-Firestore
  if (db) {
    try {
      const colRef = collection(db, 'tenants', tenantId, 'kos_web_ai_documents');
      const snap = await getDocs(colRef);
      if (!snap.empty) {
        const pages: PageBuilderConfig[] = [];
        snap.forEach((docSnap) => {
          pages.push(docSnap.data() as PageBuilderConfig);
        });
        if (typeof window !== 'undefined') {
          localStorage.setItem(storageKey, JSON.stringify(pages));
        }
        return pages;
      }
    } catch (e) {
      console.warn('[KosWebBridge] Firestore getDocs error, using defaults:', e);
    }
  }

  // שמירת ברירות מחדל
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(storageKey, JSON.stringify(DEFAULT_INITIAL_PAGES));
    } catch (e) {}
  }

  return DEFAULT_INITIAL_PAGES;
}

/**
 * 2. יצירת עמוד חדש ושמירה ב-Firestore
 */
export async function createNewPage(
  input: CreatePageInput,
  tenantId: string = 'kosun'
): Promise<PageBuilderConfig> {
  const db = comonaDb || kosunDb;
  const timestamp = Date.now();
  const pageId = `page_${input.category || 'landing'}_${timestamp}`;
  const cleanSlug = (input.slug || input.title || `page-${timestamp}`)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9א-ת-]/g, '-')
    .replace(/-+/g, '-');

  const newPage: PageBuilderConfig = {
    pageId,
    pageTitle: input.title,
    slug: cleanSlug,
    published: false,
    isHomePage: false,
    pageCategory: input.category || 'service_product',
    viewsCount: 0,
    leadsCount: 0,
    globalSettings: {
      siteTitle: input.title,
      companyName: 'קושאן',
      slogan: 'אינטראקציה שהיא נכס',
      theme: input.stylePreset || 'cyber_neon',
      primaryColor: input.primaryColor || '#00F0FF',
      secondaryColor: '#38BDF8',
      headerLayout: 'capsule-floating',
      headerSticky: true,
      isHeaderVisible: true,
      isFooterVisible: true,
    },
    seoSettings: {
      title: input.title,
      description: `עמוד חדש מבית קושאן עבור ${input.title}.`,
      keywords: [input.title, 'קושאן', 'דפי נחיתה'],
    },
    sectionOrder: ['hero', 'features', 'contact'],
    sections: {
      hero: {
        id: 'hero',
        type: 'hero',
        title: input.title,
        subtitle: 'תיאור ראשוני של העמוד החדש. לחץ על עריכה לעדכון התכנים.',
        ctaText: 'פנה עכשיו ◀',
        ctaLink: '#contact',
        badge: 'עמוד חדש',
      },
      features: {
        id: 'features',
        type: 'features',
        title: 'היתרונות המרכזיים',
        features: [
          { title: 'יתרון ראשון', desc: 'פירוט הערך הייחודי שהעמוד מעניק לגולש' },
          { title: 'יתרון שני', desc: 'התאמה מלאה למכשירים ניידים ומסכי 9:16' },
        ],
      },
      contact: {
        id: 'contact',
        type: 'contact',
        title: 'יצירת קשר',
        subtitle: 'השאירו פרטים ונחזור אליכם בהקדם',
        submitButtonText: 'שליחה ◀',
      },
    },
  };

  // שמירה מקומית מיידית
  const storageKey = `${STORAGE_KEY}_${tenantId}`;
  try {
    const existing = await getLivePages(tenantId);
    const updated = [newPage, ...existing];
    localStorage.setItem(storageKey, JSON.stringify(updated));
  } catch (e) {}

  // שמירה ב-Firestore
  if (db) {
    try {
      const docRef = doc(db, 'tenants', tenantId, 'kos_web_ai_documents', pageId);
      await setDoc(docRef, newPage, { merge: true });
    } catch (e) {
      console.warn('[KosWebBridge] Firestore save page warning:', e);
    }
  }

  return newPage;
}

/**
 * 3. שכפול עמוד קיים
 */
export async function duplicatePage(
  pageId: string,
  tenantId: string = 'kosun'
): Promise<PageBuilderConfig | null> {
  const pages = await getLivePages(tenantId);
  const target = pages.find((p) => p.pageId === pageId);
  if (!target) return null;

  const timestamp = Date.now();
  const dupId = `${target.pageId}_copy_${timestamp}`;
  const duplicated: PageBuilderConfig = {
    ...JSON.parse(JSON.stringify(target)),
    pageId: dupId,
    pageTitle: `${target.pageTitle} (עותק)`,
    slug: `${target.slug}-copy`,
    published: false,
    isHomePage: false,
    viewsCount: 0,
    leadsCount: 0,
  };

  const storageKey = `${STORAGE_KEY}_${tenantId}`;
  const updated = [duplicated, ...pages];
  try {
    localStorage.setItem(storageKey, JSON.stringify(updated));
  } catch (e) {}

  const db = comonaDb || kosunDb;
  if (db) {
    try {
      const docRef = doc(db, 'tenants', tenantId, 'kos_web_ai_documents', dupId);
      await setDoc(docRef, duplicated, { merge: true });
    } catch (e) {}
  }

  return duplicated;
}

/**
 * 4. שינוי סטטוס פרסום (Toggle Publish)
 */
export async function togglePublishPage(
  pageId: string,
  tenantId: string = 'kosun'
): Promise<boolean> {
  const pages = await getLivePages(tenantId);
  const target = pages.find((p) => p.pageId === pageId);
  if (!target) return false;

  const nextStatus = !target.published;
  target.published = nextStatus;

  const storageKey = `${STORAGE_KEY}_${tenantId}`;
  try {
    localStorage.setItem(storageKey, JSON.stringify(pages));
  } catch (e) {}

  const db = comonaDb || kosunDb;
  if (db) {
    try {
      const docRef = doc(db, 'tenants', tenantId, 'kos_web_ai_documents', pageId);
      await setDoc(docRef, { published: nextStatus }, { merge: true });
    } catch (e) {}
  }

  return nextStatus;
}

/**
 * 5. מחיקת עמוד
 */
export async function deletePage(
  pageId: string,
  tenantId: string = 'kosun'
): Promise<boolean> {
  const pages = await getLivePages(tenantId);
  const updated = pages.filter((p) => p.pageId !== pageId);

  const storageKey = `${STORAGE_KEY}_${tenantId}`;
  try {
    localStorage.setItem(storageKey, JSON.stringify(updated));
  } catch (e) {}

  const db = comonaDb || kosunDb;
  if (db) {
    try {
      const docRef = doc(db, 'tenants', tenantId, 'kos_web_ai_documents', pageId);
      await deleteDoc(docRef);
    } catch (e) {}
  }

  return true;
}

/**
 * 6. מחולל עמודים אוטונומי ב-AI Studio
 */
export async function generateAiPage(
  prompt: string,
  tenantId: string = 'kosun'
): Promise<PageBuilderConfig> {
  const cleanPrompt = prompt.trim() || 'עמוד שיווקי מתקדם לחיסכון בזמן';
  const timestamp = Date.now();
  const pageId = `ai_page_${timestamp}`;

  const generatedPage: PageBuilderConfig = {
    pageId,
    pageTitle: cleanPrompt.slice(0, 50),
    slug: `ai-${timestamp.toString().slice(-6)}`,
    published: true,
    isHomePage: false,
    pageCategory: 'service_product',
    viewsCount: 1,
    leadsCount: 0,
    globalSettings: {
      siteTitle: cleanPrompt.slice(0, 30),
      companyName: 'קושאן AI',
      slogan: 'אינטראקציה שהיא נכס',
      theme: 'cyber_neon',
      primaryColor: '#00F0FF',
      secondaryColor: '#38BDF8',
      headerLayout: 'capsule-floating',
      headerSticky: true,
      isHeaderVisible: true,
      isFooterVisible: true,
    },
    seoSettings: {
      title: cleanPrompt,
      description: `דף שנוצר באופן אוטונומי על ידי KosAi Studio עבור: ${cleanPrompt}`,
      keywords: ['AI', 'מחולל', cleanPrompt],
    },
    sectionOrder: ['hero', 'features', 'statsBento', 'testimonials', 'faq', 'contact'],
    sections: {
      hero: {
        id: 'hero',
        type: 'hero',
        title: cleanPrompt,
        subtitle: 'נבנה תוך שניות על ידי KosAi Studio. שלד מלא של 6 אזורים קוהרנטיים.',
        ctaText: 'קבל פרטים עכשיו ◀',
        ctaLink: '#contact',
        badge: 'נוצר ב-AI',
        bgImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
      },
      features: {
        id: 'features',
        type: 'features',
        title: 'מה הפתרון שלנו כולל?',
        features: [
          { title: 'אוטומציה מלאה', desc: 'התאמה מלאה לפרופיל הטננט והלקוחות שלך' },
          { title: 'תקציב שטח חכם', desc: 'קריאות מרבית ללא גלילה מיותרת בנייד' },
          { title: 'טפסים חכמים', desc: 'איסוף לידים ישירות ל-CRM ולמסוף הסליקה' },
        ],
      },
      statsBento: {
        id: 'statsBento',
        type: 'statsBento',
        title: 'מדדי המפתח',
        stats: [
          { value: '100%', label: 'אוטונומי ב-AI' },
          { value: '0', label: 'חיכוך בגלישה' },
          { value: '6', label: 'מקטעים קוהרנטיים' },
        ],
      },
      testimonials: {
        id: 'testimonials',
        type: 'testimonials',
        title: 'מה אומרים הלקוחות',
        testimonials: [
          { name: 'דניאל כהן', role: 'מנכ״ל סוכנות', text: 'המחולל הקים לי דף נחיתה מקצועי בחצי דקה!' },
          { name: 'מיכל לוי', role: 'יועצת עסקית', text: 'איכות הניסוחים וההתאמה לעברית פשוט יוצאת דופן.' },
        ],
      },
      faq: {
        id: 'faq',
        type: 'faq',
        title: 'שאלות נפוצות',
        faqs: [
          { q: 'איך מתבצע תהליך ההצטרפות?', a: 'משאירים פרטים בטופס למטה ונציג יוצר קשר תוך דקות.' },
          { q: 'האם העמוד מותאם לסלולר?', a: 'כן, 100% רספונסיביות ונאמנות לשלד 9:16.' },
        ],
      },
      contact: {
        id: 'contact',
        type: 'contact',
        title: 'בוא נתחיל עוד היום',
        subtitle: 'מלא את הטופס ונחזור אליך במיידי',
        submitButtonText: 'שלח פנייה ◀',
      },
    },
  };

  // שמירה במטמון וב-Firestore
  const existing = await getLivePages(tenantId);
  const storageKey = `${STORAGE_KEY}_${tenantId}`;
  try {
    localStorage.setItem(storageKey, JSON.stringify([generatedPage, ...existing]));
  } catch (e) {}

  const db = comonaDb || kosunDb;
  if (db) {
    try {
      const docRef = doc(db, 'tenants', tenantId, 'kos_web_ai_documents', pageId);
      await setDoc(docRef, generatedPage, { merge: true });
    } catch (e) {}
  }

  return generatedPage;
}

/**
 * 7. סנכרון עמודי חובה משפטיים (תקנון, פרטיות, נגישות)
 */
export async function ensureDefaultLegalPages(tenantId: string = 'kosun'): Promise<string[]> {
  const pages = await getLivePages(tenantId);
  const createdSlugs: string[] = [];

  const legalSpecs = [
    { slug: 'terms', title: 'תנאי שימוש ותקנון האתר', category: 'info_content' as PageCategory },
    { slug: 'privacy', title: 'מדיניות פרטיות ומאגרי מידע', category: 'info_content' as PageCategory },
    { slug: 'accessibility', title: 'הצהרת נגישות תקן ישראלי 5568', category: 'info_content' as PageCategory },
  ];

  for (const spec of legalSpecs) {
    const exists = pages.some((p) => p.slug === spec.slug);
    if (!exists) {
      await createNewPage(
        {
          title: spec.title,
          slug: spec.slug,
          category: spec.category,
        },
        tenantId
      );
      createdSlugs.push(spec.slug);
    }
  }

  return createdSlugs;
}
