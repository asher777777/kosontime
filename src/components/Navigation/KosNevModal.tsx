import React from 'react';
import { NavLink } from 'react-router-dom';
import { X, Sparkles, Layers } from 'lucide-react';
import { REGISTERED_MODULES } from '../../workbench/moduleRegistry';

export interface KosNevModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeModuleId?: string;
}

export const KosNevModal: React.FC<KosNevModalProps> = ({
  isOpen,
  onClose,
  activeModuleId,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      dir="rtl"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-slate-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col p-6 text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">תפריט מודולים</h3>
              <p className="text-xs text-slate-400">מעבר מהיר בין עולמות המערכת</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto">
          {REGISTERED_MODULES.slice(0, 12).map((m) => (
            <NavLink
              key={m.id}
              to={m.route}
              onClick={onClose}
              className={`p-3.5 rounded-2xl border transition-all text-right flex flex-col gap-1 ${
                activeModuleId?.toLowerCase() === m.id.toLowerCase()
                  ? 'bg-indigo-600/20 border-indigo-500/50 text-white'
                  : 'bg-white/5 border-white/5 hover:border-white/20 text-slate-300 hover:text-white'
              }`}
            >
              <span className="text-xs font-bold text-indigo-400">{m.name}</span>
              <span className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{m.description}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
};

export default KosNevModal;
