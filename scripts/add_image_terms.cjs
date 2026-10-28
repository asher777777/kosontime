const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'KOSUN2026', 'factory', 'data', 'kosun_copy_master.json');
const master = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const imageTerms = {
  sec_image_listing_title: {
    id: "sec_image_listing_title",
    areaId: "area_image_listing",
    pageId: "global",
    systemDefault: "גלריית תמונות מהאירועים והעשייה שלנו",
    archetypeOverrides: {
      saas: "מבט על המוצר והממשק",
      automotive: "גלריית דגמים ומבט 360",
      beauty: "גלריית תוצאות וטיפולים",
      real_estate: "גלריית פרויקטים והדמיות",
      community: "רגעים מיוחדים מהקהילה",
      legal: "פעילות הפירמה ומפגשים"
    }
  },
  sec_image_listing_cta: {
    id: "sec_image_listing_cta",
    areaId: "area_image_listing",
    pageId: "global",
    systemDefault: "לכל התמונות והפרויקטים",
    archetypeOverrides: {
      saas: "לכל צילומי המסך והממשק",
      automotive: "לכל הגלריות והמפרטים",
      beauty: "לכל גלריית הטיפולים",
      real_estate: "לכל הדמיות הפרויקטים",
      community: "לכל אלבומי הקהילה",
      legal: "לכל אירועי הפירמה"
    }
  },
  sec_image_total_items: {
    id: "sec_image_total_items",
    areaId: "area_image_listing",
    pageId: "global",
    systemDefault: "סה״כ פריטים:",
    archetypeOverrides: {
      saas: "סה״כ צילומים:",
      automotive: "סה״כ תמונות:",
      beauty: "סה״כ תוצאות:",
      real_estate: "סה״כ הדמיות:",
      community: "סה״כ תמונות:",
      legal: "סה״כ תמונות:"
    }
  },
  sec_image_display_mode: {
    id: "sec_image_display_mode",
    areaId: "area_image_listing",
    pageId: "global",
    systemDefault: "תצוגה:",
    archetypeOverrides: {
      saas: "פריסה:",
      automotive: "תצוגה:",
      beauty: "תצוגה:",
      real_estate: "פריסה:",
      community: "תצוגה:",
      legal: "תצוגה:"
    }
  },
  sec_image_per_row: {
    id: "sec_image_per_row",
    areaId: "area_image_listing",
    pageId: "global",
    systemDefault: "בעמודה",
    archetypeOverrides: {
      saas: "בשורה",
      automotive: "בשורה",
      beauty: "בשורה",
      real_estate: "בשורה",
      community: "בשורה",
      legal: "בשורה"
    }
  },
  sec_image_verified: {
    id: "sec_image_verified",
    areaId: "area_image_listing",
    pageId: "global",
    systemDefault: "פרויקט מאומת",
    archetypeOverrides: {
      saas: "ממשק מאומת",
      automotive: "דגם רשמי",
      beauty: "תוצאה מאומתת",
      real_estate: "פרויקט מאומת",
      community: "אירוע מאומת",
      legal: "תיעוד רשמי"
    }
  },
  sec_image_view_source: {
    id: "sec_image_view_source",
    areaId: "area_image_listing",
    pageId: "global",
    systemDefault: "צפה במקור",
    archetypeOverrides: {
      saas: "הגדלת תמונה",
      automotive: "צפייה באיכות מלאה",
      beauty: "הגדלת תמונה",
      real_estate: "צפייה בהדמיה מלאה",
      community: "צפייה בתמונה מלאה",
      legal: "הגדלה"
    }
  },
  sec_image_prev: {
    id: "sec_image_prev",
    areaId: "area_image_listing",
    pageId: "global",
    systemDefault: "הקודם",
    archetypeOverrides: {
      saas: "הקודם",
      automotive: "תמונה קודמת",
      beauty: "הקודם",
      real_estate: "הקודם",
      community: "הקודם",
      legal: "הקודם"
    }
  },
  sec_image_next: {
    id: "sec_image_next",
    areaId: "area_image_listing",
    pageId: "global",
    systemDefault: "הבא",
    archetypeOverrides: {
      saas: "הבא",
      automotive: "תמונה הבאה",
      beauty: "הבא",
      real_estate: "הבא",
      community: "הבא",
      legal: "הבא"
    }
  },
  sec_image_go_to_slide: {
    id: "sec_image_go_to_slide",
    areaId: "area_image_listing",
    pageId: "global",
    systemDefault: "עבור לתמונה",
    archetypeOverrides: {
      saas: "מעבר לשקופית",
      automotive: "מעבר לתמונה",
      beauty: "מעבר לתמונה",
      real_estate: "מעבר להדמיה",
      community: "מעבר לתמונה",
      legal: "מעבר לתמונה"
    }
  },
  sec_image_close: {
    id: "sec_image_close",
    areaId: "area_image_listing",
    pageId: "global",
    systemDefault: "סגור (Esc)",
    archetypeOverrides: {
      saas: "סגירה",
      automotive: "סגירה",
      beauty: "סגירה",
      real_estate: "סגירה",
      community: "סגירה",
      legal: "סגירה"
    }
  }
};

Object.assign(master.terms, imageTerms);
master._metadata.totalTerms = Object.keys(master.terms).length;
master._metadata.lastUpdated = new Date().toISOString();

fs.writeFileSync(filePath, JSON.stringify(master, null, 2), 'utf8');
console.log('Added ImageListing terms. Total terms:', master._metadata.totalTerms);
