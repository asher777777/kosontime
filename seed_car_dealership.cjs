const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc } = require('firebase/firestore');

const kosunConfig = require('./firebase-applet-config.json');
const comonaConfig = require('./comona-firebase-config.json');

const kosunApp = initializeApp(kosunConfig, 'kosun');
const kosunDb = getFirestore(kosunApp, kosunConfig.firestoreDatabaseId);

const comonaApp = initializeApp(comonaConfig, 'comona');
const comonaDb = getFirestore(comonaApp);

// 1. פרופיל טננט מלא: סוכנות רכבי ספורט ויוקרה 'טורבו מוטורס' (turbo_motors)
const tenantProfile = {
  id: 'turbo_motors',
  name: 'טורבו מוטורס - סוכנות רכבי יוקרה וספורט',
  tagline: 'חוויית נהיגה וביצועים ללא פשרות',
  category: 'automotive',
  archetypeId: 'masculine',
  phone: '03-5551234',
  whatsapp: '054-9998877',
  address: 'רחוב המלאכה 12, הרצליה פיתוח',
  branches: [
    {
      id: 'branch_herzliya',
      name: 'סניף הדגל ואולם התצוגה הראשי',
      address: 'רחוב המלאכה 12, מתחם הרכב, הרצליה פיתוח',
      hours: 'א-ה: 09:00-19:00 | ו: 08:30-13:30',
      phone: '03-5551234',
      wazeQuery: 'Turbo Motors Herzliya',
      parking: 'חניה שמורה בחזית האולם לאורחים',
      highlights: 'אולם ממוזג בן 2 קומות, לאונג VIP, קפה אספרסו איטלקי'
    },
    {
      id: 'branch_rishon',
      name: 'מרכז הטרייד-אין והמסירות',
      address: 'רחוב משה דיין 44, אזור התעשייה החדש, ראשון לציון',
      hours: 'א-ה: 09:30-18:30 | ו: 08:30-13:00',
      phone: '03-5559876',
      wazeQuery: 'Turbo Motors Rishon LeZion',
      parking: 'מגרש חניה רחב ידיים עם עמדות טעינה מהירות 300kW',
      highlights: 'עמדות בדיקה וסריקה דינמית לרכבים, מתחם מסירה חגיגי'
    },
    {
      id: 'branch_haifa',
      name: 'מתחם צפון ורכבי שטח יוקרתיים',
      address: 'שדרות ההסתדרות 180, מתחם צק פוסט, חיפה',
      hours: 'א-ה: 09:00-18:30 | ו: 08:30-13:00',
      phone: '04-8884321',
      wazeQuery: 'Turbo Motors Haifa',
      parking: 'חניית מתחם חופשית לאורחי הסוכנות',
      highlights: 'תצוגת רכבי 4X4 וספורט-SUV, נסיעות מבחן במסלול הררי'
    }
  ],
  wazeUrl: 'https://waze.com/ul?q=Turbo+Motors+Herzliya',
  openingHours: 'א-ה: 09:00-19:00 | ו: 08:30-13:30',
  agentName: 'דורון קורן - יועץ רכב אישי',
  agentAvatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=256&q=80',
  logoUrl: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=256&q=80',
  // 🎬 מסך הכניסה החווייתי (סרטון וידאו או תמונת חוויה) + כפתור CTA
  welcomeExperience: {
    type: 'video', // 'video' או 'image'
    mediaUrl: 'https://assets.mixkit.co/videos/preview/mixkit-sports-car-driving-on-a-road-at-night-42512-large.mp4',
    fallbackImageUrl: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=80',
    title: 'חוויית נהיגה וביצועים ללא פשרות',
    subtitle: 'אולם התצוגה המרכזי לרכבי ספורט ויוקרה • מסירה מיידית',
    badgeText: 'TURBO MOTORS VIP',
    ctaText: 'כניסה לעולם הרכבים ◀'
  },
  // 🧭 הגדרות מצפן ניווט דינמיות מתוך ה-JSON של הטננט (תוויות טולטיפ, פילטרים)
  compassConfig: {
    up: {
      action: 'newest',
      tooltip: 'דגמים חדשים יותר במלאי (2024 / הגעות אחרונות)',
      filterPrompt: 'תציג לי דגמים חדשים במלאי'
    },
    down: {
      action: 'oldest',
      tooltip: 'דגמים ותיקים והזדמנויות מיוחדות',
      filterPrompt: 'תציג לי דגמים ותיקים והזדמנויות'
    },
    left: {
      action: 'cheapest',
      tooltip: 'רכבים נגישים וזולים יותר',
      filterPrompt: 'יש לכם משהו יותר זול?'
    },
    right: {
      action: 'priciest',
      tooltip: 'רכבי קצה יוקרתיים וסופרקארס',
      filterPrompt: 'מה רכבי הקצה היוקרתיים ביותר?'
    }
  },
  createdAt: new Date().toISOString()
};

