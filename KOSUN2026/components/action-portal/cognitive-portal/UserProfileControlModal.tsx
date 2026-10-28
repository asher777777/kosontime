import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import * as Icons from 'lucide-react';
import { TenantThemeColors, TenantProfile } from './types';
import { KOSUN_STYLE_PRESETS } from '../../../factory/areaCollectionManager';
import { KosunUserAvatar } from './KosunUserAvatar';
import { sound } from '../../../../src/utils/audio';

export interface UserProfileControlModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Audience
  audience: 'guest' | 'owner';
  onSelectAudience: (aud: 'guest' | 'owner') => void;
  // Styles
  currentStylePresetId: string;
  onSelectStylePreset: (presetKey: string) => void;
  // Layouts / Archetypes
  currentLayoutId: string;
  onSelectLayout: (layoutId: 'hero' | 'funnel' | 'catalog' | 'form' | 'community') => void;
  // Theme mode
  colorMode: 'day' | 'night';
  onToggleColorMode: () => void;
  // Advanced Editor
  onOpenQuestionEditor: () => void;
  onOpenOwnerEditor?: () => void;
  // Theming & tenant info
  tenantTheme: TenantThemeColors;
  tenantProfile: TenantProfile | null;
}

type TabType = 'audience' | 'styles' | 'layouts' | 'settings';

