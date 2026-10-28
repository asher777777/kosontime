const fs = require('fs');
const path = require('path');

const masterPath = path.resolve(__dirname, '../KOSUN2026/factory/data/kosun_copy_master.json');
const master = JSON.parse(fs.readFileSync(masterPath, 'utf8'));

const newTerms = {
  sec_listing_search_placeholder: {
    id: 'sec_listing_search_placeholder',
    areaId: 'area_kosweb_listing',
    pageId: 'catalog',
    systemDefault: 'חיפוש מהיר בתוכן ובארכיונים...',
    archetypeOverrides: {
      saas: 'חיפוש מהיר במאגר הידע והתיעוד...',
      automotive: 'חיפוש מהיר ברכבים, מפרטים ושירותים...',
      beauty: 'חיפוש מהיר בטיפולים, מוצרים וסדנאות...',
      real_estate: 'חיפוש מהיר בנכסים, פרויקטים ומדריכים...',
      community: 'חיפוש מהיר בקהילה, מפגשים ותכנים...',
      legal: 'חיפוש מהיר בפסיקה, מאמרים ותחומי עיסוק...'
    }
  },
  sec_listing_badge_archives: {
    id: 'sec_listing_badge_archives',
    areaId: 'area_kosweb_listing',
    pageId: 'catalog',
    systemDefault: 'ארכיונים ומאגרים',
    archetypeOverrides: {
      saas: 'מאגרי ידע ותיעוד',
      automotive: 'קטלוגים ומאגרי דגמים',
      beauty: 'מאגרי טיפולים וקולקציות',
      real_estate: 'מאגרי נכסים ופרויקטים',
      community: 'ארכיון קהילתי ומפגשים',
      legal: 'מאגר פסקי דין ומאמרים'
    }
  },
  sec_listing_badge_media: {
    id: 'sec_listing_badge_media',
    areaId: 'area_kosweb_listing',
    pageId: 'catalog',
    systemDefault: 'ספריית המדיה',
    archetypeOverrides: {
      saas: 'ספריית מדיה ומדריכים',
      automotive: 'גלריית תצוגה ומדיה',
      beauty: 'גלריית השראה ומדיה',
      real_estate: 'סיורים וגלריית מדיה',
      community: 'אלבומי קהילה ומדיה',
      legal: 'ספריית הרצאות ומדיה'
    }
  },
  sec_listing_badge_featured: {
    id: 'sec_listing_badge_featured',
    areaId: 'area_kosweb_listing',
    pageId: 'catalog',
    systemDefault: '• תוכן מובחר •',
    archetypeOverrides: {
      saas: '• תכנים ומדריכים נבחרים •',
      automotive: '• דגמים נבחרים •',
      beauty: '• טיפולים מובחרים •',
      real_estate: '• נכסים נבחרים •',
      community: '• תכנים מובחרים •',
      legal: '• מאמרי עומק נבחרים •'
    }
  },
  sec_listing_title_archives: {
    id: 'sec_listing_title_archives',
    areaId: 'area_kosweb_listing',
    pageId: 'catalog',
    systemDefault: 'נתיבי הארכיונים והמאגרים',
    archetypeOverrides: {
      saas: 'מאגרי הידע, ה-API והתיעוד הטכנולוגי',
      automotive: 'ארכיון הדגמים, המפרטים והמחירונים',
      beauty: 'ספריית ההדרכות, הטיפולים והפרוטוקולים',
      real_estate: 'ארכיון הנכסים, המפות והתכניות',
      community: 'ארכיון הפעילות, המפגשים והסיכומים',
      legal: 'מאגר מאמרי העומק, העדכונים והפסיקה'
    }
  },
  sec_listing_title_media: {
    id: 'sec_listing_title_media',
    areaId: 'area_kosweb_listing',
    pageId: 'catalog',
    systemDefault: 'ספריית המדיה והקבצים',
    archetypeOverrides: {
      saas: 'מרכז המדיה, הסרטונים וההדרכות',
      automotive: 'אולם התצוגה הדיגיטלי והמדיה',
      beauty: 'ספריית תמונות, הדגמות ומדיה',
      real_estate: 'סיורים וירטואליים ומדיה',
      community: 'אלבומי הקהילה והווידאו',
      legal: 'מדיה, הרצאות וראיונות מקצועיים'
    }
  },
  sec_listing_title_default: {
    id: 'sec_listing_title_default',
    areaId: 'area_kosweb_listing',
    pageId: 'catalog',
    systemDefault: 'מאגר התוכן והמידע',
    archetypeOverrides: {
      saas: 'מאגר המידע והפתרונות',
      automotive: 'מרכז המידע והשירות',
      beauty: 'עולם היופי והתוכן',
      real_estate: 'מאגר הנכסים וההזדמנויות',
      community: 'מרחב התוכן של הקהילה',
      legal: 'מרכז הידע המשפטי'
    }
  },
  sec_listing_sub_archives: {
    id: 'sec_listing_sub_archives',
    areaId: 'area_kosweb_listing',
    pageId: 'catalog',
    systemDefault: 'גישה ישירה ומהירה לכל אזורי הארכיונים, מאגרי המידע והתיעוד',
    archetypeOverrides: {
      saas: 'גישה מיידית לתיעוד המערכת, ה-SDK ומדריכי הפיתוח',
      automotive: 'צפייה מרוכזת בכל קטלוגי הרכב, חוברות המפרט והמחירונים',
      beauty: 'גלו את כל קולקציות הטיפוח, מדריכי הטיפול והחידושים',
      real_estate: 'מאגר מלא של כל הפרויקטים, המפרטים ותוכניות הבנייה',
      community: 'כל היסטוריית הפעילות, התמונות וההקלטות במקום אחד',
      legal: 'סקירות משפטיות, ניתוחי פסיקה ומדריכים מקצועיים למענכם'
    }
  },
  sec_listing_sub_media: {
    id: 'sec_listing_sub_media',
    areaId: 'area_kosweb_listing',
    pageId: 'catalog',
    systemDefault: 'סקירה מקיפה של סרטונים, תמונות, מסמכים וקבצי המערכת',
    archetypeOverrides: {
      saas: 'מדריכי וידאו, וובינרים ומסמכים טכניים',
      automotive: 'סרטוני נהיגה, תמונות סטודיו ומפרטי רכב',
      beauty: 'סרטוני הדרכה, צילומי תוצאות ופרוטוקולים',
      real_estate: 'סיורי וידאו 4K, תמונות רחפן ותוכניות דירה',
      community: 'תיעוד אירועים, הרצאות מוקלטות וזיכרונות קהילה',
      legal: 'הרצאות מוקלטות, ניירות עמדה ומסמכים משפטיים'
    }
  },
  sec_listing_sub_default: {
    id: 'sec_listing_sub_default',
    areaId: 'area_kosweb_listing',
    pageId: 'catalog',
    systemDefault: 'כל התכנים, המאמרים והמדריכים מרוכזים עבורכם במקום אחד.',
    archetypeOverrides: {
      saas: 'כל המדריכים הטכנולוגיים והכלים העדכניים במקום אחד.',
      automotive: 'כל הנתונים, המפרטים וההשוואות המובילות במקום אחד.',
      beauty: 'כל הטיפים, המדריכים וסודות הטיפוח במקום אחד.',
      real_estate: 'כל ההזדמנויות, הסקירות ומגמות הנדל"ן במקום אחד.',
      community: 'כל העדכונים, הסיפורים והפעילויות של הקהילה במקום אחד.',
      legal: 'כל הניתוחים המשפטיים והעדכונים החשובים במקום אחד.'
    }
  },
  sec_listing_cat_videos: {
    id: 'sec_listing_cat_videos',
    areaId: 'area_kosweb_listing',
    pageId: 'catalog',
    systemDefault: 'סרטוני וידאו',
    archetypeOverrides: {
      saas: 'הדרכות וידאו',
      automotive: 'מבחני רכב בווידאו',
      beauty: 'סרטוני טיפול',
      real_estate: 'סיורי וידאו',
      community: 'הקלטות מפגשים',
      legal: 'הרצאות מוקלטות'
    }
  },
  sec_listing_cat_docs: {
    id: 'sec_listing_cat_docs',
    areaId: 'area_kosweb_listing',
    pageId: 'catalog',
    systemDefault: 'מסמכים וארכיונים',
    archetypeOverrides: {
      saas: 'תיעוד ומדריכים',
      automotive: 'מפרטים וקטלוגים',
      beauty: 'פרוטוקולים והסמכות',
      real_estate: 'תוכניות ומפרטים',
      community: 'מסמכי קהילה ונהלים',
      legal: 'ניירות עמדה ומסמכים'
    }
  },
  sec_listing_cat_images: {
    id: 'sec_listing_cat_images',
    areaId: 'area_kosweb_listing',
    pageId: 'catalog',
    systemDefault: 'גלריית תמונות',
    archetypeOverrides: {
      saas: 'צילומי מסך והדגמות',
      automotive: 'גלריית רכבים',
      beauty: 'גלריית תוצאות',
      real_estate: 'גלריית נכסים',
      community: 'אלבומי תמונות',
      legal: 'גלריית הצוות והמשרד'
    }
  },
  sec_listing_item_media_file: {
    id: 'sec_listing_item_media_file',
    areaId: 'area_kosweb_listing',
    pageId: 'catalog',
    systemDefault: 'קובץ מדיה',
    archetypeOverrides: {
      saas: 'קובץ מערכת',
      automotive: 'קובץ קטלוג',
      beauty: 'קובץ הדרכה',
      real_estate: 'קובץ נכס',
      community: 'קובץ קהילה',
      legal: 'קובץ משפטי'
    }
  },
  sec_listing_badge_live_video: {
    id: 'sec_listing_badge_live_video',
    areaId: 'area_kosweb_listing',
    pageId: 'catalog',
    systemDefault: 'וידאו חי',
    archetypeOverrides: {
      saas: 'הדרכה חיה',
      automotive: 'נסיעת מבחן',
      beauty: 'טיפול בשידור',
      real_estate: 'סיור חי',
      community: 'שידור קהילתי',
      legal: 'שידור מקצועי'
    }
  },
  sec_listing_badge_doc: {
    id: 'sec_listing_badge_doc',
    areaId: 'area_kosweb_listing',
    pageId: 'catalog',
    systemDefault: 'מסמך',
    archetypeOverrides: {
      saas: 'מדריך טכני',
      automotive: 'מפרט טכני',
      beauty: 'מדריך טיפוח',
      real_estate: 'מפרט דירה',
      community: 'עלון קהילתי',
      legal: 'מסמך משפטי'
    }
  },
  sec_listing_badge_media_single: {
    id: 'sec_listing_badge_media_single',
    areaId: 'area_kosweb_listing',
    pageId: 'catalog',
    systemDefault: 'מדיה',
    archetypeOverrides: {
      saas: 'מדיה דיגיטלית',
      automotive: 'מדיה מוטורית',
      beauty: 'מדיה ויזואלית',
      real_estate: 'מדיה אדריכלית',
      community: 'מדיה קהילתית',
      legal: 'מדיה מקצועית'
    }
  },
  sec_listing_active_archive: {
    id: 'sec_listing_active_archive',
    areaId: 'area_kosweb_listing',
    pageId: 'catalog',
    systemDefault: 'ארכיון פעיל',
    archetypeOverrides: {
      saas: 'מאגר פעיל',
      automotive: 'קטלוג עדכני',
      beauty: 'ספרייה מעודכנת',
      real_estate: 'מאגר זמין',
      community: 'מרחב פעיל',
      legal: 'מאגר מעודכן'
    }
  },
  sec_listing_active_page: {
    id: 'sec_listing_active_page',
    areaId: 'area_kosweb_listing',
    pageId: 'catalog',
    systemDefault: 'עמוד פעיל',
    archetypeOverrides: {
      saas: 'עמוד מערכת',
      automotive: 'עמוד דגם',
      beauty: 'עמוד שירות',
      real_estate: 'עמוד פרויקט',
      community: 'עמוד קהילתי',
      legal: 'עמוד תחום'
    }
  },
  sec_listing_content_articles: {
    id: 'sec_listing_content_articles',
    areaId: 'area_kosweb_listing',
    pageId: 'catalog',
    systemDefault: 'תוכן ומאמרים',
    archetypeOverrides: {
      saas: 'מדריכים ומאמרי פיתוח',
      automotive: 'חדשות ומבחני רכב',
      beauty: 'טיפים ומאמרי טיפוח',
      real_estate: 'סקירות שוק ומדריכים',
      community: 'טורים וסיפורי קהילה',
      legal: 'מאמרים וניתוחי פסיקה'
    }
  },
  sec_listing_flagship_product: {
    id: 'sec_listing_flagship_product',
    areaId: 'area_kosweb_listing',
    pageId: 'catalog',
    systemDefault: 'מוצר דגל',
    archetypeOverrides: {
      saas: 'מודול פרימיום',
      automotive: 'דגם הדגל',
      beauty: 'טיפול החתימה',
      real_estate: 'נכס הדגל',
      community: 'תכנית הדגל',
      legal: 'שירות פרימיום'
    }
  },
  sec_listing_products_services: {
    id: 'sec_listing_products_services',
    areaId: 'area_kosweb_listing',
    pageId: 'catalog',
    systemDefault: 'מוצרי דגל ושירותים',
    archetypeOverrides: {
      saas: 'פתרונות ומודולים',
      automotive: 'דגמים ושירותים',
      beauty: 'טיפולים ומוצרים',
      real_estate: 'פרויקטים ושירותים',
      community: 'תכניות ופעילויות',
      legal: 'תחומי התמחות'
    }
  },
  sec_listing_core_service: {
    id: 'sec_listing_core_service',
    areaId: 'area_kosweb_listing',
    pageId: 'catalog',
    systemDefault: 'שירות ליבה',
    archetypeOverrides: {
      saas: 'שירות פרימיום',
      automotive: 'חבילת שירות',
      beauty: 'שירות יופי',
      real_estate: 'שירות ליווי',
      community: 'שירות חברים',
      legal: 'ייעוץ מומחה'
    }
  },
  sec_listing_sort_title: {
    id: 'sec_listing_sort_title',
    areaId: 'area_kosweb_listing',
    pageId: 'catalog',
    systemDefault: 'סידור פריטים',
    archetypeOverrides: {
      saas: 'סידור רשימה',
      automotive: 'מיון דגמים',
      beauty: 'מיון טיפולים',
      real_estate: 'מיון נכסים',
      community: 'מיון פעילויות',
      legal: 'מיון מאמרים'
    }
  },
  sec_listing_sort_date_desc: {
    id: 'sec_listing_sort_date_desc',
    areaId: 'area_kosweb_listing',
    pageId: 'catalog',
    systemDefault: 'תאריך: מהחדש לישן',
    archetypeOverrides: {
      saas: 'תאריך עדכון (מהחדש)',
      automotive: 'שנתון/תאריך (מהחדש)',
      beauty: 'תאריך השקה (מהחדש)',
      real_estate: 'תאריך פרסום (מהחדש)',
      community: 'תאריך מפגש (מהקרוב)',
      legal: 'תאריך פסיקה (מהחדש)'
    }
  },
  sec_listing_sort_date_asc: {
    id: 'sec_listing_sort_date_asc',
    areaId: 'area_kosweb_listing',
    pageId: 'catalog',
    systemDefault: 'תאריך: מהישן לחדש',
    archetypeOverrides: {
      saas: 'תאריך עדכון (מהישן)',
      automotive: 'שנתון/תאריך (מהישן)',
      beauty: 'תאריך השקה (מהישן)',
      real_estate: 'תאריך פרסום (מהישן)',
      community: 'תאריך מפגש (מהרחוק)',
      legal: 'תאריך פסיקה (מהישן)'
    }
  },
  sec_listing_sort_title_asc: {
    id: 'sec_listing_sort_title_asc',
    areaId: 'area_kosweb_listing',
    pageId: 'catalog',
    systemDefault: "שם: א' עד ת'",
    archetypeOverrides: {
      saas: "שם מוצר (א'-ת')",
      automotive: "דגם (א'-ת')",
      beauty: "שם טיפול (א'-ת')",
      real_estate: "שם פרויקט (א'-ת')",
      community: "כותרת (א'-ת')",
      legal: "נושא (א'-ת')"
    }
  },
  sec_listing_sort_title_desc: {
    id: 'sec_listing_sort_title_desc',
    areaId: 'area_kosweb_listing',
    pageId: 'catalog',
    systemDefault: "שם: ת' עד א'",
    archetypeOverrides: {
      saas: "שם מוצר (ת'-א')",
      automotive: "דגם (ת'-א')",
      beauty: "שם טיפול (ת'-א')",
      real_estate: "שם פרויקט (ת'-א')",
      community: "כותרת (ת'-א')",
      legal: "נושא (ת'-א')"
    }
  },
  sec_listing_sort_manual: {
    id: 'sec_listing_sort_manual',
    areaId: 'area_kosweb_listing',
    pageId: 'catalog',
    systemDefault: 'סדר ברירת מחדל',
    archetypeOverrides: {
      saas: 'סדר מומלץ',
      automotive: 'סדר מומלץ',
      beauty: 'סדר פופולרי',
      real_estate: 'סדר מומלץ',
      community: 'סדר מומלץ',
      legal: 'סדר חשיבות'
    }
  },
  sec_listing_empty_title: {
    id: 'sec_listing_empty_title',
    areaId: 'area_kosweb_listing',
    pageId: 'catalog',
    systemDefault: 'לא נמצאו פריטים תואמים',
    archetypeOverrides: {
      saas: 'לא נמצאו פתרונות תואמים',
      automotive: 'לא נמצאו רכבים תואמים',
      beauty: 'לא נמצאו טיפולים תואמים',
      real_estate: 'לא נמצאו נכסים תואמים',
      community: 'לא נמצאו פעילויות תואמות',
      legal: 'לא נמצאו מאמרים תואמים'
    }
  },
  sec_listing_empty_desc: {
    id: 'sec_listing_empty_desc',
    areaId: 'area_kosweb_listing',
    pageId: 'catalog',
    systemDefault: 'נסה לשנות את מונח החיפוש או לבחור קטגוריה אחרת.',
    archetypeOverrides: {
      saas: 'נסה להרחיב את החיפוש או לבחור מודול אחר.',
      automotive: 'נסה לשנות את הסינון או לחפש דגם אחר.',
      beauty: 'נסה לבחור קטגוריית טיפולים שונה.',
      real_estate: 'נסה לשנות את טווח החיפוש או לבחור אזור אחר.',
      community: 'נסה לחפש נושא אחר או לבחור קטגוריה שונה.',
      legal: 'נסה לחפש מילות מפתח אחרות או לבחור תחום משפטי שונה.'
    }
  },
  sec_listing_btn_read_more: {
    id: 'sec_listing_btn_read_more',
    areaId: 'area_kosweb_listing',
    pageId: 'catalog',
    systemDefault: 'קרא עוד וצפה בפרטים',
    archetypeOverrides: {
      saas: 'למידע טכני נוסף',
      automotive: 'למפרט המלא של הרכב',
      beauty: 'לפרטי הטיפול והזמנה',
      real_estate: 'לצפייה בתוכניות הנכס',
      community: 'לפרטי המפגש והרשמה',
      legal: 'לקריאת המאמר המלא'
    }
  },
  sec_listing_btn_full_details: {
    id: 'sec_listing_btn_full_details',
    areaId: 'area_kosweb_listing',
    pageId: 'catalog',
    systemDefault: 'לפרטים המלאים',
    archetypeOverrides: {
      saas: 'למפרט המלא',
      automotive: 'למפרט הרכב',
      beauty: 'למידע המלא',
      real_estate: 'לפרטי הנכס',
      community: 'לכל הפרטים',
      legal: 'לעיון מלא'
    }
  },
  sec_listing_btn_view_info: {
    id: 'sec_listing_btn_view_info',
    areaId: 'area_kosweb_listing',
    pageId: 'catalog',
    systemDefault: 'צפייה במידע המלא',
    archetypeOverrides: {
      saas: 'צפייה בתיעוד המלא',
      automotive: 'צפייה במפרט ובגלריה',
      beauty: 'צפייה בפרטי הטיפול',
      real_estate: 'צפייה בפרטי הפרויקט',
      community: 'צפייה בפרטי הפעילות',
      legal: 'צפייה בניתוח המשפטי'
    }
  },
  sec_listing_btn_view_details: {
    id: 'sec_listing_btn_view_details',
    areaId: 'area_kosweb_listing',
    pageId: 'catalog',
    systemDefault: 'צפייה בפרטים',
    archetypeOverrides: {
      saas: 'צפייה בפתרון',
      automotive: 'צפייה ברכב',
      beauty: 'צפייה בטיפול',
      real_estate: 'צפייה בנכס',
      community: 'צפייה במפגש',
      legal: 'צפייה בתיק / מאמר'
    }
  },
  sec_listing_modal_goto_page: {
    id: 'sec_listing_modal_goto_page',
    areaId: 'area_kosweb_listing',
    pageId: 'catalog',
    systemDefault: 'מעבר לעמוד המלא',
    archetypeOverrides: {
      saas: 'מעבר לתיעוד המלא',
      automotive: 'מעבר לעמוד הדגם',
      beauty: 'מעבר לעמוד הטיפול',
      real_estate: 'מעבר לעמוד הנכס',
      community: 'מעבר לעמוד הפעילות',
      legal: 'מעבר למאמר המלא'
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
