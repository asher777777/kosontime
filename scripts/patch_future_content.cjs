const fs = require('fs');
const path = require('path');

const targetFile = path.resolve(__dirname, '../src/modols/KosWebAi/sections/futureContent/FutureContentSection.tsx');
let content = fs.readFileSync(targetFile, 'utf8');

// 1. Config destructuring & defaults
const oldConfig = `    id,
    anchorId,
    title = 'העתיד כבר כאן: תוכן פורץ דרך',
    subtitle = 'שילוב רב-ממדי של עומק מרחבי, טיפוגרפיה קינטית וזכוכית פריזמטית',
    badge = 'חוויית תוכן 2027',
    source = 'tenant_pages',`;

const newConfig = `    id,
    anchorId,
    title: rawTitle,
    subtitle: rawSubtitle,
    badge: rawBadge,
    source = 'tenant_pages',`;

if (!content.includes(oldConfig)) {
  console.error('ERROR: oldConfig not found in FutureContentSection.tsx');
  process.exit(1);
}
content = content.replace(oldConfig, newConfig);

// 2. Resolved variables & loading state
const oldStateBlock = `  // Interactive category filter for Floating Islands mode
  const [selectedCategory, setSelectedCategory] = useState<string>('הכל');`;

const newStateBlock = `  const title = rawTitle || '';
  const subtitle = rawSubtitle || '';
  const badge = rawBadge || '';
  const [isLoading, setIsLoading] = useState<boolean>(source !== 'custom' && (!items || items.length === 0));

  // Interactive category filter for Floating Islands mode
  const [selectedCategory, setSelectedCategory] = useState<string>(getKoswebTerminology('sec_listing_filter_all', 'הכל'));`;

content = content.replace(oldStateBlock, newStateBlock);

// 3. Map services
const oldServicesMap = `      // Map brand services as FutureContentItems
      const serviceItems: FutureContentItem[] = services.map((srv: any, idx: number) => ({
        id: \`srv-\${idx + 1}\`,
        title: srv.name || \`שירות \${idx + 1}\`,
        subtitle: srv.description || brand.identity?.slogan || 'שירות מקצועי מוביל מבית המותג',
        description: srv.description || \`\${brand.identity?.companyName || 'החברה'} מעניקה מענה מקצועי ואיכותי בסטנדרט בלתי מתפשר.\`,
        imageUrl: srv.imageUrl || 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80',
        category: srv.category || 'שירותים',
        tag: '• שירות מוביל •',
        badge: srv.price ? \`₪\${srv.price}\` : 'מומלץ',
        readTime: '2 דק׳ קריאה',
        audioDuration: '01:15',
        ctaText: 'לפרטים והזמנה',
        ctaUrl: \`https://wa.me/\${(brand.trust?.whatsappSupportNumber || '0526968008').replace(/\\D/g, '')}?text=\${encodeURIComponent(\`שלום, אשמח לקבל פרטים על \${srv.name}\`)}\`,
        metrics: srv.price ? [{ label: 'מחיר', value: \`₪\${srv.price}\` }] : [{ label: 'דירוג', value: '4.9/5' }],
      }));`;

const newServicesMap = `      // Map brand services as FutureContentItems
      const serviceItems: FutureContentItem[] = services.map((srv: any, idx: number) => ({
        id: \`srv-\${idx + 1}\`,
        title: srv.name || \`\${getKoswebTerminology('sec_future_srv_default', 'שירות')} \${idx + 1}\`,
        subtitle: srv.description || brand.identity?.slogan || '',
        description: srv.description || (brand.identity?.companyName ? \`\${brand.identity.companyName} מעניקה מענה מקצועי ואיכותי.\` : ''),
        imageUrl: srv.imageUrl || '',
        category: srv.category || getKoswebTerminology('sec_future_cat_services', 'שירותים'),
        tag: getKoswebTerminology('sec_future_tag_lead_srv', '• שירות מוביל •'),
        badge: srv.price ? \`₪\${srv.price}\` : getKoswebTerminology('sec_future_badge_recommended', 'מומלץ'),
        readTime: getKoswebTerminology('sec_future_read_time_2m', '2 דק׳ קריאה'),
        audioDuration: '01:15',
        ctaText: getKoswebTerminology('sec_future_cta_order', 'לפרטים והזמנה'),
        ctaUrl: brand.trust?.whatsappSupportNumber ? \`https://wa.me/\${brand.trust.whatsappSupportNumber.replace(/\\D/g, '')}?text=\${encodeURIComponent(\`שלום, אשמח לקבל פרטים על \${srv.name}\`)}\` : '#',
        metrics: srv.price ? [{ label: getKoswebTerminology('sec_future_metric_price', 'מחיר'), value: \`₪\${srv.price}\` }] : [{ label: getKoswebTerminology('sec_future_metric_rating', 'דירוג'), value: '4.9/5' }],
      }));`;