// 2. קולקציית המוצרים האמיתיים: מלאי רכבים (products) כולל לשוניות ומפרטי JSON מעוצבים
const carInventory = [
  {
    id: 'car_bmw_m4',
    title: 'BMW M4 Competition 2024',
    subtitle: '510 כוחות סוס | 0-100 ב-3.8 שניות | יד ראשונה 00',
    category: 'sports_coupe',
    price: 685000,
    currency: 'ILS',
    year: 2024,
    mileage: 8500,
    engine: '3.0L Twin-Turbo 510HP',
    gearbox: 'אוטומט טיפטרוניק 8 הילוכים',
    color: 'אפור בטון מט (Brooklyn Grey)',
    imageUrl: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=80',
    status: 'active',
    isAvailable: true,
    badgeText: 'מלאי מיידי',
    actionType: 'BOOK_TEST_DRIVE',
    // 🎨 נתוני עיצוב, לשוניות וכרטיסיות JSON (נשלפים ישירות מה-DB!)
    uiConfig: {
      themeColors: {
        accent: '#00F0FF',
        accentGlow: 'rgba(0, 240, 255, 0.25)',
        badgeBg: 'rgba(0, 240, 255, 0.12)',
        badgeBorder: 'rgba(0, 240, 255, 0.35)',
        cardBg: '#131c2e',
        cardBorder: '#1e293b',
        priceColor: '#F59E0B',
        ctaBg: '#00F0FF',
        ctaText: '#000000'
      },
      ctaText: 'תאם ב-WhatsApp הפנימי',
      ctaIcon: 'KeyRound',
      priceLabel: 'מחיר מבוקש כולל מע״מ',
      layout: 'grid_2x2'
    },
    specsGrid: [
      { id: 'mileage', label: 'קילומטראז׳', value: '8,500 ק״מ', icon: 'Gauge' },
      { id: 'engine', label: 'מנוע והספק', value: '3.0L Bi-Turbo 510HP', icon: 'Zap' },
      { id: 'acceleration', label: 'תאוצה 0-100', value: '3.8 שניות', icon: 'Flame' },
      { id: 'gearbox', label: 'תיבת הילוכים', value: 'M Steptronic 8', icon: 'Settings2' }
    ],
    detailsCards: [
      {
        id: 'performance',
        title: 'חבילת ביצועים Competition',
        subtitle: 'דיפרנציאל אקטיבי M, בלמים קרמיים, מערכת פליטה ספורטיבית עם שסתומים נשלטים',
        icon: 'Flame',
        badge: 'M Power',
        highlightColor: '#00F0FF'
      },
      {
        id: 'interior',
        title: 'תא נוסעים וגימור Carbon',
        subtitle: 'מושבי באקט קרבון M מקוריים, ריפודי עור מרינו שחור-כתום, תצוגה עילית HUD',
        icon: 'Sparkles',
        badge: 'Executive',
        highlightColor: '#F59E0B'
      },
      {
        id: 'tech',
        title: 'מערכות עזר ובטיחות אוטונומית',
        subtitle: 'Driving Assistant Professional, חניה אוטומטית מלאה 360°, לוח שעונים BMW Curved Display',
        icon: 'ShieldCheck',
        badge: 'Level 2+',
        highlightColor: '#10B981'
      },
      {
        id: 'warranty',
        title: 'אחריות וטיפולים רשמיים',
        subtitle: 'אחריות יבואן רשמית בתוקף עד 2027, ספר טיפולים מלא במוסך מורשה, ללא תאונות כלל',
        icon: 'CheckCircle2',
        badge: 'Verified 00',
        highlightColor: '#8B5CF6'
      }
    ]
  },
  {
    id: 'car_porsche_taycan',
    title: 'Porsche Taycan 4S Electric 2024',
    subtitle: 'חשמלי מלא | טווח 480 קמ | חבילת Performance Plus',
    category: 'electric_supercar',
    price: 740000,
    currency: 'ILS',
    year: 2024,
    mileage: 4200,
    engine: 'Dual Motor AWD 530HP',
    gearbox: 'אוטומט חשמלי',
    color: 'לבן פנינה מטאלי',
    imageUrl: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=800&q=80',
    status: 'active',
    isAvailable: true,
    badgeText: '0 קמ בפועל',
    actionType: 'BOOK_TEST_DRIVE',
    uiConfig: {
      themeColors: {
        accent: '#10B981',
        accentGlow: 'rgba(16, 185, 129, 0.25)',
        badgeBg: 'rgba(16, 185, 129, 0.12)',
        badgeBorder: 'rgba(16, 185, 129, 0.35)',
        cardBg: '#11221c',
        cardBorder: '#1b3b30'
      },
      layout: 'grid_2x2'
    },
    specsGrid: [
      { id: 'mileage', label: 'קילומטראז׳', value: '4,200 ק״מ', icon: 'Gauge' },
      { id: 'engine', label: 'מנוע והספק', value: 'Dual Electric 530HP', icon: 'Zap' },
      { id: 'acceleration', label: 'תאוצה 0-100', value: '4.0 שניות', icon: 'Flame' },
      { id: 'range', label: 'סוללה וטווח', value: '93.4kWh • 480 ק״מ', icon: 'BatteryCharging' }
    ],
    detailsCards: [
      {
        id: 'charging',
        title: 'טעינה אולטרה מהירה 800V',
        subtitle: 'טעינה מ-5% ל-80% תוך 22 דקות בלבד בעמדות 270kW, כבל טעינה מקורי ביתי וציבורי',
        icon: 'BatteryCharging',
        badge: '800-Volt',
        highlightColor: '#10B981'
      },
      {
        id: 'chassis',
        title: 'מתלי אוויר אדפטיביים PASM',
        subtitle: 'שליטה גובה אוטומטית לפי מהירות, מערכת היגוי אחורי אקטיבי לסיבובים חדים',
        icon: 'Compass',
        badge: 'Aero Dynamic',
        highlightColor: '#00F0FF'
      },
      {
        id: 'sound',
        title: 'מערכת שמע Burmester 3D',
        subtitle: 'סאונד היקפי ב-21 רמקולים, Porsche Electric Sport Sound מדמה צליל מנוע ספורטיבי',
        icon: 'Volume2',
        badge: 'High-End',
        highlightColor: '#F59E0B'
      },
      {
        id: 'roof',
        title: 'גג פנורמי תרמי רחב',
        subtitle: 'זכוכית מבודדת חום וקרינה מלאה, תאורת אווירה ב-64 גוונים לבחירה',
        icon: 'Sun',
        badge: 'Panoramic',
        highlightColor: '#8B5CF6'
      }
    ]
  },
  {
    id: 'car_mercedes_g63',
    title: 'Mercedes-AMG G63 V8 Biturbo',
    subtitle: '585 כוחות סוס | חבילת Night Package | גימור קרבון מלא',
    category: 'luxury_suv',
    price: 1390000,
    currency: 'ILS',
    year: 2023,
    mileage: 18000,
    engine: '4.0L V8 Biturbo 585HP',
    gearbox: 'AMG SPEEDSHIFT 9G',
    color: 'שחור אובסידיאן מטאלי',
    imageUrl: 'https://images.unsplash.com/photo-1520031441872-265e4ff70366?auto=format&fit=crop&w=800&q=80',
    status: 'active',
    isAvailable: true,
    badgeText: 'שמור כחדש',
    actionType: 'BOOK_TEST_DRIVE',
    uiConfig: {
      themeColors: {
        accent: '#F59E0B',
        accentGlow: 'rgba(245, 158, 11, 0.25)',
        badgeBg: 'rgba(245, 158, 11, 0.12)',
        badgeBorder: 'rgba(245, 158, 11, 0.35)',
        cardBg: '#23180c',
        cardBorder: '#3d2b17'
      },
      layout: 'grid_2x2'
    },
    specsGrid: [
      { id: 'mileage', label: 'קילומטראז׳', value: '18,000 ק״מ', icon: 'Gauge' },
      { id: 'engine', label: 'מנוע והספק', value: '4.0L V8 Bi-Turbo 585HP', icon: 'Zap' },
      { id: 'acceleration', label: 'תאוצה 0-100', value: '4.5 שניות', icon: 'Flame' },
      { id: 'traction', label: 'הנעה ונעילות', value: '3 נעילות דיפרנציאל 4X4', icon: 'ShieldAlert' }
    ],
    detailsCards: [
      {
        id: 'amg_night',
        title: 'חבילת AMG Night Package II',
        subtitle: 'שבכה קדמית וסמלים מושחרים, חלונות כהים מבודדים, גלגלי 22 אינץ מושחרים מקוריים',
        icon: 'Moon',
        badge: 'Night Edition',
        highlightColor: '#F59E0B'
      },
      {
        id: 'exhaust',
        title: 'מערכת פליטה צדדית AMG',
        subtitle: 'אגזוזי צד כפולים מקוריים מתחת למדרגות הצד עם סאונד V8 עמוק ומרגש',
        icon: 'Volume2',
        badge: 'V8 Roar',
        highlightColor: '#EF4444'
      },
      {
        id: 'exclusive_lounge',
        title: 'תא נוסעים Exclusive Lounge',
        subtitle: 'עור נאפה דיזיינו בתפירת מעוינים, מסאז וחימום/אוורור בכל המושבים',
        icon: 'Sparkles',
        badge: 'G Manufaktur',
        highlightColor: '#EAB308'
      },
      {
        id: 'sound',
        title: 'אודיו Burmester Surround',
        subtitle: 'מערכת סראונד יוקרתית עם 15 רמקולים וסאב-וופר ייעודי',
        icon: 'Music',
        badge: 'Hi-Fi',
        highlightColor: '#8B5CF6'
      }
    ]
  },
  {
    id: 'car_audi_rs6',
    title: 'Audi RS6 Avant Performance 2024',
    subtitle: '600 כוחות סוס | קוואטרו 4X4 | סטיישן ביצועים האולטימטיבי',
    category: 'sports_wagon',
    price: 890000,
    currency: 'ILS',
    year: 2024,
    mileage: 6100,
    engine: '4.0L V8 TFSI 600HP',
    gearbox: 'טיפטרוניק 8 הילוכים קוואטרו',
    color: 'כחול אסכולה מטאלי',
    imageUrl: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=800&q=80',
    status: 'active',
    isAvailable: true,
    badgeText: 'הזדמנות נדירה',
    actionType: 'BOOK_TEST_DRIVE',
    uiConfig: {
      themeColors: {
        accent: '#3B82F6',
        accentGlow: 'rgba(59, 130, 246, 0.25)',
        badgeBg: 'rgba(59, 130, 246, 0.12)',
        badgeBorder: 'rgba(59, 130, 246, 0.35)',
        cardBg: '#0f1c2e',
        cardBorder: '#1c2f4a'
      },
      layout: 'grid_2x2'
    },
    specsGrid: [
      { id: 'mileage', label: 'קילומטראז׳', value: '6,100 ק״מ', icon: 'Gauge' },
      { id: 'engine', label: 'מנוע והספק', value: '4.0L V8 TFSI 600HP', icon: 'Zap' },
      { id: 'acceleration', label: 'תאוצה 0-100', value: '3.6 שניות', icon: 'Flame' },
      { id: 'drive', label: 'הנעה מתקדמת', value: 'quattro Dynamic Plus', icon: 'Compass' }
    ],
    detailsCards: [
      {
        id: 'dynamic_plus',
        title: 'חבילת Dynamic Plus 305km/h',
        subtitle: 'הגבלת מהירות מורחבת ל-305 קמ״ש, בלמים קרמיים קלי משקל, דיפרנציאל ספורט',
        icon: 'Gauge',
        badge: '305 km/h',
        highlightColor: '#3B82F6'
      },
      {
        id: 'matrix_laser',
        title: 'פנסי HD Matrix LED עם לייזר',
        subtitle: 'תאורת לייזר כחולה לטווח 600 מטר, איתותים דינמיים קדמיים ואחוריים',
        icon: 'Eye',
        badge: 'Audi Laser',
        highlightColor: '#00F0FF'
      },
      {
        id: 'rs_interior',
        title: 'חבילת עיצוב RS Design כחולה',
        subtitle: 'חגורות בטיחות ותפרים בכחול מטאלי, הגה Alcantara ספורטיבי קטום',
        icon: 'Sparkles',
        badge: 'RS Blue',
        highlightColor: '#60A5FA'
      },
      {
        id: 'sound',
        title: 'Bang & Olufsen 3D Advanced',
        subtitle: '19 רמקולים בעוצמה של 1,820 וואט, טוויטרים אקוסטיים מתרוממים',
        icon: 'Volume2',
        badge: 'Bang & Olufsen',
        highlightColor: '#A855F7'
      }
    ]
  }
];

