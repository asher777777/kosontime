/**
 * KosTube Module - KOSUN26 11-Layer Anatomy Architecture
 * YouTube Channel Connection & AI-Powered SEO Pages Generator
 */

import { registerCapabilityUI } from '../../core/bridge/CapabilitySlot';
import { StandaloneView } from './StandaloneView';

registerCapabilityUI('kostube-view', StandaloneView);

export * from './types';
export * from './config';
export * from './context';
export * from './hooks';
export * from './services';
export * from './api';
export * from './routes';
export * from './components';

export * from './StandaloneView';
