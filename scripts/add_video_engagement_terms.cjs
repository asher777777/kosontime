const fs = require('fs');
const path = require('path');

const masterPath = path.join(__dirname, '../KOSUN2026/factory/data/kosun_copy_master.json');
const raw = fs.readFileSync(masterPath, 'utf8');
const data = JSON.parse(raw);

const newTerms = [
  {
    id: "video_engagement_title",
    areaId: "videoEngagement",
    pageId: "global",
    systemDefault: "אינטראקציה, שיתוף ותגובות",
    archetypeOverrides: {
      saas: "אינטראקציה, שיתוף ותגובות",
      automotive: "שיתוף, חוות דעת ודיון רכב",
      beauty: "שיתוף, תגובות ושיח קהילתי",
      real_estate: "תגובות, שיתוף ופרטי נכס",
      community: "שיח קהילתי, תגובות ושיתופים",
      legal: "שיתוף מסמכים, תגובות ועדכונים משפטיים"
    }
  },
  {
    id: "video_engagement_official_video_prefix",
    areaId: "videoEngagement",
    pageId: "global",
    systemDefault: "הסרטון הרשמי של",
    archetypeOverrides: {
      saas: "סרטון ההדרכה הרשמי של",
      automotive: "סקירת הווידאו הרשמית של",
      beauty: "סרטון הטיפוח הרשמי של",
      real_estate: "סיור הווידאו הרשמי של",
      community: "הסרטון הקהילתי של",
      legal: "סקירת הווידאו המשפטית של"
    }
  },
  {
    id: "video_engagement_default_video_title",
    areaId: "videoEngagement",
    pageId: "global",
    systemDefault: "סרטון וידאו",
    archetypeOverrides: {
      saas: "סרטון הדגמת מוצר",
      automotive: "סקירת דגם רכב",
      beauty: "מדריך טיפוח ויופי",
      real_estate: "סיור וירטואלי בנכס",
      community: "סרטון קהילה ואירועים",
      legal: "הסבר משפטי מוקלט"
    }
  },
  {
    id: "video_engagement_guest_author",
    areaId: "videoEngagement",
    pageId: "global",
    systemDefault: "אורח/ת באתר",
    archetypeOverrides: {
      saas: "משתמש/ת במערכת",
      automotive: "מתעניין/ת ברכב",
      beauty: "לקוח/ה יקרה",
      real_estate: "מתעניין/ת בנכס",
      community: "חבר/ת קהילה",
      legal: "פונה/לקוח"
    }
  },
  {
    id: "video_engagement_just_now",
    areaId: "videoEngagement",
    pageId: "global",
    systemDefault: "כרגע",
    archetypeOverrides: {
      saas: "כרגע",
      automotive: "זה עתה",
      beauty: "ממש עכשיו",
      real_estate: "זה עתה",
      community: "זה עתה",
      legal: "כרגע"
    }
  },
  {
    id: "video_engagement_share_prefix",
    areaId: "videoEngagement",
    pageId: "global",
    systemDefault: "שתף ב-",
    archetypeOverrides: {
      saas: "שתף ב-",
      automotive: "שתף רכב ב-",
      beauty: "שתפי ב-",
      real_estate: "שתף נכס ב-",
      community: "שתפו בקהילה ב-",
      legal: "העבר מידע ב-"
    }
  },
  {
    id: "video_engagement_copy_link_title",
    areaId: "videoEngagement",
    pageId: "global",
    systemDefault: "העתק קישור לעמוד",
    archetypeOverrides: {
      saas: "העתק קישור ישיר",
      automotive: "העתק קישור לרכב",
      beauty: "העתיקי קישור לטיפול",
      real_estate: "העתק קישור לתיק הנכס",
      community: "העתק קישור לפעילות",
      legal: "העתק קישור למסמך"
    }
  },
  {
    id: "video_engagement_copied_short",
    areaId: "videoEngagement",
    pageId: "global",
    systemDefault: "הועתק!",
    archetypeOverrides: {
      saas: "הועתק!",
      automotive: "הועתק!",
      beauty: "הועתק!",
      real_estate: "הועתק!",
      community: "הועתק!",
      legal: "הועתק בהצלחה!"
    }
  },
  {
    id: "video_engagement_copy_short",
    areaId: "videoEngagement",
    pageId: "global",
    systemDefault: "העתק",
    archetypeOverrides: {
      saas: "העתק",
      automotive: "העתק",
      beauty: "העתיקי",
      real_estate: "העתק",
      community: "העתק",
      legal: "העתק"
    }
  },
  {
    id: "video_engagement_copied_full",
    areaId: "videoEngagement",
    pageId: "global",
    systemDefault: "הקישור הועתק!",
    archetypeOverrides: {
      saas: "הקישור הועתק ללוח!",
      automotive: "קישור הרכב הועתק!",
      beauty: "הקישור הועתק בהצלחה!",
      real_estate: "קישור הנכס הועתק!",
      community: "קישור הפעילות הועתק!",
      legal: "הקישור הועתק ללוח."
    }
  },
  {
    id: "video_engagement_copy_link_btn",
    areaId: "videoEngagement",
    pageId: "global",
    systemDefault: "העתק קישור",
    archetypeOverrides: {
      saas: "העתק קישור",
      automotive: "העתק קישור רכב",
      beauty: "העתיקי קישור",
      real_estate: "העתק קישור נכס",
      community: "העתק קישור פעילות",
      legal: "העתק קישור"
    }
  },
  {
    id: "video_engagement_verified_views_title",
    areaId: "videoEngagement",
    pageId: "global",
    systemDefault: "סה״כ צפיות מאומתות",
    archetypeOverrides: {
      saas: "צפיות משתמשים מאומתות",
      automotive: "צפיות מתעניינים מאומתות",
      beauty: "צפיות מטופלות מאומתות",
      real_estate: "צפיות רוכשים מאומתות",
      community: "צפיות חברי קהילה",
      legal: "צפיות מאומתות"
    }
  },
  {
    id: "video_engagement_views_unit",
    areaId: "videoEngagement",
    pageId: "global",
    systemDefault: "צפיות",
    archetypeOverrides: {
      saas: "צפיות",
      automotive: "צפיות",
      beauty: "צפיות",
      real_estate: "צפיות",
      community: "צפיות",
      legal: "צפיות"
    }
  },
  {
    id: "video_engagement_like_title",
    areaId: "videoEngagement",
    pageId: "global",
    systemDefault: "אהבתי (לייק)",
    archetypeOverrides: {
      saas: "מועיל / אהבתי",
      automotive: "אהבתי את הרכב",
      beauty: "אהבתי",
      real_estate: "אהבתי את הנכס",
      community: "אהבתי וממליץ",
      legal: "מידע מועיל"
    }
  },
  {
    id: "video_engagement_dislike_title",
    areaId: "videoEngagement",
    pageId: "global",
    systemDefault: "לא אהבתי",
    archetypeOverrides: {
      saas: "פחות מועיל",
      automotive: "לא אהבתי",
      beauty: "פחות מתאים",
      real_estate: "לא מתאים",
      community: "פחות התחברתי",
      legal: "לא רלוונטי"
    }
  },
  {
    id: "video_engagement_open_comments_tooltip",
    areaId: "videoEngagement",
    pageId: "global",
    systemDefault: "לחץ לפתיחת אזור התגובות",
    archetypeOverrides: {
      saas: "פתיחת דיון ותגובות",
      automotive: "שאלות ודיון על הרכב",
      beauty: "פתיחת שאלות ותגובות",
      real_estate: "שאלות ובירורים על הנכס",
      community: "פתיחת שיח קהילתי",
      legal: "שאלות והבהרות"
    }
  },
  {
    id: "video_engagement_comments_unit",
    areaId: "videoEngagement",
    pageId: "global",
    systemDefault: "תגובות",
    archetypeOverrides: {
      saas: "תגובות",
      automotive: "שאלות ותגובות",
      beauty: "תגובות",
      real_estate: "שאלות ותגובות",
      community: "תגובות",
      legal: "תגובות"
    }
  },
  {
    id: "video_engagement_tags_tooltip",
    areaId: "videoEngagement",
    pageId: "global",
    systemDefault: "הצג תוויות ותגיות וידאו",
    archetypeOverrides: {
      saas: "תוויות נושאי וידאו",
      automotive: "קטגוריות ומפרט רכב",
      beauty: "תגיות טיפול ומוצרים",
      real_estate: "מאפייני ותגיות הנכס",
      community: "תחומי עניין ופעילות",
      legal: "תגיות ותחומי התמחות"
    }
  },
  {
    id: "video_engagement_tags_prefix",
    areaId: "videoEngagement",
    pageId: "global",
    systemDefault: "תוויות",
    archetypeOverrides: {
      saas: "נושאים",
      automotive: "מאפיינים",
      beauty: "תגיות",
      real_estate: "מאפיינים",
      community: "תחומי עניין",
      legal: "תגיות"
    }
  },
  {
    id: "video_engagement_share_label",
    areaId: "videoEngagement",
    pageId: "global",
    systemDefault: "שיתוף:",
    archetypeOverrides: {
      saas: "שתף קישור:",
      automotive: "שתף רכב:",
      beauty: "שתפי:",
      real_estate: "שתף נכס:",
      community: "שיתוף בקהילה:",
      legal: "שיתוף מידע:"
    }
  },
  {
    id: "video_engagement_video_tags_label",
    areaId: "videoEngagement",
    pageId: "global",
    systemDefault: "תוויות הסרטון:",
    archetypeOverrides: {
      saas: "נושאי ההדרכה:",
      automotive: "תגיות הרכב והדגם:",
      beauty: "תגיות הטיפול והשירות:",
      real_estate: "מאפייני הנכס והאזור:",
      community: "תגיות המפגש והקהילה:",
      legal: "נושאים משפטיים מקושרים:"
    }
  },
  {
    id: "video_engagement_video_comments_heading",
    areaId: "videoEngagement",
    pageId: "global",
    systemDefault: "תגובות לוידאו",
    archetypeOverrides: {
      saas: "תגובות ומשוב משתמשים",
      automotive: "חוות דעת ושאלות רוכשים",
      beauty: "תגובות לקוחות ומשוב",
      real_estate: "שאלות מתעניינים ובירורים",
      community: "שיח קהילתי ותגובות",
      legal: "שאלות והערות משפטיות"
    }
  },
  {
    id: "video_engagement_collapse_comments_tooltip",
    areaId: "videoEngagement",
    pageId: "global",
    systemDefault: "לחץ לסגירת אזור התגובות",
    archetypeOverrides: {
      saas: "סגירת אזור התגובות",
      automotive: "סגירת שאלות ודיון",
      beauty: "סגירת תגובות",
      real_estate: "סגירת בירורים",
      community: "סגירת שיח קהילתי",
      legal: "סגירת אזור הערות"
    }
  },
  {
    id: "video_engagement_expand_comments_tooltip",
    areaId: "videoEngagement",
    pageId: "global",
    systemDefault: "לחץ להצגת התגובות וכתיבת תגובה חדשה",
    archetypeOverrides: {
      saas: "הצגת תגובות והוספת שאלה",
      automotive: "הצגת שאלות וכתיבת תגובה לרכב",
      beauty: "הצגת שאלות וכתיבת תגובה",
      real_estate: "הצגת בירורים והשארת שאלה לנכס",
      community: "הצטרפות לשיח וכתיבת תגובה",
      legal: "עיון בהערות והוספת פנייה"
    }
  },
  {
    id: "video_engagement_hide_comments_label",
    areaId: "videoEngagement",
    pageId: "global",
    systemDefault: "הסתר תגובות",
    archetypeOverrides: {
      saas: "הסתר תגובות",
      automotive: "הסתר שאלות",
      beauty: "הסתירי תגובות",
      real_estate: "הסתר בירורים",
      community: "הסתר שיח",
      legal: "הסתר הערות"
    }
  },
  {
    id: "video_engagement_show_comments_label",
    areaId: "videoEngagement",
    pageId: "global",
    systemDefault: "הצג תגובות",
    archetypeOverrides: {
      saas: "הצג תגובות",
      automotive: "הצג שאלות",
      beauty: "הציגי תגובות",
      real_estate: "הצג בירורים",
      community: "הצג שיח",
      legal: "הצג הערות"
    }
  },
  {
    id: "video_engagement_name_placeholder",
    areaId: "videoEngagement",
    pageId: "global",
    systemDefault: "השם שלך (אופציונלי)",
    archetypeOverrides: {
      saas: "שם מלא / כינוי (אופציונלי)",
      automotive: "שמך המלא (אופציונלי)",
      beauty: "שמך המלא (אופציונלי)",
      real_estate: "שמך המלא (אופציונלי)",
      community: "שם חבר/ת קהילה (אופציונלי)",
      legal: "שם הפונה (אופציונלי)"
    }
  },
  {
    id: "video_engagement_add_comment_placeholder",
    areaId: "videoEngagement",
    pageId: "global",
    systemDefault: "הוסף תגובה לסרטון...",
    archetypeOverrides: {
      saas: "הוסף שאלה או משוב על המערכת...",
      automotive: "שאל שאלה על הרכב או השאר תגובה...",
      beauty: "כתבי תגובה, שאלה או חוות דעת...",
      real_estate: "שאל שאלה על הנכס או הוסף תגובה...",
      community: "שתפו תובנה או הגיבו לסרטון הקהילתי...",
      legal: "הוסף הערה או בקשת הבהרה משפטית..."
    }
  },
  {
    id: "video_engagement_send_comment_title",
    areaId: "videoEngagement",
    pageId: "global",
    systemDefault: "שלח תגובה",
    archetypeOverrides: {
      saas: "פרסם תגובה",
      automotive: "שלח שאלה",
      beauty: "שלחי תגובה",
      real_estate: "שלח בירור",
      community: "פרסם בקהילה",
      legal: "שליחת פנייה"
    }
  },
  {
    id: "video_engagement_no_comments_yet",
    areaId: "videoEngagement",
    pageId: "global",
    systemDefault: "עדיין אין תגובות לסרטון זה. היו הראשונים להגיב!",
    archetypeOverrides: {
      saas: "עדיין אין שאלות על מדריך זה. היו הראשונים לשאול!",
      automotive: "טרם נכתבו שאלות על רכב זה. היו הראשונים להתעניין!",
      beauty: "עדיין אין תגובות כאן. תהיי הראשונה לשתף חוות דעת!",
      real_estate: "טרם נרשמו בירורים על נכס זה. היו הראשונים לשאול!",
      community: "השיח עדיין לא נפתח. היו הראשונים לפתוח בדיון!",
      legal: "טרם נרשמו פניות בנושא זה. ניתן להשאיר שאלה ראשונית."
    }
  },
  {
    id: "video_engagement_liked_comment_tooltip",
    areaId: "videoEngagement",
    pageId: "global",
    systemDefault: "אהבתי תגובה",
    archetypeOverrides: {
      saas: "תגובה מועילה",
      automotive: "אהבתי תגובה זו",
      beauty: "אהבתי",
      real_estate: "תגובה מועילה",
      community: "מחזק תגובה זו",
      legal: "הערה מועילה"
    }
  }
];

let added = 0;
let updated = 0;

for (const nt of newTerms) {
  if (data.terms[nt.id]) {
    data.terms[nt.id] = { ...data.terms[nt.id], ...nt };
    updated++;
  } else {
    data.terms[nt.id] = nt;
    added++;
  }
}

fs.writeFileSync(masterPath, JSON.stringify(data, null, 2), 'utf8');
console.log(`Finished: ${added} added, ${updated} updated. Total terms: ${Object.keys(data.terms).length}`);
