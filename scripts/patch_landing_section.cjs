const fs = require('fs');
const path = require('path');

const targetFile = path.resolve(__dirname, '../src/modols/KosWebAi/sections/landing/LandingSection.tsx');
let content = fs.readFileSync(targetFile, 'utf8');

// Normalize CRLF to LF for reliable regex matching, then we can write back
const hadCRLF = content.includes('\r\n');
content = content.replace(/\r\n/g, '\n');

// 1. Destructuring & Defaults
const oldPropsBlock = `  const fallbackCompanyName = brandDna?.identity?.companyName || '';
  const fallbackSlogan = brandDna?.identity?.slogan || '';
  const fallbackUvp = brandDna?.audience?.mainUvp || brandDna?.identity?.companyVision || '';

  const {
    anchorId = 'landingSection',
    title = rawBrandDna?.uiVocabulary?.sectionHeadings?.landingHeading || rawBrandDna?.uiVocabulary?.sectionHeadings?.painPointsHeading || (fallbackCompanyName ? \`השאירו פרטים לקבלת מידע נוסף מ-\${fallbackCompanyName}\` : 'השאירו פרטים לקבלת מידע נוסף'),
    subtitle = rawBrandDna?.uiVocabulary?.sectionHeadings?.landingSubtitle || fallbackSlogan || 'הצטרפו למאות המשתתפים שכבר עשו את הצעד הראשון',
    badge = 'הצטרפו למאות המשתתפים שכבר עשו את הצעד הראשון',
    description = fallbackUvp || 'מלאו את הפרטים הקצרים בטופס ונציג מקצועי יחזור אליכם בהקדם האפשרי.',
    imageSrc,
    buttonText = 'שליחת פרטים עכשיו',
    modalButtonText = 'השאירו פרטים לקבלת מידע',
    formId,
    form: propForm,`;

const newPropsBlock = `  const {
    anchorId = 'landingSection',
    title: rawTitle,
    subtitle: rawSubtitle,
    badge: rawBadge,
    description: rawDescription,
    imageSrc,
    buttonText: rawButtonText,
    modalButtonText: rawModalButtonText,
    formId,
    form: propForm,`;

if (!content.includes(oldPropsBlock)) {
  console.error('ERROR: oldPropsBlock not found!');
  process.exit(1);
}
content = content.replace(oldPropsBlock, newPropsBlock);

// 2. Add hasPageText and sanitized variables
const formConfigLine = `  const activeForm: FormConfigContract =
    typeof propForm === 'object' && propForm ? propForm : DEFAULT_LANDING_FORM_CONFIG;`;

const newResolvedVars = `  const hasPageText = Boolean(
    rawTitle?.trim() ||
    rawSubtitle?.trim() ||
    rawDescription?.trim() ||
    rawBadge?.trim() ||
    (propForm && propForm.fields && propForm.fields.length > 0)
  );

  const title = rawTitle || '';
  const subtitle = rawSubtitle || '';
  const badge = rawBadge || '';
  const description = rawDescription || '';
  const buttonText = rawButtonText || getKoswebTerminology('sec_contact_btn_submit', 'שליחת פרטים עכשיו');
  const modalButtonText = rawModalButtonText || getKoswebTerminology('sec_landing_btn_modal', 'השאירו פרטים לקבלת מידע');

  const activeForm: FormConfigContract =
    typeof propForm === 'object' && propForm ? propForm : DEFAULT_LANDING_FORM_CONFIG;`;

content = content.replace(formConfigLine, newResolvedVars);

// 3. Validation errors
content = content.replace("newErrors[f.label] = 'שדה חובה';", "newErrors[f.label] = getKoswebTerminology('sec_contact_err_required', 'שדה חובה');");
content = content.replace("newErrors[f.label] = 'כתובת אימייל לא תקינה';", "newErrors[f.label] = getKoswebTerminology('sec_contact_err_email', 'כתובת אימייל לא תקינה');");
content = content.replace("newErrors[f.label] = 'מספר טלפון קצר מדי';", "newErrors[f.label] = getKoswebTerminology('sec_contact_err_phone', 'מספר טלפון קצר מדי');");

// 4. Fallback values in WhatsApp & lead creation
content = content.replace("extraVars.receiptUrl || 'הקבלה נשלחה למייל'", "extraVars.receiptUrl || getKoswebTerminology('sec_landing_receipt_sent', 'הקבלה נשלחה למייל')");
content = content.replace("clientName || 'לקוח מזדמן'", "clientName || getKoswebTerminology('sec_contact_client_guest', 'לקוח מזדמן')");
content = content.replace("clientName || 'ליד מדף נחיתה'", "clientName || getKoswebTerminology('sec_contact_submission_name', 'ליד מדף נחיתה')");
content = content.replace("activeForm.standard_success_message ||\n          'פנייתך התקבלה בהצלחה! נציג מקצועי יחזור אליך בהקדם האפשרי.'", "activeForm.standard_success_message || getKoswebTerminology('sec_contact_success_body', 'פנייתך התקבלה בהצלחה! נציג מקצועי יחזור אליך בהקדם האפשרי.')");
content = content.replace("status: 'תשלום בוצע',", "status: getKoswebTerminology('sec_contact_paid_status', 'תשלום בוצע'),");

