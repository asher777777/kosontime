import React from 'react';
import * as Icons from 'lucide-react';
import { HeroSectionViewProps } from './types';
import { useArchetype } from '../../theme/ArchetypeEngine';

/**
 * 👑 HeroSectionView
 * רכיב שער מבודד 100% לתצוגה (Pure Presentation) ב-KOSUN 2026.
 * שואב את כל חוקי העיצוב (צבעים, רקעים, טיפוגרפיה, רדיוס, אנימציה)
 * ישירות מתוך useArchetype() ללא שום הגדרת צבע מקומית!
 */
export const HeroSectionView: React.FC<HeroSectionViewProps> = ({
  data,
  lang = 'he',
  onAction,
  onOpenEditor,
  isOwner = false,
  className = '',
}) => {
  const isRtl = lang === 'he' || lang === 'ar';
  const { activeArchetype } = useArchetype();
  const { style, backdrop, motion, copy } = activeArchetype;

  // ערכי תוכן עם גיבוי מטוקני הקופי של הארכיטיפ
  const title = data.title || 'אינטראקציה שהיא נכס';
  const subtitle = data.subtitle || 'חוויית משתמש מותאמת אישית מונעת קולקציות בענן';
  const badge = data.badge || copy.trustBadge || 'KOSUN 2026 ARCHETYPE';
  const primaryCta = data.primaryCtaText || copy.ctaPrimary || 'התחל עכשיו';
  const secondaryCta = data.secondaryCtaText || copy.ctaSecondary || 'למידע נוסף';

  // חישוב רדיוס לפי טוקן
  const radiusMap: Record<string, string> = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-xl',
    xl: 'rounded-2xl',
    '2xl': 'rounded-3xl',
    full: 'rounded-full',
  };
  const roundedClass = radiusMap[style.borderRadius] || 'rounded-2xl';

  // פונט
  const fontClass = style.fontFamily === 'serif' ? 'font-serif' : style.fontFamily === 'mono' ? 'font-mono' : 'font-sans';

  return (
    <section
      className={`relative w-full overflow-hidden transition-all duration-500 py-10 px-4 sm:px-8 ${fontClass} ${className}`}
      dir={isRtl ? 'rtl' : 'ltr'}
      data-area-id="area_hero_section"
      style={{
        backgroundColor: style.surfaceBg,
        color: style.textPrimary,
      }}
    >
      {/* 🌌 רקע אטמוספרי רוחבי לפי הארכיטיפ (Backdrop Layer) */}
      {backdrop.type === 'cosmos' && (
        <>
          <div
            className="absolute top-0 start-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full blur-[140px] pointer-events-none opacity-30 -z-10"
            style={{ backgroundColor: backdrop.primaryGlowColor || style.primaryColor }}
          />
          <div
            className="absolute bottom-0 end-10 w-[400px] h-[250px] rounded-full blur-[160px] pointer-events-none opacity-20 -z-10"
            style={{ backgroundColor: backdrop.secondaryGlowColor || style.secondaryColor || '#3B82F6' }}
          />
        </>
      )}

      {backdrop.type === 'mesh_gradient' && (
        <div
          className="absolute inset-0 opacity-15 pointer-events-none -z-10"
          style={{
            background: `radial-gradient(circle at 20% 20%, ${style.primaryColor} 0%, transparent 50%), radial-gradient(circle at 80% 80%, ${style.secondaryColor || '#F59E0B'} 0%, transparent 50%)`,
          }}
        />
      )}

      {/* כפתור עריכת אזור מהיר למנהל המערכת */}
      {isOwner && onOpenEditor && (
        <button
          type="button"
          onClick={onOpenEditor}
          className="absolute top-4 start-4 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold shadow-lg active:scale-95 transition-all"
        >
          <Icons.Edit3 size={13} />
          <span>עריכת תוכן השער</span>
        </button>
      )}

      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
        {/* עמודת טקסט ופעולה */}
        <div className="flex-1 text-start space-y-5">
          {/* באדג' ממותג */}
          {badge && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold tracking-wide backdrop-blur-md"
              style={{
                borderColor: `${style.primaryColor}40`,
                backgroundColor: `${style.primaryColor}15`,
                color: style.primaryColor,
              }}
            >
              <Icons.Sparkles size={13} style={{ color: style.primaryColor }} />
              <span>{badge}</span>
            </div>
          )}

          {/* כותרת ראשית */}
          <h1
            className="text-3xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight transition-colors duration-300"
            style={{ color: style.textPrimary }}
          >
            {title}
          </h1>

          {/* כותרת משנה */}
          <p
            className="text-base sm:text-lg leading-relaxed max-w-xl opacity-90 transition-colors duration-300"
            style={{ color: style.textSecondary }}
          >
            {subtitle}
          </p>

          {/* לחצני הנעה לפעולה */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => onAction && onAction('primary_cta', data.primaryCtaLink)}
              className={`px-6 py-3 font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg transition-transform duration-200 active:scale-95 ${roundedClass}`}
              style={{
                backgroundColor: style.primaryColor,
                color: '#FFFFFF',
                boxShadow: `0 8px 24px -6px ${style.primaryColor}66`,
              }}
            >
              <span>{primaryCta}</span>
              {isRtl ? <Icons.ArrowLeft size={16} /> : <Icons.ArrowRight size={16} />}
            </button>

            {data.secondaryCtaText && (
              <button
                type="button"
                onClick={() => onAction && onAction('secondary_cta', data.secondaryCtaLink)}
                className={`px-5 py-3 font-semibold text-sm sm:text-base border backdrop-blur-sm transition-all duration-200 hover:bg-white/10 active:scale-95 ${roundedClass}`}
                style={{
                  borderColor: style.borderColor || `${style.textPrimary}25`,
                  color: style.textPrimary,
                }}
              >
                <span>{secondaryCta}</span>
              </button>
            )}
          </div>

          {/* הוכחה חברתית / עדות מהירה */}
          {data.socialProofText && (
            <div className="flex items-center gap-2 pt-2 text-xs font-medium opacity-80" style={{ color: style.textSecondary }}>
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Icons.Star key={i} size={12} className="fill-amber-400" />
                ))}
              </div>
              <span>{data.socialProofText}</span>
            </div>
          )}
        </div>

        {/* עמודת מדיה / תמונה */}
        {data.mediaUrl && (
          <div className="flex-1 w-full max-w-md">
            <div
              className={`relative overflow-hidden border p-2 backdrop-blur-xl shadow-2xl transition-all duration-500 ${roundedClass}`}
              style={{
                backgroundColor: style.cardBg,
                borderColor: style.borderColor || `${style.primaryColor}30`,
                boxShadow: `0 20px 50px -15px ${style.primaryColor}20`,
              }}
            >
              <img
                src={data.mediaUrl}
                alt={title}
                className={`w-full h-[280px] sm:h-[340px] object-cover transition-transform duration-500 hover:scale-[1.02] ${roundedClass}`}
                loading="lazy"
              />
              <div
                className="absolute inset-0 pointer-events-none rounded-inherit"
                style={{
                  background: `linear-gradient(to top, ${style.surfaceBg} 0%, transparent 40%)`,
                  opacity: 0.35,
                }}
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
