/**
 * Global Core Gateway (שער הליבה המרכזי של KOSUN26)
 * מספק חוזים משותפים, מעברי תקשורת, שקעי יכולת, ניהול טננטים וחיבורי בינה.
 */

// Contracts (חוזים וממשקים)
export * from './contracts';

// Brand DNA Core (שירות וחוזה מיתוג מרכזי)
export * from './brand';

// Bridge & Capabilities (מעבר יכולות ו-Slots)
export * from './bridge/CapabilitySlot';
export * from './bridge/HostCapabilitiesContext';
export * from './bridge/EventBus';

// AI Infrastructure (תשתיות בינה וטוקנים)
export * from './ai';

// Connection & Credentials (הקשר מערכתי ומפתחות)
export * from './connection';

// Tenant Management (ניהול סאב-דומיינים וטננטים)
export * from './tenant';

// Layout & UI (רכיבי מעטפת וממשק)
export * from './layout/KosunShell';
export * from './ui/BrandIconPicker';
export * from './ui/KosunInputWithVoice';
export * from './ui/KosunStepWizard';

// SEO & Head Injector
export * from './seo/seoInjector';

// Media Utilities (סניטציה וניהול מדיה מרכזי)
export * from './media';