// 3. רמת השורש - 4 צמתי השאלות הראשיות לאורח (Guest Mode)
const rootCognitiveNodes = [
  {
    id: 'node_root_cars',
    tenantId: 'turbo_motors',
    parentId: null,
    indexBadge: '01',
    audience: 'guest',
    contentPurpose: 'product_showcase',
    questionText: 'מה יש לכם כרגע במלאי?',
    shortAnswer: '4 רכבי ספורט ועל זמינים למסירה מיידית באולם התצוגה',
    primaryIcon: 'Car',
    secondaryIcon: 'Gauge',
    stats: { usageCount: 420, lastInteractedAt: Date.now() },
    voiceKeywords: ['מלאי', 'רכבים', 'מכוניות', 'במוו', 'פורשה', 'מרצדס', 'מחירים', 'ספורט'],
    navigation: {
      type: 'DRILL_DOWN',
      targetNodeId: 'node_catalog_view',
      actionPayload: { collection: 'products' }
    }
  },
  {
    id: 'node_root_testdrive',
    tenantId: 'turbo_motors',
    parentId: null,
    indexBadge: '02',
    audience: 'guest',
    contentPurpose: 'service_consultation',
    questionText: 'תיאום נסיעת מבחן וייעוץ מימון אישי',
    shortAnswer: 'חוויית נהיגה מלווה של 45 דקות + פתרונות טרייד-אין ומימון מותאמים',
    primaryIcon: 'KeyRound',
    secondaryIcon: 'Calendar',
    stats: { usageCount: 310, lastInteractedAt: Date.now() },
    voiceKeywords: ['נסיעת מבחן', 'תיאום', 'מימון', 'טרייד אין', 'פגישה', 'לנהוג'],
    navigation: {
      type: 'DIRECT_ACTION',
      actionType: 'OPEN_TEST_DRIVE_MODAL',
      actionPayload: { durationMinutes: 45 }
    }
  },
  {
    id: 'node_root_location',
    tenantId: 'turbo_motors',
    parentId: null,
    indexBadge: '03',
    audience: 'guest',
    contentPurpose: 'landing_page',
    questionText: 'איך מגיעים לאולם התצוגה ושעות פתיחה',
    shortAnswer: 'רחוב המלאכה 12 הרצליה פיתוח. חניה פרטית לאורחים במקום',
    primaryIcon: 'MapPin',
    secondaryIcon: 'Navigation',
    stats: { usageCount: 245, lastInteractedAt: Date.now() },
    voiceKeywords: ['איפה אתם', 'מיקום', 'כתובת', 'הגעה', 'וויז', 'שעות פתיחה', 'חניה'],
    navigation: {
      type: 'DIRECT_ACTION',
      actionType: 'NAVIGATE_WAZE',
      actionPayload: { url: 'https://waze.com/ul?q=Turbo+Motors+Herzliya' }
    }
  },
  {
    id: 'node_root_contact',
    tenantId: 'turbo_motors',
    parentId: null,
    indexBadge: '04',
    audience: 'guest',
    contentPurpose: 'event_invitation',
    questionText: 'שיחה ישירה עם דורון ב-WhatsApp',
    shortAnswer: 'מענה אנושי מהיר ומענה על מפרטים טכניים בזמן אמת',
    primaryIcon: 'MessageCircle',
    secondaryIcon: 'Send',
    stats: { usageCount: 195, lastInteractedAt: Date.now() },
    voiceKeywords: ['וואטסאפ', 'טלפון', 'נציג', 'לדבר', 'דורון', 'צור קשר'],
    navigation: {
      type: 'DIRECT_ACTION',
      actionType: 'OPEN_WHATSAPP',
      actionPayload: { phone: '972549998877', text: 'שלום דורון, אשמח לפרטים על רכב מטורבו מוטורס' }
    }
  }
];

