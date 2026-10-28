import React from 'react';
import { User } from 'lucide-react';
export * from './AuthModal';

export const UserMenuButton: React.FC<{ onOpenAuth?: () => void }> = ({ onOpenAuth }) => {
  return (
    <button
      type="button"
      onClick={onOpenAuth}
      className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all cursor-pointer"
    >
      <User className="w-4 h-4" />
    </button>
  );
};
