const fs = require('fs');
const path = require('path');

const masterPath = path.resolve(__dirname, '../KOSUN2026/factory/data/kosun_copy_master.json');
const master = JSON.parse(fs.readFileSync(masterPath, 'utf8'));

const newTerms = {
  sec_future_srv_default: {
    id: 'sec_future_srv_default',
    areaId: 'area_kosweb_future',
    pageId: 'future_content',
    systemDefault: 'שירות',
    archetypeOverrides: {
      saas: 'מודול',
      automotive: 'דגם',
      beauty: 'טיפול',
      real_estate: 'נכס',
      community: 'פעילות',
      legal: 'תחום'
    }
  },
  sec_future_cat_services: {
    id: 'sec_future_cat_services',
    areaId: 'area_kosweb_future',
    pageId: 'future_content',
    systemDefault: 'שירותים',
    archetypeOverrides: {
      saas: 'פתרונות תוכנה',
      automotive: 'דגמי רכב',
      beauty: 'טיפולים וסדרות',
      real_estate: 'נכסים ופרויקטים',
      community: 'תכניות קהילתיות',
      legal: 'תחומי עיסוק'
    }
  },
  sec_future_tag_lead_srv: {
    id: 'sec_future_tag_lead_srv',
    areaId: 'area_kosweb_future',
    pageId: 'future_content',
    systemDefault: '• שירות מוביל •',
    archetypeOverrides: {
      saas: '• פיצ׳ר נבחר •',
      automotive: '• רכב הדגל •',
      beauty: '• טיפול הדגל •',
      real_estate: '• פרויקט הדגל •',
      community: '• פעילות מרכזית •',
      legal: '• שירות מומחה •'
    }
  },
  sec_future_badge_recommended: {
    id: 'sec_future_badge_recommended',
    areaId: 'area_kosweb_future',
    pageId: 'future_content',
    systemDefault: 'מומלץ',
    archetypeOverrides: {
      saas: 'פופולרי',
      automotive: 'מבוקש',
      beauty: 'טיפול מבוקש',
      real_estate: 'הזדמנות',
      community: 'מומלץ לחברים',
      legal: 'מומלץ'
    }
  },
  sec_future_read_time_2m: {
    id: 'sec_future_read_time_2m',
    areaId: 'area_kosweb_future',
    pageId: 'future_content',
    systemDefault: '2 דק׳ קריאה',
    archetypeOverrides: {
      saas: 'סקירה קצרה',
      automotive: 'מבט מהיר',
      beauty: 'תקציר טיפול',
      real_estate: 'תקציר מפרט',
      community: 'קריאה קצרה',
      legal: 'תמצית'
    }
  },
  sec_future_read_time_3m: {
    id: 'sec_future_read_time_3m',
    areaId: 'area_kosweb_future',
    pageId: 'future_content',
    systemDefault: '3 דק׳ קריאה',
    archetypeOverrides: {
      saas: 'קריאה מעמיקה',
      automotive: 'מפרט מלא',
      beauty: 'פרוטוקול טיפול',
      real_estate: 'סקירת פרויקט',
      community: 'מאמר קהילה',
      legal: 'ניתוח משפטי'
    }
  },
  sec_future_cta_order: {
    id: 'sec_future_cta_order',
    areaId: 'area_kosweb_future',
    pageId: 'future_content',
    systemDefault: 'לפרטים והזמנה',
    archetypeOverrides: {
      saas: 'להתחלת שימוש',
      automotive: 'לתיאום נסיעה',
      beauty: 'להזמנת תור',
      real_estate: 'לקבלת הצעה',
      community: 'להצטרפות',
      legal: 'לתיאום פגישה'
    }
  },
  sec_future_cta_view_page: {
    id: 'sec_future_cta_view_page',
    areaId: 'area_kosweb_future',
    pageId: 'future_content',
    systemDefault: 'צפייה בעמוד',
    archetypeOverrides: {
      saas: 'כניסה למודול',
      automotive: 'לצפייה ברכב',
      beauty: 'לפרטי הטיפול',
      real_estate: 'לצפייה בנכס',
      community: 'לפרטי הפעילות',
      legal: 'לקריאת המאמר'
    }
  },
  sec_future_metric_price: {
    id: 'sec_future_metric_price',
    areaId: 'area_kosweb_future',
    pageId: 'future_content',
    systemDefault: 'מחיר',
    archetypeOverrides: {
      saas: 'עלות רישוי',
      automotive: 'מחיר מחירון',
      beauty: 'עלות טיפול',
      real_estate: 'החל מ-',
      community: 'דמי השתתפות',
      legal: 'שכר טרחה'
    }
  },
  sec_future_metric_rating: {
    id: 'sec_future_metric_rating',
    areaId: 'area_kosweb_future',
    pageId: 'future_content',
    systemDefault: 'דירוג',
    archetypeOverrides: {
      saas: 'דירוג משתמשים',
      automotive: 'ציון בטיחות',
      beauty: 'שביעות רצון',
      real_estate: 'דירוג פרויקט',
      community: 'דירוג חברים',
      legal: 'המלצות'
    }
  },
  sec_future_metric_views: {
    id: 'sec_future_metric_views',
    areaId: 'area_kosweb_future',
    pageId: 'future_content',
    systemDefault: 'צפיות',
    archetypeOverrides: {
      saas: 'צפיות',
      automotive: 'מתעניינים',
      beauty: 'צפיות',
      real_estate: 'פניות',
      community: 'קוראים',
      legal: 'צפיות'
    }
  },
  sec_future_cat_content: {
    id: 'sec_future_cat_content',
    areaId: 'area_kosweb_future',
    pageId: 'future_content',
    systemDefault: 'תוכן',
    archetypeOverrides: {
      saas: 'מדריך',
      automotive: 'מפרט',
      beauty: 'טיפוח',
      real_estate: 'פרויקט',
      community: 'קהילה',
      legal: 'מאמר'
    }
  },
  sec_future_tag_activity: {
    id: 'sec_future_tag_activity',
    areaId: 'area_kosweb_future',
    pageId: 'future_content',
    systemDefault: 'עמוד פעילות',
    archetypeOverrides: {
      saas: 'עמוד מערכת',
      automotive: 'עמוד דגם',
      beauty: 'עמוד טיפול',
      real_estate: 'עמוד נכס',
      community: 'עמוד פעילות',
      legal: 'עמוד שירות'
    }
  },
  sec_future_mode_bento: {
    id: 'sec_future_mode_bento',
    areaId: 'area_kosweb_future',
    pageId: 'future_content',
    systemDefault: 'בנטו מרחבי',
    archetypeOverrides: {
      saas: 'תצוגת רשת',
      automotive: 'גלריית דגמים',
      beauty: 'קולקציית יופי',
      real_estate: 'תצוגת פרויקטים',
      community: 'לוח קהילה',
      legal: 'סקירת תחומים'
    }
  },
  sec_future_mode_kinetic: {
    id: 'sec_future_mode_kinetic',
    areaId: 'area_kosweb_future',
    pageId: 'future_content',
    systemDefault: 'מגזין קינטי',
    archetypeOverrides: {
      saas: 'גלילת פיצ׳רים',
      automotive: 'פס תצוגה',
      beauty: 'מגזין השראה',
      real_estate: 'סיור נגלל',
      community: 'סיפורי קהילה',
      legal: 'מגזין משפטי'
    }
  },
  sec_future_mode_islands: {
    id: 'sec_future_mode_islands',
    areaId: 'area_kosweb_future',
    pageId: 'future_content',
    systemDefault: 'איים צפים',
    archetypeOverrides: {
      saas: 'כרטיסים חכמים',
      automotive: 'דגמים צפים',
      beauty: 'עולמות טיפוח',
      real_estate: 'כרטיסי נכסים',
      community: 'מוקדי עניין',
      legal: 'תחומי עניין'
    }
  },
  sec_future_audio_summary: {
    id: 'sec_future_audio_summary',
    areaId: 'area_kosweb_future',
    pageId: 'future_content',
    systemDefault: 'תקציר קולי מבוסס AI',
    archetypeOverrides: {
      saas: 'האזנה לסקירה',
      automotive: 'סקירה קולית',
      beauty: 'האזנה לטיפים',
      real_estate: 'האזנה למפרט',
      community: 'תקציר קולי',
      legal: 'האזנה לתמצית'
    }
  },
  sec_future_scroll_hint: {
    id: 'sec_future_scroll_hint',
    areaId: 'area_kosweb_future',
    pageId: 'future_content',
    systemDefault: 'גלילה אופקית חלקה',
    archetypeOverrides: {
      saas: 'גלילה אופקית',
      automotive: 'גלילת דגמים',
      beauty: 'דפדוף קל',
      real_estate: 'גלילת נכסים',
      community: 'גלילה אופקית',
      legal: 'דפדוף'
    }
  },
  sec_future_scroll_left: {
    id: 'sec_future_scroll_left',
    areaId: 'area_kosweb_future',
    pageId: 'future_content',
    systemDefault: 'גלול שמאלה',
    archetypeOverrides: {
      saas: 'הבא',
      automotive: 'הבא',
      beauty: 'הבא',
      real_estate: 'הבא',
      community: 'הבא',
      legal: 'הבא'
    }
  },
  sec_future_scroll_right: {
    id: 'sec_future_scroll_right',
    areaId: 'area_kosweb_future',
    pageId: 'future_content',
    systemDefault: 'גלול ימינה',
    archetypeOverrides: {
      saas: 'הקודם',
      automotive: 'הקודם',
      beauty: 'הקודם',
      real_estate: 'הקודם',
      community: 'הקודם',
      legal: 'הקודם'
    }
  },
  sec_future_audio_stop: {
    id: 'sec_future_audio_stop',
    areaId: 'area_kosweb_future',
    pageId: 'future_content',
    systemDefault: 'עצור השמעה',
    archetypeOverrides: {
      saas: 'עצור',
      automotive: 'עצור שמע',
      beauty: 'עצור',
      real_estate: 'עצור שמע',
      community: 'עצור',
      legal: 'עצור'
    }
  },
  sec_future_audio_listen: {
    id: 'sec_future_audio_listen',
    areaId: 'area_kosweb_future',
    pageId: 'future_content',
    systemDefault: 'האזן לתקציר',
    archetypeOverrides: {
      saas: 'האזנה',
      automotive: 'שמע פרטים',
      beauty: 'האזנה לטיפול',
      real_estate: 'שמע מפרט',
      community: 'האזנה',
      legal: 'האזנה לתמצית'
    }
  },
  sec_future_read_more: {
    id: 'sec_future_read_more',
    areaId: 'area_kosweb_future',
    pageId: 'future_content',
    systemDefault: 'קרא בהרחבה',
    archetypeOverrides: {
      saas: 'לפרטים נוספים',
      automotive: 'למפרט המלא',
      beauty: 'לפרטים המלאים',
      real_estate: 'לפרטים מלאים',
      community: 'קרא עוד',
      legal: 'לקריאה מעמיקה'
    }
  },
  sec_future_quick_peek: {
    id: 'sec_future_quick_peek',
    areaId: 'area_kosweb_future',
    pageId: 'future_content',
    systemDefault: 'חשיפה מהירה ✦',
    archetypeOverrides: {
      saas: 'תצוגה מקדימה ✦',
      automotive: 'מבט מהיר ✦',
      beauty: 'הצצה לטיפול ✦',
      real_estate: 'הצצה לנכס ✦',
      community: 'מבט מהיר ✦',
      legal: 'תמצית ✦'
    }
  },
  sec_future_view_details: {
    id: 'sec_future_view_details',
    areaId: 'area_kosweb_future',
    pageId: 'future_content',
    systemDefault: 'צפייה בפרטים',
    archetypeOverrides: {
      saas: 'צפייה בפתרון',
      automotive: 'צפייה ברכב',
      beauty: 'צפייה בטיפול',
      real_estate: 'צפייה בנכס',
      community: 'צפייה בפעילות',
      legal: 'צפייה במידע'
    }
  },
  sec_future_expanded_overview: {
    id: 'sec_future_expanded_overview',
    areaId: 'area_kosweb_future',
    pageId: 'future_content',
    systemDefault: 'סקירה מורחבת',
    archetypeOverrides: {
      saas: 'תיעוד מורחב',
      automotive: 'סקירת דגם מלאה',
      beauty: 'פירוט הטיפול',
      real_estate: 'תיק נכס מלא',
      community: 'פירוט הפעילות',
      legal: 'סקירה משפטית'
    }
  },
  sec_future_peek_desc: {
    id: 'sec_future_peek_desc',
    areaId: 'area_kosweb_future',
    pageId: 'future_content',
    systemDefault: 'טכנולוגיית התוכן של 2027 מאפשרת גישה מיידית, חוויית משתמש מרחבית והתאמה אישית מלאה לפי העדפות הצפייה.',
    archetypeOverrides: {
      saas: 'המערכת מעניקה גישה ישירה לפתרונות המובילים בהתאמה אישית לצורכי הארגון שלך.',
      automotive: 'מערכת התצוגה המתקדמת מציגה את מיטב הדגמים, המפרטים והחידושים המוטוריים.',
      beauty: 'עולם של יופי, טיפוח וטכנולוגיות מתקדמות המותאמות בדיוק עבורך.',
      real_estate: 'הצגה מרחבית ומקיפה של נכסים מובילים עם תוכניות מפורטות וסיורים מתקדמים.',
      community: 'מרחב קהילתי עשיר בתכנים, מפגשים והזדמנויות לשיתוף פעולה והתפתחות.',
      legal: 'מענה משפטי מקיף, סקירות עומק וניתוחי פסיקה בהתאמה אישית ומקצועית.'
    }
  },
  sec_future_play_audio: {
    id: 'sec_future_play_audio',
    areaId: 'area_kosweb_future',
    pageId: 'future_content',
    systemDefault: 'השמע תקציר קולי',
    archetypeOverrides: {
      saas: 'האזנה לסקירה',
      automotive: 'השמעת סקירה',
      beauty: 'השמעת טיפים',
      real_estate: 'השמעת מפרט',
      community: 'האזנה',
      legal: 'האזנה לתמצית'
    }
  },
  sec_future_goto_link: {
    id: 'sec_future_goto_link',
    areaId: 'area_kosweb_future',
    pageId: 'future_content',
    systemDefault: 'למעבר לקישור',
    archetypeOverrides: {
      saas: 'כניסה למערכת',
      automotive: 'למעבר לרכב',
      beauty: 'למעבר להזמנה',
      real_estate: 'למעבר לנכס',
      community: 'למעבר לפעילות',
      legal: 'למעבר למאמר'
    }
  }
};

let added = 0;
for (const [key, val] of Object.entries(newTerms)) {
  if (!master.terms[key]) {
    master.terms[key] = val;
    added++;
  }
}

if (master._metadata) {
  master._metadata.lastUpdated = new Date().toISOString();
}
fs.writeFileSync(masterPath, JSON.stringify(master, null, 2), 'utf8');
console.log(`Added ${added} new terms. Total terms now: ${Object.keys(master.terms).length}`);
