/**
 * GoogleAnalyticsConsoleHub
 * Adapter delegating to the unified KoSeoPowerEngin module via CapabilitySlot.
 * Zero cross-module direct imports (KOSUN26 Isolation Rule).
 */

import React from 'react';
import { CapabilitySlot } from '../../../core/bridge/CapabilitySlot';

export interface GoogleAnalyticsConsoleHubProps {
  onBackToPages?: () => void;
}

export const GoogleAnalyticsConsoleHub: React.FC<GoogleAnalyticsConsoleHubProps> = ({
  onBackToPages,
}) => {
  return (
    <CapabilitySlot
      name="google-analytics-console"
      props={{ onBackToPages }}
      fallback={
        <div className="p-8 text-center text-slate-400" dir="rtl">
          פאנל SEO ואנליטיקה ייטען כאשר מודול KoSeoPowerEngin זמין
        </div>
      }
    />
  );
};

export default GoogleAnalyticsConsoleHub;
