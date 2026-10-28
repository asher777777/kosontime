const fs = require('fs');
const path = require('path');

const masterPath = path.resolve(__dirname, '../KOSUN2026/factory/data/kosun_copy_master.json');
const master = JSON.parse(fs.readFileSync(masterPath, 'utf8'));

const newTerms = {
  sec_vid_gallery_title_default: {
    id: 'sec_vid_gallery_title_default',
    areaId: 'area_kosweb_media',
    pageId: 'video_gallery',
    systemDefault: 'ספריית הוידאו והתוכן',
    archetypeOverrides: {
      saas: 'מרכז הדרכות הוידאו וה-Demo',
      automotive: 'אולם תצוגת הוידאו של הרכבים',
      beauty: 'גלריית הטיפולים וההדרכות',
      real_estate: 'סיורי וידאו בנכסים ובפרויקטים',
      community: 'ערוץ הוידאו של הקהילה',
      legal: 'הרצאות, ראיונות וסקירות משפטיות'
    }
  },
  sec_vid_gallery_desc_default: {
    id: 'sec_vid_gallery_desc_default',
    areaId: 'area_kosweb_media',
    pageId: 'video_gallery',
    systemDefault: 'סרטונים, הדרכות ותוכן בלעדי',
    archetypeOverrides: {
      saas: 'סרטוני הדרכה, וובינרים ומדריכי פיתוח',
      automotive: 'נסיעות מבחן, סקירות רכב והשקות',
      beauty: 'סרטוני טיפוח, פרוטוקולים והדגמות',
      real_estate: 'סיורי 4K, תצלומי רחפן ותוכניות',
      community: 'הקלטות מפגשים, אירועים ותכנים',
      legal: 'סרטוני עומק, כנסים ופאנלים מקצועיים'
    }
  },
  sec_vid_gallery_badge_default: {
    id: 'sec_vid_gallery_badge_default',
    areaId: 'area_kosweb_media',
    pageId: 'video_gallery',
    systemDefault: '• ספריית וידאו חכמה •',
    archetypeOverrides: {
      saas: '• ערוץ הווידאו וההדרכות •',
      automotive: '• גלריית הדגמים בווידאו •',
      beauty: '• עולם הטיפוח בווידאו •',
      real_estate: '• סיורי וידאו מובחרים •',
      community: '• שידורי הקהילה •',
      legal: '• סקירות מקצועיות •'
    }
  },
  sec_vid_gallery_cta_default: {
    id: 'sec_vid_gallery_cta_default',
    areaId: 'area_kosweb_media',
    pageId: 'video_gallery',
    systemDefault: 'לכל סרטוני הערוץ',
    archetypeOverrides: {
      saas: 'לכל מדריכי הווידאו',
      automotive: 'לכל מבחני הרכב',
      beauty: 'לכל סרטוני הטיפוח',
      real_estate: 'לכל סיורי הווידאו',
      community: 'לכל הקלטות הקהילה',
      legal: 'לכל ההרצאות המצולמות'
    }
  },
  sec_vid_gallery_item_video: {
    id: 'sec_vid_gallery_item_video',
    areaId: 'area_kosweb_media',
    pageId: 'video_gallery',
    systemDefault: 'סרטון וידאו',
    archetypeOverrides: {
      saas: 'סרטון הדרכה',
      automotive: 'סרטון רכב',
      beauty: 'סרטון טיפול',
      real_estate: 'סיור וידאו',
      community: 'סרטון קהילה',
      legal: 'סרטון מקצועי'
    }
  },
  sec_vid_gallery_cat_video: {
    id: 'sec_vid_gallery_cat_video',
    areaId: 'area_kosweb_media',
    pageId: 'video_gallery',
    systemDefault: 'וידאו',
    archetypeOverrides: {
      saas: 'הדרכה',
      automotive: 'מבחן רכב',
      beauty: 'טיפול',
      real_estate: 'סיור',
      community: 'שידור',
      legal: 'הרצאה'
    }
  },
  sec_vid_gallery_channel_video: {
    id: 'sec_vid_gallery_channel_video',
    areaId: 'area_kosweb_media',
    pageId: 'video_gallery',
    systemDefault: 'סרטון ערוץ',
    archetypeOverrides: {
      saas: 'סרטון מערכת',
      automotive: 'סרטון דגם',
      beauty: 'סרטון קליניקה',
      real_estate: 'סרטון נכס',
      community: 'סרטון קהילתי',
      legal: 'סרטון משפטי'
    }
  },
  sec_vid_gallery_quick_play_hint: {
    id: 'sec_vid_gallery_quick_play_hint',
    areaId: 'area_kosweb_media',
    pageId: 'video_gallery',
    systemDefault: 'נגן ראשי • לחצו להפעלה מהירה',
    archetypeOverrides: {
      saas: 'צפייה ישירה בהדגמה',
      automotive: 'הפעלת מבחן הרכב',
      beauty: 'צפייה בטיפול',
      real_estate: 'הפעלת סיור וירטואלי',
      community: 'צפייה בשידור',
      legal: 'הפעלת ההרצאה'
    }
  },
  sec_vid_gallery_watch_full: {
    id: 'sec_vid_gallery_watch_full',
    areaId: 'area_kosweb_media',
    pageId: 'video_gallery',
    systemDefault: 'לצפייה בסרטון המלא',
    archetypeOverrides: {
      saas: 'לצפייה בהדרכה המלאה',
      automotive: 'למבחן המלא של הרכב',
      beauty: 'לצפייה בטיפול המלא',
      real_estate: 'לסיור המלא בנכס',
      community: 'לצפייה במפגש המלא',
      legal: 'לצפייה בהרצאה המלאה'
    }
  },
  sec_vid_gallery_mode_spotlight: {
    id: 'sec_vid_gallery_mode_spotlight',
    areaId: 'area_kosweb_media',
    pageId: 'video_gallery',
    systemDefault: 'וידאו מרכזי וכרטיסים',
    archetypeOverrides: {
      saas: 'תצוגת זרקור וכרטיסים',
      automotive: 'דגם נבחר וגלריה',
      beauty: 'טיפול מרכזי וסדרות',
      real_estate: 'נכס נבחר וכרטיסים',
      community: 'שידור מרכזי וארכיון',
      legal: 'הרצאה נבחרת וסקירות'
    }
  },
  sec_vid_gallery_mode_list: {
    id: 'sec_vid_gallery_mode_list',
    areaId: 'area_kosweb_media',
    pageId: 'video_gallery',
    systemDefault: 'רשימה עשירה',
    archetypeOverrides: {
      saas: 'רשימת הדרכות',
      automotive: 'קטלוג רכבים',
      beauty: 'רשימת טיפולים',
      real_estate: 'רשימת נכסים',
      community: 'רשימת מפגשים',
      legal: 'רשימת הרצאות'
    }
  },
  sec_vid_gallery_mode_scroll: {
    id: 'sec_vid_gallery_mode_scroll',
    areaId: 'area_kosweb_media',
    pageId: 'video_gallery',
    systemDefault: 'גלריה אופקית',
    archetypeOverrides: {
      saas: 'פס הדרכות',
      automotive: 'פס דגמים',
      beauty: 'פס השראה',
      real_estate: 'פס סיורים',
      community: 'פס שידורים',
      legal: 'פס הרצאות'
    }
  },
  sec_vid_gallery_views: {
    id: 'sec_vid_gallery_views',
    areaId: 'area_kosweb_media',
    pageId: 'video_gallery',
    systemDefault: 'צפיות',
    archetypeOverrides: {
      saas: 'צפיות',
      automotive: 'מתעניינים',
      beauty: 'צפיות',
      real_estate: 'צפיות',
      community: 'חברים צפו',
      legal: 'צפיות'
    }
  },
  sec_vid_gallery_watch_video: {
    id: 'sec_vid_gallery_watch_video',
    areaId: 'area_kosweb_media',
    pageId: 'video_gallery',
    systemDefault: 'לצפייה בסרטון',
    archetypeOverrides: {
      saas: 'צפייה בהדרכה',
      automotive: 'צפייה ברכב',
      beauty: 'צפייה בטיפול',
      real_estate: 'צפייה בסיור',
      community: 'צפייה במפגש',
      legal: 'צפייה בהרצאה'
    }
  },
  sec_vid_gallery_full_page: {
    id: 'sec_vid_gallery_full_page',
    areaId: 'area_kosweb_media',
    pageId: 'video_gallery',
    systemDefault: 'עמוד מלא',
    archetypeOverrides: {
      saas: 'לעמוד המודול',
      automotive: 'לעמוד הרכב',
      beauty: 'לעמוד הטיפול',
      real_estate: 'לעמוד הנכס',
      community: 'לעמוד המפגש',
      legal: 'לעמוד ההרצאה'
    }
  },
  sec_vid_gallery_duration: {
    id: 'sec_vid_gallery_duration',
    areaId: 'area_kosweb_media',
    pageId: 'video_gallery',
    systemDefault: 'משך',
    archetypeOverrides: {
      saas: 'אורך',
      automotive: 'אורך סרטון',
      beauty: 'משך הדרכה',
      real_estate: 'משך סיור',
      community: 'משך שידור',
      legal: 'אורך הרצאה'
    }
  },
  sec_vid_gallery_play_video: {
    id: 'sec_vid_gallery_play_video',
    areaId: 'area_kosweb_media',
    pageId: 'video_gallery',
    systemDefault: 'נגן סרטון',
    archetypeOverrides: {
      saas: 'הפעל הדרכה',
      automotive: 'הפעל וידאו',
      beauty: 'הפעל סרטון',
      real_estate: 'הפעל סיור',
      community: 'הפעל שידור',
      legal: 'הפעל הרצאה'
    }
  },
  sec_vid_gallery_goto_video_page: {
    id: 'sec_vid_gallery_goto_video_page',
    areaId: 'area_kosweb_media',
    pageId: 'video_gallery',
    systemDefault: 'לעמוד הסרטון המלא',
    archetypeOverrides: {
      saas: 'לדף ההדרכה המלא',
      automotive: 'לדף הרכב המלא',
      beauty: 'לדף הטיפול המלא',
      real_estate: 'לדף הנכס המלא',
      community: 'לדף המפגש המלא',
      legal: 'לדף ההרצאה המלא'
    }
  },
  sec_vid_gallery_scroll_right: {
    id: 'sec_vid_gallery_scroll_right',
    areaId: 'area_kosweb_media',
    pageId: 'video_gallery',
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
  sec_vid_gallery_scroll_left: {
    id: 'sec_vid_gallery_scroll_left',
    areaId: 'area_kosweb_media',
    pageId: 'video_gallery',
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
  sec_vid_gallery_play_action: {
    id: 'sec_vid_gallery_play_action',
    areaId: 'area_kosweb_media',
    pageId: 'video_gallery',
    systemDefault: 'הפעל וידאו',
    archetypeOverrides: {
      saas: 'צפה בהדרכה',
      automotive: 'צפה ברכב',
      beauty: 'צפה בטיפול',
      real_estate: 'צפה בסיור',
      community: 'צפה בשידור',
      legal: 'צפה בהרצאה'
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