content = content.replace(oldServicesMap, newServicesMap);

// 4. Map pages
const oldPageMap = `          return {
            id: p.pageId,
            title: p.pageTitle,
            subtitle: heroSec?.subtitle || p.globalSettings?.slogan || 'עמוד תוכן ופעילות רשמי',
            description: heroSec?.description || p.globalSettings?.companyName || '',
            imageUrl: heroSec?.imageSrc || heroSec?.imageUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
            category: catConfig?.shortLabel || 'תוכן',
            tag: \`• \${catConfig?.shortLabel || 'עמוד פעילות'} •\`,
            readTime: '3 דק׳ קריאה',
            audioDuration: '01:30',
            ctaText: 'צפייה בעמוד',
            ctaUrl: p.publishedUrl || p.shortUrl || (p.slug ? \`/\${p.slug}\` : '#'),
            metrics: [{ label: 'צפיות', value: \`\${p.viewsCount || 140}\` }],
          };`;

const newPageMap = `          return {
            id: p.pageId,
            title: p.pageTitle,
            subtitle: heroSec?.subtitle || p.globalSettings?.slogan || '',
            description: heroSec?.description || p.globalSettings?.companyName || '',
            imageUrl: heroSec?.imageSrc || heroSec?.imageUrl || '',
            category: catConfig?.shortLabel || getKoswebTerminology('sec_future_cat_content', 'תוכן'),
            tag: \`• \${catConfig?.shortLabel || getKoswebTerminology('sec_future_tag_activity', 'עמוד פעילות')} •\`,
            readTime: getKoswebTerminology('sec_future_read_time_3m', '3 דק׳ קריאה'),
            audioDuration: '01:30',
            ctaText: getKoswebTerminology('sec_future_cta_view_page', 'צפייה בעמוד'),
            ctaUrl: p.publishedUrl || p.shortUrl || (p.slug ? \`/\${p.slug}\` : '#'),
            metrics: [{ label: getKoswebTerminology('sec_future_metric_views', 'צפיות'), value: \`\${p.viewsCount || 140}\` }],
          };`;

content = content.replace(oldPageMap, newPageMap);

// 5. Add setIsLoading(false) in loadDynamicItems
content = content.replace(`        if (isMounted) {
          setEffectiveItems(serviceItems.length > 0 ? serviceItems : (items || []));
        }
      }
    }`, `        if (isMounted) {
          setEffectiveItems(serviceItems.length > 0 ? serviceItems : (items || []));
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }`);

// 6. Categories array
content = content.replace("return ['הכל', ...Array.from(set)];", "return [getKoswebTerminology('sec_listing_filter_all', 'הכל'), ...Array.from(set)];");
content = content.replace("if (selectedCategory === 'הכל') return effectiveItems;", "if (selectedCategory === getKoswebTerminology('sec_listing_filter_all', 'הכל')) return effectiveItems;");

// 7. Strict Guard before return (<section
const oldSectionReturn = `  return (
    <section`;

const newSectionReturn = `  // 🛡️ אין פולבק: אם אין נתונים/פריטים שמגיעים מקולקציית העמוד עבור האזור, או שהוגדר כלא גלוי - האזור לא מופיע כלל!
  if (config?.visible === false || (!isLoading && effectiveItems.length === 0)) {
    return null;
  }

  return (
    <section`;

