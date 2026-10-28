import { registerCapabilityUI } from '../../core/bridge/CapabilitySlot';
import { StandaloneView } from './StandaloneView';
import { CampaignStudioModal } from './components/CampaignStudioModal';

registerCapabilityUI('flow-player', StandaloneView);
registerCapabilityUI('living-page-player', StandaloneView);
registerCapabilityUI('flow-player-studio', CampaignStudioModal);

export * from './types';
export * from './config';
export * from './context/ModuleContext';
export * from './context/PlayerMachineContext';
export * from './services/firestoreService';
export * from './api/functionsApi';
export * from './api/geminiApi';
export * from './prompts';
export * from './components/PlayerContainer';
export * from './components/VideoLayer';
export * from './components/UiOverlayManager';
export * from './components/VoiceRecorderInteraction';
export * from './components/TelemetryDebugger';
export * from './components/CampaignStudioModal';
export * from './routes/ModuleRoutes';
export * from './StandaloneView';
