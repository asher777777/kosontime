import { registerCapabilityUI } from '../../core/bridge/CapabilitySlot';
import { PageBuilderStandaloneView } from './PageBuilderStandaloneView';
import { PublicPageView } from './components/PublicPageView';

registerCapabilityUI('page-builder', PageBuilderStandaloneView);
registerCapabilityUI('koswebai-builder', PageBuilderStandaloneView);
registerCapabilityUI('public-page-renderer', PublicPageView);

/**
 * KOSWEBAI Component Exports
 * מייצא את פונקציות העמוד, המנוע הביצועי ורכיבי התצוגה המרכזיים
 */

export * from './koswebFunctions';
export * from './types/pageBuilder.types';
export * from './components/PublicPageView';
export * from './PageBuilderRenderer';
export * from './components/KosWebAiFrontDock';
export * from './StandaloneView';
export * from './services/pageBuilderFirestore';
export * from './services/brandSectionHydrator';
export * from './registry/sectionRegistry';
