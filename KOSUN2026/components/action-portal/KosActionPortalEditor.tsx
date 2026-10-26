import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import { useArchetype } from '../../theme/ArchetypeEngine';
import { KosActionPortalEditorProps, ActionPortalItem, ActionPortalData, ActionPortalStyleOverrides } from './types';
import { BackdropType, MotionPreset, LayoutPreset, BorderRadiusToken } from '../../theme/types';

export const KosActionPortalEditor: React.FC<KosActionPortalEditorProps> = ({
  initialData,
  initialStyleOverrides,
  onSave,
  onClose
}) => {
  const { allPresets, activeId, setArchetypeById } = useArchetype();

  // State עבור הנתונים והעיצוב
  const [data, setData] = useState<ActionPortalData>(initialData);
  const [styles, setStyles] = useState<ActionPortalStyleOverrides>(initialStyleOverrides);
  const [activeTab, setActiveTab] = useState<'content' | 'style' | 'backdrop' | 'motion'>('content');

  // פונקציות עריכת פריטים
  const handleItemChange = (index: number, field: keyof ActionPortalItem, value: any) => {
    const updatedItems = [...data.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setData({ ...data, items: updatedItems });
  };

  const handleAddItem = () => {
    const nextIndex = (data.items.length + 1).toString().padStart(2, '0');
    const newItem: ActionPortalItem = {
      id: `item_${Date.now()}`,
      indexBadge: nextIndex,
      title: 'פריט פעולה חדש',
      primaryIconName: 'Sparkles',
      actionType: 'NAVIGATE'
    };
    setData({ ...data, items: [...data.items, newItem] });
  };

  const handleDeleteItem = (index: number) => {
    setData({
      ...data,
      items: data.items.filter((_, i) => i !== index)
    });
  };

  return (
    <div dir="rtl" className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-w-2xl w-full flex flex-col max-h-[85vh]">
      {/* 🧭 כותרת העורך */}
      <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-sky-500 text-white rounded-xl">
            <Icons.Sliders size={20} />
          </div>
          <div>
            <h2 className="font-bold text-slate-800 text-base">עורך פורטל פעולות (Action Portal Editor)</h2>
            <p className="text-xs text-slate-500">התאמה אישית מלאה של תוכן, סגנון, רקע ומעברים</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200">
            <Icons.X size={18} />
          </button>
        )}
      </div>

      {/* 🎛️ טאבים לניווט בעריכה */}
      <div className="flex border-b border-slate-200 bg-white px-4 gap-2">
        <button
          onClick={() => setActiveTab('content')}
          className={`py-3 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors ${
            activeTab === 'content' ? 'border-sky-500 text-sky-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Icons.ListOrdered size={15} /> פריטים ותוכן
        </button>
        <button
          onClick={() => setActiveTab('style')}
          className={`py-3 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors ${
            activeTab === 'style' ? 'border-sky-500 text-sky-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Icons.Palette size={15} /> צבעים וסגנון
        </button>
        <button
          onClick={() => setActiveTab('backdrop')}
          className={`py-3 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors ${
            activeTab === 'backdrop' ? 'border-sky-500 text-sky-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Icons.Sparkles size={15} /> רקע אטמוספרי
        </button>
        <button
          onClick={() => setActiveTab('motion')}
          className={`py-3 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors ${
            activeTab === 'motion' ? 'border-sky-500 text-sky-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Icons.Zap size={15} /> מעברים ואפקטים
        </button>
      </div>

      {/* 📝 תוכן הטאב הנבחר */}
      <div className="p-5 overflow-y-auto flex-1 space-y-4">
        {/* טאב 1: תוכן ורשימת פריטים */}
        {activeTab === 'content' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">כותרת עליונה</label>
              <input
                type="text"
                value={data.title}
                onChange={(e) => setData({ ...data, title: e.target.value })}
                className="w-full text-sm p-2.5 border rounded-xl border-slate-200 focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs font-bold text-slate-700">כרטיסיות הפעולה ({data.items.length})</span>
              <button
                type="button"
                onClick={handleAddItem}
                className="text-xs flex items-center gap-1 text-sky-600 font-bold hover:bg-sky-50 px-2.5 py-1.5 rounded-lg border border-sky-200"
              >
                <Icons.Plus size={14} /> הוסף כרטיס
              </button>
            </div>

            <div className="space-y-3">
              {data.items.map((item, idx) => (
                <div key={item.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={item.indexBadge}
                      onChange={(e) => handleItemChange(idx, 'indexBadge', e.target.value)}
                      title="מספר סידורי"
                      className="w-12 text-center text-xs font-bold p-1.5 border rounded-lg bg-white"
                    />
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => handleItemChange(idx, 'title', e.target.value)}
                      placeholder="כותרת הפריט"
                      className="flex-1 text-sm p-1.5 border rounded-lg bg-white font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteItem(idx)}
                      className="text-rose-500 p-1.5 hover:bg-rose-50 rounded-lg"
                    >
                      <Icons.Trash2 size={16} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500">שם אייקון ראשי:</span>
                      <input
                        type="text"
                        value={item.primaryIconName}
                        onChange={(e) => handleItemChange(idx, 'primaryIconName', e.target.value)}
                        className="w-full text-xs p-1 border rounded bg-white mt-0.5"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500">סוג פעולה (ActionType):</span>
                      <input
                        type="text"
                        value={item.actionType}
                        onChange={(e) => handleItemChange(idx, 'actionType', e.target.value)}
                        className="w-full text-xs p-1 border rounded bg-white mt-0.5"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* טאב 2: סגנון ו-Archetype */}
        {activeTab === 'style' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">בחר סגנון מובנה (Archetype Preset)</label>
              <select
                value={activeId}
                onChange={(e) => setArchetypeById(e.target.value)}
                className="w-full text-sm p-2.5 border rounded-xl border-slate-200 bg-white"
              >
                {Object.values(allPresets).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">צבע ראשי (Primary)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={styles.style?.primaryColor || '#00c6ff'}
                    onChange={(e) =>
                      setStyles({
                        ...styles,
                        style: { ...styles.style, primaryColor: e.target.value } as any
                      })
                    }
                    className="w-10 h-10 rounded-lg cursor-pointer border"
                  />
                  <span className="text-xs font-mono">{styles.style?.primaryColor || '#00c6ff'}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">פריסת תצוגה (Layout)</label>
                <select
                  value={styles.layout || 'vertical_pills'}
                  onChange={(e) => setStyles({ ...styles, layout: e.target.value as LayoutPreset })}
                  className="w-full text-sm p-2 border rounded-xl border-slate-200 bg-white"
                >
                  <option value="vertical_pills">שורות קפסולה (כמו בתמונה)</option>
                  <option value="grid_2col">גריד 2 עמודות</option>
                  <option value="grid_3col">גריד 3 עמודות</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">רדיוס פינות כרטיס</label>
              <select
                value={styles.style?.borderRadius || '2xl'}
                onChange={(e) =>
                  setStyles({
                    ...styles,
                    style: { ...styles.style, borderRadius: e.target.value as BorderRadiusToken } as any
                  })
                }
                className="w-full text-sm p-2 border rounded-xl border-slate-200 bg-white"
              >
                <option value="none">חד / מרובע (0px)</option>
                <option value="md">בינוני (12px)</option>
                <option value="2xl">מעוגל מאוד (32px - כמו בתמונה)</option>
                <option value="full">קפסולה מלאה (Pill)</option>
              </select>
            </div>
          </div>
        )}

        {/* טאב 3: רקע אטמוספרי */}
        {activeTab === 'backdrop' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">סוג הרקע</label>
              <select
                value={styles.backdrop?.type || 'cosmos'}
                onChange={(e) =>
                  setStyles({
                    ...styles,
                    backdrop: { ...styles.backdrop, type: e.target.value as BackdropType }
                  })
                }
                className="w-full text-sm p-2.5 border rounded-xl border-slate-200 bg-white"
              >
                <option value="cosmos">חלל וגלקסיה (KOSUN Cosmos)</option>
                <option value="aurora">הילת זוהר צפוני (Aurora / פסטל)</option>
                <option value="ambient_glow">זוהר כהה וממוקד (Ambient Glow)</option>
                <option value="minimal_solid">נקי וחלק (Minimal Solid)</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="text-xs font-bold text-slate-800">הצג חלקיקים זוהרים (Particles)</span>
                <p className="text-[10px] text-slate-500">נקודות אור וכוכבים מרחפים ברקע</p>
              </div>
              <input
                type="checkbox"
                checked={styles.backdrop?.showParticles ?? true}
                onChange={(e) =>
                  setStyles({
                    ...styles,
                    backdrop: { ...styles.backdrop, showParticles: e.target.checked }
                  })
                }
                className="w-5 h-5 accent-sky-500 rounded cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* טאב 4: מעברים ואפקטים */}
        {activeTab === 'motion' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">סגנון אנימציה (Motion Preset)</label>
              <select
                value={styles.motion?.preset || 'stagger_glow'}
                onChange={(e) =>
                  setStyles({
                    ...styles,
                    motion: { ...styles.motion, preset: e.target.value as MotionPreset }
                  })
                }
                className="w-full text-sm p-2.5 border rounded-xl border-slate-200 bg-white"
              >
                <option value="stagger_glow">הילה מדורגת (Stagger Glow)</option>
                <option value="gentle_spring">קפיצי ורך (Gentle Spring)</option>
                <option value="sharp_fade">חד ומהיר (Sharp Fade)</option>
                <option value="breathe">נשימה וזרימה (Breathe)</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>אפקט גדילה בהובר (Hover Scale)</span>
                <span>{styles.motion?.hoverScale || 1.02}x</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="1.08"
                step="0.01"
                value={styles.motion?.hoverScale || 1.02}
                onChange={(e) =>
                  setStyles({
                    ...styles,
                    motion: { ...styles.motion, hoverScale: parseFloat(e.target.value) }
                  })
                }
                className="w-full accent-sky-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* 💾 כפתור שמירה */}
      <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-xl"
          >
            ביטול
          </button>
        )}
        <button
          type="button"
          onClick={() => onSave(data, styles)}
          className="px-5 py-2 text-xs font-bold text-white bg-sky-500 hover:bg-sky-600 shadow-md shadow-sky-500/20 rounded-xl flex items-center gap-1.5"
        >
          <Icons.Check size={16} /> שמור שינויים
        </button>
      </div>
    </div>
  );
};
