import { Firestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { db as defaultFirestoreDb } from '../../services/firebase';
import type { BrandDna, CommunityBrandProfile } from '../contracts';
import { SYSTEM_COLLECTIONS } from '../contracts/collections';
import { getTenantStorageKey } from '../tenant';

const BASE_LOCAL_STORAGE_KEY = 'kos_branding_settings';
const LEGACY_STORAGE_KEY = 'brand_dna_settings';

export const DEFAULT_BRAND_DNA: BrandDna = {
  identity: {
    companyName: 'קושאן',
    organizationType: 'חברה',
    organizationPurpose: 'כספית - מתן שירותים ופתרונות דיגיטליים מתקדמים',
    memberCount: 'עד 10',
    slogan: 'כל אדם זה נכס',
    companyVision: 'להוביל את תחום השירותים והפתרונות הדיגיטליים תוך מתן יחס אישי, מקצועיות ללא פשרות, וערך אמיתי ומתמשך לכל לקוח ושותף לדרך.',
    shortVision: 'כל אדם זה נכס.',
    logoUrl: '/images/kosun-logo.svg',
    vibeImages: [
      '/images/crm_showcase.jpg',
      '/images/whatsapp_automation.jpg',
      '/images/page_builder_mockup.jpg',
      '/images/campaign_fundraising.jpg'
    ],
  },
  ecosystem: {
    services: [
      'מערכת CRM לאנליטיקה ולניהול לקוחות',
      'פורטל התחברות ואזור אישי ללקוחות',
      'אוטומציות וואטסאפ ושירות לקוחות חכם',
      'בניית דפי נחיתה ומערכת טפסים חכמים',
      'חנות דיגיטלית חכמה (SaaS Storefront)',
      'ניהול קהילות וקבוצות (Community Hub)',
      'פתרונות סליקה וקבלות (Payments Hub)',
      'ניהול שגרירים ותוכניות שותפים'
    ],
    products: [],
    annualEvents: [],
    communities: [],
    businessPackages: [],
  },
  voice: {
    personality: {
      formality: 3,
      warmth: 4,
      luxury: 3,
      energy: 4,
    },
    genderAddressing: 'plural',
    sectorCompliance: 'general',
    powerWords: ['איכות', 'שקט נפשי', 'מומחיות', 'תוצאות מוכחות', 'ליווי אישי'],
    forbiddenWords: ['זול', 'פשוט', 'מבצע אחרון בהחלט', 'חלטורה'],
    shabbatObservant: false,
  },
  audience: {
    mainUvp: 'פתרון מקיף מקצה לקצה המשלב טכנולוגיה עילית עם ליווי אנושי מסור ומקצועי.',
    targetAudiences: ['בעלי עסקים קטנים ובינוניים', 'מנהלי קהילות וארגונים', 'יזמים ומשווקים'],
    personas: [
      {
        id: 'p-1',
        name: 'דן, בעל עסק עצמאי',
        roleOrProfile: 'מנהל פעילות צומחת ללא מחלקת שיווק פנימית',
        mainPain: 'חוסר זמן, פיזור בין כלים שונים ותחושת חוסר סדר במכירות ובגבייה',
        dreamOutcome: 'פלטפורמה אחת שמנהלת את הכל אוטומטית ומגדילה את ההכנסות במינימום מאמץ',
      },
      {
        id: 'p-2',
        name: 'שרה, מנהלת קהילה ועמותה',
        roleOrProfile: 'מובילה פעילות חברתית עם מאות חברים ומתנדבים',
        mainPain: 'קושי לגייס משאבים, לשמור על קשר אישי עם כולם ולייצר אמינות',
        dreamOutcome: 'כלים דיגיטליים שמשקפים את החזון, אוספים תרומות ומחברים את האנשים',
      },
    ],
    commonObjections: [
      {
        id: 'o-1',
        objection: 'האם זה מתאים גם לעסק קטן כמו שלי?',
        rebuttal: 'בהחלט. המערכת מודולרית ומותאמת לגדול יחד איתך, ללא עלויות הקמה מיותרות.',
      },
      {
        id: 'o-2',
        objection: 'כמה זמן ייקח לי להתחיל לראות תוצאות?',
        rebuttal: 'תוך מספר דקות מרגע הגדרת ה-DNA כל הכלים והדפים מוכנים לפעולה מיידית.',
      },
    ],
  },
  designTokens: {
    primaryColor: '#6366f1',
    secondaryColor: '#0ea5e9',
    backgroundColor: '#0f172a',
    textColor: '#f8fafc',
    textColorH1: '#ffffff',
    textColorH2: '#94a3b8',
    buttonBgColor: '#6366f1',
    buttonTextColor: '#ffffff',
    fontFamily: 'Heebo, sans-serif',
    borderRadius: 'md',
    buttonStyle: 'gradient',
    defaultStylePreset: 'standard',
  },
  trust: {
    legalEntityId: '516000000',
    contactPhone: '03-1234567',
    contactEmail: 'contact@mybrand.co.il',
    officeAddress: 'דרך מנחם בגין 144, תל אביב',
    refundPolicySummary: 'החזר כספי מלא תוך 14 יום בהתאם לחוק הגנת הצרכן ללא אותיות קטנות.',
    securityBadgeText: 'סליקה מאובטחת בתקן PCI-DSS ובהצפנת SSL 256-bit',
    whatsappSupportNumber: '0501234567',
  },
};

export function createTenantInitialBrandDna(
  tenantId: string = '_master',
  clientName?: string,
  phone?: string,
  email?: string
): BrandDna {
  if (tenantId === '_master') {
    return DEFAULT_BRAND_DNA;
  }

  const initialCompanyName = (clientName && clientName.trim() !== tenantId.trim()) ? clientName.trim() : '';

  return {
    identity: {
      companyName: initialCompanyName,
      organizationType: 'חברה',
      organizationPurpose: '',
      memberCount: 'עד 10',
      slogan: '',
      companyVision: '',
      shortVision: '',
      logoUrl: '',
      vibeImages: [],
    },
    ecosystem: {
      services: [],
      products: [],
      annualEvents: [],
      communities: [],
      businessPackages: [],
    },
    voice: {
      personality: {
        formality: 3,
        warmth: 4,
        luxury: 3,
        energy: 4,
      },
      genderAddressing: 'plural',
      sectorCompliance: 'general',
      powerWords: [],
      forbiddenWords: [],
      shabbatObservant: false,
    },
    audience: {
      mainUvp: '',
      targetAudiences: [],
      personas: [],
      commonObjections: [],
    },
    designTokens: {
      primaryColor: '#6366f1',
      secondaryColor: '#0ea5e9',
      backgroundColor: '#ffffff',
      textColor: '#0f172a',
      textColorH1: '#0f172a',
      textColorH2: '#475569',
      buttonBgColor: '#6366f1',
      buttonTextColor: '#ffffff',
      fontFamily: 'Heebo, sans-serif',
      borderRadius: 'md',
      buttonStyle: 'gradient',
      defaultStylePreset: 'standard',
    },
    trust: {
      legalEntityId: '',
      contactPhone: phone || '',
      contactEmail: email || '',
      officeAddress: '',
      refundPolicySummary: '',
      securityBadgeText: '',
      whatsappSupportNumber: phone ? phone.replace(/\D/g, '') : '',
    },
  };
}

/**
 * Load Brand DNA from Firestore (scoped to tenant) or LocalStorage
 */
export async function loadBrandDna(db?: Firestore, tenantId: string = '_master'): Promise<BrandDna> {
  const isMaster = tenantId === '_master';
  const baseDefault = isMaster ? DEFAULT_BRAND_DNA : createTenantInitialBrandDna(tenantId);
  const effDb = db || defaultFirestoreDb;

  if (effDb) {
    try {
      const docRef = doc(effDb, 'tenants', tenantId, SYSTEM_COLLECTIONS.SETTINGS, SYSTEM_COLLECTIONS.BRAND_DNA_DOC);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data() as BrandDna;

        if (!isMaster) {
          if (data.identity?.companyName === 'קושאן' || data.identity?.companyName === tenantId) {
            data.identity.companyName = '';
          }
          if (data.identity?.logoUrl === '/images/kosun-logo.svg') {
            data.identity.logoUrl = '';
          }
          if (data.identity?.slogan === 'כל אדם זה נכס') {
            data.identity.slogan = '';
          }
          if (data.identity?.companyVision?.includes('קושאן') || data.identity?.companyVision?.includes(tenantId)) {
            data.identity.companyVision = '';
          }
          if (data.audience?.mainUvp?.includes('קושאן') || data.audience?.mainUvp?.includes(tenantId)) {
            data.audience.mainUvp = '';
          }
        }

        const merged: BrandDna = {
          ...baseDefault,
          ...data,
          identity: { ...baseDefault.identity, ...(data.identity || {}) },
          ecosystem: { ...(baseDefault.ecosystem || { services: [], products: [], annualEvents: [], communities: [], businessPackages: [] }), ...(data.ecosystem || {}) },
          voice: { ...baseDefault.voice, ...(data.voice || {}) },
          audience: { ...baseDefault.audience, ...(data.audience || {}) },
          designTokens: { ...baseDefault.designTokens, ...(data.designTokens || {}) },
          trust: { ...baseDefault.trust, ...(data.trust || {}) },
          uiVocabulary: data.uiVocabulary ? { ...(baseDefault.uiVocabulary || {}), ...data.uiVocabulary } : baseDefault.uiVocabulary,
        };
        try {
          if (typeof window !== 'undefined') {
            const localStorageKey = getTenantStorageKey(BASE_LOCAL_STORAGE_KEY, tenantId);
            localStorage.setItem(localStorageKey, JSON.stringify(merged));
          }
        } catch {
          // ignore storage quota errors
        }
        return merged;
      }

      // Auto-Migration: check legacy doc 'brand_dna' if new 'kos_branding_dna' doesn't exist
      const legacyDocRef = doc(effDb, 'tenants', tenantId, SYSTEM_COLLECTIONS.SETTINGS, 'brand_dna');
      const legacySnap = await getDoc(legacyDocRef);
      if (legacySnap.exists()) {
        const legacyData = legacySnap.data() as BrandDna;
        if (!isMaster) {
          if (legacyData.identity?.companyName === 'קושאן' || legacyData.identity?.companyName === tenantId) {
            legacyData.identity.companyName = '';
          }
          if (legacyData.identity?.logoUrl === '/images/kosun-logo.svg') {
            legacyData.identity.logoUrl = '';
          }
          if (legacyData.identity?.slogan === 'כל אדם זה נכס') {
            legacyData.identity.slogan = '';
          }
        }

        const merged: BrandDna = {
          ...baseDefault,
          ...legacyData,
          identity: { ...baseDefault.identity, ...(legacyData.identity || {}) },
          ecosystem: { ...(baseDefault.ecosystem || { services: [], products: [], annualEvents: [], communities: [], businessPackages: [] }), ...(legacyData.ecosystem || {}) },
          voice: { ...baseDefault.voice, ...(legacyData.voice || {}) },
          audience: { ...baseDefault.audience, ...(legacyData.audience || {}) },
          designTokens: { ...baseDefault.designTokens, ...(legacyData.designTokens || {}) },
          trust: { ...baseDefault.trust, ...(legacyData.trust || {}) },
        };
        return merged;
      }
    } catch (err) {
      console.warn('[BrandDNA Core] Failed to load brand DNA from Firestore, falling back to local:', err);
    }
  }

  // Fallback to LocalStorage
  if (typeof window !== 'undefined') {
    try {
      const localStorageKey = getTenantStorageKey(BASE_LOCAL_STORAGE_KEY, tenantId);
      const stored = localStorage.getItem(localStorageKey);
      if (stored) {
        return { ...baseDefault, ...JSON.parse(stored) };
      }
      const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
      if (legacy) {
        return { ...baseDefault, ...JSON.parse(legacy) };
      }
    } catch {
      // ignore
    }
  }

  return baseDefault;
}

