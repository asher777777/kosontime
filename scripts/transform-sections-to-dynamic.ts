import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sectionsDir = path.resolve(__dirname, '../src/modols/KosWebAi/sections');

// מילון החלפות קופי מדויק וספציפי לפי ביטויים נוקשים
const STRING_REPLACEMENTS: Array<{ search: RegExp | string; replace: string }> = [
  // כפתורים ופעולות כלליים
  { search: /'בחר מסלול זה'/g, replace: `getKoswebTerminology('sec_pricing_cta', 'בחר מסלול זה')` },
  { search: /"בחר מסלול זה"/g, replace: `{getKoswebTerminology('sec_pricing_cta', 'בחר מסלול זה')}` },
  { search: />חיוב חודשי</g, replace: `>{getKoswebTerminology('sec_pricing_monthly', 'חיוב חודשי')}<` },
  { search: />חיוב שנתי</g, replace: `>{getKoswebTerminology('sec_pricing_yearly', 'חיוב שנתי')}<` },
  { search: /'חיסכון של 20%'/g, replace: `getKoswebTerminology('sec_pricing_discount_badge', 'חיסכון של 20%')` },
  { search: /"חיסכון של 20%"/g, replace: `getKoswebTerminology('sec_pricing_discount_badge', 'חיסכון של 20%')` },
  { search: /'תוכניות ומחירים שקופים ומותאמים'/g, replace: `getKoswebTerminology('sec_pricing_title', 'תוכניות ומחירים שקופים ומותאמים')` },
  { search: /'בחרו את החבילה המתאימה ביותר עבורכם'/g, replace: `getKoswebTerminology('sec_pricing_subtitle', 'בחרו את החבילה המתאימה ביותר עבורכם')` },
  
  // שאלות נפוצות
  { search: /'שאלות ותשובות נפוצות'/g, replace: `getKoswebTerminology('sec_faq_title', 'שאלות ותשובות נפוצות')` },
  { search: /'כל מה שחשוב לדעת'/g, replace: `getKoswebTerminology('sec_faq_subtitle', 'כל מה שחשוב לדעת')` },
  { search: /placeholder="חפש שאלה או מילת מפתח\.\.\."/g, replace: `placeholder={getKoswebTerminology('sec_faq_search_placeholder', 'חפש שאלה או מילת מפתח...')}` },
  { search: />מענה אישי בוואטסאפ</g, replace: `>{getKoswebTerminology('sec_faq_contact_cta', 'מענה אישי בוואטסאפ')}<` },
  { search: />שיחה ישירה בוואטסאפ</g, replace: `>{getKoswebTerminology('sec_faq_contact_cta', 'שיחה ישירה בוואטסאפ')}<` },
  { search: />פנייה שלווה בוואטסאפ</g, replace: `>{getKoswebTerminology('sec_faq_contact_cta', 'פנייה שלווה בוואטסאפ')}<` },
  { search: />שאלו אותנו בוואטסאפ</g, replace: `>{getKoswebTerminology('sec_faq_contact_cta', 'שאלו אותנו בוואטסאפ')}<` },
  { search: />מענה ישיר 90°</g, replace: `>{getKoswebTerminology('sec_faq_contact_cta', 'מענה ישיר')}<` },
  { search: />פנייה טכנולוגית ישירה</g, replace: `>{getKoswebTerminology('sec_faq_contact_cta', 'פנייה טכנולוגית ישירה')}<` },
  
  // טיימר ויחידות זמן
  { search: /'הספירה לאחור החלה'/g, replace: `getKoswebTerminology('sec_timer_title', 'הספירה לאחור החלה')` },
  { search: /'אל תפספסו את ההזדמנות'/g, replace: `getKoswebTerminology('sec_timer_subtitle', 'אל תפספסו את ההזדמנות')` },
  { search: /label: 'ימים'/g, replace: `label: getKoswebTerminology('sec_timer_days', 'ימים')` },
  { search: /label: 'שעות'/g, replace: `label: getKoswebTerminology('sec_timer_hours', 'שעות')` },
  { search: /label: 'דקות'/g, replace: `label: getKoswebTerminology('sec_timer_minutes', 'דקות')` },
  { search: /label: 'שניות'/g, replace: `label: getKoswebTerminology('sec_timer_seconds', 'שניות')` },
  
  // לפני ואחרי
  { search: /beforeLabel = 'לפני'/g, replace: `beforeLabel = getKoswebTerminology('sec_before_label', 'לפני')` },
  { search: /afterLabel = 'אחרי'/g, replace: `afterLabel = getKoswebTerminology('sec_after_label', 'אחרי')` },
  { search: /'השפעה ושינוי: לפני ואחרי'/g, replace: `getKoswebTerminology('sec_before_after_title', 'השפעה ושינוי: לפני ואחרי')` },
  { search: /'תוצאות מוכחות בשטח'/g, replace: `getKoswebTerminology('sec_before_after_subtitle', 'תוצאות מוכחות בשטח')` },
  
  // המלצות וביקורות
  { search: /'מה הלקוחות שלנו מספרים\?'/g, replace: `getKoswebTerminology('sec_testimonials_title', 'מה הלקוחות שלנו מספרים?')` },
  { search: /'המלצות וביקורות מאומתות'/g, replace: `getKoswebTerminology('sec_testimonials_subtitle', 'המלצות וביקורות מאומתות')` },
  { search: /'לקוחות מאומתים 100%'/g, replace: `getKoswebTerminology('sec_testimonials_verified', 'לקוחות מאומתים 100%')` },
  
  // צור קשר
  { search: /title = 'צרו איתנו קשר'/g, replace: `title = getKoswebTerminology('sec_contact_title', 'צרו איתנו קשר')` },
  { search: /'נשמח לעמוד לשירותכם לכל שאלה, פנייה או התייעצות'/g, replace: `getKoswebTerminology('sec_contact_subtitle', 'נשמח לעמוד לשירותכם לכל שאלה, פנייה או התייעצות')` },
  { search: />שלחו הודעה בוואטסאפ</g, replace: `>{getKoswebTerminology('sec_contact_whatsapp_btn', 'שלחו הודעה בוואטסאפ')}<` },
  { search: />שלח הודעה בוואטסאפ</g, replace: `>{getKoswebTerminology('sec_contact_whatsapp_btn', 'שלח הודעה בוואטסאפ')}<` },
  { search: />מענה ישיר בוואטסאפ עכשיו</g, replace: `>{getKoswebTerminology('sec_contact_whatsapp_btn', 'מענה ישיר בוואטסאפ עכשיו')}<` },
  { search: />פנייה ישירה בוואטסאפ</g, replace: `>{getKoswebTerminology('sec_contact_whatsapp_btn', 'פנייה ישירה בוואטסאפ')}<` },
  
  // מאמרים ואירועים
  { search: /'מאמרים ותובנות'/g, replace: `getKoswebTerminology('sec_articles_title', 'מאמרים ותובנות')` },
  { search: />קרא עוד</g, replace: `>{getKoswebTerminology('sec_articles_read_more', 'קרא עוד')}<` },
  { search: />קראי עוד</g, replace: `>{getKoswebTerminology('sec_articles_read_more', 'קרא עוד')}<` },
  { search: /'אירועים ומפגשים קרובים'/g, replace: `getKoswebTerminology('sec_events_title', 'אירועים ומפגשים קרובים')` },
  { search: />הירשם לאירוע</g, replace: `>{getKoswebTerminology('sec_events_register_cta', 'הירשם לאירוע')}<` },
  
  // קמפיין ותרומות
  { search: /'יעד הקמפיין'/g, replace: `getKoswebTerminology('sec_campaign_goal', 'יעד הקמפיין')` },
  { search: /'גויסו עד כה'/g, replace: `getKoswebTerminology('sec_campaign_raised', 'גויסו עד כה')` },
  { search: />תרום עכשיו</g, replace: `>{getKoswebTerminology('sec_campaign_donate_now', 'תרום עכשיו')}<` },
  { search: />תרומה עכשיו</g, replace: `>{getKoswebTerminology('sec_campaign_donate_now', 'תרומה עכשיו')}<` },
  
  // מיקום ומפה
  { search: />נווט עם Waze</g, replace: `>{getKoswebTerminology('sec_geo_waze_btn', 'נווט עם Waze')}<` },
  { search: />ניווט ב-Waze</g, replace: `>{getKoswebTerminology('sec_geo_waze_btn', 'ניווט ב-Waze')}<` },
  
  // וידאו
  { search: />צפה עכשיו</g, replace: `>{getKoswebTerminology('sec_video_watch_now', 'צפה עכשיו')}<` },
  { search: />צפייה עכשיו</g, replace: `>{getKoswebTerminology('sec_video_watch_now', 'צפייה עכשיו')}<` },

  // הירו
  { search: /'עיצוב בוטיק מותאם אישית'/g, replace: `getKoswebTerminology('sec_hero_title', 'עיצוב בוטיק מותאם אישית')` },
  { search: /'ביצועים ועוצמה ללא פשרות'/g, replace: `getKoswebTerminology('sec_hero_title', 'ביצועים ועוצמה ללא פשרות')` }
];

