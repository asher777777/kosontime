const fs = require('fs');
const path = require('path');

const masterPath = path.resolve(__dirname, '../KOSUN2026/factory/data/kosun_copy_master.json');
const master = JSON.parse(fs.readFileSync(masterPath, 'utf8'));

const newTerms = {
  sec_landing_btn_modal: {
    id: 'sec_landing_btn_modal',
    areaId: 'area_kosweb_landing',
    pageId: 'landing',
    systemDefault: 'השאירו פרטים לקבלת מידע',
    archetypeOverrides: {
      saas: 'קבלת גישה ומידע נוסף',
      automotive: 'תיאום נסיעת מבחן ופרטים',
      beauty: 'קביעת תור וייעוץ',
      real_estate: 'קבלת תוכניות ופרטים',
      community: 'הצטרפות ומידע',
      legal: 'תיאום פגישת ייעוץ'
    }
  },
  sec_landing_submitting: {
    id: 'sec_landing_submitting',
    areaId: 'area_kosweb_landing',
    pageId: 'landing',
    systemDefault: 'שולח נתונים...',
    archetypeOverrides: {
      saas: 'מעבד בקשה...',
      automotive: 'מעדכן סוכנות...',
      beauty: 'רושם תור...',
      real_estate: 'מעביר בקשה לנציג...',
      community: 'מצרף לקהילה...',
      legal: 'מעביר פנייה למשרד...'
    }
  },
  sec_landing_test_pay_btn: {
    id: 'sec_landing_test_pay_btn',
    areaId: 'area_kosweb_landing',
    pageId: 'landing',
    systemDefault: 'אישור תשלום (סביבת בדיקה)',
    archetypeOverrides: {
      saas: 'אישור מנוי (סביבת טסט)',
      automotive: 'תשלום מקדמה (סביבת טסט)',
      beauty: 'תשלום שריון תור (טסט)',
      real_estate: 'אישור דמי רישום (טסט)',
      community: 'תשלום חברות (טסט)',
      legal: 'אישור מקדמת שכר טרחה (טסט)'
    }
  },
  sec_landing_receipt_sent: {
    id: 'sec_landing_receipt_sent',
    areaId: 'area_kosweb_landing',
    pageId: 'landing',
    systemDefault: 'הקבלה נשלחה למייל',
    archetypeOverrides: {
      saas: 'החשבונית נשלחה למייל החשבון',
      automotive: 'הקבלה נשלחה לדוא"ל',
      beauty: 'אישור התשלום נשלח בהודעה ומייל',
      real_estate: 'האישור והקבלה נשלחו למייל',
      community: 'קבלה נשלחה למייל החבר',
      legal: 'חשבונית מס קבלה נשלחה ללקוח'
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
