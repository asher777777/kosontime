import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import { useArchetype } from '../../theme/ArchetypeEngine';
import { KosActionPortalViewProps, ActionPortalItem } from './types';

// פונקציית עזר לשליפת אייקון מ-Lucide בצורה דינמית ובטוחה
const DynamicIcon: React.FC<{ name?: string; className?: string; size?: number }> = ({ 
  name, 
  className = '', 
  size = 22 
}) => {
  if (!name) return <Icons.Sparkles size={size} className={className} />;
  const IconComponent = (Icons as any)[name] || Icons.Sparkles;
  return <IconComponent size={size} className={className} />;
};

export const KosActionPortalView: React.FC<KosActionPortalViewProps> = ({
  data,
  styleOverrides,
  onAction,
  onVoiceInputSubmit,
  slotTopHero,
  slotBottomBar,
  slotEmptyState
}) => {
  const { activeArchetype } = useArchetype();
  const [voiceQuery, setVoiceQuery] = useState('');
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);

  // 1. מיזוג של ה-Archetype הפעיל עם דריסות העיצוב הספציפיות של הפורטל
  const activeBackdrop = { ...activeArchetype.backdrop, ...styleOverrides?.backdrop };
  const activeMotion = { ...activeArchetype.motion, ...styleOverrides?.motion };
  const activeStyle = { ...activeArchetype.style, ...styleOverrides?.style };
  const activeCopy = { ...activeArchetype.copy, ...styleOverrides?.copy };
  const activeLayout = styleOverrides?.layout || activeArchetype.defaultLayout || 'vertical_pills';

  // נתוני ברירת מחדל אם טרם סופקו
  const portalTitle = data?.title || activeCopy.inquiryTitle || 'אלו הם המוצרים שלנו';
  const portalItems = data?.items || [];

  // טיפול בשליחת קלט קולי / טקסט
  const handleVoiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!voiceQuery.trim()) return;
    onVoiceInputSubmit?.(voiceQuery);
    setVoiceQuery('');
  };

  // מיפוי רדיוס ל-Tailwind
  const radiusMap: Record<string, string> = {
    none: 'rounded-none',
    sm: 'rounded-md',
    md: 'rounded-xl',
    lg: 'rounded-2xl',
    xl: 'rounded-3xl',
    '2xl': 'rounded-[32px]',
    full: 'rounded-full'
  };
  const cardRadiusClass = radiusMap[activeStyle.borderRadius] || 'rounded-2xl';

  return (
    <div 
      dir="rtl" 
      className="relative min-h-[700px] w-full flex flex-col items-center justify-between p-4 sm:p-6 overflow-hidden select-none"
      style={{
        backgroundColor: activeStyle.surfaceBg,
        fontFamily: activeStyle.fontFamily === 'serif' ? 'serif' : 'sans-serif'
      }}
    >
      {/* 🌌 שכבת רקע דינמית (Backdrop Layer) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {activeBackdrop.type === 'cosmos' && (
          <div className="absolute inset-0 bg-gradient-to-b from-[#e8edf2] via-[#d5e0ea] to-[#cbd7e3]">
            {/* הילת KOSUN זוהרת במרכז */}
            <div 
              className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] rounded-full blur-[90px] opacity-60"
              style={{ backgroundColor: activeBackdrop.primaryGlowColor || '#00d2ff' }}
            />
            {/* חלקיקים / כוכבים */}
            {activeBackdrop.showParticles && (
              <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#0072ff_1px,transparent_1px)] [background-size:24px_24px]" />
            )}
          </div>
        )}

        {activeBackdrop.type === 'aurora' && (
          <div className="absolute inset-0 bg-gradient-to-tr from-rose-100 via-pink-50 to-amber-50">
            <div 
              className="absolute -top-20 right-0 w-[400px] h-[400px] rounded-full blur-[100px] opacity-40"
              style={{ backgroundColor: activeBackdrop.primaryGlowColor || '#f43f5e' }}
            />
          </div>
        )}

        {activeBackdrop.type === 'ambient_glow' && (
          <div className="absolute inset-0 bg-[#09090b]">
            <div 
              className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full blur-[120px] opacity-30"
              style={{ backgroundColor: activeBackdrop.primaryGlowColor || '#2563eb' }}
            />
          </div>
        )}
      </div>

      {/* 🔝 חלק עליון: סמל KOSUN / Hero Slot וכותרת */}
      <div className="relative z-10 w-full flex flex-col items-center mt-2 mb-6 text-center">
        {slotTopHero ? (
          slotTopHero
        ) : (
          <div className="flex flex-col items-center">
            {data?.logoUrl ? (
              <img 
                src={data.logoUrl} 
                alt="Logo" 
                className="w-28 h-28 object-contain drop-shadow-xl animate-pulse duration-1000" 
              />
            ) : (
              // סמל ברירת מחדל עתידני של KOSUN בתלת ממד
              <div className="relative w-24 h-24 mb-3 flex items-center justify-center">
                <div 
                  className="w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-transform duration-500 hover:scale-105"
                  style={{
                    background: `linear-gradient(135deg, ${activeStyle.primaryColor}, ${activeStyle.secondaryColor || '#0072ff'})`
                  }}
                >
                  <Icons.Sparkles size={36} className="text-white drop-shadow" />
                </div>
                <div className="absolute -bottom-1 bg-white/90 backdrop-blur-md px-2.5 py-0.5 rounded-full shadow border border-sky-200">
                  <span className="text-[10px] font-black tracking-wider uppercase" style={{ color: activeStyle.primaryColor }}>
                    KOSUN
                  </span>
                </div>
              </div>
            )}

            <h1 
              className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-2 drop-shadow-sm"
              style={{ color: activeStyle.textPrimary }}
            >
              {portalTitle}
            </h1>
            {data?.subtitle && (
              <p className="text-sm mt-1" style={{ color: activeStyle.textSecondary }}>
                {data.subtitle}
              </p>
            )}
          </div>
        )}
      </div>

      {/* 📋 חלק מרכזי: רשימת הכרטיסיות לפי הפריסה הנבחרת */}
      <div className="relative z-10 w-full max-w-md mx-auto flex-1 flex flex-col justify-center">
        {portalItems.length === 0 ? (
          slotEmptyState || (
            <div className="p-8 text-center text-slate-400 bg-white/50 backdrop-blur-sm rounded-2xl border border-dashed border-slate-300">
              {activeCopy.emptyStateText || 'אין פריטים להצגה'}
            </div>
          )
        ) : (
          <div className={
            activeLayout === 'grid_2col'
              ? 'grid grid-cols-2 gap-3 w-full'
              : 'flex flex-col gap-3.5 w-full'
          }>
            {portalItems.map((item: ActionPortalItem, index: number) => {
              const isHovered = hoveredItemId === item.id;
              
              return (
                <div
                  key={item.id}
                  onClick={() => !item.disabled && onAction?.(item.actionType, item.payload)}
                  onMouseEnter={() => setHoveredItemId(item.id)}
                  onMouseLeave={() => setHoveredItemId(null)}
                  style={{
                    backgroundColor: activeStyle.cardBg,
                    borderColor: isHovered ? activeStyle.primaryColor : activeStyle.borderColor,
                    borderWidth: activeStyle.borderWidth,
                    transform: isHovered ? `scale(${activeMotion.hoverScale})` : 'scale(1)',
                    transitionDuration: `${activeMotion.transitionDurationMs}ms`,
                    animationDelay: `${index * activeMotion.staggerDelayMs}ms`
                  }}
                  className={`group relative flex items-center justify-between p-3 sm:p-3.5 shadow-sm hover:shadow-md cursor-pointer transition-all ${cardRadiusClass} ${
                    item.disabled ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {/* צד ימין: תג האייקון המעוגל + מספר סידורי (בדיוק כמו בתמונה!) */}
                  <div className="flex items-center gap-3">
                    <div 
                      className="relative w-12 h-12 rounded-2xl flex flex-col items-center justify-center border-2 transition-colors duration-300"
                      style={{
                        borderColor: activeStyle.primaryColor,
                        backgroundColor: isHovered ? `${activeStyle.primaryColor}15` : '#f0f9ff'
                      }}
                    >
                      <DynamicIcon 
                        name={item.primaryIconName} 
                        size={20}
                        className="transition-transform group-hover:scale-110" 
                      />
                      {item.indexBadge && (
                        <span 
                          className="text-[9px] font-bold tracking-tighter leading-none mt-0.5"
                          style={{ color: activeStyle.primaryColor }}
                        >
                          {item.indexBadge}
                        </span>
                      )}
                    </div>

                    {/* טקסט הכותרת */}
                    <div className="flex flex-col text-right">
                      <span 
                        className="font-bold text-base sm:text-lg tracking-wide group-hover:opacity-90 transition-opacity"
                        style={{ color: activeStyle.textPrimary }}
                      >
                        {item.title}
                      </span>
                      {item.subtitle && (
                        <span className="text-xs" style={{ color: activeStyle.textSecondary }}>
                          {item.subtitle}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* צד שמאל: אייקון משני + חץ ניווט שמאלי (<) */}
                  <div className="flex items-center gap-2 pl-2">
                    {item.secondaryIconName && (
                      <div 
                        className="opacity-70 group-hover:opacity-100 transition-opacity"
                        style={{ color: activeStyle.primaryColor }}
                      >
                        <DynamicIcon name={item.secondaryIconName} size={18} />
                      </div>
                    )}
                    <Icons.ChevronLeft 
                      size={20} 
                      className="text-slate-400 group-hover:text-sky-500 group-hover:-translate-x-1 transition-all duration-200" 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 🔽 חלק תחתון: שורת הקלט הקולי / סוכן AI (כמו בתמונה) */}
      <div className="relative z-10 w-full max-w-md mx-auto mt-6">
        {slotBottomBar ? (
          slotBottomBar
        ) : (
          <div className="flex items-center gap-3 w-full">
            {/* אווטאר הסוכן */}
            <div className="relative flex-shrink-0">
              {data?.agentAvatarUrl ? (
                <img 
                  src={data.agentAvatarUrl} 
                  alt="Agent" 
                  className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
                />
              ) : (
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shadow-md border-2 border-white"
                  style={{ backgroundColor: activeStyle.primaryColor }}
                >
                  <Icons.Bot size={24} />
                </div>
              )}
              {/* נקודת אונליין ירוקה */}
              <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
            </div>

            {/* שורת קלט קולית בצורת קפסולה */}
            <form onSubmit={handleVoiceSubmit} className="flex-1 relative">
              <input
                type="text"
                value={voiceQuery}
                onChange={(e) => setVoiceQuery(e.target.value)}
                placeholder={activeArchetype.inputMode.submitButtonText || 'קליטה...'}
                className="w-full h-11 pl-10 pr-4 bg-white/95 backdrop-blur-md rounded-full shadow-sm border border-slate-200 focus:outline-none focus:ring-2 text-sm text-slate-800 placeholder-slate-400"
                style={{ borderColor: activeStyle.borderColor }}
              />
              <button 
                type="button" 
                onClick={() => onVoiceInputSubmit?.(voiceQuery || 'Voice Listening Activated')}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 text-sky-500 hover:text-sky-600 hover:bg-sky-50 rounded-full transition-colors"
              >
                <Icons.Mic size={18} />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
