import { registerCapabilityUI } from '../../core/bridge/CapabilitySlot';
import { StandaloneView } from './StandaloneView';

registerCapabilityUI('tiktok-studio', StandaloneView);
registerCapabilityUI('tiktok-view', StandaloneView);

/**
 * KosTikTok Module - KOSUN26 11-Layer Anatomy Architecture
 * TikTok API Integration: Profile, Content Publishing, Instant Form Leads & Events API
 */

export * from './types';
export * from './config';
export * from './context';
export * from './hooks';
export * from './services';
export * from './api';
export * from './routes';
export * from './components';

export * from './StandaloneView';
