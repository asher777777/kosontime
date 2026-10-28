import React from 'react';
import { Edit3, Settings, Sparkles, Save, Check, RefreshCw, BarChart2 } from 'lucide-react';

export interface KosunUniversalDockProps {
  mode?: 'front' | 'backoffice';
  isGlobalFallback?: boolean;
  isEditing?: boolean;
  onToggleEditMode?: () => void;
  isSaving?: boolean;
  onOpenSettings?: () => void;
  onOpenSeoSettings?: () => void;
  onSyncBrandDna?: () => void;
  tenantId?: string;
  className?: string;
  isAuthorized?: boolean;
}

export const KosunUniversalDock: React.FC<KosunUniversalDockProps> = ({
  mode = 'front',
  isGlobalFallback = false,
  isEditing = false,
  onToggleEditMode,
  isSaving = false,
  onOpenSettings,
  onOpenSeoSettings,
  onSyncBrandDna,
  className = '',
}) => {
  return (
    <div
      className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-3 py-2 rounded-2xl bg-black/85 backdrop-blur-xl border border-white/15 shadow-2xl text-white ${className}`}
      dir="rtl"
    >
      {onToggleEditMode && (
        <button
          type="button"
          onClick={onToggleEditMode}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            isEditing
              ? 'bg-amber-500 text-black shadow-md'
              : 'bg-white/10 hover:bg-white/20 text-slate-200'
          }`}
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>{isEditing ? 'סיום עריכה' : 'מצב עריכה'}</span>
        </button>
      )}

      {onOpenSeoSettings && (
        <button
          type="button"
          onClick={onOpenSeoSettings}
          title="הגדרות SEO"
          className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 transition-all cursor-pointer"
        >
          <BarChart2 className="w-4 h-4" />
        </button>
      )}

      {onSyncBrandDna && (
        <button
          type="button"
          onClick={onSyncBrandDna}
          title="סנכרון שפת מותג DNA"
          className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-indigo-400 transition-all cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      )}

      {onOpenSettings && (
        <button
          type="button"
          onClick={onOpenSettings}
          title="הגדרות עמוד"
          className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 transition-all cursor-pointer"
        >
          <Settings className="w-4 h-4" />
        </button>
      )}

      {isSaving && (
        <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 px-1">
          <Save className="w-3 h-3 animate-pulse" /> שומר...
        </span>
      )}
    </div>
  );
};

export default KosunUniversalDock;
