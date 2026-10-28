import { FormConfigContract } from '../../../../core/contracts';
import { getKoswebTerminology } from '../../services/koswebSectionThemeBridge';

export function getDefaultLandingFormConfig(): FormConfigContract {
  return {
    enabled: true,
    form_type: 'standard',
    submit_button_text: getKoswebTerminology('sec_contact_btn_submit', 'שליחת פרטים עכשיו'),
    submit_button_bg_color: '#4f46e5',
    submit_button_text_color: '#ffffff',
    continue_button_text: getKoswebTerminology('sec_contact_btn_next', 'המשך לשלב הבא'),
    back_button_text: getKoswebTerminology('sec_contact_btn_back', 'חזור'),
    fields: [
      {
        label: getKoswebTerminology('sec_contact_lbl_name', 'שם מלא'),
        type: 'text',
        map_to: 'conta_name',
        required: true,
        default_value: '',
        options: '',
        step: 1,
        widthPercentage: 50,
        placeholder: getKoswebTerminology('sec_contact_name_ph', 'ישראל ישראלי'),
      },
      {
        label: getKoswebTerminology('sec_contact_lbl_phone', 'טלפון נייד'),
        type: 'tel',
        map_to: 'conta_phone',
        required: true,
        default_value: '',
        options: '',
        step: 1,
        widthPercentage: 50,
        placeholder: getKoswebTerminology('sec_contact_phone_ph', '050-0000000'),
      },
      {
        label: getKoswebTerminology('sec_contact_lbl_email', 'אימייל (אופציונלי)'),
        type: 'email',
        map_to: 'email',
        required: false,
        default_value: '',
        options: '',
        step: 1,
        widthPercentage: 100,
        placeholder: getKoswebTerminology('sec_contact_email_ph', 'name@example.com'),
      },
      {
        label: getKoswebTerminology('sec_contact_lbl_notes', 'הערות / הודעה'),
        type: 'textarea',
        map_to: 'notes',
        required: false,
        default_value: '',
        options: '',
        step: 1,
        widthPercentage: 100,
        placeholder: getKoswebTerminology('sec_contact_message_ph', 'רשמו כאן פרטים נוספים...'),
      },
    ],
    save_to_crm: true,
    crm_owner_id: '1',
    standard_success_message: getKoswebTerminology('sec_contact_success_body', 'פנייתך התקבלה בהצלחה! נציג מקצועי יחזור אליך בהקדם.'),
    standard_redirect_url: '',
    standard_whatsapp_message: getKoswebTerminology('sec_contact_wa_template', 'שלום {שם מלא}, תודה שהשארת פרטים! פנייתך נקלטה במערכת ונשוב אליך בהקדם.'),
    standard_whatsapp_image_url: '',
    modal_shape: 'rounded-3xl',
    modal_effect: 'glass',
    modal_bg_color: '#0f172a',
    modal_backdrop_blur: 'md',
    modal_max_width: 'md',
  };
}

export const DEFAULT_LANDING_FORM_CONFIG: FormConfigContract = getDefaultLandingFormConfig();
