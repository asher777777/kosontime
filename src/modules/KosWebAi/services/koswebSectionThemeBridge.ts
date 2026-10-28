import { useState, useEffect } from 'react';
import { getTerminology } from '../../../../KOSUN2026/factory/pageTerminologyDictionary';
import { KOSUN_STYLE_PRESETS } from '../../../../KOSUN2026/factory/areaCollectionManager';

export interface KoswebThemeTokens {
  presetId: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  glowColor: string;
  cardBg: string;
  cardBorder: string;
  textTitle: string;
  textBody: string;
  textMuted: string;
  buttonPrimaryBg: string;
  buttonPrimaryText: string;
  buttonSecondaryBg: string;
  buttonSecondaryText: string;
  containerBg: string;
  isDark: boolean;
}

/**
 * 📚 שליפת תוכן קופי דינמי נקי לאזורי KosWebAi
 * תומך בהיררכיית מילון 3-שכבות (מערכת -> ארכיטיפ שוק -> טננט)
 */
export function getKoswebTerminology(
  termId: string,
  fallbackDefault?: string,
  archetypeId?: string,
  customDict?: Record<string, string>
): string {
  try {
    const val = getTerminology(termId, archetypeId || 'saas', customDict);
    // אם לא נמצא מונח (הפונקציה מחזירה את ה-id עצמו) ויש fallback, נשתמש בו
    if (val === termId && fallbackDefault) {
      return fallbackDefault;
    }
    return val || fallbackDefault || termId;
  } catch (err) {
    return fallbackDefault || termId;
  }
}

/**
 * 🎨 שליפת ערכת סגנון דינמית לאזור מתוך קולקציית KOSUN_STYLE_PRESETS
 */
export function getKoswebSectionTheme(stylePresetId?: string, isDark: boolean = true): KoswebThemeTokens {
  const normId = (stylePresetId || 'cyber_neon').toLowerCase();
  const presetDef = KOSUN_STYLE_PRESETS[normId] || KOSUN_STYLE_PRESETS['cyber_neon'];

  // צבעי יסוד מוגדרים
  let primary = '#00F0FF';
  let secondary = '#38BDF8';
  let accent = '#F59E0B';
  let glow = 'rgba(0, 240, 255, 0.35)';

  if (normId.includes('gold') || normId.includes('luxury') || normId === 'spiritual') {
    primary = '#EAB308';
    secondary = '#F59E0B';
    accent = '#FBBF24';
    glow = 'rgba(234, 179, 8, 0.35)';
  } else if (normId.includes('emerald') || normId.includes('nature') || normId === 'analytical') {
    primary = '#10B981';
    secondary = '#059669';
    accent = '#34D399';
    glow = 'rgba(16, 185, 129, 0.35)';
  } else if (normId.includes('rose') || normId.includes('pink') || normId === 'feminine') {
    primary = '#EC4899';
    secondary = '#F43F5E';
    accent = '#FB7185';
    glow = 'rgba(236, 72, 153, 0.35)';
  } else if (normId.includes('purple') || normId.includes('violet')) {
    primary = '#8B5CF6';
    secondary = '#A855F7';
    accent = '#C084FC';
    glow = 'rgba(139, 92, 246, 0.35)';
  } else if (normId.includes('blue') || normId === 'masculine') {
    primary = '#2563EB';
    secondary = '#0284C7';
    accent = '#38BDF8';
    glow = 'rgba(37, 99, 235, 0.35)';
  }

  if (isDark) {
    return {
      presetId: normId,
      primaryColor: primary,
      secondaryColor: secondary,
      accentColor: accent,
      glowColor: glow,
      cardBg: 'bg-zinc-900/80 backdrop-blur-md',
      cardBorder: 'border-white/10 hover:border-white/20',
      textTitle: 'text-white',
      textBody: 'text-zinc-300',
      textMuted: 'text-zinc-500',
      buttonPrimaryBg: `style={{ backgroundColor: '${primary}' }}`,
      buttonPrimaryText: 'text-black font-semibold',
      buttonSecondaryBg: 'bg-zinc-800/80 hover:bg-zinc-700/80',
      buttonSecondaryText: 'text-zinc-200',
      containerBg: 'bg-zinc-950 text-white',
      isDark: true,
    };
  }

  return {
    presetId: normId,
    primaryColor: primary,
    secondaryColor: secondary,
    accentColor: accent,
    glowColor: glow,
    cardBg: 'bg-white/90 backdrop-blur-md',
    cardBorder: 'border-zinc-200 hover:border-zinc-300 shadow-sm',
    textTitle: 'text-zinc-900',
    textBody: 'text-zinc-700',
    textMuted: 'text-zinc-500',
    buttonPrimaryBg: `style={{ backgroundColor: '${primary}' }}`,
    buttonPrimaryText: 'text-white font-semibold',
    buttonSecondaryBg: 'bg-zinc-100 hover:bg-zinc-200',
    buttonSecondaryText: 'text-zinc-800',
    containerBg: 'bg-zinc-50 text-zinc-900',
    isDark: false,
  };
}

/**
 * 🪝 Hook לניהול סגנון וערכת נושא דינמית באזורי האתר
 */
export function useKoswebSectionTheme(stylePresetId?: string): KoswebThemeTokens {
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    return (
      document.documentElement.classList.contains('dark') ||
      window.matchMedia('(prefers-color-scheme: dark)').matches
    );
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  return getKoswebSectionTheme(stylePresetId, isDark);
}

/**
 * 🏷️ תגיות אזור ייעודיות לחיבור תקציב שטח ועריכה
 */
export function getKoswebSectionContainerProps(sectionType: string, stylePresetId?: string) {
  return {
    'data-area-id': `area_section_${sectionType.toLowerCase()}`,
    'data-style-preset': stylePresetId || 'cyber_neon',
  };
}
