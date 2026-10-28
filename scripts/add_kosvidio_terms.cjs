const fs = require('fs');
const path = require('path');

const masterPath = path.resolve(__dirname, '../KOSUN2026/factory/data/kosun_copy_master.json');
const master = JSON.parse(fs.readFileSync(masterPath, 'utf8'));

const newTerms = {
  sec_kosvidio_badge_feminine: {
    id: 'sec_kosvidio_badge_feminine',
    areaId: 'area_kosweb_media',
    pageId: 'video',
    systemDefault: 'תוכן וידאו בלעדי ומעמיק',
    archetypeOverrides: {
      saas: 'הדגמת וידאו מעמיקה',
      automotive: 'מבחן וידאו בלעדי',
      beauty: 'מדריך וידאו בלעדי',
      real_estate: 'סיור וידאו אקסקלוסיבי',
      community: 'שידור בלעדי לחברי הקהילה',
      legal: 'סקירת וידאו מקצועית'
    }
  },
  sec_kosvidio_badge_spiritual: {
    id: 'sec_kosvidio_badge_spiritual',
    areaId: 'area_kosweb_media',
    pageId: 'video',
    systemDefault: 'חוויית צפייה והתבוננות',
    archetypeOverrides: {
      saas: 'צפייה מודרכת במערכת',
      automotive: 'מבט מקרוב על הרכב',
      beauty: 'חוויית יופי והשראה',
      real_estate: 'מבט מקיף על הנכס',
      community: 'רגעים מיוחדים בקהילה',
      legal: 'ניתוח והעמקה מקצועית'
    }
  },
  sec_kosvidio_theater_exit_tip: {
    id: 'sec_kosvidio_theater_exit_tip',
    areaId: 'area_kosweb_media',
    pageId: 'video',
    systemDefault: 'חזרה למצב רגיל',
    archetypeOverrides: {
      saas: 'יציאה ממצב מסך מלא',
      automotive: 'חזרה לתצוגה רגילה',
      beauty: 'חזרה למצב רגיל',
      real_estate: 'חזרה לתצוגה רגילה',
      community: 'חזרה למצב רגיל',
      legal: 'חזרה למצב רגיל'
    }
  },
  sec_kosvidio_theater_enter_tip: {
    id: 'sec_kosvidio_theater_enter_tip',
    areaId: 'area_kosweb_media',
    pageId: 'video',
    systemDefault: 'מצב קולנוע רחב',
    archetypeOverrides: {
      saas: 'מצב מסך רחב',
      automotive: 'מצב אולם תצוגה רחב',
      beauty: 'מצב קולנוע',
      real_estate: 'סיור במסך רחב',
      community: 'מצב צפייה קהילתי',
      legal: 'תצוגה רחבה'
    }
  },
  sec_kosvidio_theater_exit: {
    id: 'sec_kosvidio_theater_exit',
    areaId: 'area_kosweb_media',
    pageId: 'video',
    systemDefault: 'מצב רגיל',
    archetypeOverrides: {
      saas: 'תצוגה רגילה',
      automotive: 'תצוגה רגילה',
      beauty: 'תצוגה רגילה',
      real_estate: 'תצוגה רגילה',
      community: 'תצוגה רגילה',
      legal: 'תצוגה רגילה'
    }
  },
  sec_kosvidio_theater_enter: {
    id: 'sec_kosvidio_theater_enter',
    areaId: 'area_kosweb_media',
    pageId: 'video',
    systemDefault: 'מצב קולנוע',
    archetypeOverrides: {
      saas: 'מסך רחב',
      automotive: 'אולם תצוגה',
      beauty: 'קולנוע',
      real_estate: 'מסך רחב',
      community: 'מסך רחב',
      legal: 'מסך רחב'
    }
  },
  sec_kosvidio_shield_title: {
    id: 'sec_kosvidio_shield_title',
    areaId: 'area_kosweb_media',
    pageId: 'video',
    systemDefault: 'נגן וידאו ישיר באתר',
    archetypeOverrides: {
      saas: 'נגן פלטפורמה מאובטח',
      automotive: 'צפייה ישירה ברכב',
      beauty: 'נגן הדרכה ישיר',
      real_estate: 'סיור וירטואלי ישיר',
      community: 'נגן שידורי קהילה',
      legal: 'צפייה ישירה בהרצאה'
    }
  },
  sec_kosvidio_subscribers: {
    id: 'sec_kosvidio_subscribers',
    areaId: 'area_kosweb_media',
    pageId: 'video',
    systemDefault: 'מנויים',
    archetypeOverrides: {
      saas: 'משתמשים רשומים',
      automotive: 'עוקבים',
      beauty: 'לקוחות מנויות',
      real_estate: 'עוקבים',
      community: 'חברי קהילה',
      legal: 'עוקבים'
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
