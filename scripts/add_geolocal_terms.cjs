const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'KOSUN2026', 'factory', 'data', 'kosun_copy_master.json');
const master = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const geoTerms = {
  sec_geolocal_branch_lbl: {
    id: "sec_geolocal_branch_lbl",
    areaId: "area_kosweb_geo",
    pageId: "global",
    systemDefault: "סניף מקומי",
    archetypeOverrides: {
      saas: "מרכז תמיכה ופיתוח",
      automotive: "אולם תצוגה מורשה",
      beauty: "קליניקת בוטיק",
      real_estate: "משרד מכירות אזורי",
      community: "סניף קהילתי",
      legal: "סניף הפירמה"
    }
  },
  sec_geolocal_service_areas_lbl: {
    id: "sec_geolocal_service_areas_lbl",
    areaId: "area_kosweb_geo",
    pageId: "global",
    systemDefault: "אזורי שירות מורשים:",
    archetypeOverrides: {
      saas: "אזורי פריסה ותמיכה:",
      automotive: "אזורי שירות ונסיעות מבחן:",
      beauty: "אזורי קבלת קהל:",
      real_estate: "אזורי פרויקטים ושיווק:",
      community: "אזורי פעילות הקהילה:",
      legal: "תחומי שיפוט וייצוג:"
    }
  },
  sec_geolocal_hours_lbl: {
    id: "sec_geolocal_hours_lbl",
    areaId: "area_kosweb_geo",
    pageId: "global",
    systemDefault: "שעות פעילות וקבלת קהל:",
    archetypeOverrides: {
      saas: "שעות פעילות מוקד התמיכה:",
      automotive: "שעות פתיחת אולם התצוגה:",
      beauty: "שעות קבלת טיפולים:",
      real_estate: "שעות פעילות משרד המכירות:",
      community: "שעות פתיחת המרכז הקהילתי:",
      legal: "שעות קבלת קהל במשרד:"
    }
  },
  sec_geolocal_wa_btn: {
    id: "sec_geolocal_wa_btn",
    areaId: "area_kosweb_geo",
    pageId: "global",
    systemDefault: "שיחה בוואטסאפ",
    archetypeOverrides: {
      saas: "צ'אט מהיר עם המוקד",
      automotive: "וואטסאפ אולם התצוגה",
      beauty: "וואטסאפ לתיאום תור",
      real_estate: "וואטסאפ יועץ נדל\"ן",
      community: "וואטסאפ הקהילה",
      legal: "פנייה מהירה בוואטסאפ"
    }
  },
  sec_geolocal_call_btn: {
    id: "sec_geolocal_call_btn",
    areaId: "area_kosweb_geo",
    pageId: "global",
    systemDefault: "חיוג לסניף",
    archetypeOverrides: {
      saas: "חיוג למוקד",
      automotive: "חיוג לאולם",
      beauty: "חיוג לקליניקה",
      real_estate: "חיוג למשרד המכירות",
      community: "חיוג למזכירות",
      legal: "חיוג למשרד"
    }
  }
};

Object.assign(master.terms, geoTerms);
master._metadata.totalTerms = Object.keys(master.terms).length;
master._metadata.lastUpdated = new Date().toISOString();

fs.writeFileSync(filePath, JSON.stringify(master, null, 2), 'utf8');
console.log('Added GeoLocal terms. Total terms:', master._metadata.totalTerms);
