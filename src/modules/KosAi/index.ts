import { registerCapabilityUI } from '../../core/bridge/CapabilitySlot';
import { KosaiChatDrawer } from './components/KosaiChatDrawer';
import { KosaiSettingsBackoffice } from './components/KosaiSettingsBackoffice';
import { FloatingKosaiButton } from './components/FloatingKosaiButton';

registerCapabilityUI('kosai-chat', KosaiChatDrawer);
registerCapabilityUI('kosai-drawer', KosaiChatDrawer);
registerCapabilityUI('kosai-settings', KosaiSettingsBackoffice);
registerCapabilityUI('kosai-button', FloatingKosaiButton);

export * from './types';
export * from './config';
export * from './context/KosaiContext';
export * from './components/KosaiChatDrawer';
export * from './components/KosaiSettingsBackoffice';
export * from './components/FloatingKosaiButton';
export * from './services/kosaiImageAgentService';
export * from './modelsAiService';
export * from './StandaloneView';