// 5. RenderFormContent & Checkout
content = content.replace("{successMessage || 'פנייתך התקבלה בהצלחה!'}", "{successMessage || getKoswebTerminology('sec_contact_success_title', 'פנייתך התקבלה בהצלחה!')}");
content = content.replace("הפרטים נקלטו במערכת ונציג מקצועי יחזור אליך בהקדם האפשרי.", "{getKoswebTerminology('sec_contact_success_body', 'הפרטים נקלטו במערכת ונציג מקצועי יחזור אליך בהקדם האפשרי.')}");
content = content.replace("שליחת טופס נוסף", "{getKoswebTerminology('sec_contact_send_another', 'שליחת טופס נוסף')}");
content = content.replace("<span>סליקה ותשלום מאובטח</span>", "<span>{getKoswebTerminology('sec_contact_secure_payment', 'סליקה ותשלום מאובטח')}</span>");
content = content.replace("חזרה לטופס", "{getKoswebTerminology('sec_contact_cancel_checkout', 'חזרה לטופס')}");
content = content.replace("<div><strong>עבור:</strong> {title}</div>", "<div><strong>{getKoswebTerminology('sec_contact_for_label', 'עבור:')}</strong> {title}</div>");
content = content.replace("<div><strong>משלם:</strong> {checkoutData.clientName}</div>", "<div><strong>{getKoswebTerminology('sec_contact_payer_label', 'משלם:')}</strong> {checkoutData.clientName}</div>");
content = content.replace("{checkoutData.phone && <div><strong>טלפון:</strong> {checkoutData.phone}</div>}", "{checkoutData.phone && <div><strong>{getKoswebTerminology('sec_contact_phone_label', 'טלפון:')}</strong> {checkoutData.phone}</div>}");
content = content.replace("<strong>סכום לחיוב:</strong>", "<strong>{getKoswebTerminology('sec_contact_amount_label', 'סכום לחיוב:')}</strong>");
content = content.replace('<h4 className="text-xs font-bold text-white">מסוף הסליקה מוכן לקליטת תשלום</h4>', '<h4 className="text-xs font-bold text-white">{getKoswebTerminology(\'sec_contact_terminal_ready\', \'מסוף הסליקה מוכן לקליטת תשלום\')}</h4>');
content = content.replace("אישור תשלום (סביבת בדיקה)", "{getKoswebTerminology('sec_landing_test_pay_btn', 'אישור תשלום (סביבת בדיקה)')}");

// 6. Steps, PCI, Options, Buttons
content = content.replace("שלב {currentStep} מתוך {totalSteps}", "{getKoswebTerminology('sec_contact_step', 'שלב')} {currentStep} {getKoswebTerminology('sec_contact_of', 'מתוך')} {totalSteps}");
content = content.replace('<span className="font-bold text-indigo-300">סכום לתשלום:</span>', '<span className="font-bold text-indigo-300">{getKoswebTerminology(\'sec_contact_amount_label\', \'סכום לתשלום:\')}</span>');
content = content.replace("<span>סליקת האשראי תתבצע בצורה מאובטחת תחת תקן PCI-DSS.</span>", "<span>{getKoswebTerminology('sec_contact_pci_note', 'סליקת האשראי תתבצע בצורה מאובטחת תחת תקן PCI-DSS.')}</span>");
content = content.replace('<option value="">בחר...</option>', '<option value="">{getKoswebTerminology(\'sec_contact_select_ph\', \'בחר...\')}</option>');
content = content.replace("<span>{activeForm.back_button_text || 'חזור'}</span>", "<span>{activeForm.back_button_text || getKoswebTerminology('sec_contact_btn_back', 'חזור')}</span>");
content = content.replace("<span>{activeForm.continue_button_text || 'המשך לשלב הבא'}</span>", "<span>{activeForm.continue_button_text || getKoswebTerminology('sec_contact_btn_next', 'המשך לשלב הבא')}</span>");
content = content.replace("<span>שולח נתונים...</span>", "<span>{getKoswebTerminology('sec_landing_submitting', 'שולח נתונים...')}</span>");
content = content.replace("<span>{activeForm.submit_button_text || buttonText || 'שליחת פרטים עכשיו'}</span>", "<span>{activeForm.submit_button_text || buttonText}</span>");
content = content.replace("<span>{modalButtonText || buttonText || 'השאירו פרטים לקבלת מידע'}</span>", "<span>{modalButtonText || buttonText}</span>");
content = content.replace('title="סגור"', 'title={getKoswebTerminology(\'common_close\', \'סגור\')}');

// 7. Strict Guard before return (<section
const renderSectionLine = `  return (
    <section`;

const guardBlock = `  // 🛡️ אין פולבק: אם אין טקסט/נתונים שמגיעים מקולקציית העמוד עבור האזור, או שהוגדר כלא גלוי - האזור לא מופיע כלל!
  if (config?.visible === false || !hasPageText) {
    return null;
  }

  return (
    <section`;

content = content.replace(renderSectionLine, guardBlock);

if (hadCRLF) {
  content = content.replace(/\n/g, '\r\n');
}

fs.writeFileSync(targetFile, content, 'utf8');
console.log('Successfully patched LandingSection.tsx!');
