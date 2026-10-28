import React from 'react';
import { HelpCircle } from 'lucide-react';

export interface SmartTooltipProps {
  text: string;
  children?: React.ReactNode;
}

export const SmartTooltip: React.FC<SmartTooltipProps> = ({ text, children }) => {
  return (
    <span className="relative inline-flex items-center group cursor-help ml-1">
      {children || <HelpCircle className="w-3.5 h-3.5 text-slate-400 hover:text-indigo-400 transition-colors" />}
      <span className="absolute bottom-full mb-1.5 hidden group-hover:block z-50 px-2.5 py-1 text-[11px] font-medium text-white bg-slate-900 border border-slate-700 rounded-lg shadow-xl whitespace-normal max-w-xs text-right leading-relaxed" dir="rtl">
        {text}
      </span>
    </span>
  );
};

export default SmartTooltip;
