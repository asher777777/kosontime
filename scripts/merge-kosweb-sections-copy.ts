import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const masterJsonPath = path.resolve(__dirname, '../KOSUN2026/factory/data/kosun_copy_master.json');
const current = JSON.parse(fs.readFileSync(masterJsonPath, 'utf-8'));

const sectionTerms: Record<string, any> = {
  // ─── 1. Hero & Header Sections ───
  "sec_hero_title": {
    "id": "sec_hero_title",
    "areaId": "area_kosweb_hero",
    "pageId": "home",
    "systemDefault": "המרת כל אינטראקציה לנכס עסקי מוביל",
    "archetypeOverrides": {
      "saas": "פלטפורמת הפרודוקטיביות המובילה לאנשי עסקים",
      "automotive": "אולם התצוגה הדיגיטלי לרכבי יוקרה וספורט",
      "beauty": "חוויית אסתטיקה וטיפוח פרימיום בהתאמה אישית",
      "real_estate": "נכסי יוקרה והזדמנויות השקעה בינלאומיות",
      "legal": "מצוינות משפטית וייעוץ אסטרטגי אישי",
      "community": "המרכז הקהילתי והחברתי לפיתוח הדדי"
    }
  },
  "sec_hero_subtitle": {
    "id": "sec_hero_subtitle",
    "areaId": "area_kosweb_hero",
    "pageId": "home",
    "systemDefault": "חוויית משתמש חלקה, תוצאות מוכחות וליווי אישי ממוקד",
    "archetypeOverrides": {
      "saas": "אוטומציה מתקדמת לחיסכון של 40% מזמן הניהול היומי",
      "automotive": "מבחר דגמים בלעדיים באספקה מהירה ומימון מותאם",
      "beauty": "טיפולים מתקדמים בטכנולוגיה המובילה בעולם",
      "real_estate": "איתור נכסים מניבים עם תשואה מירבית ובדיקות עומק",
      "legal": "ייצוג בלתי מתפשר וליווי אישי בכל צומת החלטה",
      "community": "חיבורים עסקיים, אירועי תוכן והעשרה מתמדת"
    }
  },
  "sec_hero_cta_primary": {
    "id": "sec_hero_cta_primary",
    "areaId": "area_kosweb_hero",
    "pageId": "home",
    "systemDefault": "התחל עכשיו ◀",
    "archetypeOverrides": {
      "saas": "התחל תקופת ניסיון ◀",
      "automotive": "תיאום נסיעת מבחן ◀",
      "beauty": "קביעת תור לאבחון ◀",
      "real_estate": "לצפייה בנכסים נבחרים ◀",
      "legal": "פגישת ייעוץ ראשונית ◀",
      "community": "הצטרף לקהילה ◀"
    }
  },
  "sec_hero_cta_secondary": {
    "id": "sec_hero_cta_secondary",
    "areaId": "area_kosweb_hero",
    "pageId": "home",
    "systemDefault": "למידע נוסף ↵",
    "archetypeOverrides": {
      "saas": "סיור במערכת ↵",
      "automotive": "מפרט מלא ↵",
      "beauty": "סדרת הטיפולים ↵",
      "real_estate": "מפת השקעות ↵",
      "legal": "תחומי התמחות ↵",
      "community": "פעילויות קרובות ↵"
    }
  },
  "sec_header_home": {
    "id": "sec_header_home",
    "areaId": "area_kosweb_header",
    "pageId": "global",
    "systemDefault": "עמוד הבית",
    "archetypeOverrides": {
      "saas": "ראשי",
      "automotive": "אולם תצוגה",
      "beauty": "קליניקה",
      "real_estate": "נכסים",
      "legal": "משרד",
      "community": "מרכז קהילה"
    }
  },
  "sec_header_contact_btn": {
    "id": "sec_header_contact_btn",
    "areaId": "area_kosweb_header",
    "pageId": "global",
    "systemDefault": "יצירת קשר ◀",
    "archetypeOverrides": {
      "saas": "דבר עם מומחה ◀",
      "automotive": "תיאום פגישה ◀",
      "beauty": "קביעת תור ◀",
      "real_estate": "בדיקת זכאות ◀",
      "legal": "פנייה למשרד ◀",
      "community": "צרו קשר ◀"
    }
  },

  // ─── 2. Pricing & Packages ───
  "sec_pricing_title": {
    "id": "sec_pricing_title",
    "areaId": "area_kosweb_pricing",
    "pageId": "global",
    "systemDefault": "תוכניות ומסלולים שקופים ומותאמים",
    "archetypeOverrides": {
      "saas": "מסלולי מנוי ורישוי לעסקים",
      "automotive": "מסלולי מימון ורכישה גמישים",
      "beauty": "חבילות טיפול ומסלולי זוהר",
      "real_estate": "מסלולי השקעה ותנאי תשלום",
      "legal": "חבילות ייעוץ ושכר טרחה שקוף",
      "community": "דמי חבר ומסלולי שותפות"
    }
  },
  "sec_pricing_subtitle": {
    "id": "sec_pricing_subtitle",
    "areaId": "area_kosweb_pricing",
    "pageId": "global",
    "systemDefault": "בחרו את החבילה המתאימה ביותר לקצב ולצרכים שלכם",
    "archetypeOverrides": {
      "saas": "ללא התחייבות, שדרוג וביטול בלחיצת כפתור",
      "automotive": "פריסת תשלומים נוחה בריבית מועדפת",
      "beauty": "התאמה אישית מלאה לפי סוג העור והמטרות",
      "real_estate": "ביטחונות מלאים וליווי בנקאי צמוד",
      "legal": "שקיפות מלאה מראש ללא עלויות נסתרות",
      "community": "גישה חופשית לכל האירועים וההטבות"
    }
  },
  "sec_pricing_monthly": {
    "id": "sec_pricing_monthly",
    "areaId": "area_kosweb_pricing",
    "pageId": "global",
    "systemDefault": "חיוב חודשי",
    "archetypeOverrides": {
      "saas": "מסלול חודשי",
      "automotive": "תשלום חודשי",
      "beauty": "חודשי",
      "real_estate": "חודשי"
    }
  },
  "sec_pricing_yearly": {
    "id": "sec_pricing_yearly",
    "areaId": "area_kosweb_pricing",
    "pageId": "global",
    "systemDefault": "חיוב שנתי",
    "archetypeOverrides": {
      "saas": "מסלול שנתי (חיסכון 20%)",
      "automotive": "שנתי",
      "beauty": "מנוי שנתי",
      "real_estate": "שנתי"
    }
  },
  "sec_pricing_per_month": {
    "id": "sec_pricing_per_month",
    "areaId": "area_kosweb_pricing",
    "pageId": "global",
    "systemDefault": "/חודש",
    "archetypeOverrides": { "saas": "/חודש", "automotive": "/חודש" }
  },
  "sec_pricing_per_year": {
    "id": "sec_pricing_per_year",
    "areaId": "area_kosweb_pricing",
    "pageId": "global",
    "systemDefault": "/שנה",
    "archetypeOverrides": { "saas": "/שנה", "automotive": "/שנה" }
  },
  "sec_pricing_discount_badge": {
    "id": "sec_pricing_discount_badge",
    "areaId": "area_kosweb_pricing",
    "pageId": "global",
    "systemDefault": "חיסכון של 20%",
    "archetypeOverrides": {
      "saas": "חיסכון שנתי מיוחד",
      "automotive": "הנחת מזומן מיוחדת",
      "beauty": "הטבת הצטרפות",
      "real_estate": "תנאי פריסייל"
    }
  },
  "sec_pricing_cta": {
    "id": "sec_pricing_cta",
    "areaId": "area_kosweb_pricing",
    "pageId": "global",
    "systemDefault": "בחר מסלול ↵",
    "archetypeOverrides": {
      "saas": "בחר תוכנית זו ↵",
      "automotive": "לפרטי מימון ↵",
      "beauty": "לבחירת החבילה ↵",
      "real_estate": "שריון יחידה ↵",
      "legal": "בחירת ליווי ↵",
      "community": "הצטרפות למסלול ↵"
    }
  },
  "sec_pricing_popular_badge": {
    "id": "sec_pricing_popular_badge",
    "areaId": "area_kosweb_pricing",
    "pageId": "global",
    "systemDefault": "הבחירה המומלצת ⭐",
    "archetypeOverrides": {
      "saas": "הכי מבוקש בקרב חברות ⭐",
      "automotive": "הדגם הנמכר ביותר ⭐",
      "beauty": "הטיפול האהוב ⭐",
      "real_estate": "המסלול המוביל ⭐"
    }
  },

  // ─── 3. FAQ Section ───
  "sec_faq_title": {
    "id": "sec_faq_title",
    "areaId": "area_kosweb_faq",
    "pageId": "global",
    "systemDefault": "שאלות ותשובות נפוצות",
    "archetypeOverrides": {
      "saas": "שאלות טכנולוגיות ומידע עסקי",
      "automotive": "כל מה שחשוב לדעת על הרכישה והאחריות",
      "beauty": "שאלות ותשובות על מהלך הטיפול",
      "real_estate": "שאלות נפוצות בנושאי רכישה ומיסוי",
      "legal": "שאלות משפטיות מרכזיות",
      "community": "שאלות על פעילות הקהילה"
    }
  },
  "sec_faq_subtitle": {
    "id": "sec_faq_subtitle",
    "areaId": "area_kosweb_faq",
    "pageId": "global",
    "systemDefault": "כל המידע, התשובות וההסברים במקום אחד מרוכז",
    "archetypeOverrides": {
      "saas": "תשובות ישירות על אבטחה, הטמעה ואינטגרציות",
      "automotive": "שקיפות מלאה על תנאי אחריות, טרייד-אין וביטוח",
      "beauty": "הסברים מפורטים על שלבי הטיפול ותוצאות",
      "real_estate": "פירוט שלבי העסקה, לוחות זמנים ובטוחות",
      "legal": "מענה מקצועי ראשוני לשאלות נפוצות",
      "community": "כל המידע על הצטרפות ומפגשים"
    }
  },
  "sec_faq_search_placeholder": {
    "id": "sec_faq_search_placeholder",
    "areaId": "area_kosweb_faq",
    "pageId": "global",
    "systemDefault": "חפש שאלה או מילת מפתח...",
    "archetypeOverrides": {
      "saas": "חפש שאלה או נושא...",
      "automotive": "חפש דגם, אחריות או מימון...",
      "beauty": "חפשי טיפול או שאלה...",
      "real_estate": "חפש אזור, תשואה או שלב..."
    }
  },
  "sec_faq_more_help": {
    "id": "sec_faq_more_help",
    "areaId": "area_kosweb_faq",
    "pageId": "global",
    "systemDefault": "לא מצאת מענה לשאלתך?",
    "archetypeOverrides": {
      "saas": "זקוק להעמקה טכנית נוספת?",
      "automotive": "רוצה להתייעץ עם יועץ רכב מומחה?",
      "beauty": "רוצה להתייעץ אישית עם המטפלת?",
      "real_estate": "מעוניין בניתוח נכס אישי?"
    }
  },
  "sec_faq_contact_cta": {
    "id": "sec_faq_contact_cta",
    "areaId": "area_kosweb_faq",
    "pageId": "global",
    "systemDefault": "דבר עם הצוות שלנו ◀",
    "archetypeOverrides": {
      "saas": "שוחח עם מומחה תמיכה ◀",
      "automotive": "שיחה עם יועץ רכב ◀",
      "beauty": "ייעוץ אישי בוואטסאפ ◀",
      "real_estate": "שיחה עם יועץ השקעות ◀"
    }
  },

  // ─── 4. Testimonials & Social Proof ───
  "sec_testimonials_title": {
    "id": "sec_testimonials_title",
    "areaId": "area_kosweb_testimonials",
    "pageId": "global",
    "systemDefault": "מה מספרים הלקוחות שבחרו בנו",
    "archetypeOverrides": {
      "saas": "חברות ומנהלים משתפים על השינוי",
      "automotive": "חוויות נהיגה ורכישה מלקוחות מרוצים",
      "beauty": "תוצאות וחוויות מהמטופלות שלנו",
      "real_estate": "משקיעים ורוכשים מספרים על העסקאות",
      "legal": "לקוחות מספרים על ההצלחה המשפטית",
      "community": "חברי הקהילה משתפים מהשטח"
    }
  },
  "sec_testimonials_subtitle": {
    "id": "sec_testimonials_subtitle",
    "areaId": "area_kosweb_testimonials",
    "pageId": "global",
    "systemDefault": "המלצות וביקורות מאומתות בזמן אמת",
    "archetypeOverrides": {
      "saas": "שביעות רצון מוכחת ממאות צוותים ומנהלים",
      "automotive": "דירוג שירות מוביל ועסקאות מוצלחות",
      "beauty": "עדויות אמיתיות ושינוי שניכר לעין",
      "real_estate": "השקעות שייצרו ערך וביטחון כלכלי",
      "legal": "הישגים משפטיים שהביאו שקט נפשי",
      "community": "עשייה משותפת שמדברת בעד עצמה"
    }
  },
  "sec_testimonials_verified": {
    "id": "sec_testimonials_verified",
    "areaId": "area_kosweb_testimonials",
    "pageId": "global",
    "systemDefault": "לקוח מאומת ✓",
    "archetypeOverrides": {
      "saas": "משתמש ארגוני מאומת ✓",
      "automotive": "רוכש מאומת ✓",
      "beauty": "מטופלת מאומתת ✓",
      "real_estate": "משקיע מאומת ✓"
    }
  },

  // ─── 5. Contact & Leads ───
  "sec_contact_title": {
    "id": "sec_contact_title",
    "areaId": "area_kosweb_contact",
    "pageId": "global",
    "systemDefault": "צרו איתנו קשר ישיר",
    "archetypeOverrides": {
      "saas": "דברו עם מומחה פתרונות",
      "automotive": "תיאום פגישה באולם התצוגה",
      "beauty": "קביעת פגישת אבחון אישית",
      "real_estate": "בדיקת התאמת השקעה",
      "legal": "פנייה דיסקרטית למשרד",
      "community": "יצירת קשר עם מנהלי הקהילה"
    }
  },
  "sec_contact_subtitle": {
    "id": "sec_contact_subtitle",
    "areaId": "area_kosweb_contact",
    "pageId": "global",
    "systemDefault": "נשמח לעמוד לרשותכם לכל שאלה, תיאום או מידע נוסף",
    "archetypeOverrides": {
      "saas": "נציג יחזור אליכם תוך פחות משעה בשעות הפעילות",
      "automotive": "יועץ אישי יתאים עבורכם את מסלול הרכישה המדויק",
      "beauty": "הצוות שלנו יתאים עבורך את מועד הטיפול הנוח ביותר",
      "real_estate": "מומחה השקעות יציג בפניכם נתונים ותשואות מדויקות",
      "legal": "פנייתכם תטופל בסודיות מוחלטת ובמקצועיות ללא פשרות",
      "community": "נשמח לצרף אתכם לפעילות המשותפת"
    }
  },
  "sec_contact_name_ph": {
    "id": "sec_contact_name_ph",
    "areaId": "area_kosweb_contact",
    "pageId": "global",
    "systemDefault": "שם מלא",
    "archetypeOverrides": { "saas": "שם מלא", "beauty": "שם מלא" }
  },
  "sec_contact_phone_ph": {
    "id": "sec_contact_phone_ph",
    "areaId": "area_kosweb_contact",
    "pageId": "global",
    "systemDefault": "מספר טלפון לחזרה",
    "archetypeOverrides": { "saas": "טלפון נייד", "automotive": "טלפון לחזרה" }
  },
  "sec_contact_email_ph": {
    "id": "sec_contact_email_ph",
    "areaId": "area_kosweb_contact",
    "pageId": "global",
    "systemDefault": "כתובת אימייל",
    "archetypeOverrides": { "saas": "אימייל עסקי", "real_estate": "דוא״ל" }
  },
  "sec_contact_message_ph": {
    "id": "sec_contact_message_ph",
    "areaId": "area_kosweb_contact",
    "pageId": "global",
    "systemDefault": "כיצד נוכל לעזור? כתבו כאן...",
    "archetypeOverrides": {
      "saas": "ספרו בקצרה על הצוות או הצורך העסקי...",
      "automotive": "דגם מועדף או פרטים נוספים...",
      "beauty": "ספרי לנו על מטרת הטיפול...",
      "real_estate": "תקציב רצוי או יעד השקעה...",
      "legal": "תיאור תמציתי של הסוגיה המשפטית..."
    }
  },
  "sec_contact_submit_btn": {
    "id": "sec_contact_submit_btn",
    "areaId": "area_kosweb_contact",
    "pageId": "global",
    "systemDefault": "שליחת פנייה ◀",
    "archetypeOverrides": {
      "saas": "קבלת שיחת ייעוץ ◀",
      "automotive": "שריון פגישה ◀",
      "beauty": "שליחת פרטים לתיאום ◀",
      "real_estate": "בדיקת זכאות עכשיו ◀",
      "legal": "שליחה מאובטחת ◀"
    }
  },
  "sec_contact_success": {
    "id": "sec_contact_success",
    "areaId": "area_kosweb_contact",
    "pageId": "global",
    "systemDefault": "הפנייה נשלחה בהצלחה! ניצור איתך קשר בהקדם.",
    "archetypeOverrides": {
      "saas": "תודה! מומחה מטעמנו ייצור קשר בהקדם.",
      "automotive": "פנייתך התקבלה! נציג אולם התצוגה יחזור אליך.",
      "beauty": "הפרטים התקבלו באהבה! ניצור קשר לתיאום תור.",
      "real_estate": "הפנייה התקבלה! נציג השקעות יציג בפניך את הנכסים."
    }
  },
  "sec_contact_whatsapp_btn": {
    "id": "sec_contact_whatsapp_btn",
    "areaId": "area_kosweb_contact",
    "pageId": "global",
    "systemDefault": "מענה מהיר ב-WhatsApp",
    "archetypeOverrides": { "saas": "צ'אט מהיר בוואטסאפ", "beauty": "תיאום מהיר בוואטסאפ" }
  },

  // ─── 6. Articles & Knowledge Listing ───
  "sec_articles_title": {
    "id": "sec_articles_title",
    "areaId": "area_kosweb_articles",
    "pageId": "global",
    "systemDefault": "מרכז הידע והתוכן המקצועי",
    "archetypeOverrides": {
      "saas": "מדריכים וכלים לפרודוקטיביות וצמיחה",
      "automotive": "סקירות רכב, חידושים טכנולוגיים וחדשות מוטוריות",
      "beauty": "מדריכי טיפוח, חידושים מדעיים וטיפים לזוהר",
      "real_estate": "ניתוחי שוק, מגמות נדל״ן והזדמנויות השקעה",
      "legal": "מאמרים משפטיים, תקדימים ועדכוני חקיקה",
      "community": "עדכונים, סיכומי פעילות וסיפורי קהילה"
    }
  },
  "sec_articles_subtitle": {
    "id": "sec_articles_subtitle",
    "areaId": "area_kosweb_articles",
    "pageId": "global",
    "systemDefault": "מאמרים מעמיקים, טיפים וסקירות מקצועיות מהמומחים שלנו",
    "archetypeOverrides": {
      "saas": "ידע פרקטי למיטוב ביצועים וחיסכון בזמן",
      "automotive": "השוואות דגמים ומבחני דרכים מעמיקים",
      "beauty": "הסברים מקצועיים על שגרת טיפוח נכונה",
      "real_estate": "מגמות כלכליות וניתוח אזורי ביקוש",
      "legal": "תובנות משפטיות לשמירה על הזכויות שלכם"
    }
  },
  "sec_articles_read_more": {
    "id": "sec_articles_read_more",
    "areaId": "area_kosweb_articles",
    "pageId": "global",
    "systemDefault": "קרא את המאמר המלא ◀",
    "archetypeOverrides": {
      "saas": "להמשך קריאה ◀",
      "automotive": "לסקירה המלאה ◀",
      "beauty": "למדריך המלא ◀",
      "real_estate": "לניתוח המלא ◀"
    }
  },

  // ─── 7. Events & RSVP ───
  "sec_events_title": {
    "id": "sec_events_title",
    "areaId": "area_kosweb_events",
    "pageId": "global",
    "systemDefault": "אירועים, סדנאות ומפגשים קרובים",
    "archetypeOverrides": {
      "saas": "וובינרים ומפגשי הכשרה מקצועיים",
      "automotive": "אירועי השקה וימי נהיגה מיוחדים",
      "beauty": "סדנאות יופי וימי אבחון מיוחדים",
      "real_estate": "כנס השקעות וסיורי נכסים בלעדיים",
      "community": "מפגשי קהילה, כנסים ואירועים"
    }
  },
  "sec_events_subtitle": {
    "id": "sec_events_subtitle",
    "areaId": "area_kosweb_events",
    "pageId": "global",
    "systemDefault": "סמנו ביומן והבטיחו את מקומכם במפגשים הנבחרים",
    "archetypeOverrides": {
      "saas": "הדרכות חיות עם בכירי התעשייה",
      "automotive": "השקות דגמים חדשים לחובבי הגה",
      "beauty": "מפגשים חווייתיים עם מובילות התחום",
      "real_estate": "הזדמנויות בלעדיות לקראת פתיחת מכירה"
    }
  },
  "sec_events_register_cta": {
    "id": "sec_events_register_cta",
    "areaId": "area_kosweb_events",
    "pageId": "global",
    "systemDefault": "הרשמה לאירוע ◀",
    "archetypeOverrides": {
      "saas": "שריון מקום בוובינר ◀",
      "automotive": "הרשמה לאירוע השקה ◀",
      "beauty": "שריון מקום בסדנה ◀",
      "real_estate": "הרשמה לסיור נכסים ◀"
    }
  },

  // ─── 8. Before & After ───
  "sec_before_after_title": {
    "id": "sec_before_after_title",
    "areaId": "area_kosweb_before_after",
    "pageId": "global",
    "systemDefault": "תוצאות מוכחות • לפני ואחרי",
    "archetypeOverrides": {
      "saas": "יעילות העבודה לפני ואחרי ההטמעה",
      "automotive": "השבחה ושדרוג הרכב לפני ואחרי",
      "beauty": "תוצאות הטיפול • מראה לפני ואחרי",
      "real_estate": "השבחת נכסים • לפני ואחרי השיפוץ"
    }
  },
  "sec_before_after_subtitle": {
    "id": "sec_before_after_subtitle",
    "areaId": "area_kosweb_before_after",
    "pageId": "global",
    "systemDefault": "התמונות והתוצאות שממחישות את ההבדל האמיתי",
    "archetypeOverrides": {
      "saas": "ממצב של כאוס לפוקוס עסקי מלא",
      "automotive": "השבחה מדויקת לפי התקנים המחמירים ביותר",
      "beauty": "שינוי טבעי, זוהר ובריא",
      "real_estate": "עסקאות השבחה שהניבו רווח מדיד"
    }
  },
  "sec_before_label": {
    "id": "sec_before_label",
    "areaId": "area_kosweb_before_after",
    "pageId": "global",
    "systemDefault": "לפני",
    "archetypeOverrides": { "saas": "לפני", "beauty": "לפני" }
  },
  "sec_after_label": {
    "id": "sec_after_label",
    "areaId": "area_kosweb_before_after",
    "pageId": "global",
    "systemDefault": "אחרי",
    "archetypeOverrides": { "saas": "אחרי", "beauty": "אחרי" }
  },

  // ─── 9. Stats Bento & Social Proof ───
  "sec_stats_title": {
    "id": "sec_stats_title",
    "areaId": "area_kosweb_stats",
    "pageId": "global",
    "systemDefault": "המספרים וההישגים מדברים בעד עצמם",
    "archetypeOverrides": {
      "saas": "מדדי ביצוע ותוצאות בקרב לקוחותינו",
      "automotive": "נתוני מכירה, שביעות רצון ואספקה",
      "beauty": "אלפי טיפולים מוצלחים ושביעות רצון שיא",
      "real_estate": "שווי נכסים מנוהלים ותשואות מוכחות",
      "community": "הקהילה שלנו במספרים"
    }
  },
  "sec_stats_subtitle": {
    "id": "sec_stats_subtitle",
    "areaId": "area_kosweb_stats",
    "pageId": "global",
    "systemDefault": "מדדים ברורים של צמיחה, אמינות והצלחה מוכחת בשטח",
    "archetypeOverrides": {
      "saas": "חיסכון מוכח בזמן ושיפור התפוקה היומית",
      "automotive": "רמת שירות מהגבוהות בענף הרכב",
      "beauty": "שביעות רצון מלאה וליווי מקצועי",
      "real_estate": "איתור עסקאות איכותיות עם ביטחון פיננסי"
    }
  },

  // ─── 10. Timer & Urgency ───
  "sec_timer_title": {
    "id": "sec_timer_title",
    "areaId": "area_kosweb_timer",
    "pageId": "global",
    "systemDefault": "הספירה לאחור החלה",
    "archetypeOverrides": {
      "saas": "ההטבה המיוחדת מסתיימת בקרוב",
      "automotive": "מבצע המכירות המיוחד למספר ימים בלבד",
      "beauty": "הטבת השקה לזמן מוגבל",
      "real_estate": "מחירי פריסייל לפני עליית מחירים",
      "community": "סגירת ההרשמה למפגש הקרוב"
    }
  },
  "sec_timer_subtitle": {
    "id": "sec_timer_subtitle",
    "areaId": "area_kosweb_timer",
    "pageId": "global",
    "systemDefault": "הבטיחו את מקומכם ותיהנו מתנאים בלעדיים לפני סגירת ההרשמה",
    "archetypeOverrides": {
      "saas": "קבלו תנאי הצטרפות מועדפים בהרשמה מוקדמת",
      "automotive": "המלאי מוגבל ומחירי המבצע בתוקף עד לסיום הספירה",
      "beauty": "מספר המקומות מוגבל לשמירה על יחס אישי",
      "real_estate": "יחידות אחרונות בתנאי ההשקה המקוריים"
    }
  },
  "sec_timer_days": {
    "id": "sec_timer_days",
    "areaId": "area_kosweb_timer",
    "pageId": "global",
    "systemDefault": "ימים",
    "archetypeOverrides": { "saas": "ימים", "automotive": "ימים" }
  },
  "sec_timer_hours": {
    "id": "sec_timer_hours",
    "areaId": "area_kosweb_timer",
    "pageId": "global",
    "systemDefault": "שעות",
    "archetypeOverrides": { "saas": "שעות", "automotive": "שעות" }
  },
  "sec_timer_minutes": {
    "id": "sec_timer_minutes",
    "areaId": "area_kosweb_timer",
    "pageId": "global",
    "systemDefault": "דקות",
    "archetypeOverrides": { "saas": "דקות", "automotive": "דקות" }
  },
  "sec_timer_seconds": {
    "id": "sec_timer_seconds",
    "areaId": "area_kosweb_timer",
    "pageId": "global",
    "systemDefault": "שניות",
    "archetypeOverrides": { "saas": "שניות", "automotive": "שניות" }
  },

  // ─── 11. Video & Media ───
  "sec_video_title": {
    "id": "sec_video_title",
    "areaId": "area_kosweb_video",
    "pageId": "global",
    "systemDefault": "צפו בסרטון וגלו את הסיפור המלא",
    "archetypeOverrides": {
      "saas": "צפו בהדגמה חיה של המערכת בפעולה",
      "automotive": "סרטון סקירה בלעדי ומבט מקרוב על הרכב",
      "beauty": "הצצה אל הקליניקה ואל מהלך הטיפולים",
      "real_estate": "סיור וידאו מרהיב בנכס ובסביבתו",
      "community": "רגעים נבחרים מהפעילות והעשייה"
    }
  },
  "sec_video_subtitle": {
    "id": "sec_video_subtitle",
    "areaId": "area_kosweb_video",
    "pageId": "global",
    "systemDefault": "חוויית צפייה מעמיקה הממחישה את האיכות והייחודיות",
    "archetypeOverrides": {
      "saas": "הבינו ב-2 דקות איך המערכת עובדת",
      "automotive": "סקירת ביצועים, עיצוב פנימי ואבזור פרימיום",
      "beauty": "ראו את התהליך והאווירה המרגיעה",
      "real_estate": "סיור פנורמי המציג את כל היתרונות של הנכס"
    }
  },
  "sec_video_watch_now": {
    "id": "sec_video_watch_now",
    "areaId": "area_kosweb_video",
    "pageId": "global",
    "systemDefault": "צפה עכשיו ◀",
    "archetypeOverrides": {
      "saas": "לצפייה בהדגמה ◀",
      "automotive": "לצפייה בסקירה ◀",
      "beauty": "לצפייה בסרטון ◀",
      "real_estate": "לסיור הוידאו ◀"
    }
  },

  // ─── 12. Geo Local & Branches ───
  "sec_geo_title": {
    "id": "sec_geo_title",
    "areaId": "area_kosweb_geo",
    "pageId": "global",
    "systemDefault": "הסניף והפעילות המקומית שלנו",
    "archetypeOverrides": {
      "saas": "מרכז השירות והתמיכה בישראל",
      "automotive": "אולם התצוגה ומרכז השירות הראשי",
      "beauty": "הקליניקה הראשית ומתחם הטיפולים",
      "real_estate": "משרדי המכירות ומרכז המידע",
      "community": "בית הקהילה והמפגש המקומי"
    }
  },
  "sec_geo_subtitle": {
    "id": "sec_geo_subtitle",
    "areaId": "area_kosweb_geo",
    "pageId": "global",
    "systemDefault": "מיקום מרכזי, נגישות מקסימלית וחניה מסודרת לאורחים",
    "archetypeOverrides": {
      "saas": "זמינות מקומית ושירות לקוחות אישי",
      "automotive": "מתחם מרווח עם כל הדגמים החדשים",
      "beauty": "חוויית אירוח שלווה ונגישה",
      "real_estate": "פגישות ייעוץ אישיות באווירה מקצועית"
    }
  },
  "sec_geo_waze_btn": {
    "id": "sec_geo_waze_btn",
    "areaId": "area_kosweb_geo",
    "pageId": "global",
    "systemDefault": "ניווט עם Waze ◀",
    "archetypeOverrides": { "saas": "נווט עם Waze ◀", "automotive": "ניווט ישיר לאולם ◀" }
  },

  // ─── 13. Campaign & Donors ───
  "sec_campaign_goal": {
    "id": "sec_campaign_goal",
    "areaId": "area_kosweb_campaign",
    "pageId": "global",
    "systemDefault": "יעד הקמפיין הכולל",
    "archetypeOverrides": { "community": "יעד הגיוס לפרויקט" }
  },
  "sec_campaign_raised": {
    "id": "sec_campaign_raised",
    "areaId": "area_kosweb_campaign",
    "pageId": "global",
    "systemDefault": "שגויסו עד כה",
    "archetypeOverrides": { "community": "גויסו באהבה עד כה" }
  },
  "sec_campaign_donate_now": {
    "id": "sec_campaign_donate_now",
    "areaId": "area_kosweb_campaign",
    "pageId": "global",
    "systemDefault": "השתתף ותרם עכשיו ◀",
    "archetypeOverrides": { "community": "היו שותפים בהצלחה ◀" }
  },
  "sec_campaign_recent_donors": {
    "id": "sec_campaign_recent_donors",
    "areaId": "area_kosweb_campaign",
    "pageId": "global",
    "systemDefault": "שותפים ותורמים מובילים",
    "archetypeOverrides": { "community": "תורמים אחרונים ושגרירי קהילה" }
  },

  // ─── 14. Live Analytics & Posts ───
  "sec_analytics_title": {
    "id": "sec_analytics_title",
    "areaId": "area_kosweb_analytics",
    "pageId": "global",
    "systemDefault": "מדדי ביצועים ואנליטיקס בזמן אמת",
    "archetypeOverrides": {
      "saas": "לוח מדדים חי לניטור פעילות וצמיחה",
      "community": "מעורבות קהל והיקף אינטראקציה"
    }
  },
  "sec_posts_title": {
    "id": "sec_posts_title",
    "areaId": "area_kosweb_posts",
    "pageId": "global",
    "systemDefault": "עדכונים, אירועים וחדשות אחרונות",
    "archetypeOverrides": {
      "saas": "חדשות המוצר ועדכוני גרסה",
      "automotive": "חדשות אולם התצוגה ודגמים שהגיעו",
      "beauty": "עדכוני הקליניקה וטיפולים חדשים",
      "real_estate": "התקדמות בנייה וחדשות השוק",
      "community": "מה קורה בקהילה השבוע"
    }
  },
  "sec_posts_all_cta": {
    "id": "sec_posts_all_cta",
    "areaId": "area_kosweb_posts",
    "pageId": "global",
    "systemDefault": "לכל העדכונים ◀",
    "archetypeOverrides": {
      "saas": "לכל העדכונים והשחרורים ◀",
      "community": "לכל סיפורי הקהילה ◀"
    }
  },

  // ─── 15. Logo Marquee & Trust ───
  "sec_marquee_title": {
    "id": "sec_marquee_title",
    "areaId": "area_kosweb_marquee",
    "pageId": "global",
    "systemDefault": "נבחר על ידי הארגונים והמותגים המובילים",
    "archetypeOverrides": {
      "saas": "נותנים אמון במערכת המובילים במשק",
      "automotive": "יבואנים ומותגים מובילים בעולם",
      "beauty": "קליניקות ומומחיות יופי מובילות",
      "real_estate": "קרנות וחברות נדל״ן מובילות",
      "legal": "חברות מסחריות ולקוחות מובילים"
    }
  }
};

let added = 0;
for (const [k, v] of Object.entries(sectionTerms)) {
  if (!current.terms[k]) {
    current.terms[k] = v;
    added++;
  } else {
    current.terms[k] = { ...current.terms[k], ...v };
  }
}

current._metadata.totalTerms = Object.keys(current.terms).length;
current._metadata.lastUpdated = new Date().toISOString();
current._metadata.version = "2026.11";

fs.writeFileSync(masterJsonPath, JSON.stringify(current, null, 2), 'utf-8');
console.log(`✅ [Sections Copy Merge Complete] נוספו/עודכנו ${added} מונחים חדשים לאזורי KosWebAi!`);
console.log(`📊 סך הכל מונחים בקולקציה: ${current._metadata.totalTerms}`);
