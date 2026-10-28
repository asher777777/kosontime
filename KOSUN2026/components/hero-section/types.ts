/**
 * KOSUN 2026 - Hero Section Contracts & Types
 * ארכיטקטורת רכיב שער מבודד (View + Guided Content Editor)
 * ללא שדות עיצוב או צבעים מקומיים - הכל נגזר מתוך קולקציית הארכיטיפים.
 */

export type HeroBusinessIntent = 'conversion' | 'authority' | 'launch' | 'trust';

export interface HeroSectionData {
  badge?: string;
  title: string;
  subtitle?: string;
  primaryCtaText?: string;
  primaryCtaLink?: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  socialProofText?: string;
  businessIntent?: HeroBusinessIntent;
}

export interface HeroSectionViewProps {
  data: HeroSectionData;
  lang?: 'he' | 'en' | 'ar';
  onAction?: (actionKey: string, payload?: any) => void;
  onOpenEditor?: () => void;
  isOwner?: boolean;
  className?: string;
}

export interface HeroSectionEditorProps {
  isOpen: boolean;
  onClose: () => void;
  data: HeroSectionData;
  onChange: (newData: HeroSectionData) => void;
  onSave?: (data: HeroSectionData) => Promise<void> | void;
}