/**
 * Save Brand DNA to Firestore and LocalStorage
 */
export async function saveBrandDna(
  dna: BrandDna,
  db?: Firestore,
  tenantId: string = '_master'
): Promise<{ success: boolean; error?: string }> {
  try {
    if (typeof window !== 'undefined') {
      const localStorageKey = getTenantStorageKey(BASE_LOCAL_STORAGE_KEY, tenantId);
      localStorage.setItem(localStorageKey, JSON.stringify(dna));
    }
  } catch (storageErr) {
    console.warn('[BrandDNA Core] LocalStorage save warning:', storageErr);
  }

  const effDb = db || defaultFirestoreDb;
  if (!effDb) {
    return { success: true };
  }

  try {
    const docRef = doc(effDb, 'tenants', tenantId, SYSTEM_COLLECTIONS.SETTINGS, SYSTEM_COLLECTIONS.BRAND_DNA_DOC);
    await setDoc(
      docRef,
      {
        ...dna,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
    return { success: true };
  } catch (err: any) {
    console.error('[BrandDNA Core] Error saving Brand DNA to Firestore:', err);
    return { success: false, error: err?.message || 'שגיאה בשמירת נתוני המיתוג' };
  }
}

/**
 * Save a content strategy item to the `content_strategies` Firestore collection
 */
export async function saveContentStrategyItem(
  strategy: any,
  db?: Firestore,
  tenantId: string = '_master'
): Promise<{ success: boolean; error?: string }> {
  const strategyId = strategy.id || `strat_${Date.now()}`;
  const payload = {
    ...strategy,
    tenantId,
    savedAt: new Date().toISOString(),
  };

  const effDb = db || defaultFirestoreDb;
  if (effDb) {
    try {
      const docRef = doc(effDb, 'content_strategies', strategyId);
      await setDoc(docRef, payload, { merge: true });
      return { success: true };
    } catch (err: any) {
      console.error('[BrandDNA Core] Error saving content_strategy to Firestore:', err);
      return { success: false, error: err.message };
    }
  }

  // Local storage fallback if db not connected
  try {
    const listKey = `content_strategies_${tenantId}`;
    const existing = JSON.parse(localStorage.getItem(listKey) || '[]');
    existing.push(payload);
    localStorage.setItem(listKey, JSON.stringify(existing));
  } catch {}

  return { success: true };
}

/**
 * Community Brand profile management
 */
export async function getCommunityBrand(
  db: Firestore | null | undefined,
  tenantId: string,
  communityId: string
): Promise<CommunityBrandProfile | null> {
  const effDb = db || defaultFirestoreDb;
  if (!effDb || !communityId) return null;

  try {
    const docRef = doc(effDb, 'tenants', tenantId, SYSTEM_COLLECTIONS.COMMUNITIES, communityId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      if (data?.brandProfile) {
        return data.brandProfile as CommunityBrandProfile;
      }
    }
    return null;
  } catch (err) {
    console.warn('[BrandDNA Core] Failed to fetch community brand profile:', err);
    return null;
  }
}

export async function saveCommunityBrand(
  db: Firestore | null | undefined,
  tenantId: string,
  communityId: string,
  brandProfile: CommunityBrandProfile
): Promise<boolean> {
  const effDb = db || defaultFirestoreDb;
  if (!effDb || !communityId) return false;

  try {
    const docRef = doc(effDb, 'tenants', tenantId, SYSTEM_COLLECTIONS.COMMUNITIES, communityId);
    await setDoc(docRef, { brandProfile, updatedAt: new Date().toISOString() }, { merge: true });
    return true;
  } catch (err) {
    console.error('[BrandDNA Core] Failed to save community brand profile:', err);
    return false;
  }
}


export function buildDefaultBrandUiVocabulary(brand: BrandDna): BrandUiVocabulary {
  const companyName = brand.identity?.companyName || 'המותג';
  const slogan = brand.identity?.slogan || '';
  const uvp = brand.audience?.mainUvp || slogan || '';
  const gender = brand.voice?.genderAddressing || 'plural';

  if (gender === 'female') {
    return {
      primaryCta: 'בואי נתחיל',
      secondaryCta: 'לגלות עוד',
      whatsappCta: 'דברי איתנו ב-WhatsApp',
      contactCta: 'השאירי פרטים ונחזור אלייך',
      formSubmitText: 'שליחת פנייה',
      namePlaceholder: 'שמך המלא',
      phonePlaceholder: 'מספר הטלפון שלך',
      emailPlaceholder: 'כתובת האימייל שלך',
      messagePlaceholder: 'ספרי לנו, במה נוכל לסייע לך?',
      sectionHeadings: {
        heroTitle: slogan ? `${companyName} • ${slogan}` : companyName,
        heroSubtitle: uvp || 'מרחב מותאם, אישי ומעצים במיוחד עבורך',
        heroDescription: brand.identity?.shortVision || brand.audience?.mainUvp || 'גלי עולם של הזדמנויות, צמיחה ותוכן מעשיר שנבנה במיוחד עבורך.',
        heroBadge: slogan ? `• ${slogan} •` : `• ${companyName} •`,
        aboutHeading: `נעים להכיר, ${companyName}`,
        aboutSubtitle: 'החזון, הערכים והשליחות שלנו למענך',
        advantagesHeading: 'למה כדאי לך לבחור בנו?',
        advantagesSubtitle: 'המעטפת האישית, המקצועיות והשקט הנפשי שלך',
        painPointsHeading: 'מרגישה שאת מחפשת את הדרך הנכונה?',
        landingHeading: 'השאירי פרטים ונחזור אלייך בהקדם',
        landingSubtitle: 'הצטרפי למאות המשתתפות שכבר עשו את הצעד הראשון',
        painPointsSubtitle: 'את לא לבד – יחד נגיע לתוצאה המדויקת ביותר',
        targetAudiencesHeading: 'למי זה מיועד?',
        targetAudiencesSubtitle: 'המרחב מותאם לנשים שמחפשות צמיחה, עומק ואיכות',
        faqHeading: 'שאלות נפוצות ותשובות',
        faqSubtitle: 'כל מה שחשוב לך לדעת לפני שיוצאים לדרך',
        contactHeading: 'בואי נדבר',
        contactSubtitle: 'נשמח להקשיב, לענות וללוות אותך באהבה',
        communityHeading: 'הקהילה שלנו',
        communitySubtitle: 'מרחב חם של שיתוף, צמיחה והעצמה',
        testimonialsHeading: 'מה מספרות המשתתפות שלנו?',
        testimonialsSubtitle: 'מילים חמות וחוויות מהלב מנשים שהיו שם',
        galleryHeading: 'הצצה לעולם שלנו',
        gallerySubtitle: 'רגעים של עשייה, מפגשים ויצירה',
      },
    };
  }

  if (gender === 'male') {
    return {
      primaryCta: 'בוא נתחיל',
      secondaryCta: 'גלה עוד',
      whatsappCta: 'דבר איתנו ב-WhatsApp',
      contactCta: 'השאר פרטים ונחזור אליך',
      formSubmitText: 'שליחת פנייה',
      namePlaceholder: 'שמך המלא',
      phonePlaceholder: 'מספר הטלפון שלך',
      emailPlaceholder: 'כתובת האימייל שלך',
      messagePlaceholder: 'במה נוכל לסייע לך?',
      sectionHeadings: {
        heroTitle: slogan ? `${companyName} • ${slogan}` : companyName,
        heroSubtitle: uvp || 'פתרונות מדויקים ומעטפת מקצועית עבורך',
        heroDescription: brand.identity?.shortVision || brand.audience?.mainUvp || 'גלה את הכלים והפתרונות המובילים שנבנו לקחת אותך קדימה במקצועיות ובביטחון.',
        heroBadge: slogan ? `• ${slogan} •` : `• ${companyName} •`,
        aboutHeading: `אודות ${companyName}`,
        aboutSubtitle: 'החזון, הערכים והניסיון המקצועי שלנו',
        advantagesHeading: 'למה לבחור בנו?',
        advantagesSubtitle: 'היתרונות המובילים והמעטפת המקצועית עבורך',
        painPointsHeading: 'מחפש את המענה הנכון ביותר עבורך?',
        landingHeading: 'השאר פרטים ונחזור אליך בהקדם',
        landingSubtitle: 'הצטרף למאות המשתתפים שכבר עשו את הצעד הראשון',
        painPointsSubtitle: 'הגעת למקום הנכון – מענה מוכח וממוקד מטרה',
        targetAudiencesHeading: 'למי השירות מתאים?',
        targetAudiencesSubtitle: 'מותאם במיוחד עבור צרכיך המקצועיים והאישיים',
        faqHeading: 'שאלות ותשובות נפוצות',
        faqSubtitle: 'כל המידע שחשוב לדעת',
        contactHeading: 'בוא נדבר',
        contactSubtitle: 'נשמח לענות על כל שאלה ולסייע לך להתקדם',
        communityHeading: 'הקהילה שלנו',
        communitySubtitle: 'מרחב משותף של קשרים, שותפויות ועשייה',
        testimonialsHeading: 'מה מספרים הלקוחות שלנו?',
        testimonialsSubtitle: 'המלצות וסיפורי הצלחה מהשטח',
        galleryHeading: 'גלריית עשייה ופרויקטים',
        gallerySubtitle: 'הצצה לפרויקטים ולפעילות המובילה שלנו',
      },
    };
  }

  // Plural & default
  return {
    primaryCta: 'לפרטים והצטרפות',
    secondaryCta: 'מידע נוסף',
    whatsappCta: 'שיחה ישירה ב-WhatsApp',
    contactCta: 'השאירו פרטים ונחזור אליכם',
    formSubmitText: 'שליחת פנייה',
    namePlaceholder: 'שם מלא',
    phonePlaceholder: 'מספר טלפון',
    emailPlaceholder: 'כתובת אימייל',
    messagePlaceholder: 'במה נוכל לסייע לכם?',
    sectionHeadings: {
      heroTitle: slogan ? `${companyName} • ${slogan}` : companyName,
      heroSubtitle: uvp || 'פתרונות מתקדמים ומעטפת שירות אישית ומקיפה',
      heroDescription: brand.identity?.shortVision || brand.audience?.mainUvp || 'מעטפת פתרונות דיגיטליים מתקדמים המותאמת במדויק לחזון ולצרכים שלכם.',
      heroBadge: slogan ? `• ${slogan} •` : `• ${companyName} •`,
      aboutHeading: `נעים להכיר, ${companyName}`,
      aboutSubtitle: 'החזון, הערכים והמחויבות הבלתי מתפשרת שלנו',
      advantagesHeading: 'למה לבחור בנו?',
      advantagesSubtitle: 'היתרונות המובילים והמעטפת המקצועית שלנו',
      painPointsHeading: 'האתגרים שלכם, הפתרונות שלנו',
      landingHeading: 'השאירו פרטים ונחזור אליכם בהקדם',
      landingSubtitle: 'הצטרפו למאות המשתתפים שכבר עשו את הצעד הראשון',
      painPointsSubtitle: 'מענה מקיף ומדויק לכל שלב בדרך',
      targetAudiencesHeading: 'למי השירות מתאים?',
      targetAudiencesSubtitle: 'מותאם במיוחד לצרכים הייחודיים שלכם',
      faqHeading: 'שאלות נפוצות ותשובות',
      faqSubtitle: 'כל מה שחשוב לדעת לפני שיוצאים לדרך',
      contactHeading: 'בואו נדבר',
      contactSubtitle: 'נשמח לשמוע מכם ולעמוד לשירותכם לכל עניין',
      communityHeading: 'הקהילה שלנו',
      communitySubtitle: 'מרחב של שיתוף, צמיחה והזדמנויות',
      testimonialsHeading: 'מה הלקוחות מספרים עלינו?',
      testimonialsSubtitle: 'סיפורי הצלחה וחוויות של לקוחות מרוצים',
      galleryHeading: 'גלריית עשייה ופרויקטים',
      gallerySubtitle: 'הצצה לפעילות וליצירה שלנו',
    },
    categoryTitles: {
      articles: 'מאמרים ושיעורים',
      events: 'כנסים ואירועים',
      courses: 'קורסי הכשרה ואקדמיה',
      videos: 'הפודקאסט והוידאו שלנו',
      community: 'מועדון הקהילה והחברים',
      services: 'קטלוג השירותים והפתרונות',
      posts: 'מאגר הפוסטים והעדכונים',
      fundraising: 'שותפות וגיוס המונים',
      checkout: 'המוצרים והחבילות שלנו',
    },
    categoryDescriptions: {
      articles: 'כנסו לעולם התוכן והידע המעמיק שלנו',
      events: 'האירועים והמפגשים המכוננים של השנה',
      courses: 'בואו לבנות ולהבנות עם ליווי מקצועי צמוד',
      videos: 'שיחות עומק, הרצאות ושידורים חיים מרתקים',
      community: 'הטבות בלעדיות ומעגלי שיח פעילים',
      services: 'מעטפת שירותים מקצועית בהתאמה אישית מלאה',
      posts: 'כל הפוסטים, הטיפים והעדכונים השוטפים שלנו',
      fundraising: 'יחד מגיעים אל היעד ומגדילים עשייה משותפת',
      checkout: 'רכישה ישירה ומאובטחת בתנאים מועדפים',
    },
    archiveSeoDescriptions: {
      articles: `מאגר המאמרים, שיעורי התוכן והידע המקצועי מבית ${companyName}. תובנות מעמיקות, כלים מעשיים ומתודולוגיות מובילות.`,
      events: `לוח הכנסים, המפגשים, הסדנאות והאירועים של ${companyName}. הבטיחו את מקומכם באירועים המכוננים של השנה.`,
      courses: `האקדמיה הדיגיטלית ומסלולי ההכשרה המקצועיים של ${companyName}. סילבוס מעשי, פרויקטים מהשטח וליווי צמוד להצלחה.`,
      videos: `מרכז השידורים, הפודקאסטים וסרטוני הוידאו מבית ${companyName}. שיחות עומק, הרצאות וניתוחים מעמיקים לצפייה ישירה.`,
      community: `מועדון החברים, מעגלי השיח והקהילה הפעילה של ${companyName}. שיתופי פעולה, הטבות בלעדיות ותוכן ייחודי לחברים.`,
      services: `קטלוג השירותים והפתרונות המקיפים של ${companyName}. מעטפת מקצועית בהתאמה אישית לתוצאות עסקיות מוכחות.`,
      posts: `כל הפוסטים, הטיפים, המדריכים והעדכונים השוטפים של ${companyName}. הישארו מעודכנים בכל החידושים והתובנות מהשטח.`,
      fundraising: `מרכז גיוס המונים ושותפות קהילתית של ${companyName}. יחד מגדילים את מעגלי ההשפעה, העשייה והנתינה.`,
      checkout: `מרכז ההזמנות, החבילות והרכישה המאובטחת של ${companyName}. רכישה מהירה ונוחה בתקני האבטחה המחמירים ביותר.`,
    },
  };
}

/**
 * מפיק ערכת שפת ממשק, כפתורים וכותרות אזורים (Brand UI Vocabulary) באמצעות KOSAI (Gemini)
 * עם גיבוי אלגוריתמי מלא למקרה של היעדר מפתח / שגיאה
 */
