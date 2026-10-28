const fs = require('fs');
const path = require('path');

const masterPath = path.resolve(__dirname, '../KOSUN2026/factory/data/kosun_copy_master.json');
const master = JSON.parse(fs.readFileSync(masterPath, 'utf8'));

const newTerms = {
  sec_contact_lbl_name: {
    id: 'sec_contact_lbl_name',
    areaId: 'area_kosweb_contact',
    pageId: 'global',
    systemDefault: 'שם מלא',
    archetypeOverrides: {
      saas: 'שם איש קשר',
      automotive: 'שם פרטי ומשפחה',
      beauty: 'שם מלא',
      real_estate: 'שם מלא',
      community: 'שם חבר',
      legal: 'שם הלקוח'
    }
  },
  sec_contact_lbl_notes: {
    id: 'sec_contact_lbl_notes',
    areaId: 'area_kosweb_contact',
    pageId: 'global',
    systemDefault: 'הערות / הודעה',
    archetypeOverrides: {
      saas: 'פרטים נוספים על הצורך',
      automotive: 'הערות או בקשות לנסיעת מבחן',
      beauty: 'בקשות מיוחדות לטיפול',
      real_estate: 'דרישות מיוחדות מהנכס',
      community: 'הודעה לקהילה',
      legal: 'תמצית הפנייה'
    }
  },
  sec_contact_wa_template: {
    id: 'sec_contact_wa_template',
    areaId: 'area_kosweb_contact',
    pageId: 'global',
    systemDefault: 'שלום {שם מלא}, תודה שהשארת פרטים! פנייתך נקלטה במערכת ונשוב אליך בהקדם.',
    archetypeOverrides: {
      saas: 'שלום {שם מלא}, תודה על פנייתך! צוות הפתרונות שלנו יחזור אליך בהקדם.',
      automotive: 'שלום {שם מלא}, תודה על התעניינותך! יועץ הרכב שלנו ייצור איתך קשר בהקדם.',
      beauty: 'שלום {שם מלא}, שמחנו לקבל את פנייתך! נשוב אליך בהקדם לקביעת תור.',
      real_estate: 'שלום {שם מלא}, תודה על פנייתך! יועץ הנדל״ן שלנו ייצור איתך קשר בהקדם.',
      community: 'שלום {שם מלא}, ברוך הבא לקהילה! פנייתך התקבלה ונחזור אליך בהקדם.',
      legal: 'שלום {שם מלא}, פנייתך התקבלה במשרדנו. נשוב אליך בהקדם לתיאום פגישה.'
    }
  },
  sec_landing_payment_approved: {
    id: 'sec_landing_payment_approved',
    areaId: 'area_kosweb_landing',
    pageId: 'landing',
    systemDefault: 'התשלום בסך ₪{amount} אושר בהצלחה! אסמכתא: {txId}. אישור וקבלה נשלחו.',
    archetypeOverrides: {
      saas: 'המנוי אושר בהצלחה בסך ₪{amount}! אסמכתא: {txId}.',
      automotive: 'המקדמה בסך ₪{amount} אושרה בהצלחה! אסמכתא: {txId}.',
      beauty: 'התשלום בסך ₪{amount} נקלט בהצלחה! אסמכתא: {txId}.',
      real_estate: 'התשלום בסך ₪{amount} בוצע בהצלחה! אסמכתא: {txId}.',
      community: 'תשלום החברות בסך ₪{amount} אושר בהצלחה! אסמכתא: {txId}.',
      legal: 'התשלום בסך ₪{amount} אושר במערכת! אסמכתא: {txId}.'
    }
  },
  sec_landing_hub_notice: {
    id: 'sec_landing_hub_notice',
    areaId: 'area_kosweb_landing',
    pageId: 'landing',
    systemDefault: 'הסליקה מתבצעת תחת מודול kesher-payments-hub.',
    archetypeOverrides: {
      saas: 'סליקה מאובטחת תחת תקני האבטחה המחמירים.',
      automotive: 'הסליקה מאובטחת ומבוקרת.',
      beauty: 'סליקה מאובטחת ומוצפנת.',
      real_estate: 'סליקה מאובטחת ומפוקחת.',
      community: 'הסליקה מאובטחת לרווחת החברים.',
      legal: 'הסליקה מאובטחת ומפוקחת בהתאם לדין.'
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
