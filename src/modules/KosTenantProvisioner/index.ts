import { registerCapabilityUI } from '../../core/bridge/CapabilitySlot';
import { TenantAdminLoginView } from './views/TenantAdminLoginView';
import { TenantSubdomainView } from './views/TenantSubdomainView';

registerCapabilityUI('tenant-admin-login', TenantAdminLoginView);
registerCapabilityUI('tenant-subdomain-view', TenantSubdomainView);

export * from './services/tenantAuthService';
