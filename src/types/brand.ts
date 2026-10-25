export interface PersonaItem {
  id: string;
  name: string;
  roleOrProfile: string;
  mainPain: string;
  dreamOutcome: string;
}

export interface ObjectionItem {
  id: string;
  objection: string;
  rebuttal: string;
}

export interface FlagshipProduct {
  id: string;
  name: string;
  tagline: string;
  price?: string;
  features: string[];
  targetAudience?: string;
}

export interface BrandIdentity {
  companyName: string;
  organizationType: string;
  organizationPurpose: string;
  memberCount: string;
  slogan: string;
  companyVision: string;
  shortVision: string;
  logoUrl?: string;
  vibeImages?: string[];
}

export interface BrandVoice {
  personality: {
    formality: number; // 1 - 5
    warmth: number; // 1 - 5
    luxury: number; // 1 - 5
    energy: number; // 1 - 5
  };
  genderAddressing: 'plural' | 'singular_male' | 'singular_female' | 'neutral';
  sectorCompliance: 'general' | 'charedi' | 'dati' | 'secular' | 'corporate';
  powerWords: string[];
  forbiddenWords: string[];
  shabbatObservant: boolean;
  summaryParagraph?: string;
}

export interface BrandAudience {
  mainUvp: string;
  targetAudiences: string[];
  personas: PersonaItem[];
  commonObjections: ObjectionItem[];
}

export interface BrandEcosystem {
  services: string[];
  products: FlagshipProduct[];
  businessPackages: {
    id: string;
    title: string;
    price: string;
    description: string;
  }[];
}

export interface BrandDesignTokens {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  textColorH1: string;
  textColorH2: string;
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | '2xl' | '3xl' | 'full';
  buttonStyle: 'solid' | 'gradient' | 'glowing' | 'outline';
  fontFamily: string;
}

export interface BrandTrust {
  legalEntityId: string; // ח.פ
  contactPhone: string;
  contactEmail: string;
  officeAddress: string;
  refundPolicySummary: string;
  securityBadgeText: string;
  whatsappSupportNumber: string;
}

export interface ContentStrategyItem {
  id: string;
  type: 'service_page' | 'sales_page' | 'lead_magnet' | 'pricing_tier';
  title: string;
  targetAudience: string;
  heroHeadline: string;
  heroSubheadline: string;
  coreValuePoints: string[];
  callToAction: string;
  pricingHook?: string;
  objectionKiller?: string;
  createdAt: string;
}

export interface MarketResearchData {
  competitors: { name: string; pros: string; cons: string }[];
  marketGaps: string[];
  differentiationAngle: string;
  actionableNextSteps: string[];
}

export interface BrandDna {
  userId?: string;
  updatedAt?: string;
  identity: BrandIdentity;
  voice: BrandVoice;
  audience: BrandAudience;
  ecosystem: BrandEcosystem;
  designTokens: BrandDesignTokens;
  trust: BrandTrust;
  contentStrategies?: ContentStrategyItem[];
  marketResearch?: MarketResearchData;
}

