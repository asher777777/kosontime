/**
 * KOSUN26 Modules Hub (שער המודלים והרכיבים העצמאיים הקיימים)
 * מייצא את שבעת המודלים שהועברו למערכת.
 */

// 1. Module Namespaces
export * as KosAiModule from './KosAi';
export * as KosBrandingModule from './KosBranding';
export * as KosCloudStoreModule from './KosCloudStore';
export * as KosCrmModule from './KosCrm';
export * as KosFormsModule from './KosForms';
export * as KosPayModule from './KosPay';
export * as KosWebAiModule from './KosWebAi';

// 2. KosAi
export {
  useKosai,
  KosaiProvider,
  KosaiChatDrawer,
  KosaiSettingsBackoffice,
  FloatingKosaiButton,
} from './KosAi';

// 3. KosBranding
export {
  BrandDnaHubStandaloneView,
  BrandDnaContent,
  BrandDnaProvider,
  useBrandDna,
  BrandDnaRoutes,
  AiStepWizardView,
} from './KosBranding';

// 4. KosCloudStore
export {
  KosCloudStoreStandaloneView,
  MediaPickerModal,
  MediaGalleryGrid,
  LuxuryIconsGallery,
  useMediaGallery,
  MediaGalleryProvider,
} from './KosCloudStore';

// 5. KosCrm
export {
  CrmAnalyticsMainView,
  useCrmAnalytics,
  CrmAnalyticsProvider,
  KosCrmDynamicGroupsPage,
  Contact360Modal,
} from './KosCrm';

// 6. KosForms
export {
  SmartFormRunner,
  FormBuilderStudio,
  SmartFormProvider,
  useSmartForm,
  StepRenderer,
} from './KosForms';

// 7. KosPay
export {
  KesherPaymentsStandaloneView,
  KesherPaymentsMainView,
  KesherPaymentsProvider,
  useKesherPaymentsContext,
} from './KosPay';

// 8. KosWebAi
export {
  PageBuilderRenderer,
  KosWebAiFrontDock,
  PublicPageView,
  kosWebFunctions,
} from './KosWebAi';
