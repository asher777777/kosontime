const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, collection } = require('firebase/firestore');

const kosunConfig = require('./firebase-applet-config.json');
const comonaConfig = require('./comona-firebase-config.json');

const kosunApp = initializeApp(kosunConfig, 'kosun');
const kosunDb = getFirestore(kosunApp, kosunConfig.firestoreDatabaseId);

const comonaApp = initializeApp(comonaConfig, 'comona');
const comonaDb = getFirestore(comonaApp);

async function seedMasterKosun() {
  console.log('Seeding Master KOSUN Blueprint & Tenant...');

  // 1. קולקציית אב - kosun_blueprints (שכבה ענפית ראשית)
  const masterBlueprint = {
    id: 'kosun_master',
    marketId: 'saas_productivity',
    marketName: 'KOSUN AI • פלטפורמת העל לפרודוקטיביות וניהול מותגים',
    category: 'saas_productivity',
    dna: {
      identity: {
        id: 'kosun',
        parentId: null,
        lineagePath: 'kosun',
        generationLevel: 0,
        businessName: 'KOSUN - Interactions Into Assets',
        category: 'saas_productivity'
      },
      geometry: {
        shapeArchetype: 'cyber_minimal',
        borderRadius: '16px',
        borderWidth: '1.5px',
        borderStyle: 'solid_glow',
        cardProportion: 'balanced_pill',
        density: 'comfortable'
      },
      motion: {
        motionPreset: 'stagger_glow',
        hoverScale: 1.025,
        hoverTranslate: { x: 0, y: -4 },
        transitionDurationMs: 250,
        transitionEase: 'cubic-bezier(0.16, 1, 0.3, 1)',
        modalAnimation: 'float_up_bloom'
      },
      colors: {
        primary: '#00F0FF',
        secondary: '#0072FF',
        surface: 'rgba(10, 15, 30, 0.88)',
        glow: 'rgba(0, 240, 255, 0.35)',
        glassBlur: '16px'
      },
      typography: {
        fontHeading: 'Rubik',
        fontBody: 'Assistant',
        titleWeight: 'font-bold',
        letterSpacing: 'tracking-wide'
      },
      voice: {
        genderAddressing: 'neutral_direct',
        formalityLevel: 'tech_forward',
        ctaPrimary: 'התחל שימוש עכשיו ◀',
        ctaSecondary: 'גלה את שיטת The Big 3',
        pricePrefix: 'השקעה חודשית החל מ-'
      },
      aiCapsule: {
        assistantName: 'סוכן העל של KOSUN',
        assistantTitle: 'מנהל פרודוקטיביות ו-DNA אוטונומי',
        pulseType: 'cyan_strobe',
        greeting: 'שלום! אני סוכן KOSUN. כיצד תרצה להמיר אינטראקציה לנכס היום?',
        idlePromptHeader: 'שאלות מתחלפות • לחץ לצפייה:',
        catalogPromptHeader: 'הצעות סינון חבילות ומודולים:',
        suggestedQuestions: [
          'איך שיטת The Big 3 מנקה לי עומס מחשבתי?',
          'איך הופכים שיחה קולית למיקרו-משימות?',
          'מה ההבדל בין חבילת Solo ל-Executive?'
        ]
      },
      engineCapabilities: {
        canSpawnChildren: true,
        referralBonusEnabled: true,
        poweredByBadge: 'Powered by KOSUN 2026'
      }
    },
    // פריסות עמודים קבועות (8 עמודים - 4 כרטיסיות לכל עמוד)
    layouts: {
      frontOffice: {
        home: {
          layoutType: 'vertical_hero_rows',
          cardsCount: 4,
          card1: { id: 'big3', title: 'שיטת The Big 3', subtitle: 'מיקוד יומי קריטי ב-3 משימות בלבד', badge: 'פרודוקטיביות', ctaText: 'למד את השיטה ◀' },
          card2: { id: 'decompose', title: 'מעבדת פירוק AI Decompose', subtitle: 'פירוק רעיונות למיקרו-משימות של 15 דקות', badge: 'אלגוריתמיקה', ctaText: 'התחל פירוק ◀' },
          card3: { id: 'ritual', title: 'טקס נעילת יום ושקט מנטלי', subtitle: 'שחרור עומס קוגניטיבי ושינה רגועה', badge: 'מיינדפולנס', ctaText: 'סגור יום ◀' },
          card4: { id: 'modules', title: 'חבילות ומודולים 2026', subtitle: 'מסלולי יחידים, מנהלים וצוותים', badge: 'חבילות', ctaText: 'לכל החבילות ◀' }
        },
        services: {
          layoutType: 'compass_2x2_grid',
          cardsCount: 4
        },
        productLanding: {
          layoutType: 'hero_plus_3_specs',
          cardsCount: 4
        },
        about: {
          layoutType: 'pillars_bento_cards',
          cardsCount: 4
        },
        faq: {
          layoutType: 'interactive_accordion_4',
          cardsCount: 4
        }
      },
      backOffice: {
        ownerEntry: {
          layoutType: 'category_action_quad',
          cardsCount: 4,
          card1: { id: 'branding', title: 'חדד את המיתוג בוויזואל ובשפה', subtitle: 'דיוק שפת הפרודוקטיביות, פלטת הציאן וקול המותג', badge: 'סטודיו מיתוג ו-DNA' },
          card2: { id: 'services', title: 'צור / ערוך חבילה או מודול', subtitle: 'הגדרת מחירים, פיצ׳רים ומודולי זמן', badge: 'שירותים ומודולים' },
          card3: { id: 'info', title: 'הוסף מידע כללי ומרכזי פיתוח', subtitle: 'סניפי מו״פ, שעות תמיכה והסדרי הגעה', badge: 'מידע וסניפים' },
          card4: { id: 'content', title: 'פרסם מדריך / כתבת מומחה ל-SEO', subtitle: 'מאמרים על ADHD, פוקוס עמוק וניהול זמן', badge: 'תוכן וסמכות' }
        },
        aiStudio: {
          layoutType: 'split_terminal_cards',
          cardsCount: 4
        },
        componentBack: {
          layoutType: 'module_workbench_4',
          cardsCount: 4
        }
      }
    }
  };

  // 2. מסמך הטננט החי kosun
  const kosunTenant = {
    id: 'kosun',
    name: 'KOSUN - Interactions Into Assets',
    tagline: 'פלטפורמת הפרודוקטיביות והמרת אינטראקציות לנכסים בשיטת The Big 3',
    category: 'saas_productivity',
    archetypeId: 'cyber_minimal',
    phone: '03-5551234',
    whatsapp: '0501234567',
    address: 'רוטשילד 22, תל אביב',
    wazeUrl: 'https://waze.com/ul?q=Rothschild+22+Tel+Aviv',
    openingHours: 'תמיכה וסוכנים זמינים 24/7',
    agentName: 'סוכן הפרודוקטיביות וה-DNA של KOSUN',
    agentAvatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
    logoUrl: '/cloudstore/kosun_logo.webp',
    themeColors: {
      primary: '#00F0FF',
      secondary: '#0072FF',
      accent: '#00F0FF',
      capsuleBg: '#090d16',
      capsuleBorder: '#00F0FF',
      micColor: '#00F0FF',
      micGlow: 'rgba(0, 240, 255, 0.4)'
    },
    // DNA & Hierarchy
    dna: masterBlueprint.dna,
    layouts: masterBlueprint.layouts,
    welcomeExperience: {
      type: 'video',
      mediaUrl: 'https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-screens-with-graphs-and-data-31913-large.mp4',
      fallbackImageUrl: '/cloudstore/kosun_hero.webp',
      title: 'הופכים אינטראקציות לנכסים מניבים',
      subtitle: 'מערכת אפס-עומס קוגניטיבי • מיקוד ב-3 משימות מפתח לכל יום',
      badgeText: 'KOSUN 2026 AI',
      ctaText: 'כניסה למערכת KOSUN ◀'
    },
    aboutStory: {
      title: 'אודות KOSUN AI 2026',
      badge: 'חזון ומצוינות',
      quote: '״במקום לטבוע בים של שיחות ומשימות - אנו הופכים כל אינטראקציה לנכס מעשי וממוקד.״',
      paragraphs: [
        'KOSUN הוקמה מתוך הבנה מעמיקה של עומס הקשב והדחיינות בעולם הדיגיטלי המודרני, במיוחד עבור יזמים ומנהלים עם ADHD.',
        'המערכת מבוססת על עקרון אפס עומס מחשבתי: קליטה קולית מיידית של שיחות ורעיונות, פירוק AI אוטומטי למיקרו-משימות של 15 דקות, ומיקוד אבסולוטי ב-3 משימות Big 3 בלבד לכל יום.',
        'איתנו שום רעיון לא הולך לאיבוד, ושום יום לא מסתיים בתסכול. כל יום נסגר בטקס נעילה מודרך המבטיח 100% שקט נפשי ושינה רגועה.'
      ],
      pillars: [
        { title: 'חוק ה-Big 3 הבלתי מתפשר', desc: 'מקסימום 3 משימות יומיות כדי להבטיח ביצוע של 100% ללא הסחות דעת.', icon: 'Target' },
        { title: 'מעבדת פירוק משימות AI Decompose', desc: 'הפיכת רעיונות גולמיים ושיחות לצעדים מעשיים קונקרטיים של 15 דקות.', icon: 'Zap' },
        { title: 'טקס נעילת יום ושקט מנטלי', desc: 'סגירה מסודרת של היום ותכנון מוקדם של המחר לשחרור עומס קוגניטיבי.', icon: 'Moon' },
        { title: 'המרת אינטראקציות לנכסים', desc: 'כל שיחה, פגישה או הקלטה קולית הופכת לכרטיסייה עם משימות ולוחות זמנים.', icon: 'Sparkles' }
      ],
      stats: [
        { label: 'שקט מנטלי וביצוע', value: '100%', icon: 'ShieldCheck' },
        { label: 'משימות מפתח ביום', value: '3', icon: 'Target' },
        { label: 'זמן ממוצע למיקרו-שלב', value: '15 דק׳', icon: 'Clock' },
        { label: 'אינטראקציות שהומרו לנכסים', value: '50,000+', icon: 'Sparkles' }
      ],
      signature: 'צוות הפיתוח והמומחים של KOSUN'
    },
    branches: [
      {
        id: 'branch_tlv',
        name: 'מטה KOSUN ומתחם החדשנות',
        address: 'רוטשילד 22, מגדל החדשנות, תל אביב',
        hours: 'א-ה: 08:30-19:30 | מענה דיגיטלי 24/7',
        phone: '03-5551234',
        wazeQuery: 'Rothschild 22 Tel Aviv',
        parking: 'חניון תת-קרקעי מוסדר עם עמדות טעינה מהירות',
        highlights: 'לאונג יזמים, עמדות הדגמת AI קולי ומרכז תמיכה פרונטלי'
      },
      {
        id: 'branch_hfa',
        name: 'מרכז מחקר ופיתוח צפון (R&D)',
        address: 'מתחם מת״ם, שער הים, חיפה',
        hours: 'א-ה: 09:00-18:00',
        phone: '04-8884321',
        wazeQuery: 'Matam Haifa',
        parking: 'חניה חופשית לאורחים',
        highlights: 'מעבדות בינה מלאכותית, פיתוח מנועי תמלול וקול'
      },
      {
        id: 'branch_jlm',
        name: 'מרכז הדרכה והטמעה ליזמים ועסקים',
        address: 'רחוב יפו 216, ירושלים',
        hours: 'א-ה: 09:00-17:00 | ו: 08:30-12:30',
        phone: '02-6667788',
        wazeQuery: 'Jaffa 216 Jerusalem',
        parking: 'חניון סמוך וגישה ישירה לרכבת הקלה',
        highlights: 'סדנאות הטמעת The Big 3 וליווי מנהלים אישי'
      }
    ],
    compassConfig: {
      up: { action: 'newest', tooltip: 'חבילות ומודולים חדשים 2026', filterPrompt: 'תציג לי חבילות ומודולים חדשים' },
      down: { action: 'oldest', tooltip: 'מסלולי כניסה והזדמנויות', filterPrompt: 'תציג לי מסלולים נגישים והזדמנויות' },
      right: { action: 'priciest', tooltip: 'חבילות מנהלים וארגונים Executive', filterPrompt: 'מה חבילות המנהלים והארגונים?' },
      left: { action: 'cheapest', tooltip: 'מסלול עצמאיים ויחידים Solo Focus', filterPrompt: 'יש לכם מסלול נגיש ליחידים?' }
    },
    updatedAt: new Date().toISOString()
  };

  // 3. 4 מוצרים/חבילות מובילות של קושאן (גריד 2x2)
  const kosunProducts = [
    {
      id: 'prod_kosun_solo',
      title: 'חבילת Solo Focus ליזמים',
      subtitle: 'מערכת מיקוד אישית, פירוק AI וטקסי נעילת יום',
      price: 180,
      currency: '₪',
      category: 'חבילות יחידים',
      badgeText: 'הכי מבוקש ליחידים',
      imageUrl: '/cloudstore/kosun_product_1.webp',
      specs: [
        { id: '1', label: 'משימות יומיות', value: '3 בלבד (The Big 3)', icon: 'Target' },
        { id: '2', label: 'פירוק AI', value: 'בלתי מוגבל', icon: 'Zap' },
        { id: '3', label: 'קליטה קולית', value: 'עברית מלאה 100%', icon: 'Mic' },
        { id: '4', label: 'טקס נעילה', value: 'מודרך אוטומטי', icon: 'Moon' }
      ],
      description: 'החבילה המושלמת ליזמים, פרילנסרים ומנהלים עצמאיים שרוצים שקט מנטלי, אפס דחיינות ומיקוד במשימות המנצחות.',
      suggestedQuestions: [
        'האם המסלול מתאים למי שסובל מ-ADHD?',
        'איך מתבצע הפירוק הקולי בעברית?',
        'האם ניתן להתחבר מהטלפון הנייד?'
      ]
    },
    {
      id: 'prod_kosun_exec',
      title: 'חבילת Executive למנהלים',
      subtitle: 'סנכרון יומנים, ניתוח קבלת החלטות ולוח מחוונים',
      price: 490,
      currency: '₪',
      category: 'חבילות מנהלים',
      badgeText: 'למנכ״לים ומובילים',
      imageUrl: '/cloudstore/kosun_product_2.webp',
      specs: [
        { id: '1', label: 'סוכן החלטות', value: 'AI Executive Co-Pilot', icon: 'Brain' },
        { id: '2', label: 'מדידת עומס', value: 'מדד שקט מנטלי חי', icon: 'Activity' },
        { id: '3', label: 'סנכרון יומן', value: 'Google / Outlook', icon: 'Calendar' },
        { id: '4', label: 'תמיכה', value: 'מענה VIP תוך שעה', icon: 'ShieldCheck' }
      ],
      description: 'מעטפת מלאה למנהלים בכירים: המרת סיכומי פגישות לפעולות, ניטור מדד עומס קוגניטיבי, ותעדוף חסר פשרות של משימות מפתח.',
      suggestedQuestions: [
        'איך הסוכן מסייע בקבלת החלטות?',
        'האם המידע העסקי מוצפן ומאובטח?',
        'האם יש ליווי אישי להטמעה בארגון?'
      ]
    },
    {
      id: 'prod_kosun_team',
      title: 'מערך KOSUN Enterprise לארגון',
      subtitle: 'רשת סוכנים אוטונומית, קולקציות משותפות וסנכרון מחלקות',
      price: 1250,
      currency: '₪',
      category: 'פתרונות ארגוניים',
      badgeText: 'ארגונים וצוותים',
      imageUrl: '/cloudstore/kosun_product_3.webp',
      specs: [
        { id: '1', label: 'משתמשים', value: 'עד 25 עובדים', icon: 'Users' },
        { id: '2', label: 'קולקציות', value: 'Firestore רב-טננטי', icon: 'Database' },
        { id: '3', label: 'סוכנים', value: '5 סוכני ניהול ייעודיים', icon: 'Bot' },
        { id: '4', label: 'אבטחה', value: 'SOC2 / GDPR Ready', icon: 'Lock' }
      ],
      description: 'הפעלת מערכת KOSUN כפלטפורמת הניהול הארגונית: סנכרון צוותים בשיטת The Big 3, ביטול פגישות מיותרות והעלאת התפוקה ב-40%.',
      suggestedQuestions: [
        'כמה זמן לוקח להטמיע את המערכת בצוות?',
        'האם ניתן לייצא דוחות ל-Excel ו-PDF?',
        'כיצד מוגדרות הרשאות הצפייה בין עובדים?'
      ]
    },
    {
      id: 'prod_kosun_masterclass',
      title: 'סדנת מאסטר: שקט מנטלי ב-3 צעדים',
      subtitle: 'הדרכה מעשית 1-על-1 לבניית שגרת בוקר ונעילת יום',
      price: 850,
      currency: '₪',
      category: 'סדנאות והכשרות',
      badgeText: 'הדרכה אישית',
      imageUrl: '/cloudstore/kosun_product_4.webp',
      specs: [
        { id: '1', label: 'פורמט', value: 'מפגש זום אישי 90 דק׳', icon: 'Video' },
        { id: '2', label: 'חומרים', value: 'מדריך מעשי + טמפלטים', icon: 'FileText' },
        { id: '3', label: 'התאמה', value: '100% לפי העסק שלך', icon: 'CheckCircle' },
        { id: '4', label: 'אחריות', value: 'החזר כספי מלא אם לא מרוצה', icon: 'Award' }
      ],
      description: 'מפגש עומק עם מומחה פרודוקטיביות של KOSUN: פיצוח מחסומי דחיינות, תכנון תבניות קבועות והטמעה מושלמת של שיטת The Big 3.',
      suggestedQuestions: [
        'האם המפגש מוקלט ונשמר עבורי?',
        'האם מקבלים מעקב שבועי לאחר הסדנה?',
        'מתי מועדי המפגשים הקרובים?'
      ]
    }
  ];

  // 4. כרטיסיות שו"ת קבועות (עמוד 5 - 4 שאלות מובילות)
  const kosunFaq = [
    {
      id: 'faq_1',
      question: 'מהו עקרון ה-Big 3 ומדוע הוא מוגבל ל-3 משימות בלבד?',
      answer: 'המחקר המדעי מוכיח שהמוח האנושי אינו מסוגל להתמקד ביעילות ביותר מ-3 יעדים קריטיים ביום. הגבלת הרשימה מבטיחה 100% השלמה, מונעת שחיקה ומשחררת מרגשות אשם.'
    },
    {
      id: 'faq_2',
      question: 'איך עובד מנגנון הפירוק האוטומטי (AI Decompose)?',
      answer: 'כאשר מזינים משימה גדולה ומאיימת, המודל מפרק אותה למיקרו-שלבים מעשיים של עד 15 דקות כל אחד, עם צעד ראשון כל כך פשוט שאי אפשר לדחות אותו.'
    },
    {
      id: 'faq_3',
      question: 'האם המערכת מתאימה במיוחד לאנשים עם הפרעות קשב וריכוז (ADHD)?',
      answer: 'בהחלט. כל הארכיטקטורה, ממשק ה-Zero Scroll, הקלט הקולי והצבעוניות המרגיעה פותחו מהיסוד כדי לשרת מוחות יצירתיים הזקוקים למבנה ברור ואפס הסחות דעת.'
    },
    {
      id: 'faq_4',
      question: 'איך מתבצע טקס נעילת היום (Evening Ritual)?',
      answer: 'בכל ערב המערכת מדריכה אותך בבדיקת משימות היום, חגיגת ההצלחות, והעברת משימות שלא הושלמו לתכנון המחר — כדי שתוכל ללכת לישון בשקט מוחלט.'
    }
  ];

  // כתיבה ל-comonaDb ול-kosunDb
  const targets = [
    { name: 'COMONA DB', db: comonaDb },
    { name: 'KOSUN DB', db: kosunDb }
  ];

  for (const target of targets) {
    try {
      console.log(`Writing to ${target.name}...`);
      // ב. שמירת פרופיל הטננט
      await setDoc(doc(target.db, 'tenants', 'kosun'), kosunTenant);
      // ג. שמירת מוצרים (תחת קולקציית המוצרים של הטננט)
      for (const p of kosunProducts) {
        await setDoc(doc(target.db, `tenants/kosun/products`, p.id), p);
      }
      // ד. שמירת שו"ת
      for (const f of kosunFaq) {
        await setDoc(doc(target.db, `tenants/kosun/faq`, f.id), f);
      }
      console.log(`✓ Finished ${target.name}`);
    } catch (e) {
      console.warn(`Warning on ${target.name}:`, e.message);
    }
  }

  console.log('✅ KOSUN Master Tenant & Blueprint successfully seeded with full DNA, Layouts & 4-Card Pages!');
  process.exit(0);
}

seedMasterKosun().catch(err => {
  console.error('Error seeding master KOSUN:', err);
  process.exit(1);
});
