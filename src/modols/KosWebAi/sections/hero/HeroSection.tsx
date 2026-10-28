import React from 'react';
import { HeroSectionConfig } from '../../types/sectionConfigs';
import { useArchetype } from '../../../../../KOSUN2026/theme';
import { resolveSafeMediaUrl } from '@/core';
import { useArchetypeMediaStream } from '../../../KosCloudStore/services/archetypeMediaStreamService';
import { eventBus } from '@/core/bridge/EventBus';
import * as Icons from 'lucide-react';

export interface HeroSectionProps {
  config: HeroSectionConfig;
  onCtaAction?: (actionType: string, payload: any) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ config, onCtaAction }) => {
  const { activeArchetype, activeId } = useArchetype();
  const themeStyle = activeArchetype.style;
  const themeCopy = activeArchetype.copy;

  // 1. הזרמה חיה של קובצי מדיה מ-KosCloudStore (על פי תיקיית הארכיטיפ בקולקציית sdo_media_items)
  const { heroImageUrl, heroVideoUrl } = useArchetypeMediaStream(activeId);

  const {
    anchorId,
    title,
    subtitle,
    description,
    imageSrc,
    videoBgUrl,
    mediaType = 'image',
    layout = 'centered',
    buttonsVisible = true,
    primaryButton,
    secondaryButton,
    announcementBadge,
    ctaActionType = 'smart_form_modal',
    ctaFormId = 'template_lead_capture',
    ctaTargetPageId,
    ctaWhatsappPhone = '972500000000',
    ctaWhatsappMessage = 'שלום, אשמח לקבל פרטים נוספים',
  } = config;

  // 2. חילוץ תוכן נקי ומיקרו-קופי (Single Source of Truth)
  const effectiveTitle = title || themeCopy.inquiryTitle || 'אינטראקציה שהיא נכס';
  const effectiveSubtitle = subtitle || description || themeCopy.inquirySubtitle || '';
  const effectiveBadge = announcementBadge?.text || themeCopy.trustBadge || '';
  const effectivePrimaryBtnText = primaryButton?.text || themeCopy.ctaPrimary || 'התחל עכשיו';
  const effectiveSecondaryBtnText = secondaryButton?.text || themeCopy.ctaSecondary;

  // 3. מדיה נקייה: תמונה נשלפת מהקונפיג או בהזרמה חיה מ-KosCloudStore
  const effectiveImageSrc = imageSrc || heroImageUrl;
  const safeImageSrc = resolveSafeMediaUrl(effectiveImageSrc);

  // וידאו רקע: נשלף מהקונפיג או בהזרמה חיה מ-KosCloudStore
  const effectiveVideoUrl = videoBgUrl || (mediaType === 'video' ? heroVideoUrl : '');
  const isVideoActive = Boolean(effectiveVideoUrl);

  // 4. טוקני רדיוס ופונט
  const radiusTokenMap: Record<string, string> = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-xl',
    xl: 'rounded-2xl',
    '2xl': 'rounded-3xl',
    full: 'rounded-full',
  };
  const roundedClass = radiusTokenMap[themeStyle.borderRadius] || 'rounded-2xl';

  const fontClass =
    themeStyle.fontFamily === 'serif' ? 'font-serif' : themeStyle.fontFamily === 'mono' ? 'font-mono' : 'font-sans';

  // 5. ניהול הזרימה בלחיצת כפתור ה-CTA (שליחת אירוע ל-Host / מעטפת הדף ללא מודאלים תפורים בקוד)
  const handlePrimaryCtaClick = (e: React.MouseEvent) => {
    e.preventDefault();

    // א. פתיחת טופס חכם באמצעות שידור אירוע למעטפת המרכזית (EventBus)
    if (ctaActionType === 'smart_form_modal') {
      eventBus.emit('smart_form:open', {
        formId: ctaFormId,
        triggerSection: 'hero',
        title: effectiveTitle,
      });
      onCtaAction?.('smart_form_modal', { formId: ctaFormId, triggerSection: 'hero' });
      return;
    }

    // ב. ניווט פנימי / גלילה לאזור בעמוד
    if (ctaActionType === 'internal_page') {
      const target = ctaTargetPageId || primaryButton?.url || '#contact';
      if (target.startsWith('#')) {
        const el = document.querySelector(target);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
          return;
        }
      }
      window.location.href = target;
      return;
    }

    // ג. פתיחת שיחת וואטסאפ ישירה
    if (ctaActionType === 'whatsapp') {
      const cleanPhone = ctaWhatsappPhone.replace(/\D/g, '');
      const encodedMsg = encodeURIComponent(ctaWhatsappMessage);
      window.open(`https://wa.me/${cleanPhone}?text=${encodedMsg}`, '_blank');
      return;
    }

    // ד. קישור חיצוני
    if (primaryButton?.url) {
      if (primaryButton.target === '_blank') {
        window.open(primaryButton.url, '_blank');
      } else {
        window.location.href = primaryButton.url;
      }
    }
  };

  const isCenteredWithBg = layout === 'centered';
  const isSplitLayout = layout === 'split' || layout === 'fz' || layout === 'spatial';

  return (
    <section
      id={anchorId || 'hero'}
      className={`relative w-full overflow-hidden transition-colors duration-500 select-none ${fontClass}`}
      dir="rtl"
      data-area-id="area_hero_section"
      style={{
        backgroundColor: themeStyle.surfaceBg,
        color: themeStyle.textPrimary,
      }}
    >
      {/* =========================================================================
          תצוגה א': רקע תמונה / וידאו מאחור 100%, שכבת Overlay, כותרת, תיאור ו-CTA ממורכז
          ========================================================================= */}
      {isCenteredWithBg ? (
        <div className="relative min-h-[540px] sm:min-h-[660px] flex items-center justify-center px-4 py-16 sm:py-24">
          {/* 🎞️ רקע מדיה (וידאו או תמונה מוזרמת מ-KosCloudStore) */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            {isVideoActive ? (
              <video
                src={resolveSafeMediaUrl(effectiveVideoUrl)}
                autoPlay
                loop
                muted
                playsInline
                poster={safeImageSrc}
                className="w-full h-full object-cover object-center scale-105"
              />
            ) : (
              <img
                src={safeImageSrc}
                alt=""
                aria-hidden="true"
                className="w-full h-full object-cover object-center scale-105 transition-transform duration-1000 ease-out"
                loading="lazy"
              />
            )}
            {/* שכבת כיסוי מותאמת ארכיטיפ (Overlay) */}
            <div
              className="absolute inset-0 backdrop-blur-[1.5px] transition-opacity duration-500"
              style={{
                background: `linear-gradient(to bottom, ${themeStyle.surfaceBg}E6 0%, ${themeStyle.surfaceBg}B3 50%, ${themeStyle.surfaceBg}FA 100%)`,
              }}
            />
          </div>

          {/* תוכן נקי ממורכז - מובייל פירסט */}
          <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center text-center space-y-4 sm:space-y-6">
            {effectiveBadge && (
              <div
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs sm:text-sm font-semibold tracking-wide backdrop-blur-md transition-all"
                style={{
                  backgroundColor: `${themeStyle.primaryColor}18`,
                  borderColor: `${themeStyle.primaryColor}50`,
                  color: themeStyle.primaryColor,
                }}
              >
                <Icons.Sparkles size={14} style={{ color: themeStyle.primaryColor }} />
                <span>{effectiveBadge}</span>
              </div>
            )}

            <h1
              className="text-3xl sm:text-5xl md:text-6xl font-black leading-[1.15] tracking-tight drop-shadow-sm max-w-2xl"
              style={{ color: themeStyle.textPrimary }}
            >
              {effectiveTitle}
            </h1>

            {effectiveSubtitle && (
              <p
                className="text-sm sm:text-lg leading-relaxed max-w-xl opacity-90 transition-opacity"
                style={{ color: themeStyle.textSecondary }}
              >
                {effectiveSubtitle}
              </p>
            )}

            {/* כפתורי הנעה לפעולה */}
            {buttonsVisible && (
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handlePrimaryCtaClick}
                  className={`w-full sm:w-auto min-h-[48px] px-8 py-3.5 font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-xl transition-all duration-200 active:scale-95 cursor-pointer ${roundedClass}`}
                  style={{
                    backgroundColor: themeStyle.primaryColor,
                    color: '#FFFFFF',
                    boxShadow: `0 10px 30px -8px ${themeStyle.primaryColor}66`,
                  }}
                >
                  <span>{effectivePrimaryBtnText}</span>
                  {ctaActionType === 'smart_form_modal' ? (
                    <Icons.FormInput size={16} />
                  ) : ctaActionType === 'whatsapp' ? (
                    <Icons.MessageCircle size={16} />
                  ) : (
                    <Icons.ArrowLeft size={16} />
                  )}
                </button>

                {effectiveSecondaryBtnText && (
                  <a
                    href={secondaryButton?.url || '#'}
                    target={secondaryButton?.target}
                    className={`w-full sm:w-auto min-h-[48px] px-6 py-3.5 font-semibold text-sm sm:text-base border backdrop-blur-md transition-all duration-200 hover:bg-white/10 active:scale-95 flex items-center justify-center ${roundedClass}`}
                    style={{
                      borderColor: themeStyle.borderColor || `${themeStyle.textPrimary}25`,
                      color: themeStyle.textPrimary,
                    }}
                  >
                    <span>{effectiveSecondaryBtnText}</span>
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      ) : isSplitLayout ? (
        /* =========================================================================
           תצוגה ב': פרוס ב-100% / מפוצל (טקסט ו-CTA בעמודה אחת ומדיה בעמודה שנייה)
           ========================================================================= */
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 sm:py-20 flex flex-col md:flex-row items-center justify-between gap-8 sm:gap-12 relative z-10">
          <div className="flex-1 w-full text-start space-y-4 sm:space-y-6">
            {effectiveBadge && (
              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold backdrop-blur-md"
                style={{
                  backgroundColor: `${themeStyle.primaryColor}15`,
                  borderColor: `${themeStyle.primaryColor}40`,
                  color: themeStyle.primaryColor,
                }}
              >
                <Icons.Sparkles size={13} style={{ color: themeStyle.primaryColor }} />
                <span>{effectiveBadge}</span>
              </div>
            )}

            <h1
              className="text-3xl sm:text-5xl font-black leading-tight tracking-tight"
              style={{ color: themeStyle.textPrimary }}
            >
              {effectiveTitle}
            </h1>

            {effectiveSubtitle && (
              <p
                className="text-sm sm:text-base md:text-lg leading-relaxed opacity-90"
                style={{ color: themeStyle.textSecondary }}
              >
                {effectiveSubtitle}
              </p>
            )}

            {buttonsVisible && (
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handlePrimaryCtaClick}
                  className={`min-h-[48px] px-8 py-3.5 font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-xl transition-all duration-200 active:scale-95 cursor-pointer ${roundedClass}`}
                  style={{
                    backgroundColor: themeStyle.primaryColor,
                    color: '#FFFFFF',
                    boxShadow: `0 10px 30px -8px ${themeStyle.primaryColor}66`,
                  }}
                >
                  <span>{effectivePrimaryBtnText}</span>
                  {ctaActionType === 'smart_form_modal' ? (
                    <Icons.FormInput size={16} />
                  ) : ctaActionType === 'whatsapp' ? (
                    <Icons.MessageCircle size={16} />
                  ) : (
                    <Icons.ArrowLeft size={16} />
                  )}
                </button>

                {effectiveSecondaryBtnText && (
                  <a
                    href={secondaryButton?.url || '#'}
                    target={secondaryButton?.target}
                    className={`min-h-[48px] px-6 py-3.5 font-semibold text-sm sm:text-base border backdrop-blur-md transition-all duration-200 hover:bg-white/10 active:scale-95 flex items-center justify-center ${roundedClass}`}
                    style={{
                      borderColor: themeStyle.borderColor || `${themeStyle.textPrimary}25`,
                      color: themeStyle.textPrimary,
                    }}
                  >
                    <span>{effectiveSecondaryBtnText}</span>
                  </a>
                )}
              </div>
            )}
          </div>

          {/* עמודת מדיה (וידאו או תמונה) ברוחב 100% במובייל */}
          <div className="flex-1 w-full max-w-lg">
            <div
              className={`relative overflow-hidden border p-2 backdrop-blur-xl shadow-2xl transition-all ${roundedClass}`}
              style={{
                backgroundColor: themeStyle.cardBg,
                borderColor: themeStyle.borderColor || `${themeStyle.primaryColor}30`,
              }}
            >
              {isVideoActive ? (
                <video
                  src={resolveSafeMediaUrl(effectiveVideoUrl)}
                  autoPlay
                  loop
                  muted
                  playsInline
                  poster={safeImageSrc}
                  className={`w-full h-[260px] sm:h-[360px] object-cover ${roundedClass}`}
                />
              ) : (
                <img
                  src={safeImageSrc}
                  alt={effectiveTitle}
                  className={`w-full h-[260px] sm:h-[360px] object-cover transition-transform duration-500 hover:scale-[1.02] ${roundedClass}`}
                  loading="lazy"
                />
              )}
            </div>
          </div>
        </div>
      ) : (
        /* =========================================================================
           תצוגה ג': בנטו עכשווי (Bento Hero - Showcase)
           ========================================================================= */
        <div className="max-w-5xl mx-auto px-4 py-12 sm:py-20 flex flex-col items-center text-center space-y-6">
          {effectiveBadge && (
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold backdrop-blur-md"
              style={{
                backgroundColor: `${themeStyle.primaryColor}15`,
                borderColor: `${themeStyle.primaryColor}40`,
                color: themeStyle.primaryColor,
              }}
            >
              <Icons.Sparkles size={13} style={{ color: themeStyle.primaryColor }} />
              <span>{effectiveBadge}</span>
            </div>
          )}

          <h1
            className="text-3xl sm:text-5xl font-extrabold leading-tight tracking-tight max-w-3xl"
            style={{ color: themeStyle.textPrimary }}
          >
            {effectiveTitle}
          </h1>

          {effectiveSubtitle && (
            <p
              className="text-sm sm:text-base leading-relaxed max-w-xl opacity-90"
              style={{ color: themeStyle.textSecondary }}
            >
              {effectiveSubtitle}
            </p>
          )}

          {buttonsVisible && (
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={handlePrimaryCtaClick}
                className={`min-h-[48px] px-8 py-3.5 font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg active:scale-95 cursor-pointer ${roundedClass}`}
                style={{
                  backgroundColor: themeStyle.primaryColor,
                  color: '#FFFFFF',
                  boxShadow: `0 8px 24px -6px ${themeStyle.primaryColor}66`,
                }}
              >
                <span>{effectivePrimaryBtnText}</span>
                <Icons.ArrowLeft size={16} />
              </button>
            </div>
          )}

          <div
            className={`w-full max-w-3xl mt-4 p-2 border backdrop-blur-xl shadow-2xl overflow-hidden ${roundedClass}`}
            style={{
              backgroundColor: themeStyle.cardBg,
              borderColor: themeStyle.borderColor || `${themeStyle.primaryColor}30`,
            }}
          >
            {isVideoActive ? (
              <video
                src={resolveSafeMediaUrl(effectiveVideoUrl)}
                autoPlay
                loop
                muted
                playsInline
                poster={safeImageSrc}
                className={`w-full h-[220px] sm:h-[340px] object-cover ${roundedClass}`}
              />
            ) : (
              <img
                src={safeImageSrc}
                alt=""
                className={`w-full h-[220px] sm:h-[340px] object-cover ${roundedClass}`}
                loading="lazy"
              />
            )}
          </div>
        </div>
      )}
    </section>
  );
};