// 4. ארבע שאלות ניהול לבעל הסוכנות (Owner Mode)
const ownerCognitiveNodes = [
  {
    id: 'node_owner_leads',
    tenantId: 'turbo_motors',
    parentId: null,
    indexBadge: '01',
    audience: 'owner',
    contentPurpose: 'main_hub',
    questionText: 'מה קרה היום בסוכנות? לידים ונסיעות מבחן',
    shortAnswer: '5 לידים חדשים מ-Waze, 2 נסיעות מבחן מתוזמנות להיום',
    primaryIcon: 'Flame',
    secondaryIcon: 'Users',
    stats: { usageCount: 99, lastInteractedAt: Date.now() },
    voiceKeywords: ['מה קרה היום', 'לידים', 'מכירות', 'נסיעות מבחן'],
    navigation: { type: 'VIEW_LEADS_DASHBOARD' }
  },
  {
    id: 'node_owner_stock',
    tenantId: 'turbo_motors',
    parentId: null,
    indexBadge: '02',
    audience: 'owner',
    contentPurpose: 'product_showcase',
    questionText: 'ניהול מלאי: הוספה ועדכון רכבים',
    shortAnswer: '4 רכבים פעילים, שווי מלאי נוכחי: 3,705,000 שח',
    primaryIcon: 'Layers',
    secondaryIcon: 'Plus',
    stats: { usageCount: 80, lastInteractedAt: Date.now() },
    voiceKeywords: ['מלאי', 'הוסף רכב', 'מחירון', 'מכוניות'],
    navigation: { type: 'MANAGE_INVENTORY' }
  },
  {
    id: 'node_owner_campaign',
    tenantId: 'turbo_motors',
    parentId: null,
    indexBadge: '03',
    audience: 'owner',
    contentPurpose: 'campaign_funding',
    questionText: 'יעד מכירות חודשי וביצועי סוכנות',
    shortAnswer: 'הושגו 65% מיעד המכירות לחודש אוקטובר',
    primaryIcon: 'TrendingUp',
    secondaryIcon: 'Award',
    stats: { usageCount: 75, lastInteractedAt: Date.now() },
    voiceKeywords: ['יעד', 'דוח', 'רווחים', 'ביצועים'],
    navigation: { type: 'VIEW_REVENUE_METRICS' }
  },
  {
    id: 'node_owner_agent_settings',
    tenantId: 'turbo_motors',
    parentId: null,
    indexBadge: '04',
    audience: 'owner',
    contentPurpose: 'service_consultation',
    questionText: 'הגדרות סוכן ה-AI וזמני מענה קולי',
    shortAnswer: 'סוכן מכירות רכב פעיל בטון ישיר וטכנולוגי (Masculine DNA)',
    primaryIcon: 'Bot',
    secondaryIcon: 'Sliders',
    stats: { usageCount: 50, lastInteractedAt: Date.now() },
    voiceKeywords: ['סוכן', 'בוט', 'הגדרות', 'ai'],
    navigation: { type: 'EDIT_AI_PERSONA' }
  }
];

