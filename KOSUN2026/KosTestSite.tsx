import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import { KosCognitivePortal } from './components/action-portal/cognitive-portal/KosCognitivePortal';

interface KosTestSiteProps {
  onBackToApp?: () => void;
}

/**
 * 👑 KOSTEST - סביבת קושאן הטהורה והנקייה (Production-Grade KOSUN 2026)
 * ללא בוררי טסטים, ללא רקעים חיצוניים מיותרים, 100% נאמן לשלד 9:16 הטהור של KOSUN
 */
export const KosTestSite: React.FC<KosTestSiteProps> = ({ onBackToApp }) => {
  return (
    <div 
      className="min-h-screen w-full flex flex-col items-center justify-center bg-black text-white font-sans selection:bg-cyan-500/30 selection:text-cyan-200 relative overflow-hidden"
      dir="rtl"
    >
      {/* 🌌 הילת ניאון עמוקה של קושאן */}
      <div 
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full blur-[140px] pointer-events-none opacity-20 -z-10 bg-cyan-500"
      />
      <div 
        className="fixed bottom-0 right-10 w-[450px] h-[250px] rounded-full blur-[150px] pointer-events-none opacity-15 -z-10 bg-blue-600"
      />

      {/* 📱 שלד 9:16 מושלם של קושאן ללא עזרי בדיקה */}
      <div className="w-full max-w-[430px] h-[92vh] max-h-[880px] my-auto flex flex-col relative">
        {/* כפתור גישה מהירה לקולקציית KOSWEBAI בנתיב /KOSWEB */}
        <button
          onClick={() => { window.location.href = '/KOSWEB'; }}
          className="absolute -top-10 left-0 z-30 px-3 py-1 rounded-full bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 text-[11px] font-bold shadow-lg flex items-center gap-1.5 transition-all cursor-pointer backdrop-blur-md active:scale-95"
          title="פתיחת קולקציית KOSWEBAI (שידור מצב אורח ומצב משתמש)"
        >
          <Icons.Sparkles size={12} className="text-cyan-400" />
          <span>KOSWEB • שידור מצבים</span>
        </button>

        {/* כפתור גישה ישירה למעבדת מיתוג וארכיטיפים (Theme Lab) */}
        <button
          onClick={() => { window.location.href = '/themelab'; }}
          className="absolute -top-10 right-0 z-30 px-3 py-1 rounded-full bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold shadow-lg flex items-center gap-1.5 transition-all cursor-pointer backdrop-blur-md active:scale-95"
          title="מעבדת מיתוג וארכיטיפים 2026 (Theme Lab)"
        >
          <Icons.Palette size={12} className="text-emerald-400" />
          <span>Theme Lab • מעבדת מיתוג</span>
        </button>

        <KosCognitivePortal 
          tenantId="kosun" 
          targetProject="comona" 
          defaultAudience="guest" 
        />
      </div>

    </div>
  );
};
