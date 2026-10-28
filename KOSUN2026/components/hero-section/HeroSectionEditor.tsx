import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import { HeroSectionEditorProps, HeroSectionData, HeroBusinessIntent } from './types';
import { useArchetype } from '../../theme/ArchetypeEngine';

/**
 * 👑 HeroSectionEditor
 * פאנל עריכה מונחה שרת בכרטיסי שאלות מונחות עבור רכיב השער (Hero) ב-KOSUN 2026.
 * חוקי ברזל:
 * 1. עריכת תוכן נקי בלבד - אפס שדות צבע או פונטים.
 * 2. כרטיסי שאלות עסקיות מונחות (Guided Goal Decision Cards).
 * 3. חיסכון קוגניטיבי מוחלט לבעל העסק.
 */
export const HeroSectionEditor: React.FC<HeroSectionEditorProps> = ({
  isOpen,
  onClose,
  data,
  onChange,
  onSave,
}) => {
  if (!isOpen) return null;

  const { activeArchetype } = useArchetype();
  const brandColor = activeArchetype.style.primaryColor;

  const [activeTab, setActiveTab] = useState<'content' | 'goal'>('content');
  const [isSaving, setIsSaving] = useState(false);

  // רשימת כרטיסי מטרת על עסקית
  const goalDecisionCards: {
    id: HeroBusinessIntent;
    title: string;
    desc: string;
    icon: React.FC<{ className?: string; size?: number }>;
    badge: string;
  }[] = [
    {
      id: 'conversion',
      title: 'המרת לקוחות ולידים',
      desc: 'התמקדות בהנעה חדה לפעולה, כפתור בולט והוכחה חברתית ממוקדת',
      icon: Icons.Target,
      badge: 'מומלץ למכירות',
    },
    {
      id: 'authority',
      title: 'סמכות ויוקרה מקצועית',
      desc: 'מסר מנהיגותי עמוק, באדג׳ אמון רשמי ועיצוב מאופק המשדר ביטחון',
      icon: Icons.Award,
      badge: 'מומלץ ליועצים ועורכי דין',
    },
    {
      id: 'launch',
      title: 'השקת מוצר או שירות',
      desc: 'יצירת סקרנות והתלהבות סביב חידוש או מוצר שיוצא לשוק',
      icon: Icons.Rocket,
      badge: 'באזז וסקרנות',
    },
    {
      id: 'trust',
      title: 'בניית אמון וקהילה',
      desc: 'טקסט חם, רך ומזמין המעודד חיבור אישי ושייכות',
      icon: Icons.HeartHandshake,
      badge: 'מומלץ לקליניקות וסדנאות',
    },
  ];

  const handleUpdate = (field: keyof HeroSectionData, value: any) => {
    onChange({
      ...data,
      [field]: value,
    });
  };

  const handleSave = async () => {
    if (!onSave) {
      onClose();
      return;
    }
    setIsSaving(true);
    try {
      await onSave(data);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 font-sans select-none"
      dir="rtl"
    >
      <div
        className="w-full max-w-xl max-h-[90vh] bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-zinc-100"
        style={{ borderColor: `${brandColor}40` }}
      >
        {/* כותרת עליונה של העורך */}
        <div className="p-5 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-900/60">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-black font-bold"
              style={{ backgroundColor: brandColor }}
            >
              <Icons.LayoutTemplate size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold">עריכת שער העמוד (Hero)</h2>
              <p className="text-xs text-zinc-400">
                עריכת תוכן נקי • המיתוג נגזר אוטומטית מארכיטיפ <span style={{ color: brandColor }}>{activeArchetype.name}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <Icons.X size={18} />
          </button>
        </div>

        {/* טאבים: תוכן נקי / מטרת על */}
        <div className="flex border-b border-zinc-800/80 bg-zinc-900/30 px-5 pt-3 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('content')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'content'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
            style={{
              borderColor: activeTab === 'content' ? brandColor : 'transparent',
              color: activeTab === 'content' ? brandColor : undefined,
            }}
          >
            <Icons.FileText size={14} />
            <span>תוכן השער</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('goal')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'goal'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
            style={{
              borderColor: activeTab === 'goal' ? brandColor : 'transparent',
              color: activeTab === 'goal' ? brandColor : undefined,
            }}
          >
            <Icons.Sparkles size={14} />
            <span>כרטיסי מטרת על</span>
          </button>
        </div>

        {/* תוכן הפאנל */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {activeTab === 'content' ? (
            <>
              {/* באדג' עליון */}
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">
                  תגית / באדג' הכרזה עליון
                </label>
                <input
                  type="text"
                  value={data.badge || ''}
                  onChange={(e) => handleUpdate('badge', e.target.value)}
                  placeholder="לדוגמה: מהדורה חדשה 2026"
                  className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-3.5 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              {/* כותרת ראשית */}
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">
                  כותרת ראשית
                </label>
                <input
                  type="text"
                  value={data.title}
                  onChange={(e) => handleUpdate('title', e.target.value)}
                  placeholder="הכותרת המרכזית של השער"
                  className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-3.5 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              {/* כותרת משנה */}
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">
                  כותרת משנה / תיאור קצר
                </label>
                <textarea
                  rows={2}
                  value={data.subtitle || ''}
                  onChange={(e) => handleUpdate('subtitle', e.target.value)}
                  placeholder="משפט מפתח המסביר את הצעת הערך"
                  className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-3.5 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400 resize-none"
                />
              </div>

              {/* הנעה לפעולה ראשית */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">
                    טקסט כפתור ראשי
                  </label>
                  <input
                    type="text"
                    value={data.primaryCtaText || ''}
                    onChange={(e) => handleUpdate('primaryCtaText', e.target.value)}
                    placeholder="למשל: התחל עכשיו"
                    className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">
                    קישור / יעד הכפתור
                  </label>
                  <input
                    type="text"
                    value={data.primaryCtaLink || ''}
                    onChange={(e) => handleUpdate('primaryCtaLink', e.target.value)}
                    placeholder="#contact או /register"
                    className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none text-left"
                    dir="ltr"
                  />
                </div>
              </div>

              {/* תמונת שער */}
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">
                  קישור לתמונת שער (URL)
                </label>
                <input
                  type="text"
                  value={data.mediaUrl || ''}
                  onChange={(e) => handleUpdate('mediaUrl', e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none text-left"
                  dir="ltr"
                />
              </div>

              {/* הוכחה חברתית */}
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">
                  שורת הוכחה חברתית / דירוג
                </label>
                <input
                  type="text"
                  value={data.socialProofText || ''}
                  onChange={(e) => handleUpdate('socialProofText', e.target.value)}
                  placeholder="לדוגמה: מדורג 4.9/5 ע״י למעלה מ-1,200 לקוחות"
                  className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none"
                />
              </div>
            </>
          ) : (
            /* כרטיסי שאלות מונחות של מטרת על */
            <div className="space-y-3">
              <p className="text-xs text-zinc-400">
                בחרו את מטרת העל של אזור השער. המערכת תתאים את הניסוח והדגשים בהתאם:
              </p>
              {goalDecisionCards.map((card) => {
                const IconComponent = card.icon;
                const isSelected = data.businessIntent === card.id;
                return (
                  <div
                    key={card.id}
                    onClick={() => handleUpdate('businessIntent', card.id)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 flex items-start gap-3.5 ${
                      isSelected
                        ? 'bg-zinc-900 border-cyan-400 shadow-md'
                        : 'bg-zinc-900/40 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/70'
                    }`}
                    style={{
                      borderColor: isSelected ? brandColor : undefined,
                    }}
                  >
                    <div
                      className={`p-2 rounded-xl mt-0.5 ${
                        isSelected ? 'bg-cyan-500/20 text-cyan-300' : 'bg-zinc-800 text-zinc-400'
                      }`}
                      style={{
                        backgroundColor: isSelected ? `${brandColor}25` : undefined,
                        color: isSelected ? brandColor : undefined,
                      }}
                    >
                      <IconComponent size={20} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-white">{card.title}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                          {card.badge}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{card.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* סרגל פעולה תחתון */}
        <div className="p-4 border-t border-zinc-800/80 bg-zinc-900/60 flex items-center justify-between">
          <span className="text-xs text-zinc-400">
            השינויים מוצגים בזמן אמת בתצוגה המקדימה
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
            >
              סגור
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="px-5 py-2 rounded-xl text-xs font-bold text-black flex items-center gap-1.5 shadow-lg active:scale-95 transition-transform"
              style={{ backgroundColor: brandColor }}
            >
              {isSaving ? (
                <>
                  <Icons.Loader2 size={14} className="animate-spin" />
                  <span>שומר...</span>
                </>
              ) : (
                <>
                  <Icons.Check size={14} />
                  <span>אישור ושמירה</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