async function writeCarAgencyData() {
  console.log('--- מזרים נתוני אמת של סוכנות הרכב לשני הפרויקטים (KOSUN וקמונה) ---');

  const targets = [
    { name: 'KOSUN DB', db: kosunDb },
    { name: 'COMONA DB (glowmanage)', db: comonaDb }
  ];

  for (const target of targets) {
    console.log(`\n===> כותב לפרויקט: ${target.name}`);
    try {
      // א. פרופיל הטננט
      await setDoc(doc(target.db, 'tenants', 'turbo_motors'), tenantProfile);
      console.log('   ✅ פרופיל הטננט turbo_motors נכתב בהצלחה');

      // ב. מלאי הרכבים האמיתי
      for (const car of carInventory) {
        await setDoc(doc(target.db, 'tenants/turbo_motors/products', car.id), car);
      }
      console.log(`   ✅ ${carInventory.length} רכבי ספורט אמיתיים נכתבו לקולקציית products`);

      // ג. 4 צמתי השאלות הראשיות (Guest Mode)
      for (const node of rootCognitiveNodes) {
        await setDoc(doc(target.db, 'tenants/turbo_motors/cognitive_nodes', node.id), node);
      }
      console.log('   ✅ 4 שאלות שורש לאורח נכתבו לקולקציית cognitive_nodes');

      // ד. 4 צמתי שאלות לבעל הסוכנות (Owner Mode)
      for (const node of ownerCognitiveNodes) {
        await setDoc(doc(target.db, 'tenants/turbo_motors/cognitive_nodes', node.id), node);
      }
      console.log('   ✅ 4 שאלות ניהול לבעל העסק נכתבו לקולקציית cognitive_nodes');

    } catch (e) {
      console.warn(`   ⚠️ שגיאה בכתיבה ל-${target.name}:`, e.message);
    }
  }

  console.log('\n--- סיום מוצלח של הזרמת כל הנתונים האמיתיים ל-Firestore! ---');
  process.exit(0);
}

writeCarAgencyData();