content = content.replace(oldSectionReturn, newSectionReturn);

// 8. View Mode Tabs & UI text
content = content.replace("<span>בנטו מרחבי</span>", "<span>{getKoswebTerminology('sec_future_mode_bento', 'בנטו מרחבי')}</span>");
content = content.replace("<span>מגזין קינטי</span>", "<span>{getKoswebTerminology('sec_future_mode_kinetic', 'מגזין קינטי')}</span>");
content = content.replace("<span>איים צפים</span>", "<span>{getKoswebTerminology('sec_future_mode_islands', 'איים צפים')}</span>");
content = content.replace("{item.category || 'תוכן'}", "{item.category || getKoswebTerminology('sec_future_cat_content', 'תוכן')}");
content = content.replace('<div className="text-xs font-bold text-white">תקציר קולי מבוסס AI</div>', '<div className="text-xs font-bold text-white">{getKoswebTerminology(\'sec_future_audio_summary\', \'תקציר קולי מבוסס AI\')}</div>');
content = content.replace('<span className="text-xs text-slate-400">גלילה אופקית חלקה</span>', '<span className="text-xs text-slate-400">{getKoswebTerminology(\'sec_future_scroll_hint\', \'גלילה אופקית חלקה\')}</span>');
content = content.replace('title="גלול שמאלה"', 'title={getKoswebTerminology(\'sec_future_scroll_left\', \'גלול שמאלה\')}');
content = content.replace('title="גלול ימינה"', 'title={getKoswebTerminology(\'sec_future_scroll_right\', \'גלול ימינה\')}');
content = content.replace("{item.category || 'מאמר'}", "{item.category || getKoswebTerminology('sec_future_cat_content', 'מאמר')}");
content = content.replace("<span>{playingAudioId === item.id ? 'עצור השמעה' : 'האזן לתקציר'}</span>", "<span>{playingAudioId === item.id ? getKoswebTerminology('sec_future_audio_stop', 'עצור השמעה') : getKoswebTerminology('sec_future_audio_listen', 'האזן לתקציר')}</span>");
content = content.replace('title="קרא בהרחבה"', 'title={getKoswebTerminology(\'sec_future_read_more\', \'קרא בהרחבה\')}');
content = content.replace("{item.category || 'אי מידע'}", "{item.category || getKoswebTerminology('sec_future_cat_content', 'אי מידע')}");
content = content.replace("חשיפה מהירה ✦", "{getKoswebTerminology('sec_future_quick_peek', 'חשיפה מהירה ✦')}");
content = content.replace("<span>צפייה בפרטים</span>", "<span>{getKoswebTerminology('sec_future_view_details', 'צפייה בפרטים')}</span>");
content = content.replace("{peekItem.category || 'סקירה מורחבת'}", "{peekItem.category || getKoswebTerminology('sec_future_expanded_overview', 'סקירה מורחבת')}");
content = content.replace("טכנולוגיית התוכן של 2027 מאפשרת גישה מיידית, חוויית משתמש מרחבית והתאמה אישית מלאה לפי העדפות הצפייה.", "{getKoswebTerminology('sec_future_peek_desc', 'טכנולוגיית התוכן של 2027 מאפשרת גישה מיידית, חוויית משתמש מרחבית והתאמה אישית מלאה לפי העדפות הצפייה.')}");
content = content.replace("<span>השמע תקציר קולי</span>", "<span>{getKoswebTerminology('sec_future_play_audio', 'השמע תקציר קולי')}</span>");
content = content.replace("<span>{peekItem.ctaText || 'למעבר לקישור'}</span>", "<span>{peekItem.ctaText || getKoswebTerminology('sec_future_goto_link', 'למעבר לקישור')}</span>");
content = content.replace("סגור\n            </button>", "{getKoswebTerminology('common_close', 'סגור')}\n            </button>");

fs.writeFileSync(targetFile, content, 'utf8');
console.log('Successfully patched FutureContentSection.tsx!');
