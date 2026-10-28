import React from 'react';
import { PageBuilderConfig } from '../modules/KosWebAi/types/pageBuilder.types';
import { PageBuilderRenderer } from '../modules/KosWebAi/PageBuilderRenderer';

export interface RootPublicHomePageViewProps {
  pageConfig?: PageBuilderConfig;
  onEnterDevWorkbench?: () => void;
}

export const RootPublicHomePageView: React.FC<RootPublicHomePageViewProps> = ({
  pageConfig,
  onEnterDevWorkbench,
}) => {
  return (
    <div className="relative min-h-screen bg-slate-950 text-white" dir="rtl">
      {pageConfig && <PageBuilderRenderer pageConfig={pageConfig} isEditing={false} />}
      {onEnterDevWorkbench && (
        <button
          type="button"
          onClick={onEnterDevWorkbench}
          className="fixed bottom-4 left-4 z-50 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-slate-300 hover:text-white text-[11px] backdrop-blur-md shadow-lg transition-all cursor-pointer"
        >
          ⚙ סדנת מודלים
        </button>
      )}
    </div>
  );
};

export default RootPublicHomePageView;