export const DEFAULT_KOSUN_BRAND_DNA: BrandDna = {
  identity: {
    companyName: 'KOSUN',
    organizationType: 'פלטפורמת SaaS לפרודוקטיביות וניהול משימות מבוסס בינה מלאכותית',
    organizationPurpose: 'המרת אינטראקציות, שיחות ומחשבות מפוזרות לנכסים מניבים ולפעולות ממוקדות בשיטת ה-Big 3',
    memberCount: '1-10',
    slogan: 'INTERACTIONS INTO ASSETS',
    companyVision: 'להעניק לכל אדם ויזם שליטה מוחלטת ביום שלו, באמצעות מערכת אפס-עומס שמנקה רעשי רקע וממקדת בדיוק ב-3 הדברים החשובים.',
    shortVision: 'הופכים אינטראקציות לנכסים.',
    logoUrl: '/images/kosun-logo.svg',
    vibeImages: [],
  },
  voice: {
    personality: {
      formality: 3,
      warmth: 4,
      luxury: 4,
      energy: 4,
    },
    genderAddressing: 'plural',
    sectorCompliance: 'general',
    powerWords: ['נכס', 'מיקוד עילאי', 'שקט נפשי', 'פרודוקטיביות טהורה', 'אינטראקציה לנכס', 'חוק ה-3'],
    forbiddenWords: ['עמוס', 'בלגן', 'זול', 'מורכב', 'דחיינות'],
    shabbatObservant: false,
    summaryParagraph: 'KOSUN היא פלטפורמת עלית המעוצבת מתוך תפיסה של אפס עומס מחשבתי והתאמה מושלמת לקשב וריכוז. המערכת מפרקת אינטראקציות ורעיונות גולמיים וממירה אותם בדיוק ל-3 נכסים מובילים לכל יום.',
  },
  audience: {
    mainUvp: 'המרת אינטראקציות ושיחות גולמיות לנכסים מוחשיים ופעולות בשיטת חוק ה-3 באפס עומס קוגניטיבי.',
    targetAudiences: ['יזמים ובעלי עסקים עם בעיות קשב וריכוז (ADHD)', 'מנהלי פרויקטים ומפתחים', 'עצמאיים שרוצים שקט מנטלי'],
    personas: [
      {
        id: 'p-1',
        name: 'דן - יזם סדרתי עם ADHD',
        roleOrProfile: 'מנהל מספר מיזמים במקביל, מוצף ברעיונות ואינטראקציות',
        mainPain: 'קופץ בין עשרות משימות ולא מסיים שום דבר עד סוף היום',
        dreamOutcome: 'פתיחת היום עם 3 משימות ברורות בלבד ושקט נפשי מוחלט',
      },
      {
        id: 'p-2',
        name: 'שירה - יועצת עסקית עצמאית',
        roleOrProfile: 'עובדת מול עשרות לקוחות בווטסאפ ובפגישות',
        mainPain: 'אינטראקציות והבטחות נאבדות בתוך שטף ההודעות',
        dreamOutcome: 'קליטה קולית מיידית שהופכת כל שיחה לנכס מעשי ומשימה מוגדרת',
      },
    ],
    commonObjections: [
      {
        id: 'o-1',
        objection: 'האם המערכת לא מסובכת מדי לתפעול ביומיום?',
        rebuttal: 'המערכת בנויה באפס עומס - כל פעולה דורשת 2 קליקים מקסימום, ללא טבלאות עמוסות או תפריטים מיותרים.',
      },
      {
        id: 'o-2',
        objection: 'מה אם יש לי יותר מ-3 משימות לעשות היום?',
        rebuttal: 'חוק ה-3 מוכח מדעית: התמקדות ב-3 משימות מפתח מבטיחה ביצוע 100%. שאר הרעיונות נשמרים בבטחה בתיק הנכסים.',
      },
    ],
  },
  ecosystem: {
    services: [
      'מערכת ניהול משימות The Big 3 עם סליידרים להפעלה',
      'מעבדת פירוק משימות AI (AI Decompose)',
      'קליטה קולית מיידית בלחיצה אחת',
      'טקס נעילת ערב מודרך לתכנון המחר',
      'מרכז מיתוג גלובלי ו-Brand DNA',
    ],
    products: [
      {
        id: 'prod-1',
        name: 'KOSUN Pro Suite',
        tagline: 'מעטפת ניהול נכסים ומשימות כולל קליטה קולית ובינה מלאכותית',
        price: '₪99 / חודש',
        features: ['עד 3 משימות יומיות ממוקדות', 'תמלול קולי מהיר', 'פירוק AI חכם', 'סנכרון מלא לכל המכשירים'],
        targetAudience: 'יזמים ועצמאיים',
      },
    ],
    businessPackages: [
      {
        id: 'pkg-1',
        title: 'חבילת יחיד (Focus Solo)',
        price: '₪49 / חודש',
        description: 'גישה לכל מסכי המיקוד, קליטה מהירה וטקס ערב',
      },
      {
        id: 'pkg-2',
        title: 'חבילת מנהלים (Executive Asset)',
        price: '₪129 / חודש',
        description: 'כולל מרכז מיתוג DNA מלא, מחוללי AI ואשפי תוכן',
      },
    ],
  },
  designTokens: {
    primaryColor: '#00F0FF',
    secondaryColor: '#1A2B4C',
    backgroundColor: '#070913',
    textColor: '#F0F4FF',
    textColorH1: '#FFFFFF',
    textColorH2: '#A0AEC0',
    borderRadius: '3xl',
    buttonStyle: 'glowing',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  trust: {
    legalEntityId: '516892401',
    contactPhone: '03-5551234',
    contactEmail: 'asset@kosun.io',
    officeAddress: 'רוטשילד 22, תל אביב',
    refundPolicySummary: '14 ימי ניסיון ללא סיכון - החזר כספי מלא בלחיצה אחת ללא שאלות.',
    securityBadgeText: 'מאובטח בתקן SSL 256-Bit וסליקה מוצפנת PCI-DSS',
    whatsappSupportNumber: '0501234567',
  },
};
