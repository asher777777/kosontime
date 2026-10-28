import React from 'react';
import { NavLink } from 'react-router-dom';
import { Settings, Sparkles, Layers, Home, Globe } from 'lucide-react';

export interface FloatingSystemDockProps {
  isSubdomain?: boolean;
  activeModules?: string[];
  onOpenSettings?: () => void;
  className?: string;
}

export const CashwanDynamicMenu: React.FC<any> = () => null;

export const FloatingSystemDock: React.FC<FloatingSystemDockProps> = ({
  isSubdomain,
  activeModules = [],
  onOpenSettings,
  className = '',
}) => {
  return (
    <nav
      className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-900/90 dark:bg-black/90 backdrop-blur-xl border border-white/10 shadow-2xl text-slate-300 ${className}`}
      dir="rtl"
    >
      <NavLink
        to="/"
        className={({ isActive }) =>
          `flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            isActive ? 'bg-indigo-600 text-white shadow-sm' : 'hover:bg-white/10 text-slate-300'
          }`
        }
      >
        <Home className="w-3.5 h-3.5" />
        <span>ראשי</span>
      </NavLink>

      {activeModules.slice(0, 5).map((modId) => (
        <NavLink
          key={modId}
          to={`/${modId.toLowerCase()}`}
          className={({ isActive }) =>
            `flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              isActive ? 'bg-indigo-600 text-white shadow-sm' : 'hover:bg-white/10 text-slate-300'
            }`
          }
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="capitalize">{modId}</span>
        </NavLink>
      ))}

      {onOpenSettings && (
        <button
          type="button"
          onClick={onOpenSettings}
          title="הגדרות"
          className="p-1.5 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition-all cursor-pointer"
        >
          <Settings className="w-4 h-4" />
        </button>
      )}
    </nav>
  );
};

export default FloatingSystemDock;
