import React from 'react';
import { KosActionPortalView } from './KosActionPortalView';
import { useActionPortalFirestore, ActionPortalFieldMapping } from './useActionPortalFirestore';
import { ActionPortalStyleOverrides } from './types';
import * as Icons from 'lucide-react';

export interface KosActionPortalAdapterProps {
  collectionPath: string;
  fieldMapping?: ActionPortalFieldMapping;
  whereCondition?: { field: string; operator: any; value: any };
  title?: string;
  subtitle?: string;
  logoUrl?: string;
  agentAvatarUrl?: string;
  styleOverrides?: ActionPortalStyleOverrides;
  onAction?: (actionType: string, payload: any) => void;
  onVoiceInputSubmit?: (query: string) => void;
}

/**
 * מתאם חיבור לקולקציית Firestore (Firestore Adapter)
 * מושך מסמכים ב-Realtime ומלביש אותם ישירות על ה-View המבודד!
 */
export const KosActionPortalAdapter: React.FC<KosActionPortalAdapterProps> = ({
  collectionPath,
  fieldMapping,
  whereCondition,
  title = 'אלו הם המוצרים שלנו',
  subtitle,
  logoUrl,
  agentAvatarUrl,
  styleOverrides,
  onAction,
  onVoiceInputSubmit
}) => {
  const { items, isLoading, error } = useActionPortalFirestore({
    collectionPath,
    fieldMapping,
    whereCondition,
    autoIndexNumbers: true
  });

  if (isLoading) {
    return (
      <div dir="rtl" className="min-h-[500px] flex flex-col items-center justify-center p-8 text-center bg-slate-900/40 rounded-3xl backdrop-blur-md">
        <Icons.Loader2 size={36} className="text-sky-400 animate-spin mb-3" />
        <span className="text-sm text-sky-200 font-bold">טוען פריטים מקולקציית {collectionPath}...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div dir="rtl" className="p-6 bg-rose-950/40 border border-rose-500/30 rounded-3xl text-rose-300 text-center text-sm">
        <Icons.AlertCircle size={28} className="mx-auto mb-2 text-rose-400" />
        שגיאה במשיכת נתונים מ-Firestore: {error}
      </div>
    );
  }

  return (
    <KosActionPortalView
      data={{
        title,
        subtitle,
        logoUrl,
        agentAvatarUrl,
        items
      }}
      styleOverrides={styleOverrides}
      onAction={onAction}
      onVoiceInputSubmit={onVoiceInputSubmit}
    />
  );
};