export const UserProfileControlModal: React.FC<UserProfileControlModalProps> = ({
  isOpen,
  onClose,
  audience,
  onSelectAudience,
  currentStylePresetId,
  onSelectStylePreset,
  currentLayoutId,
  onSelectLayout,
  colorMode,
  onToggleColorMode,
  onOpenQuestionEditor,
  onOpenOwnerEditor,
  tenantTheme,
  tenantProfile,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('audience');

  if (!isOpen) return null;

  const brandPrimary = tenantTheme.primary || '#00F0FF';
  const isDay = colorMode === 'day';
  const brandName = tenantProfile?.brandName || 'KOSUN 2026';
  const industry = tenantProfile?.category || 'טכנולוגיה ונכסים';

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-xl flex items-center justify-center p-3 animate-in fade-in duration-200 select-none"
      onClick={onClose}
      dir="rtl"
    >
      <div
        className="w-full max-w-[420px] max-h-[90vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 transition-colors"
        style={{
          backgroundColor: isDay ? '#FFFFFF' : '#070913',
          borderColor: `${brandPrimary}40`,
          boxShadow: `0 0 40px ${brandPrimary}33`
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER: User Profile Avatar + Title + Close Button */}
        <header
          className="p-4 border-b flex items-center justify-between shrink-0"
          style={{
            borderColor: isDay ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)',
            backgroundColor: isDay ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.03)'
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="relative w-12 h-12 rounded-2xl flex items-center justify-center border-2 shadow-md shrink-0 p-1"
              style={{
                borderColor: brandPrimary,
                backgroundColor: `${brandPrimary}15`
              }}
            >
              <KosunUserAvatar color={brandPrimary} size={30} />
              <span
                className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-black flex items-center justify-center shadow-sm"
                style={{ backgroundColor: brandPrimary }}
              >
                <Icons.Check size={8} className="text-black stroke-[3]" />
              </span>
            </div>

            <div>
              <h3
                className="text-base font-black tracking-tight font-['Orbitron',sans-serif]"
                style={{ color: isDay ? '#0F172A' : '#F0F4FF' }}
              >
                {brandName}
              </h3>
              <p className="text-xs opacity-70" style={{ color: isDay ? '#475569' : '#94A3B8' }}>
                בקרת פרופיל וסביבת תצוגה • {industry}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              sound.playPop();
              onClose();
            }}
            className="w-9 h-9 rounded-xl flex items-center justify-center border transition-all cursor-pointer active:scale-95"
            style={{
              borderColor: isDay ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.15)',
              backgroundColor: isDay ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.05)',
              color: isDay ? '#0F172A' : '#F0F4FF'
            }}
            title="סגור חלון"
          >
            <Icons.X size={16} />
          </button>
        </header>

        {/* 4 TABS: Babushka Partitioning (קהל יעד | סגנונות | פריסות | עורך ומעבדה) */}
        <div
          className="grid grid-cols-4 p-1.5 gap-1 border-b shrink-0"
          style={{
            borderColor: isDay ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)',
            backgroundColor: isDay ? 'rgba(0,0,0,0.01)' : 'rgba(0,0,0,0.2)'
          }}
        >
          {[
            { id: 'audience' as TabType, label: 'קהל יעד', icon: Icons.Users },
            { id: 'styles' as TabType, label: 'סגנונות', icon: Icons.Palette },
            { id: 'layouts' as TabType, label: 'פריסות', icon: Icons.LayoutGrid },
            { id: 'settings' as TabType, label: 'עורך', icon: Icons.SlidersHorizontal }
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  sound.playPop();
                  setActiveTab(tab.id);
                }}
                className={`py-2 px-1 rounded-xl text-xs font-black flex flex-col items-center justify-center gap-1 transition-all cursor-pointer active:scale-95 ${
                  isActive ? 'shadow-md' : 'opacity-60 hover:opacity-100'
                }`}
                style={{
                  backgroundColor: isActive ? brandPrimary : 'transparent',
                  color: isActive ? '#000000' : (isDay ? '#0F172A' : '#F0F4FF')
                }}
              >
                <TabIcon size={14} />
                <span className="text-[10.5px] leading-none">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB BODY */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* ══════════════════════════════════════════════════════════════════════
              TAB 1: קהל יעד ותפקיד (Audience / Role)
              ══════════════════════════════════════════════════════════════════════ */}
          {activeTab === 'audience' && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <div className="text-xs font-bold opacity-75">
                בחר את מצב הצפייה במערכת:
              </div>

              {/* Guest Card */}
              <button
                type="button"
                onClick={() => {
                  sound.playPop();
                  onSelectAudience('guest');
                }}
                className={`w-full p-3.5 rounded-2xl border text-right transition-all cursor-pointer flex items-center justify-between active:scale-98 ${
                  audience === 'guest' ? 'shadow-lg ring-2' : 'opacity-70 hover:opacity-100'
                }`}
                style={{
                  borderColor: audience === 'guest' ? brandPrimary : (isDay ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)'),
                  backgroundColor: audience === 'guest' ? `${brandPrimary}15` : (isDay ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.02)'),
                  color: isDay ? '#0F172A' : '#F0F4FF'
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border"
                    style={{
                      borderColor: brandPrimary,
                      backgroundColor: `${brandPrimary}25`,
                      color: brandPrimary
                    }}
                  >
                    <Icons.Compass size={20} />
                  </div>
                  <div>
                    <div className="text-sm font-black">מצב אורח (לקוח)</div>
                    <div className="text-[11px] opacity-70">חוויית גולש נקייה, שאלות ממוקדות ואינטראקציה שהיא נכס</div>
                  </div>
                </div>
                {audience === 'guest' && (
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 shadow-sm"
                    style={{ backgroundColor: brandPrimary }}
                  >
                    <Icons.Check size={12} className="text-black stroke-[3]" />
                  </div>
                )}
              </button>

              {/* Owner Card */}
              <button
                type="button"
                onClick={() => {
                  sound.playPop();
                  onSelectAudience('owner');
                }}
                className={`w-full p-3.5 rounded-2xl border text-right transition-all cursor-pointer flex items-center justify-between active:scale-98 ${
                  audience === 'owner' ? 'shadow-lg ring-2 ring-amber-500' : 'opacity-70 hover:opacity-100'
                }`}
                style={{
                  borderColor: audience === 'owner' ? '#F59E0B' : (isDay ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)'),
                  backgroundColor: audience === 'owner' ? 'rgba(245, 158, 11, 0.15)' : (isDay ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.02)'),
                  color: isDay ? '#0F172A' : '#F0F4FF'
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-amber-500/40 bg-amber-500/20 text-amber-500">
                    <Icons.Crown size={20} />
                  </div>
                  <div>
                    <div className="text-sm font-black">מצב מנהל (Owner)</div>
                    <div className="text-[11px] opacity-70">ניהול שאלות, עריכת תכנים, סגנונות וסנכרון לענן</div>
                  </div>
                </div>
                {audience === 'owner' && (
                  <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center shrink-0 shadow-sm">
                    <Icons.Check size={12} className="text-black stroke-[3]" />
                  </div>
                )}
              </button>

              {/* Direct Edit Launcher if Owner */}
              {audience === 'owner' && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      sound.playPop();
                      onClose();
                      if (onOpenOwnerEditor) {
                        onOpenOwnerEditor();
                      } else {
                        onOpenQuestionEditor();
                      }
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95 cursor-pointer"
                  >
                    <Icons.SlidersHorizontal size={14} />
                    <span>פתח מרכז עריכת בעלים (Studio)</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════════
              TAB 2: סגנונות מיתוג ואווירה (Styles)
              ══════════════════════════════════════════════════════════════════════ */}
          {activeTab === 'styles' && (
            <div className="space-y-2.5 animate-in fade-in duration-150">
              <div className="text-xs font-bold opacity-75">
                5 סגנונות הגילוי מהקולקציה:
              </div>

              <div className="flex flex-col gap-2">
                {Object.values(KOSUN_STYLE_PRESETS).map((preset, idx) => {
                  const isActive = currentStylePresetId === preset.value;
                  const primaryC = preset.night.primaryColor || '#00F0FF';
                  return (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => {
                        sound.playPop();
                        onSelectStylePreset(preset.value);
                      }}
                      className={`w-full p-3 rounded-2xl border text-right transition-all cursor-pointer flex items-center justify-between active:scale-98 ${
                        isActive ? 'shadow-md ring-2' : 'opacity-70 hover:opacity-100'
                      }`}
                      style={{
                        borderColor: isActive ? primaryC : (isDay ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)'),
                        backgroundColor: isActive ? `${primaryC}18` : (isDay ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.02)'),
                        color: isDay ? '#0F172A' : '#F0F4FF'
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 shadow-sm"
                          style={{
                            backgroundColor: primaryC,
                            color: '#000000'
                          }}
                        >
                          0{idx + 1}
                        </div>
                        <div>
                          <div className="text-xs sm:text-sm font-black">{preset.label}</div>
                          <div className="text-[10px] opacity-70 font-mono">
                            ארכיטקטורה: {preset.discovery?.mode || preset.capsule?.variant}
                          </div>
                        </div>
                      </div>

                      {isActive && (
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 shadow-sm"
                          style={{ backgroundColor: primaryC }}
                        >
                          <Icons.Check size={11} className="text-black stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════════
              TAB 3: פריסות תצוגה ועמודים (Discovery Layouts)
              ══════════════════════════════════════════════════════════════════════ */}
          {activeTab === 'layouts' && (
            <div className="space-y-2.5 animate-in fade-in duration-150">
              <div className="text-xs font-bold opacity-75">
                5 פריסות גילוי מובנות לבחירה מהירה:
              </div>

              <div className="flex flex-col gap-2">
                {[
                  { id: 'hero', label: '1. הירו ראשי (4 נכסים)', desc: 'עמוד בית ממוקד ללא הסחות דעת', icon: Icons.LayoutGrid },
                  { id: 'funnel', label: '2. משפך שאלות חקר', desc: 'חקר קוגניטיבי מבוסס שיטת חוק ה-3', icon: Icons.HelpCircle },
                  { id: 'catalog', label: '3. קטלוג מצפן', desc: 'קטלוג מוצרים, דגמים ושירותים', icon: Icons.FolderOpen },
                  { id: 'form', label: '4. טופס חכם', desc: 'קליטה מהירה ויצירת קשר ישיר', icon: Icons.Send },
                  { id: 'community', label: '5. קהילה ו-CRM', desc: 'עדכונים, חברים ואירועים', icon: Icons.Users }
                ].map((layout) => {
                  const isActive = currentLayoutId === layout.id;
                  const LayoutIcon = layout.icon;
                  return (
                    <button
                      key={layout.id}
                      type="button"
                      onClick={() => {
                        sound.playPop();
                        onSelectLayout(layout.id as any);
                        onClose();
                      }}
                      className={`w-full p-3 rounded-2xl border text-right transition-all cursor-pointer flex items-center justify-between active:scale-98 ${
                        isActive ? 'shadow-md ring-2' : 'opacity-70 hover:opacity-100'
                      }`}
                      style={{
                        borderColor: isActive ? brandPrimary : (isDay ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)'),
                        backgroundColor: isActive ? `${brandPrimary}18` : (isDay ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.02)'),
                        color: isDay ? '#0F172A' : '#F0F4FF'
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border"
                          style={{
                            borderColor: `${brandPrimary}40`,
                            backgroundColor: `${brandPrimary}20`,
                            color: brandPrimary
                          }}
                        >
                          <LayoutIcon size={16} />
                        </div>
                        <div>
                          <div className="text-xs sm:text-sm font-black">{layout.label}</div>
                          <div className="text-[10.5px] opacity-70">{layout.desc}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-[11px] font-bold" style={{ color: brandPrimary }}>
                        <span>הצג ↵</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════════
              TAB 4: עורך ומעבדה מתקדמת (Settings & Editor)
              ══════════════════════════════════════════════════════════════════════ */}
          {activeTab === 'settings' && (
            <div className="space-y-3.5 animate-in fade-in duration-150">
              <div className="text-xs font-bold opacity-75">
                כלי עריכה מתקדמים והגדרות תאורה:
              </div>

              {/* Theme Mode Toggle Row */}
              <div
                className="p-3.5 rounded-2xl border flex items-center justify-between"
                style={{
                  borderColor: isDay ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)',
                  backgroundColor: isDay ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.02)'
                }}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center border"
                    style={{
                      borderColor: `${brandPrimary}40`,
                      backgroundColor: `${brandPrimary}20`,
                      color: brandPrimary
                    }}
                  >
                    {isDay ? <Icons.Sun size={18} /> : <Icons.Moon size={18} />}
                  </div>
                  <div>
                    <div className="text-xs font-bold">מצב תאורה פעיל: {isDay ? 'יום (בהיר)' : 'לילה (כהה)'}</div>
                    <div className="text-[10px] opacity-70">משפיע מיידית על כל הקולקציות והמודלים</div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    sound.playPop();
                    onToggleColorMode();
                  }}
                  className="py-1.5 px-3 rounded-xl border text-xs font-black transition-all cursor-pointer active:scale-95"
                  style={{
                    backgroundColor: brandPrimary,
                    color: '#000000',
                    borderColor: brandPrimary
                  }}
                >
                  {isDay ? 'החלף ללילה 🌙' : 'החלף ליום ☀️'}
                </button>
              </div>

              {/* Discovery Editor Trigger */}
              <button
                type="button"
                onClick={() => {
                  sound.playPop();
                  onClose();
                  onOpenQuestionEditor();
                }}
                className="w-full p-3.5 rounded-2xl border text-right transition-all cursor-pointer flex items-center justify-between group active:scale-98"
                style={{
                  borderColor: `${brandPrimary}50`,
                  backgroundColor: `${brandPrimary}15`,
                  color: isDay ? '#0F172A' : '#F0F4FF'
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center border shadow-sm"
                    style={{
                      borderColor: brandPrimary,
                      backgroundColor: brandPrimary,
                      color: '#000000'
                    }}
                  >
                    <Icons.SlidersHorizontal size={18} />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-black">פתח עורך פריסות וסגנונות</div>
                    <div className="text-[10.5px] opacity-70">ניהול כרטיסי בבושקה, שאלות ועריכת תוכן</div>
                  </div>
                </div>

                <Icons.ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" style={{ color: brandPrimary }} />
              </button>

              {/* Owner Edit Modal Trigger */}
              {onOpenOwnerEditor && (
                <button
                  type="button"
                  onClick={() => {
                    sound.playPop();
                    onClose();
                    onOpenOwnerEditor();
                  }}
                  className="w-full p-3.5 rounded-2xl border text-right transition-all cursor-pointer flex items-center justify-between group active:scale-98"
                  style={{
                    borderColor: 'rgba(245, 158, 11, 0.4)',
                    backgroundColor: 'rgba(245, 158, 11, 0.12)',
                    color: isDay ? '#0F172A' : '#F0F4FF'
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-500 text-black flex items-center justify-center shadow-sm">
                      <Icons.Crown size={18} />
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-black">עורך ה-DNA המותגי (Owner Studio)</div>
                      <div className="text-[10.5px] opacity-70">עריכת צבעי יסוד, מדיה, לוגו וקולקציות</div>
                    </div>
                  </div>

                  <Icons.ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform text-amber-500" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <footer
          className="p-3 border-t flex items-center justify-between text-[11px] opacity-60 shrink-0"
          style={{
            borderColor: isDay ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)'
          }}
        >
          <span>KOSUN 2026 • אינטראקציה שהיא נכס</span>
          <button
            type="button"
            onClick={() => {
              sound.playPop();
              onClose();
            }}
            className="font-bold underline cursor-pointer"
          >
            סגור
          </button>
        </footer>
      </div>
    </div>
  );

  return typeof document !== 'undefined'
    ? createPortal(modalContent, document.body)
    : null;
};
