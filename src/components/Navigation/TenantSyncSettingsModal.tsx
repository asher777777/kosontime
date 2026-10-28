import React from 'react';
import { SystemSettingsModal } from '../../workbench/components/SystemSettingsModal';

export interface TenantSyncSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenantId?: string;
  onSyncComplete?: () => void;
}

export const TenantSyncSettingsModal: React.FC<TenantSyncSettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  return <SystemSettingsModal isOpen={isOpen} onClose={onClose} />;
};

export default TenantSyncSettingsModal;
