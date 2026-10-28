const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'KOSUN2026', 'factory', 'data', 'kosun_copy_master.json');
const master = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const headerTerms = {
  sec_header_cta: {
    id: "sec_header_cta",
    areaId: "area_header",
    pageId: "global",
    systemDefault: "התחל עכשיו",
    archetypeOverrides: {
      saas: "התנסות חינם",
      automotive: "הזמנת נסיעת מבחן",
      beauty: "תיאום תור אונליין",
      real_estate: "לפרטים על הפרויקט",
      community: "הצטרפות לקהילה",
      legal: "תיאום פגישת ייעוץ"
    }
  },
  sec_header_menu_title: {
    id: "sec_header_menu_title",
    areaId: "area_header",
    pageId: "global",
    systemDefault: "תפריט ניווט",
    archetypeOverrides: {
      saas: "תפריט המערכת",
      automotive: "תפריט ראשי",
      beauty: "תפריט הקליניקה",
      real_estate: "תפריט פרויקטים",
      community: "תפריט קהילה",
      legal: "תפריט המשרד"
    }
  },
  sec_header_open_menu: {
    id: "sec_header_open_menu",
    areaId: "area_header",
    pageId: "global",
    systemDefault: "פתח תפריט ניווט",
    archetypeOverrides: {
      saas: "פתיחת תפריט",
      automotive: "פתיחת תפריט",
      beauty: "פתיחת תפריט",
      real_estate: "פתיחת תפריט",
      community: "פתיחת תפריט",
      legal: "פתיחת תפריט"
    }
  },
  sec_header_close_menu: {
    id: "sec_header_close_menu",
    areaId: "area_header",
    pageId: "global",
    systemDefault: "סגור תפריט",
    archetypeOverrides: {
      saas: "סגירת תפריט",
      automotive: "סגירה",
      beauty: "סגירה",
      real_estate: "סגירה",
      community: "סגירה",
      legal: "סגירה"
    }
  },
  sec_header_whatsapp: {
    id: "sec_header_whatsapp",
    areaId: "area_header",
    pageId: "global",
    systemDefault: "וואטסאפ",
    archetypeOverrides: {
      saas: "צ'אט תמיכה",
      automotive: "וואטסאפ אולם",
      beauty: "וואטסאפ קליניקה",
      real_estate: "וואטסאפ פרויקטים",
      community: "וואטסאפ קהילה",
      legal: "וואטסאפ משרד"
    }
  },
  sec_header_call: {
    id: "sec_header_call",
    areaId: "area_header",
    pageId: "global",
    systemDefault: "חיוג",
    archetypeOverrides: {
      saas: "מוקד תמיכה",
      automotive: "מוקד הזמנות",
      beauty: "קביעת תורים",
      real_estate: "מוקד מכירות",
      community: "מזכירות",
      legal: "מזכירות הפירמה"
    }
  },
  sec_header_theme_toggle: {
    id: "sec_header_theme_toggle",
    areaId: "area_header",
    pageId: "global",
    systemDefault: "החלפת מצב תצוגה",
    archetypeOverrides: {
      saas: "מצב יום / לילה",
      automotive: "החלפת תצוגה",
      beauty: "מצב תאורה",
      real_estate: "החלפת תצוגה",
      community: "החלפת תצוגה",
      legal: "מצב קריאה"
    }
  },
  sec_header_theme_dark: {
    id: "sec_header_theme_dark",
    areaId: "area_header",
    pageId: "global",
    systemDefault: "מצב תצוגה: לילה",
    archetypeOverrides: {
      saas: "מצב כהה",
      automotive: "תצוגת לילה",
      beauty: "תצוגת ערב",
      real_estate: "תצוגה כהה",
      community: "מצב לילה",
      legal: "מצב כהה"
    }
  },
  sec_header_theme_light: {
    id: "sec_header_theme_light",
    areaId: "area_header",
    pageId: "global",
    systemDefault: "מצב תצוגה: יום",
    archetypeOverrides: {
      saas: "מצב בהיר",
      automotive: "תצוגת יום",
      beauty: "תצוגת יום",
      real_estate: "תצוגה בהירה",
      community: "מצב יום",
      legal: "מצב בהיר"
    }
  },
  sec_header_user_connected: {
    id: "sec_header_user_connected",
    areaId: "area_header",
    pageId: "global",
    systemDefault: "משתמש מחובר",
    archetypeOverrides: {
      saas: "חשבון פעיל",
      automotive: "אזור אישי",
      beauty: "כרטיס לקוח/ה",
      real_estate: "אזור משקיע",
      community: "חבר קהילה",
      legal: "אזור לקוח"
    }
  },
  sec_header_connected: {
    id: "sec_header_connected",
    areaId: "area_header",
    pageId: "global",
    systemDefault: "מחובר",
    archetypeOverrides: {
      saas: "מחובר",
      automotive: "מחובר",
      beauty: "מחוברת",
      real_estate: "מחובר",
      community: "מחובר",
      legal: "מחובר"
    }
  },
  sec_header_admin: {
    id: "sec_header_admin",
    areaId: "area_header",
    pageId: "global",
    systemDefault: "מנהל מערכת",
    archetypeOverrides: {
      saas: "מנהל מערכת",
      automotive: "מנהל מותג",
      beauty: "מנהלת קליניקה",
      real_estate: "מנהל פרויקטים",
      community: "מנהל קהילה",
      legal: "שותף מנהל"
    }
  },
  sec_header_logout: {
    id: "sec_header_logout",
    areaId: "area_header",
    pageId: "global",
    systemDefault: "התנתקות מהמערכת",
    archetypeOverrides: {
      saas: "יציאה מהחשבון",
      automotive: "יציאה",
      beauty: "התנתקות",
      real_estate: "יציאה",
      community: "התנתקות",
      legal: "יציאה מאובטחת"
    }
  },
  sec_header_login: {
    id: "sec_header_login",
    areaId: "area_header",
    pageId: "global",
    systemDefault: "התחברות למערכת",
    archetypeOverrides: {
      saas: "כניסה לחשבון",
      automotive: "כניסה לאזור אישי",
      beauty: "התחברות לאזור האישי",
      real_estate: "כניסת משקיעים",
      community: "כניסת חברים",
      legal: "כניסת לקוחות מאובטחת"
    }
  },
  sec_header_login_short: {
    id: "sec_header_login_short",
    areaId: "area_header",
    pageId: "global",
    systemDefault: "התחבר",
    archetypeOverrides: {
      saas: "כניסה",
      automotive: "התחברות",
      beauty: "התחברי",
      real_estate: "כניסה",
      community: "התחבר",
      legal: "כניסה"
    }
  },
  sec_header_fast_call: {
    id: "sec_header_fast_call",
    areaId: "area_header",
    pageId: "global",
    systemDefault: "חיוג מהיר",
    archetypeOverrides: {
      saas: "חיוג לתמיכה",
      automotive: "חיוג לאולם",
      beauty: "חיוג לקליניקה",
      real_estate: "חיוג למוקד",
      community: "חיוג למזכירות",
      legal: "חיוג למשרד"
    }
  },
  sec_header_whatsapp_chat: {
    id: "sec_header_whatsapp_chat",
    areaId: "area_header",
    pageId: "global",
    systemDefault: "שיחה בוואטסאפ",
    archetypeOverrides: {
      saas: "צ'אט מהיר",
      automotive: "וואטסאפ אולם",
      beauty: "וואטסאפ לתיאום",
      real_estate: "וואטסאפ יועץ",
      community: "וואטסאפ קהילה",
      legal: "פנייה בוואטסאפ"
    }
  },
  sec_header_page_fallback: {
    id: "sec_header_page_fallback",
    areaId: "area_header",
    pageId: "global",
    systemDefault: "עמוד",
    archetypeOverrides: {
      saas: "עמוד",
      automotive: "עמוד",
      beauty: "עמוד",
      real_estate: "עמוד",
      community: "עמוד",
      legal: "עמוד"
    }
  },
  nav_home: {
    id: "nav_home",
    areaId: "area_header",
    pageId: "global",
    systemDefault: "עמוד הבית",
    archetypeOverrides: {
      saas: "ראשי",
      automotive: "ראשי",
      beauty: "בית",
      real_estate: "עמוד הבית",
      community: "בית הקהילה",
      legal: "עמוד ראשי"
    }
  },
  nav_services: {
    id: "nav_services",
    areaId: "area_header",
    pageId: "global",
    systemDefault: "שירותים",
    archetypeOverrides: {
      saas: "פתרונות",
      automotive: "דגמים ושירותים",
      beauty: "תפריט טיפולים",
      real_estate: "פרויקטים ונכסים",
      community: "פעילויות ואירועים",
      legal: "תחומי עיסוק"
    }
  },
  nav_about: {
    id: "nav_about",
    areaId: "area_header",
    pageId: "global",
    systemDefault: "אודות",
    archetypeOverrides: {
      saas: "אודות החברה",
      automotive: "אודות המותג",
      beauty: "על הקליניקה",
      real_estate: "על הקבוצה",
      community: "אודות הקהילה",
      legal: "על הפירמה"
    }
  },
  nav_contact: {
    id: "nav_contact",
    areaId: "area_header",
    pageId: "global",
    systemDefault: "צור קשר",
    archetypeOverrides: {
      saas: "יצירת קשר",
      automotive: "תיאום פגישה",
      beauty: "תיאום תור",
      real_estate: "פנייה לנציג",
      community: "הצטרפות",
      legal: "פנייה למשרד"
    }
  }
};

Object.assign(master.terms, headerTerms);
master._metadata.totalTerms = Object.keys(master.terms).length;
master._metadata.lastUpdated = new Date().toISOString();

fs.writeFileSync(filePath, JSON.stringify(master, null, 2), 'utf8');
console.log('Added Header terms. Total terms:', master._metadata.totalTerms);