function getAllViewFiles(dir: string): string[] {
  let views: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      views = views.concat(getAllViewFiles(fullPath));
    } else if (entry.name.endsWith('Section.tsx') || entry.name.endsWith('View.tsx')) {
      views.push(fullPath);
    }
  }
  return views;
}

const allViews = getAllViewFiles(sectionsDir);
console.log(`Starting dynamic transformation for ${allViews.length} section files...`);

let transformedCount = 0;

for (const filePath of allViews) {
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;
  const fileName = path.basename(filePath);
  const folderName = path.basename(path.dirname(filePath));

  // 1. הוספת Import אם עדיין לא קיים
  if (!content.includes('getKoswebTerminology')) {
    const importStatement = `import { getKoswebTerminology, getKoswebSectionTheme, getKoswebSectionContainerProps } from '../../services/koswebSectionThemeBridge';\n`;
    // מציאת מקום מתאים אחרי ה-imports הראשונים
    const firstImportMatch = content.indexOf('import ');
    if (firstImportMatch !== -1) {
      content = importStatement + content;
    }
  }

  // 2. ביצוע החלפות קופי
  for (const rule of STRING_REPLACEMENTS) {
    content = content.replace(rule.search, rule.replace);
  }

  // 3. הוספת data-area-id ו-data-style-preset לתגית השורש הראשית של האזור
  // חיפוש תגית שורש ראשונה <section או <div עיקרי של הקומפוננטה
  if (!content.includes('data-area-id') && !content.includes('getKoswebSectionContainerProps')) {
    // נחפש return ( \n <section או return ( \n <div
    const returnRegex = /(return\s*\(\s*<(?:section|div)\b)([^>]*>)/;
    if (returnRegex.test(content)) {
      content = content.replace(returnRegex, `$1 {...getKoswebSectionContainerProps('${folderName}', (config as any)?.stylePresetId)} $2`);
    }
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    transformedCount++;
    console.log(`✓ Transformed: ${folderName}/${fileName}`);
  } else {
    console.log(`- Unchanged: ${folderName}/${fileName}`);
  }
}

console.log(`\n🎉 Transformation finished: ${transformedCount} files updated out of ${allViews.length}`);
